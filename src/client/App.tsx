import { useState, useRef, useEffect } from 'react';
import { connectRealtime } from '@devvit/web/client';
import type { Message } from '../shared/types/chat';
import { CollapsibleSidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { SidePanel } from './components/SidePanel';
import { TopNav } from './components/TopNav';
import { LeftPanel } from './components/LeftPanel';
import { NotificationPanel } from './components/NotificationPanel';
import { MessagesPanel } from './components/MessagesPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { HomeScreen } from './screens/HomeScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { SearchScreen } from './screens/SearchScreen';
import { PlacesScreen } from './screens/PlacesScreen';
import { SavedScreen } from './screens/SavedScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { ProfileIcon } from './components/ProfileIcon';

type Screen = 'chat' | 'home' | 'explore' | 'search' | 'places' | 'saved' | 'history';

export const App = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedNav, setSelectedNav] = useState('home');
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isMessagesPanelOpen, setIsMessagesPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: ToastMessage['type'], action?: ToastMessage['action']) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = { id, message, type };
    if (action) {
      toast.action = action;
    }
    setToasts((prev) => [...prev, toast]);
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    // Fetch username on mount
    const initialize = async () => {
      try {
        const userResponse = await fetch('/api/username');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch username');
        }
        const userData = await userResponse.json();
        setUsername(userData.username);
      } catch (err) {
        showToast('Failed to load user information', 'error', {
          label: 'Retry',
          onClick: () => initialize(),
        });
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    // Fetch messages for current chat
    if (!currentChatId) {
      setMessages([]);
      setHasMore(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chats/${currentChatId}/messages?limit=50`);
        if (!response.ok) {
          if (response.status === 404) {
            showToast('Chat not found', 'error');
            setCurrentChatId(null);
            return;
          }
          if (response.status === 403) {
            showToast('You do not have access to this chat', 'error');
            setCurrentChatId(null);
            return;
          }
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data.messages || []);
        setHasMore(data.hasMore || false);
      } catch (err) {
        showToast('Failed to load messages', 'error', {
          label: 'Retry',
          onClick: () => fetchMessages(),
        });
      }
    };

    fetchMessages();
  }, [currentChatId]);

  useEffect(() => {
    // Connect to realtime channel for live updates
    let connection: Awaited<ReturnType<typeof connectRealtime>> | null = null;

    const setupRealtime = async () => {
      try {
        connection = await connectRealtime({
          channel: 'chat_messages',
          onConnect: () => {
            setIsConnected(true);
          },
          onDisconnect: () => {
            setIsConnected(false);
          },
          onMessage: (data: Message & { chatId?: string }) => {
            // Filter incoming messages by chatId
            if (data.chatId) {
              // Only update UI for messages in current chat
              if (data.chatId === currentChatId) {
                setMessages((prev) => {
                  // Avoid duplicates
                  if (prev.some((msg) => msg.id === data.id)) {
                    return prev;
                  }
                  return [...prev, data];
                });
              }
              
              // Note: Chat list updates would happen in MessagesPanel component
              // when it's open, or through a separate mechanism for background updates
              // For now, the chat list will update when the user opens MessagesPanel
            }
          },
        });
      } catch (err) {
        // Silently fail - connection will retry
      }
    };

    setupRealtime();

    return () => {
      if (connection) {
        connection.disconnect();
      }
    };
  }, [currentChatId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    // Scroll-to-load behavior
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Check if user scrolled near the top (within 100px)
      if (container.scrollTop < 100 && hasMore && !loadingMore) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loadingMore, currentChatId, messages]);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connection restored', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('You are offline', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    if (!currentChatId) {
      showToast('Please select a chat first', 'error');
      return;
    }

    const messageText = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch(`/api/chats/${currentChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Optimistically add message locally (will also come through realtime)
      const newMessage: Message = {
        id: data.message.id,
        userId: data.message.userId,
        username: data.message.username,
        content: messageText,
        timestamp: data.message.timestamp,
        edited: false,
        editedAt: null,
        avatarUrl: data.message.avatarUrl,
      };
      
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    } catch (err) {
      showToast('Failed to send message', 'error', {
        label: 'Retry',
        onClick: () => {
          setInputValue(messageText);
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || !currentChatId) return;

    try {
      const response = await fetch(`/api/chats/${currentChatId}/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          showToast('You can only edit your own messages', 'error');
          return;
        }
        throw new Error('Failed to edit message');
      }

      const data = await response.json();
      
      // Update message in local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? data.message : msg
        )
      );

      // Exit edit mode
      setEditingMessageId(null);
      setEditContent('');
      showToast('Message updated', 'success');
    } catch (err) {
      showToast('Failed to edit message', 'error');
    }
  };

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
    setOpenMenuId(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentChatId) return;

    try {
      const response = await fetch(`/api/chats/${currentChatId}/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 403) {
          showToast('You can only delete your own messages', 'error');
          return;
        }
        throw new Error('Failed to delete message');
      }

      // Remove message from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Close confirmation dialog
      setDeletingMessageId(null);
      showToast('Message deleted', 'success');
    } catch (err) {
      showToast('Failed to delete message', 'error');
    }
  };

  const handleStartDelete = (messageId: string) => {
    setDeletingMessageId(messageId);
    setOpenMenuId(null);
  };

  const handleCancelDelete = () => {
    setDeletingMessageId(null);
  };

  const loadMoreMessages = async () => {
    if (!currentChatId || loadingMore || !hasMore) return;

    // Store current scroll height to maintain position
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    setLoadingMore(true);
    try {
      // Get the oldest message timestamp for pagination
      const oldestTimestamp = messages.length > 0 ? messages[0]?.timestamp : undefined;
      
      const response = await fetch(
        `/api/chats/${currentChatId}/messages?limit=50${oldestTimestamp ? `&before=${oldestTimestamp}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load more messages');
      }
      
      const data = await response.json();
      
      // Prepend older messages to the beginning of the array
      setMessages((prev) => [...(data.messages || []), ...prev]);
      setHasMore(data.hasMore || false);

      // Maintain scroll position after loading
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeight;
        }
      }, 0);
    } catch (err) {
      showToast('Failed to load older messages', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNavigation = (id: string) => {
    setSelectedNav(id);
    
    // Open MessagesPanel when chat button is clicked
    if (id === 'chat') {
      setIsMessagesPanelOpen(true);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    setCurrentScreen('chat');
    setSelectedNav('chat'); // Ensure chat button is highlighted
  };

  const handleScreenNavigation = (screen: string) => {
    setCurrentScreen(screen as Screen);
    // Sync selectedNav with screen navigation
    if (['home', 'search', 'places', 'chat'].includes(screen)) {
      setSelectedNav(screen);
    }
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'home': return 'Home';
      case 'explore': return 'Explore';
      case 'search': return 'Search';
      case 'places': return 'Places';
      case 'saved': return 'Saved';
      case 'history': return 'History';
      default: return 'Reddit Chat';
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'search':
        return <SearchScreen />;
      case 'places':
        return <PlacesScreen />;
      case 'saved':
        return <SavedScreen />;
      case 'history':
        return <HistoryScreen />;
      default:
        return (
          <>
            {/* Messages Container */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-3">
        {!currentChatId ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm md:text-base">Select a chat to start messaging</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm md:text-base">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}
            {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-lg p-2 md:p-3 shadow-sm border border-gray-200 relative group"
            >
              <div className="flex items-start gap-2 mb-1">
                {/* User Avatar */}
                <ProfileIcon 
                  url={msg.avatarUrl}
                  username={msg.username}
                  size="small"
                  className="md:w-10 md:h-10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#d93900] text-xs md:text-sm">{msg.username}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    {msg.edited && (
                      <span className="text-xs text-gray-400 italic">(edited)</span>
                    )}
                    {/* Action menu button - only show for current user's messages */}
                    {msg.username === username && (
                      <div className="ml-auto relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === msg.id ? null : msg.id);
                      }}
                      disabled={!isOnline}
                      className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Message actions"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                        />
                      </svg>
                    </button>
                    {/* Dropdown menu */}
                    {openMenuId === msg.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                      >
                        <button
                          onClick={() => handleStartEdit(msg)}
                          disabled={!isOnline}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleStartDelete(msg.id)}
                          disabled={!isOnline}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                    )}
                  </div>
                  {editingMessageId === msg.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        disabled={!isOnline}
                        className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d93900] focus:border-transparent resize-none disabled:bg-gray-100"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditMessage(msg.id)}
                          disabled={!editContent.trim() || !isOnline}
                          className="px-3 py-1 text-sm bg-[#d93900] text-white rounded hover:bg-[#c13300] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 text-sm md:text-base break-words">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
            <div ref={messagesEndRef} />
          </>
        )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-2 md:p-4">
        <div className="flex gap-1 md:gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={!isOnline ? "Offline - cannot send messages" : currentChatId ? "Type a message..." : "Select a chat first..."}
            disabled={loading || !currentChatId || !isOnline}
            className="flex-1 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d93900] focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={() => {
              // Placeholder for future functionality (e.g., attachments, emojis, etc.)
            }}
            disabled={!currentChatId || !isOnline}
            className="bg-gray-100 text-gray-700 px-3 py-2 md:px-4 md:py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center disabled:bg-gray-100 disabled:cursor-not-allowed"
            title="More options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 md:w-5 md:h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading || !currentChatId || !isOnline}
            className="bg-[#d93900] text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:bg-[#c13300] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[50px] md:min-w-[60px]"
          >
            {loading ? (
              '...'
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 md:w-5 md:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <CollapsibleSidebar onNavigate={handleNavigation} />
      <div className="flex flex-col flex-1 h-screen pb-16 md:pb-0">
        {/* Top Navigation */}
        <TopNav
          title={getScreenTitle()}
          onBack={() => setIsLeftPanelOpen(true)}
          onNotificationOpen={() => setIsNotificationPanelOpen(true)}
        />

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 inline-block mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            No internet connection
          </div>
        )}

        {/* Screen Content */}
        {renderScreen()}
      </div>
      <MobileNav selected={selectedNav} onNavigate={handleNavigation} />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={closeToast} />
      <LeftPanel
        isOpen={isLeftPanelOpen && !isMessagesPanelOpen && !isSettingsPanelOpen}
        onClose={() => setIsLeftPanelOpen(false)}
        onNavigate={handleScreenNavigation}
        onMessagesClick={() => {
          setIsLeftPanelOpen(false);
          // Delay opening messages panel to allow left panel to close first
          setTimeout(() => {
            setIsMessagesPanelOpen(true);
          }, 300);
        }}
        onSettingsClick={() => {
          setIsLeftPanelOpen(false);
          // Delay opening settings panel to allow left panel to close first
          setTimeout(() => {
            setIsSettingsPanelOpen(true);
          }, 300);
        }}
      />
      <MessagesPanel
        isOpen={isMessagesPanelOpen}
        onClose={() => {
          setIsMessagesPanelOpen(false);
          // Delay opening left panel to allow messages panel to close first
          setTimeout(() => {
            setIsLeftPanelOpen(true);
          }, 300);
        }}
        onChatSelect={handleChatSelect}
        onError={(message, retry) => {
          showToast(message, 'error', retry ? { label: 'Retry', onClick: retry } : undefined);
        }}
      />
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => {
          setIsSettingsPanelOpen(false);
          // Delay opening left panel to allow settings panel to close first
          setTimeout(() => {
            setIsLeftPanelOpen(true);
          }, 300);
        }}
      />
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        username={username}
        isConnected={isConnected}
      />

      {/* Delete Confirmation Dialog */}
      {deletingMessageId && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleCancelDelete}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Message</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(deletingMessageId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
