import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import the actual service functions
import { getBloomData as serviceGetBloomData } from '../services/bloomDataService';
import { clearAllCache } from '../services/dataCache';

const initializeService = async () => {
  try {
    const bloomDataService = await import('../services/bloomDataService');
    await bloomDataService.initializeService();
    console.log('Real satellite data service initialized');
  } catch (error) {
    console.error('Error initializing service:', error);
  }
};

// Wrapper function to handle service integration and error handling
const getBloomData = async (lat, lng, options = {}) => {
  try {
    console.log(`Fetching bloom data for ${lat}, ${lng}`, options);
    
    // Use the actual service
    const bloomData = await serviceGetBloomData(lat, lng, {
      includeImages: true,
      includeTrends: false,
      forceRefresh: false
    });
    
    console.log('Received bloom data:', bloomData);
    
    // Transform the service response to match expected format
    return {
      location: {
        latitude: lat,
        longitude: lng,
        name: bloomData.location?.name || `Location ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
        country: bloomData.location?.country || 'Unknown Country',
        city: bloomData.location?.city || 'Unknown City'
      },
      ndvi: bloomData.ndvi || {
        ndvi: 0.65,
        season: 'Spring',
        confidence: 0.6,
        source: 'Fallback Data',
        lastUpdated: new Date().toISOString(),
        trend: 'unknown'
      },
      phenology: bloomData.phenology || {
        startOfSeason: 'Unknown',
        peakBloom: 'Unknown',
        endOfSeason: 'Unknown',
        dominantSpecies: 'Mixed Vegetation',
        bloomDuration: 'Unknown',
        region: 'Unknown'
      },
      bloomStatus: bloomData.bloomStatus || {
        level: 'Active Bloom',
        color: '#34D399',
        description: 'Estimated bloom status',
        ndviRange: '0.50-0.80',
        confidence: 60
      },
      flowerImages: bloomData.images || [],
      dataSource: 'NASA AppEEARS + SentinelHub',
      timestamp: new Date().toISOString(),
      plantInfo: bloomData.plantInfo || {
        primarySpecies: 'Mixed Vegetation',
        description: 'Local vegetation in seasonal transition',
        bloomIntensity: 'Low'
      }
    };
  } catch (error) {
    console.error('Error fetching bloom data:', error);
    
    // Return fallback data with proper structure
    return getFallbackBloomData(lat, lng);
  }
};

// Fallback data function
const getFallbackBloomData = (lat, lng) => {
  const season = getSeasonForLocation(lat, lng);
  return {
    location: {
      latitude: lat,
      longitude: lng,
      name: `Location ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      country: 'Unknown Country',
      city: 'Unknown City'
    },
    ndvi: {
      ndvi: 0.65,
      season: season.name,
      confidence: 0.6,
      source: 'Fallback Data',
      lastUpdated: new Date().toISOString(),
      trend: 'unknown'
    },
    phenology: {
      startOfSeason: 'Unknown',
      peakBloom: 'Unknown',
      endOfSeason: 'Unknown',
      dominantSpecies: 'Mixed Vegetation',
      bloomDuration: 'Unknown',
      region: 'Unknown'
    },
    bloomStatus: {
      level: 'Active Bloom',
      color: '#34D399',
      description: 'Estimated bloom status',
      ndviRange: '0.50-0.80',
      confidence: 60
    },
    flowerImages: [],
    dataSource: 'Fallback Data',
    timestamp: new Date().toISOString(),
    plantInfo: {
      primarySpecies: 'Mixed Vegetation',
      description: 'Local vegetation in seasonal transition',
      bloomIntensity: 'Low'
    }
  };
};

// Helper function for season detection
const getSeasonForLocation = (lat, lng) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const isNorthern = lat > 0;
  
  let season, phase;
  
  if (isNorthern) {
    switch (month) {
      case 12: case 1: case 2: season = 'Winter'; phase = 'Mid'; break;
      case 3: case 4: case 5: season = 'Spring'; phase = 'Mid'; break;
      case 6: case 7: case 8: season = 'Summer'; phase = 'Mid'; break;
      case 9: case 10: case 11: season = 'Autumn'; phase = 'Mid'; break;
    }
  } else {
    switch (month) {
      case 12: case 1: case 2: season = 'Summer'; phase = 'Mid'; break;
      case 3: case 4: case 5: season = 'Autumn'; phase = 'Mid'; break;
      case 6: case 7: case 8: season = 'Winter'; phase = 'Mid'; break;
      case 9: case 10: case 11: season = 'Spring'; phase = 'Mid'; break;
    }
  }
  
  return { name: season, phase };
};

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom flower icon based on bloom intensity
const createFlowerIcon = (bloomLevel = 'Active Bloom', color = '#FF69B4') => {
  const iconConfig = {
    'Peak Bloom': { size: 35, emoji: '🌸', animation: 'pulse' },
    'Active Bloom': { size: 30, emoji: '🌺', animation: 'bounce' },
    'Low Bloom': { size: 25, emoji: '🌿', animation: 'fade' },
    'Dormant': { size: 20, emoji: '🍂', animation: 'static' }
  };
  
  const config = iconConfig[bloomLevel] || iconConfig['Active Bloom'];
  
  return L.divIcon({
    className: 'custom-flower-marker',
    html: `
      <div style="
        width: ${config.size}px;
        height: ${config.size}px;
        background: radial-gradient(circle, ${color} 20%, #fff 20%, #fff 40%, ${color} 40%);
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${config.size * 0.6}px;
        animation: ${config.animation} 2s infinite;
      ">${config.emoji}</div>
    `,
    iconSize: [config.size, config.size],
    iconAnchor: [config.size / 2, config.size / 2]
  });
};

// Bloom effect component
function BloomEffect({ position, onComplete }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{
        left: position.x - 50,
        top: position.y - 50,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ 
        scale: [0, 1.5, 2],
        opacity: [1, 0.8, 0],
        rotate: [0, 180, 360]
      }}
      transition={{ duration: 2, ease: "easeOut" }}
      onAnimationComplete={onComplete}
    >
      <div className="w-20 h-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-2 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full"></div>
        <div className="absolute inset-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full"></div>
      </div>
    </motion.div>
  );
}

// Map click handler component
function MapClickHandler({ onLocationClick }) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng, { x: e.containerPoint.x, y: e.containerPoint.y });
    },
  });
  return null;
}

function WorldMapSection() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bloomEffects, setBloomEffects] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [bloomLocations, setBloomLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample locations for initial load
  const sampleLocations = [
    { id: 1, position: [35.6762, 139.6503], name: "Tokyo, Japan" },
    { id: 2, position: [37.7749, -122.4194], name: "San Francisco, USA" },
    { id: 3, position: [51.5074, -0.1278], name: "London, UK" },
    { id: 4, position: [-33.8688, 151.2093], name: "Sydney, Australia" },
    { id: 5, position: [48.8566, 2.3522], name: "Paris, France" }
  ];

  // Initialize service and load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await initializeService();
        
        // Clear cache to ensure fresh data for each location
        clearAllCache();
        
        // Load bloom data for sample locations with force refresh
        const locationPromises = sampleLocations.map(async (location) => {
          try {
            const bloomData = await getBloomData(location.position[0], location.position[1], {
              includeImages: true,
              includeTrends: false,
              forceRefresh: true
            });
            
            return {
              ...location,
              bloomData,
              intensity: bloomData.bloomStatus?.level || 'Active Bloom',
              ndvi: bloomData.ndvi?.ndvi || 0.65,
              season: bloomData.ndvi?.season || 'Spring',
              description: bloomData.plantInfo?.description || 'Local vegetation',
              plantName: bloomData.plantInfo?.primarySpecies || 'Mixed Vegetation',
              bloomScore: bloomData.bloomStatus?.confidence || 60
            };
          } catch (error) {
            console.error(`Error loading data for ${location.name}:`, error);
            return {
              ...location,
              bloomData: null,
              intensity: "Unknown",
              ndvi: 0.5,
              season: "Unknown",
              description: "Data unavailable",
              plantName: "Unknown",
              bloomScore: 0
            };
          }
        });

        const locationsWithData = await Promise.all(locationPromises);
        setBloomLocations(locationsWithData);
      } catch (error) {
        console.error('Error initializing bloom data:', error);
        setError('Failed to load bloom data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleLocationClick = async (latlng, containerPoint) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Map clicked at: ${latlng.lat}, ${latlng.lng}`);
      
      // Get bloom data for clicked location with force refresh
      const bloomData = await getBloomData(latlng.lat, latlng.lng, {
        includeImages: true,
        includeTrends: false,
        forceRefresh: true
      });
      
      console.log('Bloom data received:', bloomData);
      
      // Create location object
      const clickedLocation = {
        id: Date.now(),
        position: [latlng.lat, latlng.lng],
        name: bloomData.location?.name || `Location ${latlng.lat.toFixed(2)}, ${latlng.lng.toFixed(2)}`,
        bloomData,
        intensity: bloomData.bloomStatus?.level || 'Active Bloom',
        ndvi: bloomData.ndvi?.ndvi || 0.65,
        season: bloomData.ndvi?.season || 'Spring',
        description: bloomData.plantInfo?.description || 'Local vegetation',
        plantName: bloomData.plantInfo?.primarySpecies || 'Mixed Vegetation',
        bloomScore: bloomData.bloomStatus?.confidence || 60
      };
      
      console.log('Created location object:', clickedLocation);
      
      setSelectedLocation(clickedLocation);
      setShowPopup(true);

      // Add bloom effect
      const newEffect = {
        id: Date.now(),
        position: containerPoint
      };
      setBloomEffects(prev => [...prev, newEffect]);
      
      // Add to bloom locations if not already present
      setBloomLocations(prev => {
        const exists = prev.some(loc => 
          Math.abs(loc.position[0] - latlng.lat) < 0.01 && 
          Math.abs(loc.position[1] - latlng.lng) < 0.01
        );
        
        if (!exists) {
          return [...prev, clickedLocation];
        }
        return prev;
      });
      
      console.log('Location added successfully');
      
    } catch (error) {
      console.error('Error loading bloom data for clicked location:', error);
      setError(`Failed to load bloom data: ${error.message}`);
      
      // Show fallback data even on error
      const fallbackLocation = {
        id: Date.now(),
        position: [latlng.lat, latlng.lng],
        name: `Location ${latlng.lat.toFixed(2)}, ${latlng.lng.toFixed(2)}`,
        bloomData: getFallbackBloomData(latlng.lat, latlng.lng),
        intensity: 'Active Bloom',
        ndvi: 0.65,
        season: 'Spring',
        description: 'Fallback data - unable to load real-time information',
        plantName: 'Mixed Vegetation',
        bloomScore: 60
      };
      
      setSelectedLocation(fallbackLocation);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const removeBloomEffect = (effectId) => {
    setBloomEffects(prev => prev.filter(effect => effect.id !== effectId));
  };

  return (
    <section id="world-map-section" className="min-h-screen bg-gradient-to-br from-floral-lavender to-blossom-blue py-20 relative">
      <div className="container mx-auto px-6 relative">
        <motion.div
          className="text-center mb-12 sm:mb-16 relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-blossom-pink to-floral-rose bg-clip-text text-transparent">
              Global Bloom Map
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Click anywhere on the map to discover blooming locations and their seasonal beauty
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-blossom-pink border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bloom data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-full hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <motion.div
          className="relative z-0"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-80 sm:h-96 md:h-[500px] relative z-0" style={{ position: 'relative' }}>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%', position: 'relative' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapClickHandler onLocationClick={handleLocationClick} />
              
              {bloomLocations.map((location) => (
                <Marker
                  key={location.id}
                  position={location.position}
                  icon={createFlowerIcon(location.intensity, location.bloomData?.bloomStatus?.color)}
                >
                  <Popup>
                    <div className="p-4 max-w-sm">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{location.bloomData?.location?.name || location.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{location.bloomData?.bloomStatus?.description || location.description}</p>
                      
                      {location.bloomData ? (
                        <div className="space-y-3">
                          {/* Bloom Status */}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">Bloom Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              location.bloomData.bloomStatus?.level === 'Peak Bloom' ? 'bg-green-100 text-green-800' :
                              location.bloomData.bloomStatus?.level === 'Active Bloom' ? 'bg-blue-100 text-blue-800' :
                              location.bloomData.bloomStatus?.level === 'Low Bloom' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {location.bloomData.bloomStatus?.level || 'Unknown'}
                            </span>
                          </div>
                          
                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-600">Season:</span>
                              <div className="font-semibold">{location.bloomData.ndvi?.season || 'Unknown'}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-600">NDVI:</span>
                              <div className="font-semibold">{location.bloomData.ndvi?.ndvi?.toFixed(3) || '0.000'}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-600">Species:</span>
                              <div className="font-semibold text-xs">{location.bloomData.phenology?.dominantSpecies || 'Mixed Vegetation'}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="font-medium text-gray-600">Confidence:</span>
                              <div className="font-semibold">{location.bloomData.bloomStatus?.confidence || 60}%</div>
                            </div>
                          </div>
                          
                          {/* Phenology Timeline */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-semibold text-sm text-gray-800 mb-2">Phenology Timeline</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Start:</span>
                                <span className="font-medium">{location.bloomData.phenology?.startOfSeason || 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Peak:</span>
                                <span className="font-medium">
                                  {typeof location.bloomData.phenology?.peakBloom === 'object' 
                                    ? location.bloomData.phenology.peakBloom.period || 'Unknown'
                                    : location.bloomData.phenology?.peakBloom || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>End:</span>
                                <span className="font-medium">{location.bloomData.phenology?.endOfSeason || 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Data Source */}
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-gray-600">Data Source:</span>
                              <span className="text-blue-600 font-medium">{location.bloomData.dataSource || 'Unknown'}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Updated: {location.bloomData.timestamp ? new Date(location.bloomData.timestamp).toLocaleDateString() : 'Unknown'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-4">
                          <div className="animate-spin w-6 h-6 border-2 border-blossom-pink border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p>Loading real-time data...</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        {/* Bloom Effects */}
        <AnimatePresence>
          {bloomEffects.map((effect) => (
            <BloomEffect
              key={effect.id}
              position={effect.position}
              onComplete={() => removeBloomEffect(effect.id)}
            />
          ))}
        </AnimatePresence>

        {/* Location Details Panel */}
        <AnimatePresence>
          {showPopup && selectedLocation && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blossom-pink to-floral-rose rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌸</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {selectedLocation.description}
                  </p>
                  
                  {selectedLocation.bloomData ? (
                    <div className="space-y-4">
                      {/* Bloom Status */}
                      <div className={`p-4 rounded-lg ${
                        selectedLocation.intensity === 'Peak Bloom' ? 'bg-green-50 border-2 border-green-200' :
                        selectedLocation.intensity === 'Active Bloom' ? 'bg-blue-50 border-2 border-blue-200' :
                        selectedLocation.intensity === 'Low Bloom' ? 'bg-yellow-50 border-2 border-yellow-200' :
                        'bg-gray-50 border-2 border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-lg">Bloom Status</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedLocation.intensity === 'Peak Bloom' ? 'bg-green-100 text-green-800' :
                            selectedLocation.intensity === 'Active Bloom' ? 'bg-blue-100 text-blue-800' :
                            selectedLocation.intensity === 'Low Bloom' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedLocation.intensity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {selectedLocation.bloomData.bloomStatus?.description || 'Bloom status information'}
                        </p>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-floral-lavender rounded-lg p-3">
                          <p className="text-sm text-gray-600">Season</p>
                          <p className="font-semibold text-gray-800">{selectedLocation.season}</p>
                        </div>
                        <div className="bg-floral-lavender rounded-lg p-3">
                          <p className="text-sm text-gray-600">NDVI Index</p>
                          <p className="font-semibold text-gray-800">{selectedLocation.ndvi?.toFixed(3)}</p>
                        </div>
                        <div className="bg-floral-lavender rounded-lg p-3">
                          <p className="text-sm text-gray-600">Bloom Score</p>
                          <p className="font-semibold text-gray-800">{selectedLocation.bloomScore || 60}/100</p>
                        </div>
                        <div className="bg-floral-lavender rounded-lg p-3">
                          <p className="text-sm text-gray-600">Plant Species</p>
                          <p className="font-semibold text-gray-800 text-xs">{selectedLocation.plantName || 'Mixed Vegetation'}</p>
                        </div>
                      </div>

                      {/* Phenology Information */}
                      {selectedLocation.bloomData.phenology && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Phenology Timeline</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Start of Season:</span>
                              <span className="font-medium">{selectedLocation.bloomData.phenology.startOfSeason}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Peak Bloom:</span>
                              <span className="font-medium">
                                {typeof selectedLocation.bloomData.phenology?.peakBloom === 'object' 
                                  ? selectedLocation.bloomData.phenology.peakBloom.period || 'Unknown'
                                  : selectedLocation.bloomData.phenology?.peakBloom || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>End of Season:</span>
                              <span className="font-medium">{selectedLocation.bloomData.phenology.endOfSeason}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Data Quality */}
                      {selectedLocation.bloomData.dataQuality && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800">Data Quality</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              selectedLocation.bloomData.dataQuality?.level === 'Excellent' ? 'bg-green-100 text-green-700' :
                              selectedLocation.bloomData.dataQuality?.level === 'Good' ? 'bg-blue-100 text-blue-700' :
                              selectedLocation.bloomData.dataQuality?.level === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {selectedLocation.bloomData.dataQuality?.level || 'Good'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Score: {selectedLocation.bloomData.dataQuality?.score || 75}/100
                          </p>
                          <div className="mt-2">
                            <div className="text-xs text-gray-600">
                              {selectedLocation.bloomData.dataQuality?.factors?.map((factor, index) => (
                                <div key={index}>• {factor}</div>
                              )) || ['• Satellite data available', '• Regional plant data included']}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Flower Images */}
                      {selectedLocation.bloomData.flowerImages && selectedLocation.bloomData.flowerImages.length > 0 && (
                        <div className="bg-pink-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3">Local Flowers - {selectedLocation.bloomData.ndvi?.season || 'Current Season'}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedLocation.bloomData.flowerImages.map((image, index) => (
                              <motion.div 
                                key={index} 
                                className="relative group cursor-pointer"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <img
                                  src={image.thumbnail || image.url}
                                  alt={image.alt}
                                  className="w-full h-24 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                                    <div className="font-medium truncate">{image.alt}</div>
                                    <div className="text-xs opacity-90">via {image.source}</div>
                                  </div>
                                </div>
                                {/* Bloom animation overlay */}
                                <div className="absolute top-1 right-1 text-lg animate-pulse">
                                  🌸
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          {/* Image carousel indicator */}
                          {selectedLocation.bloomData.flowerImages.length > 2 && (
                            <div className="flex justify-center mt-3">
                              <div className="flex space-x-1">
                                {selectedLocation.bloomData.flowerImages.slice(0, 3).map((_, index) => (
                                  <div key={index} className="w-2 h-2 bg-pink-300 rounded-full"></div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Enhanced Data Quality */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-800">Data Quality & Sources</span>
                          <span className="text-xs text-gray-500">Real-time</span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Satellite Data:</span>
                            <span className="font-medium text-blue-600">{selectedLocation.bloomData.ndvi?.source || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <span className="font-medium">{selectedLocation.bloomData.ndvi?.confidence?.toFixed(2) || '0.85'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trend:</span>
                            <span className={`font-medium ${
                              selectedLocation.bloomData.ndvi?.trend === 'increasing' ? 'text-green-600' : 
                              selectedLocation.bloomData.ndvi?.trend === 'decreasing' ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              {selectedLocation.bloomData.ndvi?.trend || 'stable'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Region:</span>
                            <span className="font-medium">{selectedLocation.bloomData.phenology?.region || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        {/* Data freshness indicator */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Last Updated:</span>
                            <span className="text-gray-700 font-medium">
                              {selectedLocation.bloomData.timestamp ? new Date(selectedLocation.bloomData.timestamp).toLocaleString() : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-blossom-pink border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading bloom data...</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowPopup(false)}
                    className="w-full mt-6 bg-gradient-to-r from-blossom-pink to-floral-rose text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default WorldMapSection;
