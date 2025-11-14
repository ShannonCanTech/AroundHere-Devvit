import { redis } from '@devvit/web/server';

/**
 * Add a chat ID to user's chat index using sorted set
 * Score is timestamp for sorting by most recent
 */
export async function addChatToUser(userId: string, chatId: string): Promise<void> {
  const key = `user:${userId}:chats`;
  const timestamp = Date.now();
  await redis.zAdd(key, { member: chatId, score: timestamp });
}

/**
 * Remove a chat ID from user's chat index
 */
export async function removeChatFromUser(userId: string, chatId: string): Promise<void> {
  const key = `user:${userId}:chats`;
  await redis.zRem(key, [chatId]);
}

/**
 * Get all chat IDs for a user (sorted by most recent)
 */
export async function getUserChatIds(userId: string): Promise<string[]> {
  const key = `user:${userId}:chats`;
  // Get all members in reverse order (most recent first)
  const result = await redis.zRange(key, 0, -1, { reverse: true });
  return result.map(item => item.member);
}

/**
 * Check if user has a specific chat
 */
export async function userHasChat(userId: string, chatId: string): Promise<boolean> {
  const key = `user:${userId}:chats`;
  const score = await redis.zScore(key, chatId);
  return score !== undefined;
}

/**
 * Get count of chats for a user
 */
export async function getUserChatCount(userId: string): Promise<number> {
  const key = `user:${userId}:chats`;
  return await redis.zCard(key);
}
