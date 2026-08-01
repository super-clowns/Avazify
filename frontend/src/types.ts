export type UserRole = 'listener' | 'artist' | 'support' | 'admin';
export type SubscriptionTier = 'free' | 'silver' | 'gold';
export type ArtistStatus = 'not-applicable' | 'pending' | 'approved' | 'rejected';
export type RepeatMode = 'off' | 'all' | 'one';
export type Gender = 'female' | 'male' | 'other' | 'prefer-not-to-say';
export type NotificationKind = 'music' | 'subscription' | 'verification' | 'finance' | 'support' | 'system';
export type TicketStatus = 'open' | 'answered' | 'closed';
export type PaymentStatus = 'pending' | 'settled';

export interface NotificationPreferences {
  followedArtistReleases: boolean;
  subscriptionExpiry: boolean;
  artistVerification: boolean;
  financialReports: boolean;
  supportTickets: boolean;
}

export interface UserSettings {
  notifications: NotificationPreferences;
  soundEnabled: boolean;
  language: 'fa' | 'en';
  compactMode: boolean;
}

export interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
  role: UserRole;
  subscription: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  avatar: string | null;
  bio: string;
  birthDate: string | null;
  gender: Gender;
  joinedAt: string;
  followers: number;
  following: number;
  dailyStreams: number;
  totalStreams: number;
  followedUserIds: string[];
  artistStatus: ArtistStatus;
  portfolio: string[];
  settings: UserSettings;
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string | null;
  albumTitle: string | null;
  cover: string;
  audioUrl: string;
  audioLowQualityUrl?: string | null;
  duration: number;
  releaseDate: string;
  listeners: number;
  streams: number;
  genre: string;
  lyrics: string;
  earlyAccess: boolean;
  collaborators: string[];
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  cover: string;
  releaseDate: string;
  genre: string;
  trackIds: string[];
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  kind: NotificationKind;
  link: string | null;
}

export interface ArtistRequest {
  id: string;
  userId: string;
  artistName: string;
  email: string;
  portfolio: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;
}

export interface TicketMessage {
  id: string;
  author: 'user' | 'support';
  body: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  createdAt: string;
  status: TicketStatus;
  messages: TicketMessage[];
}

export interface FinanceRecord {
  id: string;
  artistId: string;
  artistName: string;
  uniqueListeners: number;
  streams: number;
  reward: number;
  status: PaymentStatus;
}

export interface SubscriptionPrices {
  silver: number;
  gold: number;
}

export interface BillingSummary {
  subscriptions: {
    free: number;
    silver: number;
    gold: number;
  };
  monthlyRevenue: number;
  verifiedPayments: number;
}

export interface AppData {
  users: User[];
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
  notifications: AppNotification[];
  artistRequests: ArtistRequest[];
  tickets: SupportTicket[];
  finance: FinanceRecord[];
  prices: SubscriptionPrices;
  recommendations: Track[];
  billingSummary: BillingSummary;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'success' | 'error' | 'info';
}
