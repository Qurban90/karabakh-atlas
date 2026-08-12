import { useEffect, useRef, useState } from 'react';
import { Play, Pause, History } from 'lucide-react';
import { useApp, YEARS } from '../../store/app';

/** “Zaman səyahəti” — 2023–2026 slider; play sweeps the years automatically. */
export function TimelineSlider({ count }: { count: number }) {
  const year = useApp((s) => s.year);
  const setYear = useApp((s) => s.setYear);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      const current = useApp.getState().year;
      const next = current >= 2026 ? 2023 : current + 1;
      setYear(next);
    }, 1400);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, setYear]);

  const fillPct = ((year - 2023) / 3) * 100;

  return (
    <div className="timeline-card">
      <div className="timeline-card__head">
        <div>
          <div className="timeline-card__label">
            <History size={12} /> Zaman səyahəti · {count} obyekt
          </div>
          <div className="timeline-card__year">{year}</div>
        </div>
        <button
          className={`timeline-card__play${playing ? ' is-playing' : ''}`}
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Dayandır' : 'İlləri canlandır'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
        </button>
      </div>
      <input
        className="timeline-range"
        type="range"
        min={2023}
        max={2026}
        step={1}
        value={year}
        style={{ ['--fill' as string]: `${fillPct}%` }}
        onChange={(e) => {
          setPlaying(false);
          setYear(Number(e.target.value));
        }}
        aria-label="Timeline ili"
      />
      <div className="timeline-ticks">
        {YEARS.map((y) => (
          <button
            key={y}
            className={`timeline-tick${y === year ? ' is-active' : ''}`}
            onClick={() => {
              setPlaying(false);
              setYear(y);
            }}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
