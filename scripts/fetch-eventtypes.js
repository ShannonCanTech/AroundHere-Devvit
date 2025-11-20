/**
 * Fetch EventTypes Namespace Documentation
 * Fetches all EventTypes interfaces, functions, and variables from GitHub
 */

import { GitHubFetcher } from './lib/github-fetcher.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const REPO = 'reddit/devvit';
const BRANCH = 'main';
const BASE_PATH = 'devvit-docs/docs/api/public-api/@devvit/namespaces/EventTypes';

async function main() {
  console.log('Fetching EventTypes namespace documentation...\n');
  
  const fetcher = new GitHubFetcher(REPO, BRANCH);
  
  try {
    // Fetch directory structure
    console.log('Step 1: Fetching EventTypes directory structure...');
    const rootFiles = await fetcher.fetchDirectory(BASE_PATH);
    console.log(`Found ${rootFiles.length} items in EventTypes root`);
    
    // Separate directories and files
    const directories = rootFiles.filter(f => f.type === 'dir');
    const files = rootFiles.filter(f => f.type === 'file');
    
    console.log(`  - ${directories.length} directories`);
    console.log(`  - ${files.length} files`);
    
    // Fetch subdirectories
    const subdirContents = {};
    
    for (const dir of directories) {
      console.log(`\nFetching ${dir.name}/ directory...`);
      const dirPath = `${BASE_PATH}/${dir.name}`;
      const dirFiles = await fetcher.fetchDirectory(dirPath);
      subdirContents[dir.name] = dirFiles;
      console.log(`  Found ${dirFiles.length} files in ${dir.name}/`);
    }
    
    // Build complete file inventory
    const inventory = {
      root: files.map(f => ({
        name: f.name,
        path: f.path,
        download_url: f.download_url
      })),
      interfaces: subdirContents.interfaces?.map(f => ({
        name: f.name,
        path: f.path,
        download_url: f.download_url
      })) || [],
      functions: subdirContents.functions?.map(f => ({
        name: f.name,
        path: f.path,
        download_url: f.download_url
      })) || [],
      variables: subdirContents.variables?.map(f => ({
        name: f.name,
        path: f.path,
        download_url: f.download_url
      })) || [],
      typeAliases: subdirContents['type-aliases']?.map(f => ({
        name: f.name,
        path: f.path,
        download_url: f.download_url
      })) || []
    };
    
    // Save inventory
    const inventoryPath = 'docs/devvit-api/EventTypes-inventory.json';
    mkdirSync(dirname(inventoryPath), { recursive: true });
    writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
    console.log(`\n✓ Saved inventory to ${inventoryPath}`);
    
    // Print summary
    console.log('\n=== EventTypes Namespace Summary ===');
    console.log(`Root files: ${inventory.root.length}`);
    console.log(`Interfaces: ${inventory.interfaces.length}`);
    console.log(`Functions: ${inventory.functions.length}`);
    console.log(`Variables: ${inventory.variables.length}`);
    console.log(`Type Aliases: ${inventory.typeAliases.length}`);
    console.log(`Total: ${inventory.root.length + inventory.interfaces.length + inventory.functions.length + inventory.variables.length + inventory.typeAliases.length}`);
    
    // Fetch all interface files
    if (inventory.interfaces.length > 0) {
      console.log('\n\nStep 2: Fetching interface files...');
      
      let savedCount = 0;
      for (const file of inventory.interfaces) {
        try {
          const content = await fetcher._httpsGet(file.download_url);
          const localPath = `docs/devvit-api/@devvit/namespaces/EventTypes/interfaces/${file.name}`;
          mkdirSync(dirname(localPath), { recursive: true });
          writeFileSync(localPath, content);
          savedCount++;
        } catch (error) {
          console.error(`Failed to fetch ${file.name}:`, error.message);
        }
      }
      console.log(`✓ Saved ${savedCount} interface files`);
    }
    
    // Fetch all function files
    if (inventory.functions.length > 0) {
      console.log('\nStep 3: Fetching function files...');
      
      let savedCount = 0;
      for (const file of inventory.functions) {
        try {
          const content = await fetcher._httpsGet(file.download_url);
          const localPath = `docs/devvit-api/@devvit/namespaces/EventTypes/functions/${file.name}`;
          mkdirSync(dirname(localPath), { recursive: true });
          writeFileSync(localPath, content);
          savedCount++;
        } catch (error) {
          console.error(`Failed to fetch ${file.name}:`, error.message);
        }
      }
      console.log(`✓ Saved ${savedCount} function files`);
    }
    
    // Fetch all variable files
    if (inventory.variables.length > 0) {
      console.log('\nStep 4: Fetching variable files...');
      
      let savedCount = 0;
      for (const file of inventory.variables) {
        try {
          const content = await fetcher._httpsGet(file.download_url);
          const localPath = `docs/devvit-api/@devvit/namespaces/EventTypes/variables/${file.name}`;
          mkdirSync(dirname(localPath), { recursive: true });
          writeFileSync(localPath, content);
          savedCount++;
        } catch (error) {
          console.error(`Failed to fetch ${file.name}:`, error.message);
        }
      }
      console.log(`✓ Saved ${savedCount} variable files`);
    }
    
    // Fetch type aliases if any
    if (inventory.typeAliases.length > 0) {
      console.log('\nStep 5: Fetching type alias files...');
      
      let savedCount = 0;
      for (const file of inventory.typeAliases) {
        try {
          const content = await fetcher._httpsGet(file.download_url);
          const localPath = `docs/devvit-api/@devvit/namespaces/EventTypes/type-aliases/${file.name}`;
          mkdirSync(dirname(localPath), { recursive: true });
          writeFileSync(localPath, content);
          savedCount++;
        } catch (error) {
          console.error(`Failed to fetch ${file.name}:`, error.message);
        }
      }
      console.log(`✓ Saved ${savedCount} type alias files`);
    }
    
    // Fetch root files
    if (inventory.root.length > 0) {
      console.log('\nStep 6: Fetching root files...');
      
      let savedCount = 0;
      for (const file of inventory.root) {
        try {
          const content = await fetcher._httpsGet(file.download_url);
          const localPath = `docs/devvit-api/@devvit/namespaces/EventTypes/${file.name}`;
          mkdirSync(dirname(localPath), { recursive: true });
          writeFileSync(localPath, content);
          savedCount++;
        } catch (error) {
          console.error(`Failed to fetch ${file.name}:`, error.message);
        }
      }
      console.log(`✓ Saved ${savedCount} root files`);
    }
    
    const stats = fetcher.getCacheStats();
    console.log(`\n✓ Complete! Made ${stats.requestCount} API requests`);
    console.log(`✓ Cache size: ${stats.cacheSize} items`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
