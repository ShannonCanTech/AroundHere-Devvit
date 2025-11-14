import express from 'express';
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
  CreateChatResponse,
  GetChatsResponse,
  SendMessageResponse,
  GetMessagesResponse,
  EditMessageResponse,
  DeleteMessageResponse,
  ErrorResponse,
} from '../shared/types/api';
import {
  redis,
  reddit,
  createServer,
  context,
  getServerPort,
  realtime,
} from '@devvit/web/server';
import { createPost } from './core/post';
import {
  createNewChat,
  getUserChats,
  getChatWithValidation,
  deleteChatWithValidation,
} from './core/chat';
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
} from './core/message';
import {
  checkConsent,
  recordConsent,
  getCurrentTermsVersion,
} from './core/consent';
import type { Chat } from '../shared/types/chat';
import type {
  CheckConsentResponse,
  AcceptConsentRequest,
  AcceptConsentResponse,
} from '../shared/types/consent';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.get('/api/username', async (_req, res): Promise<void> => {
  try {
    const username = await reddit.getCurrentUsername();
    res.json({ username: username ?? 'Anonymous' });
  } catch (error) {
    console.error('Error fetching username:', error);
    res.status(500).json({ username: 'Anonymous' });
  }
});

// Consent API Endpoints

/**
 * GET /api/consent/check
 * Checks if authenticated user has accepted terms
 */
router.get<unknown, CheckConsentResponse | ErrorResponse>('/api/consent/check', async (_req, res): Promise<void> => {
  try {
    // Get authenticated user ID from Devvit context
    const { userId } = context;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
      return;
    }

    // Check if user has accepted terms
    const consent = await checkConsent(redis, userId);

    // Return hasConsent boolean and optional consent object
    res.json({
      hasConsent: consent !== null,
      consent: consent || undefined,
    });
  } catch (error) {
    console.error('Error checking consent:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to check consent',
    });
  }
});

/**
 * POST /api/consent/accept
 * Records user's acceptance of terms
 */
router.post<unknown, AcceptConsentResponse | ErrorResponse, AcceptConsentRequest>(
  '/api/consent/accept',
  async (req, res): Promise<void> => {
    try {
      // Get authenticated user ID from Devvit context
      const { userId } = context;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      // Extract termsVersion from request body (optional)
      const { termsVersion } = req.body || {};

      // Validate termsVersion if provided
      if (termsVersion && typeof termsVersion !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid terms version',
        });
        return;
      }

      // Record consent (uses current version if not provided)
      const consent = await recordConsent(redis, userId, termsVersion);

      // Return success status and consent object
      res.json({
        success: true,
        consent,
      });
    } catch (error) {
      console.error('Error recording consent:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to record consent',
      });
    }
  }
);

// Chat API Endpoints

/**
 * POST /api/chats/create
 * Creates a new chat instance
 */
router.post<unknown, CreateChatResponse | ErrorResponse>('/api/chats/create', async (_req, res): Promise<void> => {
  try {
    // Get authenticated user ID from Devvit context
    const { userId } = context;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
      return;
    }

    // Call chat creation function
    const chat = await createNewChat(userId);

    // Return chat ID and creation timestamp
    res.json({
      chatId: chat.id,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create chat',
    });
  }
});

/**
 * GET /api/chats
 * Retrieves user's chat list
 */
router.get<unknown, GetChatsResponse | ErrorResponse>('/api/chats', async (_req, res): Promise<void> => {
  try {
    // Get authenticated user ID from Devvit context
    const { userId } = context;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
      return;
    }

    // Call function to retrieve user's chat list
    const chats = await getUserChats(userId);

    // Return array of chat list items
    res.json({
      chats,
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch chats',
    });
  }
});

/**
 * GET /api/chats/:chatId
 * Retrieves specific chat metadata with access validation
 */
router.get<{ chatId: string }, Chat | ErrorResponse>('/api/chats/:chatId', async (req, res): Promise<void> => {
  try {
    // Get authenticated user ID from Devvit context
    const { userId } = context;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
      return;
    }

    // Get chat ID from request params
    const { chatId } = req.params;

    // Call function to retrieve chat with access validation
    const chat = await getChatWithValidation(chatId, userId);

    if (!chat) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Chat not found or access denied',
      });
      return;
    }

    // Return chat metadata
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch chat',
    });
  }
});

/**
 * DELETE /api/chats/:chatId
 * Deletes a chat and all associated messages
 */
router.delete<{ chatId: string }, { success: boolean } | ErrorResponse>('/api/chats/:chatId', async (req, res): Promise<void> => {
  try {
    // Get authenticated user ID from Devvit context
    const { userId } = context;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required',
      });
      return;
    }

    // Get chat ID from request params
    const { chatId } = req.params;

    // Call function to delete chat
    const success = await deleteChatWithValidation(chatId, userId);

    if (!success) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Not authorized to delete this chat',
      });
      return;
    }

    // Return success status
    res.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete chat',
    });
  }
});

// Message API Endpoints

/**
 * POST /api/chats/:chatId/messages
 * Sends a new message to a chat
 */
router.post<{ chatId: string }, SendMessageResponse | ErrorResponse, { content: string }>(
  '/api/chats/:chatId/messages',
  async (req, res): Promise<void> => {
    try {
      // Get authenticated user ID and username from Devvit context
      const { userId } = context;
      const username = await reddit.getCurrentUsername();

      if (!userId || !username) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      // Get chat ID from request params
      const { chatId } = req.params;

      // Extract message content from request body
      const { content } = req.body;

      // Validate content is not empty
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Message content cannot be empty',
        });
        return;
      }

      // Call function to send message
      const message = await sendMessage(chatId, userId, username, content);

      // Broadcast message via Devvit realtime with chat context
      // Include chatId in the payload for client-side filtering
      // Channel name must only contain letters, numbers, and underscores
      await realtime.send('chat_messages', {
        ...message,
        chatId,
      });

      // Return message object
      res.json({
        message,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle specific error cases
      if (error instanceof Error && error.message === 'User is not a participant in this chat') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'User is not a participant in this chat',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send message',
      });
    }
  }
);

/**
 * GET /api/chats/:chatId/messages
 * Retrieves messages from a chat with pagination
 */
router.get<{ chatId: string }, GetMessagesResponse | ErrorResponse>(
  '/api/chats/:chatId/messages',
  async (req, res): Promise<void> => {
    try {
      // Get authenticated user ID from Devvit context
      const { userId } = context;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      // Get chat ID from request params
      const { chatId } = req.params;

      // Extract pagination parameters from query string
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const before = req.query.before ? parseInt(req.query.before as string, 10) : undefined;

      // Call function to retrieve messages with pagination
      const result = await getMessages(chatId, userId, limit, before);

      // Return messages array and hasMore flag
      res.json({
        messages: result.messages,
        hasMore: result.hasMore,
      });
    } catch (error) {
      console.error('Error fetching messages:', error);

      // Handle specific error cases
      if (error instanceof Error && error.message === 'User is not a participant in this chat') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'User is not a participant in this chat',
        });
        return;
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch messages',
      });
    }
  }
);

/**
 * PUT /api/chats/:chatId/messages/:messageId
 * Edits an existing message
 */
router.put<{ chatId: string; messageId: string }, EditMessageResponse | ErrorResponse, { content: string }>(
  '/api/chats/:chatId/messages/:messageId',
  async (req, res): Promise<void> => {
    try {
      // Get authenticated user ID from Devvit context
      const { userId } = context;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      // Get chat ID and message ID from request params
      const { chatId, messageId } = req.params;

      // Extract new content from request body
      const { content } = req.body;

      // Validate content is not empty
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Message content cannot be empty',
        });
        return;
      }

      // Call function to edit message
      const updatedMessage = await editMessage(chatId, messageId, userId, content);

      // Return updated message object or error
      if (!updatedMessage) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Not authorized to edit this message',
        });
        return;
      }

      res.json({
        message: updatedMessage,
      });
    } catch (error) {
      console.error('Error editing message:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to edit message',
      });
    }
  }
);

/**
 * DELETE /api/chats/:chatId/messages/:messageId
 * Deletes a message
 */
router.delete<{ chatId: string; messageId: string }, DeleteMessageResponse | ErrorResponse>(
  '/api/chats/:chatId/messages/:messageId',
  async (req, res): Promise<void> => {
    try {
      // Get authenticated user ID from Devvit context
      const { userId } = context;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
        return;
      }

      // Get chat ID and message ID from request params
      const { chatId, messageId } = req.params;

      // Call function to delete message
      const success = await deleteMessage(chatId, messageId, userId);

      // Return success status or handle authorization errors
      if (!success) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Not authorized to delete this message',
        });
        return;
      }

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete message',
      });
    }
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
