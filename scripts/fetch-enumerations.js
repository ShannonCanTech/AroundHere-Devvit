#!/usr/bin/env node

/**
 * Fetch and Process Enumerations
 * Fetches all enumeration documentation from GitHub
 */

import { GitHubFetcher } from './lib/github-fetcher.js';
import { parseEnum } from './lib/markdown-parser.js';
import { DocumentationBuilder } from './lib/doc-builder.js';
import fs from 'fs';
import path from 'path';

const REPO = 'reddit/devvit';
const BRANCH = 'main';
const BASE_PATH = 'devvit-docs/docs/api/public-api/enumerations';

/**
 * Enumerations to fetch
 */
const ENUMERATIONS = [
  'DeletionReason.md',
  'EventSource.md',
  'SettingScope.md'
];

async function fetchEnumeration(fetcher, fileName) {
  try {
    const filePath = `${BASE_PATH}/${fileName}`;
    console.log(`  - Fetching ${fileName}...`);
    
    const content = await fetcher.fetchFile(filePath);
    const doc = parseEnum(content);
    
    // Add metadata
    doc.type = 'enum';
    doc.path = filePath;
    
    console.log(`    ✓ Parsed ${doc.name} (${doc.members.length} members)`);
    
    return doc;
    
  } catch (error) {
    console.log(`    ✗ Failed to fetch ${fileName}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Fetching enumerations documentation...\n');

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

  const enumerations = [];

  try {
    // Fetch each enumeration
    for (const fileName of ENUMERATIONS) {
      const enumDoc = await fetchEnumeration(fetcher, fileName);
      if (enumDoc) {
        enumerations.push(enumDoc);
      }
    }

    console.log(`\n✓ Fetched ${enumerations.length} enumerations total\n`);

    // Save to output directory
    const outputDir = 'docs/devvit-api/enumerations';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save individual enumeration files
    for (const enumDoc of enumerations) {
      const content = builder.addEnum(enumDoc);
      const fileName = `${enumDoc.name}.md`;
      
      fs.writeFileSync(
        path.join(outputDir, fileName),
        content,
        'utf8'
      );
      
      console.log(`✓ Saved ${fileName}`);
    }

    // Build combined documentation
    let combinedDoc = '# Enumerations\n\n';
    combinedDoc += `${enumerations.length} enumerations\n\n`;
    
    for (const enumDoc of enumerations) {
      combinedDoc += builder.addEnum(enumDoc);
      combinedDoc += '\n---\n\n';
    }

    // Save combined documentation
    fs.writeFileSync(
      path.join(outputDir, 'README.md'),
      combinedDoc,
      'utf8'
    );
    console.log(`✓ Saved README.md\n`);

    // Print statistics
    const stats = fetcher.getCacheStats();
    console.log('Statistics:');
    console.log(`  - Enumerations fetched: ${enumerations.length}`);
    console.log(`  - Total members: ${enumerations.reduce((sum, e) => sum + e.members.length, 0)}`);
    console.log(`  - Cache size: ${stats.cacheSize}`);
    console.log(`  - API requests: ${stats.requestCount}`);
    
    console.log('\nEnumerations:');
    for (const enumDoc of enumerations) {
      console.log(`  - ${enumDoc.name}: ${enumDoc.members.length} members`);
    }

    // Return parsed data for further processing
    return enumerations;

  } catch (error) {
    console.error('Error fetching enumerations:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✓ Enumerations documentation fetched successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed to fetch enumerations:', error);
      process.exit(1);
    });
}

export { main as fetchEnumerations };
