# 🌸 Qarabağ Dirçəliş Xəritəsi — Karabakh Revival Map

Interactive mobile platform tracking the post-2023 restoration of **Şuşa** and **Xankəndi**:
heritage sites, infrastructure, green energy and community life across **2023 → 2026**.

Mobile-first PWA (React + Vite + TypeScript + Leaflet) backed by a REST API
(Node.js + Express) with JWT auth, RBAC, Swagger docs, rate limiting and seeded
demo data. **All content in Azerbaijani; seed figures are demo data** inspired by
the public "Böyük Qayıdış" narrative.

---

## ✨ Feature map

| Feature | Where | Notes |
| --- | --- | --- |
| 🗺 Interactive map (custom pins, clustering) | Map tab | Leaflet + hand-rolled grid clustering, category-coloured pins with live status dots |
| 🕰 Time-Travel slider 2023–2026 | Map tab (bottom card) | Markers appear/change status per year; ▶ auto-plays the years |
| 🔍 Filters & search | Map tab | City chips, 6 category chips, debounced free-text search |
| 🏛 "Dirçəliş qabağı və sonrası" | Location page hero | Draggable split slider over generative SVG scenes (before: damaged · after: restored) |
| 🎧 Səsli bələdçi (audio guide) | Location page | Simulated WebAudio stream + karaoke transcript, per-location scripts |
| ⭐ Reviews & 5-star ratings | Location page | Zod validation, distribution bars, owner/moderator delete |
| 📰 Social feed | Lent tab | Posts with location tags, optimistic likes, comment threads, pagination |
| 📊 Dirçəliş İndeksi dashboard | İndeks tab | Roads km, green MW, monuments, returnees — animated counters + SVG charts synced to the year slider |
| 🛂 Qarabağ Pasportu | Pasport tab | GPS (≤5 km validated) & manual check-ins, % progress ring |
| 🏅 Gamification badges | Pasport tab | 7 badges (Şuşa Tədqiqatçısı, Mədəniyyət Qoruyucusu, …) computed server-side with progress |
| 📴 Offline map caching | automatic + Pasport tab | GET responses cached to localStorage and replayed when the network/API is down; one-tap precache |
| 🔐 RBAC | everywhere | guest → read-only · user → reviews/posts/check-ins · admin/moderator → moderation + location CRUD |
| 📚 Swagger / OpenAPI | `/api/docs` | Interactive, with JWT authorize button |

## 🚀 Quickstart (dev)

Requires **Node.js ≥ 18.17** (this workspace includes a portable Node under
`../.tools/node-v22.23.2-win-x64` — add it to `PATH` if Node isn't installed).

```bash
# 1) install
npm --prefix server install
npm --prefix mobile install

# 2) run API (terminal 1) → http://localhost:5001
npm --prefix server run dev

# 3) run app (terminal 2) → http://localhost:5173  (proxies /api → :5001)
npm --prefix mobile run dev
```

Open **http://localhost:5173** (best in a mobile viewport / device toolbar) and
**http://localhost:5001/api/docs** for the API playground.

### Demo accounts

| Role | E-mail | Password |
| --- | --- | --- |
| Admin | `admin@qdx.az` | `Admin123!` |
| User | `aysel@demo.az` | `Demo123!` |
| Moderator | `leyla@demo.az` | `Demo123!` |

(Or one-tap "Demo istifadəçi / Admin" buttons on the login screen.)

## ✅ Build verification (zero errors)

```bash
npm --prefix server run check     # syntax-checks every server file
npm --prefix mobile run typecheck # strict TypeScript, no emit
npm --prefix mobile run build     # tsc + vite production bundle
```

## 🐳 Production (Docker)

```bash
docker compose up --build
# app  → http://localhost:8080          (nginx, gzip, SPA fallback, /api proxy)
# api  → http://localhost:5001/api      (docs at /api/docs)
```

`JWT_SECRET=your-secret docker compose up --build` to set a real secret.
Community data persists in the `qdx-data` volume.

### Cloud (Render blueprint)

`render.yaml` deploys `qdx-api` (Node web service, health check on
`/api/health`, generated `JWT_SECRET`) and `qdx-mobile` (static site with SPA
rewrite). After the first deploy, point `VITE_API_URL` at the real API URL and
lock `CORS_ORIGIN` to the site origin. A split Vercel (client) + Render (API)
setup works the same way via `mobile/.env.production`.

## 🏗 Architecture

```
qarabag-dircelis-xeritesi/
├── server/                       # REST API — Node 22, Express, ESM
│   ├── src/
│   │   ├── config.js             # env loader (.env.development / .env.production)
│   │   ├── app.js                # helmet · cors · sanitization · 3-tier rate limiting · swagger
│   │   ├── store.js              # in-memory store + JSON write-through persistence
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
│   │   └── theme/styles.css      # design tokens: Xarıbülbül purple/amber · emerald · slate
│   ├── nginx.conf · Dockerfile
├── docker-compose.yml · render.yaml
└── README.md
```

**API surface:** `auth/{register,login,me}` · `locations` (+`?year/category/city/q`,
admin CRUD) · `locations/:id/reviews` · `reviews/:id` · `posts` (+like/comments) ·
`timeline` · `analytics/revival-index` · `checkins` · `users/me/passport` — all
JSON, unified error envelope `{ error: { code, message, details } }`.

**Security:** helmet headers · JWT (scrypt-hashed passwords) · role guards ·
zod validation on every write · HTML-stripping input sanitizer · 3 rate-limit
tiers (global / auth / write) · trust-proxy aware.

## 📝 Notes & roadmap

- Data store is repository-shaped — swapping to Postgres/PostGIS is a
  module-local change; spatial queries currently use haversine.
- Seed content (statuses, figures, some 2025–2026 objects) is **demo data** for
  jury/mentor evaluation, not official statistics.
- Next: real photo uploads, push notifications for new milestones, native wrap
  with Capacitor, offline tile bundles.

---
*Xarıbülbül çiçəyi kimi — yenidən çiçəklənən Qarabağ.* 🌸
