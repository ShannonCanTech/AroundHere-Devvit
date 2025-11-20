# Avatar URL Patterns - Visual Reference

## The Three URL Patterns

### 1. Custom Snoovatars (Primary Target) ⭐
```
https://i.redd.it/snoovatar/avatars/{uuid}.png
```

**Example:**
```
https://i.redd.it/snoovatar/avatars/f3ca8c67-e28f-4686-89b0-644b4dcfb99e.png
```

**When Used:**
- User has created a custom snoovatar
- This is what `getSnoovatarUrl()` returns
- This is what `snoovatarImage` contains in events
- **This is your primary target for the chat app**

**Access Method:**
```typescript
const user = await reddit.getUserByUsername('username');
const url = await user.getSnoovatarUrl();
// Returns: https://i.redd.it/snoovatar/avatars/{uuid}.png
```

---

### 2. Reddit Default Avatars (Fallback)
```
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{0-7}.png
```

**Examples:**
```
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png
...
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_7.png
```

**When Used:**
- User has NOT created a custom snoovatar
- `getSnoovatarUrl()` returns `undefined`
- Provides consistent Reddit-style defaults

**Access Method:**
```typescript
function getRedditDefaultAvatar(username: string): string {
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const avatarNumber = hash % 8;
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
}
```

---

### 3. Your Custom Default (Final Fallback)
```
https://preview.redd.it/[your-app-path]/default-snoo.png
```

**Local Reference:**
```
/default-snoo.png
```

**When Used:**
- API errors occur
- Network failures
- Unknown states
- Provides consistent branding for your app

**Setup:**
```
src/client/public/default-snoo.png
```

---

## Decision Flow

```
User requests avatar for "username"
         |
         v
Check Redis cache
         |
    ┌────┴────┐
    |         |
  Found    Not Found
    |         |
    v         v
 Return   Fetch from Reddit API
 cached   (getUserByUsername)
  URL          |
               v
         getSnoovatarUrl()
               |
          ┌────┴────┐
          |         |
       Returns   Returns
         URL    undefined
          |         |
          v         v
    i.redd.it   www.redditstatic.com
    /snoovatar  /avatars/defaults
    /avatars/   /v2/avatar_default_
    {uuid}.png  {0-7}.png
          |         |
          └────┬────┘
               |
               v
          Cache & Return
               |
               v
        (On Error: /default-snoo.png)
```

---

## Implementation Priority

### ✅ Phase 1: Basic Implementation
```typescript
// 1. Custom snoovatar (i.redd.it)
const url = await user.getSnoovatarUrl();

// 2. Reddit default (www.redditstatic.com)
if (!url) {
  url = getRedditDefaultAvatar(username);
}

// 3. Your default (/default-snoo.png)
if (error) {
  url = '/default-snoo.png';
}
```

### 🔄 Phase 2: Enhanced with Events (Optional)
```typescript
// Access iconImage from events
Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    const { author } = event;
    
    // Cache both formats
    if (author.snoovatarImage) {
      await redis.set(`avatar:${author.name}`, author.snoovatarImage);
    }
    if (author.iconImage) {
      await redis.set(`icon:${author.name}`, author.iconImage);
    }
  },
});
```

---

## URL Characteristics Comparison

| Pattern | Host | Path | Dynamic | Cacheable | Requires API |
|---------|------|------|---------|-----------|--------------|
| Custom Snoovatar | `i.redd.it` | `/snoovatar/avatars/{uuid}.png` | ✅ UUID | ✅ Yes | ✅ Yes |
| Reddit Default | `www.redditstatic.com` | `/avatars/defaults/v2/avatar_default_{0-7}.png` | ✅ Number | ✅ Yes | ❌ No |
| Your Default | `preview.redd.it` or local | `/default-snoo.png` | ❌ Static | ✅ Yes | ❌ No |

---

## Testing Checklist

Test with these user types:

- [ ] **User with custom snoovatar** → Should get `i.redd.it/snoovatar/avatars/`
- [ ] **User without custom snoovatar** → Should get `www.redditstatic.com/avatars/defaults/`
- [ ] **Non-existent user** → Should get `/default-snoo.png`
- [ ] **Network error** → Should get `/default-snoo.png`
- [ ] **Cached user** → Should get cached URL (any of above)

---

## Quick Reference

**Target URL for Chat App:**
```
https://i.redd.it/snoovatar/avatars/{uuid}.png
```

**Fallback URL:**
```
https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{0-7}.png
```

**Error Fallback:**
```
/default-snoo.png
```

**Access Method:**
```typescript
const user = await reddit.getUserByUsername(username);
const avatarUrl = await user.getSnoovatarUrl() || getRedditDefaultAvatar(username);
```

---

## Summary

You're correct that `i.redd.it/snoovatar/avatars/` is the target URL pattern for your use case. This is what you'll get from `getSnoovatarUrl()` for users with custom snoovatars. For users without custom snoovatars, you'll use the `www.redditstatic.com` defaults, and your `default-snoo.png` serves as the final fallback for errors.

All three patterns are publicly accessible, cacheable, and work perfectly for a chat application!
