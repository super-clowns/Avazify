import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { useAppState } from './context/AppStateContext';
import AppShell from './layout/AppShell';
import ArtistStudioPage from './pages/ArtistStudioPage';
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPages';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import { AlbumPage, ExplorePage, PlaylistsPage } from './pages/LibraryPages';
import NotificationsPage from './pages/NotificationsPage';
import { ArtistPage, ProfilePage } from './pages/ProfilePages';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import type { UserRole } from './types';

function GuestOnlyRoute() {
  const { isAuthenticated, isLoading } = useAppState();
  if (isLoading) return <div className="app-loading">در حال بارگذاری آوازیفای...</div>;
  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAppState();
  const location = useLocation();
  if (isLoading) return <div className="app-loading">در حال اتصال به سرور...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { currentUser, isLoading } = useAppState();
  if (isLoading) return <div className="app-loading">در حال بررسی دسترسی...</div>;
  return currentUser && roles.includes(currentUser.role) ? <Outlet /> : <Navigate to="/home" replace />;
}

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAppState();
  if (isLoading) return <div className="app-loading">در حال بارگذاری...</div>;
  return <Navigate to={isAuthenticated ? '/home' : '/login'} replace />;
}

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <span>۴۰۴</span>
      <h1>این صفحه پیدا نشد</h1>
      <p>آدرس واردشده در آوازیفای وجود ندارد یا جابه‌جا شده است.</p>
      <Link className="button button-primary" to="/home">بازگشت به خانه</Link>
    </section>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/artist/:artistId" element={<ArtistPage />} />
          <Route path="/album/:albumId" element={<AlbumPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportPage />} />

          <Route element={<RoleRoute roles={['artist']} />}>
            <Route path="/studio" element={<ArtistStudioPage />} />
          </Route>

          <Route element={<RoleRoute roles={['support', 'admin']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
