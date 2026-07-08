export type UserRole = 'listener' | 'artist' | 'support' | 'admin';

export type SubscriptionTier = 'free' | 'silver' | 'gold';

export interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
  role: UserRole;
  subscription: SubscriptionTier;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  dailyStreams: number;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}
