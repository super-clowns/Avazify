import { getNotificationIcon, formatRelativeTime } from '../utils/notificationPresentation';
import type { AppNotification } from '../types';

interface NotificationCardProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  return (
    <article
      className={`notification-card ${
        notification.isRead ? '' : 'notification-card-unread'
      }`}
    >
      <div className="notification-card-main">
        <span className="notification-icon" aria-hidden="true">
          {getNotificationIcon(notification.kind)}
        </span>

        <div>
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
          <small>{formatRelativeTime(notification.createdAt)}</small>
        </div>
      </div>

      <div className="notification-card-actions">
        {!notification.isRead ? (
          <button
            type="button"
            className="inline-text-button"
            onClick={() => onMarkAsRead(notification.id)}
          >
            علامت‌گذاری به عنوان خوانده شده
          </button>
        ) : null}

        <button
          type="button"
          className="inline-text-button inline-text-button-danger"
          onClick={() => onDelete(notification.id)}
        >
          حذف
        </button>
      </div>
    </article>
  );
}