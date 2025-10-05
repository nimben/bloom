import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

// --- 1. MOCK DATA STRUCTURE (Updated to use more videos) ---
// IMPORTANT: Update these paths to your actual video files (e.g., /videos/cherry.mp4)
const phenologyData = [
  {
    id: 'cherry_blossom_dc',
    species: 'Cherry Blossom',
    location: 'Washington D.C., USA',
    season: 'spring',
    historicalPeak: 'Apr 4',
    predictedPeak: 'Mar 28',
    anomalyDays: -7,
    climateContext: 'MODIS LST: +2.5°C Avg March Anomaly',
    media: '/s1.mp4', // Changed to media, assuming this is a video
    mediaType: 'video',
  },
  {
    id: 'tulip_netherlands',
    species: 'Tulips',
    location: 'Lisse, Netherlands',
    season: 'spring',
    historicalPeak: 'Apr 25',
    predictedPeak: 'Apr 20',
    anomalyDays: -5,
    climateContext: 'VIIRS NDVI: Early Vigor Detected',
    media: '/s2.mp4',
    mediaType: 'video',
  },
  {
    id: 'almond_ca', // NEW ITEM 2
    species: 'Almond Blossoms',
    location: 'Central Valley, California, USA',
    season: 'spring',
    historicalPeak: 'Feb 20',
    predictedPeak: 'Feb 15',
    anomalyDays: -5,
    climateContext: 'Early accumulated chill hours detected',
    media: '/s3.mp4',
    mediaType: 'video',
  },
  {
    id: 'roses_italy',
    species: 'Roses',
    location: 'Piedmont, Italy',
    season: 'summer',
    historicalPeak: 'Jul 15',
    predictedPeak: 'Jul 25',
    anomalyDays: 10,
    climateContext: 'VIIRS NDVI: -0.08 June Vigor Anomaly',
    media: '/su3.mp4', // Placeholder video
    mediaType: 'video',
  },
  {
    id: 'sunflower_china',
    species: 'Sunflowers',
    location: 'Heilongjiang, China',
    season: 'summer',
    historicalPeak: 'Aug 1',
    predictedPeak: 'Aug 1',
    anomalyDays: 0,
    climateContext: 'Normal Seasonal Conditions Detected',
    media: '/su1.mp4',
    mediaType: 'video',
  },
  {
    id: 'lavender_provence', // NEW ITEM 3
    species: 'Lavender Fields',
    location: 'Provence, France',
    season: 'summer',
    historicalPeak: 'Jun 28',
    predictedPeak: 'Jun 20',
    anomalyDays: -8,
    climateContext: 'Above-average May temperatures accelerate bloom',
    media: '/su2.mp4',
    mediaType: 'video',
  },
  {
    id: 'maple_fall',
    species: 'Maple Leaf Senescence',
    location: 'Vermont, USA',
    season: 'autumn',
    historicalPeak: 'Oct 15',
    predictedPeak: 'Oct 20',
    anomalyDays: 5,
    climateContext: 'Extended Warm Period Delaying Color Change',
    media: '/a1.mp4', // Placeholder video
    mediaType: 'video',
    },
    {
      id: 'mum_japan', // Original second item re-named for clarity
      species: 'Chrysanthemums',
      location: 'Kyoto, Japan',
      season: 'autumn',
      historicalPeak: 'Oct 25',
      predictedPeak: 'Oct 22',
      anomalyDays: -3,
      climateContext: 'Slightly earlier temperature drop detected',
    media: '/a4.mp4', // Placeholder video
    mediaType: 'video',
  },
  {
    id: 'ragweed_pollen', // NEW ITEM 5
    species: 'Ragweed Pollen Peak',
    location: 'Midwest, USA',
    season: 'autumn',
    historicalPeak: 'Sep 1',
    predictedPeak: 'Aug 25',
    anomalyDays: -7,
    climateContext: 'High August accumulated degree days',
    media: '/a3.mp4', // Placeholder video
    mediaType: 'video',
  },
  {
    id: 'evergreen_winter',
    species: 'Evergreen Pollen',
    location: 'Southeast, USA',
    season: 'winter',
    historicalPeak: 'Jan 20',
    predictedPeak: 'Jan 10',
    anomalyDays: -1,
    climateContext: 'Moderate Dec LST leading to early pollen release',
    media: '/w3.mp4',
    mediaType: 'video',
  },
  {
    id: 'snowdrops_uk', // NEW ITEM 7
    species: 'Snowdrops (Galanthus)',
    location: 'Kew Gardens, UK',
    season: 'winter',
    historicalPeak: 'Feb 15',
    predictedPeak: 'Feb 5',
    anomalyDays: -10,
    climateContext: 'Mild January temperatures accelerate thaw',
    media: '/w2.mp4',
    mediaType: 'video',
  },
  {
    id: 'desert_bloom', // NEW ITEM 8
    species: 'Desert Wildflowers',
    location: 'Atacama Desert, Chile',
    season: 'winter', // Corresponds to Southern Hemisphere winter/dry season preparation
    historicalPeak: 'Jun 1',
    predictedPeak: 'Jun 20',
    anomalyDays: 19,
    climateContext: 'Delayed onset of coastal fog conditions',
    media: '/w1.mp4',
    mediaType: 'video',
  },
];
// --- END MOCK DATA ---

// --- 2. DYNAMIC FORECAST CARD COMPONENT (Updated for Hover/Video) ---
const BloomForecastCard = ({ bloom }) => {
  const { species, location, historicalPeak, predictedPeak, anomalyDays, climateContext, media, mediaType } = bloom;
  const [isHovered, setIsHovered] = useState(false);

  // Logic to determine status color based on anomaly
  let status, statusColor;
  if (anomalyDays < 0) {
    status = 'EARLY';
    statusColor = '#FF6347'; // Red
  } else if (anomalyDays > 0) {
    status = 'LATE';
    statusColor = '#4682B4'; // Blue
  } else {
    status = 'ON TIME';
    statusColor = '#3CB371'; // Green
  }

  // Visual shift logic
  const shiftAmount = anomalyDays * 1.5;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // onClick={() => setIsHovered(!isHovered)} // Use click if hover is too sensitive
      style={{
        position: 'relative',
        minWidth: "350px",
        height: "520px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.5)",
        margin: '0 10px',
        cursor: 'pointer',
      }}
    >
      {/* --- Media Background (Video/Image) --- */}
      {mediaType === 'video' ? (
          <video 
              autoPlay 
              loop 
              muted 
              src={media} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
      ) : (
          <img 
              src={media} 
              alt={species} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
      )}

      {/* --- Prediction Overlay (Appears on Hover/Click) --- */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 50 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          // Background fade for better readability over video
          background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.5), transparent)', 
          color: 'white',
          padding: '20px',
          textAlign: 'left',
          height: '70%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <h3 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>{species}</h3>
        <p style={{ fontSize: '1rem', color: '#ddd' }}>{location}</p>

        {/* Prediction Block */}
        <div style={{ margin: '15px 0', borderLeft: `5px solid ${statusColor}`, paddingLeft: '10px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>Predicted Peak:</p>
          <strong style={{ fontSize: '2rem', color: statusColor }}>
            {predictedPeak}
          </strong>
        </div>
        
        {/* Anomaly Visualization */}
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: statusColor, textAlign: 'left' }}>
            {status} by {Math.abs(anomalyDays)} Days
        </p>

        {/* NASA Context (The WHY) */}
        <div style={{ borderTop: '1px dashed #777', paddingTop: '10px', marginTop: '10px' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>NASA Climate Context:</p>
          <p style={{ fontSize: '0.9rem', color: '#007bff' }}>{climateContext}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
// --- END CARD COMPONENT ---

// --- 3. MAIN MOTION COMPONENT ---
const Motion1 = () => {
  const controls = useAnimation();
  const [season, setSeason] = useState("spring"); 
  const containerRef = useRef(null);

  const seasonColors = {
    spring: "#B7E4F9",
    summer: "#FBD786",
    autumn: "#F7797D",
    winter: "#C9D6FF",
  };
  
  const filteredBlooms = phenologyData.filter(bloom => bloom.season === season);
  
  // Dynamic calculation for continuous scroll duration
  // Duration should be proportional to the number of items to maintain speed
  const itemsPerView = 5; // Rough number of visible items
  const animationDuration = filteredBlooms.length > 0 
    ? filteredBlooms.length * 5 // 5 seconds per item
    : 20;

  const handleSeasonChange = (newSeason) => {
    setSeason(newSeason);
    
    // Stop and restart animation to reset position and duration for new set of cards
    controls.stop(); 
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        duration: animationDuration,
        ease: "linear",
        repeat: Infinity,
      },
    });
  };

  useEffect(() => {
    // Initial start or restart on component mount
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        duration: animationDuration,
        ease: "linear",
        repeat: Infinity,
      },
    });
  }, [controls, animationDuration]); // Reruns if animationDuration changes

  
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${seasonColors[season]}, black)`,
        color: "white",
        textAlign: "center",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        transition: "background 1.5s ease",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
          PHENOLOGY FORECAST — {season.toUpperCase()} 🌸
        </h1>
        <p style={{ color: "#ddd" }}>Analyze bloom predictions using NASA data</p>
      </div>

      {/* --- SEASON TABS --- */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '15px' }}>
        {Object.keys(seasonColors).map((s) => (
          <button
            key={s}
            onClick={() => handleSeasonChange(s)}
            style={{
              padding: '10px 20px',
              border: '2px solid white',
              backgroundColor: season === s ? 'white' : 'transparent',
              color: season === s ? 'black' : 'white',
              cursor: 'pointer',
              borderRadius: '25px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {/* --- END SEASON TABS --- */}

      <div
        ref={containerRef}
        style={{
          overflow: "hidden",
          width: "100%",
        }}
      >
        <motion.div
          animate={controls}
          style={{
            display: "flex",
            alignItems: "center",
            // The key to infinite scroll is to ensure the list of items 
            // is exactly twice the size, and the animation moves exactly -50% of the total width.
            width: filteredBlooms.length > 0 ? `${filteredBlooms.length * 2 * (350 + 20)}px` : '100%', // Calculate width dynamically
            gap: "85px", 
            padding: "0 10px", 
          }}
        >
          {/* --- DYNAMIC FORECAST CARDS --- */}
          {filteredBlooms.length > 0 ? (
            // Duplicate the filtered list to create the seamless infinite loop
            [...filteredBlooms, ...filteredBlooms].map((bloom, i) => (
              <BloomForecastCard key={`${bloom.id}-${i}`} bloom={bloom} />
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '50px', fontSize: '1.2rem', opacity: 0.8 }}>
              No detailed bloom predictions available for {season.toUpperCase()} yet.
            </div>
          )}
          {/* --- END DYNAMIC CARDS --- */}
        </motion.div>
      </div>
    </div>
  );
};

export default Motion1;