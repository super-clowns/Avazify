import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import Modal from '../../../components/Modal';

import {
  APP_PATHS,
} from '../../../config/paths';

import { useAuth } from '../hooks/useAuth';
import { useFollow } from '../hooks/useFollow';

import type { User } from '../types';

import {
  getAvatarInitial,
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

import FollowButton from './FollowButton';

type ConnectionsTab =
  | 'followers'
  | 'following';

interface UserConnectionsModalProps {
  isOpen: boolean;
  userId: string;
  initialTab: ConnectionsTab;
  onClose: () => void;
}

interface ConnectionRowProps {
  user: User;
  onNavigate: () => void;
}

function ConnectionRow({
  user,
  onNavigate,
}: ConnectionRowProps) {
  const { currentUser } = useAuth();

  return (
    <article className="connection-user-row">
      <Link
        className="connection-user-main"
        to={APP_PATHS.profileByUsername(
          user.username,
        )}
        onClick={onNavigate}
      >
        <div className="avatar connection-user-avatar">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`عکس پروفایل ${user.displayName}`}
            />
          ) : (
            getAvatarInitial(user)
          )}
        </div>

        <div className="connection-user-copy">
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
        </div>
      </Link>

      {currentUser?.id !== user.id ? (
        <FollowButton
          userId={user.id}
          compact
          showFeedback={false}
        />
      ) : (
        <span className="connection-current-user-badge">
          حساب شما
        </span>
      )}
    </article>
  );
}

// Show followers and following lists.
export default function UserConnectionsModal({
  isOpen,
  userId,
  initialTab,
  onClose,
}: UserConnectionsModalProps) {
  const { getUserById } =
    useAuth();

  const {
    getFollowers,
    getFollowing,
  } = useFollow();

  const [
    activeTab,
    setActiveTab,
  ] = useState<ConnectionsTab>(
    initialTab,
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const profileUser =
    getUserById(userId);

  const followers =
    getFollowers(userId);

  const following =
    getFollowing(userId);

  const displayedUsers = useMemo(
    () =>
      activeTab === 'followers'
        ? followers
        : following,
    [
      activeTab,
      followers,
      following,
    ],
  );

  if (!profileUser) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={`ارتباطات ${profileUser.displayName}`}
      size="large"
      onClose={onClose}
    >
      <div
        className="connections-tabs"
        role="tablist"
        aria-label="فهرست ارتباطات کاربر"
      >
        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab === 'followers'
          }
          className={
            activeTab === 'followers'
              ? 'connections-tab-active'
              : ''
          }
          onClick={() =>
            setActiveTab('followers')
          }
        >
          دنبال‌کنندگان

          <span>
            {followers.length.toLocaleString(
              'fa-IR',
            )}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={
            activeTab === 'following'
          }
          className={
            activeTab === 'following'
              ? 'connections-tab-active'
              : ''
          }
          onClick={() =>
            setActiveTab('following')
          }
        >
          دنبال‌شوندگان

          <span>
            {following.length.toLocaleString(
              'fa-IR',
            )}
          </span>
        </button>
      </div>

      <div className="connections-list">
        {displayedUsers.length > 0 ? (
          displayedUsers.map((user) => (
            <ConnectionRow
              key={user.id}
              user={user}
              onNavigate={onClose}
            />
          ))
        ) : (
          <div className="connections-empty-state">
            <span aria-hidden="true">
              ♙
            </span>

            <strong>
              فهرست خالی است
            </strong>

            <p>
              {activeTab === 'followers'
                ? 'این کاربر هنوز دنبال‌کننده‌ای ندارد.'
                : 'این کاربر هنوز کسی را دنبال نکرده است.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}