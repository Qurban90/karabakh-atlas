import { useRef, useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import type { Category } from '../../api/types';
import { LocationArt } from '../../components/LocationArt';

/**
 * “Dirçəliş qabağı və sonrası” — draggable split view. Left of the handle
 * shows the damaged/pre-restoration scene, right shows the rebuilt one.
 */
export function BeforeAfterSlider({ id, category }: { id: string; category: Category }) {
  const [split, setSplit] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updateFromClientX(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(96, Math.max(4, pct)));
  }

  return (
    <div
      ref={ref}
      className="ba-slider"
      style={{ ['--split' as string]: `${split}%` }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) updateFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <LocationArt id={id} category={category} variant="before" height={260} />
      <div className="ba-slider__after">
        <LocationArt id={id} category={category} variant="after" height={260} />
      </div>
      <div className="ba-slider__tag ba-slider__tag--before">2020 · dağıntı</div>
      <div className="ba-slider__tag ba-slider__tag--after">2026 · dirçəliş</div>
      <div className="ba-slider__handle">
        <div className="ba-slider__knob">
          <ChevronsLeftRight size={19} />
        </div>
      </div>
    </div>
  );
}
