import type { AppNotification, RepeatMode, SubscriptionTier, Track } from '../types';

export function normalizeEmail(value: string): string;
export function createUsername(email: string, existingUsernames?: string[]): string;
export function getPlaylistLimit(tier: SubscriptionTier): number | null;
export function getDailyStreamLimit(tier: SubscriptionTier): number | null;
export function canCreatePlaylist(tier: SubscriptionTier, count: number): boolean;
export function toggleId(ids: string[], id: string): string[];
export function filterTracks(tracks: Track[], query: string, genre?: string): Track[];
export function sortTracks(tracks: Track[], sortBy: 'latest' | 'oldest' | 'listeners'): Track[];
export function markAllRead(notifications: AppNotification[]): AppNotification[];
export function removeNotification(notifications: AppNotification[], id: string): AppNotification[];
export function nextQueueIndex(currentIndex: number, queueLength: number, repeat: RepeatMode, direction?: number): number;
export function cycleRepeat(mode: RepeatMode): RepeatMode;
export function formatDuration(seconds: number): string;
export function calculateReward(uniqueListeners: number, streams: number): number;
