
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from './components/HeroSection';
import WorldMapSection from './components/WorldMapSection';
import TimelineSection from './components/TimelineSection';
import FloatingActions from './components/FloatingActions';
import FlowerCursor from './components/FlowerCursor';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App relative">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>
      
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <FlowerCursor />
          <HeroSection />
          <WorldMapSection />
          <TimelineSection />
          <FloatingActions />
        </motion.div>
      )}
    </div>
  );
}

export default App;