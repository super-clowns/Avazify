import React, { useState } from 'react';
import NotificationCard from '../components/notifications/NotificationCard';
import EmptyNotifications from '../components/notifications/EmptyNotifications';
import type { NotificationItem } from '../components/notifications/NotificationCard';


export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', message: 'هشدار: مهلت اشتراک طلایی شما ۳ روز دیگر به اتمام می‌رسد.', isRead: false, type: 'user' },
    { id: '2', message: 'درخواست احراز هویت هنرمند «آرش» در انتظار بررسی شماست.', isRead: false, type: 'admin' },
    { id: '3', message: 'حساب هنری شما با موفقیت توسط پشتیبان تایید شد.', isRead: true, type: 'artist' },
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#111' }}>صندوق اعلانات</h2>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            خواندن همه اعلانات
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(notif => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}