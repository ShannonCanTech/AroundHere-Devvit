# Avatar Access in Devvit - Complete Guide

**Last Updated**: 2025-11-19  
**Devvit Version**: 0.12.4-dev

## Summary

Based on your research and the Devvit documentation, here's what we know about accessing user avatars in Devvit:

## Available Avatar Access Methods

### 1. Event Payload Properties (UserV2)

User objects in **event payloads only** have these avatar properties:

- `iconImage` - string (profile icon URL)
- `snoovatarImage` - string (complete rendered snoovatar URL)

These properties are **ONLY available in event triggers**, not through direct API calls like `reddit.getUserByUsername()`.

### 2. RedditAPIClient Method

The `User` model has one method for avatars:

```typescript
const user = await reddit.getUserByUsername('username');
const avatarUrl = await user.getSnoovatarUrl();
```

This returns a complete rendered snoovatar image URL (or undefined if no snoovatar is set).

### 3. Default Avatars

When users don't have custom snoovatars, Reddit provides default avatars:

```
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${no}.png
```

Where `${no}` is 0-7 (8 different default avatars).

## Complete List of Event Triggers

All events that provide UserV2 objects with `iconImage` and `snoovatarImage`:

### Post Events (author property)
1. **PostCreate** - When a post is created
2. **PostSubmit** - When a post is submitted
3. **PostUpdate** - When a post is edited
4. **PostDelete** - When a post is deleted (has author)
5. **PostApprove** - When a post is approved by a moderator
6. **PostFlairUpdate** - When post flair is updated
7. **PostNsfwUpdate** - When post NSFW status changes
8. **PostSpoilerUpdate** - When post spoiler status changes

### Comment Events (author property)
9. **CommentCreate** - When a comment is created
10. **CommentSubmit** - When a comment is submitted
11. **CommentUpdate** - When a comment is edited
12. **CommentDelete** - When a comment is deleted (has author)
13. **CommentApprove** - When a comment is approved by a moderator

### App Events (installer property)
14. **AppInstall** - When your app is installed (installer UserV2)
15. **AppUpgrade** - When your app is upgraded (installer UserV2)

### Subreddit Events (subscriber property)
16. **SubredditSubscribe** - When a user subscribes (subscriber UserV2)

### Account Events (user property)
17. **AccountDelete** - When a user account is deleted (user UserV2)

### Moderation Events
18. **AutomoderatorFilterPost** - When automod filters a post (author as string, not UserV2)
19. **AutomoderatorFilterComment** - When automod filters a comment (author as string, not UserV2)
20. **CommentReport** - When a comment is reported (no author)
21. **PostReport** - When a post is reported (no author)
22. **Vote** - When a vote is cast (no author)

## Events That Provide Avatar Data

**Events with full UserV2 objects** (iconImage + snoovatarImage available):

- PostCreate, PostSubmit, PostUpdate, PostDelete, PostApprove, PostFlairUpdate, PostNsfwUpdate, PostSpoilerUpdate
- CommentCreate, CommentSubmit, CommentUpdate, CommentDelete, CommentApprove
- AppInstall, AppUpgrade (installer property)
- SubredditSubscribe (subscriber property)
- AccountDelete (user property)

**Total: 17 events** provide access to `iconImage` and `snoovatarImage`.

## Recommended Strategy for Chat App

### Option 1: Event-Based Avatar Caching

Capture avatar URLs from events and store in Redis:

```typescript
// In server/index.ts - Add trigger handlers
Devvit.addTrigger({
  events: ['PostCreate', 'PostSubmit', 'CommentCreate', 'CommentSubmit'],
  onEvent: async (event, context) => {
    const { author } = event;
    
    if (author && author.snoovatarImage) {
      // Cache the snoovatar URL
      await context.redis.set(
        `avatar:${author.name}`,
        author.snoovatarImage,
        { expiration: 86400 } // 24 hours
      );
    }
    
    if (author && author.iconImage) {
      // Cache the icon URL
      await context.redis.set(
        `icon:${author.name}`,
        author.iconImage,
        { expiration: 86400 }
      );
    }
  },
});
```

**Pros**:
- Access to both `iconImage` and `snoovatarImage`
- Automatic caching as users interact
- No additional API calls needed

**Cons**:
- Only works for users who have triggered events
- New users won't have cached avatars initially
- Requires event triggers to be set up

### Option 2: API Method with Fallback

Use `getSnoovatarUrl()` with default avatar fallback:

```typescript
async function getUserAvatar(username: string): Promise<string> {
  // Try to get from cache first
  const cached = await redis.get(`avatar:${username}`);
  if (cached) return cached;
  
  // Try to get from Reddit API
  const user = await reddit.getUserByUsername(username);
  if (user) {
    const snoovatarUrl = await user.getSnoovatarUrl();
    if (snoovatarUrl) {
      // Cache it
      await redis.set(`avatar:${username}`, snoovatarUrl, { expiration: 3600 });
      return snoovatarUrl;
    }
  }
  
  // Fallback to default avatar
  return getDefaultAvatar(username);
}

function getDefaultAvatar(username: string): string {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarNumber = hash % 8;
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
}
```

**Pros**:
- Works for any user immediately
- Simple implementation
- Reliable fallback

**Cons**:
- Only provides `snoovatarImage`, not `iconImage`
- Requires API call for each new user
- May not have access to profile icons

### Option 3: Hybrid Approach (Recommended)

Combine both methods:

1. Set up event triggers to cache avatar data
2. Use API method as fallback for uncached users
3. Store default avatar as asset for offline fallback

```typescript
async function getUserAvatar(username: string): Promise<string> {
  // 1. Check Redis cache (from events)
  const cached = await redis.get(`avatar:${username}`);
  if (cached) return cached;
  
  // 2. Try API method
  try {
    const user = await reddit.getUserByUsername(username);
    if (user) {
      const snoovatarUrl = await user.getSnoovatarUrl();
      if (snoovatarUrl) {
        await redis.set(`avatar:${username}`, snoovatarUrl, { expiration: 3600 });
        return snoovatarUrl;
      }
    }
  } catch (error) {
    console.error('Failed to fetch avatar:', error);
  }
  
  // 3. Fallback to default
  return '/assets/default-avatar.png'; // Your uploaded default
}
```

## Default Avatar Strategy

You have multiple options for default avatars:

### Option 1: Your Custom Default (Recommended for Branding)
Place your `default-snoo.png` in:
```
src/client/public/default-snoo.png
```

Then reference it as `/default-snoo.png` in your client code. When uploaded to Reddit, it will be hosted at:
```
https://preview.redd.it/[your-app]/default-snoo.png
```

### Option 2: Reddit's Default Avatars (Consistent with Reddit)
Use Reddit's built-in defaults with a hash function:
```typescript
function getRedditDefaultAvatar(username: string): string {
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const avatarNumber = hash % 8; // 0-7
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
}
```

### Option 3: Hybrid Approach
Use your custom default for new/unknown users, and Reddit's defaults for users confirmed to have no snoovatar:
```typescript
async function getUserAvatar(username: string): Promise<string> {
  // Try to get custom snoovatar (i.redd.it)
  const user = await reddit.getUserByUsername(username);
  const snoovatarUrl = await user?.getSnoovatarUrl();
  
  if (snoovatarUrl) {
    return snoovatarUrl; // Custom snoovatar
  }
  
  // User has no custom snoovatar - use Reddit default
  return getRedditDefaultAvatar(username);
}
```

## Critical Discovery: Multiple Avatar URL Patterns

Reddit uses different URL patterns for different avatar types and contexts:

### 1. Custom Snoovatars (User-Created)
```
https://i.redd.it/snoovatar/avatars/{uuid}.png
```

**Example from production app:**
```html
<div style="background-image:url('https://i.redd.it/snoovatar/avatars/f3ca8c67-e28f-4686-89b0-644b4dcfb99e.png')">
  <img src="https://i.redd.it/snoovatar/avatars/f3ca8c67-e28f-4686-89b0-644b4dcfb99e.png">
</div>
```

**Characteristics:**
- Used for custom user-created snoovatars
- UUID-based filename
- This is what `snoovatarImage` and `getSnoovatarUrl()` return
- **This is your target URL pattern for the chat app**

### 2. Default Reddit Avatars (No Custom Snoovatar)
```
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{0-7}.png
```

**Characteristics:**
- Used when users don't have custom snoovatars
- 8 different default avatars (numbered 0-7)
- Static, predictable URLs
- Can be used as fallback with hash function

### 3. Uploaded App Assets (Your Default Avatar)
```
https://preview.redd.it/[asset-path]
```

**Characteristics:**
- Used for assets uploaded with your Devvit app
- This is where your `default-snoo.png` will be hosted
- Accessible via `/default-snoo.png` in your app

### 4. Profile Icons (Alternative Format)
```
[Various formats via iconImage property]
```

**Characteristics:**
- Available only in event payloads via `iconImage` property
- Alternative to snoovatars
- Format varies by user

## Important Constraints

1. **No Component Access**: You cannot access individual snoovatar components, props, or backgrounds through any Devvit API
2. **Complete Images Only**: Both `snoovatarImage` and `getSnoovatarUrl()` provide complete rendered avatar image URLs
3. **Event-Only Properties**: `iconImage` and `snoovatarImage` are only in event payloads, not in User model from API calls
4. **URL Pattern**: The URLs use `i.redd.it/snoovatar/avatars/{uuid}.png` format

## Understanding the Avatar URL Hierarchy

### Priority Order for Avatar Loading

1. **Custom Snoovatar** (Highest Priority)
   ```
   https://i.redd.it/snoovatar/avatars/{uuid}.png
   ```
   - Returned by `getSnoovatarUrl()` and `snoovatarImage`
   - User-created custom avatar
   - **This is your primary target**

2. **Profile Icon** (Event-Only Alternative)
   ```
   [Various formats via iconImage]
   ```
   - Only available in event payloads
   - Alternative representation
   - Requires event triggers to access

3. **Reddit Default Avatars** (Fallback)
   ```
   https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{0-7}.png
   ```
   - Used when no custom snoovatar exists
   - Consistent with Reddit's UI
   - Can be computed client-side

4. **Your Custom Default** (Final Fallback)
   ```
   https://preview.redd.it/[your-app]/default-snoo.png
   ```
   - Your uploaded default avatar
   - Used for errors or unknown states
   - Provides consistent branding

### URL Characteristics by Type

| URL Pattern | Type | Access Method | Cacheable | Stable |
|-------------|------|---------------|-----------|--------|
| `i.redd.it/snoovatar/avatars/` | Custom Snoovatar | API + Events | ✅ | ✅ |
| `iconImage` property | Profile Icon | Events Only | ✅ | ✅ |
| `www.redditstatic.com/avatars/defaults/` | Reddit Default | Computed | ✅ | ✅ |
| `preview.redd.it/[app]/` | App Asset | Direct | ✅ | ✅ |

Since you're building a **Devvit Web app** (not Blocks), you have full control over how to render these URLs in your React components.

## Implementation for Your Chat App

Since you're using **Devvit Web** (React + webview), you can:

1. **Fetch avatar URLs** via API or events
2. **Store them in Redis** for caching
3. **Pass them to your client** via API endpoints
4. **Render them in React** using standard `<img>` tags or CSS backgrounds

Example implementation:

```typescript
// Server endpoint: /api/user-avatar
router.get('/api/user-avatar/:username', async (req, res) => {
  const { username } = req.params;
  
  // Check cache
  const cached = await redis.get(`avatar:${username}`);
  if (cached) {
    return res.json({ avatarUrl: cached });
  }
  
  // Fetch from Reddit
  const user = await reddit.getUserByUsername(username);
  const avatarUrl = await user?.getSnoovatarUrl();
  
  if (avatarUrl) {
    // Cache for 1 hour
    await redis.set(`avatar:${username}`, avatarUrl, { expiration: 3600 });
    return res.json({ avatarUrl });
  }
  
  // Return default
  res.json({ avatarUrl: '/default-avatar.png' });
});
```

```tsx
// Client component: Avatar.tsx
export function Avatar({ username }: { username: string }) {
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png');
  
  useEffect(() => {
    fetch(`/api/user-avatar/${username}`)
      .then(r => r.json())
      .then(data => setAvatarUrl(data.avatarUrl));
  }, [username]);
  
  return (
    <img 
      src={avatarUrl} 
      alt={`${username}'s avatar`}
      className="w-16 h-16 rounded-full"
    />
  );
}
```

## Next Steps

1. **Add default avatar asset** to `src/client/public/`
2. **Implement event triggers** for avatar caching (optional, for iconImage access)
3. **Create server API endpoint** for avatar fetching
4. **Update Avatar component** to use the endpoint
5. **Test with real Reddit users** to verify URLs work
6. **Monitor cache hit rates** to optimize strategy

## References

- **EventTypes Documentation**: `docs/devvit-api/@devvit/namespaces/EventTypes/`
- **User Model**: `docs/devvit-api/models/User.md`
- **Triggers Guide**: https://developers.reddit.com/docs/capabilities/server/triggers
