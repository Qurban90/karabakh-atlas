import { store } from '../../store.js';

export const YEARS = [2023, 2024, 2025, 2026];
export const CATEGORIES = ['heritage', 'infrastructure', 'energy_roads', 'culture_tourism', 'education', 'smart_village'];
export const CITIES = ['shusha', 'khankendi'];

/** Effective status of a location at a given year (last defined ≤ year). */
export function statusAt(location, year) {
  let result = null;
  for (const y of YEARS) {
    if (y > year) break;
    if (location.timeline[y]) result = { year: y, ...location.timeline[y] };
  }
  return result;
}

/** API projection of a location. `year` drives status; `full` adds heavy fields. */
export function serializeLocation(location, { year = 2026, full = false } = {}) {
  const rating = store.ratingFor(location.id);
  const checkinCount = [...store.checkins.values()].filter((c) => c.locationId === location.id).length;
  const base = {
    id: location.id,
    name: location.name,
    city: location.city,
    category: location.category,
    lat: location.lat,
    lng: location.lng,
    shortDescription: location.shortDescription,
    builtInfo: location.builtInfo,
    visibleFrom: location.visibleFrom,
    tags: location.tags,
    status: statusAt(location, year),
    rating,
    checkinCount
  };
  if (!full) return base;
  return { ...base, history: location.history, timeline: location.timeline, audioGuide: location.audioGuide };
}

export function filterLocations({ year, category, city, q }) {
  let list = [...store.locations.values()];
  if (year) list = list.filter((l) => l.visibleFrom <= year);
  if (category) list = list.filter((l) => l.category === category);
  if (city) list = list.filter((l) => l.city === city);
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(
      (l) =>
        l.name.toLowerCase().includes(needle) ||
        l.shortDescription.toLowerCase().includes(needle) ||
        l.tags.some((t) => t.toLowerCase().includes(needle))
    );
  }
  return list;
}
