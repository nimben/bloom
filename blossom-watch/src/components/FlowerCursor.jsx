import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Simple 3D flower component
function Flower3D({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Flower petals */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color="#FF69B4" transparent opacity={0.8} />
      </mesh>
      
      {/* Petals */}
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 3) * 0.4,
            Math.sin((i * Math.PI) / 3) * 0.4,
            0
          ]}
          rotation={[0, 0, (i * Math.PI) / 3]}
        >
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshBasicMaterial color="#FFB6C1" transparent opacity={0.7} />
        </mesh>
      ))}
      
      {/* Center */}
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

function FlowerCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        transform: `translate(${mousePosition.x - 25}px, ${mousePosition.y - 25}px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-12 h-12">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Flower3D />
        </Canvas>
      </div>
    </motion.div>
  );
}

export default FlowerCursor;
