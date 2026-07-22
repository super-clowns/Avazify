import {
  createContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import {
  DEFAULT_DEMO_USER_ID,
  mockUsers,
} from '../features/auth-profile/data/mockUsers';

import type {
  AuthContextValue,
  AuthState,
  EditableUserFields,
  UserSettings,
} from '../features/auth-profile/types';

interface AuthProviderProps {
  children: ReactNode;
}

type AuthAction =
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

const createInitialState = (): AuthState => ({
  users: mockUsers,
  currentUserId: DEFAULT_DEMO_USER_ID,
  isInitialized: true,
});

function authReducer(
  state: AuthState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case 'SELECT_DEMO_USER': {
      const userExists = state.users.some(
        (user) => user.id === action.payload,
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
          if (user.id !== state.currentUserId) {
            return user;
          }

          return {
            ...user,
            settings: {
              ...user.settings,
              ...action.payload,
              notifications:
                action.payload.notifications
                  ? {
                      ...user.settings.notifications,
                      ...action.payload.notifications,
                    }
                  : user.settings.notifications,
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

export const AuthContext =
  createContext<AuthContextValue | null>(null);

// Central mock authentication state.
export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(
    authReducer,
    createInitialState(),
  );

  const currentUser =
    state.users.find(
      (user) => user.id === state.currentUserId,
    ) ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      users: state.users,
      currentUser,
      isAuthenticated: currentUser !== null,
      isInitialized: state.isInitialized,

      selectDemoUser: (userId) => {
        dispatch({
          type: 'SELECT_DEMO_USER',
          payload: userId,
        });
      },

      updateCurrentUser: (changes) => {
        dispatch({
          type: 'UPDATE_CURRENT_USER',
          payload: changes,
        });
      },

      updateSettings: (changes) => {
        dispatch({
          type: 'UPDATE_SETTINGS',
          payload: changes,
        });
      },

      getUserById: (userId) =>
        state.users.find(
          (user) => user.id === userId,
        ),

      getUserByUsername: (username) =>
        state.users.find(
          (user) => user.username === username,
        ),

      resetDemoState: () => {
        dispatch({
          type: 'RESET_DEMO_STATE',
        });
      },
    }),
    [
      currentUser,
      state.isInitialized,
      state.users,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}