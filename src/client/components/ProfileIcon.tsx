import React, { useState } from 'react';

type ProfileIconSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

type ProfileIconProps = {
  /** The avatar URL (from API or cached) */
  url?: string;
  /** Username for alt text */
  username: string;
  /** Size of the profile icon */
  size?: ProfileIconSize;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
};

// Size mappings for profile icons
const sizeMap: Record<ProfileIconSize, string> = {
  xsmall: 'w-6 h-6',       // 24px
  small: 'w-8 h-8',        // 32px - for chat messages
  medium: 'w-10 h-10',     // 40px
  large: 'w-12 h-12',      // 48px - for message panel
  xlarge: 'w-16 h-16',     // 64px
};

/**
 * ProfileIcon component - displays user snoovatars with fallback
 * Uses the same fallback pattern as HomeScreen for consistency
 * 
 * @example
 * ```tsx
 * <ProfileIcon url={avatarUrl} username="user123" size="large" />
 * ```
 */
export const ProfileIcon: React.FC<ProfileIconProps> = ({
  url,
  username,
  size = 'medium',
  className = '',
  onClick,
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Match HomeScreen's exact fallback behavior
    // Only set fallback if not already showing it (prevent infinite loop)
    if (e.currentTarget.src.indexOf('/default-snoo.png') === -1) {
      e.currentTarget.src = '/default-snoo.png';
      e.currentTarget.classList.add('opacity-50');
    }
  };

  const sizeClasses = sizeMap[size];
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`relative flex-shrink-0 ${sizeClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <img
        src={url || '/default-snoo.png'}
        alt={`${username}'s avatar`}
        className={`${sizeClasses} rounded-full object-cover ${cursorClass} border-2 border-gray-200 bg-gray-100`}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};
