/**
 * Message Management Business Logic
 * Handles message operations including sending, retrieving, editing, and deleting
 */

import { Message } from '../../shared/types/chat';
import { isParticipant } from './redis/chat';
import {
  storeMessage,
  getMessages as getMessagesFromRedis,
  getMessage as getMessageFromRedis,
  editMessage as editMessageInRedis,
  deleteMessage as deleteMessageFromRedis,
} from './redis/message';
import { updateChatLastMessage } from './redis/chat';
import { cleanOldMessages } from './retention';
import { getAvatarUrl, getAvatarUrls } from './avatar';

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Send a new message to a chat
 * @param chatId - Chat ID to send message to
 * @param userId - User ID of the sender
 * @param username - Username of the sender
 * @param content - Message content
 * @returns Created message object
 * @throws Error if user is not a participant
 */
export async function sendMessage(
  chatId: string,
  userId: string,
  username: string,
  content: string
): Promise<Message> {
  // Validate user is participant in chat
  const isUserParticipant = await isParticipant(chatId, userId);
  if (!isUserParticipant) {
    throw new Error('User is not a participant in this chat');
  }

  // Generate unique message ID
  const messageId = generateMessageId();

  // Create message object with timestamp and avatar
  const timestamp = Date.now();
  let avatarUrl: string | undefined;
  try {
    avatarUrl = await getAvatarUrl(username);
    console.log(`[Message] Avatar URL for ${username}: ${avatarUrl?.substring(0, 50)}...`);
  } catch (error) {
    // If avatar fetch fails, use chat-session-specific fallback
    console.error(`[Message] Avatar fetch failed for ${username}, using fallback:`, error);
    const { getChatSessionFallbackAvatar } = await import('./chatAvatarFallback');
    avatarUrl = await getChatSessionFallbackAvatar(userId, chatId);
    console.log(`[Message] Fallback avatar URL: ${avatarUrl?.substring(0, 50)}...`);
  }
  
  const message: Message = {
    id: messageId,
    userId,
    username,
    content,
    timestamp,
    edited: false,
    editedAt: null,
    avatarUrl,
  };
  
  console.log(`[Message] Created message ${messageId} with avatarUrl: ${avatarUrl ? 'present' : 'MISSING'}`);

  // Store in Redis sorted set
  await storeMessage(chatId, message);

  // Update chat's lastMessageAt timestamp
  await updateChatLastMessage(chatId, timestamp);

  // Return message object
  return message;
}

/**
 * Retrieve messages with pagination
 * @param chatId - Chat ID to retrieve messages from
 * @param userId - User ID requesting the messages
 * @param limit - Number of messages to retrieve (default 50)
 * @param before - Timestamp to fetch messages before (for pagination)
 * @returns Object containing messages array and hasMore flag
 * @throws Error if user is not a participant
 */
export async function getMessages(
  chatId: string,
  userId: string,
  limit: number = 50,
  before?: number
): Promise<{ messages: Message[]; hasMore: boolean }> {
  // Validate user is participant in chat
  const isUserParticipant = await isParticipant(chatId, userId);
  if (!isUserParticipant) {
    throw new Error('User is not a participant in this chat');
  }

  // Run message cleanup for old messages (lazy deletion)
  await cleanOldMessages(chatId);

  // Fetch messages from Redis sorted set with limit and before timestamp
  const result = await getMessagesFromRedis(chatId, limit, before);

  // Enrich messages with avatar URLs
  const usernames = result.messages.map(msg => msg.username);
  const userIds = result.messages.map(msg => msg.userId);
  
  let avatarUrls: Record<string, string> = {};
  try {
    avatarUrls = await getAvatarUrls(usernames);
  } catch (error) {
    // If batch avatar fetch fails, continue without avatars
    console.error('Failed to fetch avatar URLs:', error);
  }
  
  // Import chat session fallback
  const { getChatSessionFallbackAvatar } = await import('./chatAvatarFallback');
  
  // Enrich with avatars, using chat-session fallback if needed
  const enrichedMessages = await Promise.all(
    result.messages.map(async (msg) => {
      let avatarUrl = avatarUrls[msg.username];
      
      // If no avatar URL, use chat-session-specific fallback
      if (!avatarUrl) {
        avatarUrl = await getChatSessionFallbackAvatar(msg.userId, chatId);
      }
      
      return {
        ...msg,
        avatarUrl,
      };
    })
  );

  // Return messages array and hasMore flag
  return {
    messages: enrichedMessages,
    hasMore: result.hasMore,
  };
}

/**
 * Edit an existing message
 * @param chatId - Chat ID containing the message
 * @param messageId - Message ID to edit
 * @param userId - User ID requesting the edit
 * @param newContent - New message content
 * @returns Updated message object or null if unauthorized/not found
 */
export async function editMessage(
  chatId: string,
  messageId: string,
  userId: string,
  newContent: string
): Promise<Message | null> {
  // Validate user is participant in chat
  const isUserParticipant = await isParticipant(chatId, userId);
  if (!isUserParticipant) {
    return null;
  }

  // Get the message to verify authorship
  const message = await getMessageFromRedis(chatId, messageId);
  if (!message) {
    return null;
  }

  // Validate user is the message author
  if (message.userId !== userId) {
    return null;
  }

  // Update message content in Redis with edited flag and editedAt timestamp
  const updatedMessage = await editMessageInRedis(chatId, messageId, newContent);

  // Return updated message object
  return updatedMessage;
}

/**
 * Delete a message
 * @param chatId - Chat ID containing the message
 * @param messageId - Message ID to delete
 * @param userId - User ID requesting the deletion
 * @returns true if deleted successfully, false if unauthorized/not found
 */
export async function deleteMessage(
  chatId: string,
  messageId: string,
  userId: string
): Promise<boolean> {
  // Validate user is participant in chat
  const isUserParticipant = await isParticipant(chatId, userId);
  if (!isUserParticipant) {
    return false;
  }

  // Get the message to verify authorship
  const message = await getMessageFromRedis(chatId, messageId);
  if (!message) {
    return false;
  }

  // Validate user is the message author
  if (message.userId !== userId) {
    return false;
  }

  // Remove message from Redis sorted set
  const deleted = await deleteMessageFromRedis(chatId, messageId);

  // Return success boolean
  return deleted;
}
