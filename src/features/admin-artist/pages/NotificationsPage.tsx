import { Link } from 'react-router-dom';

import { useAuth } from '../../auth-profile/hooks/useAuth';

import NotificationCard from '../components/NotificationCard';
import EmptyNotifications from '../components/EmptyNotifications';

import { useNotificationStore } from '../data/notificationStore';

export default function NotificationsPage() {
  const { currentUser } = useAuth();

  const { notifications, markAsRead, markAllAsRead, remove } = useNotificationStore(
    currentUser?.id ?? '',
  );

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <section className="phase-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">Notifications Module</p>
          <h1>اعلانات</h1>
        </div>

        {hasUnread ? (
          <div className="page-actions">
            <button type="button" className="button-secondary" onClick={markAllAsRead}>
              خواندن همه اعلانات
            </button>
          </div>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div className="notification-list">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              to={notif.actionPath ?? '#'}
              className="notification-link-wrapper"
            >
              <NotificationCard
                notification={notif}
                onMarkAsRead={markAsRead}
                onDelete={remove}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}