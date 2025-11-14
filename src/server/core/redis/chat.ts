import { redis } from '@devvit/web/server';
import { Chat } from '../../../shared/types/chat';

/**
 * Create a new chat in Redis
 */
export async function createChat(chatId: string, userId: string): Promise<Chat> {
  const now = Date.now();
  const chat: Chat = {
    id: chatId,
    createdAt: now,
    createdBy: userId,
    participants: [userId],
    lastMessageAt: now,
  };

  await redis.hSet(`chat:${chatId}`, {
    id: chatId,
    createdAt: now.toString(),
    createdBy: userId,
    participants: JSON.stringify([userId]),
    lastMessageAt: now.toString(),
    title: '',
  });

  return chat;
}

/**
 * Get chat metadata by ID
 */
export async function getChat(chatId: string): Promise<Chat | null> {
  const data = await redis.hGetAll(`chat:${chatId}`);

  if (!data.id) {
    return null;
  }

  return {
    id: data.id,
    createdAt: parseInt(data.createdAt),
    createdBy: data.createdBy,
    participants: JSON.parse(data.participants),
    lastMessageAt: parseInt(data.lastMessageAt),
    title: data.title || undefined,
  };
}

/**
 * Update chat's last message timestamp
 */
export async function updateChatLastMessage(chatId: string, timestamp: number): Promise<void> {
  await redis.hSet(`chat:${chatId}`, {
    lastMessageAt: timestamp.toString(),
  });
}

/**
 * Delete chat metadata
 */
export async function deleteChat(chatId: string): Promise<void> {
  await redis.del(`chat:${chatId}`);
}

/**
 * Add participant to chat
 */
export async function addParticipant(chatId: string, userId: string): Promise<boolean> {
  const chat = await getChat(chatId);
  if (!chat) {
    return false;
  }

  if (chat.participants.includes(userId)) {
    return true; // Already a participant
  }

  const updatedParticipants = [...chat.participants, userId];
  await redis.hSet(`chat:${chatId}`, {
    participants: JSON.stringify(updatedParticipants),
  });

  return true;
}

/**
 * Remove participant from chat
 */
export async function removeParticipant(chatId: string, userId: string): Promise<boolean> {
  const chat = await getChat(chatId);
  if (!chat) {
    return false;
  }

  const updatedParticipants = chat.participants.filter((id) => id !== userId);
  await redis.hSet(`chat:${chatId}`, {
    participants: JSON.stringify(updatedParticipants),
  });

  return true;
}

/**
 * Check if user is a participant in chat
 */
export async function isParticipant(chatId: string, userId: string): Promise<boolean> {
  const chat = await getChat(chatId);
  if (!chat) {
    return false;
  }

  return chat.participants.includes(userId);
}
