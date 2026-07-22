import { Link } from 'react-router-dom';

import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { APP_PATHS } from '../../../config/paths';

// Login page foundation.
export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section
        className="auth-visual"
        aria-label="معرفی آوازیفای"
      >
        <div className="auth-visual-content">
          <div className="auth-brand-mark">
            A
          </div>

          <p className="auth-visual-eyebrow">
            AVAZIFY MUSIC
          </p>

          <h1>
            موسیقی را پیدا کن، ذخیره کن
            و هرجا خواستی گوش بده.
          </h1>

          <p>
            این صفحه در فاز زیرساخت ساخته
            شده و در فاز بعد به وضعیت
            احراز هویت آزمایشی متصل خواهد
            شد.
          </p>

          <div className="auth-feature-list">
            <span>پلی‌لیست‌های شخصی</span>
            <span>پخش‌کننده یکپارچه</span>
            <span>
              نمایه و دنبال‌کردن کاربران
            </span>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-heading">
            <p className="page-eyebrow">
              ورود مشترک کاربران
            </p>

            <h2>
              به آوازیفای خوش آمدید
            </h2>

            <p>
              برای ورود آزمایشی، فرم زیر
              در فاز بعد به داده‌های محلی
              متصل می‌شود.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <Input
              name="email"
              type="email"
              label="ایمیل"
              placeholder="name@example.com"
              autoComplete="email"
              startIcon="✉"
            />

            <Input
              name="password"
              type="password"
              label="رمز عبور"
              placeholder="حداقل ۸ کاراکتر"
              autoComplete="current-password"
              startIcon="●"
            />

            <div className="auth-form-row">
              <label className="ui-checkbox">
                <input type="checkbox" />
                <span>
                  مرا به خاطر بسپار
                </span>
              </label>

              <Link
                to={
                  APP_PATHS.forgotPassword
                }
              >
                فراموشی رمز عبور
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="large"
            >
              ورود به حساب
            </Button>
          </form>

          <p className="auth-switch-text">
            حساب کاربری ندارید؟{' '}
            <Link to={APP_PATHS.register}>
              ثبت‌نام کنید
            </Link>
          </p>

          <Link
            className="preview-link"
            to={APP_PATHS.home}
          >
            مشاهده پیش‌نمایش محیط برنامه ←
          </Link>
        </div>
      </section>
    </main>
  );
}