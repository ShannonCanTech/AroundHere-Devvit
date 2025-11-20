/**
 * Markdown Parser Module
 * Parses Devvit API documentation markdown files and extracts structured information
 */

export class MarkdownParser {
  /**
   * Parse class methods from markdown content
   * @param {string} markdown - Markdown content
   * @returns {Array<Object>} Array of method objects
   */
  parseClassMethods(markdown) {
    return extractMethods(markdown);
  }

  /**
   * Parse type alias from markdown
   * @param {string} markdown - Markdown content
   * @returns {Object} Parsed type alias
   */
  parseTypeAlias(markdown) {
    return parseTypeAlias(markdown);
  }

  /**
   * Parse function from markdown
   * @param {string} markdown - Markdown content
   * @returns {Object} Parsed function
   */
  parseFunction(markdown) {
    return parseFunction(markdown);
  }

  /**
   * Parse class from markdown
   * @param {string} markdown - Markdown content
   * @returns {Object} Parsed class
   */
  parseClass(markdown) {
    return parseClass(markdown);
  }

  /**
   * Parse enum from markdown
   * @param {string} markdown - Markdown content
   * @returns {Object} Parsed enum
   */
  parseEnum(markdown) {
    return parseEnum(markdown);
  }

  /**
   * Parse interface from markdown
   * @param {string} markdown - Markdown content
   * @returns {Object} Parsed interface
   */
  parseInterface(markdown) {
    return parseInterface(markdown);
  }
}

/**
 * Parse type alias definition from markdown
 * @param {string} markdown - Markdown content
 * @returns {Object} Parsed type alias documentation
 */
export function parseTypeAlias(markdown) {
  const doc = {
    name: '',
    description: '',
    signature: '',
    properties: [],
    examples: []
  };

  // Extract name from title
  const titleMatch = markdown.match(/^#\s+(.+?)(?:\s+Type alias)?$/m);
  if (titleMatch) {
    doc.name = titleMatch[1].trim();
  }

  // Extract description (text between title and signature)
  const descMatch = markdown.match(/^#\s+.+?\n\n([\s\S]+?)(?=\n##|\n```|$)/);
  if (descMatch) {
    doc.description = descMatch[1].trim();
  }

  // Extract type signature
  const sigMatch = markdown.match(/```typescript\n(type\s+\w+[\s\S]+?)\n```/);
  if (sigMatch) {
    doc.signature = sigMatch[1].trim();
  }

  // Extract properties from signature or properties section
  doc.properties = extractProperties(markdown);

  // Extract code examples
  doc.examples = extractCodeExamples(markdown);

  return doc;
}

/**
 * Parse function definition from markdown
 * @param {string} markdown - Markdown content
 * @returns {Object} Parsed function documentation
 */
export function parseFunction(markdown) {
  const doc = {
    name: '',
    description: '',
    signature: '',
    signatures: [],
    parameters: [],
    returns: '',
    examples: []
  };

  // Extract name from title (handle "Function: name()" format)
  const titleMatch = markdown.match(/^#\s+(?:Function:\s+)?(.+?)(?:\(\))?(?:\s+Function)?$/m);
  if (titleMatch) {
    doc.name = titleMatch[1].trim();
  }

  // Extract signature from blockquote (format: > **funcName**(...): ReturnType)
  const blockquoteSigMatch = markdown.match(/^>\s+\*\*(\w+)\*\*(?:\\<[^>]+\\>)?\(([^)]*)\):\s*(.+?)$/m);
  if (blockquoteSigMatch) {
    const funcName = blockquoteSigMatch[1].trim();
    const params = blockquoteSigMatch[2].trim();
    const returnType = blockquoteSigMatch[3].trim().replace(/\[`([^`]+)`\]\([^)]+\)/g, '$1'); // Remove markdown links
    
    doc.signatures.push({
      name: funcName,
      parameters: params,
      returns: returnType
    });
  }

  // Extract description (text after signature blockquote, before first ## section)
  const descMatch = markdown.match(/^>\s+\*\*\w+\*\*[^\n]+\n(.+?)(?=\n##|$)/s);
  if (descMatch) {
    doc.description = descMatch[1].trim();
  } else {
    // Try alternative format (text between title and first ## section)
    const altDescMatch = markdown.match(/^#\s+.+?\n\n([\s\S]+?)(?=\n##|\n```|$)/);
    if (altDescMatch) {
      doc.description = altDescMatch[1].trim();
    }
  }

  // Extract function signatures (handle multiple overloads with "Call Signature" sections)
  const callSigMatches = markdown.matchAll(/##\s+Call Signature\s*\n\n>\s+\*\*(\w+)\*\*\(([^)]*)\):\s*(.+?)(?=\n###|\n##|$)/gs);
  
  for (const match of callSigMatches) {
    const funcName = match[1].trim();
    const params = match[2].trim();
    const returnType = match[3].trim().replace(/\[`([^`]+)`\]\([^)]+\)/g, '$1'); // Remove markdown links
    
    doc.signatures.push({
      name: funcName,
      parameters: params,
      returns: returnType
    });
  }

  // If we have signatures, use the first one as the main signature
  if (doc.signatures.length > 0) {
    const firstSig = doc.signatures[0];
    doc.signature = `${firstSig.name}(${firstSig.parameters}): ${firstSig.returns}`;
    doc.returns = firstSig.returns;
  }

  // Extract function signature from code block if no call signatures found
  if (!doc.signature) {
    const sigMatch = markdown.match(/```typescript\n((?:function|const|export)\s+\w+[\s\S]+?)\n```/);
    if (sigMatch) {
      doc.signature = sigMatch[1].trim();
    }
  }

  // Extract parameters
  doc.parameters = extractParameters(markdown);

  // Extract return type if not already set
  if (!doc.returns) {
    const returnMatch = markdown.match(/###\s+Returns\s*\n\n(.+?)(?=\n###|\n##|$)/s);
    if (returnMatch) {
      doc.returns = returnMatch[1].trim().replace(/\[`([^`]+)`\]\([^)]+\)/g, '$1');
    } else {
      // Try to extract from signature
      const sigReturnMatch = doc.signature.match(/:\s*([^{;]+?)(?:\s*=>|\s*{|$)/);
      if (sigReturnMatch) {
        doc.returns = sigReturnMatch[1].trim();
      }
    }
  }

  // Extract code examples
  doc.examples = extractCodeExamples(markdown);

  return doc;
}

/**
 * Parse class definition from markdown
 * @param {string} markdown - Markdown content
 * @returns {Object} Parsed class documentation
 */
export function parseClass(markdown) {
  const doc = {
    name: '',
    description: '',
    methods: [],
    properties: [],
    examples: []
  };

  // Extract name from title
  const titleMatch = markdown.match(/^#\s+(?:Class:\s+)?(.+?)(?:\s+Class)?$/m);
  if (titleMatch) {
    doc.name = titleMatch[1].trim();
  }

  // Extract description
  const descMatch = markdown.match(/^#\s+.+?\n\n([\s\S]+?)(?=\n##|\n```|$)/);
  if (descMatch) {
    doc.description = descMatch[1].trim();
  }

  // Extract methods
  doc.methods = extractMethods(markdown);

  // Extract properties
  doc.properties = extractProperties(markdown);

  // Extract code examples
  doc.examples = extractCodeExamples(markdown);

  return doc;
}

/**
 * Parse enum definition from markdown
 * @param {string} markdown - Markdown content
 * @returns {Object} Parsed enum documentation
 */
export function parseEnum(markdown) {
  const doc = {
    name: '',
    description: '',
    members: [],
    examples: []
  };

  // Extract name from title
  const titleMatch = markdown.match(/^#\s+(?:Enumeration:\s+)?(.+?)(?:\s+Enum(?:eration)?)?$/m);
  if (titleMatch) {
    doc.name = titleMatch[1].trim();
  }

  // Extract description
  const descMatch = markdown.match(/^#\s+.+?\n\n([\s\S]+?)(?=\n##|\n```|$)/);
  if (descMatch) {
    doc.description = descMatch[1].trim();
  }

  // Extract enum members
  doc.members = extractEnumMembers(markdown);

  // Extract code examples
  doc.examples = extractCodeExamples(markdown);

  return doc;
}

/**
 * Parse interface definition from markdown
 * @param {string} markdown - Markdown content
 * @returns {Object} Parsed interface documentation
 */
export function parseInterface(markdown) {
  const doc = {
    name: '',
    description: '',
    properties: [],
    methods: [],
    examples: []
  };

  // Extract name from title
  const titleMatch = markdown.match(/^#\s+(?:Interface:\s+)?(.+?)(?:\s+Interface)?$/m);
  if (titleMatch) {
    doc.name = titleMatch[1].trim();
  }

  // Extract description
  const descMatch = markdown.match(/^#\s+.+?\n\n([\s\S]+?)(?=\n##|\n```|$)/);
  if (descMatch) {
    doc.description = descMatch[1].trim();
  }

  // Extract properties
  doc.properties = extractProperties(markdown);

  // Extract methods
  doc.methods = extractMethods(markdown);

  // Extract code examples
  doc.examples = extractCodeExamples(markdown);

  return doc;
}

/**
 * Extract properties from markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<Object>} Array of property objects
 */
function extractProperties(markdown) {
  const properties = [];

  // Look for Properties section
  const propsMatch = markdown.match(/##\s+Properties\s*\n([\s\S]+?)(?=\n##[^#]|$)/);
  if (propsMatch) {
    const propsText = propsMatch[1];
    
    // Match property definitions with format: ### propertyName\n\n> `static` **propertyName**: Type
    const propMatches = propsText.matchAll(/###\s+(\w+)[\s\S]*?\n\n>\s+`static`\s+\*\*\w+\*\*:\s+\[?`?([^\]`\n]+)`?\]?/g);
    
    for (const match of propMatches) {
      properties.push({
        name: match[1].trim(),
        type: match[2].trim(),
        description: '',
        optional: false
      });
    }
    
    // If no matches, try simpler pattern: ### propertyName or - `propertyName`
    if (properties.length === 0) {
      const simplePropMatches = propsText.matchAll(/(?:###\s+|[-•]\s+`?)(\w+)`?(?:\s*:\s*`([^`]+)`)?(?:\s*-\s*(.+?))?(?=\n(?:###|[-•]|\n)|$)/gs);
      
      for (const match of simplePropMatches) {
        properties.push({
          name: match[1].trim(),
          type: match[2] ? match[2].trim() : '',
          description: match[3] ? match[3].trim() : '',
          optional: match[0].includes('?')
        });
      }
    }
  }

  // Also try to extract from type signature
  const sigMatch = markdown.match(/```typescript\n(?:type|interface)\s+\w+\s*=?\s*{([\s\S]+?)}\n```/);
  if (sigMatch && properties.length === 0) {
    const propsText = sigMatch[1];
    const propMatches = propsText.matchAll(/(\w+)(\?)?:\s*([^;,\n]+)/g);
    
    for (const match of propMatches) {
      properties.push({
        name: match[1].trim(),
        type: match[3].trim(),
        description: '',
        optional: !!match[2]
      });
    }
  }

  return properties;
}

/**
 * Extract parameters from markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<Object>} Array of parameter objects
 */
function extractParameters(markdown) {
  const parameters = [];

  // Look for Parameters section (### or ##)
  const paramsMatch = markdown.match(/###?\s+Parameters\s*\n([\s\S]+?)(?=\n###?\s+Returns|\n##[^#]|$)/);
  if (paramsMatch) {
    const paramsText = paramsMatch[1];
    
    // Match parameter definitions with #### heading format
    const paramHeadingMatches = paramsText.matchAll(/####\s+(\w+)\s*\n\n(.+?)(?=\n####|\n###|$)/gs);
    
    for (const match of paramHeadingMatches) {
      const paramName = match[1].trim();
      const paramContent = match[2].trim();
      
      // Extract type from content (format: [`Type`](link) or just Type)
      const typeMatch = paramContent.match(/\[`([^`]+)`\]\([^)]+\)|`([^`]+)`|^([^\n]+)/);
      const paramType = typeMatch ? (typeMatch[1] || typeMatch[2] || typeMatch[3]).trim() : '';
      
      parameters.push({
        name: paramName,
        type: paramType,
        description: paramContent,
        optional: paramContent.includes('?') || paramContent.toLowerCase().includes('optional')
      });
    }
    
    // If no heading-based params found, try bullet list format
    if (parameters.length === 0) {
      const paramMatches = paramsText.matchAll(/[-•]\s+`?(\w+)`?(?:\s*:\s*`([^`]+)`)?(?:\s*-\s*(.+?))?(?=\n[-•]|\n\n|$)/gs);
      
      for (const match of paramMatches) {
        parameters.push({
          name: match[1].trim(),
          type: match[2] ? match[2].trim() : '',
          description: match[3] ? match[3].trim() : '',
          optional: match[0].includes('?') || match[0].toLowerCase().includes('optional')
        });
      }
    }
  }

  return parameters;
}

/**
 * Extract methods from markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<Object>} Array of method objects
 */
function extractMethods(markdown) {
  const methods = [];

  // Look for Methods section
  const methodsMatch = markdown.match(/##\s+Methods\s*\n([\s\S]+?)(?=\n##[^#]|$)/);
  if (methodsMatch) {
    const methodsText = methodsMatch[1];
    
    // Match method definitions - handle both ### methodName and ### methodName()
    const methodMatches = methodsText.matchAll(/###\s+(\w+)\(\)?[\s\S]*?\n\n>([\s\S]+?)(?=\n---|\n###|\n##|$)/g);
    
    for (const match of methodMatches) {
      const methodName = match[1].trim();
      const methodContent = match[2];
      
      // Extract method signature from > `static` **methodName**(...): ReturnType
      const sigMatch = methodContent.match(/`static`\s+\*\*\w+\*\*\(([^)]*)\):\s*`?([^`\n]+)`?/);
      let signature = '';
      let returns = '';
      
      if (sigMatch) {
        const params = sigMatch[1].trim();
        returns = sigMatch[2].trim();
        signature = `static ${methodName}(${params}): ${returns}`;
      }
      
      // Extract description (text after signature, before Parameters)
      const descMatch = methodContent.match(/\n\n([^\n#]+?)(?=\n####|\n\n####|$)/);
      const description = descMatch ? descMatch[1].trim() : '';
      
      // Extract full method content for parameter extraction
      const fullMethodMatch = methodsText.match(new RegExp(`###\\s+${methodName}\\(\\)?[\\s\\S]+?(?=\\n---)`));
      const fullMethodContent = fullMethodMatch ? fullMethodMatch[0] : methodContent;
      
      methods.push({
        name: methodName,
        signature,
        description,
        parameters: extractParameters(fullMethodContent),
        returns
      });
    }
  }

  return methods;
}

/**
 * Extract enum members from markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<Object>} Array of enum member objects
 */
function extractEnumMembers(markdown) {
  const members = [];

  // Look for Members or Enumeration Members section
  const membersMatch = markdown.match(/##\s+(?:Enumeration\s+)?Members\s*\n([\s\S]+?)(?=\n##[^#]|$)/);
  if (membersMatch) {
    const membersText = membersMatch[1];
    
    // Match member definitions with format: ### MEMBER_NAME\n\n> **MEMBER_NAME**: `value`
    const memberMatches = membersText.matchAll(/###\s+(\w+)\s*\n+>\s+\*\*\w+\*\*:\s+`([^`]+)`/g);
    
    for (const match of memberMatches) {
      const memberName = match[1].trim();
      const value = match[2].trim();
      
      members.push({
        name: memberName,
        value,
        description: ''
      });
    }
    
    // If no matches with that format, try alternative format
    if (members.length === 0) {
      const altMemberMatches = membersText.matchAll(/###\s+(\w+)\s*\n([\s\S]+?)(?=\n###|\n##|$)/g);
      
      for (const match of altMemberMatches) {
        const memberName = match[1].trim();
        const memberContent = match[2].trim();
        
        // Extract value if present
        const valueMatch = memberContent.match(/`([^`]+)`/);
        const value = valueMatch ? valueMatch[1] : memberName;
        
        members.push({
          name: memberName,
          value,
          description: memberContent.replace(/>\s+\*\*\w+\*\*:\s+`[^`]+`/, '').trim()
        });
      }
    }
  }

  // Also try to extract from enum signature
  const sigMatch = markdown.match(/```typescript\nenum\s+\w+\s*{([\s\S]+?)}\n```/);
  if (sigMatch && members.length === 0) {
    const membersText = sigMatch[1];
    const memberMatches = membersText.matchAll(/(\w+)\s*=?\s*([^,\n]*)/g);
    
    for (const match of memberMatches) {
      if (match[1].trim()) {
        members.push({
          name: match[1].trim(),
          value: match[2].trim() || match[1].trim(),
          description: ''
        });
      }
    }
  }

  return members;
}

/**
 * Extract return type from markdown
 * @param {string} markdown - Markdown content
 * @returns {string} Return type
 */
function extractReturnType(markdown) {
  const returnMatch = markdown.match(/##\s+Returns\s*\n\n`([^`]+)`/);
  if (returnMatch) {
    return returnMatch[1].trim();
  }
  return '';
}

/**
 * Extract code examples from markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<string>} Array of code examples
 */
function extractCodeExamples(markdown) {
  const examples = [];
  
  // Look for Example or Examples section
  const exampleMatch = markdown.match(/##\s+Examples?\s*\n([\s\S]+?)(?=\n##|$)/);
  if (exampleMatch) {
    const examplesText = exampleMatch[1];
    
    // Extract all code blocks
    const codeMatches = examplesText.matchAll(/```(?:typescript|javascript|ts|js)?\n([\s\S]+?)\n```/g);
    
    for (const match of codeMatches) {
      examples.push(match[1].trim());
    }
  }

  return examples;
}

/**
 * Extract JSDoc comments from markdown
 * @param {string} markdown - Markdown content
 * @returns {Object} JSDoc information
 */
export function extractJSDoc(markdown) {
  const jsdoc = {
    description: '',
    params: [],
    returns: '',
    examples: [],
    deprecated: false,
    since: ''
  };

  // Extract JSDoc from code blocks
  const jsdocMatch = markdown.match(/\/\*\*([\s\S]+?)\*\//);
  if (jsdocMatch) {
    const jsdocText = jsdocMatch[1];
    
    // Extract description (first non-tag lines)
    const descMatch = jsdocText.match(/^\s*\*\s*([^@]+)/);
    if (descMatch) {
      jsdoc.description = descMatch[1].trim();
    }
    
    // Extract @param tags
    const paramMatches = jsdocText.matchAll(/@param\s+(?:{([^}]+)}\s+)?(\w+)\s*-?\s*(.+?)(?=\n\s*\*\s*@|\n\s*\*\/|$)/gs);
    for (const match of paramMatches) {
      jsdoc.params.push({
        type: match[1] ? match[1].trim() : '',
        name: match[2].trim(),
        description: match[3].trim()
      });
    }
    
    // Extract @returns tag
    const returnsMatch = jsdocText.match(/@returns?\s+(?:{([^}]+)}\s+)?(.+?)(?=\n\s*\*\s*@|\n\s*\*\/|$)/s);
    if (returnsMatch) {
      jsdoc.returns = returnsMatch[2].trim();
    }
    
    // Extract @example tags
    const exampleMatches = jsdocText.matchAll(/@example\s+([\s\S]+?)(?=\n\s*\*\s*@|\n\s*\*\/|$)/g);
    for (const match of exampleMatches) {
      jsdoc.examples.push(match[1].trim());
    }
    
    // Check for @deprecated
    jsdoc.deprecated = /@deprecated/.test(jsdocText);
    
    // Extract @since
    const sinceMatch = jsdocText.match(/@since\s+(.+?)(?=\n\s*\*\s*@|\n\s*\*\/|$)/);
    if (sinceMatch) {
      jsdoc.since = sinceMatch[1].trim();
    }
  }

  return jsdoc;
}

/**
 * Identify cross-references to other types in markdown
 * @param {string} markdown - Markdown content
 * @returns {Array<string>} Array of referenced type names
 */
export function extractCrossReferences(markdown) {
  const references = new Set();

  // Find markdown links to other types
  const linkMatches = markdown.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of linkMatches) {
    const linkText = match[1];
    const linkUrl = match[2];
    
    // Check if it's a type reference (not external URL)
    if (!linkUrl.startsWith('http') && !linkUrl.startsWith('#')) {
      references.add(linkText);
    }
  }

  // Find type references in code (e.g., : TypeName, <TypeName>)
  const typeMatches = markdown.matchAll(/(?::\s*|<)([A-Z]\w+)(?:[>\s,;|])/g);
  for (const match of typeMatches) {
    references.add(match[1]);
  }

  return Array.from(references);
}

/**
 * Clean up markdown formatting
 * @param {string} markdown - Markdown content
 * @returns {string} Cleaned markdown
 */
export function cleanMarkdown(markdown) {
  let cleaned = markdown;

  // Remove excessive blank lines (more than 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Normalize heading spacing
  cleaned = cleaned.replace(/^(#+\s+.+)$/gm, '\n$1\n');

  // Remove trailing whitespace
  cleaned = cleaned.replace(/[ \t]+$/gm, '');

  // Ensure file ends with newline
  if (!cleaned.endsWith('\n')) {
    cleaned += '\n';
  }

  return cleaned;
}

/**
 * Parse generic documentation item (auto-detect type)
 * @param {string} markdown - Markdown content
 * @returns {Object} Parsed documentation
 */
export function parseDocumentation(markdown) {
  // Detect document type
  if (markdown.includes('Type alias') || /^type\s+\w+/m.test(markdown)) {
    return { type: 'typeAlias', ...parseTypeAlias(markdown) };
  }
  
  if (markdown.includes('Function') || /^(?:function|const)\s+\w+/m.test(markdown)) {
    return { type: 'function', ...parseFunction(markdown) };
  }
  
  if (markdown.includes('Class:') || /^class\s+\w+/m.test(markdown)) {
    return { type: 'class', ...parseClass(markdown) };
  }
  
  if (markdown.includes('Enumeration') || /^enum\s+\w+/m.test(markdown)) {
    return { type: 'enum', ...parseEnum(markdown) };
  }
  
  if (markdown.includes('Interface:') || /^interface\s+\w+/m.test(markdown)) {
    return { type: 'interface', ...parseInterface(markdown) };
  }

  // Default to generic parsing
  return {
    type: 'unknown',
    name: extractTitle(markdown),
    description: extractDescription(markdown),
    examples: extractCodeExamples(markdown)
  };
}

/**
 * Extract title from markdown
 * @param {string} markdown - Markdown content
 * @returns {string} Title
 */
function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

/**
 * Extract description from markdown
 * @param {string} markdown - Markdown content
 * @returns {string} Description
 */
function extractDescription(markdown) {
  const match = markdown.match(/^#\s+.+?\n\n([\s\S]+?)(?=\n##|\n```|$)/);
  return match ? match[1].trim() : '';
}
