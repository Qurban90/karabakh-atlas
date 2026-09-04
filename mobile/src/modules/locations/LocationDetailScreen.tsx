import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, CalendarClock, BookOpen, Landmark } from 'lucide-react';
import { locationsApi, passportApi } from '../../api/endpoints';
import type { LocationFull, Passport } from '../../api/types';
import { useApp, YEARS } from '../../store/app';
import { useAuth } from '../../store/auth';
import { cityLabels, statusMeta } from '../../utils/format';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { CheckInButton } from './CheckInButton';
import { ReviewsSection } from '../reviews/ReviewsSection';
import { AudioGuidePlayer } from '../../components/AudioGuide';
import { CatChip, ErrorState, Skeleton, Stars, StatusChip } from '../../components/ui';

export function LocationDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const year = useApp((s) => s.year);
  const user = useAuth((s) => s.user);

  const [item, setItem] = useState<LocationFull | null>(null);
  const [failed, setFailed] = useState(false);
  const [passport, setPassport] = useState<Passport | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setFailed(false);
    locationsApi
      .detail(id, year)
      .then(setItem)
      .catch(() => setFailed(true));
  }, [id, year]);

  const loadPassport = useCallback(() => {
    if (!user) {
      setPassport(null);
      return;
    }
    passportApi.get().then(setPassport).catch(() => setPassport(null));
  }, [user]);

  useEffect(load, [load]);
  useEffect(loadPassport, [loadPassport]);

  if (failed) {
    return (
      <div className="screen">
        <div style={{ paddingTop: 60 }}>
          <ErrorState onRetry={load} />
        </div>
      </div>
    );
  }

  if (!item || !id) {
    return (
      <div className="screen" style={{ padding: 0 }}>
        <Skeleton h={240} r={0} />
        <div className="page-pad" style={{ marginTop: 16 }}>
          <Skeleton h={120} r={16} />
          <Skeleton h={90} r={16} />
          <Skeleton h={160} r={16} />
        </div>
      </div>
    );
  }

  const visited = passport?.visited.some((v) => v.location.id === item.id) ?? false;

  return (
    <div className="screen fade-in">
      <div className="detail-hero">
        <button className="detail-hero__back" onClick={() => navigate(-1)} aria-label="Geri">
          <ChevronLeft size={20} />
        </button>
        <BeforeAfterSlider id={item.id} category={item.category} photos={item.photos} />
      </div>

      <div className="detail-body">
        <div className="card detail-title-card">
          <div className="name">{item.name}</div>
          <div className="meta-row">
            <CatChip category={item.category} />
            {item.status && <StatusChip status={item.status.status} />}
            <span className="built">
              <MapPin size={12} /> {cityLabels[item.city]}
            </span>
          </div>
          <div className="built" style={{ marginBottom: 10 }}>
            <CalendarClock size={13} /> {item.builtInfo}
          </div>
          <div className="rating-line">
            <span className="avg">{item.rating.count ? item.rating.average : '—'}</span>
            <Stars value={item.rating.average} size={15} />
            <span className="cnt">
              {item.rating.count ? `${item.rating.count} rəy` : 'hələ rəy yoxdur'} · {item.checkinCount} ziyarət qeydi
            </span>
          </div>
          <div style={{ marginTop: 13 }}>
            <CheckInButton locationId={item.id} visited={visited} onDone={loadPassport} />
          </div>
        </div>

        {/* per-year status timeline */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>
            <CalendarClock size={17} /> İllər üzrə dirçəliş
          </div>
          <div className="year-steps">
            {YEARS.map((y) => {
              const entry = item.timeline[String(y)];
              const meta = entry ? statusMeta[entry.status] : null;
              return (
                <div key={y} className={`year-step${y === year ? ' is-current' : ''}`}>
                  <div className="year-step__year">{y}</div>
                  <div
                    className="year-step__dot"
                    style={{ background: meta?.color ?? '#E2E8F0' }}
                    title={meta?.label}
                  />
                  <div className="year-step__note">{entry ? entry.note : '—'}</div>
                </div>
              );
            })}
          </div>
        </div>

        <AudioGuidePlayer guide={item.audioGuide} locationName={item.name} />

        <div className="card">
          <div className="section-title" style={{ marginBottom: 10 }}>
            <BookOpen size={17} /> Tarixçə
          </div>
          <p className="history-text">{item.history}</p>
          {item.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {item.tags.map((tag) => (
                <span key={tag} className="status-chip">
                  <Landmark size={11} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <ReviewsSection locationId={item.id} />
      </div>
    </div>
  );
}
