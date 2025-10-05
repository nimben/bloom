/**
 * Data Caching Service
 * This service manages data caching and automatic refresh for bloom data
 */

const CACHE_DURATION = {
  NDVI: 7 * 24 * 60 * 60 * 1000, // 7 days
  PHENOLOGY: 14 * 24 * 60 * 60 * 1000, // 14 days
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  LOCATIONS: 90 * 24 * 60 * 60 * 1000 // 90 days
};

/**
 * Local storage cache manager
 */
class DataCache {
  constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  /**
   * Load cache from localStorage on initialization
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('blossom-watch-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
      this.cache = new Map();
    }
  }

  /**
   * Save cache to localStorage
   */
  saveToStorage() {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      localStorage.setItem('blossom-watch-cache', JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }

  /**
   * Generate cache key for location and data type
   */
  generateKey(latitude, longitude, dataType) {
    const roundedLat = Math.round(latitude * 1000) / 1000;
    const roundedLon = Math.round(longitude * 1000) / 1000;
    return `${dataType}_${roundedLat}_${roundedLon}`;
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(key, dataType) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const duration = CACHE_DURATION[dataType] || CACHE_DURATION.NDVI;
    return (Date.now() - cached.timestamp) < duration;
  }

  /**
   * Get cached data if valid
   */
  get(key, dataType) {
    if (this.isCacheValid(key, dataType)) {
      const cached = this.cache.get(key);
      cached.hits = (cached.hits || 0) + 1;
      cached.lastAccessed = Date.now();
      this.saveToStorage();
      return cached.data;
    }
    
    // Remove expired cache
    this.cache.delete(key);
    this.saveToStorage();
    return null;
  }

  /**
   * Set cache data
   */
  set(key, data, dataType) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      dataType,
      hits: 0,
      lastAccessed: Date.now()
    });
    
    this.saveToStorage();
  }

  /**
   * Clear expired cache entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      const duration = CACHE_DURATION[value.dataType] || CACHE_DURATION.NDVI;
      if ((now - value.timestamp) > duration) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.saveToStorage();
      console.log(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      totalEntries: this.cache.size,
      byType: {},
      oldestEntry: null,
      newestEntry: null
    };

    let oldestTime = Date.now();
    let newestTime = 0;

    for (const [key, value] of this.cache.entries()) {
      // Count by type
      const type = value.dataType || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Find oldest and newest
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        stats.oldestEntry = {
          key,
          timestamp: value.timestamp,
          age: Date.now() - value.timestamp
        };
      }

      if (value.timestamp > newestTime) {
        newestTime = value.timestamp;
        stats.newestEntry = {
          key,
          timestamp: value.timestamp,
          age: Date.now() - value.timestamp
        };
      }
    }

    return stats;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    localStorage.removeItem('blossom-watch-cache');
  }
}

// Global cache instance
const dataCache = new DataCache();

/**
 * Cache NDVI data
 */
export function cacheNDVIData(latitude, longitude, ndviData) {
  const key = dataCache.generateKey(latitude, longitude, 'NDVI');
  dataCache.set(key, ndviData, 'NDVI');
}

/**
 * Get cached NDVI data
 */
export function getCachedNDVIData(latitude, longitude) {
  const key = dataCache.generateKey(latitude, longitude, 'NDVI');
  return dataCache.get(key, 'NDVI');
}

/**
 * Cache phenology data
 */
export function cachePhenologyData(latitude, longitude, phenologyData) {
  const key = dataCache.generateKey(latitude, longitude, 'PHENOLOGY');
  dataCache.set(key, phenologyData, 'PHENOLOGY');
}

/**
 * Get cached phenology data
 */
export function getCachedPhenologyData(latitude, longitude) {
  const key = dataCache.generateKey(latitude, longitude, 'PHENOLOGY');
  return dataCache.get(key, 'PHENOLOGY');
}

/**
 * Cache image data
 */
export function cacheImageData(latitude, longitude, season, imageData) {
  const key = dataCache.generateKey(latitude, longitude, 'IMAGES') + `_${season}`;
  dataCache.set(key, imageData, 'IMAGES');
}

/**
 * Get cached image data
 */
export function getCachedImageData(latitude, longitude, season) {
  const key = dataCache.generateKey(latitude, longitude, 'IMAGES') + `_${season}`;
  return dataCache.get(key, 'IMAGES');
}

/**
 * Cache location bloom status
 */
export function cacheLocationData(latitude, longitude, bloomStatus) {
  const key = dataCache.generateKey(latitude, longitude, 'LOCATIONS');
  dataCache.set(key, bloomStatus, 'LOCATIONS');
}

/**
 * Get cached location data
 */
export function getCachedLocationData(latitude, longitude) {
  const key = dataCache.generateKey(latitude, longitude, 'LOCATIONS');
  return dataCache.get(key, 'LOCATIONS');
}

/**
 * Scheduled cache cleanup
 */
export function scheduleCacheCleanup() {
  // Clean up cache every hour
  setInterval(() => {
    dataCache.cleanup();
  }, 60 * 60 * 1000);
  
  // Initial cleanup
  dataCache.cleanup();
}

/**
 * Background refresh service
 */
class BackgroundRefreshService {
  constructor() {
    this.refreshQueue = new Set();
    this.isRefreshing = false;
    this.refreshInterval = null;
  }

  /**
   * Add location to refresh queue
   */
  addToRefreshQueue(latitude, longitude) {
    const key = `${latitude}_${longitude}`;
    this.refreshQueue.add(key);
  }

  /**
   * Start background refresh process
   */
  startBackgroundRefresh() {
    if (this.refreshInterval) return;

    // Refresh every 6 hours
    this.refreshInterval = setInterval(async () => {
      await this.processRefreshQueue();
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Stop background refresh
   */
  stopBackgroundRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Process refresh queue
   */
  async processRefreshQueue() {
    if (this.isRefreshing || this.refreshQueue.size === 0) return;

    this.isRefreshing = true;
    console.log(`Refreshing data for ${this.refreshQueue.size} locations...`);

    try {
      const refreshPromises = Array.from(this.refreshQueue).map(async (locationKey) => {
        const [lat, lon] = locationKey.split('_').map(Number);
        
        try {
          // Import services dynamically to avoid circular dependencies
          const { fetchNDVIData } = await import('./nasaApi');
          const { getPlantInformation, getPhenologyMetrics } = await import('./phenologyApi');
          
          // Refresh NDVI data
          const ndviData = await fetchNDVIData(lat, lon);
          cacheNDVIData(lat, lon, ndviData);
          
          // Refresh plant information
          const plantInfo = getPlantInformation(lat, lon, ndviData.season);
          cachePhenologyData(lat, lon, plantInfo);
          
          console.log(`Refreshed data for ${lat}, ${lon}`);
        } catch (error) {
          console.error(`Error refreshing data for ${lat}, ${lon}:`, error);
        }
      });

      await Promise.allSettled(refreshPromises);
      
      // Clear refresh queue after successful refresh
      this.refreshQueue.clear();
      
    } catch (error) {
      console.error('Error processing refresh queue:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Force refresh for specific location
   */
  async forceRefresh(latitude, longitude) {
    try {
      const { fetchNDVIData } = await import('./nasaApi');
      const { getPlantInformation, getPhenologyMetrics } = await import('./phenologyApi');
      
      const ndviData = await fetchNDVIData(latitude, longitude);
      const plantInfo = getPlantInformation(latitude, longitude, ndviData.season);
      const phenologyMetrics = getPhenologyMetrics(latitude, longitude, ndviData.ndvi, ndviData.season);
      
      cacheNDVIData(latitude, longitude, ndviData);
      cachePhenologyData(latitude, longitude, { plantInfo, phenologyMetrics });
      
      return { ndviData, plantInfo, phenologyMetrics };
    } catch (error) {
      console.error('Error force refreshing data:', error);
      throw error;
    }
  }
}

// Global background refresh service
const backgroundRefresh = new BackgroundRefreshService();

/**
 * Initialize data caching system
 */
export function initializeDataCache() {
  scheduleCacheCleanup();
  backgroundRefresh.startBackgroundRefresh();
  
  console.log('Data caching system initialized');
  console.log('Cache stats:', dataCache.getStats());
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return dataCache.getStats();
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  dataCache.clear();
  console.log('All cache cleared');
}

/**
 * Add location for background refresh
 */
export function scheduleLocationRefresh(latitude, longitude) {
  backgroundRefresh.addToRefreshQueue(latitude, longitude);
}

/**
 * Force refresh location data
 */
export function forceRefreshLocation(latitude, longitude) {
  return backgroundRefresh.forceRefresh(latitude, longitude);
}

export default {
  cacheNDVIData,
  getCachedNDVIData,
  cachePhenologyData,
  getCachedPhenologyData,
  cacheImageData,
  getCachedImageData,
  cacheLocationData,
  getCachedLocationData,
  initializeDataCache,
  getCacheStats,
  clearAllCache,
  scheduleLocationRefresh,
  forceRefreshLocation
};
