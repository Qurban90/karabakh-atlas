import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, X } from 'lucide-react';
import { locationsApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import type { Category, City, LocationItem } from '../../api/types';
import { useApp } from '../../store/app';
import { toast } from '../../store/toast';
import { categoryColors, categoryLabels, cityLabels, statusMeta } from '../../utils/format';
import { LeafletMap } from './LeafletMap';
import { TimelineSlider } from './TimelineSlider';
import { Sheet } from '../../components/Sheet';
import { LocationImage } from '../../components/LocationImage';
import { CatChip, StatusChip, Stars } from '../../components/ui';

const CITY_OPTIONS: { value: City | null; label: string }[] = [
  { value: null, label: 'Hamısı' },
  { value: 'shusha', label: 'Şuşa' },
  { value: 'khankendi', label: 'Xankəndi' }
];

const CATEGORY_OPTIONS = Object.keys(categoryLabels) as Category[];

export function MapScreen() {
  const navigate = useNavigate();
  const { year, category, city, query, setCategory, setCity, setQuery } = useApp();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LocationItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(() => {
    setLoading(true);
    locationsApi
      .list({
        year,
        category: category ?? undefined,
        city: city ?? undefined,
        q: debouncedQuery || undefined
      })
      .then((res) => setLocations(res.items))
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [year, category, city, debouncedQuery]);

  useEffect(load, [load]);

  // keep the open preview in sync with the year slider
  const selectedCurrent = useMemo(
    () => (selected ? locations.find((l) => l.id === selected.id) ?? null : null),
    [selected, locations]
  );
  const preview = selectedCurrent ?? selected;

  return (
    <div className="map-screen">
      <LeafletMap locations={locations} onSelect={setSelected} />

      <div className="map-overlay-top">
        <div className="map-header">
          {searchOpen ? (
            <div className="map-search">
              <Search size={16} color="#94A3B8" />
              <input
                autoFocus
                placeholder="Məkan axtar… (məs. Cıdır düzü)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery('');
                }}
                aria-label="Axtarışı bağla"
              >
                <X size={16} color="#64748B" />
              </button>
            </div>
          ) : (
            <>
              <img src="/icon.svg" alt="" className="map-header__logo" />
              <div style={{ flex: 1 }}>
                <div className="map-header__name">Qarabağ Dirçəliş Xəritəsi</div>
                <div className="map-header__tag">Şuşa · Xankəndi · 2023–2026</div>
              </div>
              <button className="topbar__back" onClick={() => setSearchOpen(true)} aria-label="Axtarış">
                <Search size={17} />
              </button>
            </>
          )}
        </div>

        <div className="chips">
          {CITY_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className={`chip${city === opt.value ? ' is-active' : ''}`}
              onClick={() => setCity(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <span style={{ flex: 'none', width: 1, background: 'var(--c-line)', margin: '4px 2px' }} />
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              className={`chip${category === cat ? ' is-active' : ''}`}
              onClick={() => setCategory(category === cat ? null : cat)}
            >
              <span className="chip__dot" style={{ background: categoryColors[cat] }} />
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="map-legend" aria-hidden>
        <div className="map-legend__row">
          <span className="map-legend__dot" style={{ background: '#94A3B8' }} /> Bərpa gözləyir
        </div>
        <div className="map-legend__row">
          <span className="map-legend__dot" style={{ background: '#F59E0B' }} /> Bərpa gedir
        </div>
        <div className="map-legend__row">
          <span className="map-legend__dot" style={{ background: '#10B981' }} /> Fəaliyyətdə
        </div>
      </div>

      <div className="map-count-pill">
        {loading ? 'Yüklənir…' : `${locations.length} obyekt · ${year}`}
      </div>

      <TimelineSlider count={locations.length} />

      {preview && (
        <Sheet onClose={() => setSelected(null)}>
          <div className="preview__art">
            <LocationImage
              id={preview.id}
              category={preview.category}
              photos={preview.photos}
              height={170}
              showCredit={false}
            />
            <div className="preview__badges">
              <CatChip category={preview.category} />
            </div>
          </div>
          <div className="preview__title">{preview.name}</div>
          <div className="preview__meta">
            <MapPin size={13} />
            {cityLabels[preview.city]}
            {preview.status && <StatusChip status={preview.status.status} />}
            {preview.rating.count > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Star size={13} fill="#F59E0B" color="#F59E0B" /> {preview.rating.average}
                <span style={{ color: 'var(--c-faint)' }}>({preview.rating.count})</span>
              </span>
            )}
          </div>
          <div className="preview__desc">
            {preview.status?.note && (
              <span style={{ fontWeight: 700, color: statusMeta[preview.status.status].color }}>
                {year}: {preview.status.note}.{' '}
              </span>
            )}
            {preview.shortDescription}
          </div>
          <div className="preview__actions">
            <button className="btn btn--primary btn--block" onClick={() => navigate(`/location/${preview.id}`)}>
              Ətraflı bax
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
