# Devvit Knowledge Management System

## Overview

This project implements a comprehensive, multi-layered system to maintain up-to-date Devvit API documentation and bridge the gap between the Devvit MCP server and the official GitHub repository.

**Problem Solved**: The Devvit MCP server doesn't effectively index all API reference documentation, making it difficult to discover methods and patterns. This system ensures you always have access to the latest, most complete API information.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE SOURCES                             │
├─────────────────────────────────────────────────────────────────┤
│  1. GitHub (Source of Truth)                                    │
│     https://github.com/reddit/devvit/tree/main/devvit-docs      │
│                                                                  │
│  2. Devvit MCP Server (Search Tool)                             │
│     mcp_devvit_mcp_devvit_search                                │
│                                                                  │
│  3. Local Cache (Fast Access)                                   │
│     docs/devvit-api/                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SYNC MECHANISMS                               │
├─────────────────────────────────────────────────────────────────┤
│  1. Agent Hook (Intelligent)                                    │
│     .kiro/hooks/devvit-docs-sync.md                             │
│     → Analyzes changes, tests MCP, generates reports            │
│                                                                  │
│  2. Node.js Script (Automated)                                  │
│     scripts/sync-devvit-docs.js                                 │
│     → Detects changes, extracts versions, creates reports       │
│                                                                  │
│  3. Shell Script (Quick)                                        │
│     scripts/sync-devvit-docs.sh                                 │
│     → Fast downloads, minimal processing                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE STORAGE                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Steering Files (Always Loaded)                              │
│     .kiro/steering/devvit-api-reference.md                      │
│     .kiro/steering/devvit-constraints.md                        │
│     → Common methods, patterns, limitations                     │
│                                                                  │
│  2. Complete API Cache                                          │
│     docs/devvit-api/RedditAPIClient.md                          │
│     docs/devvit-api/models/*.md                                 │
│     → Full API documentation, all methods                       │
│                                                                  │
│  3. Sync Reports                                                │
│     docs/devvit-sync-report-*.md                                │
│     → Change history, version tracking                          │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Agent Hook (`.kiro/hooks/devvit-docs-sync.md`)

**Purpose**: Intelligent, AI-assisted documentation synchronization

**Features**:
- Fetches latest docs from GitHub
- Compares with local steering files
- Tests methods against MCP server
- Identifies coverage gaps
- Generates detailed reports
- Updates steering files

**Usage**:
```
Command Palette → "Sync Devvit Documentation"
```

### 2. Node.js Sync Script (`scripts/sync-devvit-docs.js`)

**Purpose**: Automated sync with change detection

**Features**:
- Downloads 7 core API files
- Extracts version information
- Detects new/removed methods
- Generates sync reports
- Updates timestamps

**Usage**:
```bash
npm run sync-docs
```

### 3. Shell Sync Script (`scripts/sync-devvit-docs.sh`)

**Purpose**: Quick manual sync

**Features**:
- Fast curl-based downloads
- Minimal dependencies
- Updates core files

**Usage**:
```bash
./scripts/sync-devvit-docs.sh
```

### 4. Steering Files (`.kiro/steering/`)

**Purpose**: Always-available context for AI

**Files**:
- `devvit-api-reference.md` - Common methods with examples
- `devvit-constraints.md` - Platform limitations and gotchas
- `devvit-platform-guide.md` - Platform overview

**Auto-loaded**: Yes, in every AI interaction

### 5. Complete API Cache (`docs/devvit-api/`)

**Purpose**: Local copy of full API documentation

**Files**:
- `RedditAPIClient.md` - ~150+ methods
- `models/User.md` - User object methods
- `models/Post.md` - Post object methods
- `models/Comment.md` - Comment object methods
- `models/Subreddit.md` - Subreddit object methods
- `models/WikiPage.md` - Wiki operations
- `models/Widget.md` - Widget management

### 6. Documentation Guides (`docs/`)

**Purpose**: Comprehensive maintenance documentation

**Files**:
- `DEVVIT_QUICK_REFERENCE.md` - Quick reference card
- `DEVVIT_DOCS_MAINTENANCE.md` - Complete maintenance guide
- `README.md` - Documentation directory overview

## Usage Patterns

### Daily Development

```bash
# Check steering files for common methods
cat .kiro/steering/devvit-api-reference.md

# Search for specific method
grep -r "getSnoovatarUrl" docs/devvit-api/
```

### Weekly Maintenance

```bash
# Run intelligent sync
# Command Palette → "Sync Devvit Documentation"

# Or automated sync
npm run sync-docs

# Review changes
cat docs/devvit-sync-report-$(date +%Y-%m-%d).md
```

### After Version Update

```bash
# Update Devvit
npm install @devvit/web@latest

# Sync documentation
npm run sync-docs

# Check for breaking changes
git diff docs/devvit-api/RedditAPIClient.md
```

### When Encountering Errors

```bash
# 1. Check if method exists
grep "methodName" docs/devvit-api/RedditAPIClient.md

# 2. Check GitHub directly
open https://github.com/reddit/devvit/blob/main/devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md

# 3. Update local cache
npm run sync-docs
```

## Key Benefits

### 1. Always Current
- Automated sync keeps docs up-to-date
- Version tracking shows what changed
- Change detection highlights new methods

### 2. Multiple Access Points
- Steering files for quick reference
- Complete cache for deep dives
- MCP search for discovery
- GitHub for source of truth

### 3. Gap Identification
- Compares MCP coverage with GitHub
- Documents missing methods
- Highlights undocumented constraints

### 4. AI-Friendly
- Steering files auto-loaded in context
- Structured format for easy parsing
- Examples and patterns included

### 5. Low Maintenance
- Automated sync scripts
- Agent hook for intelligent updates
- Clear documentation for manual updates

## Critical Constraints Documented

### Redis Limitations
```typescript
// ❌ Regular sets NOT supported
await redis.sAdd('key', ['value']);
await redis.sMembers('key');

// ✅ Use sorted sets
await redis.zAdd('key', { member: 'value', score: Date.now() });
await redis.zRange('key', 0, -1);
```

### Realtime Channel Naming
```typescript
// ❌ Hyphens not allowed
await realtime.send('chat-messages', data);

// ✅ Underscores only
await realtime.send('chat_messages', data);
```

### Authentication
```typescript
// ❌ Method doesn't exist
const userId = await reddit.getCurrentUserId();

// ✅ Use context
const { userId } = context;
```

## Maintenance Schedule

| Frequency | Action | Tool |
|-----------|--------|------|
| Daily | Check steering files | Manual |
| Weekly | Run sync | Agent Hook or npm script |
| After version update | Full sync | npm run sync-docs |
| On error | Verify method | GitHub + sync |
| Monthly | Review reports | Manual |

## File Locations Quick Reference

```
Project Root
├── .kiro/
│   ├── hooks/
│   │   └── devvit-docs-sync.md              # Agent hook
│   └── steering/
│       ├── devvit-api-reference.md          # Quick reference (auto-loaded)
│       ├── devvit-constraints.md            # Limitations (auto-loaded)
│       ├── devvit-platform-guide.md         # Platform overview (auto-loaded)
│       ├── devvit-docs-maintenance.md       # Maintenance guide (auto-loaded)
│       └── devvit-quick-reference.md        # Quick reference card (auto-loaded)
│
├── docs/
│   ├── devvit-sync-report-*.md              # Sync history
│   └── devvit-api/                          # Complete API cache
│       ├── RedditAPIClient.md
│       └── models/
│           ├── User.md
│           ├── Post.md
│           ├── Comment.md
│           ├── Subreddit.md
│           ├── WikiPage.md
│           └── Widget.md
│
├── scripts/
│   ├── README.md                            # Scripts documentation
│   ├── sync-devvit-docs.js                  # Node.js sync (recommended)
│   └── sync-devvit-docs.sh                  # Shell sync (quick)
│
└── DEVVIT_KNOWLEDGE_SYSTEM.md               # This file
```

## Success Metrics

This system is successful when:

1. ✅ You can find any Devvit API method within seconds
2. ✅ You know immediately when methods are deprecated
3. ✅ You have working examples for complex operations
4. ✅ You understand platform constraints before hitting errors
5. ✅ You can sync documentation with a single command
6. ✅ AI assistants have accurate, current API information

## Future Enhancements

Potential improvements:

1. **Automated CI/CD sync** - GitHub Action to sync weekly
2. **Diff viewer** - Visual comparison of API changes
3. **Method usage tracking** - Track which methods you use most
4. **Breaking change alerts** - Notify when methods are deprecated
5. **Interactive examples** - Runnable code snippets
6. **Version comparison** - Compare APIs across versions

## Resources

- **GitHub Repo**: https://github.com/reddit/devvit
- **API Docs**: https://github.com/reddit/devvit/tree/main/devvit-docs/docs/api
- **Devvit Docs**: https://developers.reddit.com/docs
- **r/devvit**: https://www.reddit.com/r/devvit

## Getting Started

1. **Read the quick reference**:
   ```bash
   cat .kiro/steering/devvit-quick-reference.md
   ```

2. **Run your first sync**:
   ```bash
   npm run sync-docs
   ```

3. **Review the sync report**:
   ```bash
   cat docs/devvit-sync-report-$(date +%Y-%m-%d).md
   ```

4. **Check the API reference**:
   ```bash
   cat .kiro/steering/devvit-api-reference.md
   ```

5. **Start developing** with confidence!

## Quick Access

All documentation is now in `.kiro/steering/` and automatically loaded in every AI interaction:

- `devvit-quick-reference.md` - Start here for quick lookups
- `devvit-api-reference.md` - Common API methods with examples
- `devvit-constraints.md` - Critical platform limitations
- `devvit-docs-maintenance.md` - Complete maintenance guide
- `devvit-platform-guide.md` - Platform overview

---

**System Version**: 1.0  
**Created**: 2025-11-18  
**Devvit Version**: 0.12.4-dev  
**Status**: ✅ Fully Operational
