import { useState } from 'react';
import { z } from 'zod';
import { LogIn, UserPlus, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { toast } from '../../store/toast';
import { apiErrorMessage, apiErrorDetails } from '../../api/client';

const loginSchema = z.object({
  email: z.string().trim().email('Düzgün e-poçt daxil edin'),
  password: z.string().min(1, 'Şifrə tələb olunur')
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ad ən azı 2 simvol olmalıdır').max(60),
  email: z.string().trim().email('Düzgün e-poçt daxil edin'),
  password: z
    .string()
    .min(8, 'Şifrə ən azı 8 simvol olmalıdır')
    .regex(/\d/, 'Şifrədə ən azı bir rəqəm olmalıdır')
});

type Mode = 'login' | 'register';

export function AuthForms() {
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit() {
    const schema = mode === 'login' ? loginSchema : registerSchema;
    const payload = mode === 'login' ? { email, password } : { name, email, password };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        toast.success('Xoş gəldiniz!');
      } else {
        await register(name.trim(), email.trim(), password);
        toast.success('Hesabınız yaradıldı — xoş gəldiniz!');
      }
    } catch (err) {
      setErrors(apiErrorDetails(err));
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function fill(demoEmail: string, demoPass: string) {
    setMode('login');
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
  }

  return (
    <div className="card">
      <div className="auth-tabs">
        <button className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>
          Giriş
        </button>
        <button className={mode === 'register' ? 'is-active' : ''} onClick={() => setMode('register')}>
          Qeydiyyat
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode === 'register' && (
          <div className="field">
            <span className="field__label">Ad, soyad</span>
            <input
              className={`field__input${errors.name ? ' field__input--error' : ''}`}
              placeholder="Məs. Qurban Hüseynzadə"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </div>
        )}
        <div className="field">
          <span className="field__label">E-poçt</span>
          <input
            className={`field__input${errors.email ? ' field__input--error' : ''}`}
            type="email"
            placeholder="siz@nümunə.az"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>
        <div className="field">
          <span className="field__label">Şifrə</span>
          <input
            className={`field__input${errors.password ? ' field__input--error' : ''}`}
            type="password"
            placeholder={mode === 'register' ? 'Ən azı 8 simvol, 1 rəqəm' : '••••••••'}
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {errors.password && <span className="field__error">{errors.password}</span>}
        </div>
        <button className="btn btn--primary btn--block" onClick={submit} disabled={busy}>
          {busy ? <Loader2 size={16} className="spin" /> : mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
          {mode === 'login' ? 'Daxil ol' : 'Hesab yarat'}
        </button>
      </div>

      {/* Demo shortcut for jury/mentor evaluation. The admin shortcut is dev-only:
          on a public build it would hand moderation rights to any visitor, and the
          production admin password is env-driven (see server/src/store.js). */}
      <div className="demo-fill">
        <button className="btn btn--ghost btn--sm" style={{ flex: 1 }} onClick={() => fill('aysel@demo.az', 'Demo123!')}>
          <Sparkles size={14} /> Demo istifadəçi
        </button>
        {import.meta.env.DEV && (
          <button className="btn btn--ghost btn--sm" style={{ flex: 1 }} onClick={() => fill('admin@qdx.az', 'Admin123!')}>
            <ShieldCheck size={14} /> Admin
          </button>
        )}
      </div>
    </div>
  );
}
