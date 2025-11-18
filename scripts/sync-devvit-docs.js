#!/usr/bin/env node
/**
 * Devvit Documentation Sync Tool
 * 
 * Fetches latest API documentation from GitHub and generates
 * comprehensive local references with change detection.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_REPO = 'reddit/devvit';
const GITHUB_BRANCH = 'main';
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'devvit-api');
const STEERING_DIR = path.join(__dirname, '..', '.kiro', 'steering');

// Files to fetch from GitHub
const API_FILES = [
  'devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md',
  'devvit-docs/docs/api/redditapi/models/classes/User.md',
  'devvit-docs/docs/api/redditapi/models/classes/Post.md',
  'devvit-docs/docs/api/redditapi/models/classes/Comment.md',
  'devvit-docs/docs/api/redditapi/models/classes/Subreddit.md',
  'devvit-docs/docs/api/redditapi/models/classes/WikiPage.md',
  'devvit-docs/docs/api/redditapi/models/classes/Widget.md',
];

function fetchFile(filePath) {
  return new Promise((resolve, reject) => {
    const url = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`Failed to fetch ${filePath}: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function extractVersion(content) {
  // Match pattern: [@devvit/public-api v0.12.4-dev]
  let match = content.match(/@devvit\/public-api\s+v([\d.-]+(?:dev)?)/);
  if (!match) {
    match = content.match(/version[:\s]+([\d.-]+(?:dev)?)/i);
  }
  return match ? match[1] : 'unknown';
}

function extractMethods(content) {
  const methods = [];
  const methodRegex = /###\s+(?:~~)?(\w+)\(\)(?:~~)?/g;
  let match;
  
  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }
  
  return methods;
}

async function syncDocs() {
  console.log('🔄 Syncing Devvit API Documentation...\n');
  
  ensureDir(DOCS_DIR);
  ensureDir(path.join(DOCS_DIR, 'models'));
  
  const changes = {
    version: null,
    newMethods: [],
    removedMethods: [],
    files: []
  };
  
  for (const filePath of API_FILES) {
    const fileName = path.basename(filePath);
    const localPath = path.join(DOCS_DIR, fileName === 'RedditAPIClient.md' ? fileName : `models/${fileName}`);
    
    try {
      console.log(`📥 Fetching ${fileName}...`);
      const content = await fetchFile(filePath);
      
      // Extract version from RedditAPIClient
      if (fileName === 'RedditAPIClient.md') {
        changes.version = extractVersion(content);
        console.log(`   Version: ${changes.version}`);
        
        // Compare methods if file exists
        if (fs.existsSync(localPath)) {
          const oldContent = fs.readFileSync(localPath, 'utf8');
          const oldMethods = extractMethods(oldContent);
          const newMethods = extractMethods(content);
          
          changes.newMethods = newMethods.filter(m => !oldMethods.includes(m));
          changes.removedMethods = oldMethods.filter(m => !newMethods.includes(m));
        }
      }
      
      fs.writeFileSync(localPath, content);
      changes.files.push(fileName);
      console.log(`   ✅ Saved to ${localPath}`);
      
    } catch (error) {
      console.error(`   ⚠️  Failed: ${error.message}`);
    }
  }
  
  // Generate sync report
  const reportPath = path.join(__dirname, '..', 'docs', `devvit-sync-report-${new Date().toISOString().split('T')[0]}.md`);
  const report = generateReport(changes);
  fs.writeFileSync(reportPath, report);
  
  // Update steering file timestamp
  updateSteeringTimestamp();
  
  console.log('\n✅ Documentation sync complete!');
  console.log(`\n📊 Sync Report: ${reportPath}`);
  
  if (changes.newMethods.length > 0) {
    console.log(`\n🆕 New methods found: ${changes.newMethods.length}`);
    changes.newMethods.forEach(m => console.log(`   - ${m}()`));
  }
  
  if (changes.removedMethods.length > 0) {
    console.log(`\n⚠️  Removed methods: ${changes.removedMethods.length}`);
    changes.removedMethods.forEach(m => console.log(`   - ${m}()`));
  }
}

function generateReport(changes) {
  const date = new Date().toISOString().split('T')[0];
  
  return `# Devvit Sync Report - ${date}

## Version Information

**Current Version**: ${changes.version || 'unknown'}  
**Sync Date**: ${date}

## Files Updated

${changes.files.map(f => `- ${f}`).join('\n')}

## API Changes

### New Methods (${changes.newMethods.length})

${changes.newMethods.length > 0 
  ? changes.newMethods.map(m => `- \`${m}()\``).join('\n')
  : '_No new methods detected_'}

### Removed/Deprecated Methods (${changes.removedMethods.length})

${changes.removedMethods.length > 0
  ? changes.removedMethods.map(m => `- \`${m}()\``).join('\n')
  : '_No methods removed_'}

## Recommended Actions

${changes.newMethods.length > 0 ? `
1. Review new methods in \`docs/devvit-api/RedditAPIClient.md\`
2. Test new methods against Devvit MCP server
3. Update \`.kiro/steering/devvit-api-reference.md\` if methods are commonly used
4. Add examples to steering files for complex methods
` : ''}

${changes.removedMethods.length > 0 ? `
⚠️ **Action Required**: Update code using removed methods
` : ''}

## Next Steps

1. Review changes in \`docs/devvit-api/\`
2. Test key methods in your development environment
3. Update steering files with new patterns
4. Run \`mcp_devvit_mcp_devvit_search\` to check MCP coverage

---

Generated by sync-devvit-docs.js
`;
}

function updateSteeringTimestamp() {
  const date = new Date().toISOString().split('T')[0];
  const steeringFiles = [
    'devvit-api-reference.md',
    'devvit-quick-reference.md',
    'devvit-docs-maintenance.md'
  ];
  
  steeringFiles.forEach(file => {
    const filePath = path.join(STEERING_DIR, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/Last (?:Synced|Updated): .*/, `Last Updated: ${date}`);
      fs.writeFileSync(filePath, content);
    }
  });
  
  console.log(`\n📝 Updated timestamps in steering files`);
}

// Run sync
syncDocs().catch(error => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
