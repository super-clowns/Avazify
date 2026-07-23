import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  APP_PATHS,
} from '../../../config/paths';

import type {
  UserRole,
} from '../types';

import { useAuth } from '../hooks/useAuth';

import {
  getRoleHomePath,
} from '../utils/userPresentation';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

// Protect role-specific pages.
export default function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {
  const { currentUser } = useAuth();

  const location = useLocation();

  if (!currentUser) {
    return null;
  }

  if (
    !allowedRoles.includes(
      currentUser.role,
    )
  ) {
    return (
      <Navigate
        to={getRoleHomePath(
          currentUser,
        )}
        replace
      />
    );
  }

  const isArtistManagement =
    location.pathname ===
    APP_PATHS.artistManagement;

  const isUnverifiedArtist =
    currentUser.role === 'artist' &&
    currentUser
      .artistVerificationStatus !==
      'approved';

  if (
    isArtistManagement &&
    isUnverifiedArtist
  ) {
    return (
      <Navigate
        to={APP_PATHS.home}
        replace
      />
    );
  }

  return <Outlet />;
}