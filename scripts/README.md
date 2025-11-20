# Devvit Documentation Sync Scripts

This directory contains tools for keeping Devvit API documentation synchronized with the official GitHub repository.

## Available Scripts

### 1. generate-devvit-docs.js (Complete Generation)

**Comprehensive documentation generator with full API coverage**

```bash
node scripts/generate-devvit-docs.js [options]
```

**Features**:
- ✅ Fetches ALL API documentation from GitHub
- ✅ Parses type aliases, functions, classes, enums
- ✅ Organizes content by category
- ✅ Generates complete steering file
- ✅ Includes table of contents and cross-references
- ✅ Progress logging and error handling
- ✅ Validates completeness

**Options**:
```bash
--output <path>    Output file path (default: .kiro/steering/devvit-complete-api-reference.md)
--version <ver>    Devvit version to fetch (default: main branch)
--no-cache         Disable response caching
--verbose          Enable verbose logging
--help, -h         Show help message
```

**Output**:
- `.kiro/steering/devvit-complete-api-reference.md` - Complete API reference

**Best for**: Initial setup, major version updates, complete regeneration

### 2. sync-devvit-docs.js (Quick Sync)

**Node.js script with change detection and reporting**

```bash
npm run sync-docs
# or
node scripts/sync-devvit-docs.js
```

**Features**:
- ✅ Fetches core API docs from GitHub
- ✅ Detects new and removed methods
- ✅ Generates detailed sync reports
- ✅ Updates steering file timestamps
- ✅ Extracts version information
- ✅ Creates local API cache

**Output**:
- `docs/devvit-api/` - Core API documentation
- `docs/devvit-sync-report-[date].md` - Change report

**Best for**: Regular updates, change detection

### 3. sync-devvit-docs.sh (Fast Sync)

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

### Complete Documentation Generation

```bash
# Generate complete API reference (first time or major update)
node scripts/generate-devvit-docs.js

# Generate with verbose logging
node scripts/generate-devvit-docs.js --verbose

# Generate to custom location
node scripts/generate-devvit-docs.js --output docs/api-complete.md

# Show help
node scripts/generate-devvit-docs.js --help
```

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

### When to Use Which Script

| Scenario | Script | Reason |
|----------|--------|--------|
| Initial setup | `generate-devvit-docs.js` | Complete coverage |
| Major version update | `generate-devvit-docs.js` | Full regeneration |
| Weekly maintenance | `sync-devvit-docs.js` | Change detection |
| Quick check | `sync-devvit-docs.sh` | Fast and simple |
| Missing API methods | `generate-devvit-docs.js` | Comprehensive |

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

### Generation Script Issues

#### Script Fails During Discovery

**Problem**: Cannot list API directories

**Solutions**:
```bash
# Check GitHub API status
curl -I https://api.github.com/

# Verify directory paths
curl https://api.github.com/repos/reddit/devvit/contents/devvit-docs/docs/api/public-api

# Check rate limits
curl https://api.github.com/rate_limit
```

#### Script Fails During Fetching

**Problem**: Network errors or timeouts

**Solutions**:
1. Run with `--verbose` to see which file is failing
2. Check your internet connection
3. Wait a few minutes and retry (rate limiting)
4. Use `--no-cache` to force fresh fetches

```bash
# Debug with verbose logging
node scripts/generate-devvit-docs.js --verbose

# Force fresh fetch
node scripts/generate-devvit-docs.js --no-cache
```

#### Parsing Errors

**Problem**: Script fails to parse certain files

**Solutions**:
1. Check verbose output for specific file
2. Manually inspect the problematic file on GitHub
3. Script will continue with other files
4. Report parsing issues if consistent

#### Output File Too Large

**Problem**: Generated file exceeds 1MB

**Solutions**:
1. This is expected for complete API reference
2. Consider splitting into multiple files
3. Use sync script for smaller updates
4. Compress examples or reduce verbosity

### Sync Script Issues

#### Script Fails to Fetch

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

#### No Changes Detected

**Problem**: Script reports no changes but you know there are updates

**Solutions**:
1. Check GitHub commit history
2. Manually compare file contents
3. Clear cache and re-run
4. Verify you're on the correct branch

#### Permission Denied

**Problem**: Cannot execute scripts

**Solution**:
```bash
chmod +x scripts/sync-devvit-docs.sh
chmod +x scripts/generate-devvit-docs.js
```

### Rate Limiting

**Problem**: GitHub API rate limit exceeded

**Symptoms**:
- 403 errors
- "API rate limit exceeded" messages
- Script hangs or fails

**Solutions**:
```bash
# Check current rate limit status
curl https://api.github.com/rate_limit

# Wait for rate limit reset (shown in response)
# Unauthenticated: 60 requests/hour
# Authenticated: 5000 requests/hour

# Use GitHub token for higher limits (optional)
export GITHUB_TOKEN="your_token_here"
node scripts/generate-devvit-docs.js
```

### Memory Issues

**Problem**: Script runs out of memory

**Solutions**:
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 scripts/generate-devvit-docs.js

# Process in smaller batches (edit script)
# Reduce concurrency in fetchMultipleFiles calls
```

## Generation Script Workflow

The `generate-devvit-docs.js` script follows a 6-phase process:

### Phase 1: Discovery
- Scans GitHub repository for API files
- Identifies all documentation files to fetch
- Builds complete file inventory
- Estimates total content size

### Phase 2: Fetching
- Downloads files in parallel batches
- Implements rate limiting and retry logic
- Caches responses to minimize API calls
- Shows progress updates

### Phase 3: Parsing
- Extracts structured information from markdown
- Parses type signatures, parameters, examples
- Identifies cross-references
- Handles multiple documentation formats

### Phase 4: Organization
- Categorizes items by type and purpose
- Sorts alphabetically within categories
- Validates completeness
- Generates statistics

### Phase 5: Assembly
- Builds complete documentation structure
- Generates table of contents
- Adds cross-reference links
- Formats code blocks consistently

### Phase 6: Writing
- Writes output file
- Verifies file size
- Updates timestamps
- Reports completion

## Advanced Usage

### Custom GitHub Branch

Edit the script to generate from a different branch:

```javascript
// In generate-devvit-docs.js
const GITHUB_BRANCH = 'develop'; // or 'feature-branch'
```

### Custom Output Location

```bash
# Generate to different location
node scripts/generate-devvit-docs.js --output docs/custom-api-ref.md

# Generate multiple versions
node scripts/generate-devvit-docs.js --output docs/api-v0.12.md --version v0.12
node scripts/generate-devvit-docs.js --output docs/api-v0.13.md --version v0.13
```

### Additional API Paths

Add more API paths to discover:

```javascript
// In generate-devvit-docs.js, discoverAPIFiles function
const apiPaths = [
  // ... existing paths
  'devvit-docs/docs/api/public-api/interfaces',
  'devvit-docs/docs/api/redditapi/models/interfaces',
];
```

### Automated Generation

Set up a cron job or GitHub Action:

```bash
# Cron job (weekly on Monday at 9am)
0 9 * * 1 cd /path/to/project && node scripts/generate-devvit-docs.js

# GitHub Action (on Devvit version update)
# See .github/workflows/generate-docs.yml
```

### Custom Categorization

Modify category rules in `lib/category-organizer.js`:

```javascript
// Add new category
export const DocumentationCategory = {
  // ... existing categories
  CUSTOM_CATEGORY: 'My Custom Category'
};

// Add categorization rules
const CATEGORY_RULES = {
  [DocumentationCategory.CUSTOM_CATEGORY]: {
    patterns: ['MyPattern'],
    exact: ['MyType', 'MyClass']
  }
};
```

## Best Practices

### For Complete Generation

1. **Initial setup** - Run `generate-devvit-docs.js` when first setting up the project
2. **Major updates** - Regenerate after major Devvit version updates
3. **Review output** - Check generated file for completeness and accuracy
4. **Validate size** - Ensure output file is under 1MB for optimal performance
5. **Test references** - Verify cross-references and links work correctly
6. **Commit changes** - Track documentation updates in git with clear commit messages

### For Regular Syncing

1. **Sync regularly** - Weekly during active development
2. **Review reports** - Always check sync reports for breaking changes
3. **Test changes** - Verify new methods work as documented
4. **Update steering** - Keep steering files current with new patterns
5. **Commit changes** - Track documentation updates in git

### Documentation Maintenance Workflow

```
Week 1: Regular sync
  ↓
Week 2: Regular sync
  ↓
Week 3: Regular sync
  ↓
Week 4: Regular sync
  ↓
Month end: Full regeneration (if major changes)
  ↓
Review and commit
```

### Version Update Workflow

```
1. Update package.json
   ↓
2. Run generate-devvit-docs.js
   ↓
3. Review generated documentation
   ↓
4. Test new APIs in development
   ↓
5. Update steering files with new patterns
   ↓
6. Commit all changes
   ↓
7. Deploy to production
```

## Related Documentation

- [devvit-docs-maintenance.md](../.kiro/steering/devvit-docs-maintenance.md) - Complete maintenance guide
- [devvit-quick-reference.md](../.kiro/steering/devvit-quick-reference.md) - Quick reference card
- [devvit-docs-sync.md](../.kiro/hooks/devvit-docs-sync.md) - Agent hook definition
- [DEVVIT_KNOWLEDGE_SYSTEM.md](../DEVVIT_KNOWLEDGE_SYSTEM.md) - System overview

---

**Questions?** Check the maintenance guide or run the agent hook for intelligent assistance.


---

## Library Modules

The `lib/` directory contains reusable modules for comprehensive documentation generation:

### GitHubFetcher (`lib/github-fetcher.js`)

Handles fetching files and directories from GitHub with error handling and rate limiting.

**Features**:
- Single file fetching with caching
- Directory listing
- Batch file fetching with concurrency control
- Automatic retry with exponential backoff
- Rate limiting to avoid API limits

**Example**:
```javascript
import { GitHubFetcher } from './lib/index.js';

const fetcher = new GitHubFetcher('reddit/devvit', 'main');

// Fetch a single file
const content = await fetcher.fetchFile('path/to/file.md');

// Fetch directory listing
const files = await fetcher.fetchDirectory('path/to/dir');

// Fetch multiple files in parallel
const results = await fetcher.fetchMultipleFiles([
  'file1.md',
  'file2.md',
  'file3.md'
], 10); // 10 concurrent requests
```

### MarkdownParser (`lib/markdown-parser.js`)

Extracts structured information from Devvit API markdown documentation.

**Features**:
- Parse type aliases with properties
- Parse functions with parameters and return types
- Parse classes with methods and properties
- Parse enums with members
- Parse interfaces
- Extract code examples
- Extract cross-references

**Example**:
```javascript
import { MarkdownParser } from './lib/index.js';

const parser = new MarkdownParser();

// Parse function documentation
const functionDoc = parser.parseFunction(markdownContent);
console.log(functionDoc.name);
console.log(functionDoc.parameters);
console.log(functionDoc.examples);

// Parse type alias
const typeDoc = parser.parseTypeAlias(markdownContent);
console.log(typeDoc.signature);
console.log(typeDoc.properties);
```

### DocumentationBuilder (`lib/doc-builder.js`)

Assembles parsed content into organized documentation with table of contents.

**Features**:
- Add sections with automatic TOC generation
- Format type aliases, functions, classes, enums
- Generate cross-reference links
- Add metadata (version, date, commit)
- Build complete markdown documentation

**Example**:
```javascript
import { DocumentationBuilder } from './lib/index.js';

const builder = new DocumentationBuilder();

// Set metadata
builder.setMetadata({
  version: '0.12.4-dev',
  lastSynced: '2025-11-18',
  githubCommit: 'abc123'
});

// Add sections
builder.addSection('Core Classes', 'Documentation for core classes...');

// Add parsed items
const functionContent = builder.addFunction(parsedFunction);

// Generate final documentation
const markdown = builder.build();
```

### Utils (`lib/utils.js`)

Common helper functions for file operations, formatting, and validation.

**Features**:
- File system operations (ensureDir, writeFile, readFile)
- Version extraction from markdown
- Date formatting
- File size formatting
- Progress logging
- Item categorization
- Array utilities (sort, deduplicate, batch)
- Markdown validation
- Statistics generation

**Example**:
```javascript
import { ensureDir, writeFile, categorizeItem, validateMarkdown } from './lib/index.js';

// Ensure directory exists
ensureDir('./output/docs');

// Write file with auto-directory creation
writeFile('./output/docs/api.md', content);

// Categorize API items
const category = categorizeItem('RedisClient'); // Returns 'Redis'

// Validate markdown
const validation = validateMarkdown(markdownContent);
if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
```

## Testing Utilities

Run the test script to verify all utilities are working:

```bash
node scripts/test-utilities.js
```

This will test:
- GitHubFetcher initialization and caching
- MarkdownParser parsing capabilities
- DocumentationBuilder section management
- Utility functions

**Expected output**:
```
🧪 Testing Devvit Documentation Utilities

1️⃣  Testing GitHubFetcher...
   ✅ GitHubFetcher initialized
   📊 Cache stats: {"cacheSize":0,"requestCount":0}

2️⃣  Testing MarkdownParser...
   ✅ MarkdownParser working
   📝 Parsed function: TestFunction
   📝 Parameters: 1
   📝 Examples: 1

3️⃣  Testing DocumentationBuilder...
   ✅ DocumentationBuilder working
   📝 Sections: 1
   📝 TOC entries: 1

4️⃣  Testing utility functions...
   ✅ Utilities working
   📅 Current date: 2025-11-19

✅ All tests passed! Utilities are ready to use.
```

## Development

When adding new utilities:

1. Create module in `lib/` directory
2. Export from `lib/index.js`
3. Add tests to `test-utilities.js`
4. Update this README with usage examples

## Error Handling

All modules include comprehensive error handling:

- **GitHubFetcher**: Retries failed requests with exponential backoff
- **MarkdownParser**: Gracefully handles malformed markdown
- **DocumentationBuilder**: Validates content before building
- **Utils**: Safe file operations with error checking
