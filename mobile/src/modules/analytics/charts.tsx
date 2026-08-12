/** Lightweight hand-rolled SVG charts — no chart library, tiny bundle. */

export function BarChart({
  data,
  activeIndex,
  unit
}: {
  data: { label: string; value: number }[];
  activeIndex: number;
  unit: string;
}) {
  const W = 340;
  const H = 150;
  const pad = 8;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Sütun qrafiki (${unit})`}>
      {data.map((d, i) => {
        const h = ((H - 46) * d.value) / max;
        const x = pad + i * bw + bw * 0.18;
        const y = H - 24 - h;
        const active = i === activeIndex;
        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={bw * 0.64}
              height={h}
              rx={7}
              fill={active ? '#6D28D9' : '#DDD6FE'}
              style={{ transition: 'all 0.4s cubic-bezier(0.2,0.9,0.3,1)' }}
            />
            <text x={x + bw * 0.32} y={y - 7} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={active ? '#6D28D9' : '#94A3B8'}>
              {d.value.toLocaleString('az-AZ')}
            </text>
            <text x={x + bw * 0.32} y={H - 7} textAnchor="middle" fontSize={11} fontWeight={700} fill={active ? '#0F172A' : '#94A3B8'}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({
  data,
  activeIndex,
  color = '#059669'
}: {
  data: { label: string; value: number }[];
  activeIndex: number;
  color?: string;
}) {
  const W = 340;
  const H = 140;
  const padX = 26;
  const padY = 26;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const pts = data.map((d, i) => ({
    x: padX + (i * (W - padX * 2)) / Math.max(1, data.length - 1),
    y: H - padY - ((H - padY * 2) * d.value) / max
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const area = `${path} L${pts[pts.length - 1].x} ${H - 14} L${pts[0].x} ${H - 14} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Xətt qrafiki">
      <defs>
        <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#line-area)" />
      <path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={i === activeIndex ? 6 : 4} fill={i === activeIndex ? color : '#fff'} stroke={color} strokeWidth={2.5} />
          <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={i === activeIndex ? '#065F46' : '#94A3B8'}>
            {(data[i].value / 1000).toFixed(0)}k
          </text>
          <text x={p.x} y={H - 1} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={i === activeIndex ? '#0F172A' : '#94A3B8'}>
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Donut({
  segments,
  centerLabel
}: {
  segments: { value: number; color: string }[];
  centerLabel: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 46;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" style={{ width: 128, height: 128, flex: 'none' }} role="img" aria-label="Dairəvi qrafik">
      <circle cx={60} cy={60} r={R} fill="none" stroke="#EEF2F7" strokeWidth={15} />
      {segments.map((s, i) => {
        const len = (C * s.value) / total;
        const el = (
          <circle
            key={i}
            cx={60}
            cy={60}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={15}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 60 60)"
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
      <text x={60} y={56} textAnchor="middle" fontSize={22} fontWeight={900} fill="#0F172A">
        {total}
      </text>
      <text x={60} y={73} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#94A3B8">
        {centerLabel}
      </text>
    </svg>
  );
}
