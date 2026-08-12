import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed, PenLine, CheckCircle2, Loader2 } from 'lucide-react';
import { passportApi } from '../../api/endpoints';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../store/auth';
import { toast } from '../../store/toast';

/** “Qarabağ Pasportu” check-in — GPS-validated (≤5 km) with a manual fallback. */
export function CheckInButton({
  locationId,
  visited,
  onDone
}: {
  locationId: string;
  visited: boolean;
  onDone: () => void;
}) {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [busy, setBusy] = useState<'gps' | 'manual' | null>(null);

  if (visited) {
    return (
      <div className="checkin-done">
        <CheckCircle2 size={17} /> Pasportunuzda qeyd olunub
      </div>
    );
  }

  const requireLogin = () => {
    toast.info('Qeydiyyat üçün əvvəlcə daxil olun');
    navigate('/profile');
  };

  async function checkin(method: 'gps' | 'manual', coords?: { lat: number; lng: number }) {
    try {
      await passportApi.checkin({ locationId, method, ...coords });
      toast.success(method === 'gps' ? 'GPS ilə qeyd olundu — pasportunuz yeniləndi!' : 'Ziyarət pasportunuza əlavə olundu!');
      onDone();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  function gpsCheckin() {
    if (!user) return requireLogin();
    if (!navigator.geolocation) {
      toast.error('Cihazda GPS dəstəklənmir — manual qeyd istifadə edin');
      return;
    }
    setBusy('gps');
    navigator.geolocation.getCurrentPosition(
      (pos) => checkin('gps', { lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setBusy(null);
        toast.error('GPS mövqeyi alınmadı — manual qeyd istifadə edin');
      },
      { timeout: 8000, maximumAge: 30000 }
    );
  }

  function manualCheckin() {
    if (!user) return requireLogin();
    setBusy('manual');
    checkin('manual');
  }

  return (
    <div className="checkin-row">
      <button className="btn btn--emerald" style={{ flex: 1.4 }} onClick={gpsCheckin} disabled={busy !== null}>
        {busy === 'gps' ? <Loader2 size={16} className="spin" /> : <LocateFixed size={16} />}
        GPS ilə buradayam
      </button>
      <button className="btn btn--ghost" style={{ flex: 1 }} onClick={manualCheckin} disabled={busy !== null}>
        {busy === 'manual' ? <Loader2 size={16} className="spin" /> : <PenLine size={16} />}
        Manual qeyd
      </button>
    </div>
  );
}
