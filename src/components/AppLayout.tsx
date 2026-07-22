import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import MusicPlayerBar from '../features/music/components/MusicPlayer/MusicPlayerBar';
import Sidebar from './Sidebar';

// Shared authenticated layout.
export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="app-main">
        <header className="app-header">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="باز کردن منوی اصلی"
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </button>

          <div>
            <p className="app-header-eyebrow">Avazify</p>
            <p className="app-header-title">پلتفرم موسیقی شما</p>
          </div>

          <div
            className="app-header-profile"
            aria-label="کاربر نمونه"
          >
            <div className="app-header-profile-copy">
              <strong>کاربر نمونه</strong>
              <span>اشتراک پایه</span>
            </div>

            <div
              className="avatar avatar-small"
              aria-hidden="true"
            >
              ک
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