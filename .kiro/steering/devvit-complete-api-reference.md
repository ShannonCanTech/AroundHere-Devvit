# Devvit Complete API Reference

**Version**: 0.12.4-dev  
**Last Synced**: 2025-11-19  
**GitHub Commit**: [`80e75f1`](https://github.com/reddit/devvit/commit/80e75f1642065894490d119bcf966ac7afb29da0)  
**Source**: [https://github.com/reddit/devvit](https://github.com/reddit/devvit)

This document provides comprehensive API documentation for Devvit, Reddit's developer platform. It includes all public APIs, types, functions, classes, and event definitions.

> **Note**: This documentation is automatically generated from the official Devvit GitHub repository. For the most up-to-date information, always refer to the [official Devvit documentation](https://developers.reddit.com/docs).

---

## Table of Contents

- [Core Classes](#core-classes)
  - [Devvit](#devvit-class)
  - [RichTextBuilder](#richtextbuilder-class)
- [Functions](#functions)
  - [Hooks](#hooks)
  - [Utility Functions](#utility-functions)
- [Type Aliases](#type-aliases)
  - [Context & API Clients](#context-api-clients)
  - [Event System](#event-system)
  - [Forms & UI](#forms-ui)
  - [Redis Client](#redis-client)
  - [Scheduler & Jobs](#scheduler-jobs)
  - [Utility Types](#utility-types)
- [Enumerations](#enumerations)
- [EventTypes Namespace](#eventtypes-namespace)
- [RedditAPIClient](#redditapiclient)
  - [User Methods](#user-methods)
  - [Post Methods](#post-methods)
  - [Comment Methods](#comment-methods)
  - [Subreddit Methods](#subreddit-methods)
  - [Moderation Methods](#moderation-methods)
  - [Model Classes](#model-classes)
- [Common Patterns](#common-patterns)

---

## Core Classes

### Devvit Class

The main entry point for Devvit applications. Use `Devvit` to configure your app, register handlers, and define capabilities.

```typescript
import Devvit from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
  realtime: true,
});

// Add menu actions
Devvit.addMenuItem({
  label: 'Create Chat Post',
  location: 'subreddit',
  onPress: async (event, context) => {
    // Handler logic
  },
});

// Add custom post type
Devvit.addCustomPostType({
  name: 'Chat Room',
  render: (context) => {
    // Render logic
  },
});

export default Devvit;
```

**Key Methods**:
- `configure(options)` - Configure app capabilities
- `addMenuItem(options)` - Add menu actions
- `addCustomPostType(options)` - Register custom post types
- `addTrigger(options)` - Register event triggers
- `addSchedulerJob(options)` - Register scheduled jobs

### RichTextBuilder Class

Build rich text content for Reddit posts and comments with formatting, links, and more.

```typescript
import { RichTextBuilder } from '@devvit/public-api';

const richText = new RichTextBuilder()
  .heading({ level: 1 }, (h) => h.text('Welcome!'))
  .paragraph((p) => 
    p.text('This is ')
      .bold((b) => b.text('bold text'))
      .text(' and ')
      .italic((i) => i.text('italic text'))
  )
  .link({ url: 'https://reddit.com' }, (l) => l.text('Visit Reddit'))
  .codeBlock({ language: 'typescript' }, (cb) => 
    cb.text('const x = 42;')
  );

await reddit.submitPost({
  subredditName: 'mysubreddit',
  title: 'Rich Text Example',
  richtext: richText,
});
```

**Key Methods**:
- `heading(options, builder)` - Add heading (h1-h6)
- `paragraph(builder)` - Add paragraph
- `text(content)` - Add plain text
- `bold(builder)` - Add bold text
- `italic(builder)` - Add italic text
- `link(options, builder)` - Add hyperlink
- `codeBlock(options, builder)` - Add code block
- `list(options, builder)` - Add ordered/unordered list

---

## Functions

### Hooks

Devvit provides React-style hooks for state management and side effects.

#### useState

Manage component state with automatic re-rendering.

```typescript
import { useState } from '@devvit/public-api';

const [count, setCount] = useState(0);

// Update state
setCount(count + 1);
setCount((prev) => prev + 1);
```

#### useAsync

Execute async operations with loading and error states.

```typescript
import { useAsync } from '@devvit/public-api';

const { data, loading, error } = useAsync(async () => {
  const user = await reddit.getCurrentUser();
  return user;
});

if (loading) return <text>Loading...</text>;
if (error) return <text>Error: {error.message}</text>;
return <text>Hello, {data?.username}</text>;
```

#### useInterval

Execute code at regular intervals.

```typescript
import { useInterval } from '@devvit/public-api';

const [time, setTime] = useState(Date.now());

useInterval(() => {
  setTime(Date.now());
}, 1000); // Update every second
```

#### useChannel

Subscribe to realtime channels for live updates.

```typescript
import { useChannel } from '@devvit/public-api';

const { send, subscribe, unsubscribe } = useChannel({
  name: 'chat_messages',
  onMessage: (msg) => {
    console.log('Received:', msg);
  },
});

// Send message
await send({ text: 'Hello!' });
```

#### useForm

Display and handle form submissions.

```typescript
import { useForm } from '@devvit/public-api';

const form = useForm(
  {
    fields: [
      { name: 'username', label: 'Username', type: 'string' },
      { name: 'age', label: 'Age', type: 'number' },
    ],
    title: 'User Info',
  },
  async (values) => {
    console.log('Submitted:', values);
  }
);

// Show form
context.ui.showForm(form);
```

#### useWebView

Communicate with webview content.

```typescript
import { useWebView } from '@devvit/public-api';

const { postMessage, onMessage } = useWebView();

// Send to webview
postMessage({ type: 'update', data: { count: 42 } });

// Receive from webview
onMessage((msg) => {
  console.log('From webview:', msg);
});
```

### Utility Functions

#### svg

Create SVG elements for custom UI.

```typescript
import { svg } from '@devvit/public-api';

const icon = svg`
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="blue" />
  </svg>
`;
```

#### fetchDevvitWeb

Fetch data from external APIs (server-side only).

```typescript
import { fetchDevvitWeb } from '@devvit/public-api';

const response = await fetchDevvitWeb({
  url: 'https://api.example.com/data',
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' },
});

const data = await response.json();
```

---

## Type Aliases

### Context & API Clients

#### Context

The main context object available in all handlers, providing access to Reddit API, Redis, and more.

```typescript
type Context = {
  userId?: string;
  postId?: string;
  subredditId?: string;
  subredditName?: string;
  reddit: RedditAPIClient;
  redis: RedisClient;
  realtime: RealtimeClient;
  ui: UIClient;
  scheduler: Scheduler;
  settings: SettingsClient;
  media: MediaClient;
};
```

#### BaseContext

Base context available in all execution contexts.

```typescript
type BaseContext = {
  redis: RedisClient;
  settings: SettingsClient;
  scheduler: Scheduler;
};
```

#### TriggerContext

Context available in trigger handlers.

```typescript
type TriggerContext = Context & {
  event: TriggerEvent;
};
```

#### JobContext

Context available in scheduled job handlers.

```typescript
type JobContext = BaseContext & {
  jobId: string;
};
```

### Event System

#### TriggerEvent

Union type of all possible trigger events.

```typescript
type TriggerEvent =
  | PostCreate
  | PostUpdate
  | PostDelete
  | CommentCreate
  | CommentUpdate
  | CommentDelete
  | AppInstall
  | AppUpgrade;
```

#### TriggerEventType

String literal type for event names.

```typescript
type TriggerEventType =
  | 'PostCreate'
  | 'PostUpdate'
  | 'PostDelete'
  | 'CommentCreate'
  | 'CommentUpdate'
  | 'CommentDelete'
  | 'AppInstall'
  | 'AppUpgrade';
```

### Forms & UI

#### Form

Form definition for user input.

```typescript
type Form = {
  fields: FormField[];
  title: string;
  description?: string;
  acceptLabel?: string;
  cancelLabel?: string;
};
```

#### FormField

Union type of all form field types.

```typescript
type FormField =
  | StringField
  | NumberField
  | BooleanField
  | SelectField
  | ParagraphField;
```

#### UIClient

Client for UI operations.

```typescript
type UIClient = {
  showForm: (form: Form) => Promise<FormResponse>;
  showToast: (toast: Toast) => void;
  navigateTo: (url: string) => void;
};
```

### Redis Client

#### RedisClient

Client for Redis operations (sorted sets, hashes, strings).

```typescript
type RedisClient = {
  // Sorted Sets
  zAdd: (key: string, members: ZMember[]) => Promise<number>;
  zRange: (key: string, start: number, stop: number, options?: ZRangeOptions) => Promise<ZMember[]>;
  zRem: (key: string, members: string[]) => Promise<number>;
  zScore: (key: string, member: string) => Promise<number | undefined>;
  zCard: (key: string) => Promise<number>;
  
  // Hashes
  hSet: (key: string, fieldValues: Record<string, string>) => Promise<number>;
  hGet: (key: string, field: string) => Promise<string | undefined>;
  hGetAll: (key: string) => Promise<Record<string, string>>;
  hDel: (key: string, fields: string[]) => Promise<number>;
  
  // Strings
  get: (key: string) => Promise<string | undefined>;
  set: (key: string, value: string, options?: SetOptions) => Promise<void>;
  del: (keys: string[]) => Promise<number>;
  
  // Numbers
  incrBy: (key: string, increment: number) => Promise<number>;
  
  // Transactions
  watch: (keys: string[]) => Promise<void>;
  multi: () => TxClientLike;
  exec: () => Promise<any[]>;
};
```

**Important**: Regular Redis sets (sAdd, sMembers, etc.) are NOT supported. Use sorted sets instead.

### Scheduler & Jobs

#### Scheduler

Client for scheduling background jobs.

```typescript
type Scheduler = {
  runJob: (options: RunJobOptions) => Promise<string>;
  cancelJob: (jobId: string) => Promise<void>;
  listJobs: () => Promise<ScheduledJob[]>;
};
```

#### ScheduledJob

Represents a scheduled job.

```typescript
type ScheduledJob = {
  id: string;
  name: string;
  cron?: string;
  runAt?: Date;
  data?: JSONObject;
};
```

### Utility Types

#### JSONValue

Any valid JSON value.

```typescript
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
```

#### JSONObject

JSON object type.

```typescript
type JSONObject = { [key: string]: JSONValue };
```

#### Metadata

Metadata for posts and comments.

```typescript
type Metadata = {
  [key: string]: string | number | boolean;
};
```

---

## Enumerations

### DeletionReason

Reasons for content deletion.

```typescript
enum DeletionReason {
  DELETED_BY_USER = 0,
  DELETED_BY_MODERATOR = 1,
  DELETED_BY_AUTOMOD = 2,
  DELETED_BY_ADMIN = 3,
}
```

### EventSource

Source of an event.

```typescript
enum EventSource {
  USER = 0,
  MODERATOR = 1,
  ADMIN = 2,
  SYSTEM = 3,
}
```

### SettingScope

Scope for app settings.

```typescript
enum SettingScope {
  INSTALLATION = 'installation',
  APP = 'app',
}
```

---

## EventTypes Namespace

The EventTypes namespace contains all event interface definitions for Devvit triggers.

### Event Interfaces

#### AccountDelete

```typescript
interface AccountDelete {
  deletedAt??: Date;
  user??: UserV2;
  userId: string;
}
```

#### AppInstall

```typescript
interface AppInstall {
  installer??: UserV2;
  subreddit??: SubredditV2;
}
```

#### AppUpgrade

```typescript
interface AppUpgrade {
  installer??: UserV2;
  subreddit??: SubredditV2;
}
```

#### AutomoderatorFilterComment

```typescript
interface AutomoderatorFilterComment {
  author: string;
  comment??: CommentV2;
  reason: string;
  removedAt??: Date;
  subreddit??: SubredditV2;
}
```

#### AutomoderatorFilterPost

```typescript
interface AutomoderatorFilterPost {
  author: string;
  post??: PostV2;
  reason: string;
  removedAt??: Date;
  subreddit??: SubredditV2;
}
```

#### CommentApprove

```typescript
interface CommentApprove {
  approvedAt??: Date;
  author??: UserV2;
  comment??: CommentV2;
  post??: PostV2;
  source: any;
  subreddit??: SubredditV2;
}
```

#### CommentCreate

```typescript
interface CommentCreate {
  author??: UserV2;
  comment??: CommentV2;
  post??: PostV2;
  subreddit??: SubredditV2;
}
```

#### CommentDelete

```typescript
interface CommentDelete {
  author??: UserV2;
  commentId: string;
  createdAt??: Date;
  deletedAt??: Date;
  parentId: string;
  postId: string;
  reason: any;
  source: any;
  subreddit??: SubredditV2;
}
```

#### CommentReport

```typescript
interface CommentReport {
  comment??: CommentV2;
  reason: string;
  subreddit??: SubredditV2;
}
```

#### CommentSubmit

```typescript
interface CommentSubmit {
  author??: UserV2;
  comment??: CommentV2;
  post??: PostV2;
  subreddit??: SubredditV2;
}
```

#### CommentUpdate

```typescript
interface CommentUpdate {
  author??: UserV2;
  comment??: CommentV2;
  post??: PostV2;
  previousBody: string;
  subreddit??: SubredditV2;
}
```

#### PostApprove

```typescript
interface PostApprove {
  approvedAt??: Date;
  author??: UserV2;
  post??: PostV2;
  source: any;
  subreddit??: SubredditV2;
}
```

#### PostCreate

```typescript
interface PostCreate {
  author??: UserV2;
  post??: PostV2;
  subreddit??: SubredditV2;
}
```

#### PostDelete

```typescript
interface PostDelete {
  author??: UserV2;
  createdAt??: Date;
  deletedAt??: Date;
  postId: string;
  reason: any;
  source: any;
  subreddit??: SubredditV2;
}
```

#### PostFlairUpdate

```typescript
interface PostFlairUpdate {
  author??: UserV2;
  post??: PostV2;
  subreddit??: SubredditV2;
}
```

#### PostNsfwUpdate

```typescript
interface PostNsfwUpdate {
  author??: UserV2;
  isNsfw: boolean;
  post??: PostV2;
  subreddit??: SubredditV2;
}
```

#### PostReport

```typescript
interface PostReport {
  post??: PostV2;
  reason: string;
  subreddit??: SubredditV2;
}
```

#### PostSpoilerUpdate

```typescript
interface PostSpoilerUpdate {
  author??: UserV2;
  isSpoiler: boolean;
  post??: PostV2;
  subreddit??: SubredditV2;
}
```

#### PostSubmit

```typescript
interface PostSubmit {
  author??: UserV2;
  post??: PostV2;
  subreddit??: SubredditV2;
}
```

#### PostUpdate

```typescript
interface PostUpdate {
  author??: UserV2;
  post??: PostV2;
  previousBody: string;
  subreddit??: SubredditV2;
}
```

#### SubredditSubscribe

```typescript
interface SubredditSubscribe {
  subreddit??: SubredditV2;
  subscriber??: UserV2;
}
```

#### Vote

```typescript
interface Vote {
  comment??: CommentV2;
  post??: PostV2;
  score: number;
  subreddit??: SubredditV2;
  updatedAt??: Date;
  upvoteRatio: number;
}
```

### Usage Example

```typescript
import Devvit from '@devvit/public-api';

Devvit.addTrigger({
  event: 'PostCreate',
  onEvent: async (event, context) => {
    const { post, author, subreddit } = event;
    console.log(`New post by ${author?.name}: ${post?.title}`);
  },
});
```

---

## RedditAPIClient

The RedditAPIClient provides methods to interact with Reddit's API.

### User Methods

- `approveUser()`
- `banUser()`
- `createUserFlairTemplate()`
- `getApprovedUsers()`
- `getAppUser()`
- `getBannedUsers()`
- `getCommentsAndPostsByUser()`
- `getCommentsByUser()`
- `getCurrentUser()`
- `getCurrentUsername()`
- `getMutedUsers()`
- `getPostsByUser()`
- `getUserById()`
- `getUserByUsername()`
- `getUserFlairTemplates()`
- `getVaultByUserId()`
- `muteUser()`
- `removeUser()`
- `removeUserFlair()`
- `setUserFlair()`
- `setUserFlairBatch()`
- `unbanUser()`
- `unmuteUser()`

### Post Methods

- `createPostFlairTemplate()`
- `crosspost()`
- `getControversialPosts()`
- `getHotPosts()`
- `getNewPosts()`
- `getPostById()`
- `getPostFlairTemplates()`
- `getRisingPosts()`
- `getTopPosts()`
- `removePostFlair()`
- `setPostFlair()`
- `submitPost()`

### Comment Methods

- `getCommentById()`
- `getComments()`
- `getCommentsAndPostsByUser()`
- `getCommentsByUser()`
- `submitComment()`

### Subreddit Methods

- `addSubredditRemovalReason()`
- `getCurrentSubreddit()`
- `getCurrentSubredditName()`
- `getSubredditInfoById()`
- `getSubredditInfoByName()`
- `getSubredditLeaderboard()`
- `getSubredditRemovalReasons()`
- `getSubredditStyles()`
- `sendPrivateMessageAsSubreddit()`
- `subscribeToCurrentSubreddit()`
- `unsubscribeFromCurrentSubreddit()`

### Moderation Methods

- `addModNote()`
- `approve()`
- `approveUser()`
- `deleteModNote()`
- `getApprovedUsers()`
- `getModerationLog()`
- `getModerators()`
- `getModNotes()`
- `getModQueue()`
- `getReports()`
- `getSpam()`
- `getUnmoderated()`
- `inviteModerator()`
- `remove()`
- `removeEditorFromWikiPage()`
- `removeModerator()`
- `removePostFlair()`
- `removeUser()`
- `removeUserFlair()`
- `removeWikiContributor()`
- `report()`
- `revokeModeratorInvite()`
- `setModeratorPermissions()`

### Model Classes

#### User

```typescript
class User {
  id: string;
  username: string;
  
  async getSnoovatarUrl(): Promise<string | undefined>;
  async getPosts(options?: ListingOptions): Promise<Listing<Post>>;
  async getComments(options?: ListingOptions): Promise<Listing<Comment>>;
}
```

#### Post

```typescript
class Post {
  id: string;
  title: string;
  authorId: string;
  subredditId: string;
  
  async addComment(text: string): Promise<Comment>;
  async approve(): Promise<void>;
  async remove(): Promise<void>;
  async lock(): Promise<void>;
  async unlock(): Promise<void>;
}
```

#### Comment

```typescript
class Comment {
  id: string;
  body: string;
  authorId: string;
  postId: string;
  
  async reply(text: string): Promise<Comment>;
  async approve(): Promise<void>;
  async remove(): Promise<void>;
  async lock(): Promise<void>;
}
```

#### Subreddit

```typescript
class Subreddit {
  id: string;
  name: string;
  
  async submitPost(options: SubmitPostOptions): Promise<Post>;
  async getHotPosts(options?: ListingOptions): Promise<Listing<Post>>;
  async getNewPosts(options?: ListingOptions): Promise<Listing<Post>>;
  async getModQueue(options?: ModLogOptions): Promise<Listing<Post | Comment>>;
}
```

---

## Common Patterns

### Authentication

Always use `context.userId` for authentication, not `reddit.getCurrentUserId()`.

```typescript
const { userId } = context;

if (!userId) {
  return <text>Please log in</text>;
}

const username = await reddit.getCurrentUsername();
```

### Redis Usage

Use sorted sets instead of regular sets (which are not supported).

```typescript
// ❌ WRONG - Regular sets not supported
await redis.sAdd('users', ['user1']);

// ✅ CORRECT - Use sorted sets
await redis.zAdd('users', { member: 'user1', score: Date.now() });

// Get all members
const members = await redis.zRange('users', 0, -1);
const usernames = members.map(m => m.member);

// Check membership
const score = await redis.zScore('users', 'user1');
const exists = score !== undefined;
```

### Event Handling

Register event triggers to respond to Reddit events.

```typescript
Devvit.addTrigger({
  event: 'PostCreate',
  onEvent: async (event, context) => {
    const { post, author } = event;
    
    // Auto-reply to new posts
    if (post) {
      await post.addComment('Welcome! Thanks for posting.');
    }
  },
});
```

### Form Handling

Create and handle forms for user input.

```typescript
const form = useForm(
  {
    fields: [
      {
        name: 'message',
        label: 'Message',
        type: 'paragraph',
        required: true,
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
    title: 'Send Message',
  },
  async (values) => {
    // Handle submission
    await redis.hSet(`message:${Date.now()}`, {
      text: values.message,
      priority: values.priority,
    });
    
    context.ui.showToast('Message sent!');
  }
);

context.ui.showForm(form);
```

### Realtime Channels

Use realtime channels for live updates. Channel names must use underscores, not hyphens.

```typescript
// ❌ WRONG - Hyphens not allowed
await realtime.send('chat-messages', data);

// ✅ CORRECT - Use underscores
await realtime.send('chat_messages', data);

// Subscribe to channel
const { send, subscribe } = useChannel({
  name: 'chat_messages',
  onMessage: (msg) => {
    console.log('New message:', msg);
  },
});

// Send message
await send({ text: 'Hello!', userId: context.userId });
```

### Caching with Redis

Cache expensive operations to improve performance.

```typescript
async function getCachedData(key: string, fetcher: () => Promise<string>) {
  // Check cache
  const cached = await redis.get(key);
  if (cached) return cached;
  
  // Fetch and cache
  const data = await fetcher();
  await redis.set(key, data, { expiration: 3600 }); // 1 hour
  
  return data;
}

// Usage
const avatarUrl = await getCachedData(
  `avatar:${username}`,
  () => reddit.getSnoovatarUrl(username)
);
```
