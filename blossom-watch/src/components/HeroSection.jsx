import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// 3D Blossom Flower Component
function BlossomFlower({ position, color, scale = 1 }) {
  const meshRef = useRef();
  
  const flowerColors = [
    '#FF69B4', '#FFB6C1', '#DDA0DD', '#98FB98', '#87CEEB', '#FFDAB9'
  ];
  
  const randomColor = color || flowerColors[Math.floor(Math.random() * flowerColors.length)];

  return (
    <group position={position} scale={scale}>
      {/* Main flower center */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={randomColor} transparent opacity={0.9} />
      </mesh>
      
      {/* Petals */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 4) * 0.6,
            Math.sin((i * Math.PI) / 4) * 0.6,
            0
          ]}
          rotation={[0, 0, (i * Math.PI) / 4]}
        >
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color={randomColor} transparent opacity={0.7} />
        </mesh>
      ))}
      
      {/* Additional smaller petals */}
      {[...Array(4)].map((_, i) => (
        <mesh
          key={`small-${i}`}
          position={[
            Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 0.8,
            Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 0.8,
            0
          ]}
          rotation={[0, 0, (i * Math.PI) / 2 + Math.PI / 4]}
        >
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color={randomColor} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Animated Blossom Scene
function BlossomScene() {
  const flowers = [];
  
  // Generate random flower positions
  for (let i = 0; i < 15; i++) {
    flowers.push({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4
      ],
      scale: 0.5 + Math.random() * 0.5,
      color: ['#FF69B4', '#FFB6C1', '#DDA0DD', '#98FB98', '#87CEEB'][Math.floor(Math.random() * 5)]
    });
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <Environment preset="sunset" />
      
      {flowers.map((flower, index) => (
        <BlossomFlower
          key={index}
          position={flower.position}
          color={flower.color}
          scale={flower.scale}
        />
      ))}
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

function HeroSection() {
  const scrollToMap = () => {
    document.getElementById('world-map-section').scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-floral-mint via-floral-lavender to-blossom-blue">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-purple-100/30 to-blue-100/30" />
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <BlossomScene />
        </Canvas>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-800 mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="bg-gradient-to-r from-blossom-pink via-floral-rose to-blossom-purple bg-clip-text text-transparent">
            Blossom Watch
          </span>
        </motion.h1>
        
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 font-light px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          Discover the beauty of nature's blooming seasons around the world
        </motion.p>
        
        <motion.button
          onClick={scrollToMap}
          className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blossom-pink to-floral-rose text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore the World
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>
      </div>
      
      {/* Scroll Arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, repeat: Infinity, repeatType: 'reverse' }}
        onClick={scrollToMap}
      >
        <div className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
