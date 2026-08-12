/**
 * Seed locations — Şuşa & Xankəndi, 2023–2026.
 * Coordinates are real (approximate to the site); yearly statuses and figures
 * follow the public restoration narrative but are DEMO data for the app.
 *
 * status: damaged | restoring | construction | restored | active | planned
 * visibleFrom: first year the marker appears on the timeline slider
 */
export const locationsSeed = [
  /* ─────────────────────────── ŞUŞA ─────────────────────────── */
  {
    id: 'yuxari-govhar-aga',
    name: 'Yuxarı Gövhər Ağa məscidi',
    city: 'shusha',
    category: 'heritage',
    lat: 39.76095,
    lng: 46.74905,
    builtInfo: '1768–1885, memar Kərbəlayi Səfixan Qarabaği',
    shortDescription:
      'Şuşanın baş meydanındakı cüt minarəli məscid — şəhərin memarlıq simvollarından biri.',
    history:
      'Qarabağ xanı Pənahəli xanın nəvəsi Gövhər ağanın vəsaiti ilə ucaldılmış məscid Şuşanın dini-mədəni həyatının mərkəzi olub. İşğal illərində ciddi zədələnmiş bina 2021–2024-cü illərdə Heydər Əliyev Fondunun xətti ilə elmi bərpa metodları əsasında yenidən qurulub və yenidən ibadətə açılıb.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'restoring', note: 'Minarələrin naxış bərpası davam edir' },
      2024: { status: 'restored', note: 'Bərpa yekunlaşdı, məscid ibadətə açıldı' },
      2025: { status: 'active', note: 'Ziyarətçilər üçün tam açıqdır' },
      2026: { status: 'active', note: 'Şuşanın əsas ziyarət nöqtələrindən biri' }
    },
    audioGuide: {
      durationSec: 42,
      lines: [
        'Qarşınızdakı cüt minarəli məbəd — Yuxarı Gövhər Ağa məscidi, Şuşanın ürəyidir.',
        'Memar Kərbəlayi Səfixan Qarabağinin dəst-xətti Qarabağ məscidlər məktəbinin zirvəsi sayılır.',
        'Bərpa zamanı minarələrin kərpic naxışları orijinal texnika ilə, əl ilə hörülüb.',
        'Bu gün məscid yenidən azan səsi ilə şəhərin mərkəzində yaşayır.'
      ]
    },
    tags: ['məscid', 'XVIII əsr', 'bərpa']
  },
  {
    id: 'ashagi-govhar-aga',
    name: 'Aşağı Gövhər Ağa məscidi',
    city: 'shusha',
    category: 'heritage',
    lat: 39.7588,
    lng: 46.7465,
    builtInfo: 'XIX əsr, memar Kərbəlayi Səfixan Qarabaği',
    shortDescription:
      'Şuşanın aşağı məhəlləsinin tarixi məscidi — Qarabağ memarlıq məktəbinin incisi.',
    history:
      'Gövhər ağanın adını daşıyan ikinci məscid şəhərin aşağı hissəsində yerləşir. Uzun illər baxımsız qalan abidədə 2024-cü ildən əsaslı elmi bərpa aparılır; fasad, günbəz və interyer naxışları mərhələlərlə orijinala uyğun qaytarılır.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'damaged', note: 'Konservasiya işləri aparılıb' },
      2024: { status: 'restoring', note: 'Əsaslı bərpaya start verildi' },
      2025: { status: 'restored', note: 'Bərpa tamamlandı' },
      2026: { status: 'active', note: 'Ziyarət üçün açıqdır' }
    },
    audioGuide: {
      durationSec: 36,
      lines: [
        'Aşağı Gövhər Ağa məscidi Şuşanın aşağı məhəlləsinin mənəvi mərkəzi olub.',
        'Bərpa layihəsində XIX əsr fotoları və arxiv cizgiləri əsas götürülüb.',
        'Naxışlı mehrab ustaların altı aylıq əl əməyinin nəticəsidir.'
      ]
    },
    tags: ['məscid', 'XIX əsr', 'bərpa']
  },
  {
    id: 'shusha-qalasi',
    name: 'Şuşa qalası və Gəncə qapısı',
    city: 'shusha',
    category: 'heritage',
    lat: 39.7668,
    lng: 46.7497,
    builtInfo: '1750-ci illər, Pənahəli xan dövrü',
    shortDescription:
      'Şəhəri əhatə edən 2.5 km-lik qala divarları və şimal giriş qapısı — Gəncə qapısı.',
    history:
      'Pənahəli xanın əmri ilə sıldırım qayalıqlar üzərində inşa edilən qala Şuşanı üç tərəfdən qoruyub. Gəncə qapısı şəhərə əsas giriş olub. 2023-cü ildən divar seqmentlərinin möhkəmləndirilməsi və tarixi görkəmin qaytarılması istiqamətində konservasiya-bərpa işləri gedir.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'damaged', note: 'Divar seqmentlərində qəza vəziyyəti qiymətləndirilib' },
      2024: { status: 'restoring', note: 'Gəncə qapısı hissəsində bərpa başladı' },
      2025: { status: 'restoring', note: 'Divarların 60%-i möhkəmləndirilib' },
      2026: { status: 'restored', note: 'Əsas marşrut boyu divarlar bərpa olundu' }
    },
    audioGuide: {
      durationSec: 40,
      lines: [
        'Bu divarlar 270 ildir Şuşanı qoruyur — şəhər elə qala deməkdir.',
        'Gəncə qapısından karvan yolları Gəncəyə və Bərdəyə uzanırdı.',
        'Bərpada yerli əhəng daşı və ənənəvi hörgü texnikası istifadə olunur.',
        'Divar boyu gəzinti marşrutu Cıdır düzünə qədər uzanır.'
      ]
    },
    tags: ['qala', 'XVIII əsr', 'fortifikasiya']
  },
  {
    id: 'cidir-duzu',
    name: 'Cıdır düzü',
    city: 'shusha',
    category: 'culture_tourism',
    lat: 39.7528,
    lng: 46.7515,
    builtInfo: 'Təbii yayla, festival məkanı',
    shortDescription:
      '“Xarıbülbül” festivalının ünvanı — Dağlıq Qarabağ silsiləsinə açılan əfsanəvi yayla.',
    history:
      'Şuşanın cənubundakı bu yayla əsrlər boyu at yarışlarının, Novruz şənliklərinin məkanı olub. 2021-ci ildən bərpa olunan “Xarıbülbül” Beynəlxalq Musiqi Festivalı hər il burada keçirilir; yayla həm də şəhərin əsas turizm nöqtəsidir.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'active', note: 'Festival mövsümü davam edir' },
      2024: { status: 'active', note: '“Xarıbülbül” festivalı — mədəniyyət paytaxtı proqramında' },
      2025: { status: 'active', note: 'Yeni amfiteatr infrastrukturu quruldu' },
      2026: { status: 'active', note: 'İlboyu açıq hava tədbirləri' }
    },
    audioGuide: {
      durationSec: 38,
      lines: [
        'Cıdır düzü — Şuşanın açıq səma altındakı səhnəsidir.',
        'Adı cıdır yarışlarından gəlir: xan dövründə burada atlar cıdıra çıxarılırdı.',
        'Hər yaz burada Xarıbülbül festivalının səsi dağlara yayılır.'
      ]
    },
    tags: ['festival', 'təbiət', 'panorama']
  },
  {
    id: 'isa-bulagi',
    name: 'İsa bulağı',
    city: 'shusha',
    category: 'culture_tourism',
    lat: 39.7395,
    lng: 46.7192,
    builtInfo: 'Tarixi bulaq kompleksi, meşə zonası',
    shortDescription:
      'Şuşa meşələrinin qoynunda tarixi bulaq — şəhər əhalisinin sevimli istirahət güşəsi.',
    history:
      'Topxana meşəsinin ətəyindəki İsa bulağı Şuşanın ən məşhur bulaqlarındandır; vaxtilə şairlərin, xanəndələrin məclis qurduğu yer olub. 2024–2025-ci illərdə bulaq kompleksi, piyada cığırları və istirahət guşələri yenidən qurulub.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'damaged', note: 'Giriş yolları bərpa olunurdu' },
      2024: { status: 'restoring', note: 'Bulaq kompleksində quruculuq işləri' },
      2025: { status: 'restored', note: 'Kompleks ziyarətçilər üçün açıldı' },
      2026: { status: 'active', note: 'Ekoturizm marşrutlarının dayanacağı' }
    },
    audioGuide: {
      durationSec: 34,
      lines: [
        'İsa bulağının suyu Şuşa qayalarının süzgəcindən keçib gəlir.',
        'Xan qızı Natəvanın məclislərinin bir ünvanı da bu meşələr olub.',
        'İndi bura Şuşanın ekoturizm marşrutlarının başlanğıc nöqtəsidir.'
      ]
    },
    tags: ['bulaq', 'meşə', 'istirahət']
  },
  {
    id: 'natavan-evi',
    name: 'Xurşidbanu Natəvanın evi',
    city: 'shusha',
    category: 'heritage',
    lat: 39.7618,
    lng: 46.7478,
    builtInfo: 'XIX əsr, xan qızı Natəvanın malikanəsi',
    shortDescription:
      'Şairə və xeyriyyəçi Xurşidbanu Natəvanın tarixi malikanəsi — gələcək ədəbiyyat muzeyi.',
    history:
      'Qarabağ xanının qızı, “Xan qızı” ləqəbli şairə Natəvan bu evdə “Məclisi-üns” ədəbi məclisini qurub, şəhərə su kəməri çəkdirib. Zədələnmiş bina 2025-ci ildən bərpa olunur və ədəbiyyat muzeyi kimi fəaliyyətə hazırlanır.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'damaged', note: 'Qəza vəziyyəti sənədləşdirilib' },
      2024: { status: 'damaged', note: 'Layihələndirmə mərhələsi' },
      2025: { status: 'restoring', note: 'Bərpa işlərinə başlanıldı' },
      2026: { status: 'restored', note: 'Muzey ekspozisiyası hazırlanır' }
    },
    audioGuide: {
      durationSec: 37,
      lines: [
        'Bu ev Azərbaycan poeziyasının Xan qızı — Natəvanın ocağıdır.',
        'Onun çəkdirdiyi su kəməri bu gün də “Xan qızı bulağı” adı ilə yaşayır.',
        'Bərpadan sonra burada Şuşanın ədəbi mühiti muzeyi yerləşəcək.'
      ]
    },
    tags: ['muzey', 'ədəbiyyat', 'XIX əsr']
  },
  {
    id: 'uzeyir-ev-muzeyi',
    name: 'Üzeyir Hacıbəylinin ev-muzeyi',
    city: 'shusha',
    category: 'heritage',
    lat: 39.7624,
    lng: 46.7462,
    builtInfo: 'XIX əsr yaşayış evi, 1959-dan muzey',
    shortDescription:
      'Azərbaycan professional musiqisinin banisi Üzeyir Hacıbəylinin doğulduğu ev.',
    history:
      '“Koroğlu” operasının və Azərbaycan himninin müəllifi Üzeyir Hacıbəyli bu evdə dünyaya gəlib. Muzeyin eksponatlarının bir hissəsi vaxtında xilas edilib. Bina bərpa olunaraq 2025-ci ildə ekspozisiyası ilə birlikdə yenidən açılıb.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'restoring', note: 'Binanın konstruktiv bərpası' },
      2024: { status: 'restoring', note: 'İnteryer və ekspozisiya işləri' },
      2025: { status: 'restored', note: 'Muzey yenidən açıldı' },
      2026: { status: 'active', note: 'Muzey tam fəaliyyətdədir' }
    },
    audioGuide: {
      durationSec: 39,
      lines: [
        'Bu həyətdə Azərbaycan musiqisinin dahisi Üzeyir bəy böyüyüb.',
        '“Leyli və Məcnun” ilə Şərqin ilk operası məhz onun qələmindən çıxıb.',
        'Muzeydə bəstəkarın royalının surəti və nadir əlyazmalar sərgilənir.'
      ]
    },
    tags: ['muzey', 'musiqi', 'Üzeyir Hacıbəyli']
  },
  {
    id: 'bulbul-ev-muzeyi',
    name: 'Bülbülün ev-muzeyi',
    city: 'shusha',
    category: 'heritage',
    lat: 39.7615,
    lng: 46.75,
    builtInfo: 'XIX əsr yaşayış evi, 1982-dən muzey',
    shortDescription:
      'Əfsanəvi xanəndə Bülbülün doğma evi — bərpadan sonra ilk açılan muzeylərdən.',
    history:
      'Vokal sənətinin korifeyi Murtuza Məmmədov — Bülbül bu evdə doğulub. Ev-muzey 2021-ci ildə bərpa edilərək açılan ilk mədəniyyət ocaqlarından oldu; ekspozisiya xanəndənin şəxsi əşyaları əsasında yenidən qurulub.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'restored', note: 'Muzey ziyarətçi qəbul edir' },
      2024: { status: 'active', note: 'Mədəniyyət paytaxtı proqramının məkanı' },
      2025: { status: 'active', note: 'Yeni interaktiv ekspozisiya' },
      2026: { status: 'active', note: 'Muzey tam fəaliyyətdədir' }
    },
    audioGuide: {
      durationSec: 33,
      lines: [
        'Bülbül — Şuşanın səsi. Onun ilk nəğmələri bu otaqlarda səslənib.',
        'Muzeydə xanəndənin səhnə kostyumları və qramofon valları saxlanılır.',
        'Həyətdəki tut ağacı hələ də Bülbülün uşaqlığının şahididir.'
      ]
    },
    tags: ['muzey', 'muğam', 'Bülbül']
  },
  {
    id: 'vaqif-turbesi',
    name: 'Molla Pənah Vaqifin türbəsi',
    city: 'shusha',
    category: 'heritage',
    lat: 39.7553,
    lng: 46.7576,
    builtInfo: '1982, yenidən bərpa: 2021',
    shortDescription:
      'Şair və dövlət xadimi M.P.Vaqifin məqbərəsi — Şuşanın simvolik abidələrindən.',
    history:
      'Qarabağ xanlığının vəziri, qoşma ustası Molla Pənah Vaqifin məzarı üzərində 1982-ci ildə ucaldılan türbə işğal illərində dağıntıya məruz qalmışdı. Abidə tarixi görkəminə uyğun bərpa edilib və “Vaqif poeziya günləri” ənənəsi buraya qayıdıb.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'restored', note: 'Türbə bərpa olunub, ziyarətə açıqdır' },
      2024: { status: 'active', note: 'Vaqif poeziya günləri keçirildi' },
      2025: { status: 'active', note: 'Ziyarətçi mərkəzi əlavə olundu' },
      2026: { status: 'active', note: 'Tam fəaliyyətdədir' }
    },
    audioGuide: {
      durationSec: 35,
      lines: [
        '“Mən cahan mülkündə mütləq doğru halət görmədim” — Vaqifin sətirləri buradan dünyaya səslənir.',
        'Türbənin şəbəkəli fasadı Qarabağ memarlığının müasir yozumudur.',
        'Hər payız burada poeziya günləri şairin ruhunu yad edir.'
      ]
    },
    tags: ['türbə', 'poeziya', 'Vaqif']
  },
  {
    id: 'xaribulbul-hotel',
    name: '“Xarıbülbül” oteli',
    city: 'shusha',
    category: 'culture_tourism',
    lat: 39.7708,
    lng: 46.7445,
    builtInfo: '2023–2024, müasir tikili',
    shortDescription:
      'Şəhər girişindəki ilk yeni nəsil otel — Şuşa turizminin lokomotivi.',
    history:
      'Şuşaya gələn qonaqların artan axınına cavab olaraq şəhərin girişində inşa edilən otel milli memarlıq motivləri ilə müasir dizaynı birləşdirir. Otel 2024-cü ildən qonaq qəbul edir və festival mövsümündə tam dolur.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'construction', note: 'Tikinti davam edir' },
      2024: { status: 'active', note: 'Otel qonaq qəbuluna başladı' },
      2025: { status: 'active', note: 'Konfrans zalı əlavə olundu' },
      2026: { status: 'active', note: 'Tam fəaliyyətdədir' }
    },
    audioGuide: {
      durationSec: 28,
      lines: [
        'Otelin adı Şuşanın simvolu olan xarıbülbül çiçəyindən götürülüb.',
        'Fasaddakı naxışlar Qarabağ xalçalarının ilmələrini xatırladır.',
        'Terasdan Dağlıq Qarabağ silsiləsinin panoraması açılır.'
      ]
    },
    tags: ['otel', 'turizm', 'yeni tikili']
  },
  {
    id: 'shusha-realni-mektebi',
    name: 'Şuşa realnı məktəbi',
    city: 'shusha',
    category: 'education',
    lat: 39.7602,
    lng: 46.7485,
    builtInfo: '1881, tarixi təhsil ocağı',
    shortDescription:
      'Qafqazın ilk realnı məktəblərindən biri — yenidən təhsil ocağı kimi qurulur.',
    history:
      '1881-ci ildə açılan Şuşa realnı məktəbi Nəriman Nərimanov kimi görkəmli məzunlar yetişdirib. Tarixi bina 2024-cü ildən bərpa olunur; burada müasir standartlara cavab verən tam orta məktəb fəaliyyət göstərəcək.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'damaged', note: 'Bina qorunma altına alınıb' },
      2024: { status: 'restoring', note: 'Konstruktiv bərpa başladı' },
      2025: { status: 'restoring', note: 'Fasad və interyer işləri' },
      2026: { status: 'restored', note: 'Məktəb yeni tədris ilinə hazırdır' }
    },
    audioGuide: {
      durationSec: 30,
      lines: [
        'Bu binada 140 il əvvəl Qafqazın ən qabaqcıl məktəblərindən biri açılmışdı.',
        'Sinif otaqlarının tağlı pəncərələri orijinal formasında bərpa olunur.',
        '2026-cı ildə burada yenidən məktəb zəngi səslənəcək.'
      ]
    },
    tags: ['məktəb', 'təhsil', 'tarixi bina']
  },

  /* ───────────────────────── XANKƏNDİ ───────────────────────── */
  {
    id: 'qarabag-universiteti',
    name: 'Qarabağ Universiteti',
    city: 'khankendi',
    category: 'education',
    lat: 39.8212,
    lng: 46.7614,
    builtInfo: '2023-cü il fərmanı ilə təsis edilib',
    shortDescription:
      'Xankəndidə fəaliyyətə başlayan dövlət universiteti — regionun akademik mərkəzi.',
    history:
      'Noyabr 2023-cü ildə təsis edilən Qarabağ Universiteti 2024/2025 tədris ilində ilk tələbələrini qəbul edib. Kampus mərhələlərlə genişlənir: laboratoriyalar, kitabxana və tələbə evləri əlavə olunur; universitet regionun elmi dirçəlişinin simvoluna çevrilib.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'restoring', note: 'Universitet təsis edildi, binalar hazırlanır' },
      2024: { status: 'active', note: 'İlk tədris ili başladı — 1000+ tələbə' },
      2025: { status: 'active', note: 'Yeni fakültələr və yataqxana açıldı' },
      2026: { status: 'active', note: '3000+ tələbə, beynəlxalq mübadilə proqramları' }
    },
    audioGuide: {
      durationSec: 36,
      lines: [
        'Qarabağ Universiteti — Xankəndinin yeni intellektual ürəyi.',
        '2024-cü ilin sentyabrında burada ilk mühazirə oxundu.',
        'Kampusda gənc tədqiqatçılar üçün innovasiya laboratoriyaları qurulub.'
      ]
    },
    tags: ['universitet', 'təhsil', 'gənclik']
  },
  {
    id: 'xankendi-merkezi-meydani',
    name: 'Xankəndi mərkəzi meydanı',
    city: 'khankendi',
    category: 'infrastructure',
    lat: 39.8265,
    lng: 46.7656,
    builtInfo: 'Yenidənqurma: 2024',
    shortDescription:
      'Şəhərin yenilənmiş baş meydanı — bayram tədbirlərinin və gəzintilərin ünvanı.',
    history:
      'Xankəndinin mərkəzi meydanı 2024-cü ildə yenidən qurulub: piyada zonası genişləndirilib, fəvvarələr, işıqlandırma və yaşıllıq sahələri yaradılıb. Meydan şəhərin ictimai həyatının mərkəzinə çevrilib.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'restoring', note: 'Yenidənqurma layihəsi başladı' },
      2024: { status: 'restored', note: 'Meydan yenilənmiş görkəmdə açıldı' },
      2025: { status: 'active', note: 'Şəhər tədbirlərinin əsas məkanı' },
      2026: { status: 'active', note: 'Tam fəaliyyətdədir' }
    },
    audioGuide: {
      durationSec: 27,
      lines: [
        'Meydan Xankəndinin bütün əsas küçələrinin qovuşduğu nöqtədir.',
        'Axşamlar fəvvarələrin işıq şousu şəhər sakinlərini bir araya gətirir.',
        'Buradan Qarabağ Universitetinə piyada cəmi on dəqiqədir.'
      ]
    },
    tags: ['meydan', 'şəhər mərkəzi', 'istirahət']
  },
  {
    id: 'zefer-parki',
    name: 'Zəfər parkı',
    city: 'khankendi',
    category: 'culture_tourism',
    lat: 39.8324,
    lng: 46.7702,
    builtInfo: '2024–2025, yeni park kompleksi',
    shortDescription:
      'Xankəndinin yeni istirahət parkı — xatirə guşəsi, uşaq meydançaları və amfiteatr.',
    history:
      'Şəhərin şimal hissəsində salınan Zəfər parkı 2025-ci ildə açılıb. Parkda xatirə kompozisiyası, velosiped yolları, açıq hava amfiteatrı və uşaq zonaları var; park şəhərin yaşıl dəhlizinin bir hissəsidir.',
    visibleFrom: 2024,
    timeline: {
      2024: { status: 'construction', note: 'Parkın salınmasına başlanıldı' },
      2025: { status: 'active', note: 'Park ziyarətçilər üçün açıldı' },
      2026: { status: 'active', note: 'Amfiteatrda yay konsertləri' }
    },
    audioGuide: {
      durationSec: 25,
      lines: [
        'Zəfər parkı şəhərin ən gənc yaşıl məkanıdır.',
        'Xatirə guşəsi şəhidlərin əziz xatirəsinə həsr olunub.',
        'Park velosiped dəhlizi ilə mərkəzi meydana bağlanır.'
      ]
    },
    tags: ['park', 'istirahət', 'xatirə']
  },
  {
    id: 'xankendi-konqres-merkezi',
    name: 'Xankəndi Konqres Mərkəzi',
    city: 'khankendi',
    category: 'infrastructure',
    lat: 39.8237,
    lng: 46.7581,
    builtInfo: 'Yenidənqurma: 2023–2024',
    shortDescription:
      'Beynəlxalq tədbirlərə ev sahibliyi edən çoxfunksiyalı konqres kompleksi.',
    history:
      'Yenidən qurulan konqres mərkəzi 2024-cü ildən forum, sərgi və konfransların məkanıdır. Böyük zalı 1200 nəfərlikdir; kompleks regionda işgüzar turizmin inkişafına təkan verib.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'restoring', note: 'Binanın yenidən qurulması' },
      2024: { status: 'active', note: 'İlk beynəlxalq forum keçirildi' },
      2025: { status: 'active', note: 'Sərgi mərkəzi əlavə olundu' },
      2026: { status: 'active', note: 'İlboyu tədbir təqvimi' }
    },
    audioGuide: {
      durationSec: 24,
      lines: [
        'Konqres mərkəzi Xankəndinin işgüzar həyatının yeni ünvanıdır.',
        'Burada regionun dirçəlişinə həsr olunan forumlar keçirilir.',
        'Binanın şüşə fasadı dağ mənzərəsini içəri “gətirir”.'
      ]
    },
    tags: ['konqres', 'forum', 'işgüzar turizm']
  },
  {
    id: 'xocali-hava-limani',
    name: 'Xankəndi (Xocalı) hava limanı',
    city: 'khankendi',
    category: 'energy_roads',
    lat: 39.9014,
    lng: 46.7877,
    builtInfo: 'Yenidənqurma: 2025–2026',
    shortDescription:
      'Regionun hava qapısına çevriləcək aeroport — yenidənqurma mərhələsindədir.',
    history:
      'Xankəndinin şimal-şərqindəki hava limanının uçuş-enmə zolağı və terminalı beynəlxalq standartlara uyğun yenidən qurulur. Layihə tamamlandıqda region Bakı ilə birbaşa hava əlaqəsi qazanacaq.',
    visibleFrom: 2024,
    timeline: {
      2024: { status: 'planned', note: 'Layihələndirmə aparıldı' },
      2025: { status: 'construction', note: 'Uçuş-enmə zolağında işlər başladı' },
      2026: { status: 'construction', note: 'Terminal binası ucaldılır' }
    },
    audioGuide: {
      durationSec: 22,
      lines: [
        'Bu aeroport regionun səmaya açılan qapısı olacaq.',
        'Yeni zolaq müasir təyyarələrin qəbuluna imkan verəcək.',
        'İlk reyslər yaxın illərdə planlaşdırılır.'
      ]
    },
    tags: ['aeroport', 'nəqliyyat', 'tikinti']
  },
  {
    id: 'agdam-xankendi-yolu',
    name: 'Ağdam–Xankəndi–Şuşa magistralı',
    city: 'khankendi',
    category: 'energy_roads',
    lat: 39.8455,
    lng: 46.832,
    builtInfo: '2023–2025, 4 zolaqlı magistral',
    shortDescription:
      'Regionu ölkənin yol şəbəkəsinə bağlayan əsas magistral — 2025-də istifadəyə verilib.',
    history:
      'Ağdamdan Xankəndiyə, oradan Şuşaya uzanan magistral regionun logistika onurğasıdır. Yol boyu tunellər, körpülər və müasir işıqlandırma qurulub; magistral “Böyük Qayıdış” proqramının daşıyıcı infrastrukturudur.',
    visibleFrom: 2023,
    timeline: {
      2023: { status: 'construction', note: 'Torpaq işləri və körpülər' },
      2024: { status: 'construction', note: 'Asfaltlanma mərhələsi' },
      2025: { status: 'active', note: 'Magistral istifadəyə verildi' },
      2026: { status: 'active', note: 'Gündəlik intensiv hərəkət' }
    },
    audioGuide: {
      durationSec: 23,
      lines: [
        'Bu yol Qarabağın şəhərlərini bir-birinə və ölkəyə bağlayır.',
        'Magistral boyu beş körpü və iki tunel inşa olunub.',
        'Ağdamdan Şuşaya yol indi bir saatdan az çəkir.'
      ]
    },
    tags: ['yol', 'magistral', 'logistika']
  },
  {
    id: 'yasil-enerji-qovsagi',
    name: 'Xankəndi Yaşıl Enerji Qovşağı',
    city: 'khankendi',
    category: 'energy_roads',
    lat: 39.8095,
    lng: 46.7789,
    builtInfoNote: 'demo',
    builtInfo: '2025–2026, günəş + yarımstansiya',
    shortDescription:
      'Şəhəri “yaşıl enerji zonası” konsepsiyasına qoşan günəş panelləri sahəsi və rəqəmsal yarımstansiya.',
    history:
      'Qarabağın “yaşıl enerji zonası” elan olunması çərçivəsində Xankəndinin cənubunda günəş panelləri sahəsi və ağıllı idarəetməli yarımstansiya qurulub. Qovşaq şəhər infrastrukturunun bir hissəsini bərpa olunan enerji ilə təmin edir.',
    visibleFrom: 2025,
    timeline: {
      2025: { status: 'construction', note: 'Panellərin quraşdırılması' },
      2026: { status: 'active', note: 'Qovşaq şəbəkəyə qoşuldu — 12 MVt' }
    },
    audioGuide: {
      durationSec: 21,
      lines: [
        'Bu panellər Qarabağ günəşini şəhər işığına çevirir.',
        'Qovşaq ağıllı sayğac şəbəkəsi ilə idarə olunur.',
        'Məqsəd — regionu tam yaşıl enerji zonasına çevirmək.'
      ]
    },
    tags: ['günəş enerjisi', 'yaşıl zona', 'innovasiya']
  },
  {
    id: 'xanyurdu-mehellesi',
    name: '“Xanyurdu” ağıllı məhəlləsi',
    city: 'khankendi',
    category: 'smart_village',
    lat: 39.8041,
    lng: 46.7463,
    builtInfoNote: 'demo',
    builtInfo: '2025–2026, ağıllı yaşayış kompleksi',
    shortDescription:
      'Ağıllı ev sistemləri ilə təchiz olunmuş yeni yaşayış məhəlləsi — qayıdan ailələr üçün.',
    history:
      '“Ağıllı kənd” konsepsiyasının şəhər modeli kimi salınan Xanyurdu məhəlləsində evlər günəş panelləri, ağıllı sayğaclar və fiber-optik şəbəkə ilə təchiz olunub. 2026-cı ildə məhəllə ilk 200 ailəni qəbul edib.',
    visibleFrom: 2025,
    timeline: {
      2025: { status: 'construction', note: 'Evlərin tikintisi davam edir' },
      2026: { status: 'active', note: 'İlk 200 ailə məskunlaşdı' }
    },
    audioGuide: {
      durationSec: 22,
      lines: [
        'Xanyurdu — texnologiya ilə ənənənin qovuşduğu məhəllədir.',
        'Hər evin enerji balansı mobil tətbiqdən izlənilir.',
        'Məhəllə məktəbi və tibb məntəqəsi ilə tam müstəqildir.'
      ]
    },
    tags: ['ağıllı kənd', 'yaşayış', 'qayıdış']
  }
];
