import { useState, type FormEvent } from 'react';

import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import type { SupportTicket } from '../types';

const statusLabel = { open: 'باز', answered: 'پاسخ داده‌شده', closed: 'بسته‌شده' } as const;

function UserTicketModal({ ticket, onClose }: { ticket: SupportTicket | null; onClose: () => void }) {
  const { replyToTicket } = useAppState();
  const { pushToast } = useToast();
  const [reply, setReply] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ticket || !reply.trim()) return;
    const result = await replyToTicket(ticket.id, reply.trim());
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setReply('');
  };

  return (
    <Modal open={ticket !== null} title={ticket?.subject ?? 'تیکت'} description={ticket ? `وضعیت: ${statusLabel[ticket.status]}` : undefined} onClose={onClose} size="large">
      {ticket ? <div className="ticket-chat">
        <div className="ticket-messages">
          {ticket.messages.map((message) => <article className={`chat-message ${message.author}`} key={message.id}>
            <span>{message.author === 'support' ? 'پشتیبانی' : 'شما'}</span>
            <p>{message.body}</p>
            <small>{new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.createdAt))}</small>
          </article>)}
        </div>
        <form className="ticket-reply-form" onSubmit={submit}>
          <textarea rows={3} value={reply} onChange={(event) => setReply(event.target.value)} disabled={ticket.status === 'closed'} placeholder={ticket.status === 'closed' ? 'این تیکت بسته شده است.' : 'پیام تکمیلی خود را بنویسید...'} />
          <button className="button button-primary" type="submit" disabled={ticket.status === 'closed' || !reply.trim()}>ارسال پیام</button>
        </form>
      </div> : null}
    </Modal>
  );
}

export default function SupportPage() {
  const { data, createTicket } = useAppState();
  const { pushToast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.tickets.find((ticket) => ticket.id === selectedId) ?? null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    const result = await createTicket(subject.trim(), message.trim());
    pushToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setSubject('');
      setMessage('');
      setCreateOpen(false);
    }
  };

  return <div className="page-stack">
    <PageHeader eyebrow="مرکز پشتیبانی" title="تیکت‌های من" description="درخواست تازه ثبت کنید و پاسخ تیم پشتیبانی را در همان گفت‌وگو ببینید." actions={<button type="button" className="button button-primary" onClick={() => setCreateOpen(true)}><Icon name="plus" /> تیکت جدید</button>} />
    {data.tickets.length ? <section className="content-card">
      <div className="responsive-table-wrap"><table className="data-table"><thead><tr><th>موضوع</th><th>تاریخ</th><th>وضعیت</th><th>پیام‌ها</th><th>عملیات</th></tr></thead><tbody>
        {data.tickets.map((ticket) => <tr key={ticket.id}><td><strong>{ticket.subject}</strong><small className="table-subline" dir="ltr">{ticket.id}</small></td><td>{new Intl.DateTimeFormat('fa-IR').format(new Date(ticket.createdAt))}</td><td><span className={`status-pill ticket-${ticket.status}`}>{statusLabel[ticket.status]}</span></td><td>{ticket.messages.length.toLocaleString('fa-IR')}</td><td><button type="button" className="button button-secondary small" onClick={() => setSelectedId(ticket.id)}><Icon name="ticket" /> مشاهده گفت‌وگو</button></td></tr>)}
      </tbody></table></div>
    </section> : <EmptyState icon="ticket" title="هنوز تیکتی ثبت نکرده‌اید" description="برای پرسش یا گزارش مشکل، یک تیکت جدید ایجاد کنید." action={<button type="button" className="button button-primary" onClick={() => setCreateOpen(true)}>ثبت اولین تیکت</button>} />}

    <Modal open={createOpen} title="ثبت تیکت جدید" onClose={() => setCreateOpen(false)} size="small" footer={<><button type="button" className="button button-ghost" onClick={() => setCreateOpen(false)}>انصراف</button><button type="submit" form="support-ticket-form" className="button button-primary">ارسال تیکت</button></>}>
      <form id="support-ticket-form" className="form-stack" onSubmit={submit}>
        <label className="field"><span className="field-label">موضوع</span><span className="field-control"><Icon name="ticket" /><input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={180} /></span></label>
        <label className="field"><span className="field-label">شرح درخواست</span><span className="field-control textarea-control"><textarea rows={6} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={5000} /></span></label>
      </form>
    </Modal>
    <UserTicketModal ticket={selected} onClose={() => setSelectedId(null)} />
  </div>;
}
