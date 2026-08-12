import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Headphones } from 'lucide-react';
import type { AudioGuide as AudioGuideData } from '../api/types';
import { formatDuration } from '../utils/format';

/**
 * “Səsli bələdçi” — simulated audio stream. A soft WebAudio pad plays while
 * transcript lines light up karaoke-style; a chime marks each new line.
 * No audio files needed → works offline and keeps the bundle tiny.
 */
export function AudioGuidePlayer({ guide, locationName }: { guide: AudioGuideData; locationName: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1

  const ctxRef = useRef<AudioContext | null>(null);
  const stopFnRef = useRef<(() => void) | null>(null);
  const rafRef = useRef(0);
  const elapsedRef = useRef(0); // seconds already played
  const startedAtRef = useRef(0);
  const lastLineRef = useRef(-1);

  const duration = guide.durationSec;
  const totalChars = guide.lines.reduce((acc, l) => acc + l.length, 0) || 1;
  const lineEnds: number[] = [];
  let acc = 0;
  for (const line of guide.lines) {
    acc += (line.length / totalChars) * duration;
    lineEnds.push(acc);
  }
  const currentLine = lineEnds.findIndex((end) => progress * duration < end);

  function buildAudio() {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(master);

    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 196; // G3
    const gainA = ctx.createGain();
    gainA.gain.value = 0.5;
    oscA.connect(gainA).connect(filter);

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.value = 294; // D4 — gentle fifth
    const gainB = ctx.createGain();
    gainB.gain.value = 0.22;
    oscB.connect(gainB).connect(filter);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.18;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain).connect(master.gain);

    oscA.start();
    oscB.start();
    lfo.start();
    master.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.8);

    const chime = () => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 880;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.connect(g).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    };

    const stop = () => {
      try {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        setTimeout(() => {
          oscA.stop();
          oscB.stop();
          lfo.stop();
          ctx.close();
        }, 350);
      } catch {
        /* already closed */
      }
    };

    return { ctx, stop, chime };
  }

  const chimeRef = useRef<(() => void) | null>(null);

  function tick() {
    const elapsed = elapsedRef.current + (performance.now() - startedAtRef.current) / 1000;
    const pct = Math.min(1, elapsed / duration);
    setProgress(pct);

    const line = lineEnds.findIndex((end) => elapsed < end);
    if (line !== -1 && line !== lastLineRef.current) {
      lastLineRef.current = line;
      if (line > 0) chimeRef.current?.();
    }

    if (pct >= 1) {
      stopPlayback(true);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function startPlayback() {
    const built = buildAudio();
    if (built) {
      ctxRef.current = built.ctx;
      stopFnRef.current = built.stop;
      chimeRef.current = built.chime;
    }
    startedAtRef.current = performance.now();
    setPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopPlayback(finished = false) {
    cancelAnimationFrame(rafRef.current);
    stopFnRef.current?.();
    stopFnRef.current = null;
    ctxRef.current = null;
    chimeRef.current = null;
    setPlaying(false);
    if (finished) {
      elapsedRef.current = 0;
      lastLineRef.current = -1;
      setProgress(0);
    } else {
      elapsedRef.current += (performance.now() - startedAtRef.current) / 1000;
    }
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopFnRef.current?.();
    };
  }, []);

  const elapsedSec = progress * duration;

  return (
    <div className="audio-card">
      <div className="audio-card__head">
        <button
          className="audio-card__btn"
          onClick={() => (playing ? stopPlayback() : startPlayback())}
          aria-label={playing ? 'Dayandır' : 'Dinlə'}
        >
          {playing ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
        </button>
        <div>
          <div className="audio-card__title">Səsli bələdçi</div>
          <div className="audio-card__sub">
            <Headphones size={11} style={{ verticalAlign: -1.5, marginRight: 4 }} />
            {locationName}
          </div>
        </div>
        <div className="audio-card__time">
          {formatDuration(elapsedSec)} / {formatDuration(duration)}
        </div>
      </div>
      <div className="audio-progress">
        <div className="audio-progress__fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="audio-lines">
        {guide.lines.map((line, i) => (
          <div key={i} className={`audio-line${playing && i === currentLine ? ' is-current' : ''}`}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
