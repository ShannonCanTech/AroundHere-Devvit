#!/usr/bin/env node

/**
 * Fetch and Process Functions
 * Fetches hook functions and utility functions from GitHub
 */

import { GitHubFetcher } from './lib/github-fetcher.js';
import { parseFunction } from './lib/markdown-parser.js';
import { DocumentationBuilder } from './lib/doc-builder.js';
import fs from 'fs';
import path from 'path';

const REPO = 'reddit/devvit';
const BRANCH = 'main';
const BASE_PATH = 'devvit-docs/docs/api/public-api/functions';

// Hook functions to fetch
const HOOK_FUNCTIONS = [
  'useState',
  'useAsync',
  'useInterval',
  'useChannel',
  'useForm',
  'useWebView'
];

// Utility functions to fetch
const UTILITY_FUNCTIONS = [
  'svg',
  'fetchDevvitWeb'
];

async function main() {
  console.log('Fetching functions documentation...\n');

  const fetcher = new GitHubFetcher(REPO, BRANCH);
  const builder = new DocumentationBuilder();

  // Set metadata
  builder.setMetadata({
    version: '0.12.4-dev',
    lastSynced: new Date().toISOString().split('T')[0],
    sourceUrls: [
      `https://github.com/${REPO}/tree/${BRANCH}/${BASE_PATH}`
    ]
  });

  const hookDocs = [];
  const utilityDocs = [];

  try {
    // Fetch hook functions
    console.log('Fetching hook functions...');
    for (const hookName of HOOK_FUNCTIONS) {
      try {
        console.log(`  Fetching ${hookName}.md...`);
        const hookPath = `${BASE_PATH}/${hookName}.md`;
        const hookContent = await fetcher.fetchFile(hookPath);
        const hookDoc = parseFunction(hookContent);
        
        hookDocs.push(hookDoc);
        
        console.log(`  ✓ Parsed ${hookName}`);
        console.log(`    - Parameters: ${hookDoc.parameters.length}`);
        console.log(`    - Examples: ${hookDoc.examples.length}`);
      } catch (error) {
        console.error(`  ✗ Failed to fetch ${hookName}:`, error.message);
      }
    }
    console.log('');

    // Fetch utility functions
    console.log('Fetching utility functions...');
    for (const utilName of UTILITY_FUNCTIONS) {
      try {
        console.log(`  Fetching ${utilName}.md...`);
        const utilPath = `${BASE_PATH}/${utilName}.md`;
        const utilContent = await fetcher.fetchFile(utilPath);
        const utilDoc = parseFunction(utilContent);
        
        utilityDocs.push(utilDoc);
        
        console.log(`  ✓ Parsed ${utilName}`);
        console.log(`    - Parameters: ${utilDoc.parameters.length}`);
        console.log(`    - Examples: ${utilDoc.examples.length}`);
      } catch (error) {
        console.error(`  ✗ Failed to fetch ${utilName}:`, error.message);
      }
    }
    console.log('');

    // Build documentation sections
    builder.addSection('Functions', 'Core functions and hooks for Devvit development', 2);
    
    // Add Hooks section
    if (hookDocs.length > 0) {
      builder.addSection('Hooks', 'React-style hooks for state management and side effects', 3);
      
      for (const hookDoc of hookDocs) {
        const hookContent = builder.addFunction(hookDoc);
        builder.addSection(hookDoc.name, hookContent, 4);
      }
    }
    
    // Add Utility Functions section
    if (utilityDocs.length > 0) {
      builder.addSection('Utility Functions', 'Helper functions for common tasks', 3);
      
      for (const utilDoc of utilityDocs) {
        const utilContent = builder.addFunction(utilDoc);
        builder.addSection(utilDoc.name, utilContent, 4);
      }
    }

    // Save to output directory
    const outputDir = 'docs/devvit-api';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save individual function files
    const functionsDir = path.join(outputDir, 'functions');
    if (!fs.existsSync(functionsDir)) {
      fs.mkdirSync(functionsDir, { recursive: true });
    }

    // Save hook functions
    for (const hookDoc of hookDocs) {
      const hookContent = builder.addFunction(hookDoc);
      fs.writeFileSync(
        path.join(functionsDir, `${hookDoc.name}.md`),
        hookContent,
        'utf8'
      );
      console.log(`✓ Saved ${hookDoc.name}.md`);
    }

    // Save utility functions
    for (const utilDoc of utilityDocs) {
      const utilContent = builder.addFunction(utilDoc);
      fs.writeFileSync(
        path.join(functionsDir, `${utilDoc.name}.md`),
        utilContent,
        'utf8'
      );
      console.log(`✓ Saved ${utilDoc.name}.md`);
    }

    // Build complete documentation
    const documentation = builder.build();
    
    // Save complete documentation
    fs.writeFileSync(
      path.join(outputDir, 'functions.md'),
      documentation,
      'utf8'
    );
    console.log(`✓ Saved functions.md\n`);

    // Print statistics
    const stats = fetcher.getCacheStats();
    console.log('Statistics:');
    console.log(`  - Hook functions fetched: ${hookDocs.length}/${HOOK_FUNCTIONS.length}`);
    console.log(`  - Utility functions fetched: ${utilityDocs.length}/${UTILITY_FUNCTIONS.length}`);
    console.log(`  - Total functions: ${hookDocs.length + utilityDocs.length}`);
    console.log(`  - Cache size: ${stats.cacheSize}`);
    console.log(`  - API requests: ${stats.requestCount}`);

    // Return parsed data for further processing
    return {
      hooks: hookDocs,
      utilities: utilityDocs
    };

  } catch (error) {
    console.error('Error fetching functions:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✓ Functions documentation fetched successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed to fetch functions:', error);
      process.exit(1);
    });
}

export { main as fetchFunctions };
