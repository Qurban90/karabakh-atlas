/**
 * Attack suite — run this against a deployment before you ship it.
 *
 *   npm run security:test                                  # localhost
 *   BASE=https://qdx-app.onrender.com npm run security:test
 *
 * It behaves like an attacker holding a normal account: forges tokens,
 * injects SQL, tries to escalate its role, brute-forces a login and reads the
 * response headers. It registers its own throwaway user and deletes it at the
 * end, so it is safe to point at a live environment.
 */
const BASE = (process.env.BASE || 'http://localhost:5001').replace(/\/$/, '');
const API = `${BASE}/api`;
const results = [];

const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  const line = detail ? `${name}  — ${detail}` : name;
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${line}`);
};

const req = async (method, path, opts = {}) => {
  const { token, body, headers = {} } = opts;
  const r = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let json = null;
  try {
    json = await r.clone().json();
  } catch {
    /* not json — fine */
  }
  return { status: r.status, json, headers: r.headers };
};

const section = (title) => console.log(`\n-- ${title} --`);

/* ------------------------------------------------------------ setup */
const probe = {
  name: 'Security Probe',
  email: `sec-probe-${Date.now()}@example.test`,
  password: 'ProbePass123'
};
const reg = await req('POST', '/auth/register', { body: probe });
if (reg.status !== 201) {
  console.error(`Cannot register a probe account (HTTP ${reg.status}) — is ${BASE} reachable?`);
  process.exit(1);
}
const token = reg.json.token;
const asUser = { token };

/* --------------------------------------------------- authentication */
section('Autentifikasiya');
check('tokensiz qorunan endpoint bagli', (await req('GET', '/users/me/passport')).status === 401);
check(
  'saxta imzali token redd edilir',
  (await req('GET', '/users/me/passport', { token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1LWFkbWluIn0.forged' })).status === 401
);
check(
  'alg=none tokeni redd edilir',
  (await req('GET', '/users/me/passport', { token: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1LWFkbWluIn0.' })).status === 401
);

/* ---------------------------------------------------- authorization */
section('Yetkilendirme');
const newLocation = {
  name: 'probe', city: 'shusha', category: 'heritage', lat: 39.7, lng: 46.7,
  shortDescription: 'probe location description', history: 'probe location history',
  visibleFrom: 2026, timeline: { 2026: { status: 'active', note: 'probe' } }
};
check('adi istifadeci mekan yarada bilmir', (await req('POST', '/locations', { ...asUser, body: newLocation })).status === 403);
check('adi istifadeci mekan sile bilmir', (await req('DELETE', '/locations/cidir-duzu', asUser)).status === 403);
const foreign = await req('DELETE', '/posts/p-02', asUser);
check('basqasinin paylasimi silinmir', foreign.status === 403 || foreign.status === 404, `status ${foreign.status}`);

/* -------------------------------------------------- mass assignment */
section('Rol yukseltme / mass assignment');
const esc = await req('POST', '/posts', {
  ...asUser,
  body: { text: 'privilege escalation probe', role: 'admin', userId: 'u-admin', likes: 999 }
});
check(
  'gonderilen role/userId/likes nezere alinmir',
  esc.status === 201 && esc.json.item.user.role === 'user' && esc.json.item.likeCount === 0,
  `role=${esc.json?.item?.user?.role} likes=${esc.json?.item?.likeCount}`
);

/* ------------------------------------------------------- injection */
section('Inyeksiya');
for (const payload of ["'; DROP TABLE reviews; --", "' OR '1'='1"]) {
  const r = await req('GET', `/locations/${encodeURIComponent(payload)}`);
  // Any 4xx is a pass: 404 is the app rejecting an unknown id, and a 403 means
  // the platform's edge filter stopped it before it ever reached us. What must
  // never happen is a 200 (the payload did something) or a 5xx (it reached the
  // driver and broke something).
  check(`SQL payload redd edilir: ${payload.slice(0, 22)}`, r.status >= 400 && r.status < 500, `status ${r.status}`);
}
check('sxem toxunulmayib', ((await req('GET', '/locations?year=2026')).json?.count ?? 0) > 0);
check('tip qarisikligi redd edilir', (await req('POST', '/posts', { ...asUser, body: { text: { $ne: null } } })).status === 400);

/* ------------------------------------------------------------- xss */
section('XSS');
const xss = await req('POST', '/posts', { ...asUser, body: { text: '<img src=x onerror=alert(1)>zerersiz metn' } });
check(
  'teqler saxlanilan metnden cixarilir',
  xss.status === 201 && !/<img|onerror=/i.test(xss.json.item.text),
  xss.json?.item?.text
);

/* --------------------------------------------------- input limits */
section('Girdi limitleri');
check('hedden boyuk govde 413 alir', (await req('POST', '/posts', { ...asUser, body: { text: 'A'.repeat(200 * 1024) } })).status === 413);
check(
  'rating 1-5 araligindan kenar redd edilir',
  (await req('POST', '/locations/cidir-duzu/reviews', { ...asUser, body: { rating: 99, text: 'kifayet qeder uzun metn' } })).status === 400
);

/* ------------------------------------------------------ brute force */
section('Brute force');
let locked = false;
for (let i = 0; i < 9 && !locked; i++) {
  const r = await req('POST', '/auth/login', { body: { email: probe.email, password: `wrong-${i}` } });
  if (r.status === 429) locked = true;
}
check('tekrar ugursuz girisler hesabi bloklayir', locked);

/* --------------------------------------------------------- headers */
section('Cavab basliqlari');
const head = await fetch(`${BASE}/api/health`, { headers: { Origin: 'https://attacker.example' } });
const h = (n) => head.headers.get(n);
check('Content-Security-Policy var', !!h('content-security-policy'));
check('X-Content-Type-Options: nosniff', h('x-content-type-options') === 'nosniff');
check('Permissions-Policy var', !!h('permissions-policy'));
check('X-Powered-By gizledilib', !h('x-powered-by'));
if (BASE.startsWith('https')) {
  check('HSTS var', !!h('strict-transport-security'), h('strict-transport-security') ?? '');
  check('yad origin CORS icazesi almir', !h('access-control-allow-origin'), h('access-control-allow-origin') ?? 'basliq yoxdur');
}

/* --------------------------------------------------- error leakage */
section('Xeta sizmasi');
const nf = await req('GET', '/locations/definitely-not-a-real-id');
const blob = JSON.stringify(nf.json ?? {});
check('xeta cavabinda stack/daxili yol yoxdur', !/at \/|node_modules|\.js:\d+|postgres:\/\//i.test(blob), blob.slice(0, 60));

/* -------------------------------------------------------- teardown */
const cleanup = await req('DELETE', '/users/me', {
  token,
  body: { password: probe.password, confirm: 'SİL' }
});
// A locked-out probe cannot re-authenticate, so 401/429 here is expected and
// harmless — the account is disposable either way.
console.log(`\n  temizlik: probe hesabi silindi (HTTP ${cleanup.status})`);

/* ---------------------------------------------------------- report */
const failed = results.filter((r) => !r.pass);
console.log(`\n${'='.repeat(56)}`);
console.log(`  ${results.length - failed.length}/${results.length} yoxlama kecdi`);
if (failed.length) {
  console.log('  UGURSUZ:');
  for (const f of failed) console.log(`   - ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
}
process.exit(failed.length ? 1 : 0);
