# Devvit Documentation Maintenance Guide

## Overview

This project uses a multi-layered approach to keep Devvit API documentation current and accessible:

1. **Agent Hook** - Automated sync trigger
2. **Steering Files** - Always-available context for AI
3. **Shell Script** - Manual sync tool
4. **Local Cache** - Complete API reference

## Current Version

**Devvit Version**: 0.12.4-dev  
**Last Synced**: 2025-11-18

## Documentation Sources

### Primary Source
- **GitHub Repository**: https://github.com/reddit/devvit
- **API Docs Path**: `/devvit-docs/docs/api/`

### Key Documentation Files
- `RedditAPIClient.md` - Main API client methods
- `models/User.md` - User object methods
- `models/Post.md` - Post object methods
- `models/Comment.md` - Comment object methods
- `models/Subreddit.md` - Subreddit object methods

## Sync Methods

### Method 1: Agent Hook (Recommended)

Use the Kiro agent hook for intelligent syncing:

1. Open Command Palette (Cmd+Shift+P)
2. Search for "Sync Devvit Documentation"
3. Run the hook

**What it does**:
- Checks current Devvit version
- Fetches latest API docs from GitHub
- Compares with local steering files
- Updates references with changes
- Tests against Devvit MCP server
- Generates sync report

### Method 2: Shell Script

For quick manual syncs:

```bash
./scripts/sync-devvit-docs.sh
```

**What it does**:
- Downloads latest API documentation
- Updates local cache in `docs/devvit-api/`
- Updates version timestamps

### Method 3: Manual Update

When you discover a new API method:

1. Search Devvit docs: Use `mcp_devvit_mcp_devvit_search` tool
2. Check GitHub: Browse https://github.com/reddit/devvit/tree/main/devvit-docs/docs/api
3. Update steering: Add to `.kiro/steering/devvit-api-reference.md`
4. Document constraints: Update `.kiro/steering/devvit-constraints.md`

## File Structure

```
.kiro/
├── hooks/
│   └── devvit-docs-sync.md              # Agent hook definition
└── steering/
    ├── devvit-api-reference.md          # Quick reference (always loaded)
    ├── devvit-constraints.md            # Platform limitations
    ├── devvit-platform-guide.md         # Platform overview
    ├── devvit-docs-maintenance.md       # This guide (always loaded)
    └── devvit-quick-reference.md        # Quick reference card (always loaded)

docs/
├── devvit-api/                          # Complete API cache
│   ├── RedditAPIClient.md
│   └── models/
│       ├── User.md
│       ├── Post.md
│       ├── Comment.md
│       └── Subreddit.md
└── devvit-sync-report-*.md              # Sync reports

scripts/
├── sync-devvit-docs.sh                  # Shell sync script
└── sync-devvit-docs.js                  # Node.js sync script
```

## When to Sync

### Regular Schedule
- **Weekly** during active development
- **After** updating Devvit version in package.json
- **Before** starting new features using unfamiliar APIs

### Triggered Events
- Encountering "method not found" errors
- Discovering undocumented API methods
- Reddit announces Devvit updates
- MCP server returns unexpected results

## Identifying Knowledge Gaps

### Signs of Outdated Documentation

1. **Runtime Errors**
   ```
   TypeError: reddit.someMethod is not a function
   ```

2. **MCP Search Failures**
   - MCP returns no results for known methods
   - MCP documentation contradicts GitHub docs

3. **Deprecated Warnings**
   - Methods marked as deprecated in code
   - New methods available but not documented

### Testing Against MCP Server

Use the Devvit MCP tool to verify coverage:

```typescript
// Test if method is documented in MCP
mcp_devvit_mcp_devvit_search({ 
  query: "getSnoovatarUrl" 
})

// Compare with GitHub source
// https://github.com/reddit/devvit/blob/main/devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md
```

## Maintaining Steering Files

### devvit-api-reference.md

**Purpose**: Quick reference for commonly used methods

**Update when**:
- New frequently-used methods are added
- Method signatures change
- New patterns emerge

**Keep it focused on**:
- Methods you actually use
- Common patterns and examples
- Methods missing from MCP

### devvit-constraints.md

**Purpose**: Document platform limitations and gotchas

**Update when**:
- Discovering new limitations
- Runtime errors reveal constraints
- API behavior differs from expectations

**Critical sections**:
- Redis limitations (no regular sets!)
- Realtime channel naming rules
- Authentication patterns
- Entry point requirements

## Sync Report Format

After running the agent hook, review the generated report:

```markdown
# Devvit Sync Report - 2025-11-18

## Version Changes
- Previous: 0.12.3
- Current: 0.12.4-dev

## New API Methods
- reddit.getSnoovatarUrl(username)
- reddit.getSubredditLeaderboard(subredditId)

## Deprecated Methods
- reddit.getSubredditByName() → use getSubredditInfoByName()

## MCP Coverage Gaps
- getSnoovatarUrl: Not indexed in MCP
- User.getSnoovatarUrl(): Not searchable

## Recommended Actions
1. Add getSnoovatarUrl to devvit-api-reference.md
2. Update avatar examples with new method
3. Test leaderboard API in development
```

## Best Practices

### 1. Version Tracking
Always note the Devvit version when documenting:
```markdown
**Version**: 0.12.4-dev
**Last Synced**: 2025-11-18
```

### 2. Source Attribution
Link to GitHub for authoritative reference:
```markdown
**Source**: https://github.com/reddit/devvit/blob/main/path/to/file.md
```

### 3. Example Code
Include working examples for complex methods:
```typescript
// ✅ CORRECT
const avatarUrl = await reddit.getSnoovatarUrl('username');

// ❌ WRONG
const avatarUrl = await user.getAvatar(); // Method doesn't exist
```

### 4. Migration Patterns
Document how to update existing code:
```typescript
// BEFORE (deprecated)
const subreddit = await reddit.getSubredditByName('askReddit');

// AFTER (current)
const subreddit = await reddit.getSubredditInfoByName('askReddit');
```

## Troubleshooting

### Sync Script Fails

**Problem**: curl errors or network issues

**Solution**:
```bash
# Check GitHub API rate limits
curl -I https://api.github.com/rate_limit

# Use authenticated requests if needed
export GITHUB_TOKEN="your_token"
```

### Agent Hook Doesn't Find Changes

**Problem**: Hook reports no updates but you know there are changes

**Solution**:
1. Check GitHub commit history
2. Manually compare file SHAs
3. Clear local cache and re-sync

### MCP Server Out of Sync

**Problem**: MCP returns outdated information

**Solution**:
1. MCP server may lag behind GitHub
2. Use GitHub as source of truth
3. Document gaps in steering files
4. Report to Devvit team if persistent

## Contributing Updates

When you discover new API methods or patterns:

1. **Document in steering files** first
2. **Test thoroughly** in your app
3. **Share findings** with team
4. **Update this guide** if process changes

## Resources

- **Devvit GitHub**: https://github.com/reddit/devvit
- **Devvit Docs**: https://developers.reddit.com/docs
- **MCP Server**: Use `mcp_devvit_mcp_devvit_search` tool
- **Reddit DevPlatform**: https://www.reddit.com/r/devvit

---

**Maintained by**: Development Team  
**Last Updated**: 2025-11-18
