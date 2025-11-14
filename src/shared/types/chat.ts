export type Message = {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  edited: boolean;
  editedAt: number | null;
};

export type Chat = {
  id: string;
  createdAt: number;
  createdBy: string;
  participants: string[];
  lastMessageAt: number;
  title?: string;
};

export type ChatListItem = Chat & {
  lastMessage?: {
    text: string;
    username: string;
    timestamp: number;
  };
  unreadCount: number;
};
