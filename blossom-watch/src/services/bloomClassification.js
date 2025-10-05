/**
 * Bloom Classification Service
 * This service classifies bloom intensity based on NDVI values and regional data
 */

/**
 * Bloom intensity classification based on NDVI values
 */
export function classifyBloomIntensity(ndvi, season, latitude) {
  // Adjust thresholds based on season and location
  const baseThresholds = {
    dormant: 0.3,
    low: 0.5,
    active: 0.7,
    peak: 0.8
  };
  
  // Seasonal adjustments
  const seasonalAdjustments = {
    'Spring': { dormant: -0.1, low: -0.05, active: 0, peak: 0.05 },
    'Summer': { dormant: 0, low: 0, active: 0.05, peak: 0.1 },
    'Autumn': { dormant: 0, low: 0, active: 0, peak: 0 },
    'Winter': { dormant: 0.1, low: 0.05, active: -0.05, peak: -0.1 }
  };
  
  // Latitude adjustments (tropical vs temperate)
  const latitudeAdjustment = Math.abs(latitude) < 23.5 ? 0.1 : 0;
  
  const adjustments = seasonalAdjustments[season] || { dormant: 0, low: 0, active: 0, peak: 0 };
  
  const thresholds = {
    dormant: Math.max(0.1, baseThresholds.dormant + adjustments.dormant + latitudeAdjustment),
    low: Math.max(0.2, baseThresholds.low + adjustments.low + latitudeAdjustment),
    active: Math.max(0.3, baseThresholds.active + adjustments.active + latitudeAdjustment),
    peak: Math.max(0.4, baseThresholds.peak + adjustments.peak + latitudeAdjustment)
  };
  
  // Classify based on adjusted thresholds
  if (ndvi >= thresholds.peak) {
    return {
      level: 'Peak Bloom',
      intensity: 'Very High',
      color: '#10B981', // Green
      description: 'Exceptional flowering activity with maximum vegetation health',
      ndviRange: `${thresholds.peak.toFixed(2)}+`,
      confidence: calculateConfidence(ndvi, thresholds.peak)
    };
  } else if (ndvi >= thresholds.active) {
    return {
      level: 'Active Bloom',
      intensity: 'High',
      color: '#34D399', // Light Green
      description: 'Strong flowering activity with healthy vegetation growth',
      ndviRange: `${thresholds.active.toFixed(2)}-${thresholds.peak.toFixed(2)}`,
      confidence: calculateConfidence(ndvi, thresholds.active)
    };
  } else if (ndvi >= thresholds.low) {
    return {
      level: 'Low Bloom',
      intensity: 'Medium',
      color: '#FBBF24', // Yellow
      description: 'Moderate flowering activity with developing vegetation',
      ndviRange: `${thresholds.low.toFixed(2)}-${thresholds.active.toFixed(2)}`,
      confidence: calculateConfidence(ndvi, thresholds.low)
    };
  } else {
    return {
      level: 'Dormant',
      intensity: 'Low',
      color: '#6B7280', // Gray
      description: 'Minimal flowering activity, vegetation in dormant phase',
      ndviRange: `0-${thresholds.low.toFixed(2)}`,
      confidence: calculateConfidence(ndvi, 0.1)
    };
  }
}

/**
 * Calculate confidence score for classification
 */
function calculateConfidence(ndvi, threshold) {
  const distance = Math.abs(ndvi - threshold);
  const confidence = Math.max(0.6, 1 - (distance * 2));
  return Math.round(confidence * 100);
}

/**
 * Get bloom status with detailed information
 */
export function getBloomStatus(ndviData, phenologyData, plantData) {
  const { latitude, longitude, ndvi, season } = ndviData;
  
  const classification = classifyBloomIntensity(ndvi, season, latitude);
  const plantInfo = plantData;
  const phenologyMetrics = phenologyData;
  
  // Calculate overall bloom score
  const bloomScore = calculateBloomScore(ndvi, plantInfo, phenologyMetrics);
  
  // Generate status message
  const statusMessage = generateStatusMessage(classification, plantInfo, season);
  
  // Get visual indicators
  const visualIndicators = getVisualIndicators(classification, plantInfo);
  
  return {
    classification,
    plantInfo,
    phenologyMetrics,
    bloomScore,
    statusMessage,
    visualIndicators,
    lastUpdated: new Date().toISOString(),
    dataQuality: assessDataQuality(ndviData)
  };
}

/**
 * Calculate overall bloom score (0-100)
 */
function calculateBloomScore(ndvi, plantInfo, phenologyMetrics) {
  let score = ndvi * 60; // NDVI contributes 60% to score
  
  // Plant information contributes 20%
  if (plantInfo && plantInfo.ndviContribution) {
    score += plantInfo.ndviContribution * 20;
  }
  
  // Phenology index contributes 20%
  if (phenologyMetrics && phenologyMetrics.phenologyIndex) {
    score += phenologyMetrics.phenologyIndex * 20;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Generate human-readable status message
 */
function generateStatusMessage(classification, plantInfo, season) {
  const { level, intensity } = classification;
  const plantName = plantInfo?.primarySpecies || 'local vegetation';
  
  const messages = {
    'Peak Bloom': `Exceptional blooming activity! ${plantName} is at peak flowering with ${intensity.toLowerCase()} intensity.`,
    'Active Bloom': `Strong blooming activity observed. ${plantName} showing ${intensity.toLowerCase()} flowering.`,
    'Low Bloom': `Moderate blooming activity. ${plantName} beginning to flower with ${intensity.toLowerCase()} intensity.`,
    'Dormant': `Minimal blooming activity. ${plantName} in dormant phase during ${season.toLowerCase()}.`
  };
  
  return messages[level] || `Current blooming status: ${level.toLowerCase()}`;
}

/**
 * Get visual indicators for the bloom status
 */
function getVisualIndicators(classification, plantInfo) {
  const { level, color } = classification;
  
  const indicators = {
    'Peak Bloom': {
      icon: '🌸',
      animation: 'pulse',
      gradient: `linear-gradient(135deg, ${color}, #059669)`,
      particles: 8
    },
    'Active Bloom': {
      icon: '🌺',
      animation: 'bounce',
      gradient: `linear-gradient(135deg, ${color}, #10B981)`,
      particles: 5
    },
    'Low Bloom': {
      icon: '🌿',
      animation: 'fade',
      gradient: `linear-gradient(135deg, ${color}, #FBBF24)`,
      particles: 2
    },
    'Dormant': {
      icon: '🍂',
      animation: 'static',
      gradient: `linear-gradient(135deg, ${color}, #9CA3AF)`,
      particles: 0
    }
  };
  
  const baseIndicator = indicators[level] || indicators['Dormant'];
  
  // Add plant-specific colors if available
  if (plantInfo && plantInfo.dominantColors) {
    baseIndicator.accentColors = plantInfo.dominantColors;
  }
  
  return baseIndicator;
}

/**
 * Assess data quality and reliability
 */
function assessDataQuality(ndviData) {
  const { confidence, source, ndviAnomaly } = ndviData;
  
  let quality = 'Good';
  let issues = [];
  
  if (confidence < 0.7) {
    quality = 'Fair';
    issues.push('Low confidence in satellite data');
  }
  
  if (source === 'Fallback') {
    quality = 'Limited';
    issues.push('Using fallback data - real-time data unavailable');
  }
  
  if (Math.abs(ndviAnomaly) > 0.2) {
    quality = 'Fair';
    issues.push('Unusual NDVI anomaly detected');
  }
  
  return {
    level: quality,
    confidence: Math.round(confidence * 100),
    issues,
    lastValidData: ndviData.date
  };
}

/**
 * Compare current bloom status with historical data
 */
export function compareWithHistorical(currentBloom, historicalData) {
  if (!historicalData || historicalData.length === 0) {
    return {
      trend: 'Unknown',
      comparison: 'No historical data available',
      percentile: null
  };
  
  const currentNDVI = currentBloom.ndvi;
  const historicalNDVIs = historicalData.map(d => d.ndvi);
  
  // Calculate trend
  const recent = historicalNDVIs.slice(-3); // Last 3 data points
  const trend = calculateTrend(recent);
  
  // Calculate percentile
  const sortedNDVIs = historicalNDVIs.sort((a, b) => a - b);
  const percentile = calculatePercentile(currentNDVI, sortedNDVIs);
  
  // Generate comparison message
  const comparison = generateComparisonMessage(trend, percentile);
  
  return {
    trend,
    comparison,
    percentile,
    historicalAverage: historicalNDVIs.reduce((a, b) => a + b, 0) / historicalNDVIs.length,
    currentVsAverage: currentNDVI - (historicalNDVIs.reduce((a, b) => a + b, 0) / historicalNDVIs.length)
  };
}

function calculateTrend(data) {
  if (data.length < 2) return 'Unknown';
  
  const first = data[0];
  const last = data[data.length - 1];
  const change = (last - first) / first;
  
  if (change > 0.1) return 'Increasing';
  if (change < -0.1) return 'Decreasing';
  return 'Stable';
}

function calculatePercentile(value, sortedArray) {
  const index = sortedArray.findIndex(v => v >= value);
  return Math.round((index / sortedArray.length) * 100);
}

function generateComparisonMessage(trend, percentile) {
  if (percentile === null) return 'No comparison available';
  
  const trendMessages = {
    'Increasing': 'blooming activity is increasing',
    'Decreasing': 'blooming activity is decreasing',
    'Stable': 'blooming activity is stable',
    'Unknown': 'trend is unclear'
  };
  
  const percentileMessages = {
    high: 'above average',
    normal: 'near average',
    low: 'below average'
  };
  
  let percentileCategory = 'normal';
  if (percentile >= 75) percentileCategory = 'high';
  else if (percentile <= 25) percentileCategory = 'low';
  
  return `Current blooming is ${percentileMessages[percentileCategory]} and ${trendMessages[trend]}`;
}

export default {
  classifyBloomIntensity,
  getBloomStatus,
  compareWithHistorical
};
