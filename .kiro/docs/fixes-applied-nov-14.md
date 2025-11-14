# Fixes Applied - November 14, 2025

## Summary

Fixed critical Redis `zRange` parameter errors that were blocking all chat functionality.

## Problem

The app was throwing `ERR value is not an integer or out of range` errors whenever:
- Loading chat list
- Fetching messages
- Creating new chats

## Root Cause

Incorrect `redis.zRange()` parameter syntax. Devvit requires:
- **Rank-based**: `zRange(key, start, stop, { by: 'rank' })`
- **Score-based**: `zRange(key, min, max, { by: 'score', count: N })`

The code was using object syntax with `start`/`stop` properties, which is invalid.

## Files Modified

### `src/server/core/redis/message.ts`

Fixed 4 functions:
1. `getLastMessage()` - Changed to rank-based range with `-1, -1`
2. `getMessages()` - Changed to score-based range with proper count limit
3. `getMessage()` - Fixed to use positional parameters
4. `deleteMessage()` - Fixed to use positional parameters

## Testing Instructions

1. Run `npm run dev`
2. Open the playtest URL
3. Click "New Message" button
4. Verify:
   - No Redis errors in terminal
   - Chat list loads successfully
   - Messages display correctly
   - Can send/receive messages

## Known Issues

**SVG Height Warnings**: Still present but non-blocking. These appear to come from a library or dynamically generated content. Monitor during testing.

## Next Steps

Once chat functionality is verified working:
1. Start new chat session for advanced features spec
2. Reference this document and the error logs
3. Build on the working foundation:
   - Group chats
   - Mod-only chats
   - Subreddit chats
   - Advanced permissions

## References

- Error logs: `.kiro/docs/console-errors-log.md`
- Conversation summary: `.kiro/docs/conversation-summary.md`
- Devvit constraints: `.kiro/steering/devvit-constraints.md`
- Redis quick reference: `.kiro/steering/redis-quick-reference.md`
