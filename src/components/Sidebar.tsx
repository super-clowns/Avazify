import { NavLink } from 'react-router-dom';

import { APP_PATHS } from '../config/paths';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainNavigation = [
  {
    label: 'خانه',
    icon: '⌂',
    to: APP_PATHS.home,
  },
  {
    label: 'آرشیو موسیقی',
    icon: '♫',
    to: APP_PATHS.archive,
  },
  {
    label: 'پلی‌لیست‌ها',
    icon: '▤',
    to: APP_PATHS.playlists,
  },
  {
    label: 'اعلانات',
    icon: '◉',
    to: APP_PATHS.notifications,
  },
  {
    label: 'نمایه کاربر',
    icon: '♙',
    to: APP_PATHS.profile,
  },
  {
    label: 'تنظیمات',
    icon: '⚙',
    to: APP_PATHS.settings,
  },
];

const workspaceNavigation = [
  {
    label: 'نمایه هنرمند',
    icon: '★',
    to: APP_PATHS.artistById('sample'),
  },
  {
    label: 'مدیریت آثار',
    icon: '⬆',
    to: APP_PATHS.artistManagement,
  },
  {
    label: 'داشبورد مدیریت',
    icon: '▦',
    to: APP_PATHS.dashboard,
  },
];

// Main responsive navigation.
export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${
          isOpen
            ? 'sidebar-backdrop-visible'
            : ''
        }`}
        onClick={onClose}
        aria-label="بستن منوی اصلی"
      />

      <aside
        className={`app-sidebar ${
          isOpen ? 'app-sidebar-open' : ''
        }`}
      >
        <div className="sidebar-brand">
          <div
            className="sidebar-logo"
            aria-hidden="true"
          >
            A
          </div>

          <div>
            <strong>Avazify</strong>
            <span>Music for everyone</span>
          </div>
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="منوی اصلی"
        >
          <p className="sidebar-section-title">
            منوی اصلی
          </p>

          {mainNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? 'sidebar-link-active'
                    : ''
                }`
              }
              end={item.to === APP_PATHS.profile}
            >
              <span
                className="sidebar-link-icon"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="sidebar-section-title sidebar-section-spaced">
            فضاهای کاری
          </p>

          {workspaceNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? 'sidebar-link-active'
                    : ''
                }`
              }
            >
              <span
                className="sidebar-link-icon"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-plan-row">
            <div>
              <span>پلن فعلی</span>
              <strong>اشتراک پایه</strong>
            </div>

            <span className="status-badge">
              رایگان
            </span>
          </div>

          <p>
            ارتقای اشتراک در فاز دوم به
            درگاه پرداخت متصل می‌شود.
          </p>
        </div>
      </aside>
    </>
  );
}