import React, { useState } from 'react';

type AvatarSize = 'xxsmall' | 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge';
type AvatarFacing = 'left' | 'right';
type AvatarBackground = 'light' | 'dark';

// Base props matching Devvit Blocks BaseProps
type BaseProps = {
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  grow?: boolean;
  key?: string;
  id?: string;
};

type AvatarProps = BaseProps & {
  /** The avatar URL (from getSnoovatarUrl or cached) */
  url?: string;
  /** Username for alt text and fallback */
  username?: string;
  /** Reddit thing ID (e.g., t2_userid) - for future compatibility */
  thingId?: string;
  /** Size of the avatar - matches Devvit Blocks sizes */
  size?: AvatarSize;
  /** Direction the avatar faces */
  facing?: AvatarFacing;
  /** Background theme - affects border/shadow styling */
  background?: AvatarBackground;
  /** Additional CSS classes */
  className?: string;
  /** Click handler (matches Blocks onPress) */
  onClick?: () => void;
  /** Alias for onClick to match Blocks API */
  onPress?: () => void;
};

// Size mappings to match Devvit Blocks avatar sizes
const sizeMap: Record<AvatarSize, string> = {
  xxsmall: 'w-4 h-4',      // 16px
  xsmall: 'w-6 h-6',       // 24px
  small: 'w-8 h-8',        // 32px
  medium: 'w-10 h-10',     // 40px
  large: 'w-12 h-12',      // 48px
  xlarge: 'w-16 h-16',     // 64px
  xxlarge: 'w-20 h-20',    // 80px
  xxxlarge: 'w-24 h-24',   // 96px
};

/**
 * Avatar component that displays user snoovatars
 * Mimics the Devvit Blocks <avatar> component for Devvit Web
 * 
 * Note: Devvit Web's getSnoovatarUrl() returns static image URLs, not full 3D snoovatars.
 * The full snoovatar rendering (with accessories, clothes, etc.) is only available in Blocks.
 * 
 * @example
 * ```tsx
 * <Avatar url={avatarUrl} username="user123" size="large" background="dark" />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  url,
  username = 'User',
  thingId,
  size = 'medium',
  facing = 'left',
  className = '',
  onClick,
  onPress,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  grow,
  id,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Use onPress if provided, otherwise onClick (Blocks compatibility)
  const handleClick = onPress || onClick;

  const sizeClasses = sizeMap[size];
  const facingClass = facing === 'right' ? 'scale-x-[-1]' : '';
  const cursorClass = handleClick ? 'cursor-pointer' : '';
  
  // If no URL provided, show loading state
  const showLoading = !url || isLoading;

  // Build style object from BaseProps
  const style: React.CSSProperties = {
    width: width,
    height: height,
    minWidth: minWidth,
    minHeight: minHeight,
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    flexGrow: grow ? 1 : undefined,
  };

  return (
    <div
      id={id}
      className={`relative flex-shrink-0 ${sizeClasses} ${className}`}
      onClick={handleClick}
      role={handleClick ? 'button' : undefined}
      tabIndex={handleClick ? 0 : undefined}
      style={style}
      data-thing-id={thingId}
    >
      {showLoading && (
        <div className={`absolute inset-0 rounded-full bg-gray-200 animate-pulse ${sizeClasses}`} />
      )}
      {url && !hasError && (
        <img
          src={url}
          alt={`${username}'s avatar`}
          className={`${sizeClasses} rounded-full object-cover ${facingClass} ${cursorClass}`}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
    </div>
  );
};
