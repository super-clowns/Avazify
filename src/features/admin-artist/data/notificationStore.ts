import { useState, useCallback } from 'react';
import type { AppNotification } from '../types';
import { mockNotifications } from './mockNotifications';

const STORAGE_KEY = 'avazify_notifications';

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotifications));
    return mockNotifications;
  } catch {
    return mockNotifications;
  }
}

function saveNotifications(notifications: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function useNotificationStore(userId: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadNotifications().filter((n) => n.userId === userId),
  );

  const markAsRead = useCallback((id: string) => {
    const updated = loadNotifications().map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    saveNotifications(updated);
    setNotifications(updated.filter((n) => n.userId === userId));
  }, [userId]);

  const markAllAsRead = useCallback(() => {
    const updated = loadNotifications().map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n,
    );
    saveNotifications(updated);
    setNotifications(updated.filter((n) => n.userId === userId));
  }, [userId]);

  const remove = useCallback((id: string) => {
    const updated = loadNotifications().filter((n) => n.id !== id);
    saveNotifications(updated);
    setNotifications(updated.filter((n) => n.userId === userId));
  }, [userId]);

  return { notifications, markAsRead, markAllAsRead, remove };
}