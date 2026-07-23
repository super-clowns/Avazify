import type {
  MockCredential,
  User,
} from '../features/auth-profile/types';

const STORAGE_VERSION = 1;

const AUTH_DATA_KEY =
  'avazify.auth.data';

const REMEMBERED_USER_KEY =
  'avazify.auth.remembered-user';

const SESSION_USER_KEY =
  'avazify.auth.session-user';

interface StoredAuthData {
  version: number;
  users: User[];
  credentials: MockCredential[];
}

export interface StoredSession {
  userId: string | null;
  rememberMe: boolean;
}

function canUseWindowStorage() {
  return typeof window !== 'undefined';
}

function cloneUser(
  user: User,
): User {
  return {
    ...user,

    subscription: {
      ...user.subscription,
    },

    stats: {
      ...user.stats,
    },

    settings: {
      ...user.settings,

      notifications: {
        ...user.settings.notifications,
      },
    },

    followedUserIds: [
      ...user.followedUserIds,
    ],

    artistPortfolio:
      user.artistPortfolio
        ? [...user.artistPortfolio]
        : undefined,
  };
}

function cloneCredential(
  credential: MockCredential,
): MockCredential {
  return {
    ...credential,
  };
}

function mergeUser(
  defaultUser: User,
  storedUser: User,
): User {
  return {
    ...defaultUser,
    ...storedUser,

    subscription: {
      ...defaultUser.subscription,
      ...storedUser.subscription,
    },

    stats: {
      ...defaultUser.stats,
      ...storedUser.stats,
    },

    settings: {
      ...defaultUser.settings,
      ...storedUser.settings,

      notifications: {
        ...defaultUser.settings
          .notifications,

        ...storedUser.settings
          .notifications,
      },
    },

    followedUserIds:
      Array.isArray(
        storedUser.followedUserIds,
      )
        ? [
            ...storedUser
              .followedUserIds,
          ]
        : [
            ...defaultUser
              .followedUserIds,
          ],

    artistPortfolio:
      Array.isArray(
        storedUser.artistPortfolio,
      )
        ? [
            ...storedUser
              .artistPortfolio,
          ]
        : defaultUser.artistPortfolio
          ? [
              ...defaultUser
                .artistPortfolio,
            ]
          : undefined,
  };
}

function mergeUsers(
  defaultUsers: User[],
  storedUsers: User[],
) {
  const storedUsersById =
    new Map(
      storedUsers.map(
        (user) => [
          user.id,
          user,
        ],
      ),
    );

  const mergedDefaultUsers =
    defaultUsers.map(
      (defaultUser) => {
        const storedUser =
          storedUsersById.get(
            defaultUser.id,
          );

        return storedUser
          ? mergeUser(
              defaultUser,
              storedUser,
            )
          : cloneUser(
              defaultUser,
            );
      },
    );

  const defaultUserIds =
    new Set(
      defaultUsers.map(
        (user) => user.id,
      ),
    );

  const customUsers =
    storedUsers
      .filter(
        (user) =>
          !defaultUserIds.has(
            user.id,
          ),
      )
      .map(cloneUser);

  return [
    ...mergedDefaultUsers,
    ...customUsers,
  ];
}

function mergeCredentials(
  defaultCredentials:
    MockCredential[],

  storedCredentials:
    MockCredential[],
) {
  const storedByUserId =
    new Map(
      storedCredentials.map(
        (credential) => [
          credential.userId,
          credential,
        ],
      ),
    );

  const mergedDefaults =
    defaultCredentials.map(
      (credential) => {
        const storedCredential =
          storedByUserId.get(
            credential.userId,
          );

        return storedCredential
          ? cloneCredential(
              storedCredential,
            )
          : cloneCredential(
              credential,
            );
      },
    );

  const defaultUserIds =
    new Set(
      defaultCredentials.map(
        (credential) =>
          credential.userId,
      ),
    );

  const customCredentials =
    storedCredentials
      .filter(
        (credential) =>
          !defaultUserIds.has(
            credential.userId,
          ),
      )
      .map(cloneCredential);

  return [
    ...mergedDefaults,
    ...customCredentials,
  ];
}

function isStoredAuthData(
  value: unknown,
): value is StoredAuthData {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<StoredAuthData>;

  return (
    candidate.version ===
      STORAGE_VERSION &&
    Array.isArray(
      candidate.users,
    ) &&
    Array.isArray(
      candidate.credentials,
    )
  );
}

// Load stored users and credentials.
export function loadPersistedAuthData(
  defaultUsers: User[],
  defaultCredentials:
    MockCredential[],
) {
  const fallback = {
    users:
      defaultUsers.map(
        cloneUser,
      ),

    credentials:
      defaultCredentials.map(
        cloneCredential,
      ),
  };

  if (!canUseWindowStorage()) {
    return fallback;
  }

  try {
    const rawData =
      window.localStorage.getItem(
        AUTH_DATA_KEY,
      );

    if (!rawData) {
      return fallback;
    }

    const parsedData:
      unknown =
        JSON.parse(rawData);

    if (
      !isStoredAuthData(
        parsedData,
      )
    ) {
      window.localStorage.removeItem(
        AUTH_DATA_KEY,
      );

      return fallback;
    }

    return {
      users: mergeUsers(
        defaultUsers,
        parsedData.users,
      ),

      credentials:
        mergeCredentials(
          defaultCredentials,
          parsedData.credentials,
        ),
    };
  } catch (error) {
    console.warn(
      'Failed to load local auth data.',
      error,
    );

    return fallback;
  }
}

// Persist users and credentials.
export function persistAuthData(
  users: User[],
  credentials:
    MockCredential[],
) {
  if (!canUseWindowStorage()) {
    return;
  }

  const data: StoredAuthData = {
    version: STORAGE_VERSION,

    users:
      users.map(
        cloneUser,
      ),

    credentials:
      credentials.map(
        cloneCredential,
      ),
  };

  try {
    window.localStorage.setItem(
      AUTH_DATA_KEY,
      JSON.stringify(data),
    );
  } catch (error) {
    console.warn(
      'Failed to persist local auth data.',
      error,
    );
  }
}

// Load remembered or temporary session.
export function loadPersistedSession(
  validUserIds: string[],
): StoredSession {
  const emptySession: StoredSession = {
    userId: null,
    rememberMe: false,
  };

  if (!canUseWindowStorage()) {
    return emptySession;
  }

  const validIds =
    new Set(validUserIds);

  try {
    const rememberedUserId =
      window.localStorage.getItem(
        REMEMBERED_USER_KEY,
      );

    if (
      rememberedUserId &&
      validIds.has(
        rememberedUserId,
      )
    ) {
      return {
        userId:
          rememberedUserId,
        rememberMe: true,
      };
    }

    if (rememberedUserId) {
      window.localStorage.removeItem(
        REMEMBERED_USER_KEY,
      );
    }

    const sessionUserId =
      window.sessionStorage.getItem(
        SESSION_USER_KEY,
      );

    if (
      sessionUserId &&
      validIds.has(
        sessionUserId,
      )
    ) {
      return {
        userId:
          sessionUserId,
        rememberMe: false,
      };
    }

    if (sessionUserId) {
      window.sessionStorage.removeItem(
        SESSION_USER_KEY,
      );
    }

    return emptySession;
  } catch (error) {
    console.warn(
      'Failed to load auth session.',
      error,
    );

    return emptySession;
  }
}

// Persist current login session.
export function persistAuthSession(
  userId: string | null,
  rememberMe: boolean,
) {
  if (!canUseWindowStorage()) {
    return;
  }

  try {
    if (!userId) {
      window.localStorage.removeItem(
        REMEMBERED_USER_KEY,
      );

      window.sessionStorage.removeItem(
        SESSION_USER_KEY,
      );

      return;
    }

    if (rememberMe) {
      window.localStorage.setItem(
        REMEMBERED_USER_KEY,
        userId,
      );

      window.sessionStorage.removeItem(
        SESSION_USER_KEY,
      );

      return;
    }

    window.sessionStorage.setItem(
      SESSION_USER_KEY,
      userId,
    );

    window.localStorage.removeItem(
      REMEMBERED_USER_KEY,
    );
  } catch (error) {
    console.warn(
      'Failed to persist auth session.',
      error,
    );
  }
}

// Remove all mock authentication data.
export function clearAuthStorage() {
  if (!canUseWindowStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(
      AUTH_DATA_KEY,
    );

    window.localStorage.removeItem(
      REMEMBERED_USER_KEY,
    );

    window.sessionStorage.removeItem(
      SESSION_USER_KEY,
    );
  } catch (error) {
    console.warn(
      'Failed to clear auth storage.',
      error,
    );
  }
}