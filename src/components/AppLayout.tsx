import {
  useEffect,
  useState,
} from 'react';

import {
  Outlet,
  useLocation,
} from 'react-router-dom';

import MusicPlayerBar from '../features/music/components/MusicPlayer/MusicPlayerBar';

import { useAuth } from '../features/auth-profile/hooks/useAuth';

import {
  getAvatarInitial,
  getRoleLabel,
  getSubscriptionLabel,
} from '../features/auth-profile/utils/userPresentation';

import Sidebar from './Sidebar';

// Shared authenticated layout.
export default function AppLayout() {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);

  const location =
    useLocation();

  const {
    currentUser,
  } = useAuth();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const displayName =
    currentUser?.displayName ??
    'کاربر مهمان';

  const accountDescription =
    currentUser
      ? `${getRoleLabel(
          currentUser.role,
        )} · ${getSubscriptionLabel(
          currentUser
            .subscription
            .tier,
        )}`
      : 'بدون حساب فعال';

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() =>
          setIsSidebarOpen(
            false,
          )
        }
      />

      <div className="app-main">
        <header className="app-header">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="باز کردن منوی اصلی"
            aria-expanded={
              isSidebarOpen
            }
            onClick={() =>
              setIsSidebarOpen(
                true,
              )
            }
          >
            ☰
          </button>

          <div>
            <p className="app-header-eyebrow">
              Avazify
            </p>

            <p className="app-header-title">
              پلتفرم موسیقی شما
            </p>
          </div>

          <div
            className="app-header-profile"
            aria-label={`حساب فعال: ${displayName}`}
          >
            <div className="app-header-profile-copy">
              <strong>
                {displayName}
              </strong>

              <span>
                {
                  accountDescription
                }
              </span>
            </div>

            <div className="avatar avatar-small">
              {currentUser?.avatar ? (
                <img
                  src={
                    currentUser.avatar
                  }
                  alt={`عکس پروفایل ${currentUser.displayName}`}
                />
              ) : currentUser ? (
                getAvatarInitial(
                  currentUser,
                )
              ) : (
                'A'
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <MusicPlayerBar />
    </div>
  );
}