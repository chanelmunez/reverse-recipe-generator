interface IngredientHealthInfo {
  healthBenefits: string
  nutritionalHighlights: string[]
  healthRating: "excellent" | "good" | "moderate" | "limited"
}

interface CachedIngredientData {
  data: IngredientHealthInfo
  timestamp: number
  accessCount: number
  lastAccessed: number
}

interface PendingRequest {
  promise: Promise<IngredientHealthInfo>
  resolve: (data: IngredientHealthInfo) => void
  reject: (error: Error) => void
}

class IngredientHealthCache {
  private static readonly CACHE_KEY = "ingredient-health-cache"
  private static readonly MAX_CACHE_SIZE = 4 * 1024 * 1024 // 4MB limit for ingredient cache
  private static readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days
  private static readonly MAX_ENTRIES = 1000 // Maximum number of cached ingredients
  
  // Track pending requests to prevent duplicates
  private static pendingRequests = new Map<string, PendingRequest>()

  /**
   * Get cached ingredient health data or fetch from API
   */
  static async getIngredientHealth(ingredient: string): Promise<IngredientHealthInfo> {
    const normalizedIngredient = ingredient.toLowerCase().trim()
    
    // Check if there's already a pending request for this ingredient
    const pendingRequest = this.pendingRequests.get(normalizedIngredient)
    if (pendingRequest) {
      return pendingRequest.promise
    }

    // Check cache first
    const cachedData = this.getCachedData(normalizedIngredient)
    if (cachedData) {
      // Update access statistics
      this.updateAccessStats(normalizedIngredient)
      return cachedData.data
    }

    // Create new request with deduplication
    const { promise, resolve, reject } = this.createDeferredPromise<IngredientHealthInfo>()
    this.pendingRequests.set(normalizedIngredient, { promise, resolve, reject })

    try {
      const data = await this.fetchFromAPI(normalizedIngredient)
      
      // Cache the result
      this.cacheData(normalizedIngredient, data)
      
      // Resolve all waiting promises
      resolve(data)
      
      return data
    } catch (error) {
      // Reject all waiting promises
      reject(error as Error)
      throw error
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(normalizedIngredient)
    }
  }

  /**
   * Create a deferred promise for request deduplication
   */
  private static createDeferredPromise<T>(): {
    promise: Promise<T>
    resolve: (value: T) => void
    reject: (error: Error) => void
  } {
    let resolve!: (value: T) => void
    let reject!: (error: Error) => void
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    
    return { promise, resolve, reject }
  }

  /**
   * Fetch ingredient health data from API
   */
  private static async fetchFromAPI(ingredient: string): Promise<IngredientHealthInfo> {
    const response = await fetch("/api/ingredient-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredient })
    })

    if (!response.ok) {
      throw new Error("Failed to fetch ingredient health information")
    }

    return response.json()
  }

  /**
   * Get cached data for an ingredient
   */
  private static getCachedData(ingredient: string): CachedIngredientData | null {
    try {
      const cache = this.getCache()
      const cachedItem = cache[ingredient]
      
      if (!cachedItem) {
        return null
      }

      // Check if cache entry has expired
      const now = Date.now()
      if (now - cachedItem.timestamp > this.CACHE_EXPIRY) {
        // Remove expired entry
        delete cache[ingredient]
        this.saveCache(cache)
        return null
      }

      return cachedItem
    } catch (error) {
      console.warn("Error reading ingredient health cache:", error)
      return null
    }
  }

  /**
   * Cache ingredient health data
   */
  private static cacheData(ingredient: string, data: IngredientHealthInfo): void {
    try {
      const cache = this.getCache()
      const now = Date.now()
      
      // Add new entry
      cache[ingredient] = {
        data,
        timestamp: now,
        accessCount: 1,
        lastAccessed: now
      }

      // Manage cache size
      this.manageCacheSize(cache)
      
      // Save to localStorage
      this.saveCache(cache)
    } catch (error) {
      console.warn("Error caching ingredient health data:", error)
    }
  }

  /**
   * Update access statistics for cached item
   */
  private static updateAccessStats(ingredient: string): void {
    try {
      const cache = this.getCache()
      const cachedItem = cache[ingredient]
      
      if (cachedItem) {
        cachedItem.accessCount++
        cachedItem.lastAccessed = Date.now()
        this.saveCache(cache)
      }
    } catch (error) {
      console.warn("Error updating access stats:", error)
    }
  }

  /**
   * Manage cache size by removing old/unused entries
   */
  private static manageCacheSize(cache: Record<string, CachedIngredientData>): void {
    const entries = Object.entries(cache)
    
    // If we're over the entry limit, remove least recently used items
    if (entries.length > this.MAX_ENTRIES) {
      // Sort by last accessed time (oldest first)
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      
      // Remove oldest entries
      const entriesToRemove = entries.length - this.MAX_ENTRIES
      for (let i = 0; i < entriesToRemove; i++) {
        delete cache[entries[i][0]]
      }
    }

    // Check cache size and remove items if needed
    const cacheSize = this.calculateCacheSize(cache)
    if (cacheSize > this.MAX_CACHE_SIZE) {
      this.evictLeastUsedItems(cache)
    }
  }

  /**
   * Calculate approximate cache size in bytes
   */
  private static calculateCacheSize(cache: Record<string, CachedIngredientData>): number {
    try {
      return JSON.stringify(cache).length * 2 // Rough estimate (UTF-16)
    } catch {
      return 0
    }
  }

  /**
   * Evict least used items to free up space
   */
  private static evictLeastUsedItems(cache: Record<string, CachedIngredientData>): void {
    const entries = Object.entries(cache)
    
    // Sort by access count and last accessed time (least used first)
    entries.sort((a, b) => {
      if (a[1].accessCount !== b[1].accessCount) {
        return a[1].accessCount - b[1].accessCount
      }
      return a[1].lastAccessed - b[1].lastAccessed
    })

    // Remove items until we're under the size limit
    let currentSize = this.calculateCacheSize(cache)
    let i = 0
    
    while (currentSize > this.MAX_CACHE_SIZE && i < entries.length) {
      delete cache[entries[i][0]]
      currentSize = this.calculateCacheSize(cache)
      i++
    }
  }

  /**
   * Get cache from localStorage
   */
  private static getCache(): Record<string, CachedIngredientData> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      return cached ? JSON.parse(cached) : {}
    } catch (error) {
      console.warn("Error reading ingredient health cache:", error)
      return {}
    }
  }

  /**
   * Save cache to localStorage
   */
  private static saveCache(cache: Record<string, CachedIngredientData>): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.warn("Error saving ingredient health cache:", error)
      // If localStorage is full, try to clear some space
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldestEntries(cache)
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
        } catch {
          // If still failing, clear the entire cache
          localStorage.removeItem(this.CACHE_KEY)
        }
      }
    }
  }

  /**
   * Clear oldest entries when localStorage is full
   */
  private static clearOldestEntries(cache: Record<string, CachedIngredientData>): void {
    const entries = Object.entries(cache)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest 25% of entries
    const entriesToRemove = Math.ceil(entries.length * 0.25)
    for (let i = 0; i < entriesToRemove; i++) {
      delete cache[entries[i][0]]
    }
  }

  /**
   * Clear all cached ingredient health data
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY)
    } catch (error) {
      console.warn("Error clearing ingredient health cache:", error)
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalEntries: number
    cacheSize: number
    oldestEntry: number | null
    newestEntry: number | null
  } {
    try {
      const cache = this.getCache()
      const entries = Object.values(cache)
      
      if (entries.length === 0) {
        return {
          totalEntries: 0,
          cacheSize: 0,
          oldestEntry: null,
          newestEntry: null
        }
      }

      const timestamps = entries.map(entry => entry.timestamp)
      
      return {
        totalEntries: entries.length,
        cacheSize: this.calculateCacheSize(cache),
        oldestEntry: Math.min(...timestamps),
        newestEntry: Math.max(...timestamps)
      }
    } catch (error) {
      console.warn("Error getting cache stats:", error)
      return {
        totalEntries: 0,
        cacheSize: 0,
        oldestEntry: null,
        newestEntry: null
      }
    }
  }
}

export { IngredientHealthCache }
export type { IngredientHealthInfo }
