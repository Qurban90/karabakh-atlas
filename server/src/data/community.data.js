/**
 * Seed users, reviews, posts and check-ins. All people are fictional.
 *
 * Regular-user passwords are plaintext seed input, hashed at boot — they are
 * demo accounts by design. Staff accounts (admin/moderator) deliberately have
 * NO password here: they can delete anyone's content, so a password committed
 * to this repo would be a public backdoor. Their password always comes from
 * ADMIN_PASSWORD / MODERATOR_PASSWORD, or is randomly generated at seed time
 * (see store._passwordFor).
 */
export const usersSeed = [
  { id: 'u-admin', name: 'QDX Admin', email: 'admin@qdx.az', role: 'admin', avatarHue: 265, joinedAt: '2023-11-05T09:00:00Z' },
  { id: 'u-aysel', name: 'Aysel Məmmədova', email: 'aysel@demo.az', password: 'Demo123!', role: 'user', avatarHue: 32, joinedAt: '2024-02-14T10:30:00Z' },
  { id: 'u-tural', name: 'Tural Həsənov', email: 'tural@demo.az', password: 'Demo123!', role: 'user', avatarHue: 152, joinedAt: '2024-03-02T18:12:00Z' },
  { id: 'u-nigar', name: 'Nigar Əliyeva', email: 'nigar@demo.az', password: 'Demo123!', role: 'user', avatarHue: 200, joinedAt: '2024-05-21T12:00:00Z' },
  { id: 'u-resad', name: 'Rəşad Quliyev', email: 'resad@demo.az', password: 'Demo123!', role: 'user', avatarHue: 8, joinedAt: '2024-09-09T08:45:00Z' },
  { id: 'u-leyla', name: 'Leyla Səfərova', email: 'leyla@demo.az', role: 'moderator', avatarHue: 290, joinedAt: '2023-12-01T14:20:00Z' }
];

export const reviewsSeed = [
  { id: 'r-01', locationId: 'yuxari-govhar-aga', userId: 'u-aysel', rating: 5, text: 'Bərpa işi heyrətamizdir — minarələrin naxışları əsl sənət əsəridir. Axşam işıqlandırması ayrıca gözəllikdir.', visitYear: 2024, createdAt: '2024-06-11T16:40:00Z' },
  { id: 'r-02', locationId: 'yuxari-govhar-aga', userId: 'u-tural', rating: 5, text: 'Şuşaya hər gələn ilk buranı görməlidir. Bələdçinin danışdığı tarix insanı kövrəldir.', visitYear: 2024, createdAt: '2024-07-02T11:05:00Z' },
  { id: 'r-03', locationId: 'yuxari-govhar-aga', userId: 'u-nigar', rating: 4, text: 'Çox təsirli məkandır, sadəcə festival günlərində izdiham olur. Səhər saatlarında gedin.', visitYear: 2025, createdAt: '2025-05-14T09:20:00Z' },
  { id: 'r-04', locationId: 'cidir-duzu', userId: 'u-aysel', rating: 5, text: 'Xarıbülbül festivalında buradaydım — dağların qoynunda muğam dinləmək sözlə ifadə olunmur.', visitYear: 2024, createdAt: '2024-05-12T20:15:00Z' },
  { id: 'r-05', locationId: 'cidir-duzu', userId: 'u-resad', rating: 5, text: 'Gün batımında panorama möhtəşəmdir. Uşaqlarla piknik üçün də əla yerdir.', visitYear: 2025, createdAt: '2025-07-19T18:30:00Z' },
  { id: 'r-06', locationId: 'bulbul-ev-muzeyi', userId: 'u-nigar', rating: 5, text: 'Kiçik, amma çox səmimi muzeydir. Bülbülün səs yazıları qulaqlıqla dinlənilir — mütləq dinləyin.', visitYear: 2024, createdAt: '2024-08-03T13:00:00Z' },
  { id: 'r-07', locationId: 'bulbul-ev-muzeyi', userId: 'u-tural', rating: 4, text: 'Ekspozisiya zəngindir, bələdçi xanım çox bilgili idi. Şənbə günü növbə ola bilir.', visitYear: 2025, createdAt: '2025-04-26T15:45:00Z' },
  { id: 'r-08', locationId: 'vaqif-turbesi', userId: 'u-leyla', rating: 5, text: 'Poeziya günlərinə təsadüf etdim — türbənin önündə şeir dinləmək unudulmazdır.', visitYear: 2024, createdAt: '2024-09-28T17:10:00Z' },
  { id: 'r-09', locationId: 'xaribulbul-hotel', userId: 'u-resad', rating: 4, text: 'Otaqlar təmiz, xidmət yüksək səviyyədədir. Terasdan açılan mənzərə qiymətinə dəyər.', visitYear: 2025, createdAt: '2025-05-11T21:00:00Z' },
  { id: 'r-10', locationId: 'qarabag-universiteti', userId: 'u-tural', rating: 5, text: 'Açıq qapı günündə kampusu gəzdim. Laboratoriyalar ən müasir avadanlıqla təchiz olunub, tələbələr çox motivasiyalıdır.', visitYear: 2025, createdAt: '2025-03-15T12:30:00Z' },
  { id: 'r-11', locationId: 'xankendi-merkezi-meydani', userId: 'u-aysel', rating: 5, text: 'Axşam fəvvarə şousu çox gözəldir, ətrafda kafelər açılıb. Şəhərin dirçəlişini burada hiss edirsən.', visitYear: 2025, createdAt: '2025-06-07T19:50:00Z' },
  { id: 'r-12', locationId: 'xankendi-merkezi-meydani', userId: 'u-nigar', rating: 4, text: 'Geniş və səliqəli meydandır. Yay aylarında kölgəlik az olur, papaq götürün.', visitYear: 2025, createdAt: '2025-08-01T14:25:00Z' },
  { id: 'r-13', locationId: 'zefer-parki', userId: 'u-leyla', rating: 5, text: 'Uşaq meydançaları və velosiped yolları əladır. Xatirə guşəsi çox düşündürücüdür.', visitYear: 2025, createdAt: '2025-09-13T10:40:00Z' },
  { id: 'r-14', locationId: 'isa-bulagi', userId: 'u-resad', rating: 5, text: 'Meşənin içindən keçən yol ayrıca macəradır. Suyu buz kimidir, yanınıza qab götürün.', visitYear: 2025, createdAt: '2025-06-22T11:15:00Z' },
  { id: 'r-15', locationId: 'uzeyir-ev-muzeyi', userId: 'u-aysel', rating: 5, text: 'Üzeyir bəyin ev mühitini olduğu kimi hiss edirsən. Royal otağı xüsusilə təsirlidir.', visitYear: 2025, createdAt: '2025-07-30T16:05:00Z' },
  { id: 'r-16', locationId: 'shusha-qalasi', userId: 'u-tural', rating: 4, text: 'Divar boyu gəzinti marşrutu möhtəşəmdir. Bəzi hissələrdə hələ bərpa gedir, ehtiyatlı olun.', visitYear: 2025, createdAt: '2025-10-05T09:55:00Z' },
  { id: 'r-17', locationId: 'agdam-xankendi-yolu', userId: 'u-resad', rating: 5, text: 'Yol keyfiyyəti Avropa standartındadır, tunellər çox rahatdır. Yol boyu mənzərələr üçün dayanacaqlar da var.', visitYear: 2025, createdAt: '2025-11-18T08:20:00Z' },
  { id: 'r-18', locationId: 'xanyurdu-mehellesi', userId: 'u-nigar', rating: 5, text: 'Qonşuluğa köçən dostumu ziyarət etdim — evlərin ağıllı sistemləri real işləyir, məhəllə çox səliqəlidir.', visitYear: 2026, createdAt: '2026-07-09T17:35:00Z' }
];

export const postsSeed = [
  {
    id: 'p-01', userId: 'u-aysel', locationId: 'cidir-duzu',
    text: 'Xarıbülbül festivalından qayıtdım. Cıdır düzündə minlərlə insanla birlikdə “Qarabağ şikəstəsi”ni dinləmək... bu hissi sözlə yazmaq olmur. 🎶⛰️',
    createdAt: '2026-05-10T21:30:00Z',
    likes: ['u-tural', 'u-nigar', 'u-leyla', 'u-resad'],
    comments: [
      { id: 'c-01', userId: 'u-tural', text: 'Biz də ordaydıq! Gün batımı anı möhtəşəm idi.', createdAt: '2026-05-10T22:01:00Z' },
      { id: 'c-02', userId: 'u-leyla', text: 'Gələn il mütləq getməliyəm. Fotolar üçün təşəkkür!', createdAt: '2026-05-11T08:14:00Z' }
    ]
  },
  {
    id: 'p-02', userId: 'u-tural', locationId: 'qarabag-universiteti',
    text: 'Qarabağ Universitetində “Açıq qapı” günündə oldum. Robototexnika laboratoriyasında tələbələrin qurduğu dron layihəsi məni valeh etdi. Region üçün əsl gələcək burada yetişir. 🎓',
    createdAt: '2026-04-18T15:20:00Z',
    likes: ['u-aysel', 'u-leyla'],
    comments: [
      { id: 'c-03', userId: 'u-nigar', text: 'Bacım orada ikinci kursda oxuyur, çox razıdır!', createdAt: '2026-04-18T16:40:00Z' }
    ]
  },
  {
    id: 'p-03', userId: 'u-nigar', locationId: 'yuxari-govhar-aga',
    text: 'Səhər tezdən Yuxarı Gövhər Ağa məscidinin həyətində. Minarələrin kölgəsi daş döşəməyə düşəndə adam vaxtın necə keçdiyini unudur. Bərpa ustalarına min rəhmət. 🕌',
    createdAt: '2026-03-02T09:10:00Z',
    likes: ['u-aysel', 'u-resad', 'u-leyla'],
    comments: []
  },
  {
    id: 'p-04', userId: 'u-resad', locationId: 'agdam-xankendi-yolu',
    text: 'Bakıdan Şuşaya 4 saata çatdıq — yeni magistral əsl oyun dəyişdiricidir. Tunellərdən keçəndə uşaqlar pəncərədən əl çəkmirdi. 🚗',
    createdAt: '2026-06-21T19:45:00Z',
    likes: ['u-tural'],
    comments: [
      { id: 'c-04', userId: 'u-aysel', text: 'Yol boyu mənzərə dayanacaqlarında mütləq durun, çox gözəldir.', createdAt: '2026-06-21T20:30:00Z' }
    ]
  },
  {
    id: 'p-05', userId: 'u-leyla', locationId: 'zefer-parki',
    text: 'Zəfər parkında səhər qaçışı. Amfiteatrda axşam konsert olacaqdı, hazırlıq gedirdi. Xankəndi hər gün bir az da canlanır. 🌳',
    createdAt: '2026-07-14T07:55:00Z',
    likes: ['u-nigar', 'u-aysel'],
    comments: []
  },
  {
    id: 'p-06', userId: 'u-aysel', locationId: 'isa-bulagi',
    text: 'İsa bulağına piyada marşrutla qalxdıq. Meşə cığırı yenilənib, yol boyu istirahət guşələri var. Suyundan içməyən Şuşanı görməyib deyirlər. 💧',
    createdAt: '2026-06-28T13:05:00Z',
    likes: ['u-resad', 'u-tural', 'u-nigar'],
    comments: [
      { id: 'c-05', userId: 'u-resad', text: 'Ora gedən cığırda quş səsləri ayrı aləmdir.', createdAt: '2026-06-28T14:11:00Z' }
    ]
  },
  {
    id: 'p-07', userId: 'u-tural', locationId: 'xanyurdu-mehellesi',
    text: 'Xanyurdu məhəlləsində əmim ailəsinə baş çəkdik. Evin enerji sərfiyyatını telefondan izləyirlər, həyətdə günəş paneli. Qayıdış belə olur — müasir və rahat. 🏡',
    createdAt: '2026-07-30T18:25:00Z',
    likes: ['u-leyla', 'u-aysel'],
    comments: []
  },
  {
    id: 'p-08', userId: 'u-nigar',
    text: 'Bu həftə sonu üçün plan: səhər Xankəndi mərkəzi meydanı, günorta Qarabağ Universitetinin kampusu, axşam Şuşada Cıdır düzü. Kim qoşulur? 😄',
    createdAt: '2026-08-06T12:00:00Z',
    likes: ['u-aysel'],
    comments: [
      { id: 'c-06', userId: 'u-leyla', text: 'Mən varam! Zəfər parkını da siyahıya əlavə et.', createdAt: '2026-08-06T12:35:00Z' }
    ]
  }
];

export const checkinsSeed = [
  { id: 'ch-01', userId: 'u-aysel', locationId: 'cidir-duzu', method: 'gps', createdAt: '2026-05-10T20:00:00Z' },
  { id: 'ch-02', userId: 'u-aysel', locationId: 'yuxari-govhar-aga', method: 'gps', createdAt: '2026-05-11T10:30:00Z' },
  { id: 'ch-03', userId: 'u-aysel', locationId: 'isa-bulagi', method: 'manual', createdAt: '2026-06-28T12:40:00Z' },
  { id: 'ch-04', userId: 'u-tural', locationId: 'qarabag-universiteti', method: 'gps', createdAt: '2026-04-18T14:00:00Z' },
  { id: 'ch-05', userId: 'u-tural', locationId: 'xanyurdu-mehellesi', method: 'gps', createdAt: '2026-07-30T17:50:00Z' },
  { id: 'ch-06', userId: 'u-resad', locationId: 'agdam-xankendi-yolu', method: 'manual', createdAt: '2026-06-21T18:30:00Z' },
  { id: 'ch-07', userId: 'u-leyla', locationId: 'zefer-parki', method: 'gps', createdAt: '2026-07-14T07:30:00Z' }
];
