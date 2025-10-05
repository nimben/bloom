/**
 * Comprehensive Bloom Data Service
 * This service integrates all data sources and provides a unified API
 */

import { fetchNDVIData, fetchNDVITrends } from './nasaApi';
import { getPlantInformation, getPhenologyMetrics } from './phenologyApi';
import { getBloomStatus, compareWithHistorical } from './bloomClassification';
import { getRegionalFlowerImages } from './imageApi';
import {
  getCachedNDVIData,
  cacheNDVIData,
  getCachedPhenologyData,
  cachePhenologyData,
  getCachedImageData,
  cacheImageData,
  getCachedLocationData,
  cacheLocationData,
  scheduleLocationRefresh
} from './dataCache';

/**
 * Main service class for bloom data management
 */
class BloomDataService {
  constructor() {
    this.requestQueue = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize data cache system
      const { initializeDataCache } = await import('./dataCache');
      initializeDataCache();
      
      this.isInitialized = true;
      console.log('Bloom Data Service initialized');
    } catch (error) {
      console.error('Error initializing Bloom Data Service:', error);
    }
  }

  /**
   * Get comprehensive bloom data for a location
   */
  async getBloomData(latitude, longitude, options = {}) {
    await this.initialize();
    
    const {
      forceRefresh = false,
      includeImages = true,
      includeTrends = false,
      includeHistorical = false
    } = options;

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedData = getCachedLocationData(latitude, longitude);
      if (cachedData) {
        console.log('Returning cached bloom data for', latitude, longitude);
        return cachedData;
      }
    }

    // Prevent duplicate requests for the same location
    const requestKey = `${latitude}_${longitude}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const requestPromise = this.fetchBloomData(latitude, longitude, {
      includeImages,
      includeTrends,
      includeHistorical
    });

    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache the result
      cacheLocationData(latitude, longitude, result);
      
      // Schedule background refresh
      scheduleLocationRefresh(latitude, longitude);
      
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  /**
   * Fetch fresh bloom data from all sources
   */
  async fetchBloomData(latitude, longitude, options) {
    const { includeImages, includeTrends, includeHistorical } = options;
    
    try {
      // Fetch NDVI data
      const ndviData = await this.getNDVIData(latitude, longitude);
      
      // Get plant information
      const plantInfo = await this.getPlantInformation(latitude, longitude, ndviData.season);
      
      // Get phenology metrics
      const phenologyMetrics = await this.getPhenologyMetrics(
        latitude, 
        longitude, 
        ndviData.ndvi, 
        ndviData.season
      );
      
      // Get bloom classification
      const bloomStatus = getBloomStatus(ndviData, phenologyMetrics, plantInfo);
      
      // Prepare result object
      const result = {
        location: {
          latitude,
          longitude,
          coordinates: [latitude, longitude]
        },
        ndvi: ndviData,
        plantInfo,
        phenology: phenologyMetrics,
        bloomStatus,
        timestamp: new Date().toISOString(),
        dataQuality: this.assessDataQuality(ndviData, plantInfo, phenologyMetrics)
      };

      // Add optional data
      if (includeImages) {
        result.images = await this.getFlowerImages(latitude, longitude, ndviData.season, plantInfo);
      }

      if (includeTrends) {
        result.trends = await this.getNDVITrends(latitude, longitude);
      }

      if (includeHistorical) {
        result.historicalComparison = await this.getHistoricalComparison(latitude, longitude);
      }

      return result;
    } catch (error) {
      console.error('Error fetching bloom data:', error);
      throw new Error(`Failed to fetch bloom data: ${error.message}`);
    }
  }

  /**
   * Get NDVI data with caching
   */
  async getNDVIData(latitude, longitude) {
    // Check cache first
    const cached = getCachedNDVIData(latitude, longitude);
    if (cached) {
      return cached;
    }

    // Fetch fresh data
    const ndviData = await fetchNDVIData(latitude, longitude);
    
    // Cache the result
    cacheNDVIData(latitude, longitude, ndviData);
    
    return ndviData;
  }

  /**
   * Get plant information with caching
   */
  async getPlantInformation(latitude, longitude, season) {
    // Check cache first
    const cached = getCachedPhenologyData(latitude, longitude);
    if (cached && cached.plantInfo) {
      return cached.plantInfo;
    }

    // Get fresh data
    const plantInfo = getPlantInformation(latitude, longitude, season);
    
    // Cache the result
    cachePhenologyData(latitude, longitude, { plantInfo });
    
    return plantInfo;
  }

  /**
   * Get phenology metrics with caching
   */
  async getPhenologyMetrics(latitude, longitude, ndvi, season) {
    // Check cache first
    const cached = getCachedPhenologyData(latitude, longitude);
    if (cached && cached.phenologyMetrics) {
      return cached.phenologyMetrics;
    }

    // Get fresh data
    const phenologyMetrics = getPhenologyMetrics(latitude, longitude, ndvi, season);
    
    // Cache the result
    cachePhenologyData(latitude, longitude, { phenologyMetrics });
    
    return phenologyMetrics;
  }

  /**
   * Get flower images with caching
   */
  async getFlowerImages(latitude, longitude, season, plantInfo) {
    // Check cache first
    const cached = getCachedImageData(latitude, longitude, season);
    if (cached) {
      return cached;
    }

    // Fetch fresh images
    const images = await getRegionalFlowerImages(latitude, longitude, season, plantInfo);
    
    // Cache the result
    cacheImageData(latitude, longitude, season, images);
    
    return images;
  }

  /**
   * Get NDVI trends
   */
  async getNDVITrends(latitude, longitude) {
    try {
      return await fetchNDVITrends(latitude, longitude, 12);
    } catch (error) {
      console.error('Error fetching NDVI trends:', error);
      return [];
    }
  }

  /**
   * Get historical comparison
   */
  async getHistoricalComparison(latitude, longitude) {
    try {
      const trends = await this.getNDVITrends(latitude, longitude);
      const currentData = await this.getNDVIData(latitude, longitude);
      
      return compareWithHistorical(currentData, trends);
    } catch (error) {
      console.error('Error getting historical comparison:', error);
      return null;
    }
  }

  /**
   * Assess overall data quality
   */
  assessDataQuality(ndviData, plantInfo, phenologyMetrics) {
    const qualityFactors = [];

    // NDVI data quality
    if (ndviData.confidence > 0.8) {
      qualityFactors.push('High satellite data confidence');
    } else if (ndviData.confidence > 0.6) {
      qualityFactors.push('Moderate satellite data confidence');
    } else {
      qualityFactors.push('Low satellite data confidence');
    }

    // Data source quality
    if (ndviData.source === 'MODIS') {
      qualityFactors.push('NASA MODIS satellite data');
    } else if (ndviData.source === 'Fallback') {
      qualityFactors.push('Estimated data (satellite unavailable)');
    }

    // Plant information quality
    if (plantInfo && plantInfo.primarySpecies && plantInfo.primarySpecies !== 'Mixed Vegetation') {
      qualityFactors.push('Regional plant species identified');
    } else {
      qualityFactors.push('Generic vegetation classification');
    }

    // Overall quality score
    const qualityScore = this.calculateQualityScore(ndviData, plantInfo, phenologyMetrics);

    return {
      score: qualityScore,
      factors: qualityFactors,
      level: qualityScore >= 80 ? 'Excellent' : 
             qualityScore >= 60 ? 'Good' : 
             qualityScore >= 40 ? 'Fair' : 'Limited'
    };
  }

  /**
   * Calculate data quality score (0-100)
   */
  calculateQualityScore(ndviData, plantInfo, phenologyMetrics) {
    let score = 0;

    // NDVI confidence (40% of score)
    score += ndviData.confidence * 40;

    // Data source (20% of score)
    if (ndviData.source === 'MODIS') score += 20;
    else if (ndviData.source === 'Fallback') score += 10;

    // Plant information quality (20% of score)
    if (plantInfo && plantInfo.primarySpecies && plantInfo.primarySpecies !== 'Mixed Vegetation') {
      score += 20;
    } else if (plantInfo) {
      score += 10;
    }

    // Phenology data completeness (20% of score)
    if (phenologyMetrics && phenologyMetrics.phenologyIndex > 0) {
      score += 20;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Get multiple locations data in batch
   */
  async getBatchBloomData(locations, options = {}) {
    await this.initialize();
    
    const results = await Promise.allSettled(
      locations.map(({ latitude, longitude }) => 
        this.getBloomData(latitude, longitude, options)
      )
    );

    return results.map((result, index) => ({
      location: locations[index],
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  /**
   * Get bloom data for a region (multiple nearby points)
   */
  async getRegionalBloomData(centerLat, centerLon, radius = 0.1, options = {}) {
    const points = this.generateRegionalPoints(centerLat, centerLon, radius);
    return await this.getBatchBloomData(points, options);
  }

  /**
   * Generate points around a center location
   */
  generateRegionalPoints(centerLat, centerLon, radius) {
    const points = [];
    const step = radius / 3; // 3x3 grid
    
    for (let lat = centerLat - radius; lat <= centerLat + radius; lat += step) {
      for (let lon = centerLon - radius; lon <= centerLon + radius; lon += step) {
        points.push({ latitude: lat, longitude: lon });
      }
    }
    
    return points;
  }

  /**
   * Get service statistics
   */
  async getServiceStats() {
    await this.initialize();
    
    const { getCacheStats } = await import('./dataCache');
    const cacheStats = getCacheStats();
    
    return {
      cache: cacheStats,
      activeRequests: this.requestQueue.size,
      isInitialized: this.isInitialized
    };
  }
}

// Create singleton instance
const bloomDataService = new BloomDataService();

// Export service methods
export const getBloomData = (latitude, longitude, options) => 
  bloomDataService.getBloomData(latitude, longitude, options);

export const getBatchBloomData = (locations, options) => 
  bloomDataService.getBatchBloomData(locations, options);

export const getRegionalBloomData = (centerLat, centerLon, radius, options) => 
  bloomDataService.getRegionalBloomData(centerLat, centerLon, radius, options);

export const getServiceStats = () => 
  bloomDataService.getServiceStats();

export const initializeService = () => 
  bloomDataService.initialize();

export default bloomDataService;
