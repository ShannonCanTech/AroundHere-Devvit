---
inclusion: fileMatch
fileMatchPattern: ['src/server/**/*']
---

Guidelines:

- This is a serverless node.js environment, you have all node globals at your disposal except: fs, http, https, and net.

- Instead of http or https, prefer fetch
- You cannot write files as you are running on a read only file system
- Do not install any libraries that rely on these to function
- Websockets are not supported
- HTTP streaming is not supported
- Redis is accessible from `import { redis } from '@devvit/web/server'`

As this is a serverless runtime (akin to AWS Lambda), do not try to run SQLite or stateful in memory processes. For realtime use cases, consult the docs with devvit_search to learn more about the realtime service you can use.

## Redis Constraints (CRITICAL)

Devvit Redis has **limited API support**. Many standard Redis commands are NOT available:

### ❌ NOT SUPPORTED - Regular Sets
- `sAdd`, `sRem`, `sMembers`, `sIsMember`, `sCard` - **DO NOT USE**
- Regular Redis sets are completely unavailable in Devvit

### ✅ SUPPORTED - Use These Instead
- **Sorted Sets**: `zAdd`, `zRem`, `zRange`, `zScore`, `zCard`, `zRank`, `zRevRank`
- **Hashes**: `hSet`, `hGet`, `hGetAll`, `hDel`, `hExists`, `hKeys`, `hVals`
- **Strings**: `get`, `set`, `del`, `exists`, `type`, `rename`
- **Numbers**: `incrBy`, `decrBy`
- **Transactions**: `watch`, `multi`, `exec`, `unwatch`

### Migration Pattern: Sets → Sorted Sets
When you need set-like behavior, use sorted sets with timestamps as scores:

```typescript
// ❌ WRONG - This will fail
await redis.sAdd('user:123:chats', ['chat1']);
const chats = await redis.sMembers('user:123:chats');

// ✅ CORRECT - Use sorted sets
await redis.zAdd('user:123:chats', { member: 'chat1', score: Date.now() });
const result = await redis.zRange('user:123:chats', 0, -1);
const chats = result.map(item => item.member);
```

### User Context API

Use `context.userId` directly, NOT `reddit.getCurrentUserId()`:

```typescript
// ❌ WRONG
const userId = await reddit.getCurrentUserId();

// ✅ CORRECT
const { userId } = context;
```

### Realtime Channel Names

Channel names must only contain **letters, numbers, and underscores**:

```typescript
// ❌ WRONG - hyphens not allowed
await realtime.send('chat-messages', data);

// ✅ CORRECT - use underscores
await realtime.send('chat_messages', data);
```

**Always consult Devvit docs** when using Redis or realtime features to verify API support.
