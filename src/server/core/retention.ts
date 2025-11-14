/**
 * Data Retention Module
 * Implements retention policies for messages and chats
 */

import { deleteOldMessages, deleteAllMessages } from './redis/message';
import { getChat, deleteChat as deleteChatMetadata } from './redis/chat';
import { getUserChatIds, removeChatFromUser } from './redis/userChatIndex';

// Retention periods in milliseconds
const MESSAGE_RETENTION_DAYS = 90;
const CHAT_INACTIVITY_DAYS = 180;

const MESSAGE_RETENTION_MS = MESSAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const CHAT_INACTIVITY_MS = CHAT_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

/**
 * Check if a message should be deleted based on 90-day retention policy
 * @param timestamp - Message timestamp in milliseconds
 * @returns true if message should be deleted, false otherwise
 */
export function shouldDeleteMessage(timestamp: number): boolean {
  const now = Date.now();
  const age = now - timestamp;
  return age > MESSAGE_RETENTION_MS;
}

/**
 * Check if a chat should be deleted based on 180-day inactivity policy
 * @param lastMessageAt - Timestamp of last message in milliseconds
 * @returns true if chat should be deleted, false otherwise
 */
export function shouldDeleteChat(lastMessageAt: number): boolean {
  const now = Date.now();
  const inactivityPeriod = now - lastMessageAt;
  return inactivityPeriod > CHAT_INACTIVITY_MS;
}

/**
 * Clean old messages from a chat based on retention policy
 * This function is called during message retrieval (lazy deletion)
 * @param chatId - Chat ID to clean messages from
 * @returns Number of messages deleted
 */
export async function cleanOldMessages(chatId: string): Promise<number> {
  const cutoffTime = Date.now() - MESSAGE_RETENTION_MS;
  const deleted = await deleteOldMessages(chatId, cutoffTime);
  return deleted;
}

/**
 * Clean inactive chats for a user based on retention policy
 * This function is called during chat list retrieval (lazy deletion)
 * Deletes chat metadata, all messages, and removes from user's chat index
 * @param userId - User ID to clean chats for
 * @returns Number of chats deleted
 */
export async function cleanInactiveChats(userId: string): Promise<number> {
  const chatIds = await getUserChatIds(userId);
  let deletedCount = 0;

  for (const chatId of chatIds) {
    const chat = await getChat(chatId);

    // Skip if chat doesn't exist (already deleted)
    if (!chat) {
      await removeChatFromUser(userId, chatId);
      continue;
    }

    // Check if chat should be deleted based on inactivity
    if (shouldDeleteChat(chat.lastMessageAt)) {
      // Delete all messages in the chat
      await deleteAllMessages(chatId);

      // Delete chat metadata
      await deleteChatMetadata(chatId);

      // Remove from all participants' chat indexes
      for (const participantId of chat.participants) {
        await removeChatFromUser(participantId, chatId);
      }

      deletedCount++;
    }
  }

  return deletedCount;
}
