import { useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { APP_PATHS } from '../../../config/paths';

type RegisterMode = 'listener' | 'artist';

// Registration page foundation.
export default function RegisterPage() {
  const [mode, setMode] = useState<RegisterMode>('listener');

  return (
    <main className="auth-shell auth-shell-register">
      <section
        className="auth-visual auth-visual-register"
        aria-label="ثبت‌نام در آوازیفای"
      >
        <div className="auth-visual-content">
          <div className="auth-brand-mark">A</div>

          <p className="auth-visual-eyebrow">
            CREATE YOUR ACCOUNT
          </p>

          <h1>
            یک حساب برای شنیدن، یا یک حساب برای ساختن موسیقی.
          </h1>

          <p>
            ساختار فرم ثبت‌نام کاربران عادی و هنرمندان در این صفحه
            آماده شده است.
          </p>
        </div>
      </section>

      <section className="auth-form-panel auth-form-panel-wide">
        <div className="auth-form-card auth-form-card-wide">
          <div className="auth-form-heading">
            <p className="page-eyebrow">ایجاد حساب جدید</p>

            <h2>ثبت‌نام در آوازیفای</h2>

            <p>
              نوع حساب موردنظر خود را انتخاب کنید.
            </p>
          </div>

          <div
            className="segmented-control"
            role="tablist"
            aria-label="نوع حساب"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'listener'}
              className={
                mode === 'listener'
                  ? 'segmented-control-active'
                  : ''
              }
              onClick={() => setMode('listener')}
            >
              کاربر عادی
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === 'artist'}
              className={
                mode === 'artist'
                  ? 'segmented-control-active'
                  : ''
              }
              onClick={() => setMode('artist')}
            >
              حساب هنرمند
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={(event) => event.preventDefault()}
          >
            {mode === 'listener' ? (
              <>
                <div className="form-grid form-grid-two">
                  <Input
                    name="displayName"
                    type="text"
                    label="نام نمایشی"
                    placeholder="مثلاً نیما"
                    autoComplete="name"
                  />

                  <Input
                    name="email"
                    type="email"
                    label="ایمیل"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />

                  <Input
                    name="password"
                    type="password"
                    label="رمز عبور"
                    placeholder="حداقل ۸ کاراکتر"
                    autoComplete="new-password"
                  />

                  <Input
                    name="confirmPassword"
                    type="password"
                    label="تکرار رمز عبور"
                    placeholder="رمز عبور را تکرار کنید"
                    autoComplete="new-password"
                  />

                  <Input
                    name="birthDate"
                    type="date"
                    label="تاریخ تولد"
                  />

                  <label
                    className="ui-field"
                    htmlFor="gender"
                  >
                    <span className="ui-field-label">
                      جنسیت
                    </span>

                    <span className="ui-input-wrapper">
                      <select
                        id="gender"
                        name="gender"
                        className="ui-input ui-select"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          انتخاب کنید
                        </option>

                        <option value="female">
                          زن
                        </option>

                        <option value="male">
                          مرد
                        </option>

                        <option value="other">
                          سایر / ترجیح می‌دهم نگویم
                        </option>
                      </select>
                    </span>
                  </label>
                </div>

                <label className="ui-checkbox ui-checkbox-policy">
                  <input
                    name="acceptPrivacyPolicy"
                    type="checkbox"
                  />

                  <span>
                    با{' '}
                    <button
                      type="button"
                      className="inline-text-button"
                    >
                      سیاست حریم خصوصی
                    </button>{' '}
                    موافقم.
                  </span>
                </label>
              </>
            ) : (
              <>
                <div className="form-grid form-grid-two">
                  <Input
                    name="artistName"
                    type="text"
                    label="نام هنری"
                    placeholder="نامی که نمایش داده می‌شود"
                    autoComplete="name"
                  />

                  <Input
                    name="artistEmail"
                    type="email"
                    label="ایمیل"
                    placeholder="artist@example.com"
                    autoComplete="email"
                  />

                  <Input
                    name="artistPassword"
                    type="password"
                    label="رمز عبور"
                    placeholder="حداقل ۸ کاراکتر"
                    autoComplete="new-password"
                  />

                  <Input
                    name="portfolioUrl"
                    type="url"
                    label="لینک نمونه‌کار"
                    placeholder="https://example.com/portfolio"
                  />
                </div>

                <div className="upload-placeholder">
                  <span
                    className="upload-placeholder-icon"
                    aria-hidden="true"
                  >
                    ↑
                  </span>

                  <div>
                    <strong>
                      بارگذاری نمونه‌کار
                    </strong>

                    <p>
                      اتصال فایل واقعی در فازهای بعدی انجام می‌شود.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                  >
                    انتخاب فایل
                  </Button>
                </div>

                <div className="status-note">
                  پس از ارسال درخواست، حساب هنرمند در وضعیت
                  «در انتظار تأیید» قرار می‌گیرد.
                </div>
              </>
            )}

            <Button
              type="submit"
              fullWidth
              size="large"
            >
              {mode === 'listener'
                ? 'ایجاد حساب کاربری'
                : 'ارسال درخواست هنرمندی'}
            </Button>
          </form>

          <p className="auth-switch-text">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link to={APP_PATHS.login}>
              وارد شوید
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}