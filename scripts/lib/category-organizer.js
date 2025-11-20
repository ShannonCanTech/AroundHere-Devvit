/**
 * Category Organizer Module
 * Organizes API documentation items into logical categories
 */

/**
 * Documentation categories
 */
export const DocumentationCategory = {
  CORE_CLASSES: 'Core Classes',
  HOOKS: 'Hooks',
  CONTEXT_TYPES: 'Context & API Clients',
  EVENT_TYPES: 'Event System',
  FORM_TYPES: 'Forms & UI',
  REDIS_TYPES: 'Redis Client',
  SCHEDULER_TYPES: 'Scheduler & Jobs',
  REDDIT_API: 'Reddit API Client',
  UTILITY_TYPES: 'Utility Types',
  ENUMERATIONS: 'Enumerations'
};

/**
 * Category mapping rules
 */
const CATEGORY_RULES = {
  [DocumentationCategory.CORE_CLASSES]: {
    patterns: ['Devvit', 'RichTextBuilder'],
    exact: ['Devvit', 'RichTextBuilder']
  },
  
  [DocumentationCategory.HOOKS]: {
    patterns: ['use'],
    exact: ['useState', 'useAsync', 'useInterval', 'useChannel', 'useForm', 'useWebView']
  },
  
  [DocumentationCategory.CONTEXT_TYPES]: {
    patterns: ['Context', 'APIClients', 'Plugin'],
    exact: ['BaseContext', 'Context', 'ContextAPIClients', 'TriggerContext', 'JobContext', 
            'SettingsClient', 'MediaPlugin', 'AssetsPlugin']
  },
  
  [DocumentationCategory.EVENT_TYPES]: {
    patterns: ['Event', 'Trigger', 'ModAction', 'AppInstall', 'AppUpgrade'],
    exact: ['TriggerEvent', 'TriggerEventType', 'EventTypes', 'CommentCreate', 'CommentDelete',
            'CommentReport', 'CommentSubmit', 'CommentUpdate', 'PostCreate', 'PostDelete',
            'PostReport', 'PostSubmit', 'PostUpdate', 'ModAction', 'ModMail', 'AppInstall', 'AppUpgrade']
  },
  
  [DocumentationCategory.FORM_TYPES]: {
    patterns: ['Form', 'Field', 'Toast', 'UIClient', 'BlockElement'],
    exact: ['Form', 'FormDefinition', 'FormField', 'StringField', 'NumberField', 'BooleanField',
            'SelectField', 'ParagraphField', 'GroupField', 'FormOnSubmitEvent', 'FormOnSubmitEventHandler',
            'UIClient', 'Toast', 'BlockElement']
  },
  
  [DocumentationCategory.REDIS_TYPES]: {
    patterns: ['Redis', 'ZMember', 'ZRange', 'SetOptions', 'TxClient'],
    exact: ['RedisClient', 'ZMember', 'ZRangeOptions', 'SetOptions', 'TxClientLike']
  },
  
  [DocumentationCategory.SCHEDULER_TYPES]: {
    patterns: ['Scheduled', 'Job', 'Cron', 'Scheduler'],
    exact: ['ScheduledJob', 'ScheduledCronJob', 'RunJob', 'CancelJob', 'Scheduler',
            'JobHandler', 'CronJobHandler']
  },
  
  [DocumentationCategory.REDDIT_API]: {
    patterns: ['Reddit', 'User', 'Post', 'Comment', 'Subreddit', 'Widget', 'WikiPage', 'Listing'],
    exact: ['RedditAPIClient', 'User', 'Post', 'Comment', 'Subreddit', 'Widget', 'WikiPage',
            'Listing', 'ModLogOptions', 'SubmitPostOptions', 'CommentSubmissionOptions']
  },
  
  [DocumentationCategory.ENUMERATIONS]: {
    patterns: ['Reason', 'Source', 'Scope'],
    exact: ['DeletionReason', 'EventSource', 'SettingScope']
  }
};

/**
 * Special case handlers for complex categorization
 */
const SPECIAL_CASES = {
  /**
   * Handle EventTypes namespace items
   */
  isEventTypesNamespace: (name, path) => {
    return path && path.includes('EventTypes/');
  },
  
  /**
   * Handle RedditAPIClient methods
   */
  isRedditAPIMethod: (name, path) => {
    return path && path.includes('RedditAPIClient/');
  },
  
  /**
   * Handle utility types (JSON, Data, Metadata, etc.)
   */
  isUtilityType: (name) => {
    const utilityPatterns = ['JSON', 'Data', 'Metadata', 'AsyncError', 'IconName'];
    return utilityPatterns.some(pattern => name.includes(pattern));
  }
};

/**
 * Categorize a documentation item
 * @param {Object} item - Documentation item with name and optional path
 * @param {string} item.name - Item name
 * @param {string} item.type - Item type (typeAlias, function, class, enum, interface)
 * @param {string} [item.path] - Optional file path for context
 * @returns {string} Category name
 */
export function categorizeItem(item) {
  const { name, type, path } = item;
  
  // Handle special cases first
  if (SPECIAL_CASES.isEventTypesNamespace(name, path)) {
    return DocumentationCategory.EVENT_TYPES;
  }
  
  if (SPECIAL_CASES.isRedditAPIMethod(name, path)) {
    return DocumentationCategory.REDDIT_API;
  }
  
  if (SPECIAL_CASES.isUtilityType(name)) {
    return DocumentationCategory.UTILITY_TYPES;
  }
  
  // Handle enumerations by type
  if (type === 'enum') {
    return DocumentationCategory.ENUMERATIONS;
  }
  
  // Check category rules
  for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
    // Check exact matches first
    if (rules.exact && rules.exact.includes(name)) {
      return category;
    }
    
    // Check pattern matches
    if (rules.patterns) {
      for (const pattern of rules.patterns) {
        if (name.includes(pattern)) {
          return category;
        }
      }
    }
  }
  
  // Default to utility types
  return DocumentationCategory.UTILITY_TYPES;
}

/**
 * Categorize multiple items
 * @param {Array<Object>} items - Array of documentation items
 * @returns {Map<string, Array<Object>>} Map of category to items
 */
export function categorizeItems(items) {
  const categorized = new Map();
  
  // Initialize all categories
  for (const category of Object.values(DocumentationCategory)) {
    categorized.set(category, []);
  }
  
  // Categorize each item
  for (const item of items) {
    const category = categorizeItem(item);
    categorized.get(category).push(item);
  }
  
  return categorized;
}

/**
 * Sort items alphabetically within a category
 * @param {Array<Object>} items - Array of items with name property
 * @returns {Array<Object>} Sorted items
 */
export function sortItemsAlphabetically(items) {
  return items.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Sort all categories and their items
 * @param {Map<string, Array<Object>>} categorizedItems - Map of category to items
 * @returns {Map<string, Array<Object>>} Map with sorted items
 */
export function sortCategories(categorizedItems) {
  const sorted = new Map();
  
  for (const [category, items] of categorizedItems) {
    sorted.set(category, sortItemsAlphabetically(items));
  }
  
  return sorted;
}

/**
 * Get category order for documentation
 * @returns {Array<string>} Ordered category names
 */
export function getCategoryOrder() {
  return [
    DocumentationCategory.CORE_CLASSES,
    DocumentationCategory.HOOKS,
    DocumentationCategory.CONTEXT_TYPES,
    DocumentationCategory.EVENT_TYPES,
    DocumentationCategory.FORM_TYPES,
    DocumentationCategory.REDIS_TYPES,
    DocumentationCategory.SCHEDULER_TYPES,
    DocumentationCategory.REDDIT_API,
    DocumentationCategory.UTILITY_TYPES,
    DocumentationCategory.ENUMERATIONS
  ];
}

/**
 * Filter empty categories
 * @param {Map<string, Array<Object>>} categorizedItems - Map of category to items
 * @returns {Map<string, Array<Object>>} Map without empty categories
 */
export function filterEmptyCategories(categorizedItems) {
  const filtered = new Map();
  
  for (const [category, items] of categorizedItems) {
    if (items.length > 0) {
      filtered.set(category, items);
    }
  }
  
  return filtered;
}

/**
 * Get category description
 * @param {string} category - Category name
 * @returns {string} Category description
 */
export function getCategoryDescription(category) {
  const descriptions = {
    [DocumentationCategory.CORE_CLASSES]: 'Main classes that provide core Devvit functionality',
    [DocumentationCategory.HOOKS]: 'React-style hooks for state management and side effects',
    [DocumentationCategory.CONTEXT_TYPES]: 'Context objects and API clients available in handlers',
    [DocumentationCategory.EVENT_TYPES]: 'Event types and trigger definitions for Reddit events',
    [DocumentationCategory.FORM_TYPES]: 'Form definitions, field types, and UI components',
    [DocumentationCategory.REDIS_TYPES]: 'Redis client types and data structures',
    [DocumentationCategory.SCHEDULER_TYPES]: 'Scheduled jobs and cron task definitions',
    [DocumentationCategory.REDDIT_API]: 'Reddit API client methods and model types',
    [DocumentationCategory.UTILITY_TYPES]: 'Common utility types and helper definitions',
    [DocumentationCategory.ENUMERATIONS]: 'Enumeration types with named constants'
  };
  
  return descriptions[category] || '';
}

/**
 * Build category index with statistics
 * @param {Map<string, Array<Object>>} categorizedItems - Map of category to items
 * @returns {Object} Category index with statistics
 */
export function buildCategoryIndex(categorizedItems) {
  const index = {
    categories: {},
    totalItems: 0,
    totalCategories: 0,
    emptyCategoriesCount: 0
  };
  
  for (const [category, items] of categorizedItems) {
    const itemCount = items.length;
    
    index.categories[category] = {
      name: category,
      description: getCategoryDescription(category),
      itemCount,
      items: items.map(item => ({
        name: item.name,
        type: item.type,
        path: item.path
      }))
    };
    
    index.totalItems += itemCount;
    
    if (itemCount > 0) {
      index.totalCategories++;
    } else {
      index.emptyCategoriesCount++;
    }
  }
  
  return index;
}

/**
 * Generate category statistics
 * @param {Map<string, Array<Object>>} categorizedItems - Map of category to items
 * @returns {Object} Statistics object
 */
export function generateCategoryStatistics(categorizedItems) {
  const stats = {
    totalItems: 0,
    categoriesWithItems: 0,
    emptyCategories: 0,
    categoryBreakdown: {},
    largestCategory: { name: '', count: 0 },
    smallestCategory: { name: '', count: Infinity }
  };
  
  for (const [category, items] of categorizedItems) {
    const count = items.length;
    
    stats.totalItems += count;
    stats.categoryBreakdown[category] = count;
    
    if (count > 0) {
      stats.categoriesWithItems++;
      
      if (count > stats.largestCategory.count) {
        stats.largestCategory = { name: category, count };
      }
      
      if (count < stats.smallestCategory.count) {
        stats.smallestCategory = { name: category, count };
      }
    } else {
      stats.emptyCategories++;
    }
  }
  
  // Reset smallest if no categories with items
  if (stats.smallestCategory.count === Infinity) {
    stats.smallestCategory = { name: '', count: 0 };
  }
  
  return stats;
}

/**
 * Validate that all items are categorized
 * @param {Array<Object>} originalItems - Original items array
 * @param {Map<string, Array<Object>>} categorizedItems - Categorized items map
 * @returns {Object} Validation result
 */
export function validateCategorization(originalItems, categorizedItems) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
    uncategorizedItems: [],
    duplicateItems: []
  };
  
  // Count total categorized items
  let totalCategorized = 0;
  const seenItems = new Set();
  
  for (const [category, items] of categorizedItems) {
    for (const item of items) {
      const itemKey = `${item.name}:${item.type}`;
      
      if (seenItems.has(itemKey)) {
        result.duplicateItems.push({
          name: item.name,
          type: item.type,
          category
        });
        result.errors.push(`Duplicate item found: ${item.name} (${item.type}) in ${category}`);
        result.valid = false;
      }
      
      seenItems.add(itemKey);
      totalCategorized++;
    }
  }
  
  // Check if all original items are categorized
  if (totalCategorized !== originalItems.length) {
    result.errors.push(
      `Item count mismatch: ${originalItems.length} original items, ${totalCategorized} categorized`
    );
    result.valid = false;
    
    // Find uncategorized items
    for (const item of originalItems) {
      const itemKey = `${item.name}:${item.type}`;
      if (!seenItems.has(itemKey)) {
        result.uncategorizedItems.push({
          name: item.name,
          type: item.type
        });
      }
    }
  }
  
  // Check for empty categories
  let emptyCount = 0;
  for (const [category, items] of categorizedItems) {
    if (items.length === 0) {
      emptyCount++;
    }
  }
  
  if (emptyCount > 0) {
    result.warnings.push(`${emptyCount} empty categories found`);
  }
  
  return result;
}

/**
 * Generate category summary for documentation
 * @param {Map<string, Array<Object>>} categorizedItems - Map of category to items
 * @returns {string} Formatted summary
 */
export function generateCategorySummary(categorizedItems) {
  const stats = generateCategoryStatistics(categorizedItems);
  const order = getCategoryOrder();
  
  let summary = '## Documentation Overview\n\n';
  summary += `**Total Items**: ${stats.totalItems}  \n`;
  summary += `**Categories**: ${stats.categoriesWithItems}  \n\n`;
  
  summary += '### Category Breakdown\n\n';
  summary += '| Category | Items |\n';
  summary += '|----------|-------|\n';
  
  for (const category of order) {
    const count = stats.categoryBreakdown[category] || 0;
    if (count > 0) {
      summary += `| ${category} | ${count} |\n`;
    }
  }
  
  summary += '\n';
  
  return summary;
}

/**
 * Get items by category
 * @param {Map<string, Array<Object>>} categorizedItems - Map of category to items
 * @param {string} category - Category name
 * @returns {Array<Object>} Items in category
 */
export function getItemsByCategory(categorizedItems, category) {
  return categorizedItems.get(category) || [];
}

/**
 * Find item by name across all categories
 * @param {Map<string, Array<Object>>} categorizedItems - Map of category to items
 * @param {string} name - Item name to find
 * @returns {Object|null} Found item with category, or null
 */
export function findItemByName(categorizedItems, name) {
  for (const [category, items] of categorizedItems) {
    const item = items.find(i => i.name === name);
    if (item) {
      return { ...item, category };
    }
  }
  return null;
}

/**
 * Export category organizer for use in other modules
 */
export class CategoryOrganizer {
  constructor() {
    this.categorizedItems = new Map();
    this.originalItems = [];
  }
  
  /**
   * Organize items into categories
   * @param {Array<Object>} items - Items to organize
   */
  organize(items) {
    this.originalItems = items;
    this.categorizedItems = categorizeItems(items);
    this.categorizedItems = sortCategories(this.categorizedItems);
  }
  
  /**
   * Get categorized items
   * @returns {Map<string, Array<Object>>} Categorized items
   */
  getCategorizedItems() {
    return this.categorizedItems;
  }
  
  /**
   * Get category index
   * @returns {Object} Category index with statistics
   */
  getIndex() {
    return buildCategoryIndex(this.categorizedItems);
  }
  
  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return generateCategoryStatistics(this.categorizedItems);
  }
  
  /**
   * Validate categorization
   * @returns {Object} Validation result
   */
  validate() {
    return validateCategorization(this.originalItems, this.categorizedItems);
  }
  
  /**
   * Generate summary
   * @returns {string} Formatted summary
   */
  generateSummary() {
    return generateCategorySummary(this.categorizedItems);
  }
  
  /**
   * Get items by category
   * @param {string} category - Category name
   * @returns {Array<Object>} Items in category
   */
  getItemsByCategory(category) {
    return getItemsByCategory(this.categorizedItems, category);
  }
  
  /**
   * Find item by name
   * @param {string} name - Item name
   * @returns {Object|null} Found item with category
   */
  findItem(name) {
    return findItemByName(this.categorizedItems, name);
  }
}
