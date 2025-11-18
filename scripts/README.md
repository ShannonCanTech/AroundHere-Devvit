# Devvit Documentation Sync Scripts

This directory contains tools for keeping Devvit API documentation synchronized with the official GitHub repository.

## Available Scripts

### 1. sync-devvit-docs.js (Recommended)

**Node.js script with change detection and reporting**

```bash
npm run sync-docs
# or
node scripts/sync-devvit-docs.js
```

**Features**:
- ✅ Fetches latest API docs from GitHub
- ✅ Detects new and removed methods
- ✅ Generates detailed sync reports
- ✅ Updates steering file timestamps
- ✅ Extracts version information
- ✅ Creates local API cache

**Output**:
- `docs/devvit-api/` - Complete API documentation
- `docs/devvit-sync-report-[date].md` - Change report

### 2. sync-devvit-docs.sh

**Shell script for quick manual syncs**

```bash
./scripts/sync-devvit-docs.sh
```

**Features**:
- ✅ Fast and lightweight
- ✅ No dependencies
- ✅ Downloads core API files
- ✅ Updates timestamps

**Best for**: Quick updates without detailed analysis

## What Gets Synced

### Core API Documentation

1. **RedditAPIClient.md**
   - Main API client methods
   - All reddit.* methods
   - ~150+ methods

2. **Model Classes**
   - User.md - User object methods
   - Post.md - Post object methods
   - Comment.md - Comment object methods
   - Subreddit.md - Subreddit object methods
   - WikiPage.md - Wiki operations
   - Widget.md - Widget management

### File Locations

```
docs/devvit-api/
├── RedditAPIClient.md          # Main API client
└── models/
    ├── User.md                 # User methods
    ├── Post.md                 # Post methods
    ├── Comment.md              # Comment methods
    ├── Subreddit.md            # Subreddit methods
    ├── WikiPage.md             # Wiki methods
    └── Widget.md               # Widget methods
```

## Usage Examples

### Regular Sync (Weekly)

```bash
# Run the Node.js script for full analysis
npm run sync-docs

# Review the generated report
cat docs/devvit-sync-report-$(date +%Y-%m-%d).md

# Check for new methods
grep "New Methods" docs/devvit-sync-report-*.md | tail -1
```

### Quick Sync (After Version Update)

```bash
# Update package.json first
npm install @devvit/web@latest

# Sync docs
npm run sync-docs

# Review changes
git diff docs/devvit-api/
```

### Manual Verification

```bash
# Fetch specific file
curl -s https://raw.githubusercontent.com/reddit/devvit/main/devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md \
  -o docs/devvit-api/RedditAPIClient.md

# Compare with local
diff docs/devvit-api/RedditAPIClient.md <(curl -s https://raw.githubusercontent.com/reddit/devvit/main/devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md)
```

## Integration with Agent Hooks

The sync scripts work alongside the Kiro agent hook:

```
Agent Hook (Smart)
    ↓
Runs sync script
    ↓
Analyzes changes
    ↓
Tests MCP coverage
    ↓
Updates steering files
    ↓
Generates report
```

**To use with agent hook**:
1. Open Command Palette (Cmd+Shift+P)
2. Search "Sync Devvit Documentation"
3. Agent will run sync and provide analysis

## Sync Report Format

After running `sync-devvit-docs.js`, you'll get a report like:

```markdown
# Devvit Sync Report - 2025-11-18

## Version Information
**Current Version**: 0.12.4-dev
**Sync Date**: 2025-11-18

## Files Updated
- RedditAPIClient.md
- User.md
- Post.md
- Comment.md
- Subreddit.md

## API Changes

### New Methods (3)
- `getSnoovatarUrl()`
- `getSubredditLeaderboard()`
- `getSubredditStyles()`

### Removed/Deprecated Methods (1)
- `getSubredditByName()` (use getSubredditInfoByName)

## Recommended Actions
1. Review new methods in docs/devvit-api/RedditAPIClient.md
2. Test new methods against Devvit MCP server
3. Update .kiro/steering/devvit-api-reference.md
```

## Troubleshooting

### Script Fails to Fetch

**Problem**: Network errors or 404s

**Solutions**:
```bash
# Check GitHub API status
curl -I https://api.github.com/

# Verify file paths
curl -I https://raw.githubusercontent.com/reddit/devvit/main/devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md

# Check rate limits
curl https://api.github.com/rate_limit
```

### No Changes Detected

**Problem**: Script reports no changes but you know there are updates

**Solutions**:
1. Check GitHub commit history
2. Manually compare file contents
3. Clear cache and re-run
4. Verify you're on the correct branch

### Permission Denied

**Problem**: Cannot execute scripts

**Solution**:
```bash
chmod +x scripts/sync-devvit-docs.sh
chmod +x scripts/sync-devvit-docs.js
```

## Advanced Usage

### Custom GitHub Branch

Edit the script to sync from a different branch:

```javascript
// In sync-devvit-docs.js
const GITHUB_BRANCH = 'develop'; // or 'feature-branch'
```

### Additional Files

Add more files to sync:

```javascript
// In sync-devvit-docs.js
const API_FILES = [
  // ... existing files
  'devvit-docs/docs/api/redditapi/models/classes/ModNote.md',
  'devvit-docs/docs/api/redditapi/models/classes/FlairTemplate.md',
];
```

### Automated Sync

Set up a cron job or GitHub Action:

```bash
# Cron job (daily at 9am)
0 9 * * * cd /path/to/project && npm run sync-docs

# GitHub Action (weekly)
# See .github/workflows/sync-docs.yml
```

## Best Practices

1. **Sync regularly** - Weekly during active development
2. **Review reports** - Always check sync reports for breaking changes
3. **Test changes** - Verify new methods work as documented
4. **Update steering** - Keep steering files current with new patterns
5. **Commit changes** - Track documentation updates in git

## Related Documentation

- [devvit-docs-maintenance.md](../.kiro/steering/devvit-docs-maintenance.md) - Complete maintenance guide
- [devvit-quick-reference.md](../.kiro/steering/devvit-quick-reference.md) - Quick reference card
- [devvit-docs-sync.md](../.kiro/hooks/devvit-docs-sync.md) - Agent hook definition
- [DEVVIT_KNOWLEDGE_SYSTEM.md](../DEVVIT_KNOWLEDGE_SYSTEM.md) - System overview

---

**Questions?** Check the maintenance guide or run the agent hook for intelligent assistance.
