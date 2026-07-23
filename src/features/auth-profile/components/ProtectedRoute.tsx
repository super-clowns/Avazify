import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  APP_PATHS,
} from '../../../config/paths';

import { useAuth } from '../hooks/useAuth';

// Protect authenticated pages.
export default function ProtectedRoute() {
  const {
    currentUser,
    isInitialized,
  } = useAuth();

  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (!currentUser) {
    return (
      <Navigate
        to={APP_PATHS.login}
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}