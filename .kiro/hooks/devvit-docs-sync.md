# Devvit Documentation Sync Hook

## Trigger
Manual trigger via command palette: "Sync Devvit Documentation"

## Purpose
Check for updates to Devvit API documentation and sync local reference files with the latest from GitHub.

## Actions

1. **Check Devvit Version**
   - Search for current version in package.json dependencies
   - Compare with latest GitHub release

2. **Fetch Latest API Docs**
   - Pull RedditAPIClient.md from reddit/devvit repo
   - Pull model class documentation (User, Post, Comment, Subreddit)
   - Pull public-api documentation

3. **Update Local References**
   - Update `.kiro/steering/devvit-api-reference.md`
   - Update `.kiro/steering/devvit-constraints.md`
   - Add changelog entry with what changed

4. **Validate Against MCP**
   - Test key API methods using mcp_devvit_mcp_devvit_search
   - Document any gaps between MCP server and GitHub docs
   - Create issue list of missing MCP coverage

5. **Generate Report**
   - Create `docs/devvit-sync-report-[date].md` with:
     - Version changes
     - New API methods discovered
     - Deprecated methods
     - MCP coverage gaps
     - Recommended steering file updates

## Prompt

```
Please sync our Devvit documentation with the latest from GitHub:

1. **Check Current Version**
   - Read package.json to find current @devvit/public-api version
   - Note version for comparison

2. **Fetch Latest Documentation**
   - Use mcp_github_get_file_contents to fetch:
     - devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md
     - devvit-docs/docs/api/redditapi/models/classes/User.md
     - devvit-docs/docs/api/redditapi/models/classes/Post.md
     - devvit-docs/docs/api/redditapi/models/classes/Comment.md
     - devvit-docs/docs/api/redditapi/models/classes/Subreddit.md
   - Extract version number from RedditAPIClient.md header

3. **Compare with Local Files**
   - Read .kiro/steering/devvit-api-reference.md
   - Read .kiro/steering/devvit-constraints.md
   - Identify new methods, changed signatures, deprecations
   - Note methods in GitHub docs but not in steering files

4. **Test Against MCP Server**
   - Use mcp_devvit_mcp_devvit_search to test coverage of:
     - New methods discovered
     - Commonly used methods (getSnoovatarUrl, getUserByUsername, etc.)
     - Redis operations
     - Realtime channel methods
   - Document which methods MCP can/cannot find

5. **Update Steering Files**
   - Add new commonly-used methods to devvit-api-reference.md
   - Update examples if signatures changed
   - Add new constraints to devvit-constraints.md
   - Update version and last synced date

6. **Generate Sync Report**
   - Create docs/devvit-sync-report-[date].md with:
     - Version changes
     - New methods (with signatures)
     - Deprecated methods
     - MCP coverage gaps
     - Recommended actions
     - Code migration examples if needed

Focus Areas:
- RedditAPIClient methods (especially user, post, comment operations)
- User, Post, Comment, Subreddit model methods
- Redis API changes (critical due to limitations)
- Realtime API changes (channel naming, send/receive)
- Context object properties (userId, postId, etc.)
- Authentication patterns

Output Format:
- Clear summary of what changed
- Actionable recommendations
- Code examples for new methods
- Migration patterns for deprecated methods
```

## Frequency
Run manually when:
- Starting a new feature that uses unfamiliar APIs
- After updating Devvit version in package.json
- Weekly during active development
- When encountering "method not found" errors
