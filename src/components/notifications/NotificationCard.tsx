import React from 'react';

export interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  type: 'user' | 'artist' | 'admin';
}

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationCard({ notification, onMarkAsRead, onDelete }: NotificationCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        margin: '10px 0',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: notification.isRead ? '#ffffff' : '#f4f9ff',
        transition: 'all 0.2s ease-in-out',
        direction: 'rtl'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!notification.isRead && (
          <span
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#0070f3',
              borderRadius: '50%',
              display: 'inline-block'
            }}
          ></span>
        )}
        <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>
          {notification.message}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            style={{
              backgroundColor: '#e1f5fe',
              color: '#0288d1',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            علامت‌گذاری به عنوان خوانده شده
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          حذف اعلان
        </button>
      </div>
    </div>
  );
}