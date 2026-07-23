import type { ArtistVerificationRequest } from '../types';

// Artists who submitted the artist-registration form and are awaiting review.
// (Phase two will replace this with real submissions coming from RegisterForm.)
export const mockArtistRequests: ArtistVerificationRequest[] = [
  {
    id: 'req-artist-001',
    userId: 'user-pending-sohrab',
    artistName: 'سهراب پاکزاد',
    email: 'sohrab@example.com',
    portfolioUrl: 'https://soundcloud.com/sohrab-pakzad',
    portfolioFileNames: ['demo-acoustic.mp3', 'demo-pop.mp3'],
    status: 'pending',
    rejectionReason: null,
    submittedAt: '2026-07-21T08:00:00',
  },
  {
    id: 'req-artist-002',
    userId: 'user-pending-elnaz',
    artistName: 'الناز محمدی',
    email: 'elnaz@example.com',
    portfolioUrl: 'https://soundcloud.com/elnaz-mohammadi',
    portfolioFileNames: ['guitar-cover.mp3'],
    status: 'pending',
    rejectionReason: null,
    submittedAt: '2026-07-22T10:00:00',
  },
];
