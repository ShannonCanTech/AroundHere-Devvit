/**
 * Utility Functions
 * Common helper functions for documentation generation
 */

import fs from 'fs';
import path from 'path';

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path
 */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write file with automatic directory creation
 * @param {string} filePath - File path
 * @param {string} content - File content
 */
export function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Read file safely, return null if doesn't exist
 * @param {string} filePath - File path
 * @returns {string|null} File content or null
 */
export function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * Extract version from markdown content
 * @param {string} content - Markdown content
 * @returns {string} Version string or 'unknown'
 */
export function extractVersion(content) {
  // Match pattern: [@devvit/public-api v0.12.4-dev]
  let match = content.match(/@devvit\/public-api\s+v([\d.-]+(?:dev)?)/);
  if (!match) {
    match = content.match(/version[:\s]+([\d.-]+(?:dev)?)/i);
  }
  return match ? match[1] : 'unknown';
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
export function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Create progress logger
 * @param {number} total - Total items
 * @returns {Function} Progress update function
 */
export function createProgressLogger(total) {
  let current = 0;
  
  return (message) => {
    current++;
    const percent = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));
    console.log(`[${bar}] ${percent}% - ${message}`);
  };
}

/**
 * Categorize API item by name
 * @param {string} name - Item name
 * @returns {string} Category name
 */
export function categorizeItem(name) {
  const categories = {
    'Context': ['BaseContext', 'Context', 'ContextAPIClients', 'TriggerContext', 'JobContext'],
    'Events': ['TriggerEvent', 'TriggerEventType', 'EventTypes', 'CommentCreate', 'PostCreate', 'ModAction'],
    'Forms': ['Form', 'FormDefinition', 'FormField', 'StringField', 'NumberField', 'BooleanField'],
    'Redis': ['RedisClient', 'ZMember', 'ZRangeOptions', 'SetOptions', 'TxClientLike'],
    'Scheduler': ['ScheduledJob', 'ScheduledCronJob', 'RunJob', 'CancelJob', 'Scheduler'],
    'UI': ['UIClient', 'Toast', 'BlockElement'],
    'Reddit API': ['RedditAPIClient', 'User', 'Post', 'Comment', 'Subreddit'],
    'Hooks': ['useState', 'useAsync', 'useInterval', 'useChannel', 'useForm', 'useWebView']
  };

  for (const [category, items] of Object.entries(categories)) {
    if (items.some(item => name.includes(item))) {
      return category;
    }
  }

  return 'Utility Types';
}

/**
 * Sort items alphabetically
 * @param {Array} items - Array of items with name property
 * @returns {Array} Sorted items
 */
export function sortByName(items) {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Deduplicate array by property
 * @param {Array} items - Array of items
 * @param {string} key - Property to deduplicate by
 * @returns {Array} Deduplicated items
 */
export function deduplicateBy(items, key) {
  const seen = new Set();
  return items.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Retry async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} Function result
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Batch array into chunks
 * @param {Array} array - Array to batch
 * @param {number} size - Batch size
 * @returns {Array<Array>} Batched arrays
 */
export function batchArray(array, size) {
  const batches = [];
  for (let i = 0; i < array.length; i += size) {
    batches.push(array.slice(i, i + size));
  }
  return batches;
}

/**
 * Validate markdown syntax
 * @param {string} markdown - Markdown content
 * @returns {Object} Validation result
 */
export function validateMarkdown(markdown) {
  const errors = [];
  const warnings = [];

  // Check for unclosed code blocks
  const codeBlockCount = (markdown.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    errors.push('Unclosed code block detected');
  }

  // Check for broken links
  const brokenLinks = markdown.match(/\[([^\]]+)\]\(\)/g);
  if (brokenLinks) {
    warnings.push(`Found ${brokenLinks.length} empty links`);
  }

  // Check for duplicate headings
  const headings = markdown.match(/^#+\s+(.+)$/gm) || [];
  const headingTexts = headings.map(h => h.replace(/^#+\s+/, ''));
  const duplicates = headingTexts.filter((h, i) => headingTexts.indexOf(h) !== i);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate headings: ${[...new Set(duplicates)].join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate statistics for documentation
 * @param {string} markdown - Markdown content
 * @returns {Object} Statistics
 */
export function generateStats(markdown) {
  return {
    totalLines: markdown.split('\n').length,
    totalCharacters: markdown.length,
    codeBlocks: (markdown.match(/```/g) || []).length / 2,
    headings: (markdown.match(/^#+\s+/gm) || []).length,
    links: (markdown.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length
  };
}
