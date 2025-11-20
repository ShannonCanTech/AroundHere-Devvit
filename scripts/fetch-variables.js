#!/usr/bin/env node

/**
 * Fetch and Process Variables
 * Fetches variable definitions from GitHub
 */

import { GitHubFetcher } from './lib/github-fetcher.js';
import { DocumentationBuilder } from './lib/doc-builder.js';
import fs from 'fs';
import path from 'path';

const REPO = 'reddit/devvit';
const BRANCH = 'main';
const BASE_PATH = 'devvit-docs/docs/api/public-api/variables';

// Variables to fetch
const VARIABLES = [
  'ALL_ICON_NAMES'
];

/**
 * Parse variable documentation from markdown
 * @param {string} markdown - Markdown content
 * @returns {Object} Parsed variable documentation
 */
function parseVariable(markdown) {
  const doc = {
    name: '',
    description: '',
    type: '',
    value: [],
    examples: []
  };

  // Extract name from title
  const titleMatch = markdown.match(/^#\s+(?:Variable:\s+)?(.+?)(?:\s+Variable)?$/m);
  if (titleMatch) {
    doc.name = titleMatch[1].trim();
  }

  // Extract description (text between title and first ## section)
  const descMatch = markdown.match(/^#\s+.+?\n\n([\s\S]+?)(?=\n##|\n```|$)/);
  if (descMatch) {
    doc.description = descMatch[1].trim();
  }

  // Extract type from signature (format: > `const` **ALL_ICON_NAMES**: Type)
  const typeMatch = markdown.match(/>\s+`const`\s+\*\*\w+\*\*:\s+([^\n]+)/);
  if (typeMatch) {
    let typeStr = typeMatch[1].trim();
    // Extract just the type definition part (before the array values)
    const typeOnlyMatch = typeStr.match(/^(readonly\s+\[[^\]]*\])/);
    if (typeOnlyMatch) {
      doc.type = typeOnlyMatch[1];
    } else {
      // For inline arrays, extract the type structure
      const inlineTypeMatch = typeStr.match(/^(readonly\s+\[)/);
      if (inlineTypeMatch) {
        doc.type = 'readonly string[]';
      } else {
        doc.type = typeStr;
      }
    }
    
    // Extract array values from the inline definition
    const valuesMatch = typeStr.match(/\[([\s\S]+)\]/);
    if (valuesMatch) {
      const arrayContent = valuesMatch[1];
      // Extract all quoted strings (handle both single and double quotes)
      const values = arrayContent.match(/`([^`]+)`/g);
      if (values) {
        doc.value = values.map(v => {
          // Remove backticks and inner quotes
          let cleaned = v.replace(/`/g, '');
          cleaned = cleaned.replace(/^["']|["']$/g, '');
          return cleaned;
        });
      }
    }
  }

  // Extract value - for ALL_ICON_NAMES, look for array of icon names
  // Check for code blocks containing the array (fallback if inline extraction didn't work)
  if (doc.value.length === 0) {
    const codeBlockMatch = markdown.match(/```(?:typescript|javascript|ts|js)?\n([\s\S]+?)\n```/);
    if (codeBlockMatch) {
      const codeContent = codeBlockMatch[1].trim();
      
      // Try to extract array values
      const arrayMatch = codeContent.match(/\[([\s\S]+?)\]/);
      if (arrayMatch) {
        const arrayContent = arrayMatch[1];
        // Extract quoted strings
        const values = arrayContent.match(/['"`]([^'"`]+)['"`]/g);
        if (values) {
          doc.value = values.map(v => v.replace(/['"`]/g, ''));
        }
      }
    }
  }

  // If no code block, try to extract from list format
  if (doc.value.length === 0) {
    const listMatch = markdown.match(/##\s+(?:Values?|Members?|Icons?)\s*\n([\s\S]+?)(?=\n##|$)/);
    if (listMatch) {
      const listContent = listMatch[1];
      // Extract items from bullet list
      const items = listContent.match(/[-•]\s+`?([^`\n]+)`?/g);
      if (items) {
        doc.value = items.map(item => item.replace(/[-•]\s+`?([^`\n]+)`?/, '$1').trim());
      }
    }
  }

  // Extract code examples
  const exampleMatch = markdown.match(/##\s+Examples?\s*\n([\s\S]+?)(?=\n##|$)/);
  if (exampleMatch) {
    const examplesText = exampleMatch[1];
    const codeMatches = examplesText.matchAll(/```(?:typescript|javascript|ts|js)?\n([\s\S]+?)\n```/g);
    
    for (const match of codeMatches) {
      doc.examples.push(match[1].trim());
    }
  }

  return doc;
}

/**
 * Format variable documentation
 * @param {Object} doc - Parsed variable documentation
 * @returns {string} Formatted documentation
 */
function formatVariable(doc) {
  let content = `### ${doc.name}\n\n`;
  
  content += `**Type**: Variable\n\n`;
  
  if (doc.description) {
    content += `${doc.description}\n\n`;
  }

  if (doc.type) {
    content += `**Type**: \`${doc.type}\`\n\n`;
  }

  if (doc.value && doc.value.length > 0) {
    content += `**Values** (${doc.value.length} items):\n\n`;
    
    // For large arrays, show first few items and count
    if (doc.value.length > 20) {
      const preview = doc.value.slice(0, 10);
      content += '```typescript\n[\n';
      for (const val of preview) {
        content += `  '${val}',\n`;
      }
      content += `  // ... and ${doc.value.length - 10} more\n`;
      content += ']\n```\n\n';
      
      // Add full list in collapsed format
      content += '<details>\n<summary>View all values</summary>\n\n';
      content += '```typescript\n[\n';
      for (const val of doc.value) {
        content += `  '${val}',\n`;
      }
      content += ']\n```\n\n';
      content += '</details>\n\n';
    } else {
      // Show all values for smaller arrays
      content += '```typescript\n[\n';
      for (const val of doc.value) {
        content += `  '${val}',\n`;
      }
      content += ']\n```\n\n';
    }
  }

  if (doc.examples && doc.examples.length > 0) {
    content += `**Example**:\n\`\`\`typescript\n${doc.examples[0]}\n\`\`\`\n\n`;
  }

  content += '---\n\n';
  
  return content;
}

async function main() {
  console.log('Fetching variables documentation...\n');

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

  const variableDocs = [];

  try {
    // Fetch variables
    console.log('Fetching variables...');
    for (const varName of VARIABLES) {
      try {
        console.log(`  Fetching ${varName}.md...`);
        const varPath = `${BASE_PATH}/${varName}.md`;
        const varContent = await fetcher.fetchFile(varPath);
        const varDoc = parseVariable(varContent);
        
        variableDocs.push(varDoc);
        
        console.log(`  ✓ Parsed ${varName}`);
        console.log(`    - Type: ${varDoc.type}`);
        console.log(`    - Values: ${varDoc.value.length}`);
        console.log(`    - Examples: ${varDoc.examples.length}`);
      } catch (error) {
        console.error(`  ✗ Failed to fetch ${varName}:`, error.message);
      }
    }
    console.log('');

    // Build documentation sections
    builder.addSection('Variables', 'Variable definitions and constants', 2);
    
    for (const varDoc of variableDocs) {
      const varContent = formatVariable(varDoc);
      builder.addSection(varDoc.name, varContent, 3);
    }

    // Save to output directory
    const outputDir = 'docs/devvit-api';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save individual variable files
    const variablesDir = path.join(outputDir, 'variables');
    if (!fs.existsSync(variablesDir)) {
      fs.mkdirSync(variablesDir, { recursive: true });
    }

    for (const varDoc of variableDocs) {
      const varContent = formatVariable(varDoc);
      fs.writeFileSync(
        path.join(variablesDir, `${varDoc.name}.md`),
        varContent,
        'utf8'
      );
      console.log(`✓ Saved ${varDoc.name}.md`);
    }

    // Build complete documentation
    const documentation = builder.build();
    
    // Save complete documentation
    fs.writeFileSync(
      path.join(outputDir, 'variables.md'),
      documentation,
      'utf8'
    );
    console.log(`✓ Saved variables.md\n`);

    // Print statistics
    const stats = fetcher.getCacheStats();
    console.log('Statistics:');
    console.log(`  - Variables fetched: ${variableDocs.length}/${VARIABLES.length}`);
    console.log(`  - Total values: ${variableDocs.reduce((sum, doc) => sum + doc.value.length, 0)}`);
    console.log(`  - Cache size: ${stats.cacheSize}`);
    console.log(`  - API requests: ${stats.requestCount}`);

    // Return parsed data for further processing
    return {
      variables: variableDocs
    };

  } catch (error) {
    console.error('Error fetching variables:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\n✓ Variables documentation fetched successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed to fetch variables:', error);
      process.exit(1);
    });
}

export { main as fetchVariables };
