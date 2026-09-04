import { useRef, useState } from 'react';
import { ChevronsLeftRight, Camera } from 'lucide-react';
import type { Category, LocationPhotos } from '../../api/types';
import { LocationArt } from '../../components/LocationArt';
import { LocationImage } from '../../components/LocationImage';

/**
 * "Dirçəliş qabağı və sonrası" — draggable split view.
 *
 * Three cases, in order of how truthful they are:
 *  1. real before + real after photo  → a genuine comparison, the best case
 *  2. real after only                 → show the photo alone; pairing a real
 *     photo with a drawn "before" would imply a comparison we can't support
 *  3. no photo                        → the generated before/after scenes
 */
export function BeforeAfterSlider({
  id,
  category,
  photos
}: {
  id: string;
  category: Category;
  photos: LocationPhotos | null;
}) {
  const [split, setSplit] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updateFromClientX(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(96, Math.max(4, pct)));
  }

  const hasRealPair = Boolean(photos?.before && photos?.after);

  // case 2 — a real photo but nothing genuine to compare it against
  if (photos?.after && !photos.before) {
    return <LocationImage id={id} category={category} photos={photos} height={280} eager />;
  }

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      updateFromClientX(e.clientX);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (dragging.current) updateFromClientX(e.clientX);
    },
    onPointerUp: () => {
      dragging.current = false;
    },
    onPointerCancel: () => {
      dragging.current = false;
    }
  };

  return (
    <div ref={ref} className="ba-slider" style={{ ['--split' as string]: `${split}%` }} {...handlers}>
      {hasRealPair ? (
        <>
          <img className="ba-slider__img" src={photos!.before!.file} alt="" loading="eager" />
          <div className="ba-slider__after">
            <img className="ba-slider__img" src={photos!.after.file} alt="" loading="eager" fetchPriority="high" />
          </div>
        </>
      ) : (
        <>
          <LocationArt id={id} category={category} variant="before" height={260} />
          <div className="ba-slider__after">
            <LocationArt id={id} category={category} variant="after" height={260} />
          </div>
        </>
      )}

      <div className="ba-slider__tag ba-slider__tag--before">
        {hasRealPair ? 'bərpadan əvvəl' : '2020 · dağıntı'}
      </div>
      <div className="ba-slider__tag ba-slider__tag--after">
        {hasRealPair ? 'bərpadan sonra' : '2026 · dirçəliş'}
      </div>

      <div className="ba-slider__handle">
        <div className="ba-slider__knob">
          <ChevronsLeftRight size={19} />
        </div>
      </div>

      {hasRealPair && (
        <div className="ba-slider__credit">
          <Camera size={10} />
          {photos!.before!.author} · {photos!.after.author}
        </div>
      )}
    </div>
  );
}
