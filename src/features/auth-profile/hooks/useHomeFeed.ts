import { useMemo } from 'react';

import {
  homeReleases,
  homeTracks,
} from '../data/homeFeedData';

import { useAuth } from './useAuth';
import { useFollow } from './useFollow';

import {
  getDailyStreamLimit,
  getPlaylistLimit,
} from '../utils/userPresentation';

// Build the personalized home feed.
export function useHomeFeed() {
  const {
    users,
    currentUser,
  } = useAuth();

  const {
    getFollowerCount,
    getFollowingCount,
  } = useFollow();

  const followedUserIds = useMemo(
    () =>
      new Set(
        currentUser?.followedUserIds ??
          [],
      ),
    [currentUser?.followedUserIds],
  );

  const followedUsers = useMemo(
    () => {
      if (!currentUser) {
        return [];
      }

      return users.filter((user) =>
        followedUserIds.has(user.id),
      );
    },
    [
      currentUser,
      followedUserIds,
      users,
    ],
  );

  const visibleTracks = useMemo(
    () => {
      if (!currentUser) {
        return [];
      }

      const hasEarlyAccess =
        currentUser.subscription.tier ===
        'gold';

      return homeTracks
        .filter(
          (track) =>
            hasEarlyAccess ||
            !track.isEarlyAccess,
        )
        .sort((firstTrack, secondTrack) => {
          const firstIsFollowed =
            firstTrack.artistUserId
              ? followedUserIds.has(
                  firstTrack.artistUserId,
                )
              : false;

          const secondIsFollowed =
            secondTrack.artistUserId
              ? followedUserIds.has(
                  secondTrack.artistUserId,
                )
              : false;

          if (
            firstIsFollowed !==
            secondIsFollowed
          ) {
            return firstIsFollowed
              ? -1
              : 1;
          }

          return (
            secondTrack.playCount -
            firstTrack.playCount
          );
        });
    },
    [
      currentUser,
      followedUserIds,
    ],
  );

  const visibleReleases = useMemo(
    () => {
      if (!currentUser) {
        return [];
      }

      const hasEarlyAccess =
        currentUser.subscription.tier ===
        'gold';

      return homeReleases
        .filter(
          (release) =>
            hasEarlyAccess ||
            !release.isEarlyAccess,
        )
        .sort(
          (
            firstRelease,
            secondRelease,
          ) => {
            const firstIsFollowed =
              firstRelease.artistUserId
                ? followedUserIds.has(
                    firstRelease.artistUserId,
                  )
                : false;

            const secondIsFollowed =
              secondRelease.artistUserId
                ? followedUserIds.has(
                    secondRelease.artistUserId,
                  )
                : false;

            if (
              firstIsFollowed !==
              secondIsFollowed
            ) {
              return firstIsFollowed
                ? -1
                : 1;
            }

            return (
              new Date(
                secondRelease.publishedAt,
              ).getTime() -
              new Date(
                firstRelease.publishedAt,
              ).getTime()
            );
          },
        );
    },
    [
      currentUser,
      followedUserIds,
    ],
  );

  const suggestedUsers = useMemo(
    () => {
      if (!currentUser) {
        return [];
      }

      return users
        .filter(
          (user) =>
            user.id !== currentUser.id &&
            user.role !== 'admin' &&
            user.role !== 'support' &&
            !followedUserIds.has(user.id),
        )
        .sort((firstUser, secondUser) => {
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
    },
    [
      currentUser,
      followedUserIds,
      getFollowerCount,
      users,
    ],
  );

  if (!currentUser) {
    return {
      currentUser: null,
      followedUsers: [],
      suggestedUsers: [],
      visibleTracks: [],
      visibleReleases: [],
      followerCount: 0,
      followingCount: 0,
      dailyStreamLimit: null,
      playlistLimit: null,
      streamUsagePercent: 0,
      hasEarlyAccess: false,
    };
  }

  const dailyStreamLimit =
    getDailyStreamLimit(
      currentUser.subscription.tier,
    );

  const playlistLimit =
    getPlaylistLimit(
      currentUser.subscription.tier,
    );

  const streamUsagePercent =
    dailyStreamLimit === null
      ? 0
      : Math.min(
          100,
          Math.round(
            (currentUser.stats
              .dailyStreams /
              dailyStreamLimit) *
              100,
          ),
        );

  return {
    currentUser,
    followedUsers,
    suggestedUsers,
    visibleTracks,
    visibleReleases,

    followerCount:
      getFollowerCount(
        currentUser.id,
      ),

    followingCount:
      getFollowingCount(
        currentUser.id,
      ),

    dailyStreamLimit,
    playlistLimit,
    streamUsagePercent,

    hasEarlyAccess:
      currentUser.subscription.tier ===
      'gold',
  };
}