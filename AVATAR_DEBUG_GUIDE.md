# Avatar Debugging Guide

## Changes Made

### 1. Strengthened ProfileIcon Fallback
**File**: `src/client/components/ProfileIcon.tsx`

- Removed unnecessary `useState` for error tracking
- Matches HomeScreen's exact fallback behavior
- Prevents infinite loop by checking if already showing fallback
- Uses `indexOf` check instead of strict equality for robustness

**Behavior**: If an avatar URL fails to load, it will automatically fallback to `/default-snoo.png` with 50% opacity, exactly like HomeScreen.

### 2. Fixed Redis Expiration Bug
**File**: `src/server/core/avatar.ts`

**Issue**: Redis `set()` was being called with `{ expiration: 3600 }` which caused `TypeError: options.expiration.getTime is not a function`

**Fix**: Changed to use separate `redis.expire()` call:
```typescript
// Before (BROKEN):
await redis.set(key, value, { expiration: 3600 });

// After (FIXED):
await redis.set(key, value);
await redis.expire(key, 3600); // 1 hour
```

This follows Devvit's Redis API pattern as documented.

### 2. Added Server-Side Logging
**Files**: 
- `src/server/core/avatar.ts`
- `src/server/core/message.ts`

**Log Format**: All logs prefixed with `[Avatar]` or `[Message]` for easy filtering

**What's Logged**:
- Cache hits (iconImage and avatar cache)
- User lookup results
- Custom snoovatar discovery
- Fallback to default avatars
- Avatar URL assignment to messages
- Error conditions

## Viewing Logs in Devvit Playtest

### Method 1: Terminal Output (Recommended)
When running `npm run dev`, server logs appear in your terminal in real-time.

Look for lines like:
```
[Avatar] Fetching user data for username123
[Avatar] Custom snoovatar found for username123: https://i.redd.it/snoovatar/avatars/...
[Message] Avatar URL for username123: https://i.redd.it/snoovatar/avatars/...
[Message] Created message msg_chat123_1234567890_abc123 with avatarUrl: present
```

### Method 2: Devvit Logs Command
```bash
# View logs for your app in the test subreddit
devvit logs <your-subreddit-name>

# Example:
devvit logs r/my-app_dev

# With time filter (last 15 minutes)
devvit logs r/my-app_dev --since 15m
```

### Method 3: Browser DevTools
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "api"
4. Look at responses from `/api/chats/{chatId}/messages`
5. Check if `avatarUrl` field is present in message objects

## What to Look For

### ✅ Success Pattern
```
[Avatar] Fetching user data for username
[Avatar] Custom snoovatar found for username: https://i.redd.it/...
[Message] Avatar URL for username: https://i.redd.it/...
[Message] Created message msg_... with avatarUrl: present
```

### ⚠️ Fallback Pattern (Normal)
```
[Avatar] Fetching user data for username
[Avatar] No custom snoovatar for username, using default
[Message] Avatar URL for username: https://www.redditstatic.com/...
[Message] Created message msg_... with avatarUrl: present
```

### ❌ Error Pattern (Investigate)
```
[Avatar] Failed to fetch avatar for username: Error...
[Message] Avatar fetch failed for username, using fallback
[Message] Fallback avatar URL: https://www.redditstatic.com/...
[Message] Created message msg_... with avatarUrl: present
```

### 🚨 Critical Issue (Should Never Happen)
```
[Message] Created message msg_... with avatarUrl: MISSING
```
If you see this, the avatar system has completely failed.

## Testing Steps

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open the playtest URL** in your browser

3. **Send a test message** in the chat

4. **Check terminal logs** for the avatar fetch sequence

5. **Inspect the message** in browser DevTools Network tab

6. **Verify avatar displays** in the UI

## Common Issues & Solutions

### Issue: Avatar shows as default-snoo.png with opacity
**Cause**: The avatar URL failed to load in the browser
**Check**: 
- Is the URL valid? (Check Network tab for 404/403 errors)
- CORS issue? (Check Console for CORS errors)
- Network timing? (Image might be loading slowly)

### Issue: No avatar at all
**Cause**: `avatarUrl` field is undefined/null
**Check**:
- Server logs show "avatarUrl: MISSING"
- Network response missing `avatarUrl` field
- Realtime message missing `avatarUrl` field

### Issue: Different avatars in different places
**Cause**: Cache inconsistency or timing
**Check**:
- Redis cache expiration (1 hour)
- Different code paths (initial load vs realtime)
- Race condition between cache and API

## Rate Limit Considerations

The logging added is **minimal and safe**:
- Only logs during avatar fetch (cached for 1 hour)
- Only logs during message creation (user-initiated)
- No polling or repeated logging
- Follows Devvit best practices

**Estimated log volume**: 
- ~3-5 log lines per unique user per hour
- ~2-3 log lines per message sent
- Well within Devvit limits for playtest

## Next Steps

After reviewing logs, you can:
1. **Identify the failure point** (cache, API, or client)
2. **Adjust cache duration** if needed
3. **Add more aggressive fallbacks** if URLs are consistently invalid
4. **Report to Devvit team** if Reddit API is returning bad URLs

## Cleanup

Once debugging is complete, you can remove or reduce logging by:
1. Commenting out `console.log` statements
2. Keeping only `console.error` for production
3. Using environment-based logging (if needed)

---

**Last Updated**: 2025-11-20
