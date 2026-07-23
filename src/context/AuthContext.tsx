import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import {
  defaultUserSettings,
  mockUsers,
} from '../features/auth-profile/data/mockUsers';

import {
  mockCredentials,
} from '../features/auth-profile/data/mockCredentials';

import type {
  ArtistRegistrationInput,
  AuthContextValue,
  AuthOperationResult,
  AuthState,
  EditableUserFields,
  ListenerRegistrationInput,
  LoginInput,
  MockCredential,
  ProfileUpdateInput,
  User,
  UserSettings,
} from '../features/auth-profile/types';

import {
  clearAuthStorage,
  loadPersistedAuthData,
  loadPersistedSession,
  persistAuthData,
  persistAuthSession,
} from '../services/localStorageApi';

interface AuthProviderProps {
  children: ReactNode;
}

type AuthAction =
  | {
      type: 'LOGIN';
      payload: {
        userId: string;
        rememberMe: boolean;
      };
    }
  | {
      type: 'LOGOUT';
    }
  | {
      type: 'REGISTER_USER';
      payload: {
        user: User;
        credential: MockCredential;
      };
    }
  | {
      type: 'SELECT_DEMO_USER';
      payload: string;
    }
  | {
      type: 'UPDATE_CURRENT_USER';
      payload:
        Partial<EditableUserFields>;
    }
  | {
      type: 'UPDATE_SETTINGS';
      payload:
        Partial<UserSettings>;
    }
  | {
      type: 'RESET_DEMO_STATE';
    };

function cloneSettings(
  settings: UserSettings,
): UserSettings {
  return {
    ...settings,

    notifications: {
      ...settings.notifications,
    },
  };
}

function cloneUsers() {
  return mockUsers.map(
    (user) => ({
      ...user,

      subscription: {
        ...user.subscription,
      },

      stats: {
        ...user.stats,
      },

      settings:
        cloneSettings(
          user.settings,
        ),

      followedUserIds: [
        ...user.followedUserIds,
      ],

      artistPortfolio:
        user.artistPortfolio
          ? [
              ...user
                .artistPortfolio,
            ]
          : undefined,
    }),
  );
}

function cloneCredentials() {
  return mockCredentials.map(
    (credential) => ({
      ...credential,
    }),
  );
}

function createCleanState():
  AuthState {
  return {
    users: cloneUsers(),

    credentials:
      cloneCredentials(),

    currentUserId: null,

    rememberMe: false,

    isInitialized: true,
  };
}

function createInitialState():
  AuthState {
  const defaultUsers =
    cloneUsers();

  const defaultCredentials =
    cloneCredentials();

  const persistedData =
    loadPersistedAuthData(
      defaultUsers,
      defaultCredentials,
    );

  const persistedSession =
    loadPersistedSession(
      persistedData.users.map(
        (user) => user.id,
      ),
    );

  return {
    users:
      persistedData.users,

    credentials:
      persistedData.credentials,

    currentUserId:
      persistedSession.userId,

    rememberMe:
      persistedSession.rememberMe,

    isInitialized: true,
  };
}

function authReducer(
  state: AuthState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,

        currentUserId:
          action.payload.userId,

        rememberMe:
          action.payload
            .rememberMe,
      };

    case 'LOGOUT':
      return {
        ...state,
        currentUserId: null,
        rememberMe: false,
      };

    case 'REGISTER_USER':
      return {
        ...state,

        users: [
          ...state.users,
          action.payload.user,
        ],

        credentials: [
          ...state.credentials,
          action.payload
            .credential,
        ],

        currentUserId:
          action.payload.user.id,

        rememberMe: false,
      };

    case 'SELECT_DEMO_USER': {
      const userExists =
        state.users.some(
          (user) =>
            user.id ===
            action.payload,
        );

      if (!userExists) {
        return state;
      }

      return {
        ...state,

        currentUserId:
          action.payload,

        rememberMe: false,
      };
    }

    case 'UPDATE_CURRENT_USER': {
      const updatedEmail =
        action.payload.email
          ?.trim()
          .toLowerCase();

      return {
        ...state,

        users:
          state.users.map(
            (user) =>
              user.id ===
              state.currentUserId
                ? {
                    ...user,
                    ...action.payload,

                    email:
                      updatedEmail ??
                      user.email,
                  }
                : user,
          ),

        credentials:
          updatedEmail
            ? state.credentials.map(
                (credential) =>
                  credential.userId ===
                  state.currentUserId
                    ? {
                        ...credential,
                        email:
                          updatedEmail,
                      }
                    : credential,
              )
            : state.credentials,
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,

        users:
          state.users.map(
            (user) => {
              if (
                user.id !==
                state.currentUserId
              ) {
                return user;
              }

              return {
                ...user,

                settings: {
                  ...user.settings,
                  ...action.payload,

                  notifications:
                    action.payload
                      .notifications
                      ? {
                          ...user
                            .settings
                            .notifications,

                          ...action
                            .payload
                            .notifications,
                        }
                      : user
                          .settings
                          .notifications,
                },
              };
            },
          ),
      };

    case 'RESET_DEMO_STATE':
      return createCleanState();

    default:
      return state;
  }
}

function normalizeEmail(
  email: string,
) {
  return email
    .trim()
    .toLowerCase();
}

function createUserId(
  prefix: string,
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createUniqueUsername(
  email: string,
  users: User[],
) {
  const emailPrefix =
    normalizeEmail(email)
      .split('@')[0]
      .replace(
        /[^a-z0-9_]/g,
        '_',
      )
      .replace(
        /_+/g,
        '_',
      )
      .replace(
        /^_|_$/g,
        '',
      ) ||
    'avazify_user';

  let username =
    emailPrefix;

  let counter = 1;

  while (
    users.some(
      (user) =>
        user.username ===
        username,
    )
  ) {
    username =
      `${emailPrefix}_${counter}`;

    counter += 1;
  }

  return username;
}

function createOperationResult(
  success: boolean,
  message: string,
  user?: User,
): AuthOperationResult {
  return {
    success,
    message,
    user,
  };
}

export const AuthContext =
  createContext<
    AuthContextValue | null
  >(null);

// Central persistent authentication state.
export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    state,
    dispatch,
  ] = useReducer(
    authReducer,
    undefined,
    createInitialState,
  );

  const currentUser =
    state.users.find(
      (user) =>
        user.id ===
        state.currentUserId,
    ) ?? null;

  useEffect(() => {
    if (
      !state.isInitialized
    ) {
      return;
    }

    persistAuthData(
      state.users,
      state.credentials,
    );
  }, [
    state.credentials,
    state.isInitialized,
    state.users,
  ]);

  useEffect(() => {
    if (
      !state.isInitialized
    ) {
      return;
    }

    persistAuthSession(
      state.currentUserId,
      state.rememberMe,
    );
  }, [
    state.currentUserId,
    state.isInitialized,
    state.rememberMe,
  ]);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        users: state.users,

        currentUser,

        isAuthenticated:
          currentUser !== null,

        isInitialized:
          state.isInitialized,

        isRememberedSession:
          state.rememberMe,

        login: (
          input: LoginInput,
        ) => {
          const normalizedEmail =
            normalizeEmail(
              input.email,
            );

          const credential =
            state.credentials.find(
              (item) =>
                normalizeEmail(
                  item.email,
                ) ===
                normalizedEmail,
            );

          if (!credential) {
            return createOperationResult(
              false,
              'حسابی با این ایمیل پیدا نشد.',
            );
          }

          if (
            credential.password !==
            input.password
          ) {
            return createOperationResult(
              false,
              'رمز عبور واردشده صحیح نیست.',
            );
          }

          const user =
            state.users.find(
              (item) =>
                item.id ===
                credential.userId,
            );

          if (!user) {
            return createOperationResult(
              false,
              'اطلاعات حساب کاربری ناقص است.',
            );
          }

          dispatch({
            type: 'LOGIN',

            payload: {
              userId: user.id,

              rememberMe:
                input.rememberMe,
            },
          });

          return createOperationResult(
            true,
            'ورود با موفقیت انجام شد.',
            user,
          );
        },

        logout: () => {
          dispatch({
            type: 'LOGOUT',
          });
        },

        registerListener: (
          input:
            ListenerRegistrationInput,
        ) => {
          const normalizedEmail =
            normalizeEmail(
              input.email,
            );

          const emailExists =
            state.users.some(
              (user) =>
                normalizeEmail(
                  user.email,
                ) ===
                normalizedEmail,
            );

          if (emailExists) {
            return createOperationResult(
              false,
              'این ایمیل قبلاً ثبت شده است.',
            );
          }

          const userId =
            createUserId(
              'listener',
            );

          const username =
            createUniqueUsername(
              normalizedEmail,
              state.users,
            );

          const newUser: User = {
            id: userId,

            displayName:
              input.displayName
                .trim(),

            username,

            email:
              normalizedEmail,

            role: 'listener',

            subscription: {
              tier: 'free',
              startedAt: null,
              expiresAt: null,
            },

            avatar: null,

            bio: '',

            birthDate:
              input.birthDate,

            gender:
              input.gender,

            joinedAt:
              new Date()
                .toISOString(),

            artistVerificationStatus:
              'not-applicable',

            stats: {
              followers: 0,
              following: 0,
              dailyStreams: 0,
              totalStreams: 0,
              playlistCount: 0,
            },

            settings:
              cloneSettings(
                defaultUserSettings,
              ),

            followedUserIds: [],
          };

          const credential:
            MockCredential = {
              userId,

              email:
                normalizedEmail,

              password:
                input.password,
            };

          dispatch({
            type: 'REGISTER_USER',

            payload: {
              user: newUser,
              credential,
            },
          });

          return createOperationResult(
            true,
            'ثبت‌نام با موفقیت انجام شد.',
            newUser,
          );
        },

        registerArtist: (
          input:
            ArtistRegistrationInput,
        ) => {
          const normalizedEmail =
            normalizeEmail(
              input.email,
            );

          const emailExists =
            state.users.some(
              (user) =>
                normalizeEmail(
                  user.email,
                ) ===
                normalizedEmail,
            );

          if (emailExists) {
            return createOperationResult(
              false,
              'این ایمیل قبلاً ثبت شده است.',
            );
          }

          const userId =
            createUserId(
              'artist',
            );

          const username =
            createUniqueUsername(
              normalizedEmail,
              state.users,
            );

          const portfolioItems = [
            input.portfolioUrl
              .trim(),

            ...input
              .portfolioFileNames,
          ].filter(Boolean);

          const newUser: User = {
            id: userId,

            displayName:
              input.artistName
                .trim(),

            username,

            email:
              normalizedEmail,

            role: 'artist',

            subscription: {
              tier: 'free',
              startedAt: null,
              expiresAt: null,
            },

            avatar: null,

            bio: '',

            birthDate: null,

            gender:
              'prefer-not-to-say',

            joinedAt:
              new Date()
                .toISOString(),

            artistPortfolio:
              portfolioItems,

            artistVerificationStatus:
              'pending',

            stats: {
              followers: 0,
              following: 0,
              dailyStreams: 0,
              totalStreams: 0,
              playlistCount: 0,
            },

            settings: {
              ...cloneSettings(
                defaultUserSettings,
              ),

              notifications: {
                ...defaultUserSettings
                  .notifications,

                artistVerification:
                  true,

                financialReports:
                  true,
              },
            },

            followedUserIds: [],
          };

          const credential:
            MockCredential = {
              userId,

              email:
                normalizedEmail,

              password:
                input.password,
            };

          dispatch({
            type: 'REGISTER_USER',

            payload: {
              user: newUser,
              credential,
            },
          });

          return createOperationResult(
            true,
            'درخواست حساب هنرمند ثبت شد و در انتظار تأیید است.',
            newUser,
          );
        },

        requestPasswordReset: (
          email: string,
        ) => {
          const normalizedEmail =
            normalizeEmail(email);

          const userExists =
            state.users.some(
              (user) =>
                normalizeEmail(
                  user.email,
                ) ===
                normalizedEmail,
            );

          if (userExists) {
            return createOperationResult(
              true,
              'لینک بازیابی آزمایشی برای ایمیل شما ارسال شد.',
            );
          }

          return createOperationResult(
            true,
            'در صورت وجود حساب، لینک بازیابی برای ایمیل واردشده ارسال می‌شود.',
          );
        },

        updateProfile: (
          input:
            ProfileUpdateInput,
        ) => {
          if (!currentUser) {
            return createOperationResult(
              false,
              'برای ویرایش پروفایل باید وارد حساب شوید.',
            );
          }

          const normalizedEmail =
            normalizeEmail(
              input.email,
            );

          const emailExists =
            state.users.some(
              (user) =>
                user.id !==
                  currentUser.id &&
                normalizeEmail(
                  user.email,
                ) ===
                  normalizedEmail,
            );

          if (emailExists) {
            return createOperationResult(
              false,
              'این ایمیل توسط حساب دیگری استفاده شده است.',
            );
          }

          const avatarChanged =
            input.avatar !==
            currentUser.avatar;

          if (
            currentUser
              .subscription
              .tier === 'free' &&
            avatarChanged
          ) {
            return createOperationResult(
              false,
              'کاربران اشتراک پایه امکان تغییر عکس پروفایل را ندارند.',
            );
          }

          const changes:
            Partial<EditableUserFields> =
            {
              displayName:
                input.displayName
                  .trim(),

              email:
                normalizedEmail,

              bio:
                input.bio.trim(),

              birthDate:
                input.birthDate,

              gender:
                input.gender,

              avatar:
                input.avatar,
            };

          const updatedUser: User = {
            ...currentUser,
            ...changes,
            email:
              normalizedEmail,
          };

          dispatch({
            type:
              'UPDATE_CURRENT_USER',

            payload:
              changes,
          });

          return createOperationResult(
            true,
            'اطلاعات پروفایل با موفقیت ذخیره شد.',
            updatedUser,
          );
        },

        selectDemoUser: (
          userId: string,
        ) => {
          dispatch({
            type:
              'SELECT_DEMO_USER',

            payload:
              userId,
          });
        },

        updateCurrentUser: (
          changes,
        ) => {
          dispatch({
            type:
              'UPDATE_CURRENT_USER',

            payload:
              changes,
          });
        },

        updateSettings: (
          changes,
        ) => {
          dispatch({
            type:
              'UPDATE_SETTINGS',

            payload:
              changes,
          });
        },

        getUserById: (
          userId: string,
        ) =>
          state.users.find(
            (user) =>
              user.id === userId,
          ),

        getUserByUsername: (
          username: string,
        ) =>
          state.users.find(
            (user) =>
              user.username ===
              username,
          ),

        resetDemoState: () => {
          clearAuthStorage();

          dispatch({
            type:
              'RESET_DEMO_STATE',
          });
        },
      }),
      [
        currentUser,
        state.credentials,
        state.isInitialized,
        state.rememberMe,
        state.users,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}