import Button from '../../../components/Button';

import PhasePlaceholder from '../components/PhasePlaceholder';

import { useAuth } from '../hooks/useAuth';

import type {
  NotificationPreferences,
} from '../types';

import {
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

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

// Application settings from central state.
export default function SettingsPage() {
  const {
    currentUser,
    updateSettings,
  } = useAuth();

  if (!currentUser) {
    return (
      <section className="profile-not-found">
        <h1>
          حساب فعالی وجود ندارد
        </h1>

        <p>
          برای مدیریت تنظیمات، یک حساب
          آزمایشی انتخاب کنید.
        </p>
      </section>
    );
  }

  const updateNotification = (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    updateSettings({
      notifications: {
        ...currentUser.settings
          .notifications,

        [key]: value,
      },
    });
  };

  const showListenerNotifications =
    currentUser.role === 'listener' ||
    currentUser.role === 'artist';

  const showArtistNotifications =
    currentUser.role === 'artist';

  const showStaffNotifications =
    currentUser.role === 'support' ||
    currentUser.role === 'admin';

  return (
    <PhasePlaceholder
      eyebrow="User Module / User Settings State"
      title="تنظیمات برنامه"
      description="تنظیمات اکنون بخشی از مدل User هستند و تغییر آن‌ها در تمام کامپوننت‌های متصل به AuthContext به‌صورت هم‌زمان اعمال می‌شود."
      items={[
        'مدل یکپارچه UserSettings و NotificationPreferences',
        'نمایش گزینه‌های اعلان متناسب با نقش حساب فعال',
        'به‌روزرسانی تنظیمات در حافظه مرکزی بدون داده ثابت صفحه',
        'آماده‌سازی کامل برای ذخیره در Local Storage در فاز مربوطه',
      ]}
    >
      <div className="user-state-strip">
        <div>
          <strong>
            {currentUser.displayName}
          </strong>

          <span>
            {getRoleLabel(
              currentUser.role,
            )}{' '}
            ·{' '}
            {getSubscriptionLabel(
              currentUser.subscription
                .tier,
            )}
          </span>
        </div>

        <code>
          {currentUser.settings.language}
        </code>
      </div>

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

          {showListenerNotifications ? (
            <>
              <SettingToggle
                label="انتشار آثار جدید"
                description="انتشار آثار هنرمندانی که دنبال می‌کنید به شما اطلاع داده شود."
                checked={
                  currentUser.settings
                    .notifications
                    .newReleases
                }
                onChange={() =>
                  updateNotification(
                    'newReleases',
                    !currentUser.settings
                      .notifications
                      .newReleases,
                  )
                }
              />

              <SettingToggle
                label="هشدار اشتراک"
                description="پیش از پایان اعتبار اشتراک، اعلان دریافت کنید."
                checked={
                  currentUser.settings
                    .notifications
                    .subscriptionExpiry
                }
                onChange={() =>
                  updateNotification(
                    'subscriptionExpiry',
                    !currentUser.settings
                      .notifications
                      .subscriptionExpiry,
                  )
                }
              />
            </>
          ) : null}

          {showArtistNotifications ? (
            <>
              <SettingToggle
                label="نتیجه احراز هویت هنرمند"
                description="نتیجه تأیید یا رد درخواست هنرمندی برای شما ارسال شود."
                checked={
                  currentUser.settings
                    .notifications
                    .artistVerification
                }
                onChange={() =>
                  updateNotification(
                    'artistVerification',
                    !currentUser.settings
                      .notifications
                      .artistVerification,
                  )
                }
              />

              <SettingToggle
                label="گزارش مالی ماهانه"
                description="پس از محاسبه درآمد ماهانه، اعلان دریافت کنید."
                checked={
                  currentUser.settings
                    .notifications
                    .financialReports
                }
                onChange={() =>
                  updateNotification(
                    'financialReports',
                    !currentUser.settings
                      .notifications
                      .financialReports,
                  )
                }
              />
            </>
          ) : null}

          {showStaffNotifications ? (
            <>
              <SettingToggle
                label="تیکت‌های جدید"
                description="ثبت تیکت جدید کاربران به شما اطلاع داده شود."
                checked={
                  currentUser.settings
                    .notifications
                    .supportTickets
                }
                onChange={() =>
                  updateNotification(
                    'supportTickets',
                    !currentUser.settings
                      .notifications
                      .supportTickets,
                  )
                }
              />

              <SettingToggle
                label="درخواست تأیید هنرمند"
                description="ثبت درخواست احراز هویت جدید به شما اطلاع داده شود."
                checked={
                  currentUser.settings
                    .notifications
                    .artistVerification
                }
                onChange={() =>
                  updateNotification(
                    'artistVerification',
                    !currentUser.settings
                      .notifications
                      .artistVerification,
                  )
                }
              />
            </>
          ) : null}
        </section>

        <section className="content-card settings-card">
          <div className="content-card-heading">
            <div>
              <p className="page-eyebrow">
                Application
              </p>

              <h2>
                تنظیمات عمومی
              </h2>
            </div>
          </div>

          <SettingToggle
            label="افکت‌های صوتی برنامه"
            description="صدای تعامل با کنترل‌های برنامه فعال باشد."
            checked={
              currentUser.settings
                .soundEnabled
            }
            onChange={() =>
              updateSettings({
                soundEnabled:
                  !currentUser.settings
                    .soundEnabled,
              })
            }
          />

          <label
            className="setting-select-row"
            htmlFor="language"
          >
            <div>
              <strong>
                زبان برنامه
              </strong>

              <p>
                زبان ترجیحی رابط کاربری
                را انتخاب کنید.
              </p>
            </div>

            <select
              id="language"
              value={
                currentUser.settings
                  .language
              }
              onChange={(event) =>
                updateSettings({
                  language:
                    event.target.value ===
                    'en'
                      ? 'en'
                      : 'fa',
                })
              }
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
              <strong>
                {getSubscriptionLabel(
                  currentUser
                    .subscription
                    .tier,
                )}
              </strong>

              <p>
                سطح اشتراک از مدل مرکزی
                حساب فعال دریافت می‌شود.
              </p>
            </div>

            <span
              className={`subscription-pill subscription-pill-${currentUser.subscription.tier}`}
            >
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
            حذف واقعی حساب در این فاز
            انجام نمی‌شود و بعداً به
            پنجره تأیید و Backend متصل
            خواهد شد.
          </p>

          <Button variant="danger">
            حذف حساب
          </Button>
        </section>
      </div>
    </PhasePlaceholder>
  );
}