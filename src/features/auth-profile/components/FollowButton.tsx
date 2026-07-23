import {
  useEffect,
  useState,
} from 'react';

import Button from '../../../components/Button';

import { useFollow } from '../hooks/useFollow';

interface FollowButtonProps {
  userId: string;
  fullWidth?: boolean;
  compact?: boolean;
  showFeedback?: boolean;
}

// Reusable follow button.
export default function FollowButton({
  userId,
  fullWidth = false,
  compact = false,
  showFeedback = true,
}: FollowButtonProps) {
  const {
    currentUser,
    isFollowing,
    toggleFollow,
  } = useFollow();

  const [
    feedbackMessage,
    setFeedbackMessage,
  ] = useState('');

  const following =
    isFollowing(userId);

  useEffect(() => {
    setFeedbackMessage('');
  }, [userId]);

  if (
    !currentUser ||
    currentUser.id === userId
  ) {
    return null;
  }

  const handleFollow = () => {
    const result =
      toggleFollow(userId);

    if (showFeedback) {
      setFeedbackMessage(
        result.message,
      );
    }
  };

  return (
    <div
      className={`follow-button-wrapper ${
        fullWidth
          ? 'follow-button-wrapper-full'
          : ''
      }`}
    >
      <Button
        type="button"
        variant={
          following
            ? 'secondary'
            : 'primary'
        }
        size={
          compact
            ? 'small'
            : 'medium'
        }
        fullWidth={fullWidth}
        aria-pressed={following}
        onClick={handleFollow}
      >
        {following
          ? 'دنبال می‌کنید'
          : 'دنبال کردن'}
      </Button>

      {showFeedback &&
      feedbackMessage ? (
        <span
          className="follow-feedback-message"
          role="status"
        >
          {feedbackMessage}
        </span>
      ) : null}
    </div>
  );
}