import { redis } from '@devvit/web/server';

/**
 * Get a consistent fallback avatar for a user within a specific chat session
 * This ensures users have the same avatar throughout a chat session even if
 * their actual avatar fails to load
 * 
 * @param userId - User ID (t2_xxx format)
 * @param chatId - Chat session ID
 * @returns Reddit default avatar URL (0-7)
 */
export async function getChatSessionFallbackAvatar(
  userId: string,
  chatId: string
): Promise<string> {
  const cacheKey = `chat:${chatId}:user:${userId}:fallback_avatar`;
  
  // Check if this user already has a fallback avatar assigned for this chat
  const cached = await redis.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Generate a consistent avatar number based on userId
  // This ensures the same user gets the same avatar across different chats
  // but it's randomized per user
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const avatarNumber = hash % 8; // 0-7
  const avatarUrl = `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
  
  // Cache this assignment for the duration of the chat (no expiration)
  await redis.set(cacheKey, avatarUrl);
  
  return avatarUrl;
}

/**
 * Get fallback avatar for multiple users in a chat session
 */
export async function getChatSessionFallbackAvatars(
  userIds: string[],
  chatId: string
): Promise<Record<string, string>> {
  const avatarPromises = userIds.map(async (userId) => {
    const avatarUrl = await getChatSessionFallbackAvatar(userId, chatId);
    return [userId, avatarUrl] as const;
  });
  
  const avatarEntries = await Promise.all(avatarPromises);
  return Object.fromEntries(avatarEntries);
}
