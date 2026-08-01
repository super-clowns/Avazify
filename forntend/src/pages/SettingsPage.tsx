import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SubscriptionBadge } from '../components/Badges';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import type { NotificationPreferences, SubscriptionTier } from '../types';

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="setting-row">
      <div><strong>{label}</strong><p>{description}</p></div>
      <button type="button" className={`toggle ${checked ? 'on' : ''}`} role="switch" aria-checked={checked} onClick={onChange}><span /></button>
    </div>
  );
}

export default function SettingsPage() {
  const {
    currentUser,
    data,
    updateSettings,
    upgradeSubscription,
    deleteCurrentUser,
    resetDemoData,
  } = useAppState();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(currentUser?.subscription ?? 'free');
  const [duration, setDuration] = useState<1 | 3 | 6 | 12>(1);

  if (!currentUser) return null;

  const updateNotification = (key: keyof NotificationPreferences) => {
    updateSettings({
      notifications: {
        ...currentUser.settings.notifications,
        [key]: !currentUser.settings.notifications[key],
      },
    });
  };

  const handlePlan = async () => {
    const result = await upgradeSubscription(selectedPlan, duration);
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setSubscriptionOpen(false);
  };

  const planPrice = selectedPlan === 'silver' ? data.prices.silver : selectedPlan === 'gold' ? data.prices.gold : 0;
  const finalPrice = planPrice * duration;
  const discount = duration === 12 ? 0.15 : duration === 6 ? 0.08 : duration === 3 ? 0.03 : 0;
  const payable = Math.round(finalPrice * (1 - discount));

  const handleReset = async () => {
    const result = await resetDemoData();
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setResetOpen(false);
      navigate('/login', { replace: true });
    }
  };

  const handleDelete = async () => {
    const result = await deleteCurrentUser();
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setDeleteOpen(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="تنظیمات" title="تنظیمات برنامه و حساب" description="اعلانات، صدا، زبان، اشتراک و داده‌های حساب را مدیریت کنید." />

      <div className="settings-layout">
        <div className="settings-main">
          <section className="content-card settings-section">
            <div className="card-heading"><div><span className="eyebrow">اعلانات</span><h2>ترجیحات اعلان</h2><p>نوع اعلان‌هایی را که می‌خواهید دریافت کنید مشخص کنید.</p></div><span className="section-icon purple"><Icon name="bell" /></span></div>
            {currentUser.role === 'listener' ? (
              <>
                <ToggleRow label="انتشار آثار هنرمندان دنبال‌شده" description="برای آلبوم‌ها و تک‌آهنگ‌های تازه اعلان دریافت کنید." checked={currentUser.settings.notifications.followedArtistReleases} onChange={() => updateNotification('followedArtistReleases')} />
                <ToggleRow label="هشدار پایان اشتراک" description="پیش از پایان اعتبار اشتراک نقره‌ای یا طلایی اطلاع‌رسانی شود." checked={currentUser.settings.notifications.subscriptionExpiry} onChange={() => updateNotification('subscriptionExpiry')} />
              </>
            ) : null}
            {currentUser.role === 'artist' ? (
              <>
                <ToggleRow label="نتیجه احراز هویت" description="نتیجه تأیید یا رد حساب هنرمندی اطلاع داده شود." checked={currentUser.settings.notifications.artistVerification} onChange={() => updateNotification('artistVerification')} />
                <ToggleRow label="گزارش مالی ماهانه" description="پس از آماده‌شدن محاسبات مالی، اعلان دریافت کنید." checked={currentUser.settings.notifications.financialReports} onChange={() => updateNotification('financialReports')} />
              </>
            ) : null}
            {currentUser.role === 'support' || currentUser.role === 'admin' ? (
              <>
                <ToggleRow label="تیکت‌های جدید" description="ثبت تیکت جدید کاربران به شما اطلاع داده شود." checked={currentUser.settings.notifications.supportTickets} onChange={() => updateNotification('supportTickets')} />
                <ToggleRow label="درخواست احراز هویت هنرمند" description="درخواست‌های تازه هنرمندان در اعلان‌ها نمایش داده شود." checked={currentUser.settings.notifications.artistVerification} onChange={() => updateNotification('artistVerification')} />
              </>
            ) : null}
          </section>

          <section className="content-card settings-section">
            <div className="card-heading"><div><span className="eyebrow">برنامه</span><h2>تنظیمات عمومی</h2><p>رفتار رابط کاربری در این دستگاه را شخصی‌سازی کنید.</p></div><span className="section-icon blue"><Icon name="settings" /></span></div>
            <ToggleRow label="افکت‌های صوتی رابط" description="بازخورد صوتی کنترل‌های برنامه فعال باشد." checked={currentUser.settings.soundEnabled} onChange={() => updateSettings({ soundEnabled: !currentUser.settings.soundEnabled })} />
            <ToggleRow label="نمای فشرده" description="فاصله کارت‌ها و ردیف‌ها برای نمایش اطلاعات بیشتر کاهش پیدا کند." checked={currentUser.settings.compactMode} onChange={() => updateSettings({ compactMode: !currentUser.settings.compactMode })} />
            <label className="setting-select-row">
              <div><strong>زبان برنامه</strong><p>زبان رابط کاربری و قالب نمایش محتوا را انتخاب کنید.</p></div>
              <select value={currentUser.settings.language} onChange={(event) => updateSettings({ language: event.target.value === 'en' ? 'en' : 'fa' })}><option value="fa">فارسی</option><option value="en">English</option></select>
            </label>
          </section>

          <section className="content-card settings-section danger-section">
            <div className="card-heading"><div><span className="eyebrow danger-text">ناحیه حساس</span><h2>مدیریت داده‌ها و حساب</h2><p>این عملیات قابل بازگشت نیست یا داده‌های فعلی را پاک می‌کند.</p></div><span className="section-icon red"><Icon name="warning" /></span></div>
            <div className="danger-action-row"><div><strong>بازنشانی داده‌های آزمایشی</strong><p>داده‌های نمایشی پایگاه داده به وضعیت اولیه بازمی‌گردند؛ این گزینه فقط برای مدیر فعال است.</p></div><button type="button" className="button button-secondary" disabled={currentUser.role !== 'admin'} onClick={() => setResetOpen(true)}>بازنشانی داده‌ها</button></div>
            <div className="danger-action-row"><div><strong>حذف حساب کاربری</strong><p>حساب فعلی، پلی‌لیست‌ها و اعلانات مربوط به آن حذف می‌شوند.</p></div><button type="button" className="button button-danger" onClick={() => setDeleteOpen(true)}>حذف حساب</button></div>
          </section>
        </div>

        <aside className="settings-aside">
          <section className={`plan-card plan-${currentUser.subscription}`}>
            <div className="plan-card-head"><span className="plan-icon"><Icon name={currentUser.subscription === 'gold' ? 'crown' : 'music'} size={27} /></span><SubscriptionBadge tier={currentUser.subscription} /></div>
            <span className="eyebrow">اشتراک فعال</span>
            <h2>{currentUser.subscription === 'gold' ? 'طلایی' : currentUser.subscription === 'silver' ? 'نقره‌ای' : 'پایه'}</h2>
            <p>{currentUser.subscription === 'free' ? 'مناسب برای شروع و گوش‌دادن روزانه.' : currentUser.subscription === 'silver' ? 'استریم نامحدود و دانلود آفلاین.' : 'کامل‌ترین تجربه همراه با دسترسی زودهنگام.'}</p>
            <ul>
              <li><Icon name="check" /> {currentUser.subscription === 'free' ? '۶۰ استریم در روز' : 'استریم نامحدود'}</li>
              <li><Icon name="check" /> {currentUser.subscription === 'free' ? 'حداکثر ۶ پلی‌لیست' : currentUser.subscription === 'silver' ? 'حداکثر ۱۰۰ پلی‌لیست' : 'پلی‌لیست نامحدود'}</li>
              <li><Icon name={currentUser.subscription === 'free' ? 'x' : 'check'} /> دانلود آفلاین</li>
              <li><Icon name={currentUser.subscription === 'gold' ? 'check' : 'x'} /> دسترسی زودهنگام</li>
            </ul>
            <button type="button" className="button button-primary full" onClick={() => { setSelectedPlan(currentUser.subscription); setSubscriptionOpen(true); }}>تغییر یا ارتقای اشتراک</button>
          </section>
          <section className="storage-card"><span><Icon name="info" /></span><div><strong>همگام‌سازی بک‌اند</strong><p>حساب، تنظیمات، پلی‌لیست‌ها و تعاملات در پایگاه داده ذخیره و میان دستگاه‌ها همگام می‌شوند.</p></div></section>
        </aside>
      </div>

      <Modal open={subscriptionOpen} title="انتخاب اشتراک" description="پرداخت از طریق لایه درگاه بک‌اند انجام می‌شود؛ محیط توسعه از درگاه Mock استفاده می‌کند." onClose={() => setSubscriptionOpen(false)} size="large" footer={<><button type="button" className="button button-ghost" onClick={() => setSubscriptionOpen(false)}>انصراف</button><button type="button" className="button button-primary" onClick={handlePlan}>تأیید و پرداخت</button></>}>
        <div className="plan-picker-grid">
          {(['free', 'silver', 'gold'] as SubscriptionTier[]).map((tier) => (
            <button type="button" key={tier} className={`plan-option plan-option-${tier} ${selectedPlan === tier ? 'selected' : ''}`} onClick={() => setSelectedPlan(tier)}>
              <span className="plan-option-check">{selectedPlan === tier ? <Icon name="check" /> : null}</span>
              <Icon name={tier === 'gold' ? 'crown' : tier === 'silver' ? 'sparkles' : 'music'} size={27} />
              <strong>{tier === 'gold' ? 'طلایی' : tier === 'silver' ? 'نقره‌ای' : 'پایه'}</strong>
              <span>{tier === 'free' ? 'رایگان' : `${(tier === 'silver' ? data.prices.silver : data.prices.gold).toLocaleString('fa-IR')} تومان / ماه`}</span>
            </button>
          ))}
        </div>
        {selectedPlan !== 'free' ? (
          <div className="checkout-box">
            <label><span>مدت اشتراک</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value) as 1 | 3 | 6 | 12)}><option value={1}>۱ ماهه</option><option value={3}>۳ ماهه - ۳٪ تخفیف</option><option value={6}>۶ ماهه - ۸٪ تخفیف</option><option value={12}>۱۲ ماهه - ۱۵٪ تخفیف</option></select></label>
            <div><span>مبلغ قابل پرداخت</span><strong>{payable.toLocaleString('fa-IR')} تومان</strong></div>
          </div>
        ) : null}
      </Modal>

      <Modal open={resetOpen} title="بازنشانی داده‌های نمایشی" onClose={() => setResetOpen(false)} size="small" footer={<><button type="button" className="button button-ghost" onClick={() => setResetOpen(false)}>انصراف</button><button type="button" className="button button-danger" onClick={handleReset}>تأیید بازنشانی</button></>}>
        <div className="confirm-content"><span className="confirm-icon warning"><Icon name="warning" size={28} /></span><p>تمام تغییرات، حساب‌های تازه، پلی‌لیست‌ها و وضعیت اعلانات حذف می‌شوند و باید دوباره وارد شوید.</p></div>
      </Modal>

      <Modal open={deleteOpen} title="حذف حساب کاربری" onClose={() => setDeleteOpen(false)} size="small" footer={<><button type="button" className="button button-ghost" onClick={() => setDeleteOpen(false)}>انصراف</button><button type="button" className="button button-danger" onClick={handleDelete}>حذف دائمی حساب</button></>}>
        <div className="confirm-content"><span className="confirm-icon danger"><Icon name="trash" size={28} /></span><p>حساب «{currentUser.displayName}» و تمام داده‌های وابسته به آن از پایگاه داده حذف می‌شود.</p></div>
      </Modal>
    </div>
  );
}
