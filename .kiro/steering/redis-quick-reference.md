---
inclusion: fileMatch
fileMatchPattern: ['**/redis/**/*', '**/server/**/*']
---

# Redis Quick Reference for Devvit

## ⚠️ CRITICAL: Regular Sets NOT Supported

```typescript
// ❌ NEVER USE THESE - They don't exist in Devvit
redis.sAdd()
redis.sRem()
redis.sMembers()
redis.sIsMember()
redis.sCard()
```

## ✅ Use Sorted Sets Instead

```typescript
// Add item
await redis.zAdd(key, { member: value, score: Date.now() });

// Remove item
await redis.zRem(key, [value]);

// Get all items
const result = await redis.zRange(key, 0, -1);
const items = result.map(item => item.member);

// Check if exists
const score = await redis.zScore(key, value);
const exists = score !== undefined;

// Get count
const count = await redis.zCard(key);
```

## Common Patterns

### User Collections (chats, items, etc.)

```typescript
// Add to collection
await redis.zAdd(`user:${userId}:collection`, {
  member: itemId,
  score: Date.now()
});

// Get collection (most recent first)
const result = await redis.zRange(`user:${userId}:collection`, 0, -1, { 
  reverse: true 
});
const items = result.map(item => item.member);
```

### Hashes for Metadata

```typescript
// Store object
await redis.hSet(`item:${id}`, {
  name: 'value',
  count: '10',
  timestamp: Date.now().toString()
});

// Get object
const data = await redis.hGetAll(`item:${id}`);

// Get single field
const name = await redis.hGet(`item:${id}`, 'name');
```

## Remember

- **Always use sorted sets** for collections
- **Use timestamps as scores** for chronological ordering
- **Convert to/from strings** for hash values
- **Check Devvit docs** before using any Redis command
