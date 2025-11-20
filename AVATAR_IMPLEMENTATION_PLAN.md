# Avatar Implementation Plan for Chat App

## What We Know Now

### The Discovery
From examining other Devvit apps, we found that avatar URLs follow this pattern:
```
https://i.redd.it/snoovatar/avatars/{uuid}.png
```

This is what `getSnoovatarUrl()` returns - a direct, publicly accessible image URL.

### Available Methods

1. **API Method** (Works Now):
   ```typescript
   const user = await reddit.getUserByUsername('username');
   const avatarUrl = await user.getSnoovatarUrl();
   // Returns: https://i.redd.it/snoovatar/avatars/{uuid}.png
   ```

2. **Event Properties** (Requires Triggers):
   - `snoovatarImage` - Same URL as above
   - `iconImage` - Profile icon (alternative to snoovatar)

## Recommended Implementation

### Phase 1: Simple API-Based (Implement First)

This works immediately without event triggers:

**Server Endpoint** (`src/server/index.ts`):
```typescript
// Helper function for Reddit default avatars
function getRedditDefaultAvatar(username: string): string {
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const avatarNumber = hash % 8; // 0-7
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
}

router.get('/api/avatar/:username', async (req, res) => {
  const { username } = req.params;
  const { redis, reddit } = req.context;
  
  try {
    // Check cache first
    const cached = await redis.get(`avatar:${username}`);
    if (cached) {
      return res.json({ url: cached, source: 'cache' });
    }
    
    // Fetch from Reddit API
    const user = await reddit.getUserByUsername(username);
    if (user) {
      const avatarUrl = await user.getSnoovatarUrl();
      
      if (avatarUrl) {
        // Custom snoovatar found (i.redd.it/snoovatar/avatars/)
        await redis.set(`avatar:${username}`, avatarUrl, { expiration: 3600 });
        return res.json({ url: avatarUrl, source: 'custom' });
      }
    }
    
    // No custom snoovatar - use Reddit default
    const defaultUrl = getRedditDefaultAvatar(username);
    await redis.set(`avatar:${username}`, defaultUrl, { expiration: 3600 });
    res.json({ url: defaultUrl, source: 'reddit-default' });
  } catch (error) {
    console.error('Avatar fetch error:', error);
    // Error fallback - use your custom default
    res.json({ url: '/default-snoo.png', source: 'app-default' });
  }
});
```

**Client Component** (`src/client/components/Avatar.tsx`):
```tsx
import { useState, useEffect } from 'react';

type AvatarProps = {
  username: string;
  size?: number;
  className?: string;
};

export function Avatar({ username, size = 64, className = '' }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState('/default-snoo.png');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    fetch(`/api/avatar/${username}`)
      .then(r => r.json())
      .then(data => {
        if (mounted) {
          setAvatarUrl(data.url);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load avatar:', err);
        if (mounted) {
          setLoading(false);
        }
      });
    
    return () => { mounted = false; };
  }, [username]);
  
  return (
    <div 
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={avatarUrl}
        alt={`${username}'s avatar`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.src = '/default-snoo.png';
        }}
      />
    </div>
  );
}
```

**Expected Avatar Sources:**
- `custom` - User has custom snoovatar (`i.redd.it/snoovatar/avatars/`)
- `reddit-default` - User has no custom snoovatar (`www.redditstatic.com/avatars/defaults/`)
- `app-default` - Error or unknown state (`/default-snoo.png`)
- `cache` - Retrieved from Redis cache

**Usage in Chat**:
```tsx
import { Avatar } from './components/Avatar';

function ChatMessage({ message }) {
  return (
    <div className="flex gap-3 p-3">
      <Avatar username={message.username} size={48} />
      <div>
        <div className="font-bold">{message.username}</div>
        <div>{message.text}</div>
      </div>
    </div>
  );
}
```

### Phase 2: Enhanced with Event Caching (Optional)

Add event triggers to pre-cache avatars and access `iconImage`:

**Add to `devvit.json`**:
```json
{
  "blocks": {
    "triggers": [
      "onPostCreate",
      "onPostSubmit", 
      "onCommentCreate",
      "onCommentSubmit"
    ]
  }
}
```

**Add Trigger Handler** (`src/server/index.ts`):
```typescript
import Devvit from '@devvit/public-api';

Devvit.addTrigger({
  events: ['PostCreate', 'PostSubmit', 'CommentCreate', 'CommentSubmit'],
  onEvent: async (event, context) => {
    const { author } = event;
    
    if (!author) return;
    
    // Cache snoovatar URL
    if (author.snoovatarImage) {
      await context.redis.set(
        `avatar:${author.name}`,
        author.snoovatarImage,
        { expiration: 86400 } // 24 hours
      );
    }
    
    // Cache icon URL (fallback)
    if (author.iconImage) {
      await context.redis.set(
        `icon:${author.name}`,
        author.iconImage,
        { expiration: 86400 }
      );
    }
  },
});
```

**Enhanced Endpoint**:
```typescript
router.get('/api/avatar/:username', async (req, res) => {
  const { username } = req.params;
  const { redis, reddit } = req.context;
  
  try {
    // 1. Check snoovatar cache (from events or API)
    const cachedAvatar = await redis.get(`avatar:${username}`);
    if (cachedAvatar) {
      return res.json({ url: cachedAvatar, source: 'cache' });
    }
    
    // 2. Check icon cache (from events only)
    const cachedIcon = await redis.get(`icon:${username}`);
    if (cachedIcon) {
      return res.json({ url: cachedIcon, source: 'icon-cache' });
    }
    
    // 3. Fetch from Reddit API
    const user = await reddit.getUserByUsername(username);
    if (user) {
      const avatarUrl = await user.getSnoovatarUrl();
      
      if (avatarUrl) {
        await redis.set(`avatar:${username}`, avatarUrl, { expiration: 3600 });
        return res.json({ url: avatarUrl, source: 'api' });
      }
    }
    
    // 4. Fallback to default
    res.json({ url: '/default-avatar.png', source: 'default' });
  } catch (error) {
    console.error('Avatar fetch error:', error);
    res.json({ url: '/default-avatar.png', source: 'error' });
  }
});
```

## Avatar URL Strategy

Your chat app will use this priority order:

1. **Custom Snoovatar** (`i.redd.it/snoovatar/avatars/`) - Primary target
2. **Reddit Default** (`www.redditstatic.com/avatars/defaults/`) - Fallback for users without custom snoovatars
3. **Your Default** (`/default-snoo.png`) - Final fallback for errors

### Implementation

```typescript
function getRedditDefaultAvatar(username: string): string {
  // Generate consistent hash from username
  const hash = username.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const avatarNumber = hash % 8; // 0-7
  return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${avatarNumber}.png`;
}

async function getUserAvatar(username: string): Promise<string> {
  try {
    // 1. Try to get custom snoovatar (i.redd.it)
    const user = await reddit.getUserByUsername(username);
    const snoovatarUrl = await user?.getSnoovatarUrl();
    
    if (snoovatarUrl) {
      return snoovatarUrl; // Custom snoovatar found
    }
    
    // 2. User has no custom snoovatar - use Reddit default
    return getRedditDefaultAvatar(username);
  } catch (error) {
    // 3. Error occurred - use your custom default
    return '/default-snoo.png';
  }
}
```

### Setup Steps

1. **Add your default-snoo.png** to `src/client/public/default-snoo.png`
   - This will be uploaded to Reddit at `https://preview.redd.it/[your-app]/default-snoo.png`
   - Used as final fallback for errors or unknown states

## Performance Optimization

### Client-Side Caching
```tsx
// Create a simple cache
const avatarCache = new Map<string, string>();

export function Avatar({ username, size = 64 }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState(
    avatarCache.get(username) || '/default-avatar.png'
  );
  
  useEffect(() => {
    if (avatarCache.has(username)) return;
    
    fetch(`/api/avatar/${username}`)
      .then(r => r.json())
      .then(data => {
        avatarCache.set(username, data.url);
        setAvatarUrl(data.url);
      });
  }, [username]);
  
  return <img src={avatarUrl} alt={username} />;
}
```

### Batch Loading
```typescript
// Server endpoint for batch avatar fetching
router.post('/api/avatars/batch', async (req, res) => {
  const { usernames } = req.body;
  const { redis, reddit } = req.context;
  
  const avatars: Record<string, string> = {};
  
  for (const username of usernames) {
    const cached = await redis.get(`avatar:${username}`);
    if (cached) {
      avatars[username] = cached;
    } else {
      try {
        const user = await reddit.getUserByUsername(username);
        const url = await user?.getSnoovatarUrl();
        if (url) {
          avatars[username] = url;
          await redis.set(`avatar:${username}`, url, { expiration: 3600 });
        } else {
          avatars[username] = '/default-avatar.png';
        }
      } catch {
        avatars[username] = '/default-avatar.png';
      }
    }
  }
  
  res.json({ avatars });
});
```

## Testing Plan

1. **Test with real Reddit users**:
   - Users with custom snoovatars
   - Users without snoovatars
   - Deleted/suspended accounts

2. **Test caching**:
   - Verify Redis cache hits
   - Check cache expiration
   - Monitor API call frequency

3. **Test fallbacks**:
   - Network failures
   - Invalid usernames
   - Image load errors

4. **Performance testing**:
   - Load 50+ avatars in chat
   - Measure API response times
   - Check memory usage

## Deployment Checklist

- [ ] Add `default-snoo.png` to `src/client/public/`
- [ ] Implement `/api/avatar/:username` endpoint with 3-tier fallback
- [ ] Add `getRedditDefaultAvatar()` helper function
- [ ] Update Avatar component to use `/default-snoo.png`
- [ ] Test with users who have custom snoovatars (`i.redd.it`)
- [ ] Test with users who don't have custom snoovatars (should get `www.redditstatic.com`)
- [ ] Test error handling (should get `/default-snoo.png`)
- [ ] (Optional) Add event triggers for pre-caching
- [ ] Monitor Redis cache hit rates
- [ ] Verify all three URL patterns work correctly

## Expected Results

- **Cache Hit Rate**: 70-90% after initial warm-up
- **API Calls**: Minimal after first load
- **Load Time**: <100ms for cached avatars
- **Fallback Rate**: <5% (users without avatars)

## Next Steps

1. Start with **Phase 1** (API-based) - it works immediately
2. Add your default avatar asset
3. Test with real users in your chat app
4. Monitor performance and cache effectiveness
5. Consider **Phase 2** (event caching) if you need `iconImage` or better pre-caching
