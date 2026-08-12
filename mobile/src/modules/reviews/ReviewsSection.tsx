import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { MessageSquarePlus, Star, Trash2, Loader2 } from 'lucide-react';
import { reviewsApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import type { ReviewsResponse } from '../../api/types';
import { useAuth } from '../../store/auth';
import { toast } from '../../store/toast';
import { YEARS } from '../../store/app';
import { Avatar, EmptyState, Skeleton, Stars, StarsInput } from '../../components/ui';
import { timeAgo } from '../../utils/format';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Ulduz sayını seçin').max(5),
  text: z.string().trim().min(10, 'Rəy ən azı 10 simvol olmalıdır').max(600, 'Rəy 600 simvoldan uzun ola bilməz'),
  visitYear: z.number().optional()
});

export function ReviewsSection({ locationId }: { locationId: string }) {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [failed, setFailed] = useState(false);

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [visitYear, setVisitYear] = useState<number>(2026);
  const [errors, setErrors] = useState<{ rating?: string; text?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    reviewsApi
      .list(locationId)
      .then(setData)
      .catch(() => setFailed(true));
  }, [locationId]);

  useEffect(load, [load]);

  async function submit() {
    const parsed = reviewSchema.safeParse({ rating, text, visitYear });
    if (!parsed.success) {
      const map: { rating?: string; text?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'rating' | 'text';
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await reviewsApi.create(locationId, parsed.data);
      toast.success('Rəyiniz dərc olundu — təşəkkürlər!');
      setRating(0);
      setText('');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function removeReview(id: string) {
    try {
      await reviewsApi.remove(id);
      toast.success('Rəy silindi');
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const canModerate = user && ['admin', 'moderator'].includes(user.role);

  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 14 }}>
        <Star size={17} /> Rəylər və qiymətlər
      </div>

      {failed && <EmptyState icon={<Star size={28} />} title="Rəylər yüklənmədi" text="Şəbəkəni yoxlayıb yenidən cəhd edin." />}

      {!failed && !data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton h={54} />
          <Skeleton h={70} />
          <Skeleton h={70} />
        </div>
      )}

      {data && (
        <>
          {data.count > 0 ? (
            <div className="review-summary">
              <div className="review-summary__score">
                <div className="review-summary__avg">{data.rating.average}</div>
                <Stars value={data.rating.average} />
                <div className="review-summary__count">{data.count} rəy</div>
              </div>
              <div className="review-summary__bars">
                {data.distribution.map((d) => (
                  <div key={d.star} className="dist-row">
                    <span>{d.star}</span>
                    <div className="dist-row__track">
                      <div
                        className="dist-row__fill"
                        style={{ width: data.count ? `${(d.count / data.count) * 100}%` : 0 }}
                      />
                    </div>
                    <span style={{ width: 14, textAlign: 'right' }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquarePlus size={28} />}
              title="Hələ rəy yoxdur"
              text="Bu məkanı ziyarət etmisinizsə, ilk rəyi siz yazın!"
            />
          )}

          {/* review form */}
          {user ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div className="field">
                <span className="field__label">Qiymətiniz</span>
                <StarsInput value={rating} onChange={setRating} />
                {errors.rating && <span className="field__error">{errors.rating}</span>}
              </div>
              <div className="field">
                <textarea
                  className={`field__input${errors.text ? ' field__input--error' : ''}`}
                  placeholder="Təəssüratınızı bölüşün… (ən azı 10 simvol)"
                  value={text}
                  maxLength={600}
                  onChange={(e) => setText(e.target.value)}
                />
                {errors.text && <span className="field__error">{errors.text}</span>}
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <select
                  className="composer__select"
                  style={{ flex: 'none', width: 130 }}
                  value={visitYear}
                  onChange={(e) => setVisitYear(Number(e.target.value))}
                  aria-label="Ziyarət ili"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      Ziyarət: {y}
                    </option>
                  ))}
                </select>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : <MessageSquarePlus size={16} />}
                  Rəy göndər
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn--ghost btn--block" style={{ marginTop: 14 }} onClick={() => navigate('/profile')}>
              Rəy yazmaq üçün daxil olun
            </button>
          )}

          {/* review list */}
          <div style={{ marginTop: 8 }}>
            {data.items.map((review) => (
              <div key={review.id} className="review-item">
                <Avatar user={review.user} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="review-item__head">
                    <span className="review-item__name">{review.user.name}</span>
                    <Stars value={review.rating} size={12} />
                    <span className="review-item__time">
                      {timeAgo(review.createdAt)}
                      {review.visitYear ? ` · ziyarət ${review.visitYear}` : ''}
                    </span>
                    {(canModerate || review.user.id === user?.id) && (
                      <button
                        className="icon-btn icon-btn--danger"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => removeReview(review.id)}
                        aria-label="Rəyi sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="review-item__text">{review.text}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
