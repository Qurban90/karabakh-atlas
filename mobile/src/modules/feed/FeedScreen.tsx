import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Newspaper, Send, Loader2 } from 'lucide-react';
import { locationsApi, postsApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import type { LocationItem, Post } from '../../api/types';
import { useAuth } from '../../store/auth';
import { toast } from '../../store/toast';
import { Avatar, CardSkeleton, EmptyState, ErrorState } from '../../components/ui';
import { PostCard } from './PostCard';

const postSchema = z.object({
  text: z.string().trim().min(5, 'Paylaşım ən azı 5 simvol olmalıdır').max(600, 'Maksimum 600 simvol')
});

const PAGE = 6;

export function FeedScreen() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [text, setText] = useState('');
  const [locationId, setLocationId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  const load = useCallback(() => {
    setFailed(false);
    setPosts(null);
    postsApi
      .list(0, PAGE)
      .then((res) => {
        setPosts(res.items);
        setHasMore(res.hasMore);
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    locationsApi
      .list({ year: 2026 })
      .then((res) => setLocations(res.items))
      .catch(() => {});
  }, []);

  function loadMore() {
    if (!posts) return;
    setLoadingMore(true);
    postsApi
      .list(posts.length, PAGE)
      .then((res) => {
        setPosts([...posts, ...res.items]);
        setHasMore(res.hasMore);
      })
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoadingMore(false));
  }

  async function submit() {
    const parsed = postSchema.safeParse({ text });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Doğrulama xətası');
      return;
    }
    setFormError(null);
    setPosting(true);
    try {
      const item = await postsApi.create({ text: parsed.data.text, locationId: locationId || undefined });
      setPosts((prev) => [item, ...(prev ?? [])]);
      setText('');
      setLocationId('');
      toast.success('Paylaşımınız dərc olundu!');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setPosting(false);
    }
  }

  function patchPost(updated: Post) {
    setPosts((prev) => (prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev));
  }

  function dropPost(id: string) {
    setPosts((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
  }

  return (
    <div className="screen">
      <header className="topbar">
        <img src="/icon.svg" alt="" className="topbar__logo" />
        <div>
          <div className="topbar__title">İcma lenti</div>
          <div className="topbar__subtitle">Dirçəlişin şahidlərindən paylaşımlar</div>
        </div>
      </header>

      <div className="feed-list">
        {/* composer */}
        {user ? (
          <div className="card composer">
            <div className="composer__row">
              <Avatar user={user} />
              <div style={{ flex: 1 }} className="field">
                <textarea
                  className={`field__input${formError ? ' field__input--error' : ''}`}
                  placeholder="Qarabağdan təəssüratınızı bölüşün…"
                  value={text}
                  maxLength={600}
                  onChange={(e) => setText(e.target.value)}
                />
                {formError && <span className="field__error">{formError}</span>}
              </div>
            </div>
            <div className="composer__foot">
              <select
                className="composer__select"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                aria-label="Məkan seç"
              >
                <option value="">📍 Məkan əlavə et (istəyə görə)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <button className="btn btn--primary btn--sm" onClick={submit} disabled={posting}>
                {posting ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
                Paylaş
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--c-muted)' }}>
              Paylaşım etmək və bəyənmək üçün hesabınıza daxil olun.
            </div>
            <button className="btn btn--primary btn--sm" onClick={() => navigate('/profile')}>
              Daxil ol
            </button>
          </div>
        )}

        {/* list */}
        {failed && <ErrorState onRetry={load} />}
        {!failed && !posts && (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
        {posts && posts.length === 0 && (
          <EmptyState
            icon={<Newspaper size={28} />}
            title="Lent hələ boşdur"
            text="İlk paylaşımı edərək icmanı canlandırın!"
          />
        )}
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} onChange={patchPost} onDelete={dropPost} />
        ))}
        {posts && hasMore && (
          <button className="btn btn--ghost btn--block" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? <Loader2 size={16} className="spin" /> : null}
            Daha çox göstər
          </button>
        )}
      </div>
    </div>
  );
}
