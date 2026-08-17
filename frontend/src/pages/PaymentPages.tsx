import { Link, useSearchParams } from 'react-router-dom';

import Icon from '../components/Icon';

function tierLabel(tier: string | null) {
  if (tier === 'gold') return 'طلایی';
  if (tier === 'silver') return 'نقره‌ای';
  return 'پایه';
}

export function MockPaymentPage() {
  const [params] = useSearchParams();
  const authority = params.get('authority');
  const transaction = params.get('transaction');
  const tier = params.get('tier');
  const duration = params.get('duration');
  const amount = Number(params.get('amount') || 0);

  const verifyUrl = (status: 'OK' | 'NOK') => {
    if (!authority) return '#';
    const query = new URLSearchParams({
      Authority: authority,
      Status: status,
      redirect: '1',
    });
    return `/api/billing/payments/verify/?${query.toString()}`;
  };

  if (!authority || !transaction) {
    return (
      <section className="payment-flow-page">
        <div className="payment-flow-card payment-flow-error">
          <span className="payment-flow-icon"><Icon name="warning" size={34} /></span>
          <span className="eyebrow">درگاه آزمایشی</span>
          <h1>اطلاعات تراکنش ناقص است</h1>
          <p>این صفحه باید از مسیر خرید اشتراک باز شود. دوباره از تنظیمات، خرید اشتراک را شروع کنید.</p>
          <Link className="button button-primary" to="/settings">بازگشت به تنظیمات</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-flow-page">
      <div className="payment-flow-card">
        <div className="mock-gateway-brand">
          <span className="payment-flow-icon"><Icon name="wallet" size={34} /></span>
          <div><span className="eyebrow">Mock Payment Gateway</span><h1>درگاه پرداخت آزمایشی آوازیفای</h1></div>
        </div>
        <p className="payment-flow-note">این صفحه برای دموی فاز بک‌اند است و هیچ مبلغ واقعی از حساب بانکی کسر نمی‌کند.</p>

        <div className="payment-detail-grid">
          <div><span>پلن</span><strong>{tierLabel(tier)}</strong></div>
          <div><span>مدت</span><strong>{duration || '۱'} ماه</strong></div>
          <div><span>مبلغ</span><strong>{amount.toLocaleString('fa-IR')} تومان</strong></div>
          <div><span>شناسه تراکنش</span><strong className="payment-transaction-id">{transaction}</strong></div>
        </div>

        <div className="payment-demo-bank-card">
          <span>کارت آزمایشی</span>
          <strong dir="ltr">6037 •••• •••• 1108</strong>
          <small>در این محیط نیازی به وارد کردن اطلاعات واقعی کارت نیست.</small>
        </div>

        <div className="payment-flow-actions">
          <a className="button button-primary" href={verifyUrl('OK')}>پرداخت موفق آزمایشی</a>
          <a className="button button-ghost" href={verifyUrl('NOK')}>انصراف از پرداخت</a>
        </div>
      </div>
    </section>
  );
}

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const outcome = params.get('outcome') || 'failed';
  const transaction = params.get('transaction');
  const reference = params.get('reference');
  const message = params.get('message');
  const success = outcome === 'success';
  const cancelled = outcome === 'cancelled';

  return (
    <section className="payment-flow-page">
      <div className={`payment-flow-card payment-result-card ${success ? 'success' : cancelled ? 'cancelled' : 'failed'}`}>
        <span className="payment-flow-icon">
          <Icon name={success ? 'check' : cancelled ? 'x' : 'warning'} size={36} />
        </span>
        <span className="eyebrow">نتیجه پرداخت</span>
        <h1>{success ? 'پرداخت با موفقیت تأیید شد' : cancelled ? 'پرداخت لغو شد' : 'پرداخت تأیید نشد'}</h1>
        <p>{message || (success ? 'اشتراک شما در بک‌اند فعال شده است.' : 'می‌توانید دوباره عملیات خرید را انجام دهید.')}</p>

        {transaction ? (
          <div className="payment-result-meta">
            <div><span>شناسه تراکنش</span><strong>{transaction}</strong></div>
            {reference ? <div><span>شماره مرجع</span><strong>{reference}</strong></div> : null}
          </div>
        ) : null}

        <div className="payment-flow-actions">
          <Link className="button button-primary" to="/settings">مشاهده اشتراک در تنظیمات</Link>
          <Link className="button button-ghost" to="/home">بازگشت به خانه</Link>
        </div>
      </div>
    </section>
  );
}
