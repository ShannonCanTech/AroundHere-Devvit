# Design Document

## Overview

This design outlines the approach for creating comprehensive Devvit API documentation by fetching, organizing, and formatting content from the official Devvit GitHub repository. The documentation will be stored as a steering file that provides complete API reference during development.

## Architecture

### High-Level Structure

```
.kiro/steering/
└── devvit-complete-api-reference.md (Main documentation file)

GitHub Sources:
├── devvit-docs/docs/api/public-api/
│   ├── type-aliases/          (100+ type definitions)
│   ├── functions/              (8 core functions)
│   ├── classes/                (2 main classes)
│   ├── enumerations/           (3 enums)
│   ├── variables/              (1 variable)
│   └── @devvit/namespaces/
│       └── EventTypes/         (Event system)
└── devvit-docs/versioned_docs/version-0.12/api/
    ├── public-api/             (Version-specific docs)
    └── redditapi/
        └── RedditAPIClient/    (Reddit API methods)
```

### Documentation Organization

The steering file will be organized into the following sections:

1. **Header & Metadata**
   - Version information
   - Last sync date
   - GitHub commit reference
   - Quick navigation links

2. **Core Classes**
   - Devvit class (main entry point)
   - RichTextBuilder class

3. **Functions**
   - Hook functions (useState, useAsync, useInterval, etc.)
   - Utility functions (svg, fetchDevvitWeb)

4. **Type Aliases** (Organized by category)
   - Context Types
   - Event Types
   - Form Types
   - Redis Types
   - Scheduler Types
   - UI Types
   - Utility Types

5. **Enumerations**
   - DeletionReason
   - EventSource
   - SettingScope

6. **EventTypes Namespace**
   - Event interfaces
   - Event handler types
   - Trigger definitions

7. **RedditAPIClient Reference**
   - User methods
   - Post methods
   - Comment methods
   - Subreddit methods
   - Moderation methods

8. **Common Patterns & Examples**
   - Authentication patterns
   - Redis usage patterns
   - Event handling patterns
   - Form handling patterns

## Components and Interfaces

### Documentation Fetcher

**Purpose**: Fetch markdown files from GitHub repository

**Interface**:
```typescript
interface GitHubFetcher {
  fetchFile(path: string): Promise<string>
  fetchDirectory(path: string): Promise<FileInfo[]>
  fetchMultipleFiles(paths: string[]): Promise<Map<string, string>>
}

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string
}
```

**Responsibilities**:
- Fetch individual markdown files from GitHub
- List directory contents
- Handle rate limiting and errors
- Cache responses to minimize API calls

### Content Parser

**Purpose**: Parse and extract relevant information from markdown files

**Interface**:
```typescript
interface ContentParser {
  parseTypeAlias(markdown: string): TypeAliasDoc
  parseFunction(markdown: string): FunctionDoc
  parseClass(markdown: string): ClassDoc
  parseEnum(markdown: string): EnumDoc
  parseInterface(markdown: string): InterfaceDoc
}

interface TypeAliasDoc {
  name: string
  description: string
  signature: string
  properties?: PropertyDoc[]
  examples?: string[]
}

interface FunctionDoc {
  name: string
  description: string
  signature: string
  parameters: ParameterDoc[]
  returns: string
  examples?: string[]
}

interface PropertyDoc {
  name: string
  type: string
  description: string
  optional: boolean
}

interface ParameterDoc {
  name: string
  type: string
  description: string
  optional: boolean
}
```

**Responsibilities**:
- Extract type signatures
- Parse parameter descriptions
- Extract code examples
- Clean up markdown formatting
- Identify cross-references

### Documentation Builder

**Purpose**: Assemble parsed content into organized documentation

**Interface**:
```typescript
interface DocumentationBuilder {
  addSection(title: string, content: string): void
  addTypeAlias(doc: TypeAliasDoc): void
  addFunction(doc: FunctionDoc): void
  addClass(doc: ClassDoc): void
  addEnum(doc: EnumDoc): void
  generateTableOfContents(): string
  build(): string
}
```

**Responsibilities**:
- Organize content by category
- Generate table of contents with anchor links
- Format code blocks consistently
- Add cross-references
- Generate final markdown output

### Category Organizer

**Purpose**: Group related types and functions into logical categories

**Categories**:
```typescript
enum DocumentationCategory {
  CORE_CLASSES = 'Core Classes',
  HOOKS = 'Hooks',
  CONTEXT_TYPES = 'Context & API Clients',
  EVENT_TYPES = 'Event System',
  FORM_TYPES = 'Forms & UI',
  REDIS_TYPES = 'Redis Client',
  SCHEDULER_TYPES = 'Scheduler & Jobs',
  REDDIT_API = 'Reddit API Client',
  UTILITY_TYPES = 'Utility Types',
  ENUMERATIONS = 'Enumerations'
}

interface CategoryOrganizer {
  categorize(item: DocumentationItem): DocumentationCategory
  sortWithinCategory(items: DocumentationItem[]): DocumentationItem[]
}
```

**Categorization Rules**:
- Context-related: BaseContext, ContextAPIClients, TriggerContext, JobContext
- Event-related: All EventTypes namespace items, trigger definitions
- Form-related: Form, FormField, FormDefinition, field types
- Redis-related: RedisClient, ZMember, SetOptions, transaction types
- Scheduler-related: ScheduledJob, CronJob, RunJob, CancelJob
- Reddit API: All RedditAPIClient methods and model types
- Hooks: useState, useAsync, useInterval, useChannel, useForm, useWebView
- Utility: JSONValue, JSONObject, Data, Metadata

## Data Models

### Documentation Metadata

```typescript
interface DocumentationMetadata {
  version: string              // e.g., "0.12.4-dev"
  lastSynced: string          // ISO date string
  githubCommit: string        // Commit SHA
  sourceUrls: string[]        // GitHub source URLs
  totalItems: {
    typeAliases: number
    functions: number
    classes: number
    enums: number
    interfaces: number
  }
}
```

### GitHub API Response Models

```typescript
interface GitHubFileResponse {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: 'file' | 'dir'
  content?: string            // Base64 encoded
  encoding?: string
}

interface GitHubDirectoryResponse {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir'
}
```

## Processing Strategy

### Phase 1: Discovery
1. Fetch directory listings for each API section
2. Build complete file inventory
3. Identify priority files (RedisClient, RedditAPIClient, core types)
4. Estimate total content size

### Phase 2: Content Fetching
1. Fetch high-priority files first (RedisClient, EventTypes, core hooks)
2. Batch fetch type aliases (100+ files)
3. Fetch remaining functions and classes
4. Fetch versioned documentation
5. Cache all responses

### Phase 3: Parsing
1. Parse each markdown file
2. Extract structured information
3. Identify cross-references
4. Collect code examples
5. Build category mappings

### Phase 4: Organization
1. Group items by category
2. Sort alphabetically within categories
3. Generate table of contents
4. Add navigation links
5. Format code blocks

### Phase 5: Assembly
1. Write header with metadata
2. Write table of contents
3. Write each category section
4. Add common patterns section
5. Add footer with update instructions

## Error Handling

### GitHub API Errors

**Rate Limiting**:
- Detect 403 rate limit responses
- Implement exponential backoff
- Cache responses to minimize requests
- Provide progress feedback

**Network Errors**:
- Retry failed requests (max 3 attempts)
- Log failed file paths
- Continue processing other files
- Report missing content in final doc

**Content Errors**:
- Handle malformed markdown gracefully
- Skip unparseable files with warning
- Use fallback formatting for edge cases
- Document parsing failures

### Validation

**Content Validation**:
- Verify all priority files were fetched
- Check for minimum content thresholds
- Validate markdown syntax
- Ensure all categories have content

**Quality Checks**:
- Verify code examples are complete
- Check for broken internal links
- Ensure consistent formatting
- Validate type signatures

## Testing Strategy

### Unit Testing
- Test markdown parsing functions
- Test categorization logic
- Test content formatting
- Test error handling

### Integration Testing
- Test GitHub API fetching
- Test end-to-end documentation generation
- Test with sample files
- Verify output format

### Manual Verification
- Review generated documentation
- Test navigation links
- Verify code examples
- Check completeness against source

## Performance Considerations

### Optimization Strategies

**Batching**:
- Fetch multiple files in parallel (max 10 concurrent)
- Group small files into single requests
- Use directory listings to minimize API calls

**Caching**:
- Cache GitHub responses during generation
- Store intermediate parsed results
- Reuse parsed content for cross-references

**Streaming**:
- Process files as they're fetched
- Write output incrementally
- Provide progress updates

### Resource Limits

**GitHub API**:
- Rate limit: 60 requests/hour (unauthenticated)
- Rate limit: 5000 requests/hour (authenticated)
- File size limit: 1MB per file
- Total files: ~150-200 files

**Output Size**:
- Estimated final size: 500KB - 1MB
- Target: Single steering file
- Format: Markdown with code blocks

## Documentation Format

### Section Template

```markdown
## Category Name

### ItemName

**Type**: Type Alias | Function | Class | Enum | Interface

**Description**: Brief description of the item

**Signature**:
```typescript
type ItemName = ...
```

**Properties** (if applicable):
- `propertyName`: `type` - Description

**Parameters** (if applicable):
- `paramName`: `type` - Description

**Returns** (if applicable):
`ReturnType` - Description

**Example**:
```typescript
// Usage example
```

**See Also**: [RelatedItem](#relateditem)

---
```

### Code Block Formatting

**Type Signatures**:
- Use TypeScript syntax highlighting
- Include full type definitions
- Show generic parameters
- Include JSDoc comments if available

**Examples**:
- Use TypeScript syntax highlighting
- Include context setup
- Show complete working examples
- Add comments explaining key points

### Cross-References

**Link Format**:
- Use markdown anchor links: `[TypeName](#typename)`
- Convert names to lowercase for anchors
- Replace spaces with hyphens
- Link related types in descriptions

## Maintenance Strategy

### Update Process

**Manual Updates**:
1. Run documentation generation script
2. Review changes in git diff
3. Update version metadata
4. Commit updated steering file

**Automated Updates** (Future):
1. GitHub Action on Devvit releases
2. Automatic PR with updated docs
3. Version comparison report
4. Breaking change detection

### Version Tracking

**Metadata Section**:
```markdown
# Devvit Complete API Reference

**Version**: 0.12.4-dev
**Last Synced**: 2025-01-18
**GitHub Commit**: 80e75f1642065894490d119bcf966ac7afb29da0
**Source**: https://github.com/reddit/devvit

## Update Instructions

To update this documentation:
1. Run: `node scripts/generate-devvit-docs.js`
2. Review changes
3. Update version number
4. Commit changes
```

## Deliverables

1. **Primary Deliverable**:
   - `.kiro/steering/devvit-complete-api-reference.md` - Complete API documentation

2. **Supporting Files**:
   - `scripts/generate-devvit-docs.js` - Documentation generation script
   - `scripts/lib/github-fetcher.js` - GitHub API client
   - `scripts/lib/markdown-parser.js` - Markdown parsing utilities
   - `scripts/lib/doc-builder.js` - Documentation assembly

3. **Documentation**:
   - Generation script README
   - Update instructions
   - Troubleshooting guide

## Success Criteria

The design will be considered successful when:

1. All 10 requirement categories are fully documented
2. Documentation is searchable and well-organized
3. Code examples are complete and accurate
4. Cross-references work correctly
5. Generation script runs without errors
6. Output file is under 1MB
7. All priority APIs are documented (Redis, Reddit, Events, Hooks)
8. Documentation can be regenerated for new versions
