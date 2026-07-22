import { useState } from 'react';

import Button from '../../../components/Button';
import PhasePlaceholder from '../components/PhasePlaceholder';

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`toggle-switch ${
          checked
            ? 'toggle-switch-on'
            : ''
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}

// Application settings foundation.
export default function SettingsPage() {
  const [
    newReleaseNotifications,
    setNewReleaseNotifications,
  ] = useState(true);

  const [
    subscriptionNotifications,
    setSubscriptionNotifications,
  ] = useState(true);

  const [
    soundEffects,
    setSoundEffects,
  ] = useState(false);

  return (
    <PhasePlaceholder
      eyebrow="User Module / Settings"
      title="تنظیمات برنامه"
      description="چیدمان تنظیمات اعلانات، صدا، زبان، اشتراک و حذف حساب آماده است. ذخیره دائمی تنظیمات در فاز Local Storage انجام می‌شود."
      items={[
        'تفکیک تنظیمات عمومی، اعلانات و حساب کاربری',
        'کنترل‌های قابل تعامل برای پیش‌نمایش رابط کاربری',
        'نمایش اشتراک فعلی و مسیر ارتقای آینده',
        'بخش خطر برای حذف حساب با قابلیت اتصال به پنجره تأیید',
      ]}
    >
      <div className="settings-grid">
        <section className="content-card settings-card">
          <div className="content-card-heading">
            <div>
              <p className="page-eyebrow">
                Notifications
              </p>

              <h2>اعلانات</h2>
            </div>
          </div>

          <SettingToggle
            label="انتشار آثار جدید"
            description="انتشار آثار هنرمندانی که دنبال می‌کنید به شما اطلاع داده شود."
            checked={
              newReleaseNotifications
            }
            onChange={() =>
              setNewReleaseNotifications(
                (current) => !current,
              )
            }
          />

          <SettingToggle
            label="هشدار اشتراک"
            description="پیش از پایان اعتبار اشتراک، اعلان دریافت کنید."
            checked={
              subscriptionNotifications
            }
            onChange={() =>
              setSubscriptionNotifications(
                (current) => !current,
              )
            }
          />
        </section>

        <section className="content-card settings-card">
          <div className="content-card-heading">
            <div>
              <p className="page-eyebrow">
                Application
              </p>

              <h2>تنظیمات عمومی</h2>
            </div>
          </div>

          <SettingToggle
            label="افکت‌های صوتی برنامه"
            description="صدای تعامل با کنترل‌های برنامه فعال باشد."
            checked={soundEffects}
            onChange={() =>
              setSoundEffects(
                (current) => !current,
              )
            }
          />

          <label
            className="setting-select-row"
            htmlFor="language"
          >
            <div>
              <strong>زبان برنامه</strong>

              <p>
                زبان رابط کاربری را
                انتخاب کنید.
              </p>
            </div>

            <select
              id="language"
              defaultValue="fa"
            >
              <option value="fa">
                فارسی
              </option>

              <option value="en">
                English
              </option>
            </select>
          </label>
        </section>

        <section className="content-card settings-card">
          <div className="content-card-heading">
            <div>
              <p className="page-eyebrow">
                Subscription
              </p>

              <h2>اشتراک</h2>
            </div>
          </div>

          <div className="subscription-settings-row">
            <div className="subscription-summary-icon">
              ◇
            </div>

            <div>
              <strong>اشتراک پایه</strong>

              <p>
                پلن رایگان با محدودیت
                ۶۰ استریم روزانه
              </p>
            </div>

            <span className="subscription-pill subscription-pill-free">
              فعال
            </span>
          </div>

          <Button fullWidth>
            ارتقا یا تغییر اشتراک
          </Button>
        </section>

        <section className="content-card settings-card danger-card">
          <div className="content-card-heading">
            <div>
              <p className="page-eyebrow">
                Danger zone
              </p>

              <h2>
                حذف حساب کاربری
              </h2>
            </div>
          </div>

          <p>
            پس از اتصال به بک‌اند، این
            عملیات با تأیید دوباره و کنترل
            امنیتی انجام خواهد شد.
          </p>

          <Button variant="danger">
            حذف حساب
          </Button>
        </section>
      </div>
    </PhasePlaceholder>
  );
}