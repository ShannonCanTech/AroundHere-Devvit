/**
 * Fetch RedditAPIClient Documentation
 * Fetches and processes RedditAPIClient methods and model classes from GitHub
 */

import { GitHubFetcher } from './lib/github-fetcher.js';
import { MarkdownParser } from './lib/markdown-parser.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const REPO = 'reddit/devvit';
const BRANCH = 'main';
const BASE_PATH = 'devvit-docs/docs/api/redditapi/RedditAPIClient';

async function main() {
  console.log('Fetching RedditAPIClient documentation...\n');
  
  const fetcher = new GitHubFetcher(REPO, BRANCH);
  const parser = new MarkdownParser();
  
  try {
    // Step 1: Fetch directory structure
    console.log('Step 1: Fetching directory structure...');
    const classesDir = await fetcher.fetchDirectory(`${BASE_PATH}/classes`);
    
    console.log(`Found ${classesDir.length} files in classes directory:`);
    classesDir.forEach(file => {
      console.log(`  - ${file.name} (${file.type})`);
    });
    
    // Step 2: Identify key files
    console.log('\nStep 2: Identifying key files...');
    const redditApiClientFile = classesDir.find(f => f.name === 'RedditAPIClient.md');
    
    // Model files are in a separate location - we'll read them from local cache
    const modelFileNames = ['User.md', 'Post.md', 'Comment.md', 'Subreddit.md', 'Widget.md', 'WikiPage.md'];
    
    console.log('Main file:', redditApiClientFile?.name || 'NOT FOUND');
    console.log('Model files to process:', modelFileNames.join(', '));
    
    // Step 3: Fetch main RedditAPIClient file
    console.log('\nStep 3: Fetching RedditAPIClient.md...');
    const redditApiClientPath = `${BASE_PATH}/classes/RedditAPIClient.md`;
    const redditApiClientContent = await fetcher.fetchFile(redditApiClientPath);
    
    console.log(`Fetched RedditAPIClient.md (${redditApiClientContent.length} bytes)`);
    
    // Save to docs directory
    const outputPath = 'docs/devvit-api/RedditAPIClient.md';
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, redditApiClientContent);
    console.log(`Saved to ${outputPath}`);
    
    // Step 4: Parse RedditAPIClient methods
    console.log('\nStep 4: Parsing RedditAPIClient methods...');
    const methods = parser.parseClassMethods(redditApiClientContent);
    
    // Categorize methods
    const categorized = {
      user: methods.filter(m => 
        m.name.toLowerCase().includes('user') || 
        m.name.toLowerCase().includes('username')
      ),
      post: methods.filter(m => 
        m.name.toLowerCase().includes('post') && 
        !m.name.toLowerCase().includes('user')
      ),
      comment: methods.filter(m => 
        m.name.toLowerCase().includes('comment')
      ),
      subreddit: methods.filter(m => 
        m.name.toLowerCase().includes('subreddit')
      ),
      moderation: methods.filter(m => 
        m.name.toLowerCase().includes('mod') ||
        m.name.toLowerCase().includes('spam') ||
        m.name.toLowerCase().includes('report') ||
        m.name.toLowerCase().includes('approve') ||
        m.name.toLowerCase().includes('remove')
      ),
      other: []
    };
    
    // Assign remaining methods to 'other'
    const categorizedNames = new Set([
      ...categorized.user,
      ...categorized.post,
      ...categorized.comment,
      ...categorized.subreddit,
      ...categorized.moderation
    ].map(m => m.name));
    
    categorized.other = methods.filter(m => !categorizedNames.has(m.name));
    
    console.log('\nMethod categories:');
    console.log(`  User methods: ${categorized.user.length}`);
    console.log(`  Post methods: ${categorized.post.length}`);
    console.log(`  Comment methods: ${categorized.comment.length}`);
    console.log(`  Subreddit methods: ${categorized.subreddit.length}`);
    console.log(`  Moderation methods: ${categorized.moderation.length}`);
    console.log(`  Other methods: ${categorized.other.length}`);
    
    // Step 5: Read model classes from local cache
    console.log('\nStep 5: Reading model classes from local cache...');
    const modelContents = new Map();
    const { readFileSync: fsReadFileSync } = await import('fs');
    
    for (const modelFileName of modelFileNames) {
      const modelPath = `docs/devvit-api/models/${modelFileName}`;
      try {
        console.log(`  Reading ${modelFileName}...`);
        const content = fsReadFileSync(modelPath, 'utf-8');
        modelContents.set(modelFileName, content);
        console.log(`  Loaded ${modelFileName} (${content.length} bytes)`);
      } catch (error) {
        console.log(`  Warning: Could not read ${modelFileName}: ${error.message}`);
      }
    }
    
    // Parse model methods
    console.log('\nStep 6: Parsing model class methods...');
    const modelMethods = {};
    
    for (const [fileName, content] of modelContents) {
      const modelName = fileName.replace('.md', '');
      const methods = parser.parseClassMethods(content);
      modelMethods[modelName] = methods;
      console.log(`  ${modelName}: ${methods.length} methods`);
    }
    
    // Step 7: Generate summary
    console.log('\nStep 7: Generating summary...');
    const summary = {
      timestamp: new Date().toISOString(),
      redditApiClient: {
        totalMethods: methods.length,
        categories: {
          user: categorized.user.map(m => m.name),
          post: categorized.post.map(m => m.name),
          comment: categorized.comment.map(m => m.name),
          subreddit: categorized.subreddit.map(m => m.name),
          moderation: categorized.moderation.map(m => m.name),
          other: categorized.other.map(m => m.name)
        }
      },
      models: Object.entries(modelMethods).reduce((acc, [name, methods]) => {
        acc[name] = methods.map(m => m.name);
        return acc;
      }, {})
    };
    
    const summaryPath = 'docs/devvit-api/RedditAPIClient-summary.json';
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`Summary saved to ${summaryPath}`);
    
    // Step 8: Generate markdown summary
    console.log('\nStep 8: Generating markdown summary...');
    let markdownSummary = '# RedditAPIClient Documentation Summary\n\n';
    markdownSummary += `**Generated**: ${new Date().toISOString()}\n\n`;
    markdownSummary += '## RedditAPIClient Methods\n\n';
    markdownSummary += `**Total Methods**: ${methods.length}\n\n`;
    
    for (const [category, categoryMethods] of Object.entries(categorized)) {
      if (categoryMethods.length > 0) {
        markdownSummary += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Methods (${categoryMethods.length})\n\n`;
        categoryMethods.forEach(method => {
          markdownSummary += `- \`${method.name}()\`\n`;
        });
        markdownSummary += '\n';
      }
    }
    
    markdownSummary += '## Model Classes\n\n';
    for (const [modelName, methods] of Object.entries(modelMethods)) {
      markdownSummary += `### ${modelName} (${methods.length} methods)\n\n`;
      methods.forEach(method => {
        markdownSummary += `- \`${method.name}()\`\n`;
      });
      markdownSummary += '\n';
    }
    
    const markdownSummaryPath = 'docs/devvit-api/RedditAPIClient-summary.md';
    writeFileSync(markdownSummaryPath, markdownSummary);
    console.log(`Markdown summary saved to ${markdownSummaryPath}`);
    
    // Final stats
    const stats = fetcher.getCacheStats();
    console.log('\n=== Fetch Complete ===');
    console.log(`Total API requests: ${stats.requestCount}`);
    console.log(`Cache size: ${stats.cacheSize}`);
    console.log(`Files processed: ${1 + modelFileNames.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
