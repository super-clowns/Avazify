import { NavLink } from 'react-router-dom';

import { APP_PATHS } from '../config/paths';

import DemoAccountSwitcher from '../features/auth-profile/components/DemoAccountSwitcher';

import { useAuth } from '../features/auth-profile/hooks/useAuth';

import type { UserRole } from '../features/auth-profile/types';

import {
  getRoleLabel,
  getSubscriptionLabel,
} from '../features/auth-profile/utils/userPresentation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  icon: string;
  to: string;
}

interface RoleNavigationItem
  extends NavigationItem {
  roles: UserRole[];
}

const mainNavigation: NavigationItem[] = [
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

const roleNavigation: RoleNavigationItem[] = [
  {
    label: 'مدیریت آثار',
    icon: '⬆',
    to: APP_PATHS.artistManagement,
    roles: ['artist'],
  },
  {
    label: 'داشبورد پشتیبانی',
    icon: '▦',
    to: APP_PATHS.dashboard,
    roles: ['support'],
  },
  {
    label: 'داشبورد مدیریت',
    icon: '▦',
    to: APP_PATHS.dashboard,
    roles: ['admin'],
  },
];

// Main responsive navigation.
export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const { currentUser } = useAuth();

  const visibleRoleNavigation =
    currentUser
      ? roleNavigation.filter(
          (item) =>
            item.roles.includes(
              currentUser.role,
            ),
        )
      : [];

  const artistProfilePath =
    currentUser?.artistProfileId
      ? APP_PATHS.artistById(
          currentUser.artistProfileId,
        )
      : null;

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
          isOpen
            ? 'app-sidebar-open'
            : ''
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
            <span>
              Music for everyone
            </span>
          </div>
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="منوی اصلی"
        >
          <p className="sidebar-section-title">
            منوی اصلی
          </p>

          {mainNavigation.map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({
                  isActive,
                }) =>
                  `sidebar-link ${
                    isActive
                      ? 'sidebar-link-active'
                      : ''
                  }`
                }
                end={
                  item.to ===
                  APP_PATHS.profile
                }
              >
                <span
                  className="sidebar-link-icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </NavLink>
            ),
          )}

          {artistProfilePath ? (
            <>
              <p className="sidebar-section-title sidebar-section-spaced">
                فضای هنرمند
              </p>

              <NavLink
                to={artistProfilePath}
                className={({
                  isActive,
                }) =>
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
                  ★
                </span>

                <span>
                  نمایه هنرمند
                </span>
              </NavLink>
            </>
          ) : null}

          {visibleRoleNavigation.length >
          0 ? (
            <>
              <p className="sidebar-section-title sidebar-section-spaced">
                فضای کاری نقش
              </p>

              {visibleRoleNavigation.map(
                (item) => (
                  <NavLink
                    key={`${item.to}-${item.label}`}
                    to={item.to}
                    className={({
                      isActive,
                    }) =>
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

                    <span>
                      {item.label}
                    </span>
                  </NavLink>
                ),
              )}
            </>
          ) : null}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-plan-row">
            <div>
              <span>
                حساب فعال
              </span>

              <strong>
                {currentUser
                  ? getSubscriptionLabel(
                      currentUser
                        .subscription
                        .tier,
                    )
                  : 'بدون اشتراک'}
              </strong>
            </div>

            <span className="status-badge">
              {currentUser
                ? getRoleLabel(
                    currentUser.role,
                  )
                : 'مهمان'}
            </span>
          </div>

          <p>
            وضعیت حساب در این فاز از
            Context مرکزی خوانده می‌شود.
          </p>

          <DemoAccountSwitcher />
        </div>
      </aside>
    </>
  );
}