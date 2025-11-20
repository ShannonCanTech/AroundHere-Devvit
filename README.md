# Happening - Real-Time Chat for Reddit Communities

> **A modern, feature-rich real-time chat application built on Reddit's Devvit platform.** Connect with Reddit users instantly through persistent chat conversations with full message management capabilities.

## 🎯 What Is This?

**Happening is a real-time messaging platform for Reddit that brings modern chat functionality directly into Reddit posts.**

This application provides a complete chat experience with real-time messaging, persistent history, and full message control. After a streamlined onboarding flow, users can create and manage multiple chat conversations, send messages instantly, edit or delete their messages, and browse message history with automatic pagination. The app features a responsive design that adapts seamlessly between desktop and mobile devices, with smart avatar display using Reddit snoovatars and intelligent fallbacks.

**What makes it special:**
- 🎯 **Streamlined Onboarding** - Welcome screen with feature highlights, terms acceptance with scrollable policy overlays, and consent tracking
- 💬 **Real-Time Messaging** - Instant message delivery using Devvit's realtime API with live updates to all participants
- 🗂️ **Multiple Chats** - Create and manage multiple chat conversations with participant management
- 👤 **Smart Avatars** - Display Reddit snoovatars with 3-tier fallback system (custom → Reddit defaults → app default)
- ✏️ **Message Editing** - Edit your messages after sending with inline editor and save/cancel controls
- 🗑️ **Message Deletion** - Delete messages with confirmation dialog to prevent accidents
- 📜 **Message History** - Persistent storage with automatic pagination (50 messages per page) and scroll-to-load
- 📱 **Responsive Design** - Desktop collapsible sidebar and mobile bottom navigation with coordinated panel transitions
- 🔔 **Toast Notifications** - Real-time feedback for all actions with optional retry buttons
- 🌐 **Offline Detection** - Graceful handling of network issues with visual indicators and disabled actions
- 🎨 **Modern UI** - Clean, polished interface with smooth animations and Reddit orange (#d93900) color scheme

## 🔍 Quick Overview

**What is Happening?** A **real-time chat platform** that brings modern messaging to Reddit communities.

**How it works:**
1. **Launch the app** - Opens with automatic Reddit authentication
2. **Complete onboarding** - First-time users see a welcome screen with feature highlights, then accept Privacy Policy and Terms & Conditions
3. **Home screen** - View your personalized welcome with your Reddit avatar and username
4. **Browse chats** - Access the Messages panel to view existing conversations with participant names and last messages
5. **Start chatting** - Create new chats or select existing ones to begin messaging
6. **Send messages** - Type and send messages instantly with real-time delivery to all participants
7. **Edit/Delete** - Full control over your messages with inline editing and confirmation dialogs
8. **Load history** - Scroll up or click "Load More" to view older messages (50 per page)
9. **Stay connected** - Real-time updates keep conversations flowing with connection status indicators

**Perfect for:**
- 💬 **Community discussions** - Real-time conversations within Reddit communities
- 🤝 **Direct messaging** - Private conversations between Reddit users
- 📢 **Live events** - Coordinate and discuss during live events
- 🎮 **Gaming communities** - Team coordination and strategy discussions
- 📚 **Study groups** - Collaborative learning and Q&A sessions

## 🌟 What Makes Happening Innovative

This application brings modern chat functionality to Reddit with features that rival standalone messaging apps:

### 🎯 Streamlined Onboarding Flow
- **Welcome Screen** - Beautiful gradient interface showcasing key features (real-time messaging, multiple chats, edit/delete, persistent history)
- **Terms Acceptance** - Clear presentation of Privacy Policy and Terms & Conditions with scrollable overlays
- **Consent Tracking** - User acceptance stored in Redis with timestamp and version number
- **Smart Bypass** - Returning users automatically skip onboarding and go straight to the app
- **Seamless Transition** - Smooth navigation from inline welcome/terms screens to expanded chat interface

### 👤 Smart Avatar System
- **Reddit Snoovatars** - Displays user's custom Reddit avatars automatically via `getSnoovatarUrl()` API
- **Intelligent Fallbacks** - Gracefully handles missing avatars with Reddit's 8 default avatars based on username hash
- **Cached Loading** - Redis caching for fast avatar display (1-hour expiration)
- **Loading States** - Smooth skeleton animations while avatars load
- **Error Handling** - Automatic fallback to custom default snoo icon on errors

### 💬 Real-Time Communication
- **Instant delivery** - Messages appear immediately using Devvit's realtime API
- **Live updates** - See new messages as they arrive without refreshing
- **Connection status** - Visual indicators show when you're connected
- **Offline detection** - Graceful handling of network issues with user feedback

### 🎨 Modern User Interface
- **Responsive Design** - Seamless experience on desktop and mobile
- **Desktop Sidebar** - Collapsible navigation (64px collapsed, 256px expanded)
- **Mobile Bottom Nav** - Fixed navigation bar optimized for touch
- **Slide-Out Panels** - Multiple coordinated panels (Messages, Settings, Notifications)
- **Toast Notifications** - Real-time feedback with success/error/info variants
- **Smooth Animations** - Polished transitions and loading states
- **Reddit Styling** - Familiar Reddit orange (#d93900) color scheme

### ✏️ Full Message Control
- **Edit Messages** - Inline editor with save/cancel controls
- **Delete Messages** - Confirmation dialog prevents accidental deletion
- **Authorization Checks** - Users can only edit/delete their own messages
- **Edit Indicators** - Edited messages show "(edited)" label
- **Optimistic Updates** - Messages appear instantly before server confirmation
- **Duplicate Prevention** - Message IDs ensure no duplicate messages

## 📖 How to Use Happening

### Step-by-Step Guide

#### 1. **Launch the App**
- Open the app in a Reddit post where it's installed
- **First-time users**: Complete the onboarding flow
  - **Welcome Screen** - See app features (real-time messaging, multiple chats, edit/delete, persistent history) and click "Get Started"
  - **Terms Screen** - Review and accept Privacy Policy and Terms & Conditions by clicking links to view full documents in scrollable overlays
  - Click "I Agree" to record consent and proceed to the main app interface
- **Returning users**: Automatically bypass onboarding (consent checked on load, stored in Redis with timestamp and version)
- The app loads with the **Home Screen** showing your personalized welcome

#### 2. **Home Screen**
The home screen displays a personalized welcome with your Reddit identity:

**What You See:**
- **Beautiful gradient background** - Blue-to-green gradient creates welcoming atmosphere
- **Your avatar** - Large Reddit snoovatar (192px) displayed in rounded container with border
- **Welcome message** - Personalized greeting showing your Reddit username
- **Loading state** - Smooth "Loading avatar tests..." message while fetching your information
- **Clean centered layout** - Puts your identity front and center

This screen creates a welcoming first impression and showcases your Reddit identity with your actual snoovatar.

#### 3. **Main Chat Interface**
Access the chat interface by clicking the **Chat** button:
- **Top navigation** - Back button and notification bell
- **Desktop sidebar** - Collapsible navigation with Chat, Search, Home, Places
- **Mobile bottom nav** - Home, Chat, Search, Places buttons
- **Message area** - Displays chat messages with avatars and timestamps
- **Input field** - Type your messages here
- **Send button** - Click to send your message
- **Connection indicator** - Shows online/offline status

The interface adapts seamlessly between desktop and mobile devices!

#### 4. **Browse and Select Chats**
Access your chat conversations:

**On Desktop:**
- Click the **Chat** button in the left sidebar
- Or click the **hamburger menu** (☰) in the top-left to open the navigation panel
- Select **Messages** from the panel

**On Mobile:**
- Tap the **Chat** icon in the bottom navigation bar
- Or tap the **hamburger menu** (☰) in the top-left
- Select **Messages** from the panel

**In the Messages Panel:**
- View all your active chats with participant names and last message
- Use the search bar to find specific chats
- Click **"New Message"** to start a new chat
- Tap any chat to open it and start messaging

**Chat List Features:**
- Real user avatars (Reddit snoovatars with smart fallbacks)
- Last message preview
- Timestamp of last activity
- Unread message indicators (coming soon)

#### 5. **Send and Manage Messages**
Communicate in real-time:

**Sending Messages:**
- Type your message in the input field at the bottom
- Press **Enter** to send (or click the send button)
- Messages appear instantly with your avatar and username
- Timestamps show when each message was sent

**Editing Messages:**
- Hover over your message to reveal the **three-dot menu** (⋮)
- Click the menu and select **"Edit"**
- Modify your message in the inline editor
- Click **"Save"** to update or **"Cancel"** to discard changes
- Edited messages show an "(edited)" indicator

**Deleting Messages:**
- Hover over your message to reveal the **three-dot menu** (⋮)
- Click the menu and select **"Delete"**
- Confirm deletion in the popup dialog
- Message is permanently removed from the chat

**Message Features:**
- Real-time delivery to all participants
- Automatic scroll to newest messages
- Load older messages by scrolling up or clicking "Load More"
- Duplicate prevention ensures messages appear only once

#### 6. **Navigate the App**
Explore different sections:

**Desktop Navigation (Sidebar):**
- **Home** - Avatar testing slideshow with 12 comprehensive test slides
- **Chat** - Access your messages and conversations
- **Search** - Search placeholder screen (coming soon)
- **Places** - Places placeholder screen (coming soon)

**Mobile Navigation (Bottom Bar):**
- Same four main sections optimized for touch
- Fixed at the bottom for easy thumb access
- Active section highlighted in Reddit orange

**Additional Panels:**
- **Left Panel** - Full navigation menu with Explore, Saved, History, Settings
- **Messages Panel** - Browse and manage your chats
- **Notifications Panel** - View alerts and updates
- **Settings Panel** - Configure app preferences

**Pro Tips:**
- **Stay connected** - Green dot shows you're online
- **Offline mode** - Yellow banner warns when offline, actions disabled
- **Toast notifications** - Success/error messages appear in bottom-right
- **Retry actions** - Failed operations show retry buttons in toasts
- **Smooth transitions** - Panels slide in/out with coordinated timing
- **Keyboard shortcuts** - Enter to send, Escape to close panels

Think of it as a **comprehensive avatar testing tool and modern messaging app** built right into Reddit, perfect for developers testing avatar systems and users wanting polished chat functionality!

## 📋 What This Application Does

This is a **real-time chat platform** for Reddit that brings modern messaging functionality directly into Reddit posts. It provides a complete chat experience with onboarding flow, persistent message history, full message management capabilities, and responsive design that works beautifully on both desktop and mobile devices.

**Onboarding & Authentication:**

- **Welcome Screen** - First-time users see an engaging welcome screen with app logo, tagline, and four feature highlights (real-time messaging, multiple chats, edit/delete, persistent history)
- **Terms Acceptance** - Users must review and accept Privacy Policy and Terms & Conditions before using the app
- **Consent Tracking** - User acceptance stored in Redis with timestamp and version number for compliance
- **Smart Bypass** - Returning users automatically skip onboarding based on consent check
- **Reddit Authentication** - Automatic authentication using Reddit's session, no separate login required

**Core Chat Features:**

- **Real-Time Messaging** - Instant message delivery using Devvit's realtime API with live updates to all participants
- **Multiple Chats** - Create and manage multiple chat conversations with different participants
- **Message History** - Persistent storage in Redis with automatic pagination (50 messages per page)
- **Message Editing** - Edit your messages after sending with inline editor and save/cancel controls
- **Message Deletion** - Delete messages with confirmation dialog to prevent accidental deletion
- **User Avatars** - Display Reddit snoovatars with smart 3-tier fallback system (custom → Reddit defaults → app default)
- **Connection Status** - Visual indicators show online/offline state with automatic reconnection
- **Toast Notifications** - Real-time feedback for all actions (success, error, info) with optional retry buttons

**User Interface:**

- **Responsive Design** - Seamless experience on desktop (sidebar) and mobile (bottom nav)
- **Desktop Sidebar** - Collapsible navigation (64px collapsed, 256px expanded) with smooth transitions
- **Mobile Bottom Nav** - Fixed navigation bar optimized for touch with 4 main sections
- **Slide-Out Panels** - Multiple panels (Messages, Settings, Notifications) with coordinated transitions
- **Top Navigation** - Back button and notification bell for quick access
- **Message Display** - Clean message cards with avatars, usernames, timestamps, and edit indicators
- **Input Area** - Message input field with send button and placeholder text

**Data Management:**

- **Redis Storage** - All data stored in Redis with automatic retention policies
- **Message Retention** - Messages automatically deleted after 90 days
- **Chat Retention** - Inactive chats (no messages for 180 days) automatically removed
- **User Chat Index** - Efficient lookup of user's chats using sorted sets
- **Optimistic Updates** - Messages appear instantly before server confirmation
- **Duplicate Prevention** - Message IDs ensure no duplicate messages in UI

**Authentication & Security:**

- **Reddit Authentication** - Automatic authentication using Reddit's session
- **Authorization Checks** - Users can only edit/delete their own messages
- **Consent Tracking** - Privacy Policy and Terms & Conditions acceptance stored in Redis
- **Onboarding Flow** - First-time users complete welcome and terms screens

## 🚀 What Makes Happening Innovative

This application brings modern chat functionality to Reddit with features that rival standalone messaging apps, all built directly into the Reddit platform.

**Key Innovation**: Complete chat experience with streamlined onboarding, real-time messaging, full message management capabilities, persistent history, and responsive design that works seamlessly on both desktop and mobile devices - all within Reddit's ecosystem.

### 1. Streamlined Onboarding with Consent Tracking
Implements a professional onboarding flow with welcome screen showcasing features, terms acceptance with scrollable policy overlays, and consent tracking in Redis. First-time users see the welcome screen with app logo, tagline, and four feature highlights, then review Privacy Policy and Terms & Conditions before accepting. Consent is stored with timestamp and version number for compliance. Returning users automatically bypass onboarding based on consent check, providing a seamless experience.

### 2. Real-Time Message Broadcasting
Uses Devvit's realtime API to broadcast messages instantly to all participants. Messages include a `chatId` field for filtering, ensuring users only see messages from their current chat. The system handles connection/disconnection gracefully with visual indicators (green/gray dots) and automatic reconnection. Optimistic updates show messages immediately before server confirmation for a snappy user experience. Duplicate prevention ensures messages appear only once.

### 3. Full Message Management
Provides complete control over messages with edit and delete capabilities. Users can edit messages inline with save/cancel controls, and edited messages show an "(edited)" indicator. Deletion requires confirmation dialog to prevent accidents. Authorization checks ensure users can only modify their own messages (403 errors for unauthorized attempts). All changes are persisted to Redis and broadcast to other participants in real-time.

### 4. Responsive Multi-Platform Design
Seamlessly adapts between desktop and mobile with different navigation patterns. Desktop features a collapsible sidebar (64px collapsed, 256px expanded) with smooth transitions and four main sections (Home, Chat, Search, Places). Mobile uses a fixed bottom navigation bar (64px height) optimized for thumb access with the same four sections. Both platforms share the same core functionality with platform-appropriate UI patterns. Multiple slide-out panels (LeftPanel, MessagesPanel, SettingsPanel, NotificationPanel) coordinate transitions with 300ms delays to prevent overlap.

### 5. Smart Avatar System
Displays Reddit snoovatars with a sophisticated 3-tier fallback system. Primary source is Reddit's `getSnoovatarUrl()` API for custom snoovatars (i.redd.it/snoovatar/avatars/). Falls back to Reddit's 8 default avatars (www.redditstatic.com/avatars/defaults/) based on username hash for consistent appearance. Final fallback is a custom default snoo icon (/default-snoo.png). Avatars are cached in Redis for performance (1-hour expiration) and include loading states with animated skeleton placeholders. Error handling automatically triggers fallback with opacity reduction.

### 6. Persistent Message History
Stores all messages in Redis using sorted sets (chat:{chatId}:messages) for efficient pagination. Messages are automatically paginated (50 per page) with "Load More" button at the top and scroll-to-load behavior when scrolling near the top (within 100px). Scroll position is preserved when loading older messages using scroll height calculations. Automatic retention policies delete messages after 90 days and inactive chats (no messages for 180 days) to manage storage efficiently.

### 7. Advanced Error Handling
Comprehensive error handling with toast notifications for all actions (success/error/info variants). Network failures show retry buttons in toasts that restore user input. Offline detection using `navigator.onLine` and window event listeners disables actions and shows yellow warning banner. Connection restoration shows success toast. All API errors are caught and displayed with user-friendly messages (e.g., "Failed to send message", "You can only edit your own messages"). Failed operations can be retried without losing user input.

### 8. Coordinated Panel Transitions
Multiple slide-out panels (LeftPanel, MessagesPanel, SettingsPanel, NotificationPanel) coordinate their transitions to prevent overlap. When Messages is clicked in LeftPanel, it closes and MessagesPanel opens after 300ms delay. When MessagesPanel closes, it reopens LeftPanel after 300ms delay. Panels use `isOpen && !isOtherPanelOpen` logic to ensure only one panel is visible at a time. This creates a polished, professional feel without jarring transitions or simultaneous panel displays.

This application provides a modern, feature-rich messaging experience built directly into Reddit, bringing the convenience of standalone chat apps to Reddit communities without requiring users to leave the platform.

## Tech Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for building immersive apps
- **[React](https://react.dev/)**: Frontend UI framework with hooks for state management
- **[Express](https://expressjs.com/)**: Backend API server
- **[Redis](https://redis.io/)**: Data storage for caching and consent tracking
- **[Vite](https://vite.dev/)**: Build tool and bundler
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development across client and server

## 📖 Complete Usage Guide

**Happening** is a full-featured real-time chat application for Reddit communities. This guide covers all features and functionality.

### Getting Started

#### 1. First-Time Users: Onboarding Flow

**Welcome Screen** (Inline Mode):
- App logo with gradient background
- App name: "Happening"
- Tagline: "Real-time chat for Reddit communities"
- Four feature highlights with icons
- "Get Started" button navigates to Terms Screen

**Terms Screen** (Inline Mode):
- Header: "Before You Continue"
- Links to Privacy Policy and Terms & Conditions (open in scrollable overlays)
- "I Agree" button records consent in Redis and navigates to testing interface
- "Back" button returns to Welcome Screen

**Returning Users**:
- Consent check happens automatically on load
- If consent exists in Redis, onboarding is bypassed
- Direct navigation to Avatar Testing Interface

#### 2. Home Screen

After onboarding, you see the **Home Screen** with:
- **Gradient background** - Beautiful blue-to-green gradient
- **Your avatar** - Large Reddit snoovatar (128px) with smart fallbacks
- **Welcome message** - Personalized greeting with your username
- **Loading state** - Smooth animation while fetching your avatar
- **Clean layout** - Centered design puts your identity front and center

This personalized home screen creates a welcoming first impression and showcases your Reddit identity.

#### 3. Creating and Managing Chats

**Create a New Chat:**
1. Open the Messages Panel (Chat button or hamburger menu → Messages)
2. Click the **"New Message"** button at the top
3. Select participants from your Reddit contacts
4. Start sending messages immediately

**View Your Chats:**
- All active chats appear in the Messages Panel
- Each chat shows participant names and last message
- Timestamps indicate last activity
- Real user avatars (Reddit snoovatars) for visual identification

**Search Chats:**
- Use the search bar at the top of Messages Panel
- Find chats by participant name or message content
- Results update as you type

**Delete a Chat:**
- Open the chat you want to delete
- Access chat settings (three-dot menu)
- Select "Delete Chat"
- Confirm deletion (this removes all messages permanently)

#### 4. Advanced Features

**Message Pagination:**
- Chats load 50 most recent messages initially
- Scroll to top to trigger automatic loading of older messages
- Or click the "Load More" button that appears at the top
- Scroll position is preserved when loading older messages

**Connection Management:**
- Green dot indicator shows you're connected
- Gray dot indicates disconnected state
- Yellow banner appears when offline
- Automatic reconnection when connection is restored
- Actions are disabled when offline to prevent errors

**Toast Notifications:**
- Success messages (green) for completed actions
- Error messages (red) for failed operations
- Info messages (blue) for general notifications
- Retry buttons appear for failed operations
- Auto-dismiss after 5 seconds or manual close

#### 5. Tips and Best Practices

**For Best Experience:**
- Keep the app open to receive real-time messages
- Use keyboard shortcuts (Enter to send, Escape to close panels)
- Check connection status before sending important messages
- Edit messages within a few minutes for best results
- Use the search feature to find old conversations quickly

**Privacy and Security:**
- Only you and chat participants can see messages
- Messages are stored securely in Redis
- Automatic deletion after 90 days protects privacy
- You can delete your messages at any time
- Consent is required before using the app

**Performance Tips:**
- Messages are paginated for fast loading
- Avatars are cached for quick display
- Optimistic updates make the app feel instant
- Offline mode prevents wasted API calls
- Automatic cleanup keeps storage efficient

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
│   │   ├── Avatar.tsx         # Base avatar component for displaying user snoovatars with fallback support
│   │   ├── ProfileIcon.tsx    # Specialized avatar component for chat messages and user profiles
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
│   ├── utils/                 # Client utility functions
│   │   └── avatarFallback.ts  # Avatar fallback utilities (FALLBACK_AVATAR_SVG, getDefaultAvatarUrl)
│   ├── components/Snoovatar/  # Advanced snoovatar system (currently in use)
│   │   ├── Snoovatar.tsx      # Enhanced avatar component with accessories and animations
│   │   ├── SnoovatarSprite.tsx # Sprite-based snoovatar rendering component
│   │   ├── defaultSnoovatars.ts # Default avatar color schemes and fallback generation
│   │   ├── accessories.ts     # Accessory definitions and configurations
│   │   ├── animations.css     # CSS animations for snoovatar movements
│   │   ├── types.ts           # Snoovatar type definitions
│   │   ├── useSnoovatar.ts    # Snoovatar state management hook
│   │   ├── index.ts           # Public exports for Snoovatar system
│   │   ├── examples/          # Example implementations
│   │   │   ├── DefaultAvatarsExample.tsx # Default avatar showcase
│   │   │   └── GameAvatarExample.tsx # Game integration example
│   │   ├── README.md          # Snoovatar system documentation
│   │   ├── ARCHITECTURE.md    # System architecture guide
│   │   ├── IMPLEMENTATION_GUIDE.md # Implementation instructions
│   │   ├── MIGRATION_GUIDE.md # Migration from Avatar to Snoovatar
│   │   └── DEFAULT_AVATARS_GUIDE.md # Default avatar system guide
│   ├── screens/               # Screen components for different views
│   │   ├── WelcomeScreen.tsx  # Onboarding welcome screen with feature highlights
│   │   ├── TermsScreen.tsx    # Terms acceptance screen with Privacy Policy and T&C
│   │   ├── HomeScreen.tsx     # Avatar testing slideshow with 12 comprehensive test slides
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
- **Home Screen** - Displays personalized welcome with user's avatar, username, and beautiful gradient background
- **Avatar System** - Uses base `Avatar` component for displaying Reddit snoovatars with smart fallback to default snoo icon, loading states with animated skeleton, and error handling
- **Chat Interface** - Full-featured messaging UI with message cards, avatars, timestamps, edit indicators, and action menust identity.
- Multiple HTML entry points for onboarding flow:
  - `welcome.html` - Welcome screen in inline mode (height: regular)
  - `terms.html` - Terms acceptance screen in inline mode (height: regular)
  - `index.html` - Main chat app in expanded mode (default entry point)
- Onboarding screens with consent tracking:
  - WelcomeScreen checks consent on mount and bypasses if already accepted
  - TermsScreen displays Privacy Policy and Terms & Conditions with clickable overlays
  - PolicyOverlay component for displaying full policy documents with scroll and keyboard support
  - Consent acceptance triggers transition to expanded mode using `requestExpandedMode`
- Avatar Testing Slideshow (Home screen):
  - Fetches 12 test slides from `/api/avatar-test` endpoint on mount
  - Each slide contains: title, description, avatar URL, and source type
  - Displays large avatar (192px) in rounded container with border
  - Shows slide counter (e.g., "1 / 12") in top-right corner
  - Displays username in top-left corner
  - Source badge indicates avatar type (custom, default, fallback)
  - Full URL displayed in code block for debugging
  - Navigation buttons ("← Previous", "Next →") for manual control
  - Keyboard navigation with arrow keys (←/→ or ↑/↓)
  - Slides loop continuously (after last slide, returns to first)
  - Loading state with "Loading avatar tests..." message
  - Error handling with "No avatar data available" fallback
  - Beautiful gradient background (blue-to-green) creates welcoming atmosphere
  - Image error handling with fallback to `/default-snoo.png` and opacity reduction
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
  - `Avatar.tsx` - Base avatar component that mimics Devvit Blocks `<avatar>` for web:
    - Displays user snoovatars with configurable sizes (xxsmall to xxxlarge)
    - Supports left/right facing directions
    - Implements loading states with animated skeleton
    - Automatic fallback to `FALLBACK_AVATAR_SVG` on image load errors
    - Rounded images with orange border (border-2 border-orange-500)
    - Optional click handlers for interactive avatars
    - Lazy loading for performance optimization
  - `ProfileIcon.tsx` - Specialized avatar component for chat messages and user profiles:
    - Optimized sizes for chat contexts (xsmall, small, medium, large, xlarge)
    - Consistent fallback pattern matching HomeScreen implementation
    - Gray border (border-2 border-gray-200) for subtle appearance
    - Automatic error handling with opacity reduction on fallback
    - Designed for MessagesPanel and chat message displays
    - Lazy loading for performance in message lists
  - `Snoovatar.tsx` - Advanced avatar component with enhanced features:
    - Built on top of base Avatar component
    - Supports accessories, animations, and custom color schemes
    - Integrates with `useSnoovatar` hook for state management
    - Multiple size options (tiny, small, medium, large, xlarge)
    - Smart fallback system with default snoovatars
    - Loading states and error handling
    - Animated entrance effects
  - `Sidebar.tsx` - Desktop collapsible navigation with Chat, Search, Home, Places
  - `MobileNav.tsx` - Mobile bottom navigation with Home, Chat, Search, Places
  - `TopNav.tsx` - Top header with back button and notification bell
  - `LeftPanel.tsx` - Navigation menu with Home, Messages, Explore, Search, Places, Saved, History, Settings
  - `MessagesPanel.tsx` - Chat session browser with real user avatars (Reddit snoovatars with gradient fallback), chat list, search bar, and "New Message" button
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
- `GET /api/user/avatar` - Returns the user's avatar URL (snoovatar or default) and username
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

---

### Cursor Integration

This template comes with a pre-configured Cursor environment. To get started, [download Cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.

---

## 📝 Summary

**Happening is a real-time chat platform for Reddit**, built on the Devvit platform to bring modern messaging functionality directly into Reddit communities.

**What it does:**
- Provides real-time messaging with instant delivery
- Manages multiple chat conversations with persistent history
- Allows full message control (edit, delete, pagination)
- Displays user avatars with smart fallback system
- Adapts seamlessly between desktop and mobile devices
- Handles offline/online states gracefully with visual feedback

**Key Features:**
- ✅ Real-time message broadcasting using Devvit's realtime API
- ✅ Multiple chat support with participant management
- ✅ Message editing and deletion with authorization checks
- ✅ Persistent message history with automatic pagination (50 messages per page)
- ✅ Smart avatar system with Reddit snoovatars and fallbacks
- ✅ Responsive design (desktop sidebar, mobile bottom nav)
- ✅ Toast notifications for all actions
- ✅ Automatic data retention (90-day messages, 180-day chats)
- ✅ Onboarding flow with consent tracking

**Perfect for:**
- 💬 Reddit communities wanting real-time chat
- 🤝 Direct messaging between Reddit users
- 📢 Live event coordination and discussion
- 🎮 Gaming communities for team coordination
- 📚 Study groups for collaborative learning

**How to use it:**
1. Launch the app in a Reddit post (complete onboarding first time)
2. View your personalized home screen with avatar and welcome message
3. Browse your chats or create a new one
4. Send messages instantly with real-time delivery
5. Edit or delete messages as needed
6. Load older messages by scrolling up
7. Enjoy a modern messaging experience built into Reddit
