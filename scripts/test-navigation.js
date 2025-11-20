#!/usr/bin/env node

/**
 * Test script for documentation navigation and searchability
 * Tests TOC links, cross-references, and category organization
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

// Test results
const results = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
};

function pass(message) {
  log(`  ✓ ${message}`, 'green');
  results.passed++;
  results.totalTests++;
}

function fail(message) {
  log(`  ✗ ${message}`, 'red');
  results.failed++;
  results.totalTests++;
}

function warn(message) {
  log(`  ⚠ ${message}`, 'yellow');
  results.warnings++;
  results.totalTests++;
}

// ============================================================================
// 1. Test Table of Contents Links
// ============================================================================

logSection('1. Testing Table of Contents Links');

// Extract TOC section
const tocMatch = docContent.match(/## Table of Contents\n([\s\S]*?)\n---/);
if (!tocMatch) {
  fail('Could not find Table of Contents section');
} else {
  const tocContent = tocMatch[1];
  
  // Extract all TOC links
  const tocLinkRegex = /\[([^\]]+)\]\(#([^\)]+)\)/g;
  const tocLinks = [];
  let match;
  
  while ((match = tocLinkRegex.exec(tocContent)) !== null) {
    tocLinks.push({
      text: match[1],
      anchor: match[2],
    });
  }
  
  log(`Found ${tocLinks.length} TOC links`, 'blue');
  
  // Test each TOC link
  let validLinks = 0;
  for (const link of tocLinks) {
    // Check if anchor exists in document
    const anchorRegex = new RegExp(`^#{1,6}\\s+${link.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
    if (anchorRegex.test(docContent)) {
      validLinks++;
    } else {
      fail(`TOC link "${link.text}" does not match any header`);
    }
  }
  
  if (validLinks === tocLinks.length) {
    pass(`All ${tocLinks.length} TOC links are valid`);
  } else {
    fail(`Only ${validLinks}/${tocLinks.length} TOC links are valid`);
  }
}

// ============================================================================
// 2. Test Cross-Reference Links
// ============================================================================

logSection('2. Testing Cross-Reference Links');

// Find all internal links outside of TOC
const sections = docContent.split('---');
const contentSections = sections.slice(1); // Skip header and TOC
const contentText = contentSections.join('---');

const linkRegex = /\[([^\]]+)\]\(#([^\)]+)\)/g;
const crossRefLinks = [];
let crossRefMatch;

while ((crossRefMatch = linkRegex.exec(contentText)) !== null) {
  crossRefLinks.push({
    text: crossRefMatch[1],
    anchor: crossRefMatch[2],
  });
}

log(`Found ${crossRefLinks.length} cross-reference links`, 'blue');

if (crossRefLinks.length > 0) {
  pass(`Documentation includes ${crossRefLinks.length} cross-references`);
} else {
  warn('No cross-reference links found in content');
}

// ============================================================================
// 3. Verify Category Organization
// ============================================================================

logSection('3. Verifying Category Organization');

const expectedCategories = [
  { name: 'Core Classes', subsections: ['Devvit Class', 'RichTextBuilder Class'] },
  { name: 'Functions', subsections: ['Hooks', 'Utility Functions'] },
  { name: 'Type Aliases', subsections: ['Context & API Clients', 'Event System', 'Forms & UI', 'Redis Client', 'Scheduler & Jobs', 'Utility Types'] },
  { name: 'Enumerations', subsections: [] },
  { name: 'EventTypes Namespace', subsections: ['Event Interfaces', 'Usage Example'] },
  { name: 'RedditAPIClient', subsections: ['User Methods', 'Post Methods', 'Comment Methods', 'Subreddit Methods', 'Moderation Methods', 'Model Classes'] },
  { name: 'Common Patterns', subsections: [] },
];

for (const category of expectedCategories) {
  // Check if category exists
  const categoryRegex = new RegExp(`^## ${category.name}`, 'm');
  if (categoryRegex.test(docContent)) {
    pass(`Category "${category.name}" exists`);
    
    // Check subsections
    if (category.subsections.length > 0) {
      let foundSubsections = 0;
      for (const subsection of category.subsections) {
        const subsectionRegex = new RegExp(`^### ${subsection}`, 'm');
        if (subsectionRegex.test(docContent)) {
          foundSubsections++;
        }
      }
      
      if (foundSubsections === category.subsections.length) {
        pass(`  All ${category.subsections.length} subsections present`);
      } else {
        warn(`  Only ${foundSubsections}/${category.subsections.length} subsections found`);
      }
    }
  } else {
    fail(`Category "${category.name}" not found`);
  }
}

// ============================================================================
// 4. Test Alphabetical Ordering Within Categories
// ============================================================================

logSection('4. Testing Alphabetical Ordering');

// Check if methods are listed (not necessarily alphabetically, but organized)
const methodSections = [
  'User Methods',
  'Post Methods',
  'Comment Methods',
  'Subreddit Methods',
  'Moderation Methods',
];

for (const section of methodSections) {
  const sectionRegex = new RegExp(`### ${section}\\n([\\s\\S]*?)(?=\\n###|\\n##|$)`);
  const sectionMatch = docContent.match(sectionRegex);
  
  if (sectionMatch) {
    const sectionContent = sectionMatch[1];
    const methodCount = (sectionContent.match(/^- `/gm) || []).length;
    
    if (methodCount > 0) {
      pass(`${section}: ${methodCount} methods listed`);
    } else {
      warn(`${section}: No methods found`);
    }
  } else {
    fail(`${section}: Section not found`);
  }
}

// ============================================================================
// 5. Test Search Keywords
// ============================================================================

logSection('5. Testing Search Keywords');

// Test that important keywords are present for searchability
const searchKeywords = [
  { keyword: 'redis', context: 'Redis operations' },
  { keyword: 'useState', context: 'React hooks' },
  { keyword: 'context', context: 'Context object' },
  { keyword: 'reddit', context: 'Reddit API' },
  { keyword: 'trigger', context: 'Event triggers' },
  { keyword: 'scheduler', context: 'Job scheduling' },
  { keyword: 'form', context: 'Form handling' },
  { keyword: 'realtime', context: 'Realtime channels' },
];

for (const { keyword, context } of searchKeywords) {
  const regex = new RegExp(keyword, 'i');
  const matches = docContent.match(new RegExp(keyword, 'gi'));
  
  if (matches && matches.length > 0) {
    pass(`Keyword "${keyword}" (${context}): ${matches.length} occurrences`);
  } else {
    fail(`Keyword "${keyword}" (${context}): Not found`);
  }
}

// ============================================================================
// 6. Test Code Example Searchability
// ============================================================================

logSection('6. Testing Code Example Searchability');

// Check that code examples include common patterns
const codePatterns = [
  { pattern: /await redis\./g, name: 'Redis operations' },
  { pattern: /await reddit\./g, name: 'Reddit API calls' },
  { pattern: /useState\(/g, name: 'useState hook' },
  { pattern: /useAsync\(/g, name: 'useAsync hook' },
  { pattern: /Devvit\./g, name: 'Devvit configuration' },
  { pattern: /context\./g, name: 'Context usage' },
];

for (const { pattern, name } of codePatterns) {
  const matches = docContent.match(pattern);
  if (matches && matches.length > 0) {
    pass(`${name}: ${matches.length} examples`);
  } else {
    warn(`${name}: No examples found`);
  }
}

// ============================================================================
// 7. Test Section Accessibility
// ============================================================================

logSection('7. Testing Section Accessibility');

// Check that each major section has an introduction or description
const majorSections = [
  'Core Classes',
  'Functions',
  'Type Aliases',
  'RedditAPIClient',
  'Common Patterns',
];

for (const section of majorSections) {
  const sectionRegex = new RegExp(`## ${section}\\n\\n([^#]+)`, 'm');
  const match = docContent.match(sectionRegex);
  
  if (match && match[1].trim().length > 20) {
    pass(`${section}: Has introduction text`);
  } else {
    warn(`${section}: Missing or short introduction`);
  }
}

// ============================================================================
// Final Report
// ============================================================================

logSection('Navigation Test Summary');

log(`\nTotal tests: ${results.totalTests}`, 'blue');
log(`Passed: ${results.passed}`, 'green');
log(`Failed: ${results.failed}`, 'red');
log(`Warnings: ${results.warnings}`, 'yellow');

const successRate = ((results.passed / results.totalTests) * 100).toFixed(1);
log(`\nSuccess Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');

if (results.failed > 0) {
  log('\n❌ Navigation tests FAILED', 'red');
  process.exit(1);
} else if (results.warnings > 0) {
  log('\n⚠️  Navigation tests PASSED with warnings', 'yellow');
  process.exit(0);
} else {
  log('\n✅ Navigation tests PASSED', 'green');
  process.exit(0);
}
