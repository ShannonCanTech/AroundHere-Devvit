import React, { useState, useEffect } from 'react';

type InteractiveSnooProps = {
  /** Avatar URL */
  avatarUrl?: string;
  /** Username */
  username: string;
  /** Initial X position (0-100, percentage) */
  initialX?: number;
  /** Initial Y position (0-100, percentage) */
  initialY?: number;
  /** Movement speed in pixels */
  speed?: number;
  /** Avatar width in pixels */
  width?: number;
  /** Avatar height in pixels */
  height?: number;
};

const defaultSnoovatarUrl = 'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png';

/**
 * Interactive Snoovatar component that can be moved with arrow keys
 * Inspired by snooclub app but for Devvit Web
 * 
 * @example
 * ```tsx
 * <InteractiveSnoo 
 *   avatarUrl={avatarUrl} 
 *   username="user123"
 *   initialX={50}
 *   initialY={50}
 * />
 * ```
 */
export const InteractiveSnoo: React.FC<InteractiveSnooProps> = ({
  avatarUrl,
  username,
  initialX = 50,
  initialY = 50,
  speed = 20,
  width = 80,
  height = 100,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [facing, setFacing] = useState<'left' | 'right'>('right');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (e.key) {
          case 'ArrowLeft':
            newX = Math.max(0, prev.x - speed);
            setFacing('left');
            break;
          case 'ArrowRight':
            newX = Math.min(100, prev.x + speed);
            setFacing('right');
            break;
          case 'ArrowUp':
            newY = Math.max(0, prev.y - speed);
            break;
          case 'ArrowDown':
            newY = Math.min(100, prev.y + speed);
            break;
          default:
            return prev;
        }

        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speed]);

  const displayUrl = avatarUrl || defaultSnoovatarUrl;

  return (
    <div className="relative w-full h-full">
      {/* Snoo character */}
      <div
        className="absolute transition-all duration-200 ease-out"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) ${facing === 'left' ? 'scaleX(-1)' : ''}`,
        }}
      >
        {/* Avatar image */}
        <img
          src={displayUrl}
          alt={`${username}'s snoovatar`}
          style={{ width: `${width}px`, height: `${height}px` }}
          className="object-contain"
        />
        
        {/* Username label */}
        <div className="mt-1 text-center">
          <span className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">
            u/{username}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
        Use arrow keys to move
      </div>
    </div>
  );
};
