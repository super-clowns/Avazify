import type { SubscriptionTier } from '../auth-profile/types';

export type ReleaseType = 'single' | 'album';

export interface ArtistCatalogStats {
  artistId: string;
  monthlyListeners: number;
  verifiedSince: string;
}

export interface Track {
  id: string;
  artistId: string;
  title: string;
  type: ReleaseType;
  coverUrl: string | null;
  genre: string;
  releaseYear: string;
  collaborators: string[];
  lyrics: string;
  listeners: number;
  streams: number;
  revenue: number;
  createdAt: string;
}

export type NotificationKind =
  | 'subscription-expiry'
  | 'new-release'
  | 'artist-verification-result'
  | 'artist-financial-report'
  | 'support-new-ticket'
  | 'support-new-artist-request';

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionPath?: string;
}

export type ArtistRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ArtistVerificationRequest {
  id: string;
  userId: string;
  artistName: string;
  email: string;
  portfolioUrl: string;
  portfolioFileNames: string[];
  status: ArtistRequestStatus;
  rejectionReason: string | null;
  submittedAt: string;
}

export type SupportTicketStatus = 'open' | 'answered' | 'closed';

export interface SupportMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  sentAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  messages: SupportMessage[];
}

export type SettlementStatus = 'pending' | 'settled';

export interface ArtistFinanceRecord {
  id: string;
  artistId: string;
  artistName: string;
  period: string;
  uniqueListeners: number;
  totalStreams: number;
  rewardAmount: number;
  settlementStatus: SettlementStatus;
}

export interface SubscriptionPricing {
  silver: number;
  gold: number;
  updatedAt: string;
}

export type SubscriptionTierShare = {
  tier: SubscriptionTier;
  percentage: number;
};

export interface RevenueSummary {
  silverRevenue: number;
  goldRevenue: number;
  totalRevenue: number;
  distribution: SubscriptionTierShare[];
}