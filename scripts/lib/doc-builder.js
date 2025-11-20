/**
 * Documentation Builder
 * Assembles parsed content into organized documentation
 */

export class DocumentationBuilder {
  constructor() {
    this.sections = [];
    this.toc = [];
    this.metadata = {
      version: 'unknown',
      lastSynced: new Date().toISOString().split('T')[0],
      githubCommit: null,
      sourceUrls: []
    };
  }

  /**
   * Set documentation metadata
   * @param {Object} metadata - Metadata object
   */
  setMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
  }

  /**
   * Add a section to the documentation
   * @param {string} title - Section title
   * @param {string} content - Section content
   * @param {number} level - Heading level (default: 2)
   */
  addSection(title, content, level = 2) {
    const anchor = this._createAnchor(title);
    const heading = '#'.repeat(level);
    
    this.sections.push({
      title,
      content,
      level,
      anchor
    });

    this.toc.push({
      title,
      anchor,
      level
    });
  }

  /**
   * Add a type alias to documentation
   * @param {Object} doc - Parsed type alias documentation
   * @param {string} category - Category name for the type alias
   */
  addTypeAlias(doc, category = null) {
    let content = `### ${doc.name}\n\n`;
    
    content += `**Type**: Type Alias\n\n`;
    
    if (doc.description) {
      content += `${doc.description}\n\n`;
    }

    if (doc.signature) {
      content += `**Signature**:\n\`\`\`typescript\n${doc.signature}\n\`\`\`\n\n`;
    }

    if (doc.properties && doc.properties.length > 0) {
      content += `**Properties**:\n`;
      for (const prop of doc.properties) {
        const optional = prop.optional ? '?' : '';
        content += `- \`${prop.name}${optional}\`: \`${prop.type}\``;
        if (prop.description) {
          content += ` - ${prop.description}`;
        }
        content += '\n';
      }
      content += '\n';
    }

    if (doc.examples && doc.examples.length > 0) {
      content += `**Example**:\n\`\`\`typescript\n${doc.examples[0]}\n\`\`\`\n\n`;
    }

    content += '---\n\n';
    
    return content;
  }

  /**
   * Add a function to documentation
   * @param {Object} doc - Parsed function documentation
   * @param {string} category - Category name for the function
   */
  addFunction(doc, category = null) {
    let content = `### ${doc.name}\n\n`;
    
    content += `**Type**: Function\n\n`;
    
    if (doc.description) {
      content += `${doc.description}\n\n`;
    }

    // Handle multiple signatures (overloads)
    if (doc.signatures && doc.signatures.length > 0) {
      if (doc.signatures.length === 1) {
        content += `**Signature**:\n\`\`\`typescript\n${doc.signatures[0].name}(${doc.signatures[0].parameters}): ${doc.signatures[0].returns}\n\`\`\`\n\n`;
      } else {
        content += `**Signatures** (${doc.signatures.length} overloads):\n`;
        for (const sig of doc.signatures) {
          content += `\`\`\`typescript\n${sig.name}(${sig.parameters}): ${sig.returns}\n\`\`\`\n`;
        }
        content += '\n';
      }
    } else if (doc.signature) {
      content += `**Signature**:\n\`\`\`typescript\n${doc.signature}\n\`\`\`\n\n`;
    }

    if (doc.parameters && doc.parameters.length > 0) {
      content += `**Parameters**:\n`;
      for (const param of doc.parameters) {
        const optional = param.optional ? '?' : '';
        content += `- \`${param.name}${optional}\`: \`${param.type}\``;
        if (param.description) {
          content += ` - ${param.description}`;
        }
        content += '\n';
      }
      content += '\n';
    }

    if (doc.returns) {
      if (typeof doc.returns === 'string') {
        content += `**Returns**: \`${doc.returns}\`\n\n`;
      } else {
        content += `**Returns**: \`${doc.returns.type}\``;
        if (doc.returns.description) {
          content += ` - ${doc.returns.description}`;
        }
        content += '\n\n';
      }
    }

    if (doc.examples && doc.examples.length > 0) {
      content += `**Example**:\n\`\`\`typescript\n${doc.examples[0]}\n\`\`\`\n\n`;
    }

    content += '---\n\n';
    
    return content;
  }

  /**
   * Add a class to documentation
   * @param {Object} doc - Parsed class documentation
   * @param {string} category - Category name for the class
   */
  addClass(doc, category = null) {
    let content = `### ${doc.name}\n\n`;
    
    content += `**Type**: Class\n\n`;
    
    if (doc.description) {
      content += `${doc.description}\n\n`;
    }

    if (doc.properties && doc.properties.length > 0) {
      content += `**Properties**:\n`;
      for (const prop of doc.properties) {
        const optional = prop.optional ? '?' : '';
        content += `- \`${prop.name}${optional}\`: \`${prop.type}\``;
        if (prop.description) {
          content += ` - ${prop.description}`;
        }
        content += '\n';
      }
      content += '\n';
    }

    if (doc.methods && doc.methods.length > 0) {
      content += `**Methods**:\n`;
      for (const method of doc.methods) {
        const deprecated = method.deprecated ? ' ~~(deprecated)~~' : '';
        content += `- \`${method.name}()\`${deprecated}`;
        if (method.description) {
          content += ` - ${method.description}`;
        }
        content += '\n';
      }
      content += '\n';
    }

    if (doc.examples && doc.examples.length > 0) {
      content += `**Example**:\n\`\`\`typescript\n${doc.examples[0]}\n\`\`\`\n\n`;
    }

    content += '---\n\n';
    
    return content;
  }

  /**
   * Add an enum to documentation
   * @param {Object} doc - Parsed enum documentation
   * @param {string} category - Category name for the enum
   */
  addEnum(doc, category = null) {
    let content = `### ${doc.name}\n\n`;
    
    content += `**Type**: Enum\n\n`;
    
    if (doc.description) {
      content += `${doc.description}\n\n`;
    }

    if (doc.members && doc.members.length > 0) {
      content += `**Members**:\n`;
      for (const member of doc.members) {
        content += `- \`${member.name}\``;
        if (member.value && member.value !== member.name) {
          content += ` = \`${member.value}\``;
        }
        if (member.description) {
          content += ` - ${member.description}`;
        }
        content += '\n';
      }
      content += '\n';
    }

    if (doc.examples && doc.examples.length > 0) {
      content += `**Example**:\n\`\`\`typescript\n${doc.examples[0]}\n\`\`\`\n\n`;
    }

    content += '---\n\n';
    
    return content;
  }

  /**
   * Generate table of contents with hierarchical structure
   * @param {boolean} includeQuickNav - Include quick navigation section
   * @returns {string} Formatted table of contents
   */
  generateTableOfContents(includeQuickNav = true) {
    let toc = '## Table of Contents\n\n';
    
    // Add quick navigation if requested
    if (includeQuickNav && this.toc.length > 0) {
      toc += '### Quick Navigation\n\n';
      
      // Group by top-level sections (level 2)
      const topLevelSections = this.toc.filter(item => item.level === 2);
      
      if (topLevelSections.length > 0) {
        toc += '**Jump to**: ';
        const links = topLevelSections.map(item => 
          `[${item.title}](#${item.anchor})`
        );
        toc += links.join(' • ');
        toc += '\n\n';
      }
    }
    
    // Generate hierarchical TOC
    toc += '### Full Contents\n\n';
    
    for (const item of this.toc) {
      const indent = '  '.repeat(Math.max(0, item.level - 2));
      toc += `${indent}- [${item.title}](#${item.anchor})\n`;
    }
    
    toc += '\n';
    return toc;
  }

  /**
   * Generate category-based table of contents
   * @param {Map<string, Array>} categorizedItems - Map of category to items
   * @returns {string} Category-based TOC
   */
  generateCategoryTOC(categorizedItems) {
    let toc = '## Table of Contents\n\n';
    
    for (const [category, items] of categorizedItems) {
      if (items.length === 0) continue;
      
      const anchor = this._createAnchor(category);
      toc += `- [${category}](#${anchor}) (${items.length} items)\n`;
      
      // Add first few items as preview
      const preview = items.slice(0, 3);
      for (const item of preview) {
        const itemAnchor = this._createAnchor(item.name);
        toc += `  - [${item.name}](#${itemAnchor})\n`;
      }
      
      if (items.length > 3) {
        toc += `  - ... and ${items.length - 3} more\n`;
      }
    }
    
    toc += '\n';
    return toc;
  }

  /**
   * Build the complete documentation
   * @param {boolean} applyFormatting - Apply consistent formatting
   * @returns {string} Complete markdown documentation
   */
  build(applyFormatting = true) {
    let doc = this._buildHeader();
    doc += this.generateTableOfContents();
    
    for (const section of this.sections) {
      const heading = '#'.repeat(section.level);
      doc += `${heading} ${section.title}\n\n`;
      doc += section.content;
      doc += '\n';
    }
    
    doc += this._buildFooter();
    
    if (applyFormatting) {
      doc = this.applyConsistentFormatting(doc);
    }
    
    return doc;
  }

  /**
   * Build documentation from categorized items
   * @param {Map<string, Array>} categorizedItems - Map of category to items
   * @param {Array<string>} categoryOrder - Order of categories
   * @returns {string} Complete documentation
   */
  buildFromCategories(categorizedItems, categoryOrder) {
    let doc = this._buildHeader();
    
    // Generate category-based TOC
    doc += this.generateCategoryTOC(categorizedItems);
    
    // Build each category section
    for (const category of categoryOrder) {
      const items = categorizedItems.get(category);
      
      if (!items || items.length === 0) {
        continue;
      }
      
      // Add category section
      doc += `## ${category}\n\n`;
      
      // Add category description if available
      const description = this._getCategoryDescription(category);
      if (description) {
        doc += `${description}\n\n`;
      }
      
      // Add each item in the category
      for (const item of items) {
        doc += this._formatItem(item);
      }
      
      doc += '\n';
    }
    
    doc += this._buildFooter();
    
    return this.applyConsistentFormatting(doc);
  }

  /**
   * Format a single documentation item
   * @param {Object} item - Documentation item
   * @returns {string} Formatted item
   */
  _formatItem(item) {
    switch (item.type) {
      case 'typeAlias':
        return this.addTypeAlias(item);
      case 'function':
        return this.addFunction(item);
      case 'class':
        return this.addClass(item);
      case 'enum':
        return this.addEnum(item);
      case 'interface':
        return this.addTypeAlias(item); // Interfaces formatted like type aliases
      default:
        return this._formatGenericItem(item);
    }
  }

  /**
   * Format a generic documentation item
   * @param {Object} item - Generic item
   * @returns {string} Formatted item
   */
  _formatGenericItem(item) {
    let content = `### ${item.name}\n\n`;
    
    if (item.description) {
      content += `${item.description}\n\n`;
    }
    
    if (item.signature) {
      content += `**Signature**:\n${this.formatCodeBlock(item.signature)}\n\n`;
    }
    
    if (item.examples && item.examples.length > 0) {
      content += `**Example**:\n${this.formatCodeBlock(item.examples[0])}\n\n`;
    }
    
    content += '---\n\n';
    return content;
  }

  /**
   * Get category description
   * @param {string} category - Category name
   * @returns {string} Description
   */
  _getCategoryDescription(category) {
    const descriptions = {
      'Core Classes': 'Main classes that provide core Devvit functionality',
      'Hooks': 'React-style hooks for state management and side effects',
      'Context & API Clients': 'Context objects and API clients available in handlers',
      'Event System': 'Event types and trigger definitions for Reddit events',
      'Forms & UI': 'Form definitions, field types, and UI components',
      'Redis Client': 'Redis client types and data structures',
      'Scheduler & Jobs': 'Scheduled jobs and cron task definitions',
      'Reddit API Client': 'Reddit API client methods and model types',
      'Utility Types': 'Common utility types and helper definitions',
      'Enumerations': 'Enumeration types with named constants'
    };
    
    return descriptions[category] || '';
  }

  /**
   * Build documentation header with metadata
   */
  _buildHeader() {
    return `# Devvit Complete API Reference

**Version**: ${this.metadata.version}  
**Last Synced**: ${this.metadata.lastSynced}  
${this.metadata.githubCommit ? `**GitHub Commit**: ${this.metadata.githubCommit}  \n` : ''}
**Source**: https://github.com/reddit/devvit

---

`;
  }

  /**
   * Build documentation footer
   */
  _buildFooter() {
    return `---

## Update Instructions

To update this documentation:

1. Run: \`node scripts/generate-devvit-docs.js\`
2. Review changes in git diff
3. Update version number if needed
4. Commit changes

**Generated by**: Devvit Documentation Generator  
**Last Updated**: ${this.metadata.lastSynced}
`;
  }

  /**
   * Create URL-safe anchor from title
   * @param {string} title - Title to convert to anchor
   * @returns {string} URL-safe anchor
   */
  _createAnchor(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Add anchor link to TOC
   * @param {string} title - Section title
   * @param {number} level - Heading level
   */
  addToTOC(title, level = 2) {
    const anchor = this._createAnchor(title);
    this.toc.push({ title, anchor, level });
  }

  /**
   * Get all TOC entries
   * @returns {Array} TOC entries
   */
  getTOCEntries() {
    return this.toc;
  }

  /**
   * Clear TOC
   */
  clearTOC() {
    this.toc = [];
  }

  /**
   * Format code block with syntax highlighting
   * @param {string} code - Code to format
   * @param {string} language - Programming language
   * @returns {string} Formatted code block
   */
  formatCodeBlock(code, language = 'typescript') {
    // Clean up code formatting
    const cleanedCode = code.trim();
    return `\`\`\`${language}\n${cleanedCode}\n\`\`\``;
  }

  /**
   * Format type signature with TypeScript syntax
   * @param {string} signature - Type signature
   * @returns {string} Formatted signature
   */
  formatTypeSignature(signature) {
    return this.formatCodeBlock(signature, 'typescript');
  }

  /**
   * Format code example with proper highlighting
   * @param {string} example - Code example
   * @param {string} description - Optional description
   * @returns {string} Formatted example
   */
  formatCodeExample(example, description = null) {
    let formatted = '';
    
    if (description) {
      formatted += `${description}\n\n`;
    }
    
    formatted += this.formatCodeBlock(example, 'typescript');
    
    return formatted;
  }

  /**
   * Add cross-reference link
   * @param {string} text - Link text
   * @param {string} anchor - Target anchor
   * @returns {string} Markdown link
   */
  addCrossReference(text, anchor) {
    return `[${text}](#${this._createAnchor(anchor)})`;
  }

  /**
   * Add multiple cross-reference links
   * @param {Array<Object>} references - Array of {text, anchor} objects
   * @returns {string} Formatted cross-references
   */
  addCrossReferences(references) {
    if (!references || references.length === 0) {
      return '';
    }
    
    let content = '**See Also**: ';
    const links = references.map(ref => 
      this.addCrossReference(ref.text, ref.anchor)
    );
    content += links.join(', ');
    content += '\n\n';
    
    return content;
  }

  /**
   * Apply consistent markdown formatting
   * @param {string} content - Content to format
   * @returns {string} Formatted content
   */
  applyConsistentFormatting(content) {
    let formatted = content;
    
    // Normalize line endings
    formatted = formatted.replace(/\r\n/g, '\n');
    
    // Remove excessive blank lines (more than 2)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper spacing around headings
    formatted = formatted.replace(/^(#{1,6}\s+.+)$/gm, '\n$1\n');
    
    // Remove trailing whitespace
    formatted = formatted.replace(/[ \t]+$/gm, '');
    
    // Ensure file ends with single newline
    formatted = formatted.trim() + '\n';
    
    return formatted;
  }

  /**
   * Format property list
   * @param {Array<Object>} properties - Array of property objects
   * @returns {string} Formatted property list
   */
  formatPropertyList(properties) {
    if (!properties || properties.length === 0) {
      return '';
    }
    
    let content = '**Properties**:\n';
    
    for (const prop of properties) {
      const optional = prop.optional ? '?' : '';
      content += `- \`${prop.name}${optional}\`: \`${prop.type}\``;
      
      if (prop.description) {
        content += ` - ${prop.description}`;
      }
      
      content += '\n';
    }
    
    content += '\n';
    return content;
  }

  /**
   * Format parameter list
   * @param {Array<Object>} parameters - Array of parameter objects
   * @returns {string} Formatted parameter list
   */
  formatParameterList(parameters) {
    if (!parameters || parameters.length === 0) {
      return '';
    }
    
    let content = '**Parameters**:\n';
    
    for (const param of parameters) {
      const optional = param.optional ? '?' : '';
      content += `- \`${param.name}${optional}\`: \`${param.type}\``;
      
      if (param.description) {
        content += ` - ${param.description}`;
      }
      
      content += '\n';
    }
    
    content += '\n';
    return content;
  }

  /**
   * Format method list
   * @param {Array<Object>} methods - Array of method objects
   * @returns {string} Formatted method list
   */
  formatMethodList(methods) {
    if (!methods || methods.length === 0) {
      return '';
    }
    
    let content = '**Methods**:\n';
    
    for (const method of methods) {
      const deprecated = method.deprecated ? ' ~~(deprecated)~~' : '';
      content += `- \`${method.name}()\`${deprecated}`;
      
      if (method.description) {
        content += ` - ${method.description}`;
      }
      
      content += '\n';
    }
    
    content += '\n';
    return content;
  }

  /**
   * Format enum member list
   * @param {Array<Object>} members - Array of enum member objects
   * @returns {string} Formatted member list
   */
  formatEnumMemberList(members) {
    if (!members || members.length === 0) {
      return '';
    }
    
    let content = '**Members**:\n';
    
    for (const member of members) {
      content += `- \`${member.name}\``;
      
      if (member.value && member.value !== member.name) {
        content += ` = \`${member.value}\``;
      }
      
      if (member.description) {
        content += ` - ${member.description}`;
      }
      
      content += '\n';
    }
    
    content += '\n';
    return content;
  }

  /**
   * Get section count
   */
  getSectionCount() {
    return this.sections.length;
  }

  /**
   * Clear all sections
   */
  clear() {
    this.sections = [];
    this.toc = [];
  }
}
