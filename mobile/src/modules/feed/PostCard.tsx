import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, Trash2, Send } from 'lucide-react';
import { postsApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import type { Post } from '../../api/types';
import { useAuth } from '../../store/auth';
import { toast } from '../../store/toast';
import { Avatar } from '../../components/ui';
import { LocationArt } from '../../components/LocationArt';
import { timeAgo } from '../../utils/format';

export function PostCard({
  post,
  onChange,
  onDelete
}: {
  post: Post;
  onChange: (post: Post) => void;
  onDelete: (id: string) => void;
}) {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  const canDelete = user && (user.id === post.user.id || ['admin', 'moderator'].includes(user.role));

  async function toggleLike() {
    if (!user) {
      toast.info('Bəyənmək üçün daxil olun');
      return;
    }
    // optimistic flip; server response settles the truth
    onChange({
      ...post,
      likedByMe: !post.likedByMe,
      likeCount: post.likeCount + (post.likedByMe ? -1 : 1)
    });
    try {
      onChange(await postsApi.toggleLike(post.id));
    } catch (err) {
      onChange(post);
      toast.error(apiErrorMessage(err));
    }
  }

  async function sendComment() {
    const text = commentText.trim();
    if (text.length < 2) return;
    setSending(true);
    try {
      onChange(await postsApi.addComment(post.id, text));
      setCommentText('');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function remove() {
    try {
      await postsApi.remove(post.id);
      onDelete(post.id);
      toast.success('Paylaşım silindi');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <article className="card">
      <div className="post-card__head">
        <Avatar user={post.user} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="post-card__name">{post.user.name}</span>
            {post.user.role !== 'user' && <span className="post-card__role">{post.user.role}</span>}
          </div>
          <div className="post-card__time">{timeAgo(post.createdAt)}</div>
        </div>
        {canDelete && (
          <button className="icon-btn icon-btn--danger" onClick={remove} aria-label="Paylaşımı sil">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <p className="post-card__text">{post.text}</p>

      {post.location && (
        <div
          className="post-card__art"
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/location/${post.location!.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <LocationArt id={post.location.id} category={post.location.category} variant="after" height={150} />
          <span className="post-card__loc">
            <MapPin size={11} /> {post.location.name}
          </span>
        </div>
      )}

      <div className="post-card__actions">
        <button className={`icon-btn like-btn${post.likedByMe ? ' is-liked' : ''}`} onClick={toggleLike}>
          <Heart size={16} /> {post.likeCount}
        </button>
        <button className="icon-btn" onClick={() => setCommentsOpen((o) => !o)}>
          <MessageCircle size={16} /> {post.comments.length}
        </button>
      </div>

      {commentsOpen && (
        <div className="comments">
          {post.comments.map((c) => (
            <div key={c.id} className="comment">
              <Avatar user={c.user} size={28} />
              <div className="comment__bubble">
                <div className="comment__author">{c.user.name}</div>
                {c.text}
              </div>
            </div>
          ))}
          {user && (
            <div className="comment-form">
              <input
                placeholder="Şərh yazın…"
                value={commentText}
                maxLength={300}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              />
              <button onClick={sendComment} disabled={sending || commentText.trim().length < 2} aria-label="Göndər">
                <Send size={15} />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
