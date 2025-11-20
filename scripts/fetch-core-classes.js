#!/usr/bin/env node

/**
 * Fetch and Process Core Classes
 * Fetches Devvit and RichTextBuilder class documentation from GitHub
 */

import { GitHubFetcher } from './lib/github-fetcher.js';
import { parseClass } from './lib/markdown-parser.js';
import { DocumentationBuilder } from './lib/doc-builder.js';
import fs from 'fs';
import path from 'path';

const REPO = 'reddit/devvit';
const BRANCH = 'main';
const BASE_PATH = 'devvit-docs/docs/api/public-api/classes';

async function main() {
  console.log('Fetching core classes documentation...\n');

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

  try {
    // Fetch Devvit class
    console.log('Fetching Devvit.md...');
    const devvitPath = `${BASE_PATH}/Devvit.md`;
    const devvitContent = await fetcher.fetchFile(devvitPath);
    const devvitDoc = parseClass(devvitContent);
    
    console.log(`✓ Parsed Devvit class`);
    console.log(`  - Methods: ${devvitDoc.methods.length}`);
    console.log(`  - Properties: ${devvitDoc.properties.length}`);
    console.log(`  - Examples: ${devvitDoc.examples.length}\n`);

    // Fetch RichTextBuilder class
    console.log('Fetching RichTextBuilder.md...');
    const richTextPath = `${BASE_PATH}/RichTextBuilder.md`;
    const richTextContent = await fetcher.fetchFile(richTextPath);
    const richTextDoc = parseClass(richTextContent);
    
    console.log(`✓ Parsed RichTextBuilder class`);
    console.log(`  - Methods: ${richTextDoc.methods.length}`);
    console.log(`  - Properties: ${richTextDoc.properties.length}`);
    console.log(`  - Examples: ${richTextDoc.examples.length}\n`);

    // Build documentation section
    builder.addSection('Core Classes', 'Main classes that provide core Devvit functionality', 2);
    
    // Add Devvit class
    const devvitClassContent = builder.addClass(devvitDoc);
    builder.addSection('Devvit', devvitClassContent, 3);
    
    // Add RichTextBuilder class
    const richTextBuilderClassContent = builder.addClass(richTextDoc);
    builder.addSection('RichTextBuilder', richTextBuilderClassContent, 3);

    // Save to output directory
    const outputDir = 'docs/devvit-api';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save individual class files
    fs.writeFileSync(
      path.join(outputDir, 'Devvit.md'),
      devvitClassContent,
      'utf8'
    );
    console.log(`✓ Saved Devvit.md`);

    fs.writeFileSync(
      path.join(outputDir, 'RichTextBuilder.md'),
      richTextBuilderClassContent,
      'utf8'
    );
    console.log(`✓ Saved RichTextBuilder.md`);

    // Build complete documentation
    const documentation = builder.build();
    
    // Save complete documentation
    fs.writeFileSync(
      path.join(outputDir, 'core-classes.md'),
      documentation,
      'utf8'
    );
    console.log(`✓ Saved core-classes.md\n`);

    // Print statistics
    const stats = fetcher.getCacheStats();
    console.log('Statistics:');
    console.log(`  - Files fetched: 2`);
    console.log(`  - Cache size: ${stats.cacheSize}`);
    console.log(`  - API requests: ${stats.requestCount}`);
    console.log(`  - Total methods: ${devvitDoc.methods.length + richTextDoc.methods.length}`);
    console.log(`  - Total properties: ${devvitDoc.properties.length + richTextDoc.properties.length}`);

    // Return parsed data for further processing
    return {
      devvit: devvitDoc,
      richTextBuilder: richTextDoc
    };

  } catch (error) {
    console.error('Error fetching core classes:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✓ Core classes documentation fetched successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed to fetch core classes:', error);
      process.exit(1);
    });
}

export { main as fetchCoreClasses };
