import type {
  HomeReleaseType,
} from '../data/homeFeedData';

import type {
  User,
  UserRole,
} from '../types';

const roleLabels: Record<
  UserRole,
  string
> = {
  listener: 'شنونده',
  artist: 'هنرمند',
  support: 'پشتیبان',
  admin: 'مدیر سامانه',
};

const releaseTypeLabels: Record<
  HomeReleaseType,
  string
> = {
  album: 'آلبوم',
  single: 'تک‌آهنگ',
  podcast: 'پادکست',
};

export function getRoleLabel(
  role: UserRole,
) {
  return roleLabels[role];
}

export function getAvatarInitial(
  user: User,
) {
  return (
    user.displayName
      .trim()
      .charAt(0) || 'A'
  );
}

export function getReleaseTypeLabel(
  type: HomeReleaseType,
) {
  return releaseTypeLabels[type];
}

export function getFollowerCountLabel(
  count: number,
) {
  return `${count.toLocaleString(
    'fa-IR',
  )} دنبال‌کننده`;
}

export function formatHomeDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return 'تاریخ نامشخص';
  }

  return new Intl.DateTimeFormat(
    'fa-IR',
    {
      month: 'long',
      day: 'numeric',
    },
  ).format(date);
}

export function formatPlayCount(
  count: number,
) {
  if (count >= 1_000_000) {
    return `${(
      count / 1_000_000
    ).toLocaleString('fa-IR', {
      maximumFractionDigits: 1,
    })} میلیون`;
  }

  if (count >= 1_000) {
    return `${(
      count / 1_000
    ).toLocaleString('fa-IR', {
      maximumFractionDigits: 1,
    })} هزار`;
  }

  return count.toLocaleString(
    'fa-IR',
  );
}