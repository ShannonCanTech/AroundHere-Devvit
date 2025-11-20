# Devvit Documentation Generation Guide

Complete guide for using the `generate-devvit-docs.js` script to create comprehensive API documentation.

## Overview

The generation script creates a complete, categorized API reference by:
1. Discovering all API files in the Devvit GitHub repository
2. Fetching and parsing documentation
3. Organizing content by category
4. Generating a single steering file with table of contents

## Quick Start

```bash
# Basic usage
node scripts/generate-devvit-docs.js

# With verbose logging
node scripts/generate-devvit-docs.js --verbose

# Custom output location
node scripts/generate-devvit-docs.js --output docs/my-api-ref.md
```

## Command Line Options

### --output, -o <path>
Specify output file path.

**Default**: `.kiro/steering/devvit-complete-api-reference.md`

**Examples**:
```bash
node scripts/generate-devvit-docs.js --output docs/api.md
node scripts/generate-devvit-docs.js -o .kiro/steering/custom-ref.md
```

### --version, -v <version>
Specify Devvit version or branch to fetch.

**Default**: `main`

**Examples**:
```bash
node scripts/generate-devvit-docs.js --version v0.12.4
node scripts/generate-devvit-docs.js --version develop
```

### --no-cache
Disable response caching and force fresh fetches.

**Default**: Caching enabled

**Example**:
```bash
node scripts/generate-devvit-docs.js --no-cache
```

### --verbose
Enable detailed logging for debugging.

**Default**: Normal logging

**Example**:
```bash
node scripts/generate-devvit-docs.js --verbose
```

### --help, -h
Show help message with all options.

**Example**:
```bash
node scripts/generate-devvit-docs.js --help
```

## Execution Phases

### Phase 1: Discovery (📋)
**What it does**: Scans GitHub repository for API documentation files

**Output**:
```
📋 Phase 1: Discovering API files...
   Scanning devvit-docs/docs/api/public-api/classes...
   Scanning devvit-docs/docs/api/public-api/functions...
   Found 150 API files
```

**What to watch for**:
- Number of files discovered
- Any scan failures (warnings)

### Phase 2: Fetching (📥)
**What it does**: Downloads documentation files in parallel batches

**Output**:
```
📥 Phase 2: Fetching documentation...
   Progress: 10/150 files
   Progress: 20/150 files
   ...
   Fetched 150 files
```

**What to watch for**:
- Progress updates
- Failed fetches (will continue with others)
- Rate limiting messages

### Phase 3: Parsing (📝)
**What it does**: Extracts structured information from markdown

**Output**:
```
📝 Phase 3: Parsing documentation...
   Parsed 150 items
```

**With --verbose**:
```
   Parsed: RedisClient (typeAlias)
   Parsed: useState (function)
   Parsed: Devvit (class)
```

**What to watch for**:
- Parsing failures (warnings)
- Item types being parsed

### Phase 4: Organization (🗂️)
**What it does**: Categorizes and sorts items

**Output**:
```
🗂️  Phase 4: Organizing by category...
   Organized into 10 categories
   Total items: 150
```

**What to watch for**:
- Number of categories with items
- Total item count matches parsed count

### Phase 5: Assembly (🔨)
**What it does**: Builds complete documentation with TOC

**Output**:
```
🔨 Phase 5: Building documentation...
   Generated 500000 characters
```

**What to watch for**:
- Character count (should be substantial)
- No build errors

### Phase 6: Writing (💾)
**What it does**: Writes output file and verifies

**Output**:
```
💾 Phase 6: Writing output file...
   File size: 0.48 MB
   ✅ Written to .kiro/steering/devvit-complete-api-reference.md
```

**What to watch for**:
- File size (should be under 1MB)
- Write location is correct

## Understanding the Output

### Summary Statistics

After completion, you'll see:

```
📊 Summary:
   Total items: 150
   Categories with items: 10
   Largest category: Reddit API Client (45 items)

   Category breakdown:
     - Core Classes: 2
     - Hooks: 6
     - Context & API Clients: 8
     - Event System: 25
     - Forms & UI: 12
     - Redis Client: 10
     - Scheduler & Jobs: 8
     - Reddit API Client: 45
     - Utility Types: 15
     - Enumerations: 3

📊 Cache Statistics:
   Cached items: 150
   Total requests: 150

✅ Documentation generation complete!
```

### Generated File Structure

The output file contains:

1. **Header with Metadata**
   - Version number
   - Last sync date
   - GitHub commit reference
   - Source URLs

2. **Table of Contents**
   - Quick navigation links
   - Full hierarchical contents
   - Category-based organization

3. **Category Sections**
   - Core Classes
   - Hooks
   - Context & API Clients
   - Event System
   - Forms & UI
   - Redis Client
   - Scheduler & Jobs
   - Reddit API Client
   - Utility Types
   - Enumerations

4. **Common Patterns**
   - Authentication examples
   - Redis usage patterns
   - Event handling patterns
   - Form handling patterns

5. **Footer**
   - Update instructions
   - Generation metadata

## Troubleshooting

### Discovery Phase Fails

**Symptom**: Cannot list API directories

**Cause**: GitHub API issues or network problems

**Solution**:
```bash
# Check GitHub API status
curl -I https://api.github.com/

# Verify directory exists
curl https://api.github.com/repos/reddit/devvit/contents/devvit-docs/docs/api/public-api

# Try with verbose logging
node scripts/generate-devvit-docs.js --verbose
```

### Fetching Phase Slow or Fails

**Symptom**: Progress stalls or many fetch failures

**Cause**: Rate limiting or network issues

**Solution**:
```bash
# Check rate limit status
curl https://api.github.com/rate_limit

# Wait for rate limit reset (shown in response)
# Unauthenticated: 60 requests/hour
# Authenticated: 5000 requests/hour

# Use GitHub token for higher limits
export GITHUB_TOKEN="your_token_here"
node scripts/generate-devvit-docs.js
```

### Parsing Phase Errors

**Symptom**: Warnings about failed parsing

**Cause**: Unexpected markdown format

**Solution**:
- Script continues with other files
- Check verbose output for specific file
- Manually inspect problematic file on GitHub
- Report consistent parsing issues

### Output File Too Large

**Symptom**: Warning about file size exceeding 1MB

**Cause**: Complete API reference is comprehensive

**Solution**:
- This is expected for full generation
- Consider splitting into multiple files
- Use sync script for incremental updates
- Optimize by removing verbose examples

### Memory Issues

**Symptom**: Script crashes with out-of-memory error

**Cause**: Processing many large files

**Solution**:
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 scripts/generate-devvit-docs.js

# Or reduce batch size in script
# Edit fetchDocumentation function:
const batchSize = 5; // Reduce from 10
```

## Performance Tips

### Optimize Fetching

1. **Use caching** (default behavior)
   - First run: ~2-3 minutes
   - Subsequent runs: ~30 seconds

2. **Reduce concurrency** if rate limited
   ```javascript
   // In generate-devvit-docs.js
   const batchSize = 5; // Reduce from 10
   ```

3. **Use GitHub token** for higher rate limits
   ```bash
   export GITHUB_TOKEN="your_token"
   ```

### Optimize Parsing

1. **Skip verbose logging** unless debugging
   ```bash
   # Fast
   node scripts/generate-devvit-docs.js
   
   # Slow (verbose)
   node scripts/generate-devvit-docs.js --verbose
   ```

2. **Use cached responses**
   ```bash
   # First run (slow)
   node scripts/generate-devvit-docs.js
   
   # Subsequent runs (fast)
   node scripts/generate-devvit-docs.js
   ```

## Integration with Development Workflow

### Initial Project Setup

```bash
# 1. Clone project
git clone <repo>

# 2. Install dependencies
npm install

# 3. Generate complete documentation
node scripts/generate-devvit-docs.js

# 4. Verify output
cat .kiro/steering/devvit-complete-api-reference.md | head -50

# 5. Commit
git add .kiro/steering/devvit-complete-api-reference.md
git commit -m "docs: generate complete Devvit API reference"
```

### After Devvit Version Update

```bash
# 1. Update Devvit version
npm install @devvit/web@latest

# 2. Regenerate documentation
node scripts/generate-devvit-docs.js

# 3. Review changes
git diff .kiro/steering/devvit-complete-api-reference.md

# 4. Test new APIs
npm run dev

# 5. Commit changes
git add .kiro/steering/devvit-complete-api-reference.md
git commit -m "docs: update API reference for Devvit v0.12.5"
```

### Monthly Maintenance

```bash
# 1. Check for Devvit updates
npm outdated @devvit/web

# 2. If updates available, update
npm install @devvit/web@latest

# 3. Regenerate documentation
node scripts/generate-devvit-docs.js --verbose

# 4. Review and test
git diff .kiro/steering/devvit-complete-api-reference.md
npm run dev

# 5. Update steering files with new patterns
# Edit .kiro/steering/devvit-api-reference.md

# 6. Commit all changes
git add .kiro/steering/
git commit -m "docs: monthly Devvit documentation update"
```

## Customization

### Change Output Format

Edit `lib/doc-builder.js` to customize:
- Section formatting
- Code block styling
- Cross-reference format
- Table of contents structure

### Add Custom Categories

Edit `lib/category-organizer.js`:

```javascript
// Add new category
export const DocumentationCategory = {
  // ... existing
  MY_CATEGORY: 'My Custom Category'
};

// Add categorization rules
const CATEGORY_RULES = {
  [DocumentationCategory.MY_CATEGORY]: {
    patterns: ['MyPattern'],
    exact: ['MyType']
  }
};
```

### Modify Discovery Paths

Edit `generate-devvit-docs.js`:

```javascript
// In discoverAPIFiles function
const apiPaths = [
  // ... existing paths
  'devvit-docs/docs/api/my-custom-path',
];
```

### Change Parsing Logic

Edit `lib/markdown-parser.js` to handle:
- Custom markdown formats
- Additional metadata extraction
- Different code example formats

## Best Practices

1. **Run on initial setup** - Generate complete reference when starting
2. **Regenerate after major updates** - Full regeneration for version changes
3. **Use verbose mode for debugging** - Helps identify issues
4. **Review output** - Check generated file for completeness
5. **Commit changes** - Track documentation in version control
6. **Test references** - Verify links and cross-references work
7. **Monitor file size** - Keep under 1MB for optimal performance
8. **Cache responses** - Use default caching for faster runs

## Related Documentation

- [README.md](./README.md) - Main scripts documentation
- [devvit-docs-maintenance.md](../.kiro/steering/devvit-docs-maintenance.md) - Maintenance guide
- [devvit-quick-reference.md](../.kiro/steering/devvit-quick-reference.md) - Quick reference
- [DEVVIT_KNOWLEDGE_SYSTEM.md](../DEVVIT_KNOWLEDGE_SYSTEM.md) - System overview

## Support

For issues or questions:
1. Check this guide first
2. Review troubleshooting section
3. Run with `--verbose` for detailed logs
4. Check GitHub repository for updates
5. Review sync reports for patterns

---

**Last Updated**: 2025-11-19  
**Script Version**: 1.0.0
