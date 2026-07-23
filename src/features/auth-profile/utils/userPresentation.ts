import {
  APP_PATHS,
} from '../../../config/paths';

import type {
  SubscriptionTier,
  User,
  UserGender,
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

const subscriptionLabels: Record<
  SubscriptionTier,
  string
> = {
  free: 'اشتراک پایه',
  silver: 'اشتراک نقره‌ای',
  gold: 'اشتراک طلایی',
};

const genderLabels: Record<
  UserGender,
  string
> = {
  male: 'مرد',
  female: 'زن',
  other: 'سایر',
  'prefer-not-to-say':
    'ترجیح می‌دهم نگویم',
};

export function getRoleLabel(
  role: UserRole,
) {
  return roleLabels[role];
}

export function getSubscriptionLabel(
  tier: SubscriptionTier,
) {
  return subscriptionLabels[tier];
}

export function getGenderLabel(
  gender: UserGender,
) {
  return genderLabels[gender];
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

export function getPlaylistLimit(
  tier: SubscriptionTier,
) {
  if (tier === 'free') {
    return 6;
  }

  if (tier === 'silver') {
    return 100;
  }

  return null;
}

export function getDailyStreamLimit(
  tier: SubscriptionTier,
) {
  return tier === 'free'
    ? 60
    : null;
}

// Return the default page for each role.
export function getRoleHomePath(
  user: User,
) {
  if (
    user.role === 'admin' ||
    user.role === 'support'
  ) {
    return APP_PATHS.dashboard;
  }

  if (
    user.role === 'artist' &&
    user.artistVerificationStatus ===
      'approved'
  ) {
    return APP_PATHS.artistManagement;
  }

  return APP_PATHS.home;
}