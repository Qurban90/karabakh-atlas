import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationItem } from '../../api/types';
import { pinIcon, clusterIcon } from './markerIcons';

const CENTER: L.LatLngExpression = [39.795, 46.762]; // between Şuşa & Xankəndi
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
      maxZoom: 17,
      zoomControl: false,
      attributionControl: true
    });
    map.attributionControl.setPrefix(false);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

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

  return <div ref={divRef} className="map-canvas" />;
}
