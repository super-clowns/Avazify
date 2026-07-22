import { Link } from 'react-router-dom';

import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { APP_PATHS } from '../../../config/paths';

// Password recovery foundation.
export default function ForgotPasswordPage() {
  return (
    <main className="simple-auth-page">
      <section className="simple-auth-card">
        <div
          className="simple-auth-icon"
          aria-hidden="true"
        >
          ✉
        </div>

        <p className="page-eyebrow">
          بازیابی حساب
        </p>

        <h1>فراموشی رمز عبور</h1>

        <p className="simple-auth-description">
          ایمیل حساب خود را وارد کنید. در
          فاز احراز هویت، پیام بازیابی
          به‌صورت آزمایشی شبیه‌سازی
          می‌شود.
        </p>

        <form
          className="auth-form"
          onSubmit={(event) =>
            event.preventDefault()
          }
        >
          <Input
            name="email"
            type="email"
            label="ایمیل حساب"
            placeholder="name@example.com"
            autoComplete="email"
          />

          <Button
            type="submit"
            fullWidth
            size="large"
          >
            ارسال لینک بازیابی
          </Button>
        </form>

        <Link
          className="back-link"
          to={APP_PATHS.login}
        >
          بازگشت به صفحه ورود
        </Link>
      </section>
    </main>
  );
}