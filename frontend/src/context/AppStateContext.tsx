import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  ApiError,
  apiRequest,
  clearAuthTokens,
  downloadWithAuth,
  getRefreshToken,
  hasAuthSession,
  setAuthTokens,
} from '../api/client';
import type {
  AppData,
  AuthResult,
  Gender,
  SubscriptionTier,
  SupportTicket,
  TicketStatus,
  User,
  UserSettings,
} from '../types';

interface ListenerRegistrationInput {
  displayName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender;
}

interface ArtistRegistrationInput {
  artistName: string;
  email: string;
  password: string;
  portfolioUrl: string;
  portfolioFiles: File[];
}

interface ArtistTrackInput {
  id?: string;
  title: string;
  albumTitle: string;
  genre: string;
  releaseDate: string;
  duration: number;
  lyrics: string;
  collaborators: string[];
  cover?: string;
  coverFile?: File | null;
  audioFile?: File | null;
  audioLowQuality?: File | null;
  earlyAccess?: boolean;
}

interface AppStateContextValue {
  data: AppData;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<AuthResult>;
  logout: () => Promise<void>;
  registerListener: (input: ListenerRegistrationInput) => Promise<AuthResult>;
  registerArtist: (input: ArtistRegistrationInput) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  confirmPasswordReset: (uid: string, token: string, password: string) => Promise<AuthResult>;
  updateCurrentUser: (patch: Partial<User>) => Promise<AuthResult>;
  updateSettings: (patch: Partial<UserSettings>) => Promise<AuthResult>;
  toggleFollow: (targetUserId: string) => Promise<AuthResult>;
  upgradeSubscription: (tier: SubscriptionTier, duration?: 1 | 3 | 6 | 12) => Promise<AuthResult>;
  deleteCurrentUser: () => Promise<AuthResult>;
  resetDemoData: () => Promise<AuthResult>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createPlaylist: (name: string, description: string) => Promise<AuthResult>;
  renamePlaylist: (id: string, name: string) => Promise<AuthResult>;
  deletePlaylist: (id: string) => Promise<AuthResult>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<AuthResult>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<AuthResult>;
  saveArtistTrack: (input: ArtistTrackInput) => Promise<AuthResult>;
  deleteArtistTrack: (trackId: string) => Promise<AuthResult>;
  reviewArtistRequest: (requestId: string, approved: boolean, reason?: string) => Promise<AuthResult>;
  createTicket: (subject: string, message: string) => Promise<AuthResult>;
  replyToTicket: (ticketId: string, body: string) => Promise<AuthResult>;
  setTicketStatus: (ticketId: string, status: TicketStatus) => Promise<AuthResult>;
  settleFinanceRecord: (id: string) => Promise<AuthResult>;
  updatePrices: (silver: number, gold: number) => Promise<AuthResult>;
  recordStream: (trackId: string, secondsListened?: number) => Promise<void>;
  downloadTrack: (trackId: string, title: string) => Promise<AuthResult>;
}

interface BootstrapPayload extends AppData {
  currentUser: User;
}

interface AuthPayload extends AuthResult {
  access: string;
  refresh: string;
  user: User;
}

const EMPTY_DATA: AppData = {
  users: [],
  tracks: [],
  albums: [],
  playlists: [],
  notifications: [],
  artistRequests: [],
  tickets: [],
  finance: [],
  prices: { silver: 0, gold: 0 },
  recommendations: [],
  billingSummary: {
    subscriptions: { free: 0, silver: 0, gold: 0 },
    monthlyRevenue: 0,
    verifiedPayments: 0,
  },
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

function errorResult(error: unknown): AuthResult {
  return {
    success: false,
    message: error instanceof Error ? error.message : 'در ارتباط با سرور خطایی رخ داد.',
  };
}

async function coverFileFromUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('تصویر کاور قابل دریافت نیست.');
  const blob = await response.blob();
  const extension = url.split('.').pop()?.split(/[?#]/)[0] || 'svg';
  return new File([blob], `cover.${extension}`, { type: blob.type || 'image/svg+xml' });
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(hasAuthSession());

  const applyBootstrap = useCallback((payload: BootstrapPayload) => {
    const { currentUser: nextUser, ...nextData } = payload;
    setCurrentUser(nextUser);
    setData(nextData);
  }, []);

  const refreshData = useCallback(async () => {
    if (!hasAuthSession()) {
      setCurrentUser(null);
      setData(EMPTY_DATA);
      return;
    }
    const payload = await apiRequest<BootstrapPayload>('/bootstrap/');
    applyBootstrap(payload);
  }, [applyBootstrap]);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      if (!hasAuthSession()) {
        setIsLoading(false);
        return;
      }
      try {
        const payload = await apiRequest<BootstrapPayload>('/bootstrap/');
        if (active) applyBootstrap(payload);
      } catch {
        clearAuthTokens();
        if (active) {
          setCurrentUser(null);
          setData(EMPTY_DATA);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void hydrate();
    return () => { active = false; };
  }, [applyBootstrap]);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean): Promise<AuthResult> => {
    try {
      const response = await apiRequest<AuthPayload>('/auth/login/', {
        method: 'POST', auth: false, body: { email, password },
      });
      setAuthTokens(response.access, response.refresh, rememberMe);
      await refreshData();
      return { success: true, message: response.message, user: response.user };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) await apiRequest('/auth/logout/', { method: 'POST', body: { refresh } });
    } catch {
      // Local logout must still complete if the network is unavailable.
    }
    clearAuthTokens();
    setCurrentUser(null);
    setData(EMPTY_DATA);
  }, []);

  const registerListener = useCallback(async (input: ListenerRegistrationInput): Promise<AuthResult> => {
    try {
      const response = await apiRequest<AuthPayload>('/auth/register/listener/', {
        method: 'POST', auth: false, body: input,
      });
      setAuthTokens(response.access, response.refresh, false);
      await refreshData();
      return { success: true, message: response.message, user: response.user };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const registerArtist = useCallback(async (input: ArtistRegistrationInput): Promise<AuthResult> => {
    try {
      const form = new FormData();
      form.append('artistName', input.artistName);
      form.append('email', input.email);
      form.append('password', input.password);
      if (input.portfolioUrl) form.append('portfolioUrl', input.portfolioUrl);
      input.portfolioFiles.forEach((file) => form.append('portfolioFiles', file));
      const response = await apiRequest<AuthPayload>('/auth/register/artist/', {
        method: 'POST', auth: false, body: form,
      });
      setAuthTokens(response.access, response.refresh, false);
      await refreshData();
      return { success: true, message: response.message, user: response.user };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      return await apiRequest<AuthResult>('/auth/password-reset/', {
        method: 'POST', auth: false, body: { email },
      });
    } catch (error) {
      return errorResult(error);
    }
  }, []);

  const confirmPasswordReset = useCallback(async (uid: string, token: string, password: string): Promise<AuthResult> => {
    try {
      return await apiRequest<AuthResult>('/auth/password-reset/confirm/', {
        method: 'POST', auth: false, body: { uid, token, password },
      });
    } catch (error) {
      return errorResult(error);
    }
  }, []);

  const updateCurrentUser = useCallback(async (patch: Partial<User>): Promise<AuthResult> => {
    try {
      await apiRequest<User>('/users/me/', {
        method: 'PATCH',
        body: {
          displayName: patch.displayName,
          email: patch.email,
          bio: patch.bio,
          birthDate: patch.birthDate,
          gender: patch.gender,
          avatar: patch.avatar,
        },
      });
      await refreshData();
      return { success: true, message: 'اطلاعات نمایه ذخیره شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>): Promise<AuthResult> => {
    try {
      await apiRequest('/users/me/settings/', { method: 'PATCH', body: patch });
      await refreshData();
      return { success: true, message: 'تنظیمات ذخیره شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const toggleFollow = useCallback(async (targetUserId: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/users/${targetUserId}/follow/`, { method: 'POST' });
      await refreshData();
      return { success: true, message: 'وضعیت دنبال‌کردن به‌روزرسانی شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const upgradeSubscription = useCallback(async (
    tier: SubscriptionTier,
    duration: 1 | 3 | 6 | 12 = 1,
  ): Promise<AuthResult> => {
    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
        paymentUrl?: string;
        status?: string;
        transaction?: { status: string };
      }>('/billing/payments/create/', {
        method: 'POST', body: { tier, duration },
      });

      if (response.paymentUrl && response.transaction?.status === 'pending') {
        window.location.assign(response.paymentUrl);
        return { success: true, message: 'در حال انتقال به صفحه پرداخت...' };
      }

      await refreshData();
      return { success: response.success, message: response.message };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const deleteCurrentUser = useCallback(async (): Promise<AuthResult> => {
    try {
      await apiRequest('/users/me/', { method: 'DELETE' });
      clearAuthTokens();
      setCurrentUser(null);
      setData(EMPTY_DATA);
      return { success: true, message: 'حساب کاربری حذف شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, []);

  const resetDemoData = useCallback(async (): Promise<AuthResult> => {
    try {
      const response = await apiRequest<AuthResult>('/system/reset-demo/', { method: 'POST' });
      clearAuthTokens();
      setCurrentUser(null);
      setData(EMPTY_DATA);
      return response;
    } catch (error) {
      return errorResult(error);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await apiRequest(`/support/notifications/${id}/read/`, { method: 'POST' });
      setData((previous) => ({
        ...previous,
        notifications: previous.notifications.map((item) => item.id === id ? { ...item, read: true } : item),
      }));
    } catch {
      // The page can be refreshed to retry this non-critical operation.
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await apiRequest('/support/notifications/read-all/', { method: 'POST' });
      setData((previous) => ({
        ...previous,
        notifications: previous.notifications.map((item) => ({ ...item, read: true })),
      }));
    } catch {
      // Keep the existing state on failure.
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiRequest(`/support/notifications/${id}/`, { method: 'DELETE' });
      setData((previous) => ({
        ...previous,
        notifications: previous.notifications.filter((item) => item.id !== id),
      }));
    } catch {
      // Keep the existing state on failure.
    }
  }, []);

  const createPlaylist = useCallback(async (name: string, description: string): Promise<AuthResult> => {
    try {
      await apiRequest('/music/playlists/', { method: 'POST', body: { name, description } });
      await refreshData();
      return { success: true, message: 'پلی‌لیست ساخته شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const renamePlaylist = useCallback(async (id: string, name: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/music/playlists/${id}/`, { method: 'PATCH', body: { name } });
      await refreshData();
      return { success: true, message: 'نام پلی‌لیست تغییر کرد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const deletePlaylist = useCallback(async (id: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/music/playlists/${id}/`, { method: 'DELETE' });
      await refreshData();
      return { success: true, message: 'پلی‌لیست حذف شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const addTrackToPlaylist = useCallback(async (playlistId: string, trackId: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/music/playlists/${playlistId}/tracks/`, { method: 'POST', body: { trackId } });
      await refreshData();
      return { success: true, message: 'آهنگ به پلی‌لیست اضافه شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const removeTrackFromPlaylist = useCallback(async (playlistId: string, trackId: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/music/playlists/${playlistId}/tracks/${trackId}/`, { method: 'DELETE' });
      await refreshData();
      return { success: true, message: 'آهنگ از پلی‌لیست حذف شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const saveArtistTrack = useCallback(async (input: ArtistTrackInput): Promise<AuthResult> => {
    try {
      const form = new FormData();
      form.append('title', input.title);
      form.append('albumTitleInput', input.albumTitle);
      form.append('genre', input.genre);
      form.append('releaseDate', input.releaseDate);
      form.append('duration', String(input.duration));
      form.append('lyrics', input.lyrics);
      form.append('collaborators', JSON.stringify(input.collaborators));
      form.append('earlyAccess', String(Boolean(input.earlyAccess)));
      if (input.audioFile) form.append('audioFile', input.audioFile);
      if (input.audioLowQuality) form.append('audioLowQuality', input.audioLowQuality);
      if (input.coverFile) {
        form.append('coverFile', input.coverFile);
      } else if (!input.id && input.cover) {
        form.append('coverFile', await coverFileFromUrl(input.cover));
      }
      const path = input.id ? `/music/tracks/${input.id}/` : '/music/tracks/';
      await apiRequest(path, { method: input.id ? 'PATCH' : 'POST', body: form });
      await refreshData();
      return { success: true, message: input.id ? 'اثر ویرایش شد.' : 'اثر منتشر شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const deleteArtistTrack = useCallback(async (trackId: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/music/tracks/${trackId}/`, { method: 'DELETE' });
      await refreshData();
      return { success: true, message: 'اثر حذف شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const reviewArtistRequest = useCallback(async (
    requestId: string,
    approved: boolean,
    reason = '',
  ): Promise<AuthResult> => {
    try {
      await apiRequest(`/users/artist-applications/${requestId}/review/`, {
        method: 'POST', body: { approved, reason },
      });
      await refreshData();
      return { success: true, message: approved ? 'درخواست تأیید شد.' : 'درخواست رد شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const createTicket = useCallback(async (subject: string, message: string): Promise<AuthResult> => {
    try {
      await apiRequest<SupportTicket>('/support/tickets/', { method: 'POST', body: { subject, message } });
      await refreshData();
      return { success: true, message: 'تیکت پشتیبانی ثبت شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const replyToTicket = useCallback(async (ticketId: string, body: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/support/tickets/${ticketId}/reply/`, { method: 'POST', body: { body } });
      await refreshData();
      return { success: true, message: 'پاسخ تیکت ثبت شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const setTicketStatus = useCallback(async (ticketId: string, nextStatus: TicketStatus): Promise<AuthResult> => {
    try {
      await apiRequest(`/support/tickets/${ticketId}/status/`, { method: 'PATCH', body: { status: nextStatus } });
      await refreshData();
      return { success: true, message: 'وضعیت تیکت تغییر کرد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const settleFinanceRecord = useCallback(async (id: string): Promise<AuthResult> => {
    try {
      await apiRequest(`/billing/reports/${id}/settle/`, { method: 'POST' });
      await refreshData();
      return { success: true, message: 'تسویه حساب ثبت شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const updatePrices = useCallback(async (silver: number, gold: number): Promise<AuthResult> => {
    try {
      const response = await apiRequest<AuthResult>('/billing/plans/prices/', {
        method: 'PATCH', body: { silver, gold },
      });
      await refreshData();
      return response;
    } catch (error) {
      return errorResult(error);
    }
  }, [refreshData]);

  const recordStream = useCallback(async (trackId: string, secondsListened = 0) => {
    try {
      const response = await apiRequest<{ streams: number; listeners: number }>(`/music/tracks/${trackId}/stream/`, {
        method: 'POST', body: { secondsListened, clientSession: crypto.randomUUID?.() || 'web' },
      });
      setData((previous) => ({
        ...previous,
        tracks: previous.tracks.map((track) => track.id === trackId ? {
          ...track, streams: response.streams, listeners: response.listeners,
        } : track),
        users: previous.users.map((user) => user.id === currentUser?.id ? {
          ...user, dailyStreams: user.dailyStreams + 1, totalStreams: user.totalStreams + 1,
        } : user),
      }));
      if (currentUser) setCurrentUser({
        ...currentUser,
        dailyStreams: currentUser.dailyStreams + 1,
        totalStreams: currentUser.totalStreams + 1,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clearAuthTokens();
    }
  }, [currentUser]);

  const downloadTrack = useCallback(async (trackId: string, title: string): Promise<AuthResult> => {
    try {
      await downloadWithAuth(`/music/tracks/${trackId}/download/`, `${title}.wav`);
      return { success: true, message: 'دانلود آغاز شد.' };
    } catch (error) {
      return errorResult(error);
    }
  }, []);

  const value = useMemo<AppStateContextValue>(() => ({
    data,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isLoading,
    refreshData,
    login,
    logout,
    registerListener,
    registerArtist,
    requestPasswordReset,
    confirmPasswordReset,
    updateCurrentUser,
    updateSettings,
    toggleFollow,
    upgradeSubscription,
    deleteCurrentUser,
    resetDemoData,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    saveArtistTrack,
    deleteArtistTrack,
    reviewArtistRequest,
    createTicket,
    replyToTicket,
    setTicketStatus,
    settleFinanceRecord,
    updatePrices,
    recordStream,
    downloadTrack,
  }), [
    data, currentUser, isLoading, refreshData, login, logout, registerListener,
    registerArtist, requestPasswordReset, confirmPasswordReset, updateCurrentUser, updateSettings,
    toggleFollow, upgradeSubscription, deleteCurrentUser, resetDemoData,
    markNotificationRead, markAllNotificationsRead, deleteNotification,
    createPlaylist, renamePlaylist, deletePlaylist, addTrackToPlaylist,
    removeTrackFromPlaylist, saveArtistTrack, deleteArtistTrack,
    reviewArtistRequest, createTicket, replyToTicket, setTicketStatus,
    settleFinanceRecord, updatePrices, recordStream, downloadTrack,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
