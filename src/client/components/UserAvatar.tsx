import React, { useEffect, useState } from 'react';
import { Avatar } from './Avatar';
import type { UserAvatarResponse } from '../../shared/types/api';

type AvatarSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge';
type AvatarFacing = 'left' | 'right';

type UserAvatarProps = {
  /** Username to fetch avatar for */
  username: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Direction the avatar faces */
  facing?: AvatarFacing;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
};

/**
 * UserAvatar component that automatically fetches and displays user snoovatars
 * Fetches from the server API and caches the result
 * 
 * @example
 * ```tsx
 * <UserAvatar username="spez" size="large" />
 * ```
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  size = 'medium',
  facing = 'left',
  className = '',
  onClick,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        // For current user, use the dedicated endpoint
        const endpoint = username === 'current' 
          ? '/api/user/avatar'
          : `/api/user/avatar?username=${encodeURIComponent(username)}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Failed to fetch avatar');
        }
        
        const data: UserAvatarResponse = await response.json();
        setAvatarUrl(data.avatarUrl);
      } catch (error) {
        // Avatar component will show fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();
  }, [username]);

  if (isLoading) {
    return (
      <div className={`rounded-full bg-gray-200 animate-pulse ${className}`}>
        <Avatar size={size} username={username} />
      </div>
    );
  }

  return (
    <Avatar
      url={avatarUrl}
      username={username}
      size={size}
      facing={facing}
      className={className}
      onClick={onClick}
    />
  );
};
