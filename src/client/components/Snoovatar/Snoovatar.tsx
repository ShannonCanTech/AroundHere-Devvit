/**
 * Snoovatar Component
 * 
 * Smart avatar component that:
 * 1. Uses Reddit's actual snoovatar image if available
 * 2. Falls back to custom 2D sprite with accessories for game features
 * 3. Supports animations and customization
 */

import React, { useState } from 'react';
import { SnoovatarSprite } from './SnoovatarSprite';
import type { SnoovatarProps, SnoovatarSize } from './types';
import { DEFAULT_COLOR_SCHEMES } from './types';

const SIZE_MAP: Record<SnoovatarSize, number> = {
  tiny: 32,
  small: 48,
  medium: 64,
  large: 96,
  xlarge: 128,
};

/**
 * Main Snoovatar component
 * 
 * Intelligently chooses between Reddit's actual avatar or custom sprite
 */
export const Snoovatar: React.FC<SnoovatarProps> = ({
  redditAvatarUrl,
  username,
  colorScheme,
  accessories = [],
  pose = 'idle',
  facing = 'left',
  size = 'medium',
  animated = false,
  className = '',
  onClick,
  loading = false,
  alt,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const pixelSize = SIZE_MAP[size];
  
  // Use provided color scheme or default
  const effectiveColorScheme = colorScheme || DEFAULT_COLOR_SCHEMES.reddit;
  
  // Determine if we should use Reddit's image or custom sprite
  const useRedditImage = redditAvatarUrl && !imageError && accessories.length === 0;
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const containerClasses = `
    relative inline-block
    ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
    ${className}
  `.trim();
  
  return (
    <div
      className={containerClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />
        </div>
      )}
      
      {!loading && useRedditImage && (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />
            </div>
          )}
          <img
            src={redditAvatarUrl}
            alt={alt || `${username}'s avatar`}
            className={`
              w-full h-full rounded-full object-cover
              border-2 border-orange-500 shadow-lg
              ${facing === 'right' ? 'scale-x-[-1]' : ''}
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              transition-opacity duration-200
            `}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </>
      )}
      
      {!loading && (!useRedditImage || imageError) && (
        <div className="w-full h-full">
          <SnoovatarSprite
            colorScheme={colorScheme}
            pose={pose}
            facing={facing}
            accessories={accessories}
            size={pixelSize}
            animated={animated}
            className="drop-shadow-lg"
          />
        </div>
      )}
      
      {/* Accessory overlay for Reddit images */}
      {!loading && useRedditImage && imageLoaded && accessories.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          <SnoovatarSprite
            colorScheme={colorScheme}
            pose={pose}
            facing={facing}
            accessories={accessories}
            size={pixelSize}
            animated={animated}
            className="opacity-90"
          />
        </div>
      )}
    </div>
  );
};
