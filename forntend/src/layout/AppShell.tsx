import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import Avatar from '../components/Avatar';
import { RoleBadge, SubscriptionBadge } from '../components/Badges';
import Icon, { type IconName } from '../components/Icon';
import { useAppState } from '../context/AppStateContext';
import PlayerBar from './PlayerBar';

interface NavigationItem {
  label: string;
  path: string;
  icon: IconName;
  badge?: number;
}

export default function AppShell() {
  const { currentUser, data, logout } = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setSidebarOpen(false), [location.pathname]);

  const unreadCount = useMemo(
    () => data.notifications.filter((item) => item.userId === currentUser?.id && !item.read).length,
    [currentUser?.id, data.notifications],
  );

  const primaryNavigation: NavigationItem[] = [
    { label: 'خانه', path: '/home', icon: 'home' },
    { label: 'کشف موسیقی', path: '/explore', icon: 'explore' },
    { label: 'پلی‌لیست‌ها', path: '/playlists', icon: 'playlist' },
    { label: 'اعلانات', path: '/notifications', icon: 'bell', badge: unreadCount },
    { label: 'پشتیبانی', path: '/support', icon: 'ticket' },
    { label: 'نمایه من', path: '/profile', icon: 'user' },
    { label: 'تنظیمات', path: '/settings', icon: 'settings' },
  ];

  const workspaceNavigation: NavigationItem[] = currentUser?.role === 'artist'
    ? [{ label: 'مدیریت آثار', path: '/studio', icon: 'studio' }]
    : currentUser?.role === 'support' || currentUser?.role === 'admin'
      ? [{ label: currentUser.role === 'admin' ? 'داشبورد مدیریت' : 'داشبورد پشتیبانی', path: '/dashboard', icon: 'dashboard' }]
      : [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`app-shell ${currentUser?.settings.compactMode ? 'compact-mode' : ''}`}>
      <button
        type="button"
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="بستن منو"
      />

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-block">
          <span className="brand-mark"><Icon name="music" size={25} /></span>
          <div>
            <strong>Avazify</strong>
            <small>موسیقی برای هر لحظه</small>
          </div>
          <button type="button" className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="بستن منو">
            <Icon name="close" />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="منوی اصلی">
          <span className="nav-section-label">پیمایش</span>
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
              {item.badge ? <b>{item.badge.toLocaleString('fa-IR')}</b> : null}
            </NavLink>
          ))}

          {workspaceNavigation.length ? (
            <>
              <span className="nav-section-label workspace-label">فضای کاری</span>
              {workspaceNavigation.map((item) => {
                const disabled = item.path === '/studio' && currentUser?.artistStatus !== 'approved';
                return disabled ? (
                  <span className="nav-link disabled" key={item.path} title="حساب هنرمند هنوز تأیید نشده است">
                    <Icon name={item.icon} size={20} />
                    <span>{item.label}</span>
                    <Icon name="lock" size={15} />
                  </span>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon name={item.icon} size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </>
          ) : null}
        </nav>

        <div className="sidebar-account-card">
          <div className="sidebar-account-head">
            <Avatar name={currentUser?.displayName ?? 'کاربر'} src={currentUser?.avatar} size="small" />
            <div>
              <strong>{currentUser?.displayName}</strong>
              <small>@{currentUser?.username}</small>
            </div>
          </div>
          <div className="sidebar-account-badges">
            {currentUser ? <RoleBadge role={currentUser.role} /> : null}
            {currentUser ? <SubscriptionBadge tier={currentUser.subscription} /> : null}
          </div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            خروج از حساب
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button type="button" className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="باز کردن منو">
            <Icon name="menu" />
          </button>
          <div className="topbar-title">
            <span>AVAZIFY</span>
            <strong>پلتفرم استریم موسیقی</strong>
          </div>
          <div className="topbar-actions">
            <NavLink className="topbar-notification" to="/notifications" aria-label="اعلانات">
              <Icon name="bell" />
              {unreadCount ? <span>{unreadCount.toLocaleString('fa-IR')}</span> : null}
            </NavLink>
            <NavLink className="topbar-profile" to="/profile">
              <div>
                <strong>{currentUser?.displayName}</strong>
                <small>{currentUser?.email}</small>
              </div>
              <Avatar name={currentUser?.displayName ?? 'کاربر'} src={currentUser?.avatar} size="small" />
            </NavLink>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <PlayerBar />
    </div>
  );
}
