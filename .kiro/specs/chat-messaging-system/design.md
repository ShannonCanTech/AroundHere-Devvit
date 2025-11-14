# Design Document

## Overview

The chat messaging system transforms the existing single-room chat application into a multi-conversation messaging platform. Users can create multiple chat instances, manage conversations, and interact with other Reddit users through direct messaging. The system leverages Redis for persistent storage, Express API endpoints for backend operations, and React components for the user interface.

The design maintains the existing realtime messaging infrastructure while extending it to support multiple chat rooms, message management (edit/delete), and data retention policies.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ MessagesPanel│  │ Navigation   │  │ Chat Screen  │      │
│  │ (Chat List)  │  │ Components   │  │ (Messages)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                  │              │
│           └────────────────┴──────────────────┘              │
│                            │                                 │
│                    Fetch API Calls                           │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Server Layer (Express)                    │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │           API Endpoints (/api/chats/*)             │     │
│  │  - Create chat    - Send message                   │     │
│  │  - Get chats      - Edit message                   │     │
│  │  - Get messages   - Delete message                 │     │
│  └─────────────────────────┬──────────────────────────┘     │
│                            │                                 │
│  ┌─────────────────────────┴──────────────────────────┐     │
│  │         Business Logic Layer                       │     │
│  │  - Chat management    - Message operations         │     │
│  │  - Access control     - Data retention             │     │
│  └─────────────────────────┬──────────────────────────┘     │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Storage Layer (Redis)                     │
│                            │                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat         │  │ Messages     │  │ User Chat    │      │
│  │ Metadata     │  │ Storage      │  │ Index        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User opens Messages Panel**: Client fetches user's chat list from `/api/chats`
2. **User selects a chat**: Client fetches messages from `/api/chats/:chatId/messages`
3. **User sends message**: Client posts to `/api/chats/:chatId/messages`, server stores in Redis and broadcasts via realtime
4. **User edits message**: Client puts to `/api/chats/:chatId/messages/:messageId`
5. **User deletes message**: Client deletes via `/api/chats/:chatId/messages/:messageId`

## Components and Interfaces

### Client Components

#### 1. MessagesPanel Component (Updated)

**Purpose**: Display list of user's active chat conversations

**State Management**:
```typescript
type Chat = {
  id: string;
  title?: string;
  participants: string[];
  lastMessage?: {
    text: string;
    username: string;
    timestamp: number;
  };
  unreadCount: number;
  createdAt: number;
  lastMessageAt: number;
};

const [chats, setChats] = useState<Chat[]>([]);
const [loading, setLoading] = useState(true);
```

**Key Changes**:
- Remove `mockChatSessions` placeholder data
- Fetch real chat data from `/api/chats` on mount
- Display empty state when no chats exist
- Sort chats by `lastMessageAt` timestamp
- Show unread indicators based on actual message tracking

#### 2. App Component (Updated)

**Purpose**: Main application container managing chat state and navigation

**State Management**:
```typescript
const [currentChatId, setCurrentChatId] = useState<string | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
```

**Key Changes**:
- Track current active chat ID instead of single global chat
- Fetch messages for specific chat when chat is selected
- Update realtime connection to filter by chat ID
- Modify message sending to include chat ID context

#### 3. ChatScreen Component (New)

**Purpose**: Display messages for a specific chat with edit/delete capabilities

**Props**:
```typescript
type ChatScreenProps = {
  chatId: string;
  onBack: () => void;
};
```

**Features**:
- Message list with pagination (load 50 at a time)
- Message actions menu (edit/delete) for user's own messages
- Edit mode with inline text editing
- Delete confirmation dialog
- "Edited" indicator on modified messages

#### 4. MobileNav Component (Updated)

**Purpose**: Bottom navigation bar with chat access

**Key Changes**:
- Chat icon navigates to chat list (opens MessagesPanel)
- Add active state indicator when on chat screen
- Maintain existing navigation for other screens

### Server Components

#### 1. Chat Management Module (`src/server/core/chat.ts`)

**Purpose**: Business logic for chat operations

**Functions**:
```typescript
// Create new chat instance
async function createChat(userId: string): Promise<Chat>

// Get all chats for a user
async function getUserChats(userId: string): Promise<Chat[]>

// Get chat by ID with access validation
async function getChat(chatId: string, userId: string): Promise<Chat | null>

// Delete chat and all messages
async function deleteChat(chatId: string, userId: string): Promise<boolean>

// Add participant to chat (future)
async function addParticipant(chatId: string, userId: string, newUserId: string): Promise<boolean>
```

#### 2. Message Management Module (`src/server/core/message.ts`)

**Purpose**: Business logic for message operations

**Functions**:
```typescript
// Send new message
async function sendMessage(
  chatId: string,
  userId: string,
  username: string,
  content: string
): Promise<Message>

// Get messages with pagination
async function getMessages(
  chatId: string,
  userId: string,
  limit: number = 50,
  before?: number
): Promise<Message[]>

// Edit message
async function editMessage(
  chatId: string,
  messageId: string,
  userId: string,
  newContent: string
): Promise<Message | null>

// Delete message
async function deleteMessage(
  chatId: string,
  messageId: string,
  userId: string
): Promise<boolean>
```

#### 3. Data Retention Module (`src/server/core/retention.ts`)

**Purpose**: Implement data retention policies

**Functions**:
```typescript
// Clean old messages (called during message retrieval)
async function cleanOldMessages(chatId: string): Promise<number>

// Clean inactive chats (called during chat list retrieval)
async function cleanInactiveChats(userId: string): Promise<number>

// Check if message should be deleted based on age
function shouldDeleteMessage(timestamp: number): boolean

// Check if chat should be deleted based on inactivity
function shouldDeleteChat(lastMessageAt: number): boolean
```

### API Endpoints

#### Chat Endpoints

**POST /api/chats/create**
- Creates new chat instance
- Request: `{}`
- Response: `{ chatId: string, createdAt: number }`

**GET /api/chats**
- Retrieves user's chat list
- Response: `{ chats: Chat[] }`

**GET /api/chats/:chatId**
- Retrieves specific chat metadata
- Response: `{ chat: Chat }`

**DELETE /api/chats/:chatId**
- Deletes chat and all messages
- Response: `{ success: boolean }`

#### Message Endpoints

**POST /api/chats/:chatId/messages**
- Sends new message
- Request: `{ content: string }`
- Response: `{ message: Message }`

**GET /api/chats/:chatId/messages**
- Retrieves messages with pagination
- Query params: `limit` (default 50), `before` (timestamp)
- Response: `{ messages: Message[], hasMore: boolean }`

**PUT /api/chats/:chatId/messages/:messageId**
- Edits existing message
- Request: `{ content: string }`
- Response: `{ message: Message }`

**DELETE /api/chats/:chatId/messages/:messageId**
- Deletes message
- Response: `{ success: boolean }`

## Data Models

### Redis Schema

#### Chat Metadata
```
Key: chat:{chatId}
Type: Hash
Fields:
  - id: string
  - createdAt: number (timestamp)
  - createdBy: string (userId)
  - participants: string (JSON array of userIds)
  - lastMessageAt: number (timestamp)
  - title: string (optional, for future group chats)

Example:
chat:abc123 -> {
  id: "abc123",
  createdAt: 1699900000000,
  createdBy: "user_reddit123",
  participants: '["user_reddit123"]',
  lastMessageAt: 1699900500000,
  title: ""
}
```

#### Messages
```
Key: chat:{chatId}:messages
Type: Sorted Set
Score: timestamp
Member: JSON string of message object

Message Object:
{
  id: string,
  userId: string,
  username: string,
  content: string,
  timestamp: number,
  edited: boolean,
  editedAt: number | null
}

Example:
chat:abc123:messages -> [
  (1699900100000, '{"id":"msg1","userId":"user_reddit123","username":"john","content":"Hello","timestamp":1699900100000,"edited":false,"editedAt":null}'),
  (1699900200000, '{"id":"msg2","userId":"user_reddit456","username":"jane","content":"Hi","timestamp":1699900200000,"edited":false,"editedAt":null}')
]
```

#### User Chat Index
```
Key: user:{userId}:chats
Type: Set
Members: chatId strings

Example:
user:user_reddit123:chats -> {"abc123", "def456", "ghi789"}
```

### TypeScript Types

#### Shared Types (`src/shared/types/chat.ts`)

```typescript
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
```

#### API Response Types (`src/shared/types/api.ts`)

```typescript
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
```

## Error Handling

### Client-Side Error Handling

**Network Errors**:
- Display toast notification for failed API calls
- Retry mechanism for transient failures
- Fallback to cached data when available

**Validation Errors**:
- Prevent empty message submission
- Show inline error for invalid message content
- Disable actions during loading states

**Access Errors**:
- Redirect to chat list if chat not found
- Show error message for unauthorized access
- Handle expired sessions gracefully

### Server-Side Error Handling

**Authentication Errors**:
```typescript
if (!userId) {
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'User authentication required'
  });
}
```

**Authorization Errors**:
```typescript
if (!isParticipant(chatId, userId)) {
  return res.status(403).json({
    error: 'Forbidden',
    message: 'User is not a participant in this chat'
  });
}
```

**Not Found Errors**:
```typescript
if (!chat) {
  return res.status(404).json({
    error: 'Not Found',
    message: 'Chat not found'
  });
}
```

**Validation Errors**:
```typescript
if (!content || content.trim().length === 0) {
  return res.status(400).json({
    error: 'Bad Request',
    message: 'Message content cannot be empty'
  });
}
```

**Redis Errors**:
```typescript
try {
  await redis.hSet(key, data);
} catch (error) {
  console.error('Redis error:', error);
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'Failed to store data'
  });
}
```

## Data Retention Strategy

### Retention Policies

**Message Retention**: 90 days
- Messages older than 90 days are automatically deleted
- Deletion occurs lazily during message retrieval operations
- Reduces storage costs and maintains user privacy

**Chat Retention**: 180 days of inactivity
- Chats with no messages sent in 180 days are deleted
- Deletion occurs during chat list retrieval
- Preserves active conversations while cleaning up abandoned chats

**Metadata Retention**: 180 days
- Chat metadata persists for 180 days even after message deletion
- Allows for audit trails and user history
- Deleted after chat becomes inactive

### Implementation Approach

**Lazy Deletion**:
- Cleanup runs during normal operations (not scheduled jobs)
- Reduces complexity (no cron jobs in serverless environment)
- Distributes cleanup load across user requests

**Cleanup Functions**:

```typescript
// Called during GET /api/chats/:chatId/messages
async function cleanOldMessages(chatId: string): Promise<number> {
  const cutoffTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days
  const deleted = await redis.zRemRangeByScore(
    `chat:${chatId}:messages`,
    0,
    cutoffTime
  );
  return deleted;
}

// Called during GET /api/chats
async function cleanInactiveChats(userId: string): Promise<number> {
  const chatIds = await redis.sMembers(`user:${userId}:chats`);
  const cutoffTime = Date.now() - (180 * 24 * 60 * 60 * 1000); // 180 days
  let deletedCount = 0;
  
  for (const chatId of chatIds) {
    const chat = await redis.hGetAll(`chat:${chatId}`);
    if (chat.lastMessageAt && parseInt(chat.lastMessageAt) < cutoffTime) {
      await deleteChat(chatId, userId);
      deletedCount++;
    }
  }
  
  return deletedCount;
}
```

### Storage Optimization

**Message Pagination**:
- Load only 50 messages initially
- Fetch older messages on demand
- Reduces initial load time and bandwidth

**Efficient Queries**:
- Use Redis sorted sets for time-based queries
- Index chats by user for fast lookup
- Minimize data transfer with selective field retrieval

## Testing Strategy

### Unit Tests

**Server-Side Tests** (`src/server/core/*.test.ts`):
- Chat creation and retrieval
- Message CRUD operations
- Access control validation
- Data retention logic
- Error handling scenarios

**Test Framework**: Vitest

**Example Test Cases**:
```typescript
describe('Chat Management', () => {
  test('creates new chat for user', async () => {
    const chat = await createChat('user123');
    expect(chat.id).toBeDefined();
    expect(chat.createdBy).toBe('user123');
  });
  
  test('prevents unauthorized access to chat', async () => {
    const chat = await createChat('user123');
    const result = await getChat(chat.id, 'user456');
    expect(result).toBeNull();
  });
});

describe('Message Management', () => {
  test('sends message to chat', async () => {
    const chat = await createChat('user123');
    const message = await sendMessage(chat.id, 'user123', 'john', 'Hello');
    expect(message.content).toBe('Hello');
  });
  
  test('edits own message', async () => {
    const chat = await createChat('user123');
    const message = await sendMessage(chat.id, 'user123', 'john', 'Hello');
    const edited = await editMessage(chat.id, message.id, 'user123', 'Hi');
    expect(edited?.content).toBe('Hi');
    expect(edited?.edited).toBe(true);
  });
  
  test('prevents editing other user messages', async () => {
    const chat = await createChat('user123');
    const message = await sendMessage(chat.id, 'user123', 'john', 'Hello');
    const edited = await editMessage(chat.id, message.id, 'user456', 'Hi');
    expect(edited).toBeNull();
  });
});
```

### Integration Tests

**API Endpoint Tests** (`src/server/api/*.test.ts`):
- Full request/response cycle testing
- Authentication and authorization flows
- Error response validation
- Pagination behavior

**Example Test Cases**:
```typescript
describe('POST /api/chats/create', () => {
  test('creates chat and returns chatId', async () => {
    const response = await request(app)
      .post('/api/chats/create')
      .expect(200);
    
    expect(response.body.chatId).toBeDefined();
  });
});

describe('GET /api/chats/:chatId/messages', () => {
  test('returns paginated messages', async () => {
    const response = await request(app)
      .get('/api/chats/test123/messages?limit=10')
      .expect(200);
    
    expect(response.body.messages).toHaveLength(10);
    expect(response.body.hasMore).toBe(true);
  });
});
```

### Manual Testing

**Devvit Playtest Environment**:
- Test with `npm run dev` and playtest URL
- Verify realtime message broadcasting
- Test multi-user scenarios with multiple browser sessions
- Validate mobile responsive behavior
- Test data persistence across page reloads

**Test Scenarios**:
1. Create new chat and send messages
2. Edit and delete messages
3. Navigate between multiple chats
4. Test pagination by sending 100+ messages
5. Verify data retention after 90+ days (mock timestamp)
6. Test error states (network failures, invalid data)
7. Verify mobile navigation and panel behavior

## Migration Strategy

### Phase 1: Backend Infrastructure
1. Create new Redis schema alongside existing data
2. Implement chat and message management modules
3. Add new API endpoints
4. Keep existing `/api/send-message` and `/api/messages` functional

### Phase 2: Frontend Updates
1. Update shared types
2. Modify MessagesPanel to fetch real data
3. Update App component for multi-chat support
4. Remove placeholder data
5. Update MobileNav chat button behavior

### Phase 3: Realtime Integration
1. Update realtime channel to support chat-specific broadcasts
2. Modify message sending to include chat context
3. Update client realtime listeners to filter by chat

### Phase 4: Data Cleanup
1. Remove old single-chat implementation
2. Migrate existing messages to new schema (if needed)
3. Remove deprecated API endpoints

## Future Enhancements

### Multi-User Chats
- Add participant management (invite, remove)
- Group chat naming and avatars
- Participant list display
- Typing indicators

### Chat Invitations
- Invite system with accept/decline
- Pending invites panel
- Notification for new invites

### Advanced Features
- Message reactions (emoji)
- Message threading/replies
- File attachments
- Read receipts
- Search within chat
- Message pinning
- Chat archiving

### Performance Optimizations
- Message caching on client
- Optimistic UI updates
- Virtual scrolling for large message lists
- Background sync for offline support
