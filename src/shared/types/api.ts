export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

// Chat API Response Types
export type CreateChatResponse = {
  chatId: string;
  createdAt: number;
};

export type GetChatsResponse = {
  chats: ChatListItem[];
};

export type GetMessagesResponse = {
  messages: Message[];
  hasMore: boolean;
};

export type SendMessageResponse = {
  message: Message;
};

export type EditMessageResponse = {
  message: Message;
};

export type DeleteMessageResponse = {
  success: boolean;
};

export type ErrorResponse = {
  error: string;
  message: string;
};

// Import types from chat.ts
import type { Message, ChatListItem } from './chat';
