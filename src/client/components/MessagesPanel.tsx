import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import type { ChatListItem } from "../../shared/types/chat";

type MessagesPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onChatSelect?: (chatId: string) => void;
  onError?: (message: string, retry?: () => void) => void;
};

export const MessagesPanel: React.FC<MessagesPanelProps> = ({ isOpen, onClose, onChatSelect, onError }) => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats');
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      const data = await response.json();
      // Sort chats by lastMessageAt timestamp (most recent first)
      const sortedChats = data.chats.sort((a: ChatListItem, b: ChatListItem) => 
        b.lastMessageAt - a.lastMessageAt
      );
      setChats(sortedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      onError?.('Failed to load chats', fetchChats);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/chats/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      const data = await response.json();
      // Refresh chat list to include the new chat
      await fetchChats();
      // Navigate to the newly created chat
      onChatSelect?.(data.chatId);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      onError?.('Failed to create chat', handleCreateChat);
    } finally {
      setCreating(false);
    }
  };
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-400"
          onClick={onClose}
        />
      )}

      {/* Messages Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-all duration-400 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Panel Header */}
          <div className="bg-[#d93900] text-white p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Messages</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#c13300] rounded-lg transition-colors"
              aria-label="Close messages"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d93900] focus:border-transparent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d93900]"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 mb-4 opacity-50"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                <p className="text-center">No messages yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      onChatSelect?.(chat.id);
                      onClose();
                    }}
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d93900] to-[#ff6b35] flex items-center justify-center text-2xl">
                          💬
                        </div>
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {chat.title || `Chat ${chat.id.substring(0, 8)}`}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTimestamp(chat.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage ? (
                              <>
                                <span className="font-medium">{chat.lastMessage.username}:</span>{' '}
                                {chat.lastMessage.text}
                              </>
                            ) : (
                              <span className="italic">No messages yet</span>
                            )}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="flex-shrink-0 bg-[#d93900] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Message Button */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleCreateChat}
              disabled={creating}
              className="w-full bg-[#d93900] text-white py-3 rounded-lg hover:bg-[#c13300] transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
