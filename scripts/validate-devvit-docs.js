#!/usr/bin/env node

/**
 * Validation script for Devvit API documentation
 * Checks completeness, broken links, and code examples
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// Read the documentation file
const docPath = path.join(__dirname, '..', '.kiro', 'steering', 'devvit-complete-api-reference.md');
const docContent = fs.readFileSync(docPath, 'utf-8');

// Validation results
const results = {
  totalChecks: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
  warnings: [],
};

function addError(message) {
  results.errors.push(message);
  results.failed++;
  results.totalChecks++;
}

function addWarning(message) {
  results.warnings.push(message);
  results.warnings++;
  results.totalChecks++;
}

function addPass() {
  results.passed++;
  results.totalChecks++;
}

// ============================================================================
// 1. Validate Priority APIs (Requirements 1.1-1.6, 2.1-2.5, 3.1-3.5, etc.)
// ============================================================================

logSection('1. Validating Priority API Coverage');

const priorityAPIs = {
  // Requirement 1.1-1.6: Complete API Coverage
  'Type Aliases': ['Context', 'BaseContext', 'TriggerContext', 'JobContext'],
  'Functions': ['useState', 'useAsync', 'useInterval', 'useChannel', 'useForm', 'useWebView', 'svg', 'fetchDevvitWeb'],
  'Classes': ['Devvit', 'RichTextBuilder'],
  'Enumerations': ['DeletionReason', 'EventSource', 'SettingScope'],
  'EventTypes': ['PostCreate', 'PostUpdate', 'CommentCreate', 'CommentUpdate', 'AppInstall'],
  
  // Requirement 2.1-2.5: RedditAPIClient
  'RedditAPIClient User Methods': ['getUserByUsername', 'getUserById', 'getCurrentUser', 'getCurrentUsername'],
  'RedditAPIClient Post Methods': ['getPostById', 'submitPost', 'getHotPosts', 'getNewPosts'],
  'RedditAPIClient Comment Methods': ['getCommentById', 'submitComment', 'getComments'],
  'RedditAPIClient Subreddit Methods': ['getCurrentSubreddit', 'getSubredditInfoByName', 'getSubredditInfoById'],
  'RedditAPIClient Model Classes': ['User', 'Post', 'Comment', 'Subreddit'],
  
  // Requirement 4.1-4.6: Redis Client
  'Redis Operations': ['zAdd', 'zRange', 'zRem', 'zScore', 'hSet', 'hGet', 'hGetAll'],
  
  // Requirement 5.1-5.5: Forms & UI
  'Form Types': ['Form', 'FormField', 'StringField', 'NumberField', 'SelectField'],
  
  // Requirement 6.1-6.6: Hooks
  'Hooks': ['useState', 'useAsync', 'useInterval', 'useChannel', 'useForm', 'useWebView'],
  
  // Requirement 7.1-7.5: Scheduler
  'Scheduler': ['Scheduler', 'ScheduledJob', 'runJob', 'cancelJob'],
};

for (const [category, items] of Object.entries(priorityAPIs)) {
  log(`\nChecking ${category}:`, 'blue');
  for (const item of items) {
    if (docContent.includes(item)) {
      log(`  ✓ ${item}`, 'green');
      addPass();
    } else {
      log(`  ✗ ${item} - NOT FOUND`, 'red');
      addError(`Missing priority API: ${item} in ${category}`);
    }
  }
}

// ============================================================================
// 2. Check for Broken Links (Requirement 9.4)
// ============================================================================

logSection('2. Validating Internal Links');

// Extract all markdown links
const linkRegex = /\[([^\]]+)\]\(#([^\)]+)\)/g;
const links = [];
let match;

while ((match = linkRegex.exec(docContent)) !== null) {
  links.push({
    text: match[1],
    anchor: match[2],
    fullMatch: match[0],
  });
}

log(`Found ${links.length} internal links`, 'blue');

// Extract all anchors (headers)
const headerRegex = /^#{1,6}\s+(.+)$/gm;
const anchors = new Set();

while ((match = headerRegex.exec(docContent)) !== null) {
  const headerText = match[1];
  // Convert to anchor format (lowercase, replace spaces with hyphens)
  const anchor = headerText
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  anchors.add(anchor);
}

log(`Found ${anchors.size} anchors (headers)`, 'blue');

// Check each link
let brokenLinks = 0;
for (const link of links) {
  if (!anchors.has(link.anchor)) {
    log(`  ✗ Broken link: ${link.fullMatch}`, 'red');
    addError(`Broken internal link: ${link.text} -> #${link.anchor}`);
    brokenLinks++;
  }
}

if (brokenLinks === 0) {
  log('  ✓ All internal links are valid', 'green');
  addPass();
} else {
  log(`  Found ${brokenLinks} broken links`, 'red');
}

// ============================================================================
// 3. Validate Code Examples (Requirement 9.5)
// ============================================================================

logSection('3. Validating Code Examples');

// Extract all code blocks
const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
const codeBlocks = [];

while ((match = codeBlockRegex.exec(docContent)) !== null) {
  codeBlocks.push({
    language: match[1] || 'unknown',
    code: match[2],
  });
}

log(`Found ${codeBlocks.length} code blocks`, 'blue');

// Check TypeScript code blocks for common issues
const tsBlocks = codeBlocks.filter(b => b.language === 'typescript');
log(`Checking ${tsBlocks.length} TypeScript examples`, 'blue');

let invalidExamples = 0;
for (const block of tsBlocks) {
  const code = block.code;
  
  // Check for incomplete examples (e.g., just "...")
  if (code.trim() === '...' || code.trim().length < 10) {
    addWarning('Found very short or placeholder code example');
    invalidExamples++;
    continue;
  }
  
  // Check for common syntax errors
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  
  if (openBraces !== closeBraces) {
    addWarning('Code example has mismatched braces');
    invalidExamples++;
  }
  
  if (openParens !== closeParens) {
    addWarning('Code example has mismatched parentheses');
    invalidExamples++;
  }
}

if (invalidExamples === 0) {
  log('  ✓ All code examples appear valid', 'green');
  addPass();
} else {
  log(`  ⚠ Found ${invalidExamples} potentially invalid examples`, 'yellow');
}

// ============================================================================
// 4. Verify Completeness Against Requirements
// ============================================================================

logSection('4. Verifying Completeness Against Requirements');

const requiredSections = [
  'Core Classes',
  'Functions',
  'Type Aliases',
  'Enumerations',
  'EventTypes Namespace',
  'RedditAPIClient',
  'Common Patterns',
];

log('Checking required sections:', 'blue');
for (const section of requiredSections) {
  if (docContent.includes(`## ${section}`)) {
    log(`  ✓ ${section}`, 'green');
    addPass();
  } else {
    log(`  ✗ ${section} - NOT FOUND`, 'red');
    addError(`Missing required section: ${section}`);
  }
}

// Check for specific subsections
const requiredSubsections = [
  'Context & API Clients',
  'Event System',
  'Forms & UI',
  'Redis Client',
  'Scheduler & Jobs',
  'User Methods',
  'Post Methods',
  'Comment Methods',
  'Subreddit Methods',
  'Moderation Methods',
];

log('\nChecking required subsections:', 'blue');
for (const subsection of requiredSubsections) {
  if (docContent.includes(`### ${subsection}`) || docContent.includes(`## ${subsection}`)) {
    log(`  ✓ ${subsection}`, 'green');
    addPass();
  } else {
    log(`  ✗ ${subsection} - NOT FOUND`, 'red');
    addError(`Missing required subsection: ${subsection}`);
  }
}

// ============================================================================
// 5. Check Metadata and Version Info (Requirement 10.1-10.5)
// ============================================================================

logSection('5. Validating Metadata and Version Info');

const metadataChecks = [
  { name: 'Version number', pattern: /\*\*Version\*\*:\s*[\d.]+/ },
  { name: 'Last synced date', pattern: /\*\*Last Synced\*\*:\s*\d{4}-\d{2}-\d{2}/ },
  { name: 'GitHub commit', pattern: /\*\*GitHub Commit\*\*:/ },
  { name: 'Source URL', pattern: /\*\*Source\*\*:.*github\.com/ },
];

for (const check of metadataChecks) {
  if (check.pattern.test(docContent)) {
    log(`  ✓ ${check.name}`, 'green');
    addPass();
  } else {
    log(`  ✗ ${check.name} - NOT FOUND`, 'red');
    addError(`Missing metadata: ${check.name}`);
  }
}

// ============================================================================
// 6. Check Table of Contents (Requirement 9.2)
// ============================================================================

logSection('6. Validating Table of Contents');

if (docContent.includes('## Table of Contents')) {
  log('  ✓ Table of Contents exists', 'green');
  addPass();
  
  // Check if TOC has links
  const tocSection = docContent.split('## Table of Contents')[1]?.split('---')[0];
  if (tocSection && tocSection.includes('](#')) {
    log('  ✓ Table of Contents has links', 'green');
    addPass();
  } else {
    log('  ✗ Table of Contents missing links', 'red');
    addError('Table of Contents does not contain anchor links');
  }
} else {
  log('  ✗ Table of Contents not found', 'red');
  addError('Missing Table of Contents');
}

// ============================================================================
// 7. Check File Size (Requirement 9.5)
// ============================================================================

logSection('7. Validating File Size');

const stats = fs.statSync(docPath);
const fileSizeKB = stats.size / 1024;
const fileSizeMB = fileSizeKB / 1024;

log(`File size: ${fileSizeKB.toFixed(2)} KB (${fileSizeMB.toFixed(2)} MB)`, 'blue');

if (fileSizeMB < 1) {
  log('  ✓ File size is under 1MB', 'green');
  addPass();
} else {
  log('  ⚠ File size exceeds 1MB', 'yellow');
  addWarning(`File size (${fileSizeMB.toFixed(2)} MB) exceeds recommended 1MB limit`);
}

// ============================================================================
// 8. Check for Redis Constraints Documentation
// ============================================================================

logSection('8. Validating Platform Constraints Documentation');

const constraintChecks = [
  { name: 'Redis sets not supported', text: 'Regular Redis sets' },
  { name: 'Sorted sets alternative', text: 'sorted sets' },
  { name: 'Realtime channel naming', text: 'underscores' },
  { name: 'Authentication pattern', text: 'context.userId' },
];

for (const check of constraintChecks) {
  if (docContent.toLowerCase().includes(check.text.toLowerCase())) {
    log(`  ✓ ${check.name} documented`, 'green');
    addPass();
  } else {
    log(`  ⚠ ${check.name} may not be documented`, 'yellow');
    addWarning(`Platform constraint may be missing: ${check.name}`);
  }
}

// ============================================================================
// Final Report
// ============================================================================

logSection('Validation Summary');

log(`\nTotal checks: ${results.totalChecks}`, 'blue');
log(`Passed: ${results.passed}`, 'green');
log(`Failed: ${results.failed}`, 'red');
log(`Warnings: ${results.warnings}`, 'yellow');

if (results.errors.length > 0) {
  log('\n❌ ERRORS:', 'red');
  results.errors.forEach((error, i) => {
    log(`  ${i + 1}. ${error}`, 'red');
  });
}

if (results.warnings.length > 0) {
  log('\n⚠️  WARNINGS:', 'yellow');
  results.warnings.forEach((warning, i) => {
    log(`  ${i + 1}. ${warning}`, 'yellow');
  });
}

// Calculate success rate
const successRate = ((results.passed / results.totalChecks) * 100).toFixed(1);
log(`\nSuccess Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');

// Exit with appropriate code
if (results.failed > 0) {
  log('\n❌ Validation FAILED', 'red');
  process.exit(1);
} else if (results.warnings > 0) {
  log('\n⚠️  Validation PASSED with warnings', 'yellow');
  process.exit(0);
} else {
  log('\n✅ Validation PASSED', 'green');
  process.exit(0);
}
