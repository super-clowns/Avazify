import {
  useCallback,
  useMemo,
} from 'react';

import { useAuth } from './useAuth';

import type {
  FollowOperationResult,
  User,
} from '../types';

function createResult(
  success: boolean,
  message: string,
): FollowOperationResult {
  return {
    success,
    message,
  };
}

// Manage user follow relationships.
export function useFollow() {
  const {
    users,
    currentUser,
    getUserById,
    updateCurrentUser,
  } = useAuth();

  const followedUserIds =
    currentUser?.followedUserIds ?? [];

  const followedUserIdSet = useMemo(
    () => new Set(followedUserIds),
    [followedUserIds],
  );

  const isFollowing = useCallback(
    (userId: string) =>
      followedUserIdSet.has(userId),
    [followedUserIdSet],
  );

  const getFollowers = useCallback(
    (userId: string): User[] =>
      users.filter((user) =>
        user.followedUserIds.includes(userId),
      ),
    [users],
  );

  const getFollowing = useCallback(
    (userId: string): User[] => {
      const user = getUserById(userId);

      if (!user) {
        return [];
      }

      const followingIdSet = new Set(
        user.followedUserIds,
      );

      return users.filter((item) =>
        followingIdSet.has(item.id),
      );
    },
    [getUserById, users],
  );

  const getFollowerCount = useCallback(
    (userId: string) =>
      getFollowers(userId).length,
    [getFollowers],
  );

  const getFollowingCount = useCallback(
    (userId: string) =>
      getFollowing(userId).length,
    [getFollowing],
  );

  const followUser = useCallback(
    (
      targetUserId: string,
    ): FollowOperationResult => {
      if (!currentUser) {
        return createResult(
          false,
          'برای دنبال‌کردن کاربران باید وارد حساب شوید.',
        );
      }

      if (currentUser.id === targetUserId) {
        return createResult(
          false,
          'نمی‌توانید حساب خودتان را دنبال کنید.',
        );
      }

      const targetUser =
        getUserById(targetUserId);

      if (!targetUser) {
        return createResult(
          false,
          'کاربر موردنظر پیدا نشد.',
        );
      }

      if (
        currentUser.followedUserIds.includes(
          targetUserId,
        )
      ) {
        return createResult(
          false,
          'این کاربر قبلاً دنبال شده است.',
        );
      }

      updateCurrentUser({
        followedUserIds: [
          ...currentUser.followedUserIds,
          targetUserId,
        ],
      });

      return createResult(
        true,
        `${targetUser.displayName} با موفقیت دنبال شد.`,
      );
    },
    [
      currentUser,
      getUserById,
      updateCurrentUser,
    ],
  );

  const unfollowUser = useCallback(
    (
      targetUserId: string,
    ): FollowOperationResult => {
      if (!currentUser) {
        return createResult(
          false,
          'برای لغو دنبال‌کردن باید وارد حساب شوید.',
        );
      }

      if (currentUser.id === targetUserId) {
        return createResult(
          false,
          'این عملیات برای حساب خودتان مجاز نیست.',
        );
      }

      const targetUser =
        getUserById(targetUserId);

      if (!targetUser) {
        return createResult(
          false,
          'کاربر موردنظر پیدا نشد.',
        );
      }

      if (
        !currentUser.followedUserIds.includes(
          targetUserId,
        )
      ) {
        return createResult(
          false,
          'این کاربر در فهرست دنبال‌شوندگان شما نیست.',
        );
      }

      updateCurrentUser({
        followedUserIds:
          currentUser.followedUserIds.filter(
            (userId) =>
              userId !== targetUserId,
          ),
      });

      return createResult(
        true,
        `دنبال‌کردن ${targetUser.displayName} لغو شد.`,
      );
    },
    [
      currentUser,
      getUserById,
      updateCurrentUser,
    ],
  );

  const toggleFollow = useCallback(
    (
      targetUserId: string,
    ): FollowOperationResult =>
      isFollowing(targetUserId)
        ? unfollowUser(targetUserId)
        : followUser(targetUserId),
    [
      followUser,
      isFollowing,
      unfollowUser,
    ],
  );

  return {
    currentUser,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
  };
}