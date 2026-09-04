# 🌸 Qarabağ Dirçəliş Xəritəsi — Karabakh Revival Map

Interactive mobile platform tracking the post-2023 restoration of **Şuşa** and **Xankəndi**:
heritage sites, infrastructure, green energy and community life across **2023 → 2026**.

Mobile-first, installable PWA (React + Vite + TypeScript + Leaflet) backed by a
REST API (Node.js + Express) with JWT auth, RBAC, Swagger docs, rate limiting,
**Postgres persistence** and seeded demo data. **All content in Azerbaijani;
seed figures are demo data** inspired by the public "Böyük Qayıdış" narrative.

**🌐 Live:** https://qdx-app.onrender.com — demo accounts below, opens straight
to the map.

---

## ✨ Feature map

| Feature | Where | Notes |
| --- | --- | --- |
| 🗺 Interactive map (custom pins, clustering) | Map tab | Leaflet + hand-rolled grid clustering, category-coloured pins with live status dots |
| 🕰 Time-Travel slider 2023–2026 | Map tab (bottom card) | Markers appear/change status per year; ▶ auto-plays the years |
| 🔍 Filters & search | Map tab | City chips, 6 category chips, debounced free-text search |
| 📷 Real photographs | everywhere | 20 openly-licensed photos (Wikimedia Commons — CC BY / CC BY-SA / CC0, many from the Azerbaijani presidential press service), each shown with its author and licence. See **PHOTO-CREDITS.md** |
| 🏛 "Dirçəliş qabağı və sonrası" | Location page hero | Real before/after photo pairs where both exist (Natəvan's house, Üzeyir Hacıbəyli museum, Şuşa realnı məktəbi); otherwise the photo alone, or generative SVG scenes where no photo exists |
| 🎧 Səsli bələdçi (audio guide) | Location page | Simulated WebAudio stream + karaoke transcript, per-location scripts |
| ⭐ Reviews & 5-star ratings | Location page | Zod validation, distribution bars, owner/moderator delete |
| 📰 Social feed | Lent tab | Posts with location tags, optimistic likes, comment threads, pagination |
| 📊 Dirçəliş İndeksi dashboard | İndeks tab | Roads km, green MW, monuments, returnees — animated counters + SVG charts synced to the year slider |
| 🛂 Qarabağ Pasportu | Pasport tab | GPS (≤5 km validated) & manual check-ins, % progress ring |
| 🏅 Gamification badges | Pasport tab | 7 badges (Şuşa Tədqiqatçısı, Mədəniyyət Qoruyucusu, …) computed server-side with progress |
| 📴 Offline mode | automatic + Pasport tab | Installable PWA: service worker caches the app shell; GET responses also cache to localStorage and replay when the API is unreachable |
| 🔐 RBAC | everywhere | guest → read-only · user → reviews/posts/check-ins · admin/moderator → moderation + location CRUD |
| 🗄 Postgres persistence | server | Real durability — survives restarts/redeploys; auto-migrates + seeds on boot; falls back to a JSON file if no database is configured |
| 📚 Swagger / OpenAPI | `/api/docs` | Interactive, with JWT authorize button |

## ⚡ One-click demo (Windows)

- **`start-db.cmd`** — starts the local dev Postgres cluster (port 5433, first
  run initializes it). Optional: skip it and the API runs fine on the JSON
  fallback, just without cross-restart persistence.
- **`start-demo.cmd`** — starts the API on port 5001, which also serves the
  built app (single process), and opens http://localhost:5001.
- **`share-live-link.cmd`** — opens a free Cloudflare quick tunnel and prints a
  public `https://….trycloudflare.com` URL you can share with mentors/jury.
  No account needed; the link lives while the window stays open.

## 🚀 Quickstart (dev)

Requires **Node.js ≥ 18.17** (this workspace includes a portable Node under
`../.tools/node-v22.23.2-win-x64` — add it to `PATH` if Node isn't installed)
and, for full persistence, **PostgreSQL 17** (`winget install PostgreSQL.PostgreSQL.17`).

```bash
# 1) install
npm --prefix server install
npm --prefix mobile install

# 2) local Postgres (optional — skip for the JSON fallback)
start-db.cmd

# 3) run API (terminal 1) → http://localhost:5001
npm --prefix server run dev

# 4) run app (terminal 2) → http://localhost:5173  (proxies /api → :5001)
npm --prefix mobile run dev
```

Open **http://localhost:5173** (best in a mobile viewport / device toolbar) and
**http://localhost:5001/api/docs** for the API playground. `GET /api/health`
reports which backend is active: `{"db":"postgres"}` or `{"db":"json"}`.

### Demo accounts

| Role | E-mail | Password |
| --- | --- | --- |
| User | `aysel@demo.az` | `Demo123!` |
| User | `tural@demo.az` · `nigar@demo.az` · `resad@demo.az` | `Demo123!` |
| Admin | `admin@qdx.az` | set by you — see below |
| Moderator | `leyla@demo.az` | set by you — see below |

Staff accounts can delete anyone's content, so **they have no password in this
repo at all** — a committed one would be a public backdoor. Set them in the
environment:

```bash
ADMIN_PASSWORD=…      # admin@qdx.az
MODERATOR_PASSWORD=…  # leyla@demo.az
```

With no env var set, the server generates a random password at seed time and
prints it once to its log (look for `one-off password for admin@qdx.az`) — so
staff access always requires either the environment or the server log, in
every environment including local development. The login screen offers a
one-tap shortcut for the regular demo user only.

## 📱 Android APK

`releases/QDX-Qarabag-Dircelis-Xeritesi-1.0.0.apk` — signed, installable
(Android 5.0+, ~1 MB). Built with **Bubblewrap** as a Trusted Web Activity:
the app is a native shell around the live PWA, so it stays in sync with the
deployment automatically — no rebuild needed when the site updates.

Install by copying it to a phone and opening it (allow "install from unknown
sources" once). Because `.well-known/assetlinks.json` is served with the
signing key's fingerprint, Android verifies the link and runs it fullscreen,
without a browser address bar.

Rebuilding (needs JDK 17 + Android SDK):

```bash
bubblewrap update && bubblewrap build   # from store/twa-manifest.json
```

The signing key lives outside this repo. **Keep it** — Play Store updates must
be signed with the same key, and `assetlinks.json` is tied to its fingerprint.

## 📷 Photographs

Real photos live in `mobile/public/photos/` and their metadata — author,
licence, source page — in `server/src/data/photos.data.js`, served to the
client on every location payload. **PHOTO-CREDITS.md** lists all of them.

Two rules when adding one, both enforced by the data file's shape:

1. **Attribution is mandatory.** CC BY / CC BY-SA require it, so the UI paints
   a credit line on every photo; an entry without `author`/`license`/`source`
   is a licence violation waiting to happen.
2. **Never a stand-in.** A photo must actually depict that location. Where no
   genuine open-licensed photo exists (currently the Yaşıl Enerji Qovşağı) the
   app falls back to its generated illustration — honest about being a drawing,
   which a photo of somewhere else would not be. Where a photo is *related* but
   not exact, `caption` states what it really shows and the UI displays it.

## ✅ Verification

```bash
npm --prefix server run check      # syntax-checks every server file
npm --prefix mobile run typecheck  # strict TypeScript, no emit
npm --prefix mobile run build      # tsc + vite production bundle
npm --prefix mobile audit          # 0 vulnerabilities
```

### Security suite

`npm --prefix server run security:test` attacks a running deployment the way
an attacker with an ordinary account would: forged and `alg=none` tokens, role
escalation through extra JSON fields, SQL injection, type confusion, stored
XSS, oversized bodies, brute force, response headers and error leakage. It
registers its own throwaway account and deletes it afterwards, so it is safe
to point at production:

```bash
BASE=https://qdx-app.onrender.com npm --prefix server run security:test
```

22/22 pass against the live deployment.

### Backups

```bash
npm --prefix server run backup          # backups/qdx-<timestamp>.json.gz
npm --prefix server run restore <file> --yes
VERIFY_DATABASE_URL=postgres://…/scratch npm --prefix server run backup:verify
```

`backup:verify` restores into a throwaway database and compares row counts —
a backup nobody has restored is an assumption, not a backup. The pair has been
exercised for real: backed up, every table truncated, restored, all rows back.
`.github/workflows/backup.yml` keeps a daily `pg_dump` off-box as a private
artifact (set the `DATABASE_URL` repository secret to enable it).

### Least-privilege database role

`server/db/roles.sql` splits the roles: `qdx_migrate` owns the schema,
`qdx_app` may only read and write rows. Applied to a real cluster, the app
works normally as `qdx_app` while `DROP TABLE`, `CREATE TABLE` and
`ALTER TABLE` are all refused.

## 🐳 Production (Docker)

```bash
docker compose up --build
# app → http://localhost:8080  (nginx, gzip, SPA fallback, /api proxy)
# api → http://localhost:5001/api  (docs at /api/docs)
```

Three services: **db** (Postgres 17, named volume `qdx-pgdata`), **server**
(API, auto-migrates + seeds against `db` on boot), **mobile** (nginx serving
the built app, proxying `/api` to `server`). `JWT_SECRET=your-secret docker
compose up --build` to set a real secret.

### Cloud (Render blueprint) — currently live at qdx-app.onrender.com

`render.yaml` provisions **one web service** (`qdx-app` — the API also serves
`mobile/dist`, so there's nothing else to deploy) plus a **free managed
Postgres** (`qdx-db`), wired together via `DATABASE_URL`. Connect the repo on
render.com → New → Blueprint and it deploys both.

Two gotchas already hit and fixed in this repo, worth knowing if you fork it:
- Render injects the service's `NODE_ENV=production` into the *build* step
  too, which makes plain `npm install` silently skip devDependencies (vite,
  TypeScript types) and break the build. Fixed via `mobile/.npmrc`
  (`include=dev`) — robust regardless of what build command ends up cached.
- Blueprints don't retro-apply `render.yaml` edits to an already-created
  service. If `qdx-app` predates the `databases:` block, add the Postgres
  instance once by hand (New → PostgreSQL, Free) and put its **Internal
  Database URL** on `qdx-app` as `DATABASE_URL`.

## 🏗 Architecture

```
qarabag-dircelis-xeritesi/
├── server/                       # REST API — Node 22, Express, ESM
│   ├── src/
│   │   ├── config.js             # env loader (.env.development / .env.production)
│   │   ├── app.js                # helmet · cors · sanitization · 3-tier rate limiting · swagger · serves mobile/dist
│   │   ├── db.js                 # Postgres pool, schema, syncAll()/loadAll() (full-state transactional sync)
│   │   ├── store.js              # in-memory working set — Postgres-backed when DATABASE_URL is set, else JSON file
│   │   ├── lib/                  # errors · auth(JWT+RBAC) · passwords(scrypt) · validate(zod) · badges
│   │   ├── docs/openapi.js       # full OpenAPI 3 spec → /api/docs
│   │   ├── data/                 # seed: 19 locations, 17 events, users/reviews/posts, revival index
│   │   └── modules/              # auth · locations · reviews · posts · timeline · analytics · users
│   └── Dockerfile
├── mobile/                       # PWA client — React 18, Vite 5, TS strict
│   ├── src/
│   │   ├── api/                  # axios client (token + offline-cache interceptors), typed endpoints
│   │   ├── store/                # zustand: auth session · app filters/year · toasts
│   │   ├── components/           # design system: ui kit, tab bar, sheets, toasts, error boundary,
│   │   │                         #   LocationArt (generative before/after SVG), AudioGuide player
│   │   ├── modules/
│   │   │   ├── map/              # LeafletMap · grid clustering · pin factory · TimelineSlider · screen
│   │   │   ├── locations/        # detail screen · BeforeAfterSlider · CheckInButton
│   │   │   ├── reviews/          # ReviewsSection (summary, form, list)
│   │   │   ├── feed/             # FeedScreen · PostCard
│   │   │   ├── analytics/        # dashboard · hand-rolled SVG charts
│   │   │   └── profile/          # AuthForms · passport · badges · offline cache
│   │   ├── theme/styles.css      # design tokens: Xarıbülbül purple/amber · emerald · slate
│   │   └── main.tsx              # registers public/sw.js (installable PWA) in production
│   ├── public/                   # icon.svg · manifest.webmanifest · sw.js · privacy.html
│   ├── nginx.conf · Dockerfile
├── store/                        # Play Store: TWA config (Bubblewrap) + listing copy (az)
├── docker-compose.yml · render.yaml
├── ROADMAP.md                    # hosting → Play Store → marketing → monetization plan
└── README.md
```

**API surface:** `auth/{register,login,me}` · `locations` (+`?year/category/city/q`,
admin CRUD) · `locations/:id/reviews` · `reviews/:id` · `posts` (+like/comments) ·
`timeline` · `analytics/revival-index` · `checkins` · `users/me/passport` — all
JSON, unified error envelope `{ error: { code, message, details } }`.

**Security:** helmet headers (incl. a CSP scoped to `self` + OSM tiles) · JWT
(scrypt-hashed passwords) · role guards · zod validation on every write ·
HTML-stripping input sanitizer · 3 rate-limit tiers (global / auth / write) ·
trust-proxy aware.

**Persistence:** `store.js` keeps an in-memory working set (demo-scale data)
and treats Postgres as the source of truth — hydrated via `loadAll()` at boot,
synced transactionally via `syncAll()` on every debounced write. No
DATABASE_URL (or DB unreachable) → transparent fallback to a JSON file, so
`npm run dev` needs zero setup. Verified: reviews/posts/check-ins survive a
hard process kill and cold restart.

## 📝 Notes & roadmap

- Seed content (statuses, figures, some 2025–2026 objects) is **demo data** for
  jury/mentor evaluation, not official statistics.
- Spatial queries (GPS check-in distance) use haversine in JS; a PostGIS
  `geography` column + `ST_DWithin` would be the next step at real scale.
- See **ROADMAP.md** for the path to Play Store + marketing + monetization.
- Next: real photo uploads, push notifications for new milestones, native wrap
  with Capacitor, offline tile bundles.

---
*Xarıbülbül çiçəyi kimi — yenidən çiçəklənən Qarabağ.* 🌸
