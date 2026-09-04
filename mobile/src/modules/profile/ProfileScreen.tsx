import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Award,
  Footprints,
  Castle,
  Building2,
  Landmark,
  Flag,
  Users,
  BookMarked,
  MapPin,
  CloudDownload,
  Loader2,
  ShieldCheck,
  Stamp,
  Trash2
} from 'lucide-react';
import { accountApi, locationsApi, passportApi, precacheForOffline } from '../../api/endpoints';
import { apiErrorMessage, cacheStats } from '../../api/client';
import type { Badge, Passport } from '../../api/types';
import { useAuth } from '../../store/auth';
import { toast } from '../../store/toast';
import { categoryColors, cityLabels, formatDate } from '../../utils/format';
import { Avatar, EmptyState, ErrorState, ProgressRing, Skeleton } from '../../components/ui';
import { AuthForms } from './AuthForms';

const BADGE_ICONS: Record<string, typeof Award> = {
  footprints: Footprints,
  castle: Castle,
  building: Building2,
  landmark: Landmark,
  flag: Flag,
  users: Users,
  award: Award
};

export function ProfileScreen() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  const [passport, setPassport] = useState<Passport | null>(null);
  const [failed, setFailed] = useState(false);
  const [showAllVisits, setShowAllVisits] = useState(false);
  const [caching, setCaching] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [cache, setCache] = useState(cacheStats());

  const load = useCallback(() => {
    if (!user) return;
    setFailed(false);
    setPassport(null);
    passportApi
      .get()
      .then(setPassport)
      .catch(() => setFailed(true));
  }, [user]);

  useEffect(load, [load]);

  async function deleteAccount() {
    setDeleting(true);
    try {
      await accountApi.deleteMe(deletePassword);
      toast.success('Hesabınız və bütün məlumatlarınız silindi');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeletePassword('');
    }
  }

  async function precache() {
    setCaching(true);
    try {
      const list = await locationsApi.list({ year: 2026 });
      await precacheForOffline(list.items.map((l) => l.id));
      setCache(cacheStats());
      toast.success('Məlumatlar oflayn istifadə üçün yükləndi');
    } catch {
      toast.error('Oflayn yükləmə alınmadı — şəbəkəni yoxlayın');
    } finally {
      setCaching(false);
    }
  }

  /* ---------- guest ---------- */
  if (!user) {
    return (
      <div className="screen">
        <header className="topbar">
          <img src="/icon.svg" alt="" className="topbar__logo" />
          <div>
            <div className="topbar__title">Qarabağ Pasportu</div>
            <div className="topbar__subtitle">Ziyarətlərinizi izləyin, nişanlar qazanın</div>
          </div>
        </header>
        <div className="page-pad">
          <AuthForms />
          <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="state__icon" style={{ width: 46, height: 46, borderRadius: 14 }}>
              <Stamp size={22} />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--c-muted)', fontWeight: 600, lineHeight: 1.5 }}>
              Hesab yaradın: ziyarət etdiyiniz məkanları qeyd edin, rəy yazın və “Dirçəliş Könüllüsü”
              nişanlarını toplayın.
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- signed in ---------- */
  return (
    <div className="screen">
      <header className="topbar">
        <img src="/icon.svg" alt="" className="topbar__logo" />
        <div style={{ flex: 1 }}>
          <div className="topbar__title">Qarabağ Pasportu</div>
          <div className="topbar__subtitle">Ziyarət gündəliyiniz və nailiyyətləriniz</div>
        </div>
        <button className="topbar__back" onClick={logout} aria-label="Çıxış">
          <LogOut size={16} />
        </button>
      </header>

      <div className="page-pad">
        <div className="card profile-head">
          <Avatar user={user} size={54} />
          <div style={{ flex: 1 }}>
            <div className="profile-head__name">{user.name}</div>
            <div className="profile-head__mail">Üzv: {formatDate(user.joinedAt)}</div>
            {user.role !== 'user' && (
              <span className="role-tag">
                <ShieldCheck size={11} style={{ marginRight: 4 }} /> {user.role}
              </span>
            )}
          </div>
        </div>

        {user.role !== 'user' && (
          <div className="card" style={{ fontSize: 12.5, color: 'var(--c-muted)', fontWeight: 600, lineHeight: 1.5 }}>
            Moderasiya rejimi aktivdir — lentdə və rəylərdə uyğunsuz kontenti silə bilərsiniz.
          </div>
        )}

        {failed && <ErrorState onRetry={load} />}

        {!failed && !passport && (
          <>
            <Skeleton h={120} r={16} />
            <Skeleton h={180} r={16} />
          </>
        )}

        {passport && (
          <>
            {/* passport hero */}
            <div className="passport-hero">
              <ProgressRing percent={passport.percent} />
              <div>
                <div className="passport-hero__title">Qarabağ Pasportu</div>
                <div className="passport-hero__big">
                  {passport.visitedCount} / {passport.totalLocations} məkan
                </div>
                <div className="passport-hero__sub">
                  {passport.stats.reviews} rəy · {passport.stats.posts} paylaşım · {passport.earnedBadges} nişan
                </div>
              </div>
            </div>

            {/* badges */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 12 }}>
                <Award size={17} /> Dirçəliş nişanları
              </div>
              <div className="badges-grid">
                {passport.badges.map((badge) => (
                  <BadgeTile key={badge.id} badge={badge} />
                ))}
              </div>
            </div>

            {/* visited list */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 4 }}>
                <BookMarked size={17} /> Ziyarət qeydləri
              </div>
              {passport.visited.length === 0 ? (
                <EmptyState
                  icon={<MapPin size={26} />}
                  title="Hələ qeyd yoxdur"
                  text="Xəritədə məkan seçib “Buradayam” düyməsi ilə ilk qeydinizi edin."
                  action={
                    <button className="btn btn--primary btn--sm" onClick={() => navigate('/')}>
                      Xəritəyə keç
                    </button>
                  }
                />
              ) : (
                <>
                  {(showAllVisits ? passport.visited : passport.visited.slice(0, 5)).map((v) => (
                    <div
                      key={v.checkinId}
                      className="visited-item"
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/location/${v.location.id}`)}
                    >
                      <div
                        className="visited-item__icon"
                        style={{ background: v.location.category ? categoryColors[v.location.category] : '#94A3B8' }}
                      >
                        <MapPin size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="visited-item__name">{v.location.name}</div>
                        <div className="visited-item__meta">
                          {v.location.city ? cityLabels[v.location.city] : ''} · {formatDate(v.visitedAt)} ·{' '}
                          {v.method === 'gps' ? 'GPS' : 'manual'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {passport.visited.length > 5 && (
                    <button className="btn btn--ghost btn--sm btn--block" onClick={() => setShowAllVisits((s) => !s)}>
                      {showAllVisits ? 'Daha az göstər' : `Hamısını göstər (${passport.visited.length})`}
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Account deletion is a Play Store requirement for any app with
            accounts, and the right of erasure regardless of the store. */}
        <div className="card danger-zone">
          <div className="section-title" style={{ fontSize: 14, color: 'var(--c-rose)' }}>
            <Trash2 size={16} /> Hesabı sil
          </div>
          {!deleteOpen ? (
            <>
              <p className="danger-zone__text">
                Hesabınız, rəyləriniz, paylaşımlarınız və ziyarət qeydləriniz həmişəlik silinir.
                Bu əməliyyat geri qaytarıla bilməz.
              </p>
              <button className="btn btn--danger btn--sm" onClick={() => setDeleteOpen(true)}>
                Hesabı silmək istəyirəm
              </button>
            </>
          ) : (
            <>
              <p className="danger-zone__text">
                Təsdiq üçün şifrənizi daxil edin. Bütün məlumatlarınız serverdən tamamilə silinəcək.
              </p>
              <input
                className="field__input"
                type="password"
                placeholder="Şifrəniz"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn--danger btn--sm"
                  style={{ flex: 1 }}
                  onClick={deleteAccount}
                  disabled={deleting || deletePassword.length < 1}
                >
                  {deleting ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                  Həmişəlik sil
                </button>
                <button
                  className="btn btn--ghost btn--sm"
                  style={{ flex: 1 }}
                  onClick={() => { setDeleteOpen(false); setDeletePassword(''); }}
                >
                  İmtina
                </button>
              </div>
            </>
          )}
        </div>

        {/* offline cache */}
        <div className="card offline-row">
          <div>
            <div className="section-title" style={{ fontSize: 14 }}>
              <CloudDownload size={16} /> Oflayn keş
            </div>
            <div className="offline-row__info">
              {cache.count > 0
                ? `${cache.count} sorğu yaddaşda · son sinxronizasiya: ${cache.lastSync ? formatDate(cache.lastSync.toISOString()) : '—'}`
                : 'Dağlıq ərazidə internetsiz istifadə üçün məlumatları yükləyin.'}
            </div>
          </div>
          <button className="btn btn--primary btn--sm" onClick={precache} disabled={caching}>
            {caching ? <Loader2 size={15} className="spin" /> : <CloudDownload size={15} />}
            Yüklə
          </button>
        </div>
      </div>
    </div>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  const Icon = BADGE_ICONS[badge.icon] ?? Award;
  return (
    <div className={`badge-tile${badge.earned ? ' is-earned' : ''}`} title={badge.description}>
      <div className="badge-tile__icon">
        <Icon size={19} />
      </div>
      <div className="badge-tile__name">{badge.name}</div>
      <div className="badge-tile__progress">
        {badge.earned ? 'Qazanılıb ✓' : `${badge.progress.current}/${badge.progress.target}`}
      </div>
    </div>
  );
}
