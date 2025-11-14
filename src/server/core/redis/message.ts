import { redis } from '@devvit/web/server';
import { Message } from '../../../shared/types/chat';

/**
 * Store a message in Redis sorted set
 */
export async function storeMessage(chatId: string, message: Message): Promise<void> {
  const key = `chat:${chatId}:messages`;
  await redis.zAdd(key, {
    member: JSON.stringify(message),
    score: message.timestamp,
  });
}

/**
 * Get messages with pagination
 * @param chatId - Chat ID
 * @param limit - Number of messages to retrieve (default 50)
 * @param before - Timestamp to fetch messages before (for pagination)
 * @returns Array of messages and hasMore flag
 */
export async function getMessages(
  chatId: string,
  limit: number = 50,
  before?: number
): Promise<{ messages: Message[]; hasMore: boolean }> {
  const key = `chat:${chatId}:messages`;
  const maxScore = before ?? Date.now();

  // Fetch limit + 1 to check if there are more messages
  const results = await redis.zRange(key, 0, maxScore, { 
    by: 'score',
    reverse: true,
    count: limit + 1
  });

  const messages: Message[] = results.slice(0, limit).map((item) => JSON.parse(item.member));
  const hasMore = results.length > limit;

  return { messages, hasMore };
}

/**
 * Get a single message by ID
 */
export async function getMessage(chatId: string, messageId: string): Promise<Message | null> {
  const key = `chat:${chatId}:messages`;
  const results = await redis.zRange(key, 0, -1, { by: 'rank' });

  for (const item of results) {
    const message: Message = JSON.parse(item.member);
    if (message.id === messageId) {
      return message;
    }
  }

  return null;
}

/**
 * Edit a message
 */
export async function editMessage(
  chatId: string,
  messageId: string,
  newContent: string
): Promise<Message | null> {
  const message = await getMessage(chatId, messageId);
  if (!message) {
    return null;
  }

  // Remove old message
  await deleteMessage(chatId, messageId);

  // Create updated message
  const updatedMessage: Message = {
    ...message,
    content: newContent,
    edited: true,
    editedAt: Date.now(),
  };

  // Store updated message
  await storeMessage(chatId, updatedMessage);

  return updatedMessage;
}

/**
 * Delete a message
 */
export async function deleteMessage(chatId: string, messageId: string): Promise<boolean> {
  const key = `chat:${chatId}:messages`;
  const results = await redis.zRange(key, 0, -1, { by: 'rank' });

  for (const item of results) {
    const message: Message = JSON.parse(item.member);
    if (message.id === messageId) {
      await redis.zRem(key, [item.member]);
      return true;
    }
  }

  return false;
}

/**
 * Get the last message in a chat
 */
export async function getLastMessage(chatId: string): Promise<Message | null> {
  const key = `chat:${chatId}:messages`;
  // Get the most recent message using rank-based range (last item in sorted set)
  const results = await redis.zRange(key, -1, -1, { by: 'rank' });

  if (results.length === 0) {
    return null;
  }

  return JSON.parse(results[0].member);
}

/**
 * Delete all messages in a chat
 */
export async function deleteAllMessages(chatId: string): Promise<void> {
  const key = `chat:${chatId}:messages`;
  await redis.del(key);
}

/**
 * Delete messages older than a given timestamp
 */
export async function deleteOldMessages(chatId: string, beforeTimestamp: number): Promise<number> {
  const key = `chat:${chatId}:messages`;
  const deleted = await redis.zRemRangeByScore(key, 0, beforeTimestamp);
  return deleted;
}
