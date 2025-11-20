/**
 * GitHub API Client
 * Handles fetching files and directories from GitHub with error handling and rate limiting
 */

import https from 'https';

export class GitHubFetcher {
  constructor(repo, branch = 'main') {
    this.repo = repo;
    this.branch = branch;
    this.cache = new Map();
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.minRequestInterval = 100; // ms between requests
  }

  /**
   * Fetch a single file from GitHub
   * @param {string} path - Path to file in repository
   * @returns {Promise<string>} File content
   */
  async fetchFile(path) {
    const cacheKey = `file:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    await this._rateLimit();

    const url = `https://raw.githubusercontent.com/${this.repo}/${this.branch}/${path}`;
    const content = await this._httpsGet(url);
    
    this.cache.set(cacheKey, content);
    this.requestCount++;
    
    return content;
  }

  /**
   * Fetch directory listing from GitHub API
   * @param {string} path - Path to directory in repository
   * @returns {Promise<Array<FileInfo>>} Array of file information objects
   */
  async fetchDirectory(path) {
    const cacheKey = `dir:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    await this._rateLimit();

    const url = `https://api.github.com/repos/${this.repo}/contents/${path}?ref=${this.branch}`;
    const response = await this._httpsGet(url);
    const files = JSON.parse(response);
    
    this.cache.set(cacheKey, files);
    this.requestCount++;
    
    return files;
  }

  /**
   * Fetch multiple files in parallel with concurrency limit
   * @param {Array<string>} paths - Array of file paths
   * @param {number} concurrency - Max concurrent requests (default: 10)
   * @returns {Promise<Map<string, string>>} Map of path to content
   */
  async fetchMultipleFiles(paths, concurrency = 10) {
    const results = new Map();
    const queue = [...paths];
    
    const worker = async () => {
      while (queue.length > 0) {
        const path = queue.shift();
        try {
          const content = await this.fetchFile(path);
          results.set(path, content);
        } catch (error) {
          console.error(`Failed to fetch ${path}:`, error.message);
          results.set(path, null);
        }
      }
    };

    const workers = Array(Math.min(concurrency, paths.length))
      .fill(null)
      .map(() => worker());
    
    await Promise.all(workers);
    
    return results;
  }

  /**
   * Rate limiting to avoid hitting GitHub API limits
   */
  async _rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Make HTTPS GET request with retry logic
   * @param {string} url - URL to fetch
   * @param {number} retries - Number of retries (default: 3)
   * @returns {Promise<string>} Response body
   */
  _httpsGet(url, retries = 3) {
    return new Promise((resolve, reject) => {
      const attempt = (retriesLeft) => {
        https.get(url, {
          headers: {
            'User-Agent': 'Devvit-Docs-Generator'
          }
        }, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(data);
            } else if (res.statusCode === 403 && retriesLeft > 0) {
              // Rate limited, wait and retry with exponential backoff
              const delay = Math.pow(2, 4 - retriesLeft) * 1000;
              console.log(`Rate limited, retrying in ${delay}ms...`);
              setTimeout(() => attempt(retriesLeft - 1), delay);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${url}`));
            }
          });
        }).on('error', (error) => {
          if (retriesLeft > 0) {
            const delay = Math.pow(2, 4 - retriesLeft) * 1000;
            setTimeout(() => attempt(retriesLeft - 1), delay);
          } else {
            reject(error);
          }
        });
      };
      
      attempt(retries);
    });
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      requestCount: this.requestCount
    };
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
    this.requestCount = 0;
  }
}
