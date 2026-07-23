import { Link } from 'react-router-dom';

import {
  APP_PATHS,
} from '../../../config/paths';

import { useAuth } from '../hooks/useAuth';
import { useFollow } from '../hooks/useFollow';

import {
  getAvatarInitial,
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

import FollowButton from './FollowButton';

// Show recommended user accounts.
export default function SuggestedUsers() {
  const {
    users,
    currentUser,
  } = useAuth();

  const {
    isFollowing,
    getFollowerCount,
  } = useFollow();

  if (!currentUser) {
    return null;
  }

  const suggestedUsers = users
    .filter(
      (user) =>
        user.id !== currentUser.id,
    )
    .sort((firstUser, secondUser) => {
      const firstIsFollowing =
        isFollowing(firstUser.id);

      const secondIsFollowing =
        isFollowing(secondUser.id);

      if (
        firstIsFollowing !==
        secondIsFollowing
      ) {
        return firstIsFollowing
          ? 1
          : -1;
      }

      const firstIsArtist =
        firstUser.role === 'artist';

      const secondIsArtist =
        secondUser.role === 'artist';

      if (
        firstIsArtist !==
        secondIsArtist
      ) {
        return firstIsArtist
          ? -1
          : 1;
      }

      return (
        getFollowerCount(
          secondUser.id,
        ) -
        getFollowerCount(
          firstUser.id,
        )
      );
    })
    .slice(0, 4);

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <section className="content-card suggested-users-section">
      <div className="content-card-heading">
        <div>
          <p className="page-eyebrow">
            Discover users
          </p>

          <h2>
            کاربران پیشنهادی
          </h2>
        </div>
      </div>

      <div className="suggested-users-grid">
        {suggestedUsers.map((user) => (
          <article
            className="suggested-user-card"
            key={user.id}
          >
            <Link
              className="suggested-user-profile"
              to={APP_PATHS.profileByUsername(
                user.username,
              )}
            >
              <div className="avatar suggested-user-avatar">
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
                {' · '}
                {getSubscriptionLabel(
                  user.subscription.tier,
                )}
              </p>

              <small>
                {getFollowerCount(
                  user.id,
                ).toLocaleString(
                  'fa-IR',
                )}{' '}
                دنبال‌کننده
              </small>
            </Link>

            <FollowButton
              userId={user.id}
              fullWidth
              compact
              showFeedback={false}
            />
          </article>
        ))}
      </div>
    </section>
  );
}