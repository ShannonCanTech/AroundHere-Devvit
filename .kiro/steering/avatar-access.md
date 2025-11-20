---
inclusion: always
---

# Avatar Access in Devvit - Quick Reference

**Status**: ✅ Tested and Verified (Nov 19, 2025)

## Three Avatar URL Patterns

### 1. Custom Snoovatars (Primary)
```
https://i.redd.it/snoovatar/avatars/{uuid}.png
```
- Returned by `user.getSnoovatarUrl()`
- User-created custom avatars
- Returns `undefined` if user has no custom snoovatar

### 2. Reddit Defaults (Fallback)
```
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{0-7}.png
```
- 8 default avatars (numbered 0-7)
- Use when `getSnoovatarUrl()` returns `undefined`
- Compute with hash: `hash(username) % 8`

### 3. App Default (Final Fallback)
```
/default-snoo.png
```
- Your uploaded asset in `src/client/public/`
- Use for errors or unknown states

## Quick Implementation

```typescript
// Server: 3-tier fallback
async function getAvatarUrl(username: string): Promise<string> {
  try {
    const cached = await redis.get(`avatar:${username}`);
    if (cached) return cached;
    
    const user = await reddit.getUserByUsername(username);
    const url = await user?.getSnoovatarUrl();
    
    if (url) {
      await redis.set(`avatar:${username}`, url, { expiration: 3600 });
      return url;
    }
    
    // Fallback to Reddit default
    const hash = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${hash % 8}.png`;
  } catch {
    return '/default-snoo.png';
  }
}
```

```tsx
// Client: Simple avatar component
export function Avatar({ username }: { username: string }) {
  const [url, setUrl] = useState('/default-snoo.png');
  
  useEffect(() => {
    fetch(`/api/avatar/${username}`)
      .then(r => r.json())
      .then(data => setUrl(data.url));
  }, [username]);
  
  return (
    <img 
      src={url} 
      alt={username}
      onError={(e) => e.currentTarget.src = '/default-snoo.png'}
      className="w-12 h-12 rounded-full"
    />
  );
}
```

## Event-Based Caching (Optional)

Access `snoovatarImage` and `iconImage` from event payloads:

```typescript
Devvit.addTrigger({
  events: ['PostCreate', 'CommentCreate'],
  onEvent: async (event, context) => {
    if (event.author?.snoovatarImage) {
      await context.redis.set(
        `avatar:${event.author.name}`,
        event.author.snoovatarImage,
        { expiration: 86400 }
      );
    }
  },
});
```

**Available in 17 events**: PostCreate, PostSubmit, PostUpdate, PostDelete, PostApprove, PostFlairUpdate, PostNsfwUpdate, PostSpoilerUpdate, CommentCreate, CommentSubmit, CommentUpdate, CommentDelete, CommentApprove, AppInstall, AppUpgrade, SubredditSubscribe, AccountDelete

## Key Points

- ✅ All URL patterns are publicly accessible (no auth required)
- ✅ All patterns tested and verified in browsers
- ✅ Cache avatars in Redis for 1 hour
- ✅ Always implement 3-tier fallback
- ❌ Cannot access individual avatar components/props
- ❌ `iconImage` only available in event payloads, not API calls

## Complete Documentation

See `DEVVIT_AVATAR_GUIDE.md` for comprehensive guide with testing results and best practices.
