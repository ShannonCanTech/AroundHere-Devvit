import { reddit, redis } from '@devvit/web/server';

/**
 * Get Reddit default avatar URL based on username hash
 */
function getRedditDefaultAvatar(username: string): string {
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const avatarNumber = hash % 8; // 0-7 for 8 different default avatars
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
}

/**
 * Get avatar URL for a username with proper fallback chain
 * 
 * Fallback strategy:
 * 1. iconImage (from Redis cache if available from events)
 * 2. Custom snoovatar via user.getSnoovatarUrl() (i.redd.it/snoovatar/avatars/)
 * 3. Reddit default (www.redditstatic.com/avatars/defaults/)
 */
export async function getAvatarUrl(username: string): Promise<string> {
  const avatarCacheKey = `avatar:${username}`;
  const iconCacheKey = `icon:${username}`;
  
  // 1. Check if we have iconImage from events (highest priority)
  const iconImage = await redis.get(iconCacheKey);
  if (iconImage) {
    console.log(`[Avatar] Using cached iconImage for ${username}`);
    return iconImage;
  }
  
  // 2. Check avatar cache
  const cached = await redis.get(avatarCacheKey);
  if (cached) {
    console.log(`[Avatar] Using cached avatar for ${username}: ${cached.substring(0, 50)}...`);
    return cached;
  }
  
  try {
    // 3. Try to get custom snoovatar from Reddit API
    console.log(`[Avatar] Fetching user data for ${username}`);
    const user = await reddit.getUserByUsername(username);
    
    if (!user) {
      // User not found - use Reddit default
      console.log(`[Avatar] User ${username} not found, using default`);
      const defaultUrl = getRedditDefaultAvatar(username);
      await redis.set(avatarCacheKey, defaultUrl);
      await redis.expire(avatarCacheKey, 3600); // 1 hour
      return defaultUrl;
    }
    
    const snoovatarUrl = await user.getSnoovatarUrl();
    
    if (snoovatarUrl) {
      // Custom snoovatar found (i.redd.it/snoovatar/avatars/)
      console.log(`[Avatar] Custom snoovatar found for ${username}: ${snoovatarUrl.substring(0, 50)}...`);
      await redis.set(avatarCacheKey, snoovatarUrl);
      await redis.expire(avatarCacheKey, 3600); // 1 hour
      return snoovatarUrl;
    }
    
    // 4. No custom snoovatar - use Reddit default
    console.log(`[Avatar] No custom snoovatar for ${username}, using default`);
    const defaultUrl = getRedditDefaultAvatar(username);
    await redis.set(avatarCacheKey, defaultUrl);
    await redis.expire(avatarCacheKey, 3600); // 1 hour
    return defaultUrl;
    
  } catch (error) {
    // Error fallback - use Reddit default
    console.error(`[Avatar] Failed to fetch avatar for ${username}:`, error);
    const defaultUrl = getRedditDefaultAvatar(username);
    await redis.set(avatarCacheKey, defaultUrl);
    await redis.expire(avatarCacheKey, 3600); // 1 hour
    return defaultUrl;
  }
}

/**
 * Get avatar URLs for multiple usernames
 */
export async function getAvatarUrls(usernames: string[]): Promise<Record<string, string>> {
  const uniqueUsernames = [...new Set(usernames)];
  const avatarPromises = uniqueUsernames.map(async (username) => {
    const avatarUrl = await getAvatarUrl(username);
    return [username, avatarUrl] as const;
  });
  
  const avatarEntries = await Promise.all(avatarPromises);
  return Object.fromEntries(avatarEntries);
}
