import { useAuth } from '../hooks/useAuth';

// Show the current persistence mode.
export default function PersistenceStatus() {
  const {
    currentUser,
    isRememberedSession,
  } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="persistence-status">
      <span
        className={`persistence-status-dot ${
          isRememberedSession
            ? 'persistence-status-dot-remembered'
            : 'persistence-status-dot-session'
        }`}
        aria-hidden="true"
      />

      <div>
        <strong>
          {isRememberedSession
            ? 'ورود دائمی فعال است'
            : 'نشست موقت فعال است'}
        </strong>

        <p>
          {isRememberedSession
            ? 'ورود این حساب پس از بستن و اجرای دوباره مرورگر باقی می‌ماند.'
            : 'ورود پس از Refresh باقی می‌ماند، اما با پایان نشست مرورگر پاک می‌شود.'}
        </p>

        <code dir="ltr">
          {currentUser.email}
        </code>
      </div>
    </div>
  );
}