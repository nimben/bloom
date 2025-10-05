/**
 * Image API Service
 * This service fetches regionally accurate flower images from various sources
 */

/**
 * Unsplash API configuration
 */
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || 'demo_key';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

/**
 * Wikimedia Commons API configuration
 */
const WIKIMEDIA_BASE_URL = 'https://commons.wikimedia.org/w/api.php';

/**
 * Regional flower image mappings
 */
const REGIONAL_FLOWER_MAPPINGS = {
  // Japan
  'japan': {
    spring: ['cherry blossom', 'sakura', 'magnolia', 'plum blossom'],
    summer: ['hydrangea', 'lotus', 'sunflower'],
    autumn: ['chrysanthemum', 'cosmos', 'maple leaves'],
    winter: ['camellia', 'winter jasmine', 'plum blossom']
  },
  
  // United States
  'usa': {
    spring: ['tulip', 'daffodil', 'cherry blossom', 'magnolia'],
    summer: ['rose', 'sunflower', 'lavender', 'wildflower'],
    autumn: ['chrysanthemum', 'aster', 'goldenrod'],
    winter: ['poinsettia', 'holly', 'winter rose']
  },
  
  // United Kingdom
  'uk': {
    spring: ['bluebell', 'daffodil', 'primrose', 'snowdrop'],
    summer: ['rose', 'lavender', 'foxglove', 'wildflower'],
    autumn: ['chrysanthemum', 'heather', 'autumn leaves'],
    winter: ['holly', 'ivy', 'winter aconite']
  },
  
  // Australia
  'australia': {
    spring: ['wattle', 'banksia', 'waratah', 'protea'],
    summer: ['jacaranda', 'eucalyptus flower', 'kangaroo paw'],
    autumn: ['autumn crocus', 'sturt desert rose'],
    winter: ['winter rose', 'cyclamen', 'winter heath']
  },
  
  // France
  'france': {
    spring: ['tulip', 'daffodil', 'magnolia', 'lilac'],
    summer: ['lavender', 'sunflower', 'rose', 'poppy'],
    autumn: ['chrysanthemum', 'autumn leaves'],
    winter: ['holly', 'winter jasmine', 'camellia']
  },
  
  // Tropical regions
  'tropical': {
    year_round: ['hibiscus', 'bougainvillea', 'orchid', 'bird of paradise', 'frangipani']
  }
};

/**
 * Get region identifier based on coordinates
 */
function getRegionFromCoordinates(latitude, longitude) {
  // Simplified region detection based on coordinates
  if (latitude >= 30 && latitude <= 46 && longitude >= 129 && longitude <= 146) {
    return 'japan';
  } else if (latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
    return 'usa';
  } else if (latitude >= 49 && latitude <= 61 && longitude >= -8 && longitude <= 2) {
    return 'uk';
  } else if (latitude >= -44 && latitude <= -10 && longitude >= 113 && longitude <= 154) {
    return 'australia';
  } else if (latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 8) {
    return 'france';
  } else if (Math.abs(latitude) < 23.5) {
    return 'tropical';
  }
  
  return 'general';
}

/**
 * Fetch flower images from Unsplash
 */
export async function fetchFlowerImagesFromUnsplash(plantName, season, limit = 3) {
  try {
    if (UNSPLASH_ACCESS_KEY === 'demo_key') {
      return getMockImages(plantName, season);
    }
    
    const query = `${plantName} flower ${season}`;
    const response = await fetch(
      `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Unsplash API error');
    }
    
    const data = await response.json();
    
    return data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbnail: photo.urls.thumb,
      alt: photo.alt_description || `${plantName} flower`,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      source: 'unsplash'
    }));
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    return getMockImages(plantName, season);
  }
}

/**
 * Fetch flower images from Wikimedia Commons
 */
export async function fetchFlowerImagesFromWikimedia(plantName, season, limit = 3) {
  try {
    const query = `${plantName} flower`;
    const response = await fetch(
      `${WIKIMEDIA_BASE_URL}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Wikimedia API error');
    }
    
    const data = await response.json();
    
    if (!data.query || !data.query.search) {
      return getMockImages(plantName, season);
    }
    
    return data.query.search.map(item => ({
      id: item.title,
      url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.title)}`,
      thumbnail: `https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(item.title)}&w=300`,
      alt: item.title,
      photographer: 'Wikimedia Commons',
      photographerUrl: 'https://commons.wikimedia.org',
      source: 'wikimedia'
    }));
  } catch (error) {
    console.error('Error fetching images from Wikimedia:', error);
    return getMockImages(plantName, season);
  }
}

/**
 * Get regionally appropriate flower images
 */
export async function getRegionalFlowerImages(latitude, longitude, season, plantInfo) {
  const region = getRegionFromCoordinates(latitude, longitude);
  const regionFlowers = REGIONAL_FLOWER_MAPPINGS[region] || REGIONAL_FLOWER_MAPPINGS['general'];
  
  let flowerKeywords = [];
  
  if (region === 'tropical') {
    flowerKeywords = regionFlowers.year_round;
  } else {
    flowerKeywords = regionFlowers[season.toLowerCase()] || regionFlowers.spring;
  }
  
  // Add plant-specific keywords if available
  if (plantInfo && plantInfo.primarySpecies) {
    flowerKeywords.unshift(plantInfo.primarySpecies.toLowerCase());
  }
  
  // Try to fetch images for each keyword
  const allImages = [];
  
  for (const keyword of flowerKeywords.slice(0, 3)) {
    try {
      const unsplashImages = await fetchFlowerImagesFromUnsplash(keyword, season, 2);
      const wikimediaImages = await fetchFlowerImagesFromWikimedia(keyword, season, 1);
      
      allImages.push(...unsplashImages, ...wikimediaImages);
      
      if (allImages.length >= 6) break; // Limit total images
    } catch (error) {
      console.error(`Error fetching images for ${keyword}:`, error);
    }
  }
  
  // Remove duplicates and limit results
  const uniqueImages = allImages.filter((image, index, self) => 
    index === self.findIndex(img => img.id === image.id)
  ).slice(0, 6);
  
  return uniqueImages.length > 0 ? uniqueImages : getMockImages(plantInfo?.primarySpecies || 'flower', season);
}

/**
 * Generate mock images when APIs are unavailable
 */
function getMockImages(plantName, season) {
  const mockImages = {
    'Cherry Blossom': [
      {
        id: 'mock-cherry-1',
        url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=150',
        alt: 'Cherry blossom tree in bloom',
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        source: 'mock'
      }
    ],
    'Rose': [
      {
        id: 'mock-rose-1',
        url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=150',
        alt: 'Red rose flower',
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        source: 'mock'
      }
    ],
    'Sunflower': [
      {
        id: 'mock-sunflower-1',
        url: 'https://images.unsplash.com/photo-1597848212624-e17eb04ad410?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1597848212624-e17eb04ad410?w=150',
        alt: 'Sunflower field',
        photographer: 'Unsplash',
        photographerUrl: 'https://unsplash.com',
        source: 'mock'
      }
    ]
  };
  
  // Return specific mock images if available, otherwise generic flower images
  return mockImages[plantName] || [
    {
      id: 'mock-flower-1',
      url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
      thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=150',
      alt: `${plantName || 'Flower'} in ${season} season`,
      photographer: 'Unsplash',
      photographerUrl: 'https://unsplash.com',
      source: 'mock'
    }
  ];
}

/**
 * Get animated GIF URLs for specific flowers (if available)
 */
export function getAnimatedFlowerImages(plantName, season) {
  const animatedImages = {
    'Cherry Blossom': [
      {
        id: 'animated-cherry-1',
        url: 'https://media.giphy.com/media/3o7TKDQ6fKqXqXqXqXq/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3o7TKDQ6fKqXqXqXqXq/200.gif',
        alt: 'Cherry blossom petals falling',
        source: 'giphy',
        animation: 'petal-fall'
      }
    ],
    'Rose': [
      {
        id: 'animated-rose-1',
        url: 'https://media.giphy.com/media/3o7TKDQ6fKqXqXqXqXq/giphy.gif',
        thumbnail: 'https://media.giphy.com/media/3o7TKDQ6fKqXqXqXqXq/200.gif',
        alt: 'Rose blooming',
        source: 'giphy',
        animation: 'bloom-open'
      }
    ]
  };
  
  return animatedImages[plantName] || [];
}

/**
 * Cache images to reduce API calls
 */
const imageCache = new Map();

export function cacheImages(key, images) {
  imageCache.set(key, {
    images,
    timestamp: Date.now(),
    expiry: 24 * 60 * 60 * 1000 // 24 hours
  });
}

export function getCachedImages(key) {
  const cached = imageCache.get(key);
  
  if (cached && (Date.now() - cached.timestamp) < cached.expiry) {
    return cached.images;
  }
  
  return null;
}

export default {
  getRegionalFlowerImages,
  fetchFlowerImagesFromUnsplash,
  fetchFlowerImagesFromWikimedia,
  getAnimatedFlowerImages,
  cacheImages,
  getCachedImages
};
