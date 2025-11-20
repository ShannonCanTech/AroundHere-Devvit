#!/usr/bin/env node
/**
 * Devvit Documentation Generator
 * 
 * Generates comprehensive Devvit API documentation from GitHub repository
 * and creates a complete steering file for AI assistant context.
 * 
 * Usage:
 *   node scripts/generate-devvit-docs.js [options]
 * 
 * Options:
 *   --output <path>    Output file path (default: .kiro/steering/devvit-complete-api-reference.md)
 *   --version <ver>    Devvit version to fetch (default: main branch)
 *   --cache            Use cached responses (default: true)
 *   --verbose          Enable verbose logging
 *   --help             Show help message
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GitHubFetcher } from './lib/github-fetcher.js';
import { DocumentationBuilder } from './lib/doc-builder.js';
import { CategoryOrganizer, getCategoryOrder } from './lib/category-organizer.js';
import { MarkdownParser } from './lib/markdown-parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const GITHUB_REPO = 'reddit/devvit';
const GITHUB_BRANCH = 'main';
const DEFAULT_OUTPUT = path.join(__dirname, '..', '.kiro', 'steering', 'devvit-complete-api-reference.md');

// Parse command line arguments
const args = parseArgs(process.argv.slice(2));

if (args.help) {
  showHelp();
  process.exit(0);
}

const config = {
  outputPath: args.output || DEFAULT_OUTPUT,
  version: args.version || 'main',
  useCache: args.cache !== false,
  verbose: args.verbose || false
};

// Initialize components
const fetcher = new GitHubFetcher(GITHUB_REPO, GITHUB_BRANCH);
const builder = new DocumentationBuilder();
const organizer = new CategoryOrganizer();
const parser = new MarkdownParser();

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Devvit Documentation Generator\n');
    console.log(`Repository: ${GITHUB_REPO}`);
    console.log(`Branch: ${GITHUB_BRANCH}`);
    console.log(`Output: ${config.outputPath}\n`);

    // Phase 1: Discovery
    console.log('📋 Phase 1: Discovering API files...');
    const apiFiles = await discoverAPIFiles();
    console.log(`   Found ${apiFiles.length} API files\n`);

    // Phase 2: Fetching
    console.log('📥 Phase 2: Fetching documentation...');
    const fetchedDocs = await fetchDocumentation(apiFiles);
    console.log(`   Fetched ${fetchedDocs.size} files\n`);

    // Phase 3: Parsing
    console.log('📝 Phase 3: Parsing documentation...');
    const parsedItems = await parseDocumentation(fetchedDocs);
    console.log(`   Parsed ${parsedItems.length} items\n`);

    // Phase 4: Organization
    console.log('🗂️  Phase 4: Organizing by category...');
    organizer.organize(parsedItems);
    const stats = organizer.getStatistics();
    console.log(`   Organized into ${stats.categoriesWithItems} categories`);
    console.log(`   Total items: ${stats.totalItems}\n`);

    // Phase 5: Assembly
    console.log('🔨 Phase 5: Building documentation...');
    const documentation = buildDocumentation();
    console.log(`   Generated ${documentation.length} characters\n`);

    // Phase 6: Writing
    console.log('💾 Phase 6: Writing output file...');
    writeOutput(documentation);
    console.log(`   ✅ Written to ${config.outputPath}\n`);

    // Summary
    printSummary(stats);

    // Cache stats
    const cacheStats = fetcher.getCacheStats();
    console.log(`\n📊 Cache Statistics:`);
    console.log(`   Cached items: ${cacheStats.cacheSize}`);
    console.log(`   Total requests: ${cacheStats.requestCount}`);

    console.log('\n✅ Documentation generation complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (config.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Discover all API files to fetch
 */
async function discoverAPIFiles() {
  const files = [];

  // Core API paths
  const apiPaths = [
    'devvit-docs/docs/api/public-api/classes',
    'devvit-docs/docs/api/public-api/functions',
    'devvit-docs/docs/api/public-api/type-aliases',
    'devvit-docs/docs/api/public-api/enumerations',
    'devvit-docs/docs/api/public-api/variables',
    'devvit-docs/docs/api/public-api/@devvit/namespaces/EventTypes',
    'devvit-docs/docs/api/redditapi/RedditAPIClient/classes',
    'devvit-docs/docs/api/redditapi/models/classes'
  ];

  for (const apiPath of apiPaths) {
    try {
      if (config.verbose) {
        console.log(`   Scanning ${apiPath}...`);
      }

      const items = await fetcher.fetchDirectory(apiPath);
      
      for (const item of items) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          files.push({
            path: item.path,
            name: item.name,
            category: getCategoryFromPath(apiPath)
          });
        } else if (item.type === 'dir') {
          // Recursively fetch subdirectories
          const subItems = await discoverSubdirectory(item.path);
          files.push(...subItems);
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to scan ${apiPath}: ${error.message}`);
    }
  }

  return files;
}

/**
 * Discover files in subdirectory
 */
async function discoverSubdirectory(dirPath) {
  const files = [];

  try {
    const items = await fetcher.fetchDirectory(dirPath);
    
    for (const item of items) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        files.push({
          path: item.path,
          name: item.name,
          category: getCategoryFromPath(dirPath)
        });
      }
    }
  } catch (error) {
    if (config.verbose) {
      console.warn(`   ⚠️  Failed to scan ${dirPath}: ${error.message}`);
    }
  }

  return files;
}

/**
 * Get category from file path
 */
function getCategoryFromPath(filePath) {
  if (filePath.includes('classes')) return 'class';
  if (filePath.includes('functions')) return 'function';
  if (filePath.includes('type-aliases')) return 'typeAlias';
  if (filePath.includes('enumerations')) return 'enum';
  if (filePath.includes('variables')) return 'variable';
  if (filePath.includes('EventTypes')) return 'event';
  if (filePath.includes('RedditAPIClient')) return 'redditApi';
  return 'unknown';
}

/**
 * Fetch documentation files
 */
async function fetchDocumentation(apiFiles) {
  const docs = new Map();
  const paths = apiFiles.map(f => f.path);

  // Fetch in batches with progress
  const batchSize = 10;
  let fetched = 0;

  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const results = await fetcher.fetchMultipleFiles(batch);

    for (const [path, content] of results) {
      if (content) {
        docs.set(path, content);
        fetched++;
      }
    }

    console.log(`   Progress: ${fetched}/${paths.length} files`);
  }

  return docs;
}

/**
 * Parse documentation files
 */
async function parseDocumentation(fetchedDocs) {
  const items = [];

  for (const [filePath, content] of fetchedDocs) {
    try {
      const parsed = parser.parseDocumentation(content);
      
      items.push({
        ...parsed,
        path: filePath,
        fileName: path.basename(filePath)
      });

      if (config.verbose) {
        console.log(`   Parsed: ${parsed.name} (${parsed.type})`);
      }
    } catch (error) {
      console.warn(`   ⚠️  Failed to parse ${filePath}: ${error.message}`);
    }
  }

  return items;
}

/**
 * Build final documentation
 */
function buildDocumentation() {
  // Set metadata
  builder.setMetadata({
    version: '0.12.4-dev',
    lastSynced: new Date().toISOString().split('T')[0],
    githubCommit: '80e75f1',
    sourceUrls: [`https://github.com/${GITHUB_REPO}`]
  });

  // Get categorized items
  const categorizedItems = organizer.getCategorizedItems();
  const categoryOrder = getCategoryOrder();

  // Build documentation from categories
  const documentation = builder.buildFromCategories(categorizedItems, categoryOrder);

  return documentation;
}

/**
 * Write output file
 */
function writeOutput(documentation) {
  // Ensure output directory exists
  const outputDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(config.outputPath, documentation, 'utf8');

  // Verify file size
  const stats = fs.statSync(config.outputPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   File size: ${sizeMB} MB`);

  if (stats.size > 1024 * 1024) {
    console.warn(`   ⚠️  Warning: File size exceeds 1MB`);
  }
}

/**
 * Print summary statistics
 */
function printSummary(stats) {
  console.log('📊 Summary:');
  console.log(`   Total items: ${stats.totalItems}`);
  console.log(`   Categories with items: ${stats.categoriesWithItems}`);
  console.log(`   Largest category: ${stats.largestCategory.name} (${stats.largestCategory.count} items)`);
  
  console.log('\n   Category breakdown:');
  for (const [category, count] of Object.entries(stats.categoryBreakdown)) {
    if (count > 0) {
      console.log(`     - ${category}: ${count}`);
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(argv) {
  const args = {
    help: false,
    output: null,
    version: null,
    cache: true,
    verbose: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      
      case '--output':
      case '-o':
        args.output = argv[++i];
        break;
      
      case '--version':
      case '-v':
        args.version = argv[++i];
        break;
      
      case '--no-cache':
        args.cache = false;
        break;
      
      case '--verbose':
        args.verbose = true;
        break;
      
      default:
        console.warn(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Devvit Documentation Generator

Usage:
  node scripts/generate-devvit-docs.js [options]

Options:
  --output <path>    Output file path (default: .kiro/steering/devvit-complete-api-reference.md)
  --version <ver>    Devvit version to fetch (default: main branch)
  --no-cache         Disable response caching
  --verbose          Enable verbose logging
  --help, -h         Show this help message

Examples:
  # Generate with defaults
  node scripts/generate-devvit-docs.js

  # Generate with custom output
  node scripts/generate-devvit-docs.js --output docs/api-reference.md

  # Generate with verbose logging
  node scripts/generate-devvit-docs.js --verbose

For more information, see scripts/README.md
`);
}

// Run main function
main();
