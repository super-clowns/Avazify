export type UserRole = 'listener' | 'artist' | 'support' | 'admin';

export type SubscriptionTier = 'free' | 'silver' | 'gold';

export type UserGender =
  | 'male'
  | 'female'
  | 'other'
  | 'prefer-not-to-say';

export type AppLanguage = 'fa' | 'en';

export type ArtistVerificationStatus =
  | 'not-applicable'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface NotificationPreferences {
  newReleases: boolean;
  subscriptionExpiry: boolean;
  supportTickets: boolean;
  artistVerification: boolean;
  financialReports: boolean;
}

export interface UserSettings {
  notifications: NotificationPreferences;
  soundEnabled: boolean;
  language: AppLanguage;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  startedAt: string | null;
  expiresAt: string | null;
}

export interface UserStats {
  followers: number;
  following: number;
  dailyStreams: number;
  totalStreams: number;
  playlistCount: number;
}

export interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
  role: UserRole;
  subscription: SubscriptionInfo;
  avatar: string | null;
  bio: string;
  birthDate: string | null;
  gender: UserGender;
  joinedAt: string;
  artistProfileId?: string;
  artistVerificationStatus: ArtistVerificationStatus;
  stats: UserStats;
  settings: UserSettings;
  followedUserIds: string[];
}

export interface FollowState {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface AuthState {
  users: User[];
  currentUserId: string | null;
  isInitialized: boolean;
}

export type EditableUserFields = Pick<
  User,
  'displayName' | 'email' | 'avatar' | 'bio' | 'birthDate' | 'gender'
>;

export interface AuthContextValue {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  selectDemoUser: (userId: string) => void;
  updateCurrentUser: (changes: Partial<EditableUserFields>) => void;
  updateSettings: (changes: Partial<UserSettings>) => void;
  getUserById: (userId: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  resetDemoState: () => void;
}