import { Link } from 'react-router-dom';

import {
  APP_PATHS,
} from '../../../config/paths';

import { useFollow } from '../hooks/useFollow';

import type { User } from '../types';

import {
  getAvatarInitial,
  getFollowerCountLabel,
  getRoleLabel,
} from '../utils/homePresentation';

import FollowButton from './FollowButton';

interface HomeUserSuggestionsProps {
  users: User[];
}

// Show suggested accounts on home.
export default function HomeUserSuggestions({
  users,
}: HomeUserSuggestionsProps) {
  const {
    getFollowerCount,
  } = useFollow();

  if (users.length === 0) {
    return null;
  }

  return (
    <section className="home-dashboard-section">
      <div className="home-section-heading">
        <div>
          <p className="page-eyebrow">
            Discover people
          </p>

          <h2>
            کاربران پیشنهادی
          </h2>

          <p>
            کاربران و هنرمندانی که ممکن
            است برای شما جالب باشند.
          </p>
        </div>
      </div>

      <div className="home-users-grid">
        {users.map((user) => (
          <article
            className="home-user-card"
            key={user.id}
          >
            <Link
              className="home-user-profile"
              to={APP_PATHS.profileByUsername(
                user.username,
              )}
            >
              <div className="avatar home-user-avatar">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`عکس پروفایل ${user.displayName}`}
                  />
                ) : (
                  getAvatarInitial(user)
                )}
              </div>

              <strong>
                {user.displayName}
              </strong>

              <span dir="ltr">
                @{user.username}
              </span>

              <p>
                {getRoleLabel(user.role)}
              </p>

              <small>
                {getFollowerCountLabel(
                  getFollowerCount(
                    user.id,
                  ),
                )}
              </small>
            </Link>

            <FollowButton
              userId={user.id}
              compact
              fullWidth
              showFeedback={false}
            />
          </article>
        ))}
      </div>
    </section>
  );
}