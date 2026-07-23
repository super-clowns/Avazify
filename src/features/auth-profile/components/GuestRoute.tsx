import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

import {
  getRoleHomePath,
} from '../utils/userPresentation';

// Hide guest pages after login.
export default function GuestRoute() {
  const {
    currentUser,
    isInitialized,
  } = useAuth();

  if (!isInitialized) {
    return null;
  }

  if (currentUser) {
    return (
      <Navigate
        to={getRoleHomePath(
          currentUser,
        )}
        replace
      />
    );
  }

  return <Outlet />;
}