# Happening App - Real-Time Multi-Chat Messaging on Reddit

> **Transform Reddit posts into live chat rooms.** Happening App is a sophisticated real-time messaging platform built on Reddit's Devvit platform that enables users to create unlimited chat conversations, send and receive messages instantly with zero latency, edit and delete their messages with full control, and maintain persistent chat history across sessions - all without leaving Reddit.

## What This Application Is

Happening App is a **real-time chat messaging application** built on Reddit's Devvit platform. It provides a modern social messaging experience with multiple navigation screens (Home, Explore, Search, Places, Saved, History) and a dedicated chat system where communities can have instant conversations with live message updates, full editing capabilities, organized multi-chat management, and comprehensive error handling with toast notifications.

The app features a **guided onboarding experience** that welcomes new users with an engaging introduction screen and requires acceptance of Privacy Policy and Terms & Conditions before accessing the chat interface. Returning users bypass onboarding and go directly to the home screen.

This is **not a game** - it's a communication and social platform that brings modern instant messaging features to Reddit, allowing users to have real-time conversations within posts without leaving the Reddit ecosystem.

## What This Application Does

Happening App provides a complete social and messaging experience directly within Reddit posts. Unlike traditional Reddit comments that require page refreshes, this app delivers a modern multi-screen interface with true real-time chat capabilities, instant message delivery, live updates, and persistent conversation history.

**Core Capabilities:**

- **Guided Onboarding Flow** - New users see a welcome screen introducing the app's features, followed by a terms acceptance screen with Privacy Policy and Terms & Conditions. Consent is tracked server-side in Redis, so returning users skip directly to the home screen.
- **Multi-Screen Navigation** - Navigate between Home, Explore, Search, Places, Saved, and History screens through desktop sidebar or mobile bottom navigation
- **Multi-Chat Architecture** - Create and manage unlimited independent chat conversations, each with its own message history and participant list
- **Instant Real-Time Messaging** - Messages appear immediately for all participants using Devvit's realtime broadcasting (no page refresh needed)
- **Full Message Control** - Edit your messages with visible "(edited)" indicators, or delete them permanently with confirmation dialogs
- **Message Pagination** - Load older messages on-demand with "Load More" button or automatic scroll-to-load behavior
- **Zero-Friction Authentication** - Your Reddit username is automatically used - no login, passwords, or OAuth flows required
- **Persistent Storage** - All messages and chat metadata are stored in Redis with chat-specific isolation, surviving server restarts
- **Smart UI Adaptation** - Desktop users get a collapsible sidebar (64px/256px), mobile users get a bottom navigation bar
- **Multi-Panel Navigation** - Coordinated slide-out panels for browsing chats, viewing notifications, and accessing settings
- **Chat Session Browser** - MessagesPanel displays all your chats with preview messages, timestamps, and unread counts
- **Live Connection Status** - Visual indicators show your realtime connection state (green = connected, gray = disconnected)
- **Toast Notifications** - Non-intrusive error and success messages with retry actions for failed operations
- **Offline Detection** - Automatic detection of network connectivity with visual warnings and disabled actions when offline
- **Reddit-Native Design** - Familiar Reddit orange (#d93900) branding with modern, responsive UI patterns

## What Makes This Application Innovative

Happening App demonstrates advanced capabilities of the Devvit platform and modern real-time web architecture, creating a comprehensive social messaging platform within Reddit:

1. **Seamless Onboarding with Multiple Entry Points** - Leverages Devvit 0.12.2's new inline webview capabilities with multiple HTML entry points (welcome, terms, home). New users see an engaging welcome screen in inline mode (fits within the post unit), then a terms acceptance screen, before entering the full app interface in expanded mode. User consent is tracked server-side in Redis with timestamp and version tracking, enabling automatic bypass for returning users. This creates a polished first-run experience while maintaining compliance with privacy requirements.

2. **Multi-Chat Architecture with Isolated Channels** - Each chat conversation is completely independent with its own message history, participant list, and realtime broadcast channel. The MessagesPanel provides a unified interface to browse all active chats with live preview messages, relative timestamps ("5m ago", "Yesterday"), and unread count badges. Users can create unlimited chats and switch between them instantly.

3. **Full Message Lifecycle Management** - Users have complete control over their messages with edit and delete capabilities. Edited messages display an "(edited)" indicator with timestamp tracking, while deletion requires confirmation through a modal dialog. Authorization checks ensure users can only modify their own messages, maintaining security and accountability.

4. **Intelligent Message Pagination** - Implements efficient message loading with two complementary approaches:
   - **Load More Button** - Appears at the top of the message list when older messages are available, fetching 50 messages at a time
   - **Scroll-to-Load** - Automatically loads more messages when users scroll within 100px of the top
   - **Scroll Position Preservation** - Maintains scroll position after loading older messages to prevent jarring jumps
   - **Lazy Loading** - Only fetches messages when needed, reducing initial load time and memory usage

5. **Chat-Specific Realtime Broadcasting** - Leverages Devvit's `connectRealtime` API with intelligent message filtering. Each message includes a `chatId` field, and the client only displays messages matching the currently active chat. This architecture prevents message leakage between conversations while maintaining instant updates across all chats simultaneously.

6. **Infrastructure-Grade Real-Time Communication** - Uses Devvit's `connectRealtime` API to broadcast messages instantly through Reddit's infrastructure. Unlike traditional polling or websockets, this provides reliable, scalable real-time updates without managing socket connections. The system handles connection state, reconnection logic, and message delivery automatically.

7. **Frictionless Reddit Authentication** - Zero configuration required - users are automatically authenticated through their active Reddit session. No login screens, passwords, or OAuth flows. The app calls `reddit.getCurrentUsername()` server-side to securely identify users, making it completely seamless to start chatting.

8. **Persistent Redis Storage with Chat Isolation** - Messages are stored in Redis using a chat-specific key structure (`chat:{chatId}:messages`) with sorted sets for efficient chronological retrieval. Each message has a unique ID format (`{chatId}:{timestamp}:{random}`) ensuring persistence across sessions, surviving server restarts, and preventing duplicates. Chat metadata (participants, timestamps) is stored separately for fast access. User consent data is stored with key pattern `user:{userId}:consent` containing acceptance status, timestamp, and terms version.

9. **Optimistic UI Updates with Deduplication** - Messages appear instantly in the sender's UI while being confirmed by the server in the background, creating zero perceived latency. The app intelligently prevents duplicate messages by comparing message IDs when they arrive via the realtime channel, ensuring a clean, consistent message feed.

10. **Adaptive Mobile-First Design** - The UI intelligently adapts to screen size:
   - **Desktop**: Collapsible sidebar (64px collapsed, 256px expanded) with smooth CSS transitions and hover states
   - **Mobile**: Fixed bottom navigation bar (64px height) positioned above the input area, following iOS/Android patterns
   - **Both**: Multiple slide-out panels (LeftPanel, MessagesPanel, NotificationPanel, SettingsPanel) that overlay content with coordinated 300ms transitions
   - This respects Devvit's inline mode constraints while providing a native app-like experience

11. **Multi-Screen Social Platform Architecture** - Goes beyond simple chat to provide a complete social experience with dedicated screens for Home, Explore, Search, Places, Saved, and History. Each screen is a placeholder for future features, creating a foundation for a full-featured social platform. The app starts on the Home screen by default, providing a familiar social media experience before users dive into messaging.

12. **Seamless Reddit Integration** - Runs entirely within Reddit's ecosystem without external redirects, iframes, or page reloads. The app appears directly in posts with Reddit's signature orange (#d93900) branding, feeling like a natural extension of the Reddit platform rather than a third-party add-on.

13. **Coordinated Multi-Panel Navigation System** - Features four specialized overlay panels with intelligent transition coordination:
   - **LeftPanel** - Primary navigation menu (Home, Messages, Explore, Search, Places, Saved, History, Settings)
   - **MessagesPanel** - Chat session browser with 💬 avatars, last message previews, relative timestamps, and unread badges
   - **NotificationPanel** - Categorized alerts (messages, mentions, system) with unread indicators and mark-all-as-read
   - **SettingsPanel** - App configuration and preferences
   - Panels use 300ms transition delays to prevent overlap, creating smooth, polished animations

14. **Type-Safe Component Architecture** - Built with reusable React components using TypeScript for compile-time type safety and Tailwind CSS for consistent, utility-first styling. The modular architecture (Sidebar, MobileNav, TopNav, panels, screens) makes the codebase maintainable, testable, and extensible for future features.

15. **Comprehensive Error Handling with Toast Notifications** - Features a sophisticated toast notification system that provides non-intrusive feedback for all user actions:
   - **Error Toasts** (red) - Display when operations fail (e.g., "Failed to send message", "Failed to load chats") with optional retry actions
   - **Success Toasts** (green) - Confirm successful operations (e.g., "Message updated", "Message deleted", "Connection restored")
   - **Info Toasts** (blue) - Provide informational messages and system updates
   - **Auto-dismiss** - Toasts automatically disappear after 5 seconds with smooth animations
   - **Manual dismiss** - Users can close toasts immediately by clicking the X button
   - **Retry actions** - Failed operations include a "Retry" button that re-attempts the action
   - **Stacking** - Multiple toasts stack vertically in the top-right corner without overlapping
   - **Responsive positioning** - Toasts adapt to screen size and remain visible above all other UI elements (z-index 100)

16. **Network Resilience and Offline Mode** - Intelligent handling of network connectivity issues:
   - **Automatic detection** - Monitors browser online/offline events using `navigator.onLine` and window event listeners
   - **Visual indicators** - Yellow banner appears at the top when offline: "No internet connection" with warning icon
   - **Disabled actions** - Send button, edit, delete, and other network-dependent actions are disabled when offline
   - **Connection restoration** - Shows success toast when connection is restored: "Connection restored"
   - **Graceful degradation** - Users can still read cached messages and browse the UI while offline
   - **Input placeholders** - Text input shows "Offline - cannot send messages" when disconnected

## Tech Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for building immersive apps
- **[React](https://react.dev/)**: Frontend UI framework with hooks for state management
- **[Express](https://expressjs.com/)**: Backend API server
- **[Redis](https://redis.io/)**: Message persistence and data storage
- **[Vite](https://vite.dev/)**: Build tool and bundler
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development across client and server

## How to Use Happening App

### Complete User Guide

#### 1. First-Time User Experience (Onboarding)

**For New Users:**
- Navigate to a Reddit post where Happening App is installed (moderators enable it in their subreddits)
- You'll see the **Welcome Screen** displayed inline within the post:
  - App logo and name "Happening"
  - Tagline: "Real-time chat for Reddit communities"
  - Four key features highlighted with icons:
    - ⚡ Real-time messaging - Instant message delivery
    - 💬 Multiple chats - Manage conversations
    - ✏️ Edit and delete - Full message control
    - 📦 Persistent history - Messages saved
  - Prominent "Get Started" button with gradient styling
- Click **"Get Started"** to proceed to the Terms Screen
- The **Terms Screen** displays:
  - Header: "Before You Continue"
  - Explanation that using the app requires accepting the Privacy Policy and Terms & Conditions
  - Clickable links to view each document in an overlay
  - "I Agree" button to accept and continue
  - "Back" button to return to welcome screen
- Click **Privacy Policy** or **Terms & Conditions** to read the full documents:
  - A scrollable overlay appears with the complete text
  - Close button (X) in the top-right corner
  - Press Escape key or click backdrop to close
  - Overlay prevents body scroll while open
- Click **"I Agree"** to accept the terms:
  - Your consent is recorded in Redis with timestamp and version (1.0)
  - The app transitions to expanded mode and loads the main chat interface
  - Your Reddit username is automatically authenticated - no login or password required
  - The app loads your chat list and establishes a realtime connection

**For Returning Users:**
- When you view the post again, the app automatically checks your consent status
- If you've already accepted the terms, you bypass the welcome and terms screens entirely
- You're taken directly to the main chat interface
- Your consent persists across sessions and devices (stored in Redis)

#### 2. Launch the Application (After Onboarding)

- Once you've completed onboarding, the app opens directly to the **Home screen**
- Your Reddit username is automatically authenticated - no login or password required
- The app establishes a realtime connection for live chat updates
- You'll see the main interface with navigation options to access different screens and features

#### 3. Understanding the Interface

**Desktop Layout:**
- **Left Sidebar** - Collapsible navigation menu with Reddit logo and icons for Home, Chat, Search, and Places
  - Click the chevron button at the bottom to collapse/expand the sidebar
  - Collapsed state shows icon-only view (64px wide)
  - Expanded state shows icons with labels (256px wide)
  - The active screen is highlighted in Reddit orange (#d93900)
- **Top Header** - Shows current screen title (e.g., "Home", "Explore", "Search") with back arrow and notification bell
  - Back arrow button opens the LeftPanel navigation menu
  - Bell icon opens the NotificationPanel (shows a yellow dot indicator)
- **Main Content Area** - Displays the current screen (Home, Explore, Search, Places, Saved, History, or Chat)
- **Bottom Input Bar** (Chat screen only) - Text input field with plus button and send button

**Mobile Layout:**
- **Top Header** - Shows current screen title with back arrow and notification bell
  - Back arrow opens the LeftPanel navigation menu
  - Bell icon opens the NotificationPanel
- **Main Content Area** - Full-width display of the current screen
- **Bottom Navigation Bar** - Fixed navigation with Home, Chat, Search, and Places icons
  - Active tab highlighted in Reddit orange
  - Labels displayed under each icon
- **Input Bar** (Chat screen only) - Sits just above the bottom navigation (64px clearance)

#### 4. Creating and Selecting Chats

**To Create a New Chat:**
1. Click the **back arrow** (←) in the top-left corner to open the LeftPanel
2. Click **"Messages"** to open the MessagesPanel
3. Click the **"New Message"** button at the bottom
4. A new chat is created instantly with a unique ID
5. You're automatically taken to the new empty chat, ready to send messages
6. The chat appears in your chat list for future access

**To Select an Existing Chat:**
1. Click the **back arrow** (←) in the top-left to open the LeftPanel
2. Click **"Messages"** to open the MessagesPanel
3. Browse your chat sessions - each displays:
   - **💬 Chat avatar** - Visual identifier for the conversation
   - **Chat title** - Descriptive name or truncated chat ID
   - **Last message preview** - Shows username and message snippet
   - **Relative timestamp** - "5m", "2h", "Yesterday", "Just now"
   - **Unread badge** - Red circle with count of new messages
4. Click any chat to open it
5. The MessagesPanel closes and the chat screen loads with full message history

#### 5. Reading Messages

- All messages in the selected chat load automatically (most recent 50 messages initially)
- Each message displays in a white card with rounded corners and subtle shadow:
  - **Username** in Reddit orange (#d93900) - the person who sent it
  - **Timestamp** in gray - shows the time the message was sent (e.g., "2:45 PM")
  - **Edited indicator** - Shows "(edited)" if the message was modified
  - **Three-dot menu** - Appears on hover for your own messages (edit/delete options)
  - **Message text** in dark gray - the actual message content
- The chat automatically scrolls to show the newest messages at the bottom
- **Load More Button** - If older messages exist, a "Load More" button appears at the top of the message list
  - Click to fetch the next 50 older messages
  - Shows a loading spinner while fetching
  - Automatically maintains your scroll position after loading
- **Scroll-to-Load** - Alternatively, scroll near the top (within 100px) to automatically load more messages
- If no messages exist yet, you'll see "No messages yet. Start the conversation!"
- If no chat is selected, you'll see "Select a chat to start messaging"

#### 6. Sending Messages

**Two Methods to Send:**

**Keyboard Shortcut (Recommended):**
1. Ensure a chat is selected (if not, you'll see "Select a chat first..." placeholder)
2. Click in the text input field at the bottom
3. Type your message (any length, multiline supported)
4. Press **Enter** to send instantly
5. Message appears immediately and broadcasts to all participants in realtime

**Send Button:**
1. Type your message in the input field
2. Click the **send button** (📤 paper plane icon) on the right
3. Message is sent and appears instantly

**Important Notes:**
- **Chat must be selected first** - The input is disabled until you select a chat from MessagesPanel
- **Optimistic updates** - Your message appears immediately without waiting for server confirmation
- **Realtime broadcasting** - All participants see your message instantly via Devvit's realtime channel
- **Loading indicator** - Brief "..." animation shows while the message is being saved to Redis
- **Disabled state** - Send button is grayed out when input is empty or no chat is selected
- **Chat isolation** - Messages are only sent to the currently active chat, not all chats

#### 7. Editing and Deleting Messages

**To Edit Your Message:**
1. **Hover** over any message you sent (identified by your username)
2. Click the **three-dot menu** (⋮) that appears on the right side
3. Select **"Edit"** from the dropdown menu
4. An **inline text editor** appears with your current message content
5. Modify the text as needed (supports multiline editing)
6. Click **"Save"** to update or **"Cancel"** to discard changes
7. Edited messages display an **"(edited)"** indicator next to the timestamp
8. The message updates instantly for all participants via realtime sync

**To Delete Your Message:**
1. **Hover** over your message
2. Click the **three-dot menu** (⋮)
3. Select **"Delete"** (displayed in red) from the dropdown
4. A **confirmation modal** appears: "Are you sure you want to delete this message? This action cannot be undone."
5. Click **"Delete"** to permanently remove or **"Cancel"** to keep it
6. Deleted messages are removed from Redis and disappear for all users immediately

**Authorization & Security:**
- **Own messages only** - You can only edit/delete messages where your username matches the author
- **No menu for others** - The three-dot menu doesn't appear on messages from other users
- **Server-side validation** - The server verifies you're the message author before allowing modifications
- **Permanent deletion** - Deleted messages cannot be recovered (no undo functionality)
- **Edit tracking** - Edited messages retain their original timestamp but add an `editedAt` timestamp

#### 8. Real-Time Updates & Connection Status

**How Real-Time Works:**
- **Instant message delivery** - When anyone sends a message to your current chat, it appears immediately without page refresh
- **Chat-specific filtering** - Messages include a `chatId` field; the client only displays messages matching your active chat
- **Optimistic updates** - Your own messages appear instantly, then sync via realtime for confirmation
- **Duplicate prevention** - The app compares message IDs to prevent the same message from appearing twice
- **Multi-chat isolation** - Messages from other chats don't leak into your current conversation
- **Persistent history** - All messages are saved to Redis with chat-specific keys (`chat:{chatId}:messages`)

**Connection Status Indicators:**
- Open the **SidePanel** (hamburger menu icon) to view your connection status
- **Green dot (●)** = Connected and receiving live updates via Devvit's realtime channel
- **Gray dot (●)** = Disconnected (may need to refresh the page to reconnect)
- The app automatically attempts to reconnect if the connection drops
- Connection state is tracked in real-time using `onConnect` and `onDisconnect` callbacks

**What Happens When You're Offline:**
- Messages you send are queued and will be sent when connection is restored
- You can still read your message history (loaded from Redis on page load)
- New messages from others won't appear until you reconnect
- Refresh the page to force a reconnection if needed

#### 9. Navigation & Panels

**LeftPanel (Navigation Menu):**
- Click the back arrow button in the top-left corner to open
- The panel slides in from the left with a dark backdrop overlay
- **Navigation Options** include:
  - Home (house icon) - Navigate to the Home screen with feed placeholder
  - Messages (chat bubble icon) - Opens the MessagesPanel to browse chat sessions
  - Explore (magnifying glass with plus icon) - Navigate to the Explore screen for discovering communities
  - Search (magnifying glass icon) - Navigate to the Search screen for finding posts and users
  - Places (map pin icon) - Navigate to the Places screen for location-based communities
- **Additional Options** (below divider):
  - Saved (bookmark icon) - Navigate to the Saved screen for bookmarked content
  - History (clock icon) - Navigate to the History screen for recently viewed posts
  - Settings (gear icon) - Opens the SettingsPanel for app configuration
- Click the right arrow button or tap the backdrop to close the panel
- When you click "Messages", the LeftPanel closes and the MessagesPanel opens with a smooth 300ms transition
- When you click a screen option (Home, Explore, Search, Places, Saved, History), the panel closes and navigates to that screen

**MessagesPanel (Chat Sessions):**
- Opens from the LeftPanel by clicking "Messages"
- The panel slides in from the left (480px wide on desktop, full-width on mobile)
- **Search Bar** at the top to filter chat sessions (placeholder for future functionality)
- **Chat Session List** displays:
  - Chat avatar (💬 emoji)
  - Chat title (or truncated chat ID if no title)
  - Last message preview with username
  - Relative timestamp (e.g., "5m", "2h", "Yesterday", "Just now")
  - Unread message count badge (red circle with number)
- **New Message Button** at the bottom to create a new chat
- **Loading State** - Shows spinner while fetching chats
- **Empty State** - Shows "No messages yet" with icon when no chats exist
- Click any chat session to select it and view its messages (closes the panel and loads that chat)
- Click the X button or tap the backdrop to close and return to the LeftPanel
- When closing, the MessagesPanel closes first, then the LeftPanel reopens with a 300ms delay

**NotificationPanel:**
- Access notifications through the bell icon in the top-right corner
- The panel slides in from the right with a dark backdrop overlay
- **Notification Types**:
  - **Messages** (blue) - Direct messages from other users with a chat bubble icon
  - **Mentions** (purple) - When someone mentions you in a chat with an @ icon
  - **System** (gray) - System updates and announcements with an info icon
- **Features**:
  - Unread notifications show a blue dot indicator on the right
  - Timestamps show relative time (e.g., "Just now", "5m ago", "2h ago")
  - Unread notifications have a light blue background
  - "Mark all as read" button at the bottom
  - Empty state with bell icon when no notifications exist
- Click the X button or tap the backdrop to close the panel
- **Note**: Currently displays mock data for demonstration purposes

**SettingsPanel:**
- Access settings through the LeftPanel by clicking "Settings"
- The panel slides in from the left with a dark backdrop overlay
- Configure app preferences, notifications, and privacy settings (placeholder for future functionality)
- Click the X button or tap the backdrop to close and return to the LeftPanel
- When closing, the SettingsPanel closes first, then the LeftPanel reopens with a 300ms delay

**Desktop Sidebar:**
- **Home** - Navigate to the Home screen (default starting screen, highlighted in Reddit orange when active)
- **Chat** - Access the chat messaging interface
- **Search** - Navigate to the Search screen for finding content
- **Places** - Navigate to the Places screen for location-based communities
- **Collapse button** (chevron icon) - Save screen space by collapsing the sidebar to icon-only view (64px vs 256px)

**Mobile Bottom Navigation:**
- **Home** - Navigate to the Home screen (default starting screen, highlighted in Reddit orange when active)
- **Chat** - Access the chat messaging interface
- **Search** - Navigate to the Search screen for finding content
- **Places** - Navigate to the Places screen for location-based communities

**Additional Controls:**
- **Plus button** (+) next to the send button - Reserved for future features like attachments, emojis, or file uploads

#### 10. Best Practices & Tips

**Navigation:**
- **Explore all screens** - Use the sidebar or bottom navigation to discover Home, Explore, Search, Places, Saved, and History screens
- **Quick access** - The back arrow in the top-left opens the LeftPanel for fast navigation between screens
- **Desktop users** - Collapse the sidebar (chevron button) when you need more screen space
- **Mobile users** - Bottom navigation bar is fixed (64px height) for easy access to all sections

**Chat Management:**
- **Create chats strategically** - Use the "New Message" button to start new conversations for different topics or groups
- **Always select a chat first** - The input field is disabled until you select a chat from MessagesPanel
- **Switch chats frequently** - Use MessagesPanel to browse and jump between conversations quickly
- **Monitor unread counts** - Red badges on chat sessions show how many new messages you haven't read
- **Load older messages** - Use the "Load More" button or scroll to the top to fetch message history beyond the initial 50 messages

**Message Etiquette:**
- **Edit carefully** - Edited messages display an "(edited)" indicator, so others know the content changed
- **Delete with caution** - Deletion is permanent and cannot be undone - use the confirmation dialog wisely
- **Be respectful** - You're chatting with real Reddit users; follow community guidelines
- **Stay on topic** - Each chat typically focuses on a specific subject or community discussion

**Technical Tips:**
- **Check connection status** - Open SidePanel to see if you're connected (green dot = live, gray = disconnected)
- **Watch for toast notifications** - Error messages appear in the top-right corner with helpful retry actions
- **Use retry actions** - When operations fail, click the "Retry" button in the toast to try again
- **Monitor offline status** - Yellow banner appears at the top when you lose internet connection
- **Refresh if issues occur** - If messages aren't appearing, refresh the page to reconnect to the realtime channel
- **Message persistence** - All messages are saved to Redis, so your history persists even after closing the app
- **Chat isolation** - Messages are strictly isolated per chat - no cross-contamination between conversations

**UI Navigation:**
- **Panel coordination** - Panels transition smoothly (300ms delays) to prevent overlap and create polished UX
- **Browse efficiently** - MessagesPanel shows preview messages, timestamps, and unread counts for quick scanning
- **Dismiss toasts** - Click the X button on any toast notification to close it immediately
- **Screen switching** - Navigate between screens using the sidebar, bottom nav, or LeftPanel menu

---

## For Developers - Getting Started

> **Prerequisites**: Node.js 22.2.0 or higher is required

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Follow the playtest URL provided in the terminal (e.g., `https://www.reddit.com/r/your-app_dev?playtest=your-app`)
5. Test the app in your browser - it will appear in a Reddit post
6. Use `npm run deploy` to upload your app and `npm run launch` to publish it for review

## Available Commands

- `npm run dev` - Starts development server with live reload on Reddit
- `npm run build` - Builds client and server bundles for production
- `npm run build:client` - Builds only the client bundle
- `npm run build:server` - Builds only the server bundle
- `npm run deploy` - Uploads a new version of your app to Reddit
- `npm run launch` - Publishes your app for review (required for subreddits with >200 members)
- `npm run login` - Authenticates your CLI with Reddit
- `npm run check` - Runs TypeScript type checking, ESLint, and Prettier

## Project Structure

```
src/
├── client/                    # React frontend chat interface
│   ├── App.tsx                # Main chat UI component with realtime integration, toast notifications, and offline detection
│   ├── main.tsx               # React entry point for main app
│   ├── welcome.tsx            # React entry point for welcome screen
│   ├── terms.tsx              # React entry point for terms screen
│   ├── index.html             # HTML template for main app
│   ├── welcome.html           # HTML template for welcome screen (inline mode)
│   ├── terms.html             # HTML template for terms screen (inline mode)
│   ├── index.css              # Global styles and Tailwind imports
│   ├── components/            # Reusable UI components
│   │   ├── PolicyOverlay.tsx  # Reusable overlay for Privacy Policy and Terms & Conditions
│   │   ├── Sidebar.tsx        # Desktop collapsible navigation sidebar (Chat, Search, Home, Places)
│   │   ├── MobileNav.tsx      # Mobile bottom navigation bar (Home, Chat, Search, Places)
│   │   ├── TopNav.tsx         # Top navigation header with back button and notification bell
│   │   ├── LeftPanel.tsx      # Navigation menu panel (Home, Messages, Explore, Search, Places, Saved, History, Settings)
│   │   ├── MessagesPanel.tsx  # Chat session browser with chat list, search bar, and "New Message" button
│   │   ├── NotificationPanel.tsx  # Notification management panel with categorized alerts
│   │   ├── SettingsPanel.tsx  # App settings and preferences panel
│   │   ├── SidePanel.tsx      # User info panel (username, connection status, menu options)
│   │   ├── Toast.tsx          # Toast notification component with error, success, and info variants
│   │   └── ui/                # Base UI components
│   │       └── button.tsx     # Button component
│   ├── hooks/                 # Custom React hooks
│   │   └── useCounter.ts      # Legacy counter hook (from template)
│   ├── lib/                   # Utility functions
│   │   └── utils.ts           # Helper functions (e.g., cn for classnames)
│   ├── screens/               # Screen components for different views
│   │   ├── WelcomeScreen.tsx  # Onboarding welcome screen with feature highlights
│   │   ├── TermsScreen.tsx    # Terms acceptance screen with Privacy Policy and T&C
│   │   ├── HomeScreen.tsx     # Home feed placeholder screen
│   │   ├── ExploreScreen.tsx  # Explore/discovery placeholder screen
│   │   ├── SearchScreen.tsx   # Search placeholder screen
│   │   ├── PlacesScreen.tsx   # Places/location placeholder screen
│   │   ├── SavedScreen.tsx    # Saved messages placeholder screen
│   │   └── HistoryScreen.tsx  # Chat history placeholder screen
│   └── vite.config.ts         # Vite build configuration
├── server/                    # Express backend API
│   ├── index.ts               # API endpoints and Reddit integration
│   ├── core/                  # Business logic modules
│   │   ├── chat.ts            # Chat management functions (create, retrieve, delete)
│   │   ├── consent.ts         # Consent management functions (check, record)
│   │   ├── message.ts         # Message management functions (send, edit, delete, retrieve)
│   │   ├── post.ts            # Post creation functionality
│   │   ├── retention.ts       # Data retention policies (90-day message, 180-day chat cleanup)
│   │   └── redis/             # Redis storage layer
│   │       ├── index.ts       # Redis client exports
│   │       ├── chat.ts        # Chat metadata storage operations
│   │       ├── consent.ts     # Consent storage operations
│   │       ├── message.ts     # Message storage operations (sorted sets)
│   │       └── userChatIndex.ts  # User chat index management
│   └── vite.config.ts         # Server build configuration
└── shared/                    # Shared TypeScript types
    └── types/                 # Type definitions
        ├── api.ts             # API response types
        ├── chat.ts            # Chat and message type definitions
        └── consent.ts         # Consent status and API types
```

## Development Notes

### Implementation Details

**Client Features**:
- Multiple HTML entry points for onboarding flow:
  - `welcome.html` - Welcome screen in inline mode (height: regular)
  - `terms.html` - Terms acceptance screen in inline mode (height: regular)
  - `index.html` - Main chat app in expanded mode (default entry point)
- Onboarding screens with consent tracking:
  - WelcomeScreen checks consent on mount and bypasses if already accepted
  - TermsScreen displays Privacy Policy and Terms & Conditions with clickable overlays
  - PolicyOverlay component for displaying full policy documents with scroll and keyboard support
  - Consent acceptance triggers transition to expanded mode using `requestExpandedMode`
- Real-time message broadcasting using `connectRealtime` from `@devvit/web/client`
- Multi-chat state management with `currentChatId` tracking
- Message edit and delete functionality with authorization checks
- Optimistic UI updates - messages appear instantly before server confirmation
- Auto-scrolling chat interface with smooth scroll behavior using `scrollIntoView`
- Automatic username fetching on mount
- Connection status tracking with visual indicators (green/gray dots)
- Timestamp formatting using `toLocaleTimeString()` for readable time display
- Comprehensive error handling with toast notifications:
  - `Toast.tsx` component with error, success, and info variants
  - `ToastContainer` manages multiple toasts with stacking and auto-dismiss
  - Toast messages include optional retry actions for failed operations
  - 5-second auto-dismiss with manual close option
  - Smooth slide-in animations from the right
- Network connectivity monitoring:
  - Online/offline detection using `navigator.onLine` and window event listeners
  - Yellow banner warning when offline with disabled actions
  - Success toast when connection is restored
  - Input placeholders update based on connection status
- Loading states and error handling with try-catch blocks throughout
- Duplicate message prevention using message ID comparison in state updates
- Message action menu with edit/delete options (three-dot menu on hover)
- Inline message editing with save/cancel controls
- Delete confirmation modal dialog
- Message pagination with "Load More" button and scroll-to-load behavior
- Scroll position preservation after loading older messages
- Responsive design with mobile-first approach:
  - Desktop: Collapsible sidebar (64px collapsed, 256px expanded) with smooth transitions
  - Mobile: Bottom navigation bar (64px height) with fixed positioning
  - Both: Multiple slide-out panels that overlay content with coordinated transitions
- Component architecture with reusable UI components:
  - `Sidebar.tsx` - Desktop collapsible navigation with Chat, Search, Home, Places
  - `MobileNav.tsx` - Mobile bottom navigation with Home, Chat, Search, Places
  - `TopNav.tsx` - Top header with back button and notification bell
  - `LeftPanel.tsx` - Navigation menu with Home, Messages, Explore, Search, Places, Saved, History, Settings
  - `MessagesPanel.tsx` - Chat session browser with chat list, search bar, and "New Message" button
  - `NotificationPanel.tsx` - Notification management with categorized alerts (messages, mentions, system)
  - `SettingsPanel.tsx` - App settings and preferences configuration
  - `SidePanel.tsx` - User info panel with username, connection status, and menu options
  - `Toast.tsx` - Toast notification component with error, success, and info variants
- Coordinated panel transitions:
  - LeftPanel coordinates with MessagesPanel and SettingsPanel using 300ms delays to prevent overlap
  - When Messages is clicked in LeftPanel, it closes and MessagesPanel opens smoothly
  - When Settings is clicked in LeftPanel, it closes and SettingsPanel opens smoothly
  - When MessagesPanel or SettingsPanel closes, it reopens LeftPanel after a delay
  - Panels use `isOpen && !isOtherPanelOpen` logic to prevent simultaneous display
- Tailwind CSS utility classes for styling with custom Reddit orange (#d93900)
- TypeScript for type safety across all components with shared types
- Custom hooks for reusable logic (e.g., `useCounter.ts` from template)aved, History, Settings
  - `MessagesPanel.tsx` - Chat session browser with chat list, search bar, and "New Message" button
  - `NotificationPanel.tsx` - Notification management with categorized alerts (messages, mentions, system)
  - `SettingsPanel.tsx` - App settings and preferences configuration
  - `SidePanel.tsx` - User info panel with username, connection status, and menu options
- Coordinated panel transitions:
  - LeftPanel coordinates with MessagesPanel and SettingsPanel using 300ms delays to prevent overlap
  - When Messages is clicked in LeftPanel, it closes and MessagesPanel opens smoothly
  - When Settings is clicked in LeftPanel, it closes and SettingsPanel opens smoothly
  - When MessagesPanel or SettingsPanel closes, it reopens LeftPanel after a delay
  - Panels use `isOpen && !isOtherPanelOpen` logic to prevent simultaneous display
- Tailwind CSS utility classes for styling with custom Reddit orange (#d93900)
- TypeScript for type safety across all components with shared types
- Custom hooks for reusable logic (e.g., `useCounter.ts` from template)

**Server Endpoints**:
- `GET /api/username` - Returns the current Reddit user's username
- `GET /api/consent/check` - Checks if the user has accepted terms (returns hasConsent boolean and consent object)
- `POST /api/consent/accept` - Records user's acceptance of terms with timestamp and version
- `POST /api/chats/create` - Creates a new chat and returns the chat ID
- `GET /api/chats` - Returns the user's list of chats with metadata
- `GET /api/chats/:chatId` - Returns metadata for a specific chat
- `DELETE /api/chats/:chatId` - Deletes a chat and all its messages
- `GET /api/chats/:chatId/messages` - Returns message history for a specific chat (with pagination)
- `POST /api/chats/:chatId/messages` - Sends a message to a specific chat and broadcasts to realtime channel
- `PUT /api/chats/:chatId/messages/:messageId` - Edits a message (with authorization check)
- `DELETE /api/chats/:chatId/messages/:messageId` - Deletes a message (with authorization check)

**Realtime Integration**: 
- The app connects to a channel named `'chat-messages'` for live message updates
- Messages include a `chatId` field to identify which chat they belong to
- The client filters incoming messages to only display those matching the current chat
- Messages are stored in Redis using a sorted set structure: `chat:{chatId}:messages`
- Chat metadata is stored separately: `chat:{chatId}:metadata`
- User chat index is stored as: `user:{userId}:chats`
- Each message has a unique ID format: `{chatId}:{timestamp}:{random}`
- The realtime connection handles:
  - `onConnect` - Sets connection status to true
  - `onDisconnect` - Sets connection status to false
  - `onMessage` - Receives new messages and adds them to state only if they match the current chat ID (with duplicate prevention)

**Data Flow**:
1. User selects a chat from MessagesPanel (sets `currentChatId`)
2. Client fetches messages for that chat from `/api/chats/:chatId/messages`
3. User types message and clicks send
4. Client optimistically adds message to UI
5. Client sends POST request to `/api/chats/:chatId/messages`
6. Server validates user is a participant in the chat
7. Server saves message to Redis with chat-specific key
8. Server broadcasts message to realtime channel with `chatId` field
9. All connected clients receive message via `onMessage` callback
10. Clients filter by `chatId` and only add message if it matches their current chat (if not already present)

### Key Design Decisions

**Why Collapsible Sidebar on Desktop?**
- Provides quick navigation without taking up too much horizontal space
- Users can collapse to icon-only view for maximum chat area
- Smooth transitions create a polished user experience

**Why Bottom Navigation on Mobile?**
- Follows mobile-first design principles
- Doesn't steal horizontal space (critical on narrow screens)
- Thumb-friendly positioning for one-handed use
- Common pattern in mobile apps (Instagram, Twitter, etc.)

**Why Multiple Coordinated Panels?**
- Provides rich navigation without cluttering the main chat interface
- LeftPanel offers primary navigation (Home, Messages, Explore, etc.)
- MessagesPanel shows detailed chat session browser with subreddit conversations
- NotificationPanel manages alerts and notifications separately
- Coordinated transitions (300ms delays) prevent panels from overlapping
- Smooth animations create a polished, app-like experience

**Why Optimistic Updates?**
- Creates a snappy, responsive feel
- Users see their messages instantly without waiting for server confirmation
- Reduces perceived latency and improves user experience

**Why Redis for Storage?**
- Fast in-memory data store perfect for chat messages
- Built-in support in Devvit platform
- Simple key-value structure for post-specific message storage
- Persistent across server restarts

---

### Cursor Integration

This template comes with a pre-configured Cursor environment. To get started, [download Cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
