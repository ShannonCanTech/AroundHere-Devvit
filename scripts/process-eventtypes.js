/**
 * Process EventTypes Documentation
 * Parse and document EventTypes interfaces, functions, and variables
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BASE_PATH = 'docs/devvit-api/@devvit/namespaces/EventTypes';

/**
 * Parse interface markdown file
 */
function parseInterface(content, name) {
  const lines = content.split('\n');
  const properties = [];
  
  let currentProperty = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match property name (e.g., "### author?")
    if (line.startsWith('### ')) {
      if (currentProperty) {
        properties.push(currentProperty);
      }
      
      const propName = line.substring(4).trim();
      currentProperty = {
        name: propName,
        optional: propName.endsWith('?'),
        type: null,
        description: null
      };
    }
    
    // Match type definition (e.g., "> `optional` **author**: `UserV2`")
    if (line.startsWith('> ') && currentProperty) {
      const typeMatch = line.match(/\*\*\w+\*\*:\s*`([^`]+)`/);
      if (typeMatch) {
        currentProperty.type = typeMatch[1];
      }
    }
  }
  
  if (currentProperty) {
    properties.push(currentProperty);
  }
  
  return {
    name,
    properties
  };
}

/**
 * Parse function markdown file
 */
function parseFunction(content, name) {
  const lines = content.split('\n');
  let signature = null;
  let description = null;
  const parameters = [];
  let returnType = null;
  let inParameters = false;
  let currentParam = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match function signature (e.g., "> **deletionReasonFromJSON**(`object`): [`DeletionReason`]")
    if (line.startsWith('> **') && line.includes('(')) {
      signature = line.substring(2).trim();
      
      // Extract return type from signature
      const returnMatch = line.match(/:\s*\[`([^\]]+)`\]/);
      if (returnMatch) {
        returnType = returnMatch[1];
      }
    }
    
    // Detect parameters section
    if (line.startsWith('## Parameters')) {
      inParameters = true;
      continue;
    }
    
    // Detect returns section
    if (line.startsWith('## Returns')) {
      inParameters = false;
      continue;
    }
    
    // Parse parameter name
    if (inParameters && line.startsWith('### ')) {
      if (currentParam) {
        parameters.push(currentParam);
      }
      currentParam = {
        name: line.substring(4).trim(),
        type: null
      };
    }
    
    // Parse parameter type
    if (inParameters && currentParam && line.startsWith('`') && !line.startsWith('###')) {
      currentParam.type = line.trim().replace(/`/g, '');
    }
    
    // Parse return type from Returns section
    if (!inParameters && line.startsWith('[`') && line.includes('](')) {
      const match = line.match(/\[`([^\]]+)`\]/);
      if (match) {
        returnType = match[1];
      }
    }
  }
  
  if (currentParam) {
    parameters.push(currentParam);
  }
  
  return {
    name,
    signature,
    parameters,
    returnType,
    description
  };
}

/**
 * Parse variable markdown file
 */
function parseVariable(content, name) {
  const lines = content.split('\n');
  let type = null;
  let value = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match variable type (e.g., "> **AccountDelete**: `"AccountDelete"`")
    if (line.startsWith('> **')) {
      const match = line.match(/\*\*\w+\*\*:\s*`([^`]+)`/);
      if (match) {
        type = match[1];
        value = match[1];
      }
    }
  }
  
  return {
    name,
    type,
    value
  };
}

async function main() {
  console.log('Processing EventTypes documentation...\n');
  
  const result = {
    interfaces: [],
    functions: [],
    variables: []
  };
  
  // Process interfaces
  console.log('Processing interfaces...');
  const interfacesPath = join(BASE_PATH, 'interfaces');
  const interfaceFiles = readdirSync(interfacesPath).filter(f => f.endsWith('.md'));
  
  for (const file of interfaceFiles) {
    const content = readFileSync(join(interfacesPath, file), 'utf-8');
    const name = file.replace('.md', '');
    const parsed = parseInterface(content, name);
    result.interfaces.push(parsed);
  }
  console.log(`✓ Processed ${result.interfaces.length} interfaces`);
  
  // Process functions
  console.log('Processing functions...');
  const functionsPath = join(BASE_PATH, 'functions');
  const functionFiles = readdirSync(functionsPath).filter(f => f.endsWith('.md'));
  
  for (const file of functionFiles) {
    const content = readFileSync(join(functionsPath, file), 'utf-8');
    const name = file.replace('.md', '');
    const parsed = parseFunction(content, name);
    result.functions.push(parsed);
  }
  console.log(`✓ Processed ${result.functions.length} functions`);
  
  // Process variables
  console.log('Processing variables...');
  const variablesPath = join(BASE_PATH, 'variables');
  const variableFiles = readdirSync(variablesPath).filter(f => f.endsWith('.md'));
  
  for (const file of variableFiles) {
    const content = readFileSync(join(variablesPath, file), 'utf-8');
    const name = file.replace('.md', '');
    const parsed = parseVariable(content, name);
    result.variables.push(parsed);
  }
  console.log(`✓ Processed ${result.variables.length} variables`);
  
  // Save processed data
  const outputPath = 'docs/devvit-api/EventTypes-processed.json';
  writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n✓ Saved processed data to ${outputPath}`);
  
  // Generate summary
  console.log('\n=== EventTypes Summary ===');
  console.log(`\nInterfaces (${result.interfaces.length}):`);
  result.interfaces.forEach(iface => {
    console.log(`  - ${iface.name} (${iface.properties.length} properties)`);
  });
  
  console.log(`\nFunctions (${result.functions.length}):`);
  result.functions.forEach(func => {
    console.log(`  - ${func.name}`);
  });
  
  console.log(`\nVariables (${result.variables.length}):`);
  result.variables.forEach(variable => {
    console.log(`  - ${variable.name}: ${variable.value}`);
  });
}

main();
