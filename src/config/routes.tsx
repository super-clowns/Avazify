import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AppLayout from '../components/AppLayout';

import DashboardPage from '../features/admin-artist/pages/DashboardPage';
import ArtistManagementPage from '../features/admin-artist/pages/ArtistManagementPage';
import ArtistProfilePage from '../features/admin-artist/pages/ArtistProfilePage';
import NotificationsPage from '../features/admin-artist/pages/NotificationsPage';

import GuestRoute from '../features/auth-profile/components/GuestRoute';
import ProtectedRoute from '../features/auth-profile/components/ProtectedRoute';
import RoleRoute from '../features/auth-profile/components/RoleRoute';

import ForgotPasswordPage from '../features/auth-profile/pages/ForgotPassword';
import HomePage from '../features/auth-profile/pages/HomePage';
import LoginPage from '../features/auth-profile/pages/LoginPage';
import ProfilePage from '../features/auth-profile/pages/ProfilePage';
import RegisterPage from '../features/auth-profile/pages/RegisterPage';
import SettingsPage from '../features/auth-profile/pages/SettingsPage';

import AlbumDetailsPage from '../features/music/pages/AlbumDetailsPage';
import ArchivePage from '../features/music/pages/ArchivePage';
import PlaylistsPage from '../features/music/pages/PlaylistsPage';

import { APP_PATHS } from './paths';

// Application route map.
export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path={APP_PATHS.root}
        element={
          <Navigate
            to={APP_PATHS.login}
            replace
          />
        }
      />

      <Route element={<GuestRoute />}>
        <Route
          path={APP_PATHS.login}
          element={<LoginPage />}
        />

        <Route
          path={APP_PATHS.register}
          element={<RegisterPage />}
        />

        <Route
          path={APP_PATHS.forgotPassword}
          element={<ForgotPasswordPage />}
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path={APP_PATHS.home}
            element={<HomePage />}
          />

          <Route
            path={APP_PATHS.profile}
            element={<ProfilePage />}
          />

          <Route
            path="/profile/:username"
            element={<ProfilePage />}
          />

          <Route
            path={APP_PATHS.settings}
            element={<SettingsPage />}
          />

          <Route
            path={APP_PATHS.notifications}
            element={<NotificationsPage />}
          />

          <Route
            path={APP_PATHS.playlists}
            element={<PlaylistsPage />}
          />

          <Route
            path={APP_PATHS.archive}
            element={<ArchivePage />}
          />

          <Route
            path="/album/:albumId"
            element={<AlbumDetailsPage />}
          />

          <Route
            path="/artist/:artistId"
            element={<ArtistProfilePage />}
          />

          <Route
            element={
              <RoleRoute
                allowedRoles={['artist']}
              />
            }
          >
            <Route
              path={APP_PATHS.artistManagement}
              element={<ArtistManagementPage />}
            />
          </Route>
        </Route>

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                'support',
                'admin',
              ]}
            />
          }
        >
          <Route
            path={APP_PATHS.dashboard}
            element={<DashboardPage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={APP_PATHS.root}
            replace
          />
        }
      />
    </Routes>
  );
}