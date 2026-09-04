import { memo } from 'react';
import { Camera } from 'lucide-react';
import type { Category, LocationPhotos } from '../api/types';
import { LocationArt } from './LocationArt';

/**
 * A location's picture: the real photograph when we have one, otherwise the
 * generated illustration. Never a stand-in photo of somewhere else — a wrong
 * photo would misrepresent the site, and the illustration is honest about
 * being a drawing.
 *
 * The credit line is not decoration: the photos are CC BY / CC BY-SA, which
 * require attribution wherever the image appears.
 */
export const LocationImage = memo(function LocationImage({
  id,
  category,
  photos,
  height = 240,
  showCredit = true,
  eager = false
}: {
  id: string;
  category: Category;
  photos: LocationPhotos | null;
  height?: number;
  showCredit?: boolean;
  /** Set for above-the-fold images — lazy loading would delay the hero. */
  eager?: boolean;
}) {
  if (!photos?.after) {
    return <LocationArt id={id} category={category} variant="after" height={height} />;
  }
  const photo = photos.after;
  return (
    <figure className="photo" style={{ maxHeight: height }}>
      <img
        src={photo.file}
        alt={photos.caption ?? ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {showCredit && (
        <figcaption className="photo__credit">
          <Camera size={11} />
          <a href={photo.source} target="_blank" rel="noreferrer noopener">
            {photo.author}
          </a>
          <span className="photo__license">{photo.license}</span>
        </figcaption>
      )}
      {photos.caption && <div className="photo__caption">{photos.caption}</div>}
    </figure>
  );
});
