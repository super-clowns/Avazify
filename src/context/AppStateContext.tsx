import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { initialData } from '../data/initialData';
import {
  canCreatePlaylist,
  createUsername,
  normalizeEmail,
  toggleId,
} from '../domain/phase1.js';
import type {
  AppData,
  AuthResult,
  Gender,
  Playlist,
  SubscriptionTier,
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
  portfolioFiles: string[];
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
  cover: string;
}

interface AppStateContextValue {
  data: AppData;
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => AuthResult;
  logout: () => void;
  registerListener: (input: ListenerRegistrationInput) => AuthResult;
  registerArtist: (input: ArtistRegistrationInput) => AuthResult;
  requestPasswordReset: (email: string) => AuthResult;
  updateCurrentUser: (patch: Partial<User>) => AuthResult;
  updateSettings: (patch: Partial<UserSettings>) => void;
  toggleFollow: (targetUserId: string) => void;
  upgradeSubscription: (tier: SubscriptionTier) => void;
  deleteCurrentUser: () => void;
  resetDemoData: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  createPlaylist: (name: string, description: string) => AuthResult;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => AuthResult;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  saveArtistTrack: (input: ArtistTrackInput) => AuthResult;
  deleteArtistTrack: (trackId: string) => void;
  reviewArtistRequest: (requestId: string, approved: boolean, reason?: string) => void;
  replyToTicket: (ticketId: string, body: string) => void;
  setTicketStatus: (ticketId: string, status: TicketStatus) => void;
  settleFinanceRecord: (id: string) => AuthResult;
  updatePrices: (silver: number, gold: number) => AuthResult;
  recordStream: (trackId: string) => void;
}

const STORAGE_KEY = 'avazify-phase1-data-v2';
const LOCAL_SESSION_KEY = 'avazify-phase1-session';
const TEMP_SESSION_KEY = 'avazify-phase1-temp-session';

const AppStateContext = createContext<AppStateContextValue | null>(null);

function cloneInitialData(): AppData {
  return JSON.parse(JSON.stringify(initialData)) as AppData;
}

function loadData(): AppData {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return cloneInitialData();
    const parsed = JSON.parse(value) as AppData;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.tracks)) return cloneInitialData();
    return parsed;
  } catch {
    return cloneInitialData();
  }
}

function loadSession(): string | null {
  return localStorage.getItem(LOCAL_SESSION_KEY) ?? sessionStorage.getItem(TEMP_SESSION_KEY);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultSettings(): UserSettings {
  return {
    notifications: {
      followedArtistReleases: true,
      subscriptionExpiry: true,
      artistVerification: true,
      financialReports: true,
      supportTickets: true,
    },
    soundEnabled: true,
    language: 'fa',
    compactMode: false,
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [currentUserId, setCurrentUserId] = useState<string | null>(loadSession);

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === currentUserId) ?? null,
    [currentUserId, data.users],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (currentUserId && !currentUser) {
      setCurrentUserId(null);
      localStorage.removeItem(LOCAL_SESSION_KEY);
      sessionStorage.removeItem(TEMP_SESSION_KEY);
    }
  }, [currentUser, currentUserId]);

  const login = useCallback((email: string, password: string, rememberMe: boolean): AuthResult => {
    const normalized = normalizeEmail(email);
    const user = data.users.find((item) => normalizeEmail(item.email) === normalized);
    if (!user) return { success: false, message: 'حسابی با این ایمیل پیدا نشد.' };
    if (user.password !== password) return { success: false, message: 'رمز عبور واردشده صحیح نیست.' };

    localStorage.removeItem(LOCAL_SESSION_KEY);
    sessionStorage.removeItem(TEMP_SESSION_KEY);
    if (rememberMe) localStorage.setItem(LOCAL_SESSION_KEY, user.id);
    else sessionStorage.setItem(TEMP_SESSION_KEY, user.id);
    setCurrentUserId(user.id);
    return { success: true, message: 'ورود با موفقیت انجام شد.', user };
  }, [data.users]);

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    sessionStorage.removeItem(TEMP_SESSION_KEY);
    setCurrentUserId(null);
  }, []);

  const registerListener = useCallback((input: ListenerRegistrationInput): AuthResult => {
    const email = normalizeEmail(input.email);
    if (data.users.some((user) => normalizeEmail(user.email) === email)) {
      return { success: false, message: 'این ایمیل قبلاً ثبت شده است.' };
    }

    const id = createId('listener');
    const user: User = {
      id,
      displayName: input.displayName.trim(),
      username: createUsername(email, data.users.map((item) => item.username)),
      email,
      password: input.password,
      role: 'listener',
      subscription: 'free',
      subscriptionExpiresAt: null,
      avatar: null,
      bio: '',
      birthDate: input.birthDate,
      gender: input.gender,
      joinedAt: new Date().toISOString(),
      followers: 0,
      following: 0,
      dailyStreams: 0,
      totalStreams: 0,
      followedUserIds: [],
      artistStatus: 'not-applicable',
      portfolio: [],
      settings: createDefaultSettings(),
    };

    setData((previous) => ({ ...previous, users: [...previous.users, user] }));
    sessionStorage.setItem(TEMP_SESSION_KEY, id);
    setCurrentUserId(id);
    return { success: true, message: 'حساب شنونده با موفقیت ساخته شد.', user };
  }, [data.users]);

  const registerArtist = useCallback((input: ArtistRegistrationInput): AuthResult => {
    const email = normalizeEmail(input.email);
    if (data.users.some((user) => normalizeEmail(user.email) === email)) {
      return { success: false, message: 'این ایمیل قبلاً ثبت شده است.' };
    }

    const id = createId('artist');
    const portfolio = [input.portfolioUrl.trim(), ...input.portfolioFiles].filter(Boolean);
    const user: User = {
      id,
      displayName: input.artistName.trim(),
      username: createUsername(email, data.users.map((item) => item.username)),
      email,
      password: input.password,
      role: 'artist',
      subscription: 'free',
      subscriptionExpiresAt: null,
      avatar: null,
      bio: 'هنرمند تازه‌وارد آوازیفای',
      birthDate: null,
      gender: 'prefer-not-to-say',
      joinedAt: new Date().toISOString(),
      followers: 0,
      following: 0,
      dailyStreams: 0,
      totalStreams: 0,
      followedUserIds: [],
      artistStatus: 'pending',
      portfolio,
      settings: createDefaultSettings(),
    };
    const requestId = createId('request');

    setData((previous) => ({
      ...previous,
      users: [...previous.users, user],
      artistRequests: [
        ...previous.artistRequests,
        {
          id: requestId,
          userId: id,
          artistName: user.displayName,
          email,
          portfolio,
          submittedAt: new Date().toISOString(),
          status: 'pending',
          rejectionReason: '',
        },
      ],
      notifications: [
        ...previous.notifications,
        {
          id: createId('notification'),
          userId: id,
          title: 'درخواست هنرمندی ثبت شد',
          message: 'درخواست شما در صف بررسی تیم پشتیبانی قرار گرفت.',
          createdAt: new Date().toISOString(),
          read: false,
          kind: 'verification',
          link: '/profile',
        },
      ],
    }));

    sessionStorage.setItem(TEMP_SESSION_KEY, id);
    setCurrentUserId(id);
    return { success: true, message: 'درخواست هنرمندی ثبت شد و در انتظار تأیید است.', user };
  }, [data.users]);

  const requestPasswordReset = useCallback((email: string): AuthResult => {
    const valid = data.users.some((user) => normalizeEmail(user.email) === normalizeEmail(email));
    return {
      success: true,
      message: valid
        ? 'لینک بازیابی آزمایشی برای ایمیل شما ارسال شد.'
        : 'در صورت وجود حساب، لینک بازیابی برای ایمیل واردشده ارسال می‌شود.',
    };
  }, [data.users]);

  const updateCurrentUser = useCallback((patch: Partial<User>): AuthResult => {
    if (!currentUser) return { success: false, message: 'حساب فعالی وجود ندارد.' };
    if (patch.email) {
      const email = normalizeEmail(patch.email);
      const duplicate = data.users.some((user) => user.id !== currentUser.id && normalizeEmail(user.email) === email);
      if (duplicate) return { success: false, message: 'این ایمیل توسط حساب دیگری استفاده شده است.' };
      patch = { ...patch, email };
    }
    if (patch.avatar !== undefined && patch.avatar !== currentUser.avatar && currentUser.subscription === 'free') {
      return { success: false, message: 'تغییر عکس نمایه برای اشتراک پایه فعال نیست.' };
    }
    setData((previous) => ({
      ...previous,
      users: previous.users.map((user) => user.id === currentUser.id ? { ...user, ...patch } : user),
    }));
    return { success: true, message: 'اطلاعات نمایه ذخیره شد.' };
  }, [currentUser, data.users]);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      users: previous.users.map((user) => user.id === currentUser.id ? {
        ...user,
        settings: {
          ...user.settings,
          ...patch,
          notifications: {
            ...user.settings.notifications,
            ...(patch.notifications ?? {}),
          },
        },
      } : user),
    }));
  }, [currentUser]);

  const toggleFollow = useCallback((targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;
    const isFollowing = currentUser.followedUserIds.includes(targetUserId);
    setData((previous) => ({
      ...previous,
      users: previous.users.map((user) => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            followedUserIds: toggleId(user.followedUserIds, targetUserId),
            following: Math.max(0, user.following + (isFollowing ? -1 : 1)),
          };
        }
        if (user.id === targetUserId) {
          return { ...user, followers: Math.max(0, user.followers + (isFollowing ? -1 : 1)) };
        }
        return user;
      }),
    }));
  }, [currentUser]);

  const upgradeSubscription = useCallback((tier: SubscriptionTier) => {
    if (!currentUser) return;
    const expiry = tier === 'free' ? null : new Date(Date.now() + 30 * 86400000).toISOString();
    setData((previous) => ({
      ...previous,
      users: previous.users.map((user) => user.id === currentUser.id ? {
        ...user,
        subscription: tier,
        subscriptionExpiresAt: expiry,
      } : user),
      notifications: [
        {
          id: createId('notification'),
          userId: currentUser.id,
          title: 'اشتراک شما تغییر کرد',
          message: `اشتراک حساب با موفقیت به ${tier === 'gold' ? 'طلایی' : tier === 'silver' ? 'نقره‌ای' : 'پایه'} تغییر یافت.`,
          createdAt: new Date().toISOString(),
          read: false,
          kind: 'subscription',
          link: '/settings',
        },
        ...previous.notifications,
      ],
    }));
  }, [currentUser]);

  const deleteCurrentUser = useCallback(() => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      users: previous.users.filter((user) => user.id !== currentUser.id),
      playlists: previous.playlists.filter((playlist) => playlist.userId !== currentUser.id),
      notifications: previous.notifications.filter((notification) => notification.userId !== currentUser.id),
      artistRequests: previous.artistRequests.filter((request) => request.userId !== currentUser.id),
    }));
    logout();
  }, [currentUser, logout]);

  const resetDemoData = useCallback(() => {
    const fresh = cloneInitialData();
    setData(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    logout();
  }, [logout]);

  const markNotificationRead = useCallback((id: string) => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      notifications: previous.notifications.map((item) => item.id === id && item.userId === currentUser.id ? { ...item, read: true } : item),
    }));
  }, [currentUser]);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      notifications: previous.notifications.map((item) => item.userId === currentUser.id ? { ...item, read: true } : item),
    }));
  }, [currentUser]);

  const deleteNotification = useCallback((id: string) => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      notifications: previous.notifications.filter((item) => item.id !== id || item.userId !== currentUser.id),
    }));
  }, [currentUser]);

  const createPlaylist = useCallback((name: string, description: string): AuthResult => {
    if (!currentUser) return { success: false, message: 'ابتدا وارد حساب شوید.' };
    const ownPlaylists = data.playlists.filter((playlist) => playlist.userId === currentUser.id);
    if (!canCreatePlaylist(currentUser.subscription, ownPlaylists.length)) {
      return { success: false, message: 'به سقف تعداد پلی‌لیست مجاز در اشتراک خود رسیده‌اید.' };
    }
    const now = new Date().toISOString();
    const playlist: Playlist = {
      id: createId('playlist'),
      userId: currentUser.id,
      name: name.trim(),
      description: description.trim(),
      trackIds: [],
      createdAt: now,
      updatedAt: now,
    };
    setData((previous) => ({ ...previous, playlists: [playlist, ...previous.playlists] }));
    return { success: true, message: 'پلی‌لیست جدید ساخته شد.' };
  }, [currentUser, data.playlists]);

  const renamePlaylist = useCallback((id: string, name: string) => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      playlists: previous.playlists.map((item) => item.id === id && item.userId === currentUser.id ? {
        ...item,
        name: name.trim(),
        updatedAt: new Date().toISOString(),
      } : item),
    }));
  }, [currentUser]);

  const deletePlaylist = useCallback((id: string) => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      playlists: previous.playlists.filter((item) => item.id !== id || item.userId !== currentUser.id),
    }));
  }, [currentUser]);

  const addTrackToPlaylist = useCallback((playlistId: string, trackId: string): AuthResult => {
    const playlist = data.playlists.find((item) => item.id === playlistId);
    if (!playlist || playlist.userId !== currentUser?.id) return { success: false, message: 'پلی‌لیست معتبر نیست.' };
    if (playlist.trackIds.includes(trackId)) return { success: false, message: 'این آهنگ قبلاً در پلی‌لیست قرار دارد.' };
    setData((previous) => ({
      ...previous,
      playlists: previous.playlists.map((item) => item.id === playlistId ? {
        ...item,
        trackIds: [...item.trackIds, trackId],
        updatedAt: new Date().toISOString(),
      } : item),
    }));
    return { success: true, message: 'آهنگ به پلی‌لیست اضافه شد.' };
  }, [currentUser, data.playlists]);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      playlists: previous.playlists.map((item) => item.id === playlistId && item.userId === currentUser.id ? {
        ...item,
        trackIds: item.trackIds.filter((id) => id !== trackId),
        updatedAt: new Date().toISOString(),
      } : item),
    }));
  }, [currentUser]);

  const saveArtistTrack = useCallback((input: ArtistTrackInput): AuthResult => {
    if (!currentUser || currentUser.role !== 'artist' || currentUser.artistStatus !== 'approved') {
      return { success: false, message: 'این بخش فقط برای هنرمند تأییدشده در دسترس است.' };
    }

    const trackId = input.id ?? createId('track');
    const existing = data.tracks.find((track) => track.id === trackId);
    if (existing && existing.artistId !== currentUser.id) {
      return { success: false, message: 'امکان ویرایش اثر هنرمند دیگری وجود ندارد.' };
    }
    const normalizedAlbumTitle = input.albumTitle.trim();
    let albumId: string | null = null;

    setData((previous) => {
      let albums = [...previous.albums];
      if (normalizedAlbumTitle) {
        const matchedAlbum = albums.find((album) => album.artistId === currentUser.id && album.title === normalizedAlbumTitle);
        albumId = matchedAlbum?.id ?? createId('album');
        if (!matchedAlbum) {
          albums = [
            {
              id: albumId,
              title: normalizedAlbumTitle,
              artistId: currentUser.id,
              artistName: currentUser.displayName,
              cover: input.cover,
              releaseDate: input.releaseDate,
              genre: input.genre,
              trackIds: [trackId],
            },
            ...albums,
          ];
        } else if (!matchedAlbum.trackIds.includes(trackId)) {
          albums = albums.map((album) => album.id === matchedAlbum.id ? {
            ...album,
            cover: input.cover,
            trackIds: [...album.trackIds, trackId],
          } : album);
        }
      }

      const track = {
        id: trackId,
        title: input.title.trim(),
        artistId: currentUser.id,
        artistName: currentUser.displayName,
        albumId,
        albumTitle: normalizedAlbumTitle || null,
        cover: input.cover,
        audioUrl: '/audio/avazify-demo.wav',
        duration: input.duration,
        releaseDate: input.releaseDate,
        listeners: existing?.listeners ?? 0,
        streams: existing?.streams ?? 0,
        genre: input.genre,
        lyrics: input.lyrics.trim(),
        earlyAccess: false,
        collaborators: input.collaborators,
      };

      return {
        ...previous,
        albums,
        tracks: existing
          ? previous.tracks.map((item) => item.id === trackId ? track : item)
          : [track, ...previous.tracks],
      };
    });

    return { success: true, message: existing ? 'اطلاعات اثر ویرایش شد.' : 'اثر جدید با موفقیت منتشر شد.' };
  }, [currentUser, data.tracks]);

  const deleteArtistTrack = useCallback((trackId: string) => {
    if (!currentUser || currentUser.role !== 'artist') return;
    setData((previous) => {
      const owned = previous.tracks.some((track) => track.id === trackId && track.artistId === currentUser.id);
      if (!owned) return previous;
      return {
        ...previous,
        tracks: previous.tracks.filter((track) => track.id !== trackId),
        albums: previous.albums
          .map((album) => ({ ...album, trackIds: album.trackIds.filter((id) => id !== trackId) }))
          .filter((album) => album.trackIds.length > 0),
        playlists: previous.playlists.map((playlist) => ({
          ...playlist,
          trackIds: playlist.trackIds.filter((id) => id !== trackId),
        })),
      };
    });
  }, [currentUser]);

  const reviewArtistRequest = useCallback((requestId: string, approved: boolean, reason = '') => {
    if (currentUser?.role !== 'support' && currentUser?.role !== 'admin') return;
    const request = data.artistRequests.find((item) => item.id === requestId);
    if (!request) return;
    setData((previous) => ({
      ...previous,
      artistRequests: previous.artistRequests.map((item) => item.id === requestId ? {
        ...item,
        status: approved ? 'approved' : 'rejected',
        rejectionReason: approved ? '' : reason,
      } : item),
      users: previous.users.map((user) => user.id === request.userId ? {
        ...user,
        artistStatus: approved ? 'approved' : 'rejected',
      } : user),
      notifications: [
        {
          id: createId('notification'),
          userId: request.userId,
          title: approved ? 'حساب هنرمند تأیید شد' : 'درخواست هنرمندی رد شد',
          message: approved ? 'اکنون می‌توانید از بخش مدیریت آثار استفاده کنید.' : `علت رد درخواست: ${reason}`,
          createdAt: new Date().toISOString(),
          read: false,
          kind: 'verification',
          link: approved ? '/studio' : '/profile',
        },
        ...previous.notifications,
      ],
    }));
  }, [currentUser, data.artistRequests]);

  const replyToTicket = useCallback((ticketId: string, body: string) => {
    if ((currentUser?.role !== 'support' && currentUser?.role !== 'admin') || !body.trim()) return;
    setData((previous) => ({
      ...previous,
      tickets: previous.tickets.map((ticket) => ticket.id === ticketId ? {
        ...ticket,
        status: 'answered',
        messages: [...ticket.messages, {
          id: createId('message'),
          author: 'support',
          body: body.trim(),
          createdAt: new Date().toISOString(),
        }],
      } : ticket),
    }));
  }, [currentUser]);

  const setTicketStatus = useCallback((ticketId: string, status: TicketStatus) => {
    if (currentUser?.role !== 'support' && currentUser?.role !== 'admin') return;
    setData((previous) => ({
      ...previous,
      tickets: previous.tickets.map((ticket) => ticket.id === ticketId ? { ...ticket, status } : ticket),
    }));
  }, [currentUser]);

  const settleFinanceRecord = useCallback((id: string): AuthResult => {
    if (currentUser?.role !== 'admin') return { success: false, message: 'تأیید تسویه فقط برای مدیر سامانه مجاز است.' };
    setData((previous) => ({
      ...previous,
      finance: previous.finance.map((record) => record.id === id ? { ...record, status: 'settled' } : record),
    }));
    return { success: true, message: 'وضعیت پرداخت به تسویه‌شده تغییر کرد.' };
  }, [currentUser]);

  const recordStream = useCallback((trackId: string) => {
    if (!currentUser) return;
    setData((previous) => ({
      ...previous,
      tracks: previous.tracks.map((track) => track.id === trackId ? {
        ...track,
        streams: track.streams + 1,
      } : track),
      users: previous.users.map((user) => user.id === currentUser.id ? {
        ...user,
        dailyStreams: user.dailyStreams + 1,
        totalStreams: user.totalStreams + 1,
      } : user),
    }));
  }, [currentUser]);

  const updatePrices = useCallback((silver: number, gold: number): AuthResult => {
    if (currentUser?.role !== 'admin') return { success: false, message: 'تغییر قیمت‌ها فقط برای مدیر سامانه مجاز است.' };
    if (silver <= 0 || gold <= 0 || gold <= silver) {
      return { success: false, message: 'قیمت‌ها باید مثبت باشند و قیمت طلایی از نقره‌ای بیشتر باشد.' };
    }
    setData((previous) => ({ ...previous, prices: { silver, gold } }));
    return { success: true, message: 'قیمت اشتراک‌ها به‌روزرسانی شد.' };
  }, [currentUser]);

  const value = useMemo<AppStateContextValue>(() => ({
    data,
    currentUser,
    isAuthenticated: currentUser !== null,
    login,
    logout,
    registerListener,
    registerArtist,
    requestPasswordReset,
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
    replyToTicket,
    setTicketStatus,
    settleFinanceRecord,
    updatePrices,
    recordStream,
  }), [
    addTrackToPlaylist,
    createPlaylist,
    currentUser,
    data,
    deleteArtistTrack,
    deleteCurrentUser,
    deleteNotification,
    deletePlaylist,
    login,
    logout,
    markAllNotificationsRead,
    markNotificationRead,
    recordStream,
    registerArtist,
    registerListener,
    removeTrackFromPlaylist,
    renamePlaylist,
    replyToTicket,
    requestPasswordReset,
    resetDemoData,
    reviewArtistRequest,
    saveArtistTrack,
    setTicketStatus,
    settleFinanceRecord,
    toggleFollow,
    updateCurrentUser,
    updatePrices,
    updateSettings,
    upgradeSubscription,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
