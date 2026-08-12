import L from 'leaflet';
import type { Category, LocationItem } from '../../api/types';
import { categoryColors, statusMeta } from '../../utils/format';

/** White 24×24 glyphs per category (raw paths — divIcon renders plain HTML). */
const GLYPHS: Record<Category, string> = {
  heritage:
    '<path d="M12 2.5l8.5 5v1.7H3.5V7.5l8.5-5zM5 11h2.4v6.5H5V11zm4.3 0h2.4v6.5H9.3V11zm4.3 0H16v6.5h-2.4V11zm4.3 0H20v6.5h-2.1V11zM3.5 19h17v2.3h-17V19z"/>',
  infrastructure:
    '<path d="M4.5 3h9.5v18H4.5V3zm2.3 3.2h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4.4-8h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zM15.5 9h4.8v12h-4.8V9zm1.4 2.4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>',
  energy_roads: '<path d="M13.2 2L4 14.2h6.1L9 22l9.3-12.2h-6.2l1.1-7.8z"/>',
  culture_tourism:
    '<path d="M14 7.2L21 19H7l7-11.8z"/><path d="M7.2 11.5L11.6 19H2.5l4.7-7.5z"/><circle cx="6.2" cy="6" r="2.3"/>',
  education:
    '<path d="M12 3L1.5 7.8 12 12.6l8.6-3.9v5.6h1.9V7.8L12 3zM5 13v3.8c0 1.6 3 3 7 3s7-1.4 7-3V13l-7 3.2L5 13z"/>',
  smart_village: '<path d="M12 3.2l8.8 7.8h-2.9v9.5h-4.4v-6h-3v6H6.1V11H3.2L12 3.2z"/>'
};

export function pinIcon(loc: LocationItem): L.DivIcon {
  const catColor = categoryColors[loc.category];
  const status = loc.status?.status ?? 'active';
  const meta = statusMeta[status];
  return L.divIcon({
    className: 'qdx-pin',
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    html: `
      <div class="qdx-pin__wrap">
        <svg class="qdx-pin__body" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.6 0 0 7.4 0 16.5 0 28 17 42 17 42s17-14 17-25.5C34 7.4 26.4 0 17 0z" fill="${catColor}"/>
          <circle cx="17" cy="14" r="12" fill="#ffffff26"/>
        </svg>
        <span class="qdx-pin__glyph"><svg viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">${GLYPHS[loc.category]}</svg></span>
        <span class="qdx-pin__status${meta.pulse ? ' qdx-pin__status--pulse' : ''}" style="background:${meta.color}"></span>
      </div>`
  });
}

export function clusterIcon(count: number, label: string): L.DivIcon {
  return L.divIcon({
    className: 'qdx-cluster',
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    html: `
      <div class="qdx-cluster__bubble">
        <div>
          <div class="qdx-cluster__count">${count}</div>
          <div class="qdx-cluster__label">${label}</div>
        </div>
      </div>`
  });
}
