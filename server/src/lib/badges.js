/** “Dirçəliş Könüllüsü” gamification — badge definitions + evaluation. */

export const badgeDefs = [
  { id: 'ilk-addim', name: 'İlk Addım', description: 'İlk məkan qeydiyyatını et', icon: 'footprints', criteria: { type: 'checkins', count: 1 } },
  { id: 'susa-tedqiqatcisi', name: 'Şuşa Tədqiqatçısı', description: 'Şuşada 5 fərqli məkanda qeydiyyatdan keç', icon: 'castle', criteria: { type: 'checkins_city', city: 'shusha', count: 5 } },
  { id: 'xankendi-beledcisi', name: 'Xankəndi Bələdçisi', description: 'Xankəndidə 4 fərqli məkanda qeydiyyatdan keç', icon: 'building', criteria: { type: 'checkins_city', city: 'khankendi', count: 4 } },
  { id: 'medeniyyet-qoruyucusu', name: 'Mədəniyyət Qoruyucusu', description: 'Tarixi irs məkanlarına 3 rəy yaz', icon: 'landmark', criteria: { type: 'reviews_category', category: 'heritage', count: 3 } },
  { id: 'dircelis-sahidi', name: 'Dirçəliş Şahidi', description: '10 fərqli məkanda qeydiyyatdan keç', icon: 'flag', criteria: { type: 'checkins', count: 10 } },
  { id: 'feal-icmaci', name: 'Fəal İcmaçı', description: 'Lentdə 5 paylaşım və ya şərh et', icon: 'users', criteria: { type: 'social', count: 5 } },
  { id: 'dircelis-konullusu', name: 'Dirçəliş Könüllüsü', description: 'Ən azı 4 nişan qazan', icon: 'award', criteria: { type: 'meta', count: 4 } }
];

/** Returns every badge with earned flag + progress for the given user. */
export function computeBadges(userId, store) {
  const checkins = store.checkinsForUser(userId);
  const visited = new Set(checkins.map((c) => c.locationId));
  const reviews = [...store.reviews.values()].filter((r) => r.userId === userId);
  const posts = [...store.posts.values()].filter((p) => p.userId === userId);
  const comments = [...store.posts.values()].flatMap((p) => p.comments.filter((c) => c.userId === userId));

  const cityVisited = (city) =>
    [...visited].filter((locId) => store.locations.get(locId)?.city === city).length;

  const progressOf = (criteria) => {
    switch (criteria.type) {
      case 'checkins':
        return visited.size;
      case 'checkins_city':
        return cityVisited(criteria.city);
      case 'reviews_category':
        return reviews.filter((r) => store.locations.get(r.locationId)?.category === criteria.category).length;
      case 'social':
        return posts.length + comments.length;
      default:
        return 0;
    }
  };

  const base = badgeDefs
    .filter((b) => b.criteria.type !== 'meta')
    .map((b) => {
      const current = Math.min(progressOf(b.criteria), b.criteria.count);
      return { ...b, earned: current >= b.criteria.count, progress: { current, target: b.criteria.count } };
    });

  const earnedCount = base.filter((b) => b.earned).length;
  const meta = badgeDefs
    .filter((b) => b.criteria.type === 'meta')
    .map((b) => ({
      ...b,
      earned: earnedCount >= b.criteria.count,
      progress: { current: Math.min(earnedCount, b.criteria.count), target: b.criteria.count }
    }));

  return [...base, ...meta];
}
