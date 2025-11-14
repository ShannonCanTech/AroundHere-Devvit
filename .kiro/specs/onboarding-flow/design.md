# Design Document

## Overview

The onboarding flow transforms the chat application from a direct-entry experience into a guided user journey. New users first encounter a welcome screen that introduces the app and its features, followed by a terms acceptance screen where they must agree to the Privacy Policy and Terms & Conditions. Once consent is recorded, users proceed to the full chat interface. Returning users bypass onboarding entirely and go straight to chat.

This design leverages Devvit 0.12.2's new inline webview capabilities with multiple entry points, allowing for distinct HTML files for each stage of the user journey. User consent is tracked server-side in Redis, ensuring persistence across sessions and devices while maintaining privacy and security.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Entry Point Router                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   welcome    │  │    terms     │  │     home     │      │
│  │  (inline)    │  │  (inline)    │  │  (expanded)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WelcomeScreen.tsx                                   │   │
│  │  - App introduction                                  │   │
│  │  - Key features highlight                            │   │
│  │  - "Get Started" CTA                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TermsScreen.tsx                                     │   │
│  │  - Terms acceptance UI                               │   │
│  │  - Privacy Policy link → Overlay                     │   │
│  │  - Terms & Conditions link → Overlay                 │   │
│  │  - "I Agree" CTA                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Existing Home Screen                                │   │
│  │  - Main app interface with navigation                │   │
│  │  - Access to all screens (chat, explore, etc.)       │   │
│  │  - No modifications needed                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                    Fetch API Calls
                             │
┌─────────────────────────────────────────────────────────────┐
│                    Server Layer (Express)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Consent API Endpoints                               │   │
│  │  - GET  /api/consent/check                           │   │
│  │  - POST /api/consent/accept                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Post Creation Logic                                 │   │
│  │  - Updated to use "welcome" entry by default         │   │
│  │  - Maintains backward compatibility                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer (Redis)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Consent Storage                                     │   │
│  │  Key: user:{userId}:consent                          │   │
│  │  Fields: accepted, timestamp, termsVersion           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### User Flow Diagram

```
┌─────────────┐
│ User views  │
│  app post   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Check consent   │◄─── Server: GET /api/consent/check
│   in Redis      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Exists    Not Found
    │         │
    │         ▼
    │    ┌──────────────┐
    │    │ Show Welcome │ (inline mode)
    │    │   Screen     │
    │    └──────┬───────┘
    │           │
    │           ▼ User clicks "Get Started"
    │    ┌──────────────┐
    │    │  Show Terms  │ (inline mode)
    │    │   Screen     │
    │    └──────┬───────┘
    │           │
    │           ├─► User clicks Privacy Policy → Show overlay
    │           ├─► User clicks Terms → Show overlay
    │           │
    │           ▼ User clicks "I Agree"
    │    ┌──────────────┐
    │    │ Store consent│◄─── Server: POST /api/consent/accept
    │    │   in Redis   │
    │    └──────┬───────┘
    │           │
    └───────────┴───────┐
                        │
                        ▼
                 ┌──────────────┐
                 │  Enter Home  │ (expanded mode)
                 │    Screen    │
                 └──────────────┘
```

## Components and Interfaces

### Client Components

#### 1. WelcomeScreen Component (New)

**Purpose**: First screen users see, introduces the app and its features

**Location**: `src/client/screens/WelcomeScreen.tsx`

**Props**: None (standalone entry point)

**State Management**:
```typescript
const [isLoading, setIsLoading] = useState(false);
```

**UI Elements**:
- App logo/icon (large, centered)
- App name and tagline
- 3-4 feature highlights with icons:
  - "Real-time messaging"
  - "Create multiple chats"
  - "Edit and delete messages"
  - "Persistent message history"
- Prominent "Get Started" button
- Engaging background gradient or pattern

**Behavior**:
- Loads in inline mode (fits within post unit)
- On "Get Started" click:
  - Navigate to terms.html using window.location
  - Show loading state during transition

**Styling Considerations**:
- Mobile-first design (most Reddit users on mobile)
- High contrast for readability in feed
- Engaging visuals to stand out
- Fast load time (<1 second)

#### 2. TermsScreen Component (New)

**Purpose**: Display terms acceptance UI with links to policy documents

**Location**: `src/client/screens/TermsScreen.tsx`

**Props**: None (standalone entry point)

**State Management**:
```typescript
const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
const [showTermsConditions, setShowTermsConditions] = useState(false);
const [isAccepting, setIsAccepting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**UI Elements**:
- Header: "Before You Continue"
- Explanatory text: "By using this app, you agree to our Privacy Policy and Terms & Conditions"
- Hyperlinked text for "Privacy Policy" and "Terms & Conditions"
- Prominent "I Agree" button
- Optional "Back" button to return to welcome

**Overlay Component**:
```typescript
type OverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
};
```

**Behavior**:
- Loads in inline mode
- On Privacy Policy click:
  - Show overlay with privacy policy content
  - Overlay is scrollable
  - Close button dismisses overlay
- On Terms & Conditions click:
  - Show overlay with terms content
  - Same overlay behavior
- On "I Agree" click:
  - Call POST /api/consent/accept
  - Show loading state
  - On success: Use requestExpandedMode to enter chat
  - On error: Display error message

#### 3. PolicyOverlay Component (New)

**Purpose**: Reusable overlay for displaying policy documents

**Location**: `src/client/components/PolicyOverlay.tsx`

**Props**:
```typescript
type PolicyOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
};
```

**UI Elements**:
- Semi-transparent backdrop
- White content card (centered, max-width)
- Close button (X icon, top-right)
- Scrollable content area
- Title at top

**Behavior**:
- Renders as portal (above all content)
- Clicking backdrop closes overlay
- Pressing Escape key closes overlay
- Prevents body scroll when open

#### 4. HTML Entry Points (New)

**welcome.html**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/welcome.tsx"></script>
  </body>
</html>
```

**terms.html**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Terms & Conditions</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/terms.tsx"></script>
  </body>
</html>
```

**welcome.tsx** (entry point):
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import WelcomeScreen from './screens/WelcomeScreen';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WelcomeScreen />
  </React.StrictMode>
);
```

**terms.tsx** (entry point):
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import TermsScreen from './screens/TermsScreen';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TermsScreen />
  </React.StrictMode>
);
```

### Server Components

#### 1. Consent Management Module (New)

**Purpose**: Business logic for consent tracking

**Location**: `src/server/core/consent.ts`

**Functions**:
```typescript
// Check if user has accepted terms
async function checkConsent(userId: string): Promise<ConsentStatus | null>

// Record user consent
async function recordConsent(
  userId: string,
  termsVersion: string
): Promise<ConsentStatus>

// Get current terms version
function getCurrentTermsVersion(): string
```

**Types**:
```typescript
type ConsentStatus = {
  accepted: boolean;
  timestamp: number;
  termsVersion: string;
};
```

#### 2. Redis Consent Storage (New)

**Purpose**: Redis operations for consent data

**Location**: `src/server/core/redis/consent.ts`

**Functions**:
```typescript
// Store consent in Redis
async function setConsent(
  redis: RedisClient,
  userId: string,
  consent: ConsentStatus
): Promise<void>

// Retrieve consent from Redis
async function getConsent(
  redis: RedisClient,
  userId: string
): Promise<ConsentStatus | null>

// Check if consent exists
async function hasConsent(
  redis: RedisClient,
  userId: string
): Promise<boolean>
```

### API Endpoints

#### Consent Endpoints (New)

**GET /api/consent/check**
- Checks if authenticated user has accepted terms
- Request: None (user from context)
- Response: `{ hasConsent: boolean, consent?: ConsentStatus }`
- Status codes:
  - 200: Success
  - 401: Unauthorized (no user context)
  - 500: Server error

**POST /api/consent/accept**
- Records user's acceptance of terms
- Request: `{ termsVersion?: string }` (optional, defaults to current)
- Response: `{ success: boolean, consent: ConsentStatus }`
- Status codes:
  - 200: Success
  - 400: Bad request (invalid data)
  - 401: Unauthorized (no user context)
  - 500: Server error

#### Updated Post Creation

**POST /internal/menu/post-create** (Modified)
- Update to use "welcome" entry point by default
- Existing functionality preserved
- Response includes post URL for navigation

## Data Models

### Redis Schema

#### Consent Data
```
Key: user:{userId}:consent
Type: Hash
Fields:
  - accepted: string ("true" | "false")
  - timestamp: string (number as string)
  - termsVersion: string (e.g., "1.0")

Example:
user:t2_abc123:consent -> {
  accepted: "true",
  timestamp: "1699900000000",
  termsVersion: "1.0"
}
```

### TypeScript Types

#### Shared Types (`src/shared/types/consent.ts`) (New)

```typescript
export type ConsentStatus = {
  accepted: boolean;
  timestamp: number;
  termsVersion: string;
};

export type CheckConsentResponse = {
  hasConsent: boolean;
  consent?: ConsentStatus;
};

export type AcceptConsentRequest = {
  termsVersion?: string;
};

export type AcceptConsentResponse = {
  success: boolean;
  consent: ConsentStatus;
};
```

## Configuration Updates

### devvit.json Updates

```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "happening-app",
  "post": {
    "dir": "dist/client",
    "entrypoints": {
      "welcome": {
        "entry": "welcome.html",
        "height": "regular",
        "inline": true
      },
      "terms": {
        "entry": "terms.html",
        "height": "regular",
        "inline": true
      },
      "home": {
        "entry": "index.html"
      }
    }
  },
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "media": {
    "dir": "assets"
  },
  "menu": {
    "items": [
      {
        "label": "Create a new post",
        "description": "happening-app",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/post-create"
      }
    ]
  },
  "triggers": {
    "onAppInstall": "/internal/on-app-install"
  },
  "dev": {
    "subreddit": "happening_app_dev"
  }
}
```

### vite.config.ts Updates

```typescript
import { defineConfig } from 'vite';
import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwind()],
  build: {
    outDir: '../../dist/client',
    sourcemap: true,
    rollupOptions: {
      input: {
        welcome: resolve(dirname(fileURLToPath(import.meta.url)), 'welcome.html'),
        terms: resolve(dirname(fileURLToPath(import.meta.url)), 'terms.html'),
        home: resolve(dirname(fileURLToPath(import.meta.url)), 'index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        sourcemapFileNames: '[name].js.map',
      },
    },
  },
});
```

### package.json Updates

```json
{
  "dependencies": {
    "@devvit/web": "^0.12.2",
    // ... other dependencies remain unchanged
  }
}
```

## Navigation Flow

### Entry Point Selection Logic

**On Post View**:
1. App loads with entry point specified in post data
2. If no entry point specified, uses "welcome" (default)
3. Client checks consent status via API
4. If consent exists, navigate to home entry point (main app interface)
5. If no consent, stay on welcome/terms flow

**Navigation Between Entry Points**:

**Welcome → Terms**:
```typescript
// In WelcomeScreen.tsx
const handleGetStarted = () => {
  window.location.href = '/terms.html';
};
```

**Terms → Home**:
```typescript
// In TermsScreen.tsx
import { requestExpandedMode } from '@devvit/web/client';

const handleAccept = async (event: React.MouseEvent) => {
  setIsAccepting(true);
  
  try {
    // Record consent
    const response = await fetch('/api/consent/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termsVersion: '1.0' }),
    });
    
    if (!response.ok) throw new Error('Failed to record consent');
    
    // Enter expanded mode with home entry point (main app interface)
    await requestExpandedMode(event.nativeEvent, 'home');
  } catch (error) {
    setError('Failed to accept terms. Please try again.');
  } finally {
    setIsAccepting(false);
  }
};
```

## Error Handling

### Client-Side Error Handling

**Network Errors**:
- Display toast notification for failed API calls
- Provide retry button
- Show user-friendly error messages

**Navigation Errors**:
- Catch requestExpandedMode failures
- Fall back to window.location navigation
- Log errors for debugging

**Validation Errors**:
- Prevent navigation without consent
- Disable buttons during loading states
- Show inline error messages

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

**Redis Errors**:
```typescript
try {
  await redis.hSet(key, data);
} catch (error) {
  console.error('Redis error:', error);
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'Failed to store consent'
  });
}
```

**Invalid Data Errors**:
```typescript
if (!termsVersion || typeof termsVersion !== 'string') {
  return res.status(400).json({
    error: 'Bad Request',
    message: 'Invalid terms version'
  });
}
```

## Content Strategy

### Privacy Policy Content

**Sections to Include**:
1. Introduction
2. Data Collection
   - User ID (Reddit username)
   - Message content
   - Timestamps
3. Data Usage
   - Providing chat functionality
   - Message persistence
4. Data Storage
   - Redis database
   - 90-day message retention
   - 180-day chat retention
5. Data Sharing
   - No third-party sharing
   - Reddit platform integration
6. User Rights
   - Message deletion
   - Account deletion
7. Contact Information

### Terms & Conditions Content

**Sections to Include**:
1. Acceptance of Terms
2. Description of Service
3. User Responsibilities
   - Appropriate content
   - No abuse or harassment
   - Compliance with Reddit rules
4. Prohibited Activities
5. Content Ownership
6. Limitation of Liability
7. Changes to Terms
8. Termination
9. Governing Law

## Testing Strategy

### Unit Tests

**Server-Side Tests** (`src/server/core/consent.test.ts`):
- Consent recording
- Consent retrieval
- Terms version handling
- Error scenarios

**Example Test Cases**:
```typescript
describe('Consent Management', () => {
  test('records user consent', async () => {
    const consent = await recordConsent('user123', '1.0');
    expect(consent.accepted).toBe(true);
    expect(consent.termsVersion).toBe('1.0');
  });
  
  test('retrieves existing consent', async () => {
    await recordConsent('user123', '1.0');
    const consent = await checkConsent('user123');
    expect(consent).not.toBeNull();
    expect(consent?.accepted).toBe(true);
  });
  
  test('returns null for non-existent consent', async () => {
    const consent = await checkConsent('user456');
    expect(consent).toBeNull();
  });
});
```

### Integration Tests

**API Endpoint Tests**:
- Full request/response cycle
- Authentication validation
- Error response validation

**Example Test Cases**:
```typescript
describe('GET /api/consent/check', () => {
  test('returns consent status for authenticated user', async () => {
    const response = await request(app)
      .get('/api/consent/check')
      .expect(200);
    
    expect(response.body.hasConsent).toBeDefined();
  });
  
  test('returns 401 for unauthenticated user', async () => {
    await request(app)
      .get('/api/consent/check')
      .expect(401);
  });
});

describe('POST /api/consent/accept', () => {
  test('records consent successfully', async () => {
    const response = await request(app)
      .post('/api/consent/accept')
      .send({ termsVersion: '1.0' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.consent.accepted).toBe(true);
  });
});
```

### Manual Testing

**Devvit Playtest Environment**:
- Test with `npm run dev` and playtest URL
- Verify inline mode display in feed
- Test navigation flow (welcome → terms → chat)
- Test overlay functionality
- Verify consent persistence across sessions
- Test with multiple users
- Verify mobile responsive behavior

**Test Scenarios**:
1. New user flow (no consent)
   - View post → See welcome screen
   - Click "Get Started" → See terms screen
   - Click Privacy Policy → See overlay
   - Close overlay → Return to terms
   - Click "I Agree" → Enter home screen (main app)
2. Returning user flow (has consent)
   - View post → Directly enter home screen (main app)
3. Error scenarios
   - Network failure during consent recording
   - Invalid terms version
   - Unauthorized access
4. Mobile testing
   - Verify inline mode fits in post unit
   - Test touch interactions
   - Verify overlay on small screens

## Migration Strategy

### Phase 1: Update Dependencies and Configuration
1. Update package.json to Devvit 0.12.2
2. Update devvit.json with new entrypoints configuration
3. Update vite.config.ts with multiple HTML inputs
4. Run `npm install` and verify build

### Phase 2: Create Onboarding Components
1. Create WelcomeScreen component
2. Create TermsScreen component
3. Create PolicyOverlay component
4. Create welcome.html and terms.html entry points
5. Create welcome.tsx and terms.tsx entry scripts

### Phase 3: Implement Server-Side Consent Tracking
1. Create consent management module
2. Create Redis consent storage functions
3. Add consent API endpoints
4. Add consent types to shared types

### Phase 4: Update Post Creation
1. Modify post creation to use "welcome" entry by default
2. Test post creation with new entry point
3. Verify backward compatibility with existing posts

### Phase 5: Testing and Refinement
1. Test complete onboarding flow
2. Test consent persistence
3. Test error scenarios
4. Refine UI/UX based on testing
5. Add content for Privacy Policy and Terms & Conditions

### Phase 6: Deployment
1. Deploy to test subreddit
2. Verify functionality in production environment
3. Monitor for errors
4. Deploy to production subreddits

## Future Enhancements

### Terms Version Management
- Track terms version changes
- Prompt users to re-accept when terms update
- Show "What's Changed" summary

### Analytics
- Track onboarding completion rate
- Monitor drop-off points
- A/B test different welcome screen designs

### Personalization
- Customize welcome message based on subreddit
- Show subreddit-specific features
- Localization for different languages

### Enhanced Consent Management
- Allow users to view accepted terms
- Provide consent withdrawal option
- Export user data on request
