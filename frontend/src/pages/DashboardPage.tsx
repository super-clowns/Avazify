import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import Icon, { type IconName } from '../components/Icon';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import type { ArtistRequest, SupportTicket, TicketStatus } from '../types';

const ticketStatusLabel: Record<TicketStatus, string> = { open: 'باز', answered: 'پاسخ داده‌شده', closed: 'بسته‌شده' };

function RequestReviewModal({ request, onClose }: { request: ArtistRequest | null; onClose: () => void }) {
  const { reviewArtistRequest } = useAppState();
  const { pushToast } = useToast();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const approve = async () => {
    if (!request) return;
    const result = await reviewArtistRequest(request.id, true);
    pushToast(result.success ? 'حساب هنرمند تأیید و اعلان نتیجه ارسال شد.' : result.message, result.success ? 'success' : 'error');
    if (result.success) onClose();
  };

  const reject = async () => {
    if (!request) return;
    if (reason.trim().length < 10) return pushToast('علت رد را با حداقل ۱۰ کاراکتر وارد کنید.', 'error');
    const result = await reviewArtistRequest(request.id, false, reason.trim());
    pushToast(result.success ? 'درخواست رد و علت برای هنرمند ارسال شد.' : result.message, result.success ? 'success' : 'error');
    if (result.success) onClose();
  };

  return (
    <Modal
      open={request !== null}
      title="بررسی درخواست هنرمند"
      description={request ? `${request.artistName} · ${request.email}` : undefined}
      onClose={onClose}
      size="medium"
      footer={request?.status === 'pending' ? <><button type="button" className="button button-danger" onClick={() => setRejecting(true)}><Icon name="x" /> رد درخواست</button><button type="button" className="button button-primary" onClick={approve}><Icon name="check" /> تأیید هنرمند</button></> : undefined}
    >
      {request ? (
        <div className="request-review-content">
          <dl className="details-list"><div><dt>نام هنری</dt><dd>{request.artistName}</dd></div><div><dt>ایمیل</dt><dd dir="ltr">{request.email}</dd></div><div><dt>تاریخ ارسال</dt><dd>{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(request.submittedAt))}</dd></div><div><dt>وضعیت</dt><dd><span className={`status-pill status-${request.status}`}>{request.status === 'pending' ? 'در انتظار بررسی' : request.status === 'approved' ? 'تأییدشده' : 'ردشده'}</span></dd></div></dl>
          <div className="portfolio-list"><strong>نمونه‌کارهای ارسالی</strong>{request.portfolio.map((item) => <a href={item.startsWith('http') ? item : undefined} target="_blank" rel="noreferrer" key={item}><span><Icon name={item.startsWith('http') ? 'globe' : 'music'} /></span><div><strong>{item}</strong><small>{item.startsWith('http') ? 'لینک خارجی نمونه‌کار' : 'فایل ضمیمه‌شده'}</small></div><Icon name="arrow" /></a>)}</div>
          {request.rejectionReason ? <div className="form-alert error"><Icon name="warning" /> علت رد: {request.rejectionReason}</div> : null}
          {rejecting ? <div className="rejection-box"><label className="field"><span className="field-label">علت رد درخواست</span><span className="field-control textarea-control"><textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="علت دقیق رد نمونه‌کارها را بنویسید..." /></span></label><div><button type="button" className="button button-ghost small" onClick={() => setRejecting(false)}>انصراف</button><button type="button" className="button button-danger small" onClick={reject}>ارسال نتیجه رد</button></div></div> : null}
        </div>
      ) : null}
    </Modal>
  );
}

function TicketChatModal({ ticket, onClose }: { ticket: SupportTicket | null; onClose: () => void }) {
  const { replyToTicket, setTicketStatus } = useAppState();
  const { pushToast } = useToast();
  const [reply, setReply] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ticket || !reply.trim()) return;
    const result = await replyToTicket(ticket.id, reply);
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setReply('');
  };

  return (
    <Modal open={ticket !== null} title={ticket ? `${ticket.id} · ${ticket.subject}` : 'تیکت'} description={ticket ? `${ticket.userName} · وضعیت ${ticketStatusLabel[ticket.status]}` : undefined} onClose={onClose} size="large">
      {ticket ? (
        <div className="ticket-chat">
          <div className="ticket-messages">{ticket.messages.map((message) => <article className={`chat-message ${message.author}`} key={message.id}><span>{message.author === 'support' ? 'پشتیبانی' : ticket.userName}</span><p>{message.body}</p><small>{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.createdAt))}</small></article>)}</div>
          <form className="ticket-reply-form" onSubmit={submit}><textarea rows={3} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="پاسخ خود را بنویسید..." disabled={ticket.status === 'closed'} /><button type="submit" className="button button-primary" disabled={ticket.status === 'closed' || !reply.trim()}>ارسال پاسخ</button></form>
          <div className="ticket-status-actions"><span>تغییر وضعیت:</span>{(['open', 'answered', 'closed'] as TicketStatus[]).map((status) => <button type="button" className={ticket.status === status ? 'active' : ''} key={status} onClick={async () => { const result = await setTicketStatus(ticket.id, status); pushToast(result.message, result.success ? 'success' : 'error'); }}>{ticketStatusLabel[status]}</button>)}</div>
        </div>
      ) : null}
    </Modal>
  );
}

export default function DashboardPage() {
  const { data, currentUser, settleFinanceRecord, updatePrices } = useAppState();
  const { pushToast } = useToast();
  const [tab, setTab] = useState<'requests' | 'tickets' | 'finance' | 'admin'>('requests');
  const [selectedRequest, setSelectedRequest] = useState<ArtistRequest | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [silver, setSilver] = useState(data.prices.silver);
  const [gold, setGold] = useState(data.prices.gold);

  useEffect(() => {
    setSilver(data.prices.silver);
    setGold(data.prices.gold);
  }, [data.prices.gold, data.prices.silver]);

  const selectedTicket = data.tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  const pendingRequests = data.artistRequests.filter((request) => request.status === 'pending').length;
  const openTickets = data.tickets.filter((ticket) => ticket.status === 'open').length;
  const pendingPayments = data.finance.filter((record) => record.status === 'pending').length;
  const closedTickets = data.tickets.filter((ticket) => ticket.status === 'closed').length;
  const approvedArtists = data.users.filter((user) => user.role === 'artist' && user.artistStatus === 'approved').length;
  const roleIsAdmin = currentUser?.role === 'admin';
  const listenerUsers = data.users.filter((user) => user.role === 'listener');
  const subscriptionCounts = data.billingSummary.subscriptions;
  const totalSubscriptions = Math.max(
    subscriptionCounts.free + subscriptionCounts.silver + subscriptionCounts.gold,
    1,
  );
  const goldPercent = Math.round((subscriptionCounts.gold / totalSubscriptions) * 100);
  const silverPercent = Math.round((subscriptionCounts.silver / totalSubscriptions) * 100);
  const monthlyRevenue = data.billingSummary.monthlyRevenue;

  if (!currentUser || (currentUser.role !== 'support' && currentUser.role !== 'admin')) return null;

  const tabs: { id: typeof tab; label: string; icon: IconName; badge?: number; adminOnly?: boolean }[] = [
    { id: 'requests', label: 'احراز هویت هنرمندان', icon: 'verified', badge: pendingRequests },
    { id: 'tickets', label: 'تیکت‌های پشتیبانی', icon: 'ticket', badge: openTickets },
    { id: 'finance', label: 'حسابرسی مالی', icon: 'wallet', badge: pendingPayments, adminOnly: true },
    { id: 'admin', label: 'اشتراک‌ها و گزارش‌ها', icon: 'chart', adminOnly: true },
  ];

  const settle = async (id: string) => {
    const result = await settleFinanceRecord(id);
    pushToast(result.message, result.success ? 'success' : 'error');
  };

  const savePrices = async (event: FormEvent) => {
    event.preventDefault();
    const result = await updatePrices(silver, gold);
    pushToast(result.message, result.success ? 'success' : 'error');
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow={roleIsAdmin ? 'داشبورد مدیریت' : 'داشبورد پشتیبانی'} title={roleIsAdmin ? 'مدیریت سامانه آوازیفای' : 'مرکز پشتیبانی و احراز هویت'} description={roleIsAdmin ? 'وضعیت کاربران، اشتراک‌ها، امور مالی، تیکت‌ها و درخواست‌های هنرمندان را مدیریت کنید.' : 'تیکت‌های کاربران و درخواست‌های تأیید حساب هنرمندان را بررسی کنید.'} />

      <section className="stats-grid four">
        <article className="stat-card"><span className="stat-icon purple"><Icon name="verified" /></span><div><small>درخواست در انتظار</small><strong>{pendingRequests.toLocaleString('fa-IR')}</strong></div><button type="button" onClick={() => setTab('requests')}>بررسی درخواست‌ها</button></article>
        <article className="stat-card"><span className="stat-icon blue"><Icon name="ticket" /></span><div><small>تیکت باز</small><strong>{openTickets.toLocaleString('fa-IR')}</strong></div><button type="button" onClick={() => setTab('tickets')}>مشاهده تیکت‌ها</button></article>
        <article className="stat-card"><span className="stat-icon pink"><Icon name="users" /></span><div><small>{roleIsAdmin ? 'کاربران سامانه' : 'هنرمندان تأییدشده'}</small><strong>{(roleIsAdmin ? data.users.length : approvedArtists).toLocaleString('fa-IR')}</strong></div><span className="stat-caption">{roleIsAdmin ? 'تمام نقش‌ها' : 'حساب فعال هنرمند'}</span></article>
        {roleIsAdmin ? <article className="stat-card"><span className="stat-icon amber"><Icon name="wallet" /></span><div><small>پرداخت در انتظار</small><strong>{pendingPayments.toLocaleString('fa-IR')}</strong></div><button type="button" onClick={() => setTab('finance')}>حسابرسی مالی</button></article> : <article className="stat-card"><span className="stat-icon amber"><Icon name="check" /></span><div><small>تیکت بسته‌شده</small><strong>{closedTickets.toLocaleString('fa-IR')}</strong></div><span className="stat-caption">در آرشیو پشتیبانی</span></article>}
      </section>

      <section className="dashboard-panel">
        <nav className="dashboard-tabs">
          {tabs.filter((item) => !item.adminOnly || roleIsAdmin).map((item) => <button type="button" className={tab === item.id ? 'active' : ''} key={item.id} onClick={() => setTab(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{item.badge ? <b>{item.badge.toLocaleString('fa-IR')}</b> : null}</button>)}
        </nav>

        <div className="dashboard-tab-content">
          {tab === 'requests' ? (
            <div className="tab-section">
              <div className="card-heading"><div><span className="eyebrow">Artist verification</span><h2>درخواست‌های تأیید هنرمندان</h2><p>نمونه‌کارها را بررسی و نتیجه را همراه با اعلان برای هنرمند ثبت کنید.</p></div></div>
              <div className="responsive-table-wrap"><table className="data-table"><thead><tr><th>هنرمند</th><th>ایمیل</th><th>تاریخ ارسال</th><th>نمونه‌کار</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{data.artistRequests.map((request) => <tr key={request.id}><td><strong>{request.artistName}</strong></td><td dir="ltr">{request.email}</td><td>{new Intl.DateTimeFormat('fa-IR').format(new Date(request.submittedAt))}</td><td>{request.portfolio.length.toLocaleString('fa-IR')} مورد</td><td><span className={`status-pill status-${request.status}`}>{request.status === 'pending' ? 'در انتظار' : request.status === 'approved' ? 'تأییدشده' : 'ردشده'}</span></td><td><button type="button" className="button button-secondary small" onClick={() => setSelectedRequest(request)}><Icon name="eye" /> مشاهده و بررسی</button></td></tr>)}</tbody></table></div>
            </div>
          ) : null}

          {tab === 'tickets' ? (
            <div className="tab-section">
              <div className="card-heading"><div><span className="eyebrow">Support tickets</span><h2>تیکت‌های کاربران</h2><p>گفت‌وگو با کاربران و مدیریت وضعیت درخواست‌های پشتیبانی.</p></div></div>
              <div className="responsive-table-wrap"><table className="data-table"><thead><tr><th>شناسه</th><th>کاربر</th><th>موضوع</th><th>تاریخ ارسال</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{data.tickets.map((ticket) => <tr key={ticket.id}><td dir="ltr"><strong>{ticket.id}</strong></td><td>{ticket.userName}</td><td>{ticket.subject}</td><td>{new Intl.DateTimeFormat('fa-IR').format(new Date(ticket.createdAt))}</td><td><span className={`status-pill ticket-${ticket.status}`}>{ticketStatusLabel[ticket.status]}</span></td><td><button type="button" className="button button-secondary small" onClick={() => setSelectedTicketId(ticket.id)}><Icon name="ticket" /> باز کردن گفت‌وگو</button></td></tr>)}</tbody></table></div>
            </div>
          ) : null}

          {tab === 'finance' && roleIsAdmin ? (
            <div className="tab-section">
              <div className="card-heading"><div><span className="eyebrow">Monthly audit</span><h2>حسابرسی و پاداش هنرمندان</h2><p>این مقادیر در بک‌اند از رویدادهای واقعی استریم ماه جاری تجمیع می‌شوند.</p></div></div>
              <div className="responsive-table-wrap"><table className="data-table"><thead><tr><th>هنرمند</th><th>شنونده منحصربه‌فرد</th><th>استریم ماه</th><th>پاداش محاسبه‌شده</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{data.finance.map((record) => <tr key={record.id}><td><strong>{record.artistName}</strong><small className="table-subline" dir="ltr">{record.artistId}</small></td><td>{record.uniqueListeners.toLocaleString('fa-IR')}</td><td>{record.streams.toLocaleString('fa-IR')}</td><td><strong>{record.reward.toLocaleString('fa-IR')} تومان</strong></td><td><span className={`status-pill payment-${record.status}`}>{record.status === 'settled' ? 'تسویه‌شده' : 'در انتظار پرداخت'}</span></td><td><button type="button" className="button button-secondary small" disabled={record.status === 'settled'} onClick={() => settle(record.id)} title={roleIsAdmin ? '' : 'فقط مدیر سامانه می‌تواند تسویه را تأیید کند'}><Icon name="check" /> تأیید تسویه</button></td></tr>)}</tbody></table></div>
            </div>
          ) : null}

          {tab === 'admin' && roleIsAdmin ? (
            <div className="admin-tools-grid">
              <section className="admin-price-card">
                <div className="card-heading"><div><span className="eyebrow">Dynamic pricing</span><h2>کنترل قیمت اشتراک‌ها</h2><p>قیمت‌های عمومی سامانه بدون تغییر در کد به‌روزرسانی می‌شوند.</p></div><span className="section-icon purple"><Icon name="wallet" /></span></div>
                <form className="price-form" onSubmit={savePrices}>
                  <label><span>اشتراک نقره‌ای / ماه</span><div><input dir="ltr" type="number" value={silver} onChange={(event) => setSilver(Number(event.target.value))} /><span>تومان</span></div></label>
                  <label><span>اشتراک طلایی / ماه</span><div><input dir="ltr" type="number" value={gold} onChange={(event) => setGold(Number(event.target.value))} /><span>تومان</span></div></label>
                  <button type="submit" className="button button-primary full">به‌روزرسانی قیمت‌ها</button>
                </form>
              </section>

              <section className="subscription-chart-card">
                <div className="card-heading"><div><span className="eyebrow">Subscriptions</span><h2>توزیع سطح اشتراک</h2><p>سهم کاربران شنونده در هر سطح اشتراک.</p></div></div>
                <div className="pie-chart-wrap">
                  <div className="css-pie-chart" style={{ '--gold-stop': `${goldPercent}%`, '--silver-stop': `${goldPercent + silverPercent}%` } as CSSProperties}><span><strong>{listenerUsers.length.toLocaleString('fa-IR')}</strong><small>شنونده</small></span></div>
                  <div className="chart-legend"><span><i className="legend-free" /> پایه <b>{subscriptionCounts.free.toLocaleString('fa-IR')}</b></span><span><i className="legend-silver" /> نقره‌ای <b>{subscriptionCounts.silver.toLocaleString('fa-IR')}</b></span><span><i className="legend-gold" /> طلایی <b>{subscriptionCounts.gold.toLocaleString('fa-IR')}</b></span></div>
                </div>
              </section>

              <section className="revenue-overview-card">
                <span className="revenue-icon"><Icon name="chart" size={30} /></span>
                <div><span className="eyebrow">درآمد ماه جاری</span><strong>{monthlyRevenue.toLocaleString('fa-IR')} تومان</strong><p>درآمد تراکنش‌های تأییدشده ماه جاری در بک‌اند محاسبه می‌شود.</p></div>
                <span className="growth-pill"><Icon name="check" size={15} /> داده تجمیع‌شده</span>
              </section>
            </div>
          ) : null}
        </div>
      </section>

      <RequestReviewModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      <TicketChatModal ticket={selectedTicket} onClose={() => setSelectedTicketId(null)} />
    </div>
  );
}
