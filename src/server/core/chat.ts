/**
 * Chat Management Business Logic
 * Handles chat operations including creation, retrieval, and deletion
 */

import { Chat, ChatListItem } from '../../shared/types/chat';
import { createChat as createChatInRedis, getChat, deleteChat as deleteChatMetadata, isParticipant } from './redis/chat';
import { addChatToUser, getUserChatIds, removeChatFromUser } from './redis/userChatIndex';
import { getLastMessage, deleteAllMessages } from './redis/message';
import { cleanInactiveChats } from './retention';
import { getAvatarUrl } from './avatar';

/**
 * Generate a unique chat ID
 */
function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create a new chat instance
 * @param userId - User ID of the chat creator
 * @returns Created chat object
 */
export async function createNewChat(userId: string): Promise<Chat> {
  // Generate unique chat ID
  const chatId = generateChatId();

  // Store chat metadata in Redis with creator as initial participant
  const chat = await createChatInRedis(chatId, userId);

  // Add chat ID to user's chat index
  await addChatToUser(userId, chatId);

  // Return created chat object
  return chat;
}

/**
 * Retrieve user's chat list with metadata and last messages
 * @param userId - User ID to retrieve chats for
 * @returns Array of chat list items sorted by last message timestamp
 */
export async function getUserChats(userId: string): Promise<ChatListItem[]> {
  // Run inactive chat cleanup (lazy deletion)
  await cleanInactiveChats(userId);

  // Fetch all chat IDs from user's chat index
  const chatIds = await getUserChatIds(userId);

  // Retrieve metadata for each chat
  const chatListItems: ChatListItem[] = [];

  for (const chatId of chatIds) {
    const chat = await getChat(chatId);

    // Skip if chat doesn't exist (already deleted)
    if (!chat) {
      continue;
    }

    // Fetch last message for each chat
    const lastMessage = await getLastMessage(chatId);

    // Build chat list item with avatar URL
    let avatarUrl: string | undefined;
    if (lastMessage) {
      try {
        avatarUrl = await getAvatarUrl(lastMessage.username);
      } catch (error) {
        // If avatar fetch fails, use chat-session-specific fallback
        const { getChatSessionFallbackAvatar } = await import('./chatAvatarFallback');
        avatarUrl = await getChatSessionFallbackAvatar(lastMessage.userId, chatId);
      }
    }

    const chatListItem: ChatListItem = {
      ...chat,
      lastMessage: lastMessage
        ? {
            text: lastMessage.content,
            username: lastMessage.username,
            timestamp: lastMessage.timestamp,
            avatarUrl,
          }
        : undefined,
      unreadCount: 0, // Placeholder for now
    };

    chatListItems.push(chatListItem);
  }

  // Sort by lastMessageAt timestamp (most recent first)
  chatListItems.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

  return chatListItems;
}

/**
 * Retrieve single chat with access validation
 * @param chatId - Chat ID to retrieve
 * @param userId - User ID requesting the chat
 * @returns Chat metadata or null if unauthorized/not found
 */
export async function getChatWithValidation(chatId: string, userId: string): Promise<Chat | null> {
  // Verify user is a participant in the chat
  const isUserParticipant = await isParticipant(chatId, userId);

  if (!isUserParticipant) {
    return null;
  }

  // Return chat metadata
  return await getChat(chatId);
}

/**
 * Delete a chat and all associated data
 * @param chatId - Chat ID to delete
 * @param userId - User ID requesting the deletion
 * @returns true if deleted successfully, false if unauthorized
 */
export async function deleteChatWithValidation(chatId: string, userId: string): Promise<boolean> {
  // Get chat to verify permissions
  const chat = await getChat(chatId);

  if (!chat) {
    return false;
  }

  // Verify user is the creator or has permission
  if (chat.createdBy !== userId) {
    return false;
  }

  // Delete all messages from Redis
  await deleteAllMessages(chatId);

  // Delete chat metadata
  await deleteChatMetadata(chatId);

  // Remove from all participants' chat indexes
  for (const participantId of chat.participants) {
    await removeChatFromUser(participantId, chatId);
  }

  return true;
}
