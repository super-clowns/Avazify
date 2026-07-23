import {
  createContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import {
  DEFAULT_DEMO_USER_ID,
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
  User,
  UserSettings,
} from '../features/auth-profile/types';

interface AuthProviderProps {
  children: ReactNode;
}

type AuthAction =
  | {
      type: 'LOGIN';
      payload: string;
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
      payload: Partial<EditableUserFields>;
    }
  | {
      type: 'UPDATE_SETTINGS';
      payload: Partial<UserSettings>;
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
  return mockUsers.map((user) => ({
    ...user,
    subscription: {
      ...user.subscription,
    },
    stats: {
      ...user.stats,
    },
    settings: cloneSettings(
      user.settings,
    ),
    followedUserIds: [
      ...user.followedUserIds,
    ],
    artistPortfolio: user.artistPortfolio
      ? [...user.artistPortfolio]
      : undefined,
  }));
}

function cloneCredentials() {
  return mockCredentials.map(
    (credential) => ({
      ...credential,
    }),
  );
}

const createInitialState =
  (): AuthState => ({
    users: cloneUsers(),
    credentials: cloneCredentials(),
    currentUserId: null,
    isInitialized: true,
  });

function authReducer(
  state: AuthState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUserId: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        currentUserId: null,
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
          action.payload.credential,
        ],
        currentUserId:
          action.payload.user.id,
      };

    case 'SELECT_DEMO_USER': {
      const userExists = state.users.some(
        (user) =>
          user.id === action.payload,
      );

      if (!userExists) {
        return state;
      }

      return {
        ...state,
        currentUserId: action.payload,
      };
    }

    case 'UPDATE_CURRENT_USER':
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === state.currentUserId
            ? {
                ...user,
                ...action.payload,
              }
            : user,
        ),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        users: state.users.map((user) => {
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
                      ...user.settings
                        .notifications,
                      ...action.payload
                        .notifications,
                    }
                  : user.settings
                      .notifications,
            },
          };
        }),
      };

    case 'RESET_DEMO_STATE':
      return createInitialState();

    default:
      return state;
  }
}

function normalizeEmail(
  email: string,
) {
  return email.trim().toLowerCase();
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
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') ||
    'avazify_user';

  let username = emailPrefix;
  let counter = 1;

  while (
    users.some(
      (user) =>
        user.username === username,
    )
  ) {
    username = `${emailPrefix}_${counter}`;
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
  createContext<AuthContextValue | null>(
    null,
  );

// Central mock authentication state.
export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(
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

  const value =
    useMemo<AuthContextValue>(
      () => ({
        users: state.users,
        currentUser,
        isAuthenticated:
          currentUser !== null,
        isInitialized:
          state.isInitialized,

        login: (
          input: LoginInput,
        ) => {
          const normalizedEmail =
            normalizeEmail(input.email);

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
            payload: user.id,
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
          input: ListenerRegistrationInput,
        ) => {
          const normalizedEmail =
            normalizeEmail(input.email);

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
            createUserId('listener');

          const username =
            createUniqueUsername(
              normalizedEmail,
              state.users,
            );

          const newUser: User = {
            id: userId,
            displayName:
              input.displayName.trim(),
            username,
            email: normalizedEmail,
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
            gender: input.gender,
            joinedAt:
              new Date().toISOString(),
            artistVerificationStatus:
              'not-applicable',
            stats: {
              followers: 0,
              following: 0,
              dailyStreams: 0,
              totalStreams: 0,
              playlistCount: 0,
            },
            settings: cloneSettings(
              defaultUserSettings,
            ),
            followedUserIds: [],
          };

          const credential: MockCredential =
            {
              userId,
              email: normalizedEmail,
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
          input: ArtistRegistrationInput,
        ) => {
          const normalizedEmail =
            normalizeEmail(input.email);

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
            createUserId('artist');

          const username =
            createUniqueUsername(
              normalizedEmail,
              state.users,
            );

          const portfolioItems = [
            input.portfolioUrl.trim(),
            ...input
              .portfolioFileNames,
          ].filter(Boolean);

          const newUser: User = {
            id: userId,
            displayName:
              input.artistName.trim(),
            username,
            email: normalizedEmail,
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
              new Date().toISOString(),
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

          const credential: MockCredential =
            {
              userId,
              email: normalizedEmail,
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

        selectDemoUser: (
          userId: string,
        ) => {
          dispatch({
            type: 'SELECT_DEMO_USER',
            payload: userId,
          });
        },

        updateCurrentUser: (
          changes,
        ) => {
          dispatch({
            type:
              'UPDATE_CURRENT_USER',
            payload: changes,
          });
        },

        updateSettings: (
          changes,
        ) => {
          dispatch({
            type: 'UPDATE_SETTINGS',
            payload: changes,
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

export {
  DEFAULT_DEMO_USER_ID,
};