---
inclusion: always
---

# Devvit API Reference - Quick Guide

This document supplements the Devvit MCP server documentation with commonly used API methods and patterns that aren't easily searchable through the MCP tool.

**Version**: 0.12.4-dev  
**Source**: https://github.com/reddit/devvit (Official Devvit GitHub Repository)  
**Last Synced**: 2025-11-18

> **Note**: This file is maintained through the "Sync Devvit Documentation" agent hook. Run it periodically to keep this reference current with the latest Devvit API changes.

---

## RedditAPIClient Methods

### User Methods

#### `getSnoovatarUrl(username: string): Promise<string | undefined>`
Get the snoovatar URL for a given username.

```typescript
const avatarUrl = await reddit.getSnoovatarUrl('username');
if (avatarUrl) {
  console.log('Avatar URL:', avatarUrl);
} else {
  // User has no snoovatar - use default
  const defaultAvatar = `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${hash % 8}.png`;
}
```

**Default Snoovatar URLs**: When users don't have custom snoovatars:
```
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${no}.png
```
Where `${no}` is 0-7 (8 different default avatars)

#### `getUserByUsername(username: string): Promise<User | undefined>`
Gets a User object by username.

```typescript
const user = await reddit.getUserByUsername('devvit');
if (user) {
  const avatarUrl = await user.getSnoovatarUrl();
}
```

#### `getUserById(id: string): Promise<User | undefined>`
Gets a User object by ID (starting with t2_).

```typescript
const user = await reddit.getUserById('t2_1qjpg');
```

#### `getCurrentUser(): Promise<User | undefined>`
Get the current calling user. Returns undefined for logged-out custom post renders.

```typescript
const user = await reddit.getCurrentUser();
```

#### `getCurrentUsername(): Promise<string | undefined>`
Get the current calling user's username.

```typescript
const username = await reddit.getCurrentUsername();
```

---

### User Object Methods

#### `user.getSnoovatarUrl(): Promise<string | undefined>`
Get the snoovatar URL for this user.

```typescript
const user = await reddit.getUserByUsername('username');
const avatarUrl = await user.getSnoovatarUrl();
```

**Returns**: URL string or undefined if no snoovatar is set.

---

### Moderation Methods

#### `getSpam(options?: ModLogOptions<'all'>): Listing<Post | Comment>`
Return a listing of things marked as spam or otherwise removed.

**Overloads**:
```typescript
getSpam(options: ModLogOptions<'comment'>): Listing<Comment>
getSpam(options: ModLogOptions<'post'>): Listing<Post>
getSpam(options?: ModLogOptions<'all'>): Listing<Post | Comment>
```

**Usage**:
```typescript
const subreddit = await reddit.getSubredditByName('mysubreddit');

// Get all spam (posts and comments)
const allSpam = await subreddit.getSpam().all();

// Get only spam posts
const spamPosts = await subreddit.getSpam({ type: 'post' }).all();

// Get only spam comments
const spamComments = await subreddit.getSpam({ type: 'comment' }).all();
```

#### `getModQueue(options?: ModLogOptions<'all'>): Listing<Post | Comment>`
Return a listing of things requiring moderator review (reported items).

```typescript
const modQueue = await subreddit.getModQueue().all();
const postQueue = await subreddit.getModQueue({ type: 'post' }).all();
```

#### `getReports(options?: ModLogOptions<'all'>): Listing<Post | Comment>`
Return a listing of things that have been reported.

```typescript
const reports = await subreddit.getReports().all();
```

#### `getUnmoderated(options?: ModLogOptions<'all'>): Listing<Post | Comment>`
Return a listing of things that have yet to be approved/removed by a mod.

```typescript
const unmoderated = await subreddit.getUnmoderated().all();
```

#### `getEdited(options?: ModLogOptions<'all'>): Listing<Post | Comment>`
Return a listing of things that have been edited recently.

```typescript
const edited = await subreddit.getEdited().all();
```

---

### Post Methods

#### `getPostById(id: string): Promise<Post>`
Gets a Post object by ID (starting with t3_).

```typescript
const post = await reddit.getPostById('t3_123456');
```

#### `submitPost(options: SubmitPostOptions): Promise<Post>`
Submits a new post to a subreddit.

```typescript
const post = await reddit.submitPost({
  subredditName: 'devvit',
  title: 'Hello World',
  text: 'This is a text post',
});
```

---

### Comment Methods

#### `getCommentById(id: string): Promise<Comment>`
Get a Comment object by ID (starting with t1_).

```typescript
const comment = await reddit.getCommentById('t1_1qjpg');
```

#### `submitComment(options: CommentSubmissionOptions): Promise<Comment>`
Submit a new comment to a post or comment.

```typescript
const comment = await reddit.submitComment({
  id: 't3_123456', // Post or comment ID
  text: 'Hello world!',
});
```

---

### Subreddit Methods

#### `getSubredditByName(name: string): Promise<Subreddit>`
Gets a Subreddit object by name (deprecated - use getSubredditInfoByName instead).

```typescript
const subreddit = await reddit.getSubredditByName('askReddit');
```

#### `getCurrentSubreddit(): Promise<Subreddit>`
Retrieves the current subreddit.

```typescript
const currentSubreddit = await reddit.getCurrentSubreddit();
```

---

## Context Object

### Available Properties

```typescript
const { userId, postId, subredditName, subredditId } = context;
```

**Important**: Use `context.userId` NOT `reddit.getCurrentUserId()` (which doesn't exist).

---

## Redis Limitations

### ❌ Regular Sets NOT Supported

These commands will fail at runtime:
- `redis.sAdd()`
- `redis.sRem()`
- `redis.sMembers()`
- `redis.sIsMember()`
- `redis.sCard()`

### ✅ Use Sorted Sets Instead

```typescript
// Adding items
await redis.zAdd('user:123:items', { 
  member: 'item1', 
  score: Date.now() 
});

// Removing items
await redis.zRem('user:123:items', ['item1']);

// Getting all items
const result = await redis.zRange('user:123:items', 0, -1);
const items = result.map(item => item.member);

// Checking membership
const score = await redis.zScore('user:123:items', 'item1');
const exists = score !== undefined;

// Getting count
const count = await redis.zCard('user:123:items');
```

---

## Realtime Channel Naming

**Rule**: Channel names may only contain **letters, numbers, and underscores**.

```typescript
// ❌ WRONG - Hyphens not allowed
await realtime.send('chat-messages', data);

// ✅ CORRECT - Use underscores
await realtime.send('chat_messages', data);
```

---

## Common Patterns

### Getting User Avatar with Fallback

```typescript
async function getUserAvatarUrl(username: string): Promise<string> {
  const user = await reddit.getUserByUsername(username);
  
  if (!user) {
    return getDefaultAvatar(username);
  }
  
  const snoovatarUrl = await user.getSnoovatarUrl();
  
  if (snoovatarUrl) {
    return snoovatarUrl;
  }
  
  // Fallback to default avatar
  return getDefaultAvatar(username);
}

function getDefaultAvatar(username: string): string {
  // Generate consistent hash from username
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const avatarNumber = hash % 8; // 0-7
  
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
}
```

### Caching Avatar URLs

```typescript
import { redis } from '@devvit/web/server';

async function getCachedAvatarUrl(username: string): Promise<string> {
  const cacheKey = `avatar:${username}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return cached;
  
  // Fetch from Reddit
  const avatarUrl = await getUserAvatarUrl(username);
  
  // Cache for 1 hour (3600 seconds)
  await redis.set(cacheKey, avatarUrl, { expiration: 3600 });
  
  return avatarUrl;
}
```

---

## Type Definitions

### ModLogOptions

```typescript
type ModLogOptions<T extends 'comment' | 'post' | 'all'> = {
  type: T;
  // Additional pagination options
  limit?: number;
  pageSize?: number;
  after?: string;
  before?: string;
};
```

---

## Additional Resources

- **GitHub Repo**: https://github.com/reddit/devvit
- **API Reference**: https://github.com/reddit/devvit/tree/main/devvit-docs/docs/api
- **RedditAPIClient**: https://github.com/reddit/devvit/blob/main/devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md
- **User Model**: https://github.com/reddit/devvit/blob/main/packages/public-api/src/apis/reddit/models/User.ts
- **Subreddit Model**: https://github.com/reddit/devvit/blob/main/packages/public-api/src/apis/reddit/models/Subreddit.ts

---

**Last Updated**: Based on Devvit v0.12.4 API
