/**
 * Phenology Data Service
 * This service provides plant phenology information and regional plant data
 */

/**
 * Regional plant database with flowering information
 */
const REGIONAL_PLANTS = {
  // Northern Hemisphere - Temperate
  'north_temperate': {
    spring: [
      { name: 'Cherry Blossom', scientific: 'Prunus serrulata', bloomPeriod: 'March-May', ndviBoost: 0.15 },
      { name: 'Magnolia', scientific: 'Magnolia spp.', bloomPeriod: 'March-June', ndviBoost: 0.12 },
      { name: 'Tulip', scientific: 'Tulipa spp.', bloomPeriod: 'April-May', ndviBoost: 0.08 },
      { name: 'Daffodil', scientific: 'Narcissus spp.', bloomPeriod: 'March-April', ndviBoost: 0.06 }
    ],
    summer: [
      { name: 'Rose', scientific: 'Rosa spp.', bloomPeriod: 'June-September', ndviBoost: 0.10 },
      { name: 'Sunflower', scientific: 'Helianthus annuus', bloomPeriod: 'July-September', ndviBoost: 0.14 },
      { name: 'Lavender', scientific: 'Lavandula spp.', bloomPeriod: 'June-August', ndviBoost: 0.09 },
      { name: 'Wildflower Meadow', scientific: 'Mixed species', bloomPeriod: 'May-September', ndviBoost: 0.18 }
    ],
    autumn: [
      { name: 'Chrysanthemum', scientific: 'Chrysanthemum spp.', bloomPeriod: 'September-November', ndviBoost: 0.08 },
      { name: 'Aster', scientific: 'Aster spp.', bloomPeriod: 'August-October', ndviBoost: 0.07 },
      { name: 'Goldenrod', scientific: 'Solidago spp.', bloomPeriod: 'August-October', ndviBoost: 0.09 },
      { name: 'Cosmos', scientific: 'Cosmos spp.', bloomPeriod: 'July-October', ndviBoost: 0.06 }
    ],
    winter: [
      { name: 'Camellia', scientific: 'Camellia spp.', bloomPeriod: 'December-March', ndviBoost: 0.05 },
      { name: 'Witch Hazel', scientific: 'Hamamelis spp.', bloomPeriod: 'January-March', ndviBoost: 0.04 },
      { name: 'Snowdrop', scientific: 'Galanthus spp.', bloomPeriod: 'January-March', ndviBoost: 0.03 },
      { name: 'Winter Jasmine', scientific: 'Jasminum nudiflorum', bloomPeriod: 'December-February', ndviBoost: 0.04 }
    ]
  },
  
  // Southern Hemisphere - Temperate
  'south_temperate': {
    spring: [
      { name: 'Banksia', scientific: 'Banksia spp.', bloomPeriod: 'September-November', ndviBoost: 0.12 },
      { name: 'Waratah', scientific: 'Telopea spp.', bloomPeriod: 'October-December', ndviBoost: 0.10 },
      { name: 'Wattle', scientific: 'Acacia spp.', bloomPeriod: 'August-November', ndviBoost: 0.14 },
      { name: 'Protea', scientific: 'Protea spp.', bloomPeriod: 'October-February', ndviBoost: 0.11 }
    ],
    summer: [
      { name: 'Jacaranda', scientific: 'Jacaranda mimosifolia', bloomPeriod: 'November-February', ndviBoost: 0.16 },
      { name: 'Eucalyptus Flower', scientific: 'Eucalyptus spp.', bloomPeriod: 'October-March', ndviBoost: 0.13 },
      { name: 'Kangaroo Paw', scientific: 'Anigozanthos spp.', bloomPeriod: 'November-February', ndviBoost: 0.09 },
      { name: 'Sturt Desert Rose', scientific: 'Gossypium sturtianum', bloomPeriod: 'December-March', ndviBoost: 0.08 }
    ],
    autumn: [
      { name: 'Autumn Crocus', scientific: 'Colchicum autumnale', bloomPeriod: 'March-May', ndviBoost: 0.06 },
      { name: 'Saffron Crocus', scientific: 'Crocus sativus', bloomPeriod: 'March-April', ndviBoost: 0.05 },
      { name: 'Autumn Bellflower', scientific: 'Campanula spp.', bloomPeriod: 'March-May', ndviBoost: 0.07 }
    ],
    winter: [
      { name: 'Winter Rose', scientific: 'Helleborus spp.', bloomPeriod: 'June-August', ndviBoost: 0.04 },
      { name: 'Cyclamen', scientific: 'Cyclamen spp.', bloomPeriod: 'May-September', ndviBoost: 0.05 },
      { name: 'Winter Heath', scientific: 'Erica spp.', bloomPeriod: 'June-August', ndviBoost: 0.06 }
    ]
  },
  
  // Tropical regions
  'tropical': {
    year_round: [
      { name: 'Hibiscus', scientific: 'Hibiscus rosa-sinensis', bloomPeriod: 'Year-round', ndviBoost: 0.08 },
      { name: 'Bougainvillea', scientific: 'Bougainvillea spp.', bloomPeriod: 'Year-round', ndviBoost: 0.10 },
      { name: 'Orchid', scientific: 'Orchidaceae spp.', bloomPeriod: 'Year-round', ndviBoost: 0.06 },
      { name: 'Bird of Paradise', scientific: 'Strelitzia reginae', bloomPeriod: 'Year-round', ndviBoost: 0.07 },
      { name: 'Frangipani', scientific: 'Plumeria spp.', bloomPeriod: 'Year-round', ndviBoost: 0.09 }
    ]
  }
};

/**
 * Determine the plant region based on coordinates
 */
function getPlantRegion(latitude, longitude) {
  const absLat = Math.abs(latitude);
  
  if (absLat < 23.5) {
    return 'tropical';
  } else if (latitude > 0) {
    return 'north_temperate';
  } else {
    return 'south_temperate';
  }
}

/**
 * Get current flowering plants for a location and season
 */
export function getCurrentFloweringPlants(latitude, longitude, season) {
  const region = getPlantRegion(latitude, longitude);
  const plants = REGIONAL_PLANTS[region];
  
  if (region === 'tropical') {
    return plants.year_round;
  }
  
  return plants[season.toLowerCase()] || [];
}

/**
 * Get detailed plant information for a specific location
 */
export function getPlantInformation(latitude, longitude, season) {
  const plants = getCurrentFloweringPlants(latitude, longitude, season);
  
  if (plants.length === 0) {
    return {
      primarySpecies: 'Mixed Vegetation',
      description: 'Local vegetation in seasonal transition',
      bloomIntensity: 'Low',
      dominantColors: ['green'],
      floweringPeriod: 'Ongoing'
    };
  }
  
  // Select primary and secondary flowering species
  const primaryPlant = plants[0];
  const secondaryPlants = plants.slice(1, 3);
  
  const description = generatePlantDescription(primaryPlant, secondaryPlants, season);
  
  return {
    primarySpecies: primaryPlant.name,
    scientificName: primaryPlant.scientific,
    description: description,
    bloomIntensity: calculateBloomIntensity(plants),
    dominantColors: getPlantColors(plants),
    floweringPeriod: primaryPlant.bloomPeriod,
    ndviContribution: primaryPlant.ndviBoost,
    additionalSpecies: secondaryPlants.map(p => p.name)
  };
}

/**
 * Generate natural language description of current blooms
 */
function generatePlantDescription(primary, secondary, season) {
  const seasonAdjectives = {
    'Spring': 'awakening',
    'Summer': 'vibrant',
    'Autumn': 'rich',
    'Winter': 'subtle'
  };
  
  const adjective = seasonAdjectives[season] || 'beautiful';
  
  if (secondary.length > 0) {
    return `${primary.name} in ${adjective} bloom, accompanied by ${secondary.map(p => p.name).join(' and ')}`;
  }
  
  return `${primary.name} displaying ${adjective} seasonal flowering`;
}

/**
 * Calculate bloom intensity based on plant data
 */
function calculateBloomIntensity(plants) {
  const avgNDVIBoost = plants.reduce((sum, plant) => sum + plant.ndviBoost, 0) / plants.length;
  
  if (avgNDVIBoost > 0.12) return 'Peak Bloom';
  if (avgNDVIBoost > 0.08) return 'Active Bloom';
  if (avgNDVIBoost > 0.05) return 'Low Bloom';
  return 'Dormant';
}

/**
 * Get typical flower colors for plants
 */
function getPlantColors(plants) {
  const colorMap = {
    'Cherry Blossom': ['pink', 'white'],
    'Magnolia': ['pink', 'white', 'purple'],
    'Tulip': ['red', 'yellow', 'purple', 'orange'],
    'Rose': ['red', 'pink', 'white', 'yellow'],
    'Sunflower': ['yellow', 'orange'],
    'Lavender': ['purple', 'blue'],
    'Banksia': ['yellow', 'orange', 'red'],
    'Jacaranda': ['purple', 'blue'],
    'Hibiscus': ['red', 'pink', 'yellow', 'orange'],
    'Bougainvillea': ['pink', 'purple', 'red', 'orange']
  };
  
  const colors = new Set();
  plants.forEach(plant => {
    const plantColors = colorMap[plant.name] || ['green'];
    plantColors.forEach(color => colors.add(color));
  });
  
  return Array.from(colors);
}

/**
 * Get phenology metrics for a location
 */
export function getPhenologyMetrics(latitude, longitude, ndvi, season) {
  const region = getPlantRegion(latitude, longitude);
  const plants = getCurrentFloweringPlants(latitude, longitude, season);
  
  // Calculate start of season (when NDVI starts increasing)
  const startOfSeason = calculateStartOfSeason(season, latitude);
  
  // Calculate peak bloom (highest NDVI period)
  const peakBloom = calculatePeakBloom(season, latitude, ndvi);
  
  // Calculate end of season (when NDVI starts decreasing)
  const endOfSeason = calculateEndOfSeason(season, latitude);
  
  return {
    startOfSeason,
    peakBloom,
    endOfSeason,
    currentPhase: getCurrentPhase(season, latitude),
    bloomDuration: plants.length > 0 ? plants[0].bloomPeriod : 'Variable',
    phenologyIndex: calculatePhenologyIndex(ndvi, plants)
  };
}

function calculateStartOfSeason(season, latitude) {
  const isNorthern = latitude > 0;
  const monthMap = {
    'Spring': isNorthern ? 'March' : 'September',
    'Summer': isNorthern ? 'June' : 'December',
    'Autumn': isNorthern ? 'September' : 'March',
    'Winter': isNorthern ? 'December' : 'June'
  };
  
  return monthMap[season] || 'Variable';
}

function calculatePeakBloom(season, latitude, ndvi) {
  const isNorthern = latitude > 0;
  const peakMonths = {
    'Spring': isNorthern ? 'April-May' : 'October-November',
    'Summer': isNorthern ? 'July-August' : 'January-February',
    'Autumn': isNorthern ? 'September-October' : 'March-April',
    'Winter': isNorthern ? 'January-February' : 'July-August'
  };
  
  return {
    period: peakMonths[season] || 'Variable',
    intensity: ndvi > 0.7 ? 'High' : ndvi > 0.5 ? 'Medium' : 'Low'
  };
}

function calculateEndOfSeason(season, latitude) {
  const isNorthern = latitude > 0;
  const endMonths = {
    'Spring': isNorthern ? 'June' : 'December',
    'Summer': isNorthern ? 'September' : 'March',
    'Autumn': isNorthern ? 'November' : 'May',
    'Winter': isNorthern ? 'March' : 'September'
  };
  
  return endMonths[season] || 'Variable';
}

function getCurrentPhase(season, latitude) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const isNorthern = latitude > 0;
  
  // Simplified phase calculation
  if (season === 'Spring') {
    return isNorthern ? (month <= 4 ? 'Early' : 'Late') : (month <= 10 ? 'Early' : 'Late');
  } else if (season === 'Summer') {
    return isNorthern ? (month <= 7 ? 'Early' : 'Late') : (month <= 1 ? 'Early' : 'Late');
  }
  
  return 'Mid';
}

function calculatePhenologyIndex(ndvi, plants) {
  const plantBoost = plants.length > 0 ? plants[0].ndviBoost : 0;
  return Math.min(1, ndvi + plantBoost);
}

export default {
  getCurrentFloweringPlants,
  getPlantInformation,
  getPhenologyMetrics
};
