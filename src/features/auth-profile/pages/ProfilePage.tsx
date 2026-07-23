import { useState } from 'react';

import { useParams } from 'react-router-dom';

import Button from '../../../components/Button';

import FollowButton from '../components/FollowButton';
import PhasePlaceholder from '../components/PhasePlaceholder';
import ProfileEditModal from '../components/ProfileEditModal';
import SuggestedUsers from '../components/SuggestedUsers';
import UserConnectionsModal from '../components/UserConnectionsModal';

import { useAuth } from '../hooks/useAuth';
import { useFollow } from '../hooks/useFollow';

import {
  getAvatarInitial,
  getDailyStreamLimit,
  getGenderLabel,
  getPlaylistLimit,
  getRoleLabel,
  getSubscriptionLabel,
} from '../utils/userPresentation';

type ConnectionsTab =
  | 'followers'
  | 'following';

function formatDate(
  value: string | null,
) {
  if (!value) {
    return 'ثبت نشده';
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return 'ثبت نشده';
  }

  return new Intl.DateTimeFormat(
    'fa-IR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  ).format(date);
}

// User profile and follow page.
export default function ProfilePage() {
  const { username } =
    useParams<{
      username: string;
    }>();

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  const [
    isConnectionsModalOpen,
    setIsConnectionsModalOpen,
  ] = useState(false);

  const [
    connectionsTab,
    setConnectionsTab,
  ] = useState<ConnectionsTab>(
    'followers',
  );

  const {
    currentUser,
    getUserByUsername,
  } = useAuth();

  const {
    getFollowerCount,
    getFollowingCount,
  } = useFollow();

  const profileUser =
    username
      ? getUserByUsername(
          username,
        )
      : currentUser ??
        undefined;

  if (!profileUser) {
    return (
      <section className="profile-not-found">
        <h1>
          کاربر پیدا نشد
        </h1>

        <p>
          نام کاربری واردشده در
          اطلاعات فعلی سامانه وجود
          ندارد.
        </p>
      </section>
    );
  }

  const isOwnProfile =
    currentUser?.id ===
    profileUser.id;

  const followerCount =
    getFollowerCount(
      profileUser.id,
    );

  const followingCount =
    getFollowingCount(
      profileUser.id,
    );

  const playlistLimit =
    getPlaylistLimit(
      profileUser
        .subscription
        .tier,
    );

  const dailyStreamLimit =
    getDailyStreamLimit(
      profileUser
        .subscription
        .tier,
    );

  const subscriptionClass =
    `subscription-pill-${profileUser.subscription.tier}`;

  const openConnections = (
    tab: ConnectionsTab,
  ) => {
    setConnectionsTab(tab);
    setIsConnectionsModalOpen(
      true,
    );
  };

  return (
    <>
      <PhasePlaceholder
        eyebrow="User Module / Follow System"
        title={
          isOwnProfile
            ? 'نمایه کاربری من'
            : `نمایه ${profileUser.displayName}`
        }
        description="سیستم دنبال‌کردن کاربران به وضعیت مرکزی متصل است و تمام ارتباطات کاربران پس از Refresh نیز حفظ می‌شوند."
        items={[
          'دنبال‌کردن و لغو دنبال‌کردن کاربران',
          'شمارش پویای دنبال‌کنندگان و دنبال‌شوندگان',
          'نمایش فهرست کامل ارتباطات هر کاربر',
          'ذخیره دائمی روابط کاربران در Local Storage',
        ]}
        actions={
          isOwnProfile ? (
            <Button
              variant="secondary"
              onClick={() =>
                setIsEditModalOpen(
                  true,
                )
              }
            >
              ویرایش نمایه
            </Button>
          ) : (
            <FollowButton
              userId={
                profileUser.id
              }
            />
          )
        }
      >
        <div className="user-state-strip">
          <div>
            <strong>
              {getRoleLabel(
                profileUser.role,
              )}
            </strong>

            <span dir="ltr">
              @{profileUser.username}
            </span>
          </div>

          <code>
            {profileUser.id}
          </code>
        </div>

        <section className="profile-card">
          <div className="profile-banner">
            <div className="profile-banner-shape profile-banner-shape-one" />

            <div className="profile-banner-shape profile-banner-shape-two" />
          </div>

          <div className="profile-main-row">
            <div className="avatar avatar-large">
              {profileUser.avatar ? (
                <img
                  src={
                    profileUser.avatar
                  }
                  alt={`عکس پروفایل ${profileUser.displayName}`}
                />
              ) : (
                getAvatarInitial(
                  profileUser,
                )
              )}
            </div>

            <div className="profile-identity">
              <div className="profile-name-row">
                <h2>
                  {
                    profileUser
                      .displayName
                  }
                </h2>

                <span
                  className={`subscription-pill ${subscriptionClass}`}
                >
                  {getSubscriptionLabel(
                    profileUser
                      .subscription
                      .tier,
                  )}
                </span>
              </div>

              <p dir="ltr">
                @{profileUser.username}
              </p>

              <span>
                عضو از{' '}
                {formatDate(
                  profileUser.joinedAt,
                )}
              </span>
            </div>
          </div>

          {profileUser.bio ? (
            <div className="profile-bio-section">
              <p>
                {profileUser.bio}
              </p>
            </div>
          ) : isOwnProfile ? (
            <div className="profile-empty-bio">
              هنوز بیوگرافی ثبت
              نکرده‌اید. از طریق دکمه
              «ویرایش نمایه» آن را
              اضافه کنید.
            </div>
          ) : null}

          <div className="profile-stat-grid">
            <button
              type="button"
              className="profile-stat-button"
              onClick={() =>
                openConnections(
                  'followers',
                )
              }
            >
              <span>
                دنبال‌کننده
              </span>

              <strong>
                {followerCount.toLocaleString(
                  'fa-IR',
                )}
              </strong>

              <small>
                مشاهده فهرست
              </small>
            </button>

            <button
              type="button"
              className="profile-stat-button"
              onClick={() =>
                openConnections(
                  'following',
                )
              }
            >
              <span>
                دنبال‌شونده
              </span>

              <strong>
                {followingCount.toLocaleString(
                  'fa-IR',
                )}
              </strong>

              <small>
                مشاهده فهرست
              </small>
            </button>

            <article>
              <span>
                استریم امروز
              </span>

              <strong>
                {profileUser.stats.dailyStreams.toLocaleString(
                  'fa-IR',
                )}

                {dailyStreamLimit ===
                null
                  ? ' · نامحدود'
                  : ` از ${dailyStreamLimit.toLocaleString(
                      'fa-IR',
                    )}`}
              </strong>
            </article>

            <article>
              <span>
                پلی‌لیست‌ها
              </span>

              <strong>
                {profileUser.stats.playlistCount.toLocaleString(
                  'fa-IR',
                )}

                {playlistLimit ===
                null
                  ? ' · نامحدود'
                  : ` از ${playlistLimit.toLocaleString(
                      'fa-IR',
                    )}`}
              </strong>
            </article>
          </div>
        </section>

        <div className="profile-detail-grid">
          <section className="content-card">
            <div className="content-card-heading">
              <h2>
                اطلاعات شخصی
              </h2>

              {isOwnProfile ? (
                <button
                  type="button"
                  className="inline-text-button"
                  onClick={() =>
                    setIsEditModalOpen(
                      true,
                    )
                  }
                >
                  ویرایش
                </button>
              ) : null}
            </div>

            <dl className="profile-detail-list">
              <div>
                <dt>
                  نام نمایشی
                </dt>

                <dd>
                  {
                    profileUser
                      .displayName
                  }
                </dd>
              </div>

              <div>
                <dt>
                  نام کاربری
                </dt>

                <dd dir="ltr">
                  @{profileUser.username}
                </dd>
              </div>

              <div>
                <dt>
                  ایمیل
                </dt>

                <dd dir="ltr">
                  {isOwnProfile
                    ? profileUser.email
                    : 'Private'}
                </dd>
              </div>

              <div>
                <dt>
                  تاریخ تولد
                </dt>

                <dd>
                  {isOwnProfile
                    ? formatDate(
                        profileUser.birthDate,
                      )
                    : 'خصوصی'}
                </dd>
              </div>

              <div>
                <dt>
                  جنسیت
                </dt>

                <dd>
                  {isOwnProfile
                    ? getGenderLabel(
                        profileUser.gender,
                      )
                    : 'خصوصی'}
                </dd>
              </div>

              <div>
                <dt>
                  نقش سامانه
                </dt>

                <dd>
                  {getRoleLabel(
                    profileUser.role,
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="content-card">
            <div className="content-card-heading">
              <h2>
                وضعیت اشتراک
              </h2>
            </div>

            <div className="subscription-summary">
              <div className="subscription-summary-icon">
                ◇
              </div>

              <div>
                <strong>
                  {getSubscriptionLabel(
                    profileUser
                      .subscription
                      .tier,
                  )}
                </strong>

                <p>
                  {dailyStreamLimit ===
                  null
                    ? 'استریم روزانه نامحدود'
                    : `${dailyStreamLimit.toLocaleString(
                        'fa-IR',
                      )} استریم روزانه`}

                  {' · '}

                  {playlistLimit ===
                  null
                    ? 'پلی‌لیست نامحدود'
                    : `حداکثر ${playlistLimit.toLocaleString(
                        'fa-IR',
                      )} پلی‌لیست`}
                </p>
              </div>
            </div>

            {isOwnProfile ? (
              <Button
                variant="secondary"
                fullWidth
              >
                مشاهده گزینه‌های ارتقا
              </Button>
            ) : (
              <FollowButton
                userId={
                  profileUser.id
                }
                fullWidth
              />
            )}
          </section>
        </div>

        {isOwnProfile ? (
          <SuggestedUsers />
        ) : null}
      </PhasePlaceholder>

      {isOwnProfile ? (
        <ProfileEditModal
          isOpen={
            isEditModalOpen
          }
          onClose={() =>
            setIsEditModalOpen(
              false,
            )
          }
        />
      ) : null}

      <UserConnectionsModal
        isOpen={
          isConnectionsModalOpen
        }
        userId={
          profileUser.id
        }
        initialTab={
          connectionsTab
        }
        onClose={() =>
          setIsConnectionsModalOpen(
            false,
          )
        }
      />
    </>
  );
}