import { useCallback, useEffect, useState } from 'react';
import {
  Route,
  Zap,
  Landmark,
  Users,
  School,
  Home,
  TrendingUp,
  Activity,
  PieChart,
  HeartHandshake
} from 'lucide-react';
import { analyticsApi, timelineApi } from '../../api/endpoints';
import type { RevivalIndex, TimelineEvent } from '../../api/types';
import { useApp, YEARS } from '../../store/app';
import { categoryColors, categoryLabels, formatNumber, monthName } from '../../utils/format';
import { AnimatedNumber, ErrorState, Skeleton } from '../../components/ui';
import { BarChart, Donut, LineChart } from './charts';
import type { Category } from '../../api/types';

export function AnalyticsScreen() {
  const year = useApp((s) => s.year);
  const setYear = useApp((s) => s.setYear);
  const [data, setData] = useState<RevivalIndex | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    Promise.all([analyticsApi.revivalIndex(), timelineApi.list()])
      .then(([index, tl]) => {
        setData(index);
        setEvents(tl.items);
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(load, [load]);

  const yearIndex = YEARS.indexOf(year as (typeof YEARS)[number]);
  const current = data?.years.find((y) => y.year === year) ?? data?.latest;
  const statusRow = data?.statusByYear.find((s) => s.year === year);
  const yearEvents = events.filter((e) => e.year === year);

  return (
    <div className="screen">
      <header className="topbar">
        <img src="/icon.svg" alt="" className="topbar__logo" />
        <div style={{ flex: 1 }}>
          <div className="topbar__title">Dirçəliş İndeksi</div>
          <div className="topbar__subtitle">Regionun bərpası rəqəmlərlə (demo məlumat)</div>
        </div>
      </header>

      <div className="chips" style={{ marginBottom: 10 }}>
        {YEARS.map((y) => (
          <button key={y} className={`chip${y === year ? ' is-active' : ''}`} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>

      {failed && <ErrorState onRetry={load} />}

      {!failed && !data && (
        <div className="page-pad">
          <div className="stats-grid" style={{ padding: 0 }}>
            <Skeleton h={110} r={16} />
            <Skeleton h={110} r={16} />
            <Skeleton h={110} r={16} />
            <Skeleton h={110} r={16} />
          </div>
          <Skeleton h={200} r={16} />
          <Skeleton h={180} r={16} />
        </div>
      )}

      {data && current && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="stats-grid">
            <StatCard icon={<Route size={18} />} tint="#EDE9FE" color="#6D28D9" value={current.roadsKm} unit="km" label="Yenidən qurulan yollar" />
            <StatCard icon={<Zap size={18} />} tint="#FEF3C7" color="#B45309" value={current.greenEnergyMW} unit="MVt" label="Yaşıl enerji gücü" />
            <StatCard icon={<Landmark size={18} />} tint="#D1FAE5" color="#047857" value={current.monumentsRestored} unit="abidə" label="Bərpa olunan abidələr" />
            <StatCard icon={<Users size={18} />} tint="#E0F2FE" color="#0369A1" value={current.residentsReturned} unit="nəfər" label="Qayıdan sakinlər" />
          </div>

          <div className="card chart-card">
            <div className="section-title" style={{ marginBottom: 8 }}>
              <TrendingUp size={17} /> Yol infrastrukturu (km)
            </div>
            <BarChart
              data={data.years.map((y) => ({ label: String(y.year), value: y.roadsKm }))}
              activeIndex={yearIndex}
              unit="km"
            />
          </div>

          <div className="card chart-card">
            <div className="section-title" style={{ marginBottom: 8 }}>
              <HeartHandshake size={17} /> Böyük Qayıdış — sakinlər
            </div>
            <LineChart
              data={data.years.map((y) => ({ label: String(y.year), value: y.residentsReturned }))}
              activeIndex={yearIndex}
            />
          </div>

          {statusRow && (
            <div className="card chart-card">
              <div className="section-title">
                <Activity size={17} /> Xəritə obyektlərinin statusu · {year}
              </div>
              <div className="seg-bar">
                <div style={{ width: `${((statusRow.active + statusRow.restored) / statusRow.total) * 100}%`, background: '#10B981' }} />
                <div style={{ width: `${(statusRow.inProgress / statusRow.total) * 100}%`, background: '#F59E0B' }} />
                <div style={{ width: `${(statusRow.damaged / statusRow.total) * 100}%`, background: '#94A3B8' }} />
                <div style={{ width: `${(statusRow.planned / statusRow.total) * 100}%`, background: '#C4B5FD' }} />
              </div>
              <div className="chart-legend">
                <span className="chart-legend__item"><span className="chip__dot" style={{ background: '#10B981' }} /> Fəaliyyətdə · {statusRow.active + statusRow.restored}</span>
                <span className="chart-legend__item"><span className="chip__dot" style={{ background: '#F59E0B' }} /> Bərpa gedir · {statusRow.inProgress}</span>
                <span className="chart-legend__item"><span className="chip__dot" style={{ background: '#94A3B8' }} /> Gözləyir · {statusRow.damaged}</span>
                <span className="chart-legend__item"><span className="chip__dot" style={{ background: '#C4B5FD' }} /> Plan · {statusRow.planned}</span>
              </div>
            </div>
          )}

          <div className="card chart-card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Donut
              segments={data.byCategory.map((c) => ({ value: c.count, color: categoryColors[c.category as Category] }))}
              centerLabel="obyekt"
            />
            <div className="chart-legend" style={{ flexDirection: 'column', gap: 7, marginTop: 0 }}>
              {data.byCategory.map((c) => (
                <span key={c.category} className="chart-legend__item">
                  <span className="chip__dot" style={{ background: categoryColors[c.category as Category] }} />
                  {categoryLabels[c.category as Category]} · {c.count}
                </span>
              ))}
            </div>
          </div>

          {yearEvents.length > 0 && (
            <div className="card chart-card">
              <div className="section-title" style={{ marginBottom: 12 }}>
                <PieChart size={17} /> {year} — əsas hadisələr
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {yearEvents.map((e) => (
                  <div key={e.id} style={{ display: 'flex', gap: 11 }}>
                    <span
                      className="status-chip"
                      style={{ flex: 'none', alignSelf: 'flex-start', background: 'var(--c-primary-soft)', color: 'var(--c-primary)' }}
                    >
                      {monthName(e.month)}
                    </span>
                    <div>
                      <div style={{ fontSize: 13.2, fontWeight: 800 }}>{e.title}</div>
                      <div style={{ fontSize: 12.2, color: 'var(--c-muted)', lineHeight: 1.5, marginTop: 2 }}>{e.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card chart-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
            <MiniStat icon={<School size={15} />} value={current.schools} label="Məktəb" />
            <MiniStat icon={<Home size={15} />} value={current.homes} label="Mənzil" />
            <MiniStat icon={<Users size={15} />} value={data.community.users} label="İstifadəçi" />
            <MiniStat icon={<Activity size={15} />} value={data.community.checkins} label="Ziyarət" />
          </div>
          <div className="mini-note" style={{ padding: '0 20px 6px', textAlign: 'center' }}>
            Göstəricilər “Böyük Qayıdış” proqramının açıq məlumatları əsasında hazırlanmış demo datadır.
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  tint,
  color,
  value,
  unit,
  label
}: {
  icon: React.ReactNode;
  tint: string;
  color: string;
  value: number;
  unit: string;
  label: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" style={{ background: tint, color }}>
        {icon}
      </div>
      <div className="stat-card__value">
        <AnimatedNumber value={value} format={formatNumber} />
        <span>{unit}</span>
      </div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div>
      <div style={{ color: 'var(--c-primary)', marginBottom: 3 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 900 }}>
        <AnimatedNumber value={value} format={formatNumber} />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-faint)' }}>{label}</div>
    </div>
  );
}
