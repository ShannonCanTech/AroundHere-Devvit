/**
 * useSnoovatar Hook
 * 
 * React hook for managing snoovatar state, accessories, and animations
 */

import { useState, useEffect, useCallback } from 'react';
import type { SnoovatarConfig, Accessory, SnoovatarPose, SnoovatarColorScheme } from './types';
import { DEFAULT_COLOR_SCHEMES } from './types';
import { getAccessoryById } from './accessories';

type UseSnoovatarOptions = {
  username: string;
  initialAccessories?: string[]; // Accessory IDs
  fetchRedditAvatar?: boolean;
};

type UseSnoovatarReturn = {
  config: SnoovatarConfig;
  equipAccessory: (accessoryId: string) => void;
  unequipAccessory: (accessoryId: string) => void;
  setColorScheme: (scheme: SnoovatarColorScheme) => void;
  setPose: (pose: SnoovatarPose) => void;
  toggleFacing: () => void;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook for managing snoovatar state
 */
export function useSnoovatar(options: UseSnoovatarOptions): UseSnoovatarReturn {
  const { username, initialAccessories = [], fetchRedditAvatar = true } = options;
  
  const [redditAvatarUrl, setRedditAvatarUrl] = useState<string | undefined>();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [colorScheme, setColorScheme] = useState<SnoovatarColorScheme>(
    getUserColorScheme(username)
  );
  const [pose, setPose] = useState<SnoovatarPose>('idle');
  const [facing, setFacing] = useState<'left' | 'right'>('left');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load initial accessories
  useEffect(() => {
    const loadedAccessories = initialAccessories
      .map(id => getAccessoryById(id))
      .filter((acc): acc is Accessory => acc !== undefined);
    
    setAccessories(loadedAccessories);
  }, [initialAccessories]);
  
  // Fetch Reddit avatar if enabled
  useEffect(() => {
    if (!fetchRedditAvatar) return;
    
    const fetchAvatar = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call your API endpoint to get avatar
        const response = await fetch(`/api/avatar/${username}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch avatar');
        }
        
        const data = await response.json();
        setRedditAvatarUrl(data.avatarUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvatar();
  }, [username, fetchRedditAvatar]);
  
  // Equip an accessory
  const equipAccessory = useCallback((accessoryId: string) => {
    const accessory = getAccessoryById(accessoryId);
    if (!accessory) {
      return;
    }
    
    // Remove any existing accessory of the same type
    setAccessories(prev => {
      const filtered = prev.filter(acc => acc.type !== accessory.type);
      return [...filtered, accessory];
    });
  }, []);
  
  // Unequip an accessory
  const unequipAccessory = useCallback((accessoryId: string) => {
    setAccessories(prev => prev.filter(acc => acc.id !== accessoryId));
  }, []);
  
  // Toggle facing direction
  const toggleFacing = useCallback(() => {
    setFacing(prev => prev === 'left' ? 'right' : 'left');
  }, []);
  
  const config: SnoovatarConfig = {
    redditAvatarUrl,
    username,
    colorScheme,
    accessories,
    pose,
    facing,
    animated: true,
  };
  
  return {
    config,
    equipAccessory,
    unequipAccessory,
    setColorScheme,
    setPose,
    toggleFacing,
    isLoading,
    error,
  };
}

/**
 * Generate a consistent color scheme from username
 */
export function getUserColorScheme(username: string): SnoovatarColorScheme {
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const schemes = Object.values(DEFAULT_COLOR_SCHEMES);
  const schemeIndex = hash % schemes.length;
  
  return schemes[schemeIndex];
}

/**
 * Generate a random color scheme
 */
export function getRandomColorScheme(): SnoovatarColorScheme {
  const schemes = Object.values(DEFAULT_COLOR_SCHEMES);
  const randomIndex = Math.floor(Math.random() * schemes.length);
  return schemes[randomIndex];
}
