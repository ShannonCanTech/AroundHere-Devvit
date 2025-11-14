---
inclusion: always
---

# Devvit Platform Constraints & Common Pitfalls

This document outlines critical constraints and common mistakes when developing for Devvit. **Always reference this before implementing Redis, realtime, or authentication features.**

## 🚨 Critical Redis Limitations

### Regular Sets Are NOT Supported

Devvit Redis **does not support regular set operations**. The following commands will cause runtime errors:

```typescript
// ❌ THESE WILL FAIL AT RUNTIME
redis.sAdd()      // TypeError: redis.sAdd is not a function
redis.sRem()      // TypeError: redis.sRem is not a function  
redis.sMembers()  // TypeError: redis.sMembers is not a function
redis.sIsMember() // TypeError: redis.sIsMember is not a function
redis.sCard()     // TypeError: redis.sCard is not a function
```

### ✅ Solution: Use Sorted Sets Instead

Replace set operations with sorted sets using timestamps as scores:

```typescript
// Adding items
await redis.zAdd('user:123:items', { 
  member: 'item1', 
  score: Date.now() 
});

// Removing items
await redis.zRem('user:123:items', ['item1']);

// Getting all items (sorted by score)
const result = await redis.zRange('user:123:items', 0, -1);
const items = result.map(item => item.member);

// Checking membership
const score = await redis.zScore('user:123:items', 'item1');
const exists = score !== undefined;

// Getting count
const count = await redis.zCard('user:123:items');
```

### Supported Redis Operations

**Sorted Sets**: `zAdd`, `zRem`, `zRange`, `zScore`, `zCard`, `zRank`, `zRevRank`, `zRemRangeByScore`, `zScan`

**Hashes**: `hSet`, `hGet`, `hGetAll`, `hDel`, `hExists`, `hKeys`, `hVals`, `hLen`, `hIncrBy`

**Strings**: `get`, `set`, `del`, `exists`, `type`, `rename`

**Numbers**: `incrBy`, `decrBy`

**Transactions**: `watch`, `multi`, `exec`, `unwatch`

**Bitfields**: `bitfield`

### NOT Supported
- Regular sets (sAdd, sMembers, etc.)
- Lists (lPush, lPop, etc.)
- Pub/Sub (publish, subscribe, etc.)
- Lua scripts
- Key listing/scanning (except zScan for sorted sets)
- Pipelining

## 🚨 Authentication & Context

### Use context.userId, NOT reddit.getCurrentUserId()

```typescript
// ❌ WRONG - This function doesn't exist
const userId = await reddit.getCurrentUserId();

// ✅ CORRECT - Use context directly
const { userId } = context;

// Also available in context:
const { postId, subredditName, subredditId } = context;
```

### Getting Username

```typescript
// ✅ CORRECT - This is the only way
const username = await reddit.getCurrentUsername();
```

## 🚨 Realtime Channel Naming

Channel names have strict naming rules:

```typescript
// ❌ WRONG - Hyphens not allowed
await realtime.send('chat-messages', data);
await connectRealtime({ channel: 'user-events' });

// ✅ CORRECT - Only letters, numbers, underscores
await realtime.send('chat_messages', data);
await connectRealtime({ channel: 'user_events' });
```

**Rule**: Channel names may only contain **letters, numbers, and underscores**.

## 🚨 Entry Points & Navigation

### Default Entry Point Required

`devvit.json` must have a "default" entry point:

```json
{
  "post": {
    "entrypoints": {
      "default": {
        "entry": "index.html"
      },
      "welcome": {
        "entry": "welcome.html",
        "inline": true
      }
    }
  }
}
```

### Navigation Between Entry Points

```typescript
// ✅ CORRECT - Use requestExpandedMode for entry point navigation
import { requestExpandedMode } from '@devvit/web/client';

const handleClick = async (event: React.MouseEvent) => {
  await requestExpandedMode(event.nativeEvent, 'home');
};

// ✅ CORRECT - Use window.location for same-mode navigation
window.location.href = '/terms.html';
```

## 🚨 Common Mistakes Checklist

Before deploying or testing, verify:

- [ ] No use of `sAdd`, `sMembers`, or other set operations
- [ ] All Redis set operations converted to sorted sets (`zAdd`, `zRange`, etc.)
- [ ] Using `context.userId` instead of `reddit.getCurrentUserId()`
- [ ] Realtime channel names use underscores, not hyphens
- [ ] `devvit.json` has a "default" entry point defined
- [ ] App default screen is appropriate (usually 'home', not 'chat')

## 📚 When In Doubt

**Always search Devvit docs** before implementing:
- Redis operations: Search for "redis" + the operation name
- Realtime features: Search for "realtime"
- Authentication: Search for "context" or "user"

Use the `mcp_devvit_mcp_devvit_search` tool to verify API availability.

## 🔄 Migration Patterns

### Converting Existing Set-Based Code

1. **Identify all set operations** in your codebase
2. **Replace with sorted set equivalents** using timestamps
3. **Update type definitions** if needed
4. **Test thoroughly** - runtime errors won't show until execution

### Example Migration

```typescript
// BEFORE (will fail)
export async function addItemToUser(userId: string, itemId: string) {
  await redis.sAdd(`user:${userId}:items`, [itemId]);
}

export async function getUserItems(userId: string) {
  return await redis.sMembers(`user:${userId}:items`);
}

// AFTER (works correctly)
export async function addItemToUser(userId: string, itemId: string) {
  await redis.zAdd(`user:${userId}:items`, {
    member: itemId,
    score: Date.now()
  });
}

export async function getUserItems(userId: string) {
  const result = await redis.zRange(`user:${userId}:items`, 0, -1);
  return result.map(item => item.member);
}
```

---

**Last Updated**: Based on Devvit 0.12.2 API constraints discovered during onboarding flow implementation.
