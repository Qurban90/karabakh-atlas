# 🚀 QDX — Real Layihə Yol Xəritəsi

MVP hazırdır və işləyir. Bu sənəd onu **canlı məhsula, Play Store tətbiqinə və
tanınan brendə** çevirməyin konkret planıdır. Hər mərhələdə nəyin artıq hazır
olduğu ✅, sizin etməli olduğunuz addımlar isə 👤 ilə işarələnib
(hesab açmaq / ödəniş — yalnız sizin edə biləcəyiniz addımlardır).

---

## Mərhələ 0 — Bu gün işləyən ✅
- Tam funksional tətbiq + API (lokal): `start-demo.cmd` → http://localhost:5001
- Müvəqqəti canlı link: `share-live-link.cmd` (Cloudflare quick tunnel, hesabsız)
- Quraşdırıla bilən **PWA**: service worker, oflayn shell, manifest — Android-də
  Chrome “Ana ekrana əlavə et” ilə bu gün “app kimi” quraşdırılır
- Git repo, Docker, Render blueprint, privacy policy, Play listinq mətnləri

## Mərhələ 1 — Daimi hosting (1 gün, pulsuz)
1. 👤 github.com-da hesab (varsa keç) → boş repo yarat: `qarabag-dircelis-xeritesi`
2. Push (mən hazırlamışam, tək əmr):
   ```bash
   git remote add origin https://github.com/SIZIN-AD/qarabag-dircelis-xeritesi.git
   git push -u origin main
   ```
3. 👤 render.com-a GitHub ilə daxil ol → **New → Blueprint** → repo seç.
   `render.yaml` hər şeyi özü qurur (tək servis, health-check, JWT secret).
   Nəticə: `https://qdx-app.onrender.com` — daimi canlı link.
4. (İstəyə görə) 👤 Domen al (~10 AZN/il, məs. `dircelis.az` / `qdx.app`) →
   Render-də Custom Domain kimi bağla (SSL avtomatik).

> Pulsuz plan yatıb-oyanır (ilk açılış ~30 san). Jüri demosu üçün kifayətdir;
> sonra $7/ay Starter plana keçmək olar.

## Mərhələ 2 — Google Play (TWA yolu, 2–3 gün)
PWA hazır olduğu üçün ən sürətli və rəsmi yol **Trusted Web Activity**-dir
(Google-un öz tövsiyəsi; Chrome komandası aləti: Bubblewrap).

1. 👤 Play Console developer hesabı — birdəfəlik $25 (play.google.com/console)
2. Mənim hazırladığım `store/twa-manifest.json`-da domeni öz Render/domen
   ünvanınla əvəz et, sonra:
   ```bash
   npm i -g @bubblewrap/cli
   bubblewrap init --manifest https://SIZIN-DOMEN/manifest.webmanifest
   bubblewrap build
   ```
   (JDK + Android SDK-nı Bubblewrap özü yükləyir; nəticə: imzalı `.aab`)
3. `assetlinks.json`-u Bubblewrap-ın verdiyi fingerprint ilə
   `mobile/public/.well-known/assetlinks.json` kimi əlavə et → yenidən deploy
   (bunsuz tətbiq browser çubuğu ilə açılır).
4. 👤 Play Console-da yeni tətbiq → `store/play-store-listing-az.md`-dəki hazır
   mətnləri yapışdır → privacy URL: `https://SIZIN-DOMEN/privacy.html` →
   `.aab` yüklə → əvvəl **Internal testing**, sonra Production-a göndər.
   İlk yoxlama adətən 2–7 gün çəkir.

**iOS/App Store** (sonrakı addım): Capacitor wrap + 👤 Apple Developer $99/il +
Mac tələb olunur. PWA onsuz da iPhone Safari-də “Add to Home Screen” ilə işləyir.

## Mərhələ 3 — Məhsul keyfiyyəti (2–4 həftə)
- [ ] Postgres/PostGIS-ə keçid (store.js repository-shaped — dəyişiklik lokaldır)
- [ ] Real foto qalereyası (indiki generativ art + real şəkillər yanaşı)
- [ ] Rəsmi məlumat mənbələri ilə razılaşma (statuslar “demo” etiketindən çıxsın)
- [ ] Moderasiya paneli (admin rolu API-də hazırdır — UI əlavə olunmalı)
- [ ] İkinci dil (EN/RU) — turist auditoriyası üçün
- [ ] Push bildirişlər (“Yeni obyekt açıldı!”)

## Mərhələ 4 — Marketinq (paralel)
**Mövqe:** “Qarabağın dirçəlişini cibindən izlə” — vətənpərvər + turizm + texnologiya.

1. **Kontent maşını:** Before/After slaydının 15 saniyəlik screen-record-ları =
   hazır Instagram Reels / TikTok formatı. Həftədə 2–3 məkan hekayəsi.
2. **Vaxtlama:** Xarıbülbül festivalı (may), Zəfər Günü (8 noyabr), 28 May —
   pik maraq günlərində kampaniya.
3. **Tərəfdaşlıqlar:** Qarabağ Universiteti tələbə icması, turizm agentlikləri
   (Şuşa turlarına QR-kod), Holberton/tech icmaları.
4. **Press:** Trend/Report/Oxu.az-a “tələbə Qarabağ tətbiqi yaratdı” press-relizi —
   bu tip xəbərlər yaxşı götürülür.
5. **Qranlar/müsabiqələr** (satışdan realistik ilkin gəlir yolu):
   Gənclər Fondu, İnnovasiya və Rəqəmsal İnkişaf Agentliyi, KOBİA startap
   müsabiqələri, universitet inkubatorları.

## Mərhələ 5 — Monetizasiya (tətbiq pulsuz qalır)
| Model | Nə | Nə vaxt |
| --- | --- | --- |
| Sponsorluq | Turizm şirkəti / bank “Dirçəliş İndeksi” panelinin sponsoru | İlk 1000 istifadəçidən sonra |
| B2B | Otellər/turlar üçün premium yerləşdirmə + QR audio-bələdçi paketi | Turizm mövsümü |
| Premium | Genişlənmiş audio-bələdçilər, oflayn xəritə paketləri (~2.99 AZN) | Play Store-dan sonra |
| Qrant | Yuxarıdakı fondlar — sosial-mədəni layihə kimi güclü namizəd | Dərhal |

Reklam şəbəkəsi (AdMob) tövsiyə olunmur — mövzunun ciddiyyəti brendi reklamla
ucuzlaşdırmağa dəyməz; sponsorluq daha yaxşı ödəyir.

---

### Yekun ardıcıllıq (qısa)
**GitHub push → Render (pulsuz link) → domen → Bubblewrap `.aab` → Play $25 →
listinq (hazır mətnlər) → festival vaxtı kontent kampaniyası → qrant müraciəti.**

Yalnız 👤 işarəli addımlar sizindir (hesablar + $25); qalan hər şeyin skripti,
konfiqi və mətni bu repoda hazırdır.
