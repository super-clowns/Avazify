import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import { demoAccounts } from '../data/initialData';
import type { Gender, User } from '../types';

function AuthShell({ children, mode }: { children: ReactNode; mode: 'login' | 'register' | 'forgot' }) {
  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand">
          <span className="brand-mark"><Icon name="music" size={28} /></span>
          <div><strong>Avazify</strong><small>موسیقی برای هر لحظه</small></div>
        </div>
        <div className="auth-showcase-copy">
          <span className="eyebrow">MUSIC STREAMING PLATFORM</span>
          <h1>{mode === 'register' ? 'صدای خودت را پیدا کن.' : mode === 'forgot' ? 'دوباره به موسیقی برگرد.' : 'موسیقی، دقیقاً برای حالِ تو.'}</h1>
          <p>کشف آثار تازه، ساخت پلی‌لیست، دنبال‌کردن هنرمندان و تجربه یک پخش‌کننده کامل در یک رابط فارسی و واکنش‌گرا.</p>
          <div className="auth-feature-list">
            <span><Icon name="sparkles" /> پیشنهادهای شخصی‌سازی‌شده</span>
            <span><Icon name="playlist" /> پلی‌لیست‌های قابل مدیریت</span>
            <span><Icon name="crown" /> امکانات ویژه اشتراک طلایی</span>
          </div>
        </div>
        <div className="auth-art" aria-hidden="true">
          <span className="art-disc"><Icon name="album" size={88} /></span>
          <span className="art-note note-one"><Icon name="music" size={28} /></span>
          <span className="art-note note-two"><Icon name="music" size={22} /></span>
        </div>
      </section>
      <section className="auth-panel">{children}</section>
    </main>
  );
}

function getLandingPath(user: User) {
  if (user.role === 'admin' || user.role === 'support') return '/dashboard';
  if (user.role === 'artist') return user.artistStatus === 'approved' ? '/studio' : '/profile';
  return '/home';
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: Parameters<typeof Icon>[0]['name'];
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className={`field-control ${error ? 'field-error' : ''}`}>
        <Icon name={icon} size={19} />
        {children}
      </span>
      {error ? <small className="field-message error">{error}</small> : null}
    </label>
  );
}

export function LoginPage() {
  const { login } = useAppState();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('sara@example.com');
  const [password, setPassword] = useState('Demo1234');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را کامل وارد کنید.');
      return;
    }
    const result = login(email, password, rememberMe);
    if (!result.success) {
      setError(result.message);
      return;
    }
    pushToast(result.message, 'success');
    navigate(result.user ? getLandingPath(result.user) : '/home', { replace: true });
  };

  const selectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo1234');
    setError('');
  };

  return (
    <AuthShell mode="login">
      <div className="auth-form-wrap">
        <div className="auth-form-heading">
          <span className="eyebrow">خوش آمدید</span>
          <h2>ورود به آوازیفای</h2>
          <p>با ایمیل حساب خود وارد شوید یا یکی از حساب‌های نمایشی را انتخاب کنید.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field label="ایمیل" icon="mail">
            <input dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" />
          </Field>
          <Field label="رمز عبور" icon="lock">
            <input dir="ltr" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="حداقل ۸ کاراکتر" autoComplete="current-password" />
            <button type="button" className="field-action" onClick={() => setShowPassword((value) => !value)} aria-label="نمایش یا پنهان کردن رمز">
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </Field>

          <div className="auth-form-options">
            <label className="checkbox-label"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> مرا به خاطر بسپار</label>
            <Link to="/forgot-password">فراموشی رمز عبور</Link>
          </div>

          {error ? <div className="form-alert error"><Icon name="warning" />{error}</div> : null}

          <button type="submit" className="button button-primary full">ورود به حساب <Icon name="arrow" /></button>
        </form>

        <div className="auth-divider"><span>حساب‌های نمایشی</span></div>
        <div className="demo-account-grid">
          {demoAccounts.map((account) => (
            <button type="button" key={account.email} className={email === account.email ? 'selected' : ''} onClick={() => selectDemo(account.email)}>
              <span className={`demo-role demo-${account.role}`}><Icon name={account.role === 'artist' ? 'music' : account.role === 'support' ? 'ticket' : account.role === 'admin' ? 'dashboard' : 'user'} size={17} /></span>
              <span><strong>{account.label}</strong><small dir="ltr">{account.email}</small></span>
              {email === account.email ? <Icon name="check" size={17} /> : null}
            </button>
          ))}
        </div>
        <p className="auth-switch">حساب ندارید؟ <Link to="/register">ثبت‌نام کنید</Link></p>
      </div>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { registerListener, registerArtist } = useAppState();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'listener' | 'artist'>('listener');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [listener, setListener] = useState({ displayName: '', email: '', password: '', confirmPassword: '', birthDate: '', gender: 'prefer-not-to-say' as Gender });
  const [artist, setArtist] = useState({ artistName: '', email: '', password: '', confirmPassword: '', portfolioUrl: '', portfolioFiles: [] as string[] });

  const passwordError = useMemo(() => {
    const value = mode === 'listener' ? listener.password : artist.password;
    if (!value) return '';
    return value.length < 8 ? 'رمز عبور باید حداقل ۸ کاراکتر باشد.' : '';
  }, [artist.password, listener.password, mode]);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setArtist((previous) => ({ ...previous, portfolioFiles: Array.from(event.target.files ?? []).map((file) => file.name) }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!acceptedPrivacy) {
      setError('برای ادامه باید سیاست حریم خصوصی را بپذیرید.');
      return;
    }
    if (mode === 'listener') {
      if (!listener.displayName.trim() || !listener.email.trim() || !listener.password || !listener.birthDate) {
        setError('تمام فیلدهای ضروری را کامل کنید.');
        return;
      }
      if (listener.password.length < 8 || listener.password !== listener.confirmPassword) {
        setError(listener.password !== listener.confirmPassword ? 'رمز عبور و تکرار آن یکسان نیست.' : 'رمز عبور باید حداقل ۸ کاراکتر باشد.');
        return;
      }
      const result = registerListener(listener);
      if (!result.success) return setError(result.message);
      pushToast(result.message, 'success');
      navigate('/home', { replace: true });
      return;
    }

    if (!artist.artistName.trim() || !artist.email.trim() || !artist.password || (!artist.portfolioUrl.trim() && artist.portfolioFiles.length === 0)) {
      setError('نام هنری، ایمیل، رمز عبور و حداقل یک نمونه‌کار ضروری است.');
      return;
    }
    if (artist.password.length < 8 || artist.password !== artist.confirmPassword) {
      setError(artist.password !== artist.confirmPassword ? 'رمز عبور و تکرار آن یکسان نیست.' : 'رمز عبور باید حداقل ۸ کاراکتر باشد.');
      return;
    }
    const result = registerArtist(artist);
    if (!result.success) return setError(result.message);
    pushToast(result.message, 'success');
    navigate('/profile', { replace: true });
  };

  return (
    <AuthShell mode="register">
      <div className="auth-form-wrap register-wrap">
        <div className="auth-form-heading">
          <span className="eyebrow">ایجاد حساب</span>
          <h2>عضویت در آوازیفای</h2>
          <p>نوع حساب را انتخاب کنید؛ اطلاعات این فاز به‌صورت آزمایشی در مرورگر ذخیره می‌شود.</p>
        </div>
        <div className="segmented-control">
          <button type="button" className={mode === 'listener' ? 'active' : ''} onClick={() => { setMode('listener'); setError(''); }}><Icon name="user" /> حساب شنونده</button>
          <button type="button" className={mode === 'artist' ? 'active' : ''} onClick={() => { setMode('artist'); setError(''); }}><Icon name="music" /> حساب هنرمند</button>
        </div>

        <form className="auth-form register-form" onSubmit={handleSubmit} noValidate>
          {mode === 'listener' ? (
            <div className="form-grid two-columns">
              <Field label="نام نمایشی" icon="user"><input value={listener.displayName} onChange={(event) => setListener({ ...listener, displayName: event.target.value })} placeholder="مثلاً سارا" /></Field>
              <Field label="ایمیل" icon="mail"><input dir="ltr" type="email" value={listener.email} onChange={(event) => setListener({ ...listener, email: event.target.value })} placeholder="name@example.com" /></Field>
              <Field label="رمز عبور" icon="lock" error={passwordError}><input dir="ltr" type="password" value={listener.password} onChange={(event) => setListener({ ...listener, password: event.target.value })} /></Field>
              <Field label="تکرار رمز عبور" icon="lock"><input dir="ltr" type="password" value={listener.confirmPassword} onChange={(event) => setListener({ ...listener, confirmPassword: event.target.value })} /></Field>
              <Field label="تاریخ تولد" icon="calendar"><input type="date" value={listener.birthDate} onChange={(event) => setListener({ ...listener, birthDate: event.target.value })} /></Field>
              <Field label="جنسیت" icon="users">
                <select value={listener.gender} onChange={(event) => setListener({ ...listener, gender: event.target.value as Gender })}>
                  <option value="prefer-not-to-say">ترجیح می‌دهم نگویم</option><option value="female">زن</option><option value="male">مرد</option><option value="other">سایر</option>
                </select>
              </Field>
            </div>
          ) : (
            <div className="form-grid two-columns">
              <Field label="نام هنری" icon="music"><input value={artist.artistName} onChange={(event) => setArtist({ ...artist, artistName: event.target.value })} placeholder="نامی که منتشر می‌شود" /></Field>
              <Field label="ایمیل" icon="mail"><input dir="ltr" type="email" value={artist.email} onChange={(event) => setArtist({ ...artist, email: event.target.value })} placeholder="artist@example.com" /></Field>
              <Field label="رمز عبور" icon="lock" error={passwordError}><input dir="ltr" type="password" value={artist.password} onChange={(event) => setArtist({ ...artist, password: event.target.value })} /></Field>
              <Field label="تکرار رمز عبور" icon="lock"><input dir="ltr" type="password" value={artist.confirmPassword} onChange={(event) => setArtist({ ...artist, confirmPassword: event.target.value })} /></Field>
              <div className="form-span-two"><Field label="لینک نمونه‌کار" icon="globe"><input dir="ltr" type="url" value={artist.portfolioUrl} onChange={(event) => setArtist({ ...artist, portfolioUrl: event.target.value })} placeholder="https://example.com/portfolio" /></Field></div>
              <label className="upload-field form-span-two">
                <input type="file" multiple accept="audio/*,.pdf" onChange={handleFiles} />
                <span className="upload-field-icon"><Icon name="upload" size={24} /></span>
                <span><strong>بارگذاری نمونه‌کار</strong><small>فایل صوتی یا PDF؛ در فاز اول فقط نام فایل ذخیره می‌شود.</small></span>
                <span className="button button-secondary">انتخاب فایل</span>
              </label>
              {artist.portfolioFiles.length ? <div className="selected-files form-span-two">{artist.portfolioFiles.map((file) => <span key={file}><Icon name="music" size={15} />{file}</span>)}</div> : null}
            </div>
          )}

          <label className="privacy-check">
            <input type="checkbox" checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)} />
            <span>سیاست <button type="button" onClick={() => setPrivacyOpen(true)}>حریم خصوصی</button> و شرایط استفاده را می‌پذیرم.</span>
          </label>
          {error ? <div className="form-alert error"><Icon name="warning" />{error}</div> : null}
          <button type="submit" className="button button-primary full">{mode === 'listener' ? 'ساخت حساب و ورود' : 'ارسال درخواست هنرمندی'} <Icon name="arrow" /></button>
        </form>
        <p className="auth-switch">قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">وارد شوید</Link></p>
      </div>

      <Modal open={privacyOpen} title="سیاست حریم خصوصی" onClose={() => setPrivacyOpen(false)} size="small" footer={<button type="button" className="button button-primary" onClick={() => { setAcceptedPrivacy(true); setPrivacyOpen(false); }}>می‌پذیرم</button>}>
        <div className="policy-content">
          <p>اطلاعات حساب در فاز اول فقط برای شبیه‌سازی تعاملات رابط کاربری در Local Storage مرورگر ذخیره می‌شود.</p>
          <h3>اطلاعات ذخیره‌شده</h3>
          <ul><li>اطلاعات نمایه و تنظیمات برنامه</li><li>پلی‌لیست‌ها و وضعیت اعلانات</li><li>حساب‌های نمایشی و وضعیت ورود</li></ul>
          <p>با بازنشانی داده‌های محلی از صفحه تنظیمات، اطلاعات به حالت اولیه بازمی‌گردد.</p>
        </div>
      </Modal>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAppState();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return setMessage('ایمیل حساب را وارد کنید.');
    setMessage(requestPasswordReset(email).message);
  };

  return (
    <AuthShell mode="forgot">
      <div className="auth-form-wrap compact-auth-wrap">
        <div className="forgot-icon"><Icon name="lock" size={30} /></div>
        <div className="auth-form-heading">
          <span className="eyebrow">بازیابی حساب</span>
          <h2>فراموشی رمز عبور</h2>
          <p>ایمیل حساب خود را وارد کنید تا روند آزمایشی بازیابی نمایش داده شود.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <Field label="ایمیل حساب" icon="mail"><input dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></Field>
          {message ? <div className="form-alert info"><Icon name="info" />{message}</div> : null}
          <button type="submit" className="button button-primary full">ارسال لینک بازیابی</button>
        </form>
        <p className="auth-switch"><Link to="/login">بازگشت به صفحه ورود</Link></p>
      </div>
    </AuthShell>
  );
}
