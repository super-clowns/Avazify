import { useAuth } from '../hooks/useAuth';

import {
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

import '../auth-profile.css';

// Switch mock accounts during phase one.
export default function DemoAccountSwitcher() {
  const {
    users,
    currentUser,
    selectDemoUser,
    resetDemoState,
  } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <section className="demo-account-switcher">
      <div className="demo-account-heading">
        <div>
          <span>حساب فعال آزمایشی</span>
          <strong>
            {getRoleLabel(currentUser.role)}
          </strong>
        </div>

        <button
          type="button"
          onClick={resetDemoState}
          aria-label="بازنشانی حساب آزمایشی"
        >
          ↻
        </button>
      </div>

      <label htmlFor="demo-user-select">
        تغییر نقش و اشتراک
      </label>

      <select
        id="demo-user-select"
        value={currentUser.id}
        onChange={(event) =>
          selectDemoUser(event.target.value)
        }
      >
        {users.map((user) => (
          <option
            key={user.id}
            value={user.id}
          >
            {user.displayName} —{' '}
            {getRoleLabel(user.role)} —{' '}
            {getSubscriptionLabel(
              user.subscription.tier,
            )}
          </option>
        ))}
      </select>

      <p>
        این انتخاب فقط در حافظه برنامه
        نگهداری می‌شود و با تازه‌سازی صفحه
        بازنشانی خواهد شد.
      </p>
    </section>
  );
}