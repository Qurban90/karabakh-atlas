import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationItem } from '../../api/types';
import { pinIcon, clusterIcon } from './markerIcons';

const CENTER: L.LatLngExpression = [39.795, 46.762]; // between Şuşa & Xankəndi

type MapView = 'hybrid' | 'satellite' | 'street';

const VIEWS: { id: MapView; label: string }[] = [
  { id: 'hybrid', label: 'Hibrid' },
  { id: 'satellite', label: 'Peyk' },
  { id: 'street', label: 'Xəritə' }
];
const CLUSTER_BELOW_ZOOM = 13;
const CELL_PX = 90;

interface Cluster {
  lat: number;
  lng: number;
  items: LocationItem[];
}

/** Simple grid clustering in projected pixel space — O(n), no plugin needed. */
function clusterize(map: L.Map, locations: LocationItem[]): Cluster[] {
  const zoom = map.getZoom();
  const cells = new Map<string, Cluster>();
  for (const loc of locations) {
    const pt = map.project([loc.lat, loc.lng], zoom);
    const key = `${Math.floor(pt.x / CELL_PX)}:${Math.floor(pt.y / CELL_PX)}`;
    const cell = cells.get(key);
    if (cell) {
      cell.items.push(loc);
    } else {
      cells.set(key, { lat: loc.lat, lng: loc.lng, items: [loc] });
    }
  }
  // center each cluster on its members' mean position
  for (const cell of cells.values()) {
    cell.lat = cell.items.reduce((a, l) => a + l.lat, 0) / cell.items.length;
    cell.lng = cell.items.reduce((a, l) => a + l.lng, 0) / cell.items.length;
  }
  return [...cells.values()];
}

export function LeafletMap({
  locations,
  onSelect
}: {
  locations: LocationItem[];
  onSelect: (loc: LocationItem) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const basemapsRef = useRef<{
    imagery: L.TileLayer;
    street: L.TileLayer;
    roads: L.TileLayer;
    places: L.TileLayer;
  } | null>(null);
  const [view, setView] = useState<MapView>('hybrid');
  const locationsRef = useRef(locations);
  const onSelectRef = useRef(onSelect);
  locationsRef.current = locations;
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, {
      center: CENTER,
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true
    });
    map.attributionControl.setPrefix(false);
    // Basemap. openstreetmap.org's own tiles are volunteer-run and block
    // applications; CARTO watermarks keyless use. Esri's services are open and
    // need no API key. Imagery is the default because the terrain of Susha and
    // Khankendi is the point; the street view stays one tap away.
    const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
    const imagery = L.tileLayer(`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, {
      attribution: '© Esri · Maxar · Earthstar Geographics',
      maxZoom: 18
    });
    const street = L.tileLayer(`${ESRI}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`, {
      attribution: '© Esri · © OpenStreetMap',
      maxZoom: 18
    });
    // Roads and place names as transparent overlays, so the imagery still
    // reads as a map. They ride above the basemap and below the pins.
    const roads = L.tileLayer(`${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`, {
      maxZoom: 18,
      opacity: 0.9
    });
    const places = L.tileLayer(`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`, {
      maxZoom: 18
    });

    basemapsRef.current = { imagery, street, roads, places };
    imagery.addTo(map);
    roads.addTo(map);
    places.addTo(map);

    // If a provider starts refusing tiles the map must not go blank.
    let tileErrors = 0;
    imagery.on('tileerror', () => {
      tileErrors += 1;
      if (tileErrors > 6 && map.hasLayer(imagery)) {
        map.removeLayer(imagery);
        street.addTo(map);
      }
    });

    const layer = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = layer;

    const render = () => renderMarkers();
    map.on('zoomend', render);
    setTimeout(() => map.invalidateSize(), 60);

    return () => {
      map.off('zoomend', render);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMarkers() {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const list = locationsRef.current;

    if (map.getZoom() < CLUSTER_BELOW_ZOOM) {
      for (const cluster of clusterize(map, list)) {
        if (cluster.items.length === 1) {
          addPin(layer, cluster.items[0]);
        } else {
          const shusha = cluster.items.filter((l) => l.city === 'shusha').length;
          const label = shusha > cluster.items.length / 2 ? 'Şuşa' : 'Xankəndi';
          const marker = L.marker([cluster.lat, cluster.lng], {
            icon: clusterIcon(cluster.items.length, label)
          });
          marker.on('click', () => {
            const bounds = L.latLngBounds(cluster.items.map((l) => [l.lat, l.lng] as [number, number]));
            map.flyToBounds(bounds.pad(0.35), { maxZoom: 15, duration: 0.6 });
          });
          layer.addLayer(marker);
        }
      }
    } else {
      for (const loc of list) addPin(layer, loc);
    }
  }

  function addPin(layer: L.LayerGroup, loc: LocationItem) {
    const marker = L.marker([loc.lat, loc.lng], { icon: pinIcon(loc), title: loc.name });
    marker.on('click', () => onSelectRef.current(loc));
    layer.addLayer(marker);
  }

  // re-render markers when the filtered list changes
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // basemap switching
  useEffect(() => {
    const map = mapRef.current;
    const b = basemapsRef.current;
    if (!map || !b) return;
    const wanted = view === 'street' ? b.street : b.imagery;
    const unwanted = view === 'street' ? b.imagery : b.street;
    if (map.hasLayer(unwanted)) map.removeLayer(unwanted);
    if (!map.hasLayer(wanted)) wanted.addTo(map);
    for (const overlay of [b.roads, b.places]) {
      const on = view !== 'satellite';
      if (on && !map.hasLayer(overlay)) overlay.addTo(map);
      if (!on && map.hasLayer(overlay)) map.removeLayer(overlay);
    }
  }, [view]);

  return (
    <div className="map-shell">
      <div ref={divRef} className="map-canvas" />
      <div className="map-views" role="group" aria-label="Xəritə görünüşü">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`map-views__btn${view === v.id ? ' is-on' : ''}`}
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
