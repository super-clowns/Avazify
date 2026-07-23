import {
  useState,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import Button from '../../../components/Button';
import Input from '../../../components/Input';

import {
  APP_PATHS,
} from '../../../config/paths';

import {
  demoLoginOptions,
} from '../data/mockCredentials';

import { useAuth } from '../hooks/useAuth';

import {
  validateLoginForm,
  type FormErrors,
} from '../utils/authValidation';

import {
  getRoleHomePath,
} from '../utils/userPresentation';

interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Login with mock authentication.
export default function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] =
    useState<LoginFormState>({
      email: '',
      password: '',
      rememberMe: false,
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    authenticationError,
    setAuthenticationError,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const updateField = (
    field: keyof LoginFormState,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: '',
    }));

    setAuthenticationError('');
  };

  const fillDemoAccount = (
    email: string,
    password: string,
  ) => {
    setForm({
      email,
      password,
      rememberMe: false,
    });

    setErrors({});
    setAuthenticationError('');
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationErrors =
      validateLoginForm(form);

    if (
      Object.keys(
        validationErrors,
      ).length > 0
    ) {
      setErrors(
        validationErrors,
      );

      return;
    }

    setIsSubmitting(true);

    const result = login(form);

    setIsSubmitting(false);

    if (
      !result.success ||
      !result.user
    ) {
      setAuthenticationError(
        result.message,
      );

      return;
    }

    navigate(
      getRoleHomePath(
        result.user,
      ),
      {
        replace: true,
      },
    );
  };

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
            موسیقی را پیدا کن،
            ذخیره کن و هرجا خواستی
            گوش بده.
          </h1>

          <p>
            با ورود به حساب، رابط
            کاربری متناسب با نقش و
            اشتراک شما نمایش داده
            می‌شود.
          </p>

          <div className="auth-feature-list">
            <span>
              احراز هویت آزمایشی
            </span>

            <span>
              هدایت براساس نقش
            </span>

            <span>
              مسیرهای محافظت‌شده
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
              ایمیل و رمز عبور حساب
              خود را وارد کنید.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {authenticationError ? (
              <div
                className="auth-alert auth-alert-error"
                role="alert"
              >
                <span className="auth-alert-icon">
                  !
                </span>

                <span>
                  {authenticationError}
                </span>
              </div>
            ) : null}

            <Input
              name="email"
              type="email"
              label="ایمیل"
              placeholder="name@example.com"
              autoComplete="email"
              value={form.email}
              error={errors.email}
              startIcon="✉"
              onChange={(event) =>
                updateField(
                  'email',
                  event.target.value,
                )
              }
            />

            <Input
              name="password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              label="رمز عبور"
              placeholder="حداقل ۸ کاراکتر"
              autoComplete="current-password"
              value={form.password}
              error={errors.password}
              startIcon="●"
              onChange={(event) =>
                updateField(
                  'password',
                  event.target.value,
                )
              }
            />

            <div className="auth-secondary-options">
              <label className="ui-checkbox">
                <input
                  type="checkbox"
                  checked={
                    form.rememberMe
                  }
                  onChange={(event) =>
                    updateField(
                      'rememberMe',
                      event.target
                        .checked,
                    )
                  }
                />

                <span>
                  مرا به خاطر بسپار
                </span>
              </label>

              <label className="auth-show-password">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) =>
                    setShowPassword(
                      event.target
                        .checked,
                    )
                  }
                />

                <span>
                  نمایش رمز عبور
                </span>
              </label>
            </div>

            <div className="auth-form-row">
              <span />

              <Link
                to={
                  APP_PATHS
                    .forgotPassword
                }
              >
                فراموشی رمز عبور
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="large"
              isLoading={isSubmitting}
            >
              ورود به حساب
            </Button>
          </form>

          <p className="auth-switch-text">
            حساب کاربری ندارید؟{' '}
            <Link
              to={APP_PATHS.register}
            >
              ثبت‌نام کنید
            </Link>
          </p>

          <div className="auth-demo-panel">
            <div className="auth-demo-panel-heading">
              <strong>
                حساب‌های آزمایشی
              </strong>

              <span>
                برای پرکردن خودکار
                فرم، یکی از نقش‌ها را
                انتخاب کنید.
              </span>
            </div>

            <div className="auth-demo-grid">
              {demoLoginOptions.map(
                (option) => (
                  <button
                    type="button"
                    className="auth-demo-button"
                    key={option.email}
                    onClick={() =>
                      fillDemoAccount(
                        option.email,
                        option.password,
                      )
                    }
                  >
                    <strong>
                      {option.label}
                    </strong>

                    <span>
                      {
                        option.description
                      }
                    </span>
                  </button>
                ),
              )}
            </div>

            <p className="auth-password-note">
              رمز تمام حساب‌ها:{' '}
              <code>
                Demo1234!
              </code>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}