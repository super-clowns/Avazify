import type { ArtistStatus, SubscriptionTier, UserRole } from '../types';
import Icon from './Icon';

export function SubscriptionBadge({ tier }: { tier: SubscriptionTier }) {
  const label = tier === 'gold' ? 'طلایی' : tier === 'silver' ? 'نقره‌ای' : 'پایه';
  return (
    <span className={`badge subscription-badge subscription-${tier}`}>
      {tier === 'gold' ? <Icon name="crown" size={14} /> : null}
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const label = role === 'artist' ? 'هنرمند' : role === 'support' ? 'پشتیبان' : role === 'admin' ? 'مدیر سامانه' : 'شنونده';
  return <span className={`badge role-badge role-${role}`}>{label}</span>;
}

export function ArtistStatusBadge({ status }: { status: ArtistStatus }) {
  if (status === 'approved') return <span className="badge status-approved"><Icon name="verified" size={14} />تأییدشده</span>;
  if (status === 'pending') return <span className="badge status-pending"><Icon name="clock" size={14} />در انتظار تأیید</span>;
  if (status === 'rejected') return <span className="badge status-rejected"><Icon name="warning" size={14} />ردشده</span>;
  return null;
}
