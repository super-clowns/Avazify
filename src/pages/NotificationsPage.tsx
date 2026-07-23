import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../components/EmptyState';
import Icon, { type IconName } from '../components/Icon';
import PageHeader from '../components/PageHeader';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import type { NotificationKind } from '../types';

const kindIcon: Record<NotificationKind, IconName> = {
  music: 'music',
  subscription: 'crown',
  verification: 'verified',
  finance: 'wallet',
  support: 'ticket',
  system: 'info',
};

function relativeDate(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes.toLocaleString('fa-IR')} دقیقه پیش`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours.toLocaleString('fa-IR')} ساعت پیش`;
  const days = Math.round(hours / 24);
  return `${days.toLocaleString('fa-IR')} روز پیش`;
}

export default function NotificationsPage() {
  const { data, currentUser, markNotificationRead, markAllNotificationsRead, deleteNotification } = useAppState();
  const { pushToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const notifications = useMemo(
    () => data.notifications
      .filter((item) => item.userId === currentUser?.id && (filter === 'all' || !item.read))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [currentUser?.id, data.notifications, filter],
  );
  const unreadCount = data.notifications.filter((item) => item.userId === currentUser?.id && !item.read).length;

  const markAll = () => {
    markAllNotificationsRead();
    pushToast('همه اعلانات خوانده شدند.', 'success');
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="مرکز اعلانات"
        title="اعلانات"
        description="رویدادهای حساب، انتشار آثار، اشتراک و پیام‌های نقش شما در این بخش نمایش داده می‌شوند."
        actions={unreadCount ? <button type="button" className="button button-secondary" onClick={markAll}><Icon name="check" /> خواندن همه</button> : undefined}
      />

      <section className="notification-toolbar">
        <div className="segmented-control compact">
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>همه</button>
          <button type="button" className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>خوانده‌نشده <span>{unreadCount.toLocaleString('fa-IR')}</span></button>
        </div>
        <span className="notification-summary"><Icon name="bell" /> {notifications.length.toLocaleString('fa-IR')} اعلان نمایش داده می‌شود</span>
      </section>

      {notifications.length ? (
        <section className="notification-list">
          {notifications.map((notification) => (
            <article className={`notification-card ${notification.read ? '' : 'unread'} notification-${notification.kind}`} key={notification.id}>
              <span className="notification-icon"><Icon name={kindIcon[notification.kind]} /></span>
              <div className="notification-copy">
                <div><strong>{notification.title}</strong>{!notification.read ? <span className="unread-dot" /> : null}</div>
                <p>{notification.message}</p>
                <span><Icon name="clock" size={14} /> {relativeDate(notification.createdAt)}</span>
              </div>
              <div className="notification-actions">
                {notification.link ? <Link className="button button-ghost small" to={notification.link} onClick={() => markNotificationRead(notification.id)}>مشاهده</Link> : null}
                {!notification.read ? <button type="button" className="icon-button subtle" onClick={() => markNotificationRead(notification.id)} aria-label="علامت‌گذاری به عنوان خوانده‌شده"><Icon name="check" size={17} /></button> : null}
                <button type="button" className="icon-button subtle danger-hover" onClick={() => deleteNotification(notification.id)} aria-label="حذف اعلان"><Icon name="trash" size={17} /></button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState icon="bell" title={filter === 'unread' ? 'اعلان خوانده‌نشده‌ای ندارید' : 'هنوز اعلانی وجود ندارد'} description={filter === 'unread' ? 'تمام اعلانات شما خوانده شده‌اند.' : 'اعلان‌های جدید حساب شما در این بخش نمایش داده می‌شوند.'} />
      )}
    </div>
  );
}
