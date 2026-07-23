import type { NotificationKind } from '../types';

const notificationIcons: Record<NotificationKind, string> = {
  'subscription-expiry': '⏳',
  'new-release': '🎵',
  'artist-verification-result': '🎙️',
  'artist-financial-report': '💰',
  'support-new-ticket': '🛎️',
  'support-new-artist-request': '🧾',
};

export function getNotificationIcon(kind: NotificationKind) {
  return notificationIcons[kind];
}

export function formatRelativeTime(value: string) {
  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return '';
  }

  const diffMinutes = Math.round(
    (Date.now() - target.getTime()) / 60000,
  );

  if (diffMinutes < 1) {
    return 'همین الان';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes.toLocaleString('fa-IR')} دقیقه پیش`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours.toLocaleString('fa-IR')} ساعت پیش`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays.toLocaleString('fa-IR')} روز پیش`;
}
