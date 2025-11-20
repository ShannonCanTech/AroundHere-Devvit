#!/usr/bin/env node

/**
 * Fetch and Process Type Aliases
 * Fetches all type alias documentation from GitHub and organizes by category
 */

import { GitHubFetcher } from './lib/github-fetcher.js';
import { parseTypeAlias } from './lib/markdown-parser.js';
import { DocumentationBuilder } from './lib/doc-builder.js';
import { categorizeItem } from './lib/category-organizer.js';
import fs from 'fs';
import path from 'path';

const REPO = 'reddit/devvit';
const BRANCH = 'main';
const BASE_PATH = 'devvit-docs/docs/api/public-api/type-aliases';

/**
 * Type alias groups to fetch
 */
const TYPE_ALIAS_GROUPS = {
  context: [
    'BaseContext.md',
    'Context.md',
    'ContextAPIClients.md',
    'TriggerContext.md',
    'JobContext.md'
  ],
  events: [
    'TriggerEvent.md',
    'TriggerEventType.md',
    'CommentCreate.md',
    'CommentDelete.md',
    'CommentReport.md',
    'CommentSubmit.md',
    'CommentUpdate.md',
    'PostCreate.md',
    'PostDelete.md',
    'PostReport.md',
    'PostSubmit.md',
    'PostUpdate.md',
    'ModAction.md',
    'ModMail.md',
    'AppInstall.md',
    'AppUpgrade.md'
  ],
  forms: [
    'Form.md',
    'FormDefinition.md',
    'FormField.md',
    'StringField.md',
    'NumberField.md',
    'BooleanField.md',
    'SelectField.md',
    'ParagraphField.md',
    'GroupField.md',
    'FormOnSubmitEvent.md',
    'FormOnSubmitEventHandler.md'
  ],
  redis: [
    'RedisClient.md',
    'ZMember.md',
    'ZRangeOptions.md',
    'SetOptions.md',
    'TxClientLike.md'
  ],
  scheduler: [
    'ScheduledJob.md',
    'ScheduledCronJob.md',
    'RunJob.md',
    'CancelJob.md',
    'Scheduler.md',
    'JobHandler.md',
    'CronJobHandler.md'
  ],
  ui: [
    'UIClient.md',
    'Toast.md',
    'BlockElement.md'
  ],
  utility: [
    'JSONValue.md',
    'JSONObject.md',
    'JSONArray.md',
    'Data.md',
    'Metadata.md',
    'AsyncError.md'
  ]
};

async function fetchTypeAliasGroup(fetcher, groupName, files) {
  console.log(`\nFetching ${groupName} types...`);
  const results = [];
  
  for (const file of files) {
    try {
      const filePath = `${BASE_PATH}/${file}`;
      console.log(`  - Fetching ${file}...`);
      
      const content = await fetcher.fetchFile(filePath);
      const doc = parseTypeAlias(content);
      
      // Add metadata
      doc.type = 'typeAlias';
      doc.path = filePath;
      doc.group = groupName;
      
      results.push(doc);
      console.log(`    ✓ Parsed ${doc.name}`);
      
    } catch (error) {
      console.log(`    ✗ Failed to fetch ${file}: ${error.message}`);
      // Continue with other files
    }
  }
  
  return results;
}

async function main() {
  console.log('Fetching type aliases documentation...\n');

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

  const allTypeAliases = [];
  const groupResults = {};

  try {
    // Fetch each group
    for (const [groupName, files] of Object.entries(TYPE_ALIAS_GROUPS)) {
      const results = await fetchTypeAliasGroup(fetcher, groupName, files);
      groupResults[groupName] = results;
      allTypeAliases.push(...results);
    }

    console.log(`\n✓ Fetched ${allTypeAliases.length} type aliases total\n`);

    // Categorize all type aliases
    const categorized = new Map();
    for (const typeAlias of allTypeAliases) {
      const category = categorizeItem(typeAlias);
      
      if (!categorized.has(category)) {
        categorized.set(category, []);
      }
      
      categorized.get(category).push(typeAlias);
    }

    // Save to output directory
    const outputDir = 'docs/devvit-api/type-aliases';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save individual type alias files by group
    for (const [groupName, typeAliases] of Object.entries(groupResults)) {
      const groupDir = path.join(outputDir, groupName);
      if (!fs.existsSync(groupDir)) {
        fs.mkdirSync(groupDir, { recursive: true });
      }

      for (const typeAlias of typeAliases) {
        const content = builder.addTypeAlias(typeAlias);
        const fileName = `${typeAlias.name}.md`;
        
        fs.writeFileSync(
          path.join(groupDir, fileName),
          content,
          'utf8'
        );
      }
      
      console.log(`✓ Saved ${typeAliases.length} ${groupName} type aliases`);
    }

    // Build categorized documentation
    let categorizedDoc = '# Type Aliases by Category\n\n';
    
    for (const [category, items] of categorized) {
      if (items.length === 0) continue;
      
      categorizedDoc += `## ${category}\n\n`;
      categorizedDoc += `${items.length} type aliases\n\n`;
      
      for (const item of items) {
        categorizedDoc += builder.addTypeAlias(item);
      }
    }

    // Save categorized documentation
    fs.writeFileSync(
      path.join(outputDir, 'categorized.md'),
      categorizedDoc,
      'utf8'
    );
    console.log(`✓ Saved categorized.md\n`);

    // Print statistics
    const stats = fetcher.getCacheStats();
    console.log('Statistics:');
    console.log(`  - Type aliases fetched: ${allTypeAliases.length}`);
    console.log(`  - Groups: ${Object.keys(groupResults).length}`);
    console.log(`  - Categories: ${categorized.size}`);
    console.log(`  - Cache size: ${stats.cacheSize}`);
    console.log(`  - API requests: ${stats.requestCount}`);
    
    console.log('\nGroup breakdown:');
    for (const [groupName, typeAliases] of Object.entries(groupResults)) {
      console.log(`  - ${groupName}: ${typeAliases.length} types`);
    }

    // Return parsed data for further processing
    return {
      allTypeAliases,
      groupResults,
      categorized
    };

  } catch (error) {
    console.error('Error fetching type aliases:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✓ Type aliases documentation fetched successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed to fetch type aliases:', error);
      process.exit(1);
    });
}

export { main as fetchTypeAliases };
