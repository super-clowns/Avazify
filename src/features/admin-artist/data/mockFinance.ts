import type {
  ArtistFinanceRecord,
  RevenueSummary,
  SubscriptionPricing,
} from '../types';

export const mockFinanceRecords: ArtistFinanceRecord[] = [
  {
    id: 'fin-001',
    artistId: 'user-artist-approved',
    artistName: 'Luna Echo',
    period: '1405/04',
    uniqueListeners: 128000,
    totalStreams: 358000,
    rewardAmount: 14500000,
    settlementStatus: 'pending',
  },
  {
    id: 'fin-002',
    artistId: 'artist-homayoun',
    artistName: 'همایون شجریان',
    period: '1405/04',
    uniqueListeners: 45000,
    totalStreams: 230000,
    rewardAmount: 45000000,
    settlementStatus: 'pending',
  },
  {
    id: 'fin-003',
    artistId: 'artist-alireza',
    artistName: 'علیرضا قربانی',
    period: '1405/04',
    uniqueListeners: 62000,
    totalStreams: 410000,
    rewardAmount: 82000000,
    settlementStatus: 'settled',
  },
];

export const mockPricing: SubscriptionPricing = {
  silver: 49000,
  gold: 89000,
  updatedAt: '2026-07-01',
};

export const mockRevenueSummary: RevenueSummary = {
  silverRevenue: 24500000,
  goldRevenue: 61800000,
  totalRevenue: 86300000,
  distribution: [
    { tier: 'free', percentage: 50 },
    { tier: 'silver', percentage: 30 },
    { tier: 'gold', percentage: 20 },
  ],
};
