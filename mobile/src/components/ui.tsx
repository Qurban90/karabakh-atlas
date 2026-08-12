import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Star, CloudOff, RefreshCw } from 'lucide-react';
import type { Category, PublicUser, StatusKind } from '../api/types';
import { categoryColors, categoryLabels, initials, statusMeta } from '../utils/format';

/* ── Avatar ── */
export function Avatar({ user, size }: { user: PublicUser; size?: number }) {
  const style = {
    background: `linear-gradient(135deg, hsl(${user.avatarHue} 70% 52%), hsl(${(user.avatarHue + 40) % 360} 72% 40%))`,
    ...(size ? { width: size, height: size, fontSize: size * 0.34 } : {})
  };
  return (
    <div className="avatar" style={style} aria-hidden>
      {initials(user.name)}
    </div>
  );
}

/* ── Stars (display) ── */
export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(value) ? '#F59E0B' : '#E2E8F0'}
          color={i <= Math.round(value) ? '#F59E0B' : '#CBD5E1'}
        />
      ))}
    </span>
  );
}

/* ── Stars (input) ── */
export function StarsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="stars stars--input" role="radiogroup" aria-label="Qiymət">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} aria-label={`${i} ulduz`}>
          <Star size={28} fill={i <= value ? '#F59E0B' : '#EEF2F7'} color={i <= value ? '#F59E0B' : '#CBD5E1'} />
        </button>
      ))}
    </div>
  );
}

/* ── Status / category chips ── */
export function StatusChip({ status }: { status: StatusKind }) {
  const meta = statusMeta[status];
  return (
    <span className="status-chip">
      <span className="status-chip__dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

export function CatChip({ category }: { category: Category }) {
  return (
    <span className="cat-chip" style={{ background: categoryColors[category] }}>
      {categoryLabels[category]}
    </span>
  );
}

/* ── Skeleton ── */
export function Skeleton({ h, w, r, style }: { h: number; w?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ height: h, width: w ?? '100%', borderRadius: r, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Skeleton h={38} w={38} r={19} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton h={12} w="45%" />
          <Skeleton h={10} w="28%" />
        </div>
      </div>
      <Skeleton h={12} />
      <Skeleton h={12} w="82%" />
      <Skeleton h={140} r={13} />
    </div>
  );
}

/* ── Empty / error states ── */
export function EmptyState({
  icon,
  title,
  text,
  action
}: {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="state fade-in">
      <div className="state__icon">{icon}</div>
      <div className="state__title">{title}</div>
      {text && <div className="state__text">{text}</div>}
      {action}
    </div>
  );
}

export function ErrorState({ onRetry, text }: { onRetry?: () => void; text?: string }) {
  return (
    <div className="state fade-in">
      <div className="state__icon" style={{ background: '#fee2e2', color: '#e11d48' }}>
        <CloudOff size={30} />
      </div>
      <div className="state__title">Məlumat yüklənmədi</div>
      <div className="state__text">{text ?? 'Server əlçatan deyil və ya şəbəkə xətası baş verdi.'}</div>
      {onRetry && (
        <button className="btn btn--primary btn--sm" onClick={onRetry}>
          <RefreshCw size={15} /> Yenidən cəhd et
        </button>
      )}
    </div>
  );
}

/* ── Progress ring ── */
export function ProgressRing({ percent, size = 84 }: { percent: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = c * Math.min(100, Math.max(0, percent)) / 100;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff2e" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#FBBF24"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.2,0.9,0.3,1)' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.24}
        fontWeight={900}
        fill="#fff"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

/* ── Animated number ── */
export function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const dur = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{format ? format(display) : display.toLocaleString('az-AZ')}</>;
}
