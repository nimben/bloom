import React from 'react';
import { motion } from 'framer-motion';

function Petal({ delay = 0, size = 48, hue = 330, x = 0, y = 0, z = 0, rotate = 0 }) {
  const color = `hsl(${hue}, 70%, 80%)`;
  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: size,
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transformStyle: 'preserve-3d',
        transform: `translateZ(${z}px) rotate(${rotate}deg)`
      }}
      initial={{ scale: 0, opacity: 0, rotate: rotate - 20 }}
      animate={{
        scale: [0, 1, 1.05, 1, 1],
        opacity: [0, 1, 1, 1, 1],
        rotate: [rotate - 20, rotate, rotate, rotate + 1.5, rotate - 1.5]
      }}
      transition={{ delay, duration: 2.2, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatDelay: 1.2 }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '60% 60% 10% 60%',
          background: `radial-gradient(120% 120% at 30% 30%, #ffffffcc 0%, ${color} 45%, hsl(${hue}, 60%, 68%) 100%)`,
          boxShadow: '0 8px 18px rgba(0,0,0,0.15)',
          transform: 'rotate(45deg)'
        }}
      />
    </motion.div>
  );
}

function Particle({ delay = 0, duration = 6, startX = 0, startY = 0, size = 6, color = 'rgba(255, 223, 186, 0.9)' }) {
  return (
    <motion.div
      className="absolute"
      style={{ width: size, height: size, left: startX, top: startY }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [0, 20, -10, 30],
        y: [0, -30, -50, -80],
        scale: [0.6, 0.9, 1, 0.8]
      }}
      transition={{ delay, duration, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0.2) 70%, transparent 100%)`,
          filter: 'blur(0.3px)'
        }}
      />
    </motion.div>
  );
}

function Butterfly({ delay = 0, pathWidth = 160, pathHeight = 80 }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: '50%', top: '50%' }}
      initial={{ x: -pathWidth / 2, y: 0, opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [ -pathWidth/2, 0, pathWidth/2 ],
        y: [ 0, -pathHeight, 0 ],
        rotate: [ -8, 0, 8 ],
      }}
      transition={{ delay, duration: 5.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 }}
    >
      <div className="relative" style={{ width: 24, height: 24 }}>
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ width: 14, height: 10, borderRadius: '60% 80% 50% 60%', background: 'linear-gradient(135deg, #ffd1e8, #ffcfd2)', transformOrigin: '0% 50%' }}
          animate={{ rotateY: [0, 50, 0, -50, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ width: 14, height: 10, borderRadius: '80% 60% 60% 50%', background: 'linear-gradient(225deg, #ffd1e8, #ffcfd2)', transformOrigin: '100% 50%', transform: 'translateX(-100%)' }}
          animate={{ rotateY: [0, -50, 0, 50, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute left-1/2 top-1/2" style={{ width: 2, height: 12, background: '#6b4f4f', transform: 'translate(-50%, -50%)' }} />
      </div>
    </motion.div>
  );
}

function EmojiButterfly({ delay = 0, scale = 1, path = 120 }) {
  return (
    <motion.span
      className="absolute select-none"
      style={{ left: '50%', top: '50%', fontSize: `${20 * scale}px` }}
      initial={{ x: -path / 2, y: 0, opacity: 0, rotate: -10 }}
      animate={{
        opacity: [0, 1, 1, 0.8, 1],
        x: [ -path/2, -path/4, 0, path/4, path/2 ],
        y: [ 0, -path/3, -path/2, -path/3, 0 ],
        rotate: [ -10, -2, 6, -2, 8 ],
        scale: [1, 1.05, 1, 1.06, 1]
      }}
      transition={{ delay, duration: 4.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
    >
      🦋
    </motion.span>
  );
}

function DewDrop({ delay = 0, startX = '50%', startY = '30%', fall = 60 }) {
  return (
    <>
      <motion.div
        className="absolute"
        style={{ left: startX, top: startY, width: 6, height: 6 }}
        initial={{ opacity: 0, y: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 1, 0], y: [0, fall * 0.6, fall], scale: [0.6, 0.9, 1] }}
        transition={{ delay, duration: 1.6, repeat: Infinity, repeatDelay: 2.2, ease: 'easeOut' }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(200,230,255,0.7))', filter: 'blur(0.2px)' }} />
      </motion.div>
      <motion.div
        className="absolute"
        style={{ left: startX, top: `calc(${startY} + ${fall}px)`, width: 4, height: 4, transform: 'translate(-50%, -50%)', borderRadius: '50%' }}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.2, 4, 6] }}
        transition={{ delay: delay + 1.4, duration: 1.6, repeat: Infinity, repeatDelay: 2.2, ease: 'easeOut' }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(200, 225, 255, 0.5)' }} />
      </motion.div>
    </>
  );
}

function LightSweep() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.0, 0.15, 0.1, 0.0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        background: 'linear-gradient(100deg, rgba(255,255,255,0) 20%, rgba(255, 240, 200, 0.25) 50%, rgba(255,255,255,0) 80%)',
        mixBlendMode: 'overlay'
      }}
    />
  );
}

export default function BlossomLoader({ show = true }) {
  if (!show) return null;

  const petals = [
    { delay: 0.0, size: 56, hue: 335, x: 0, y: -40, z: 10, rotate: 0 },
    { delay: 0.15, size: 52, hue: 340, x: 35, y: -10, z: 6, rotate: 60 },
    { delay: 0.3, size: 52, hue: 345, x: 22, y: 30, z: 8, rotate: 120 },
    { delay: 0.45, size: 52, hue: 330, x: -22, y: 30, z: 6, rotate: 180 },
    { delay: 0.6, size: 52, hue: 325, x: -35, y: -10, z: 8, rotate: 240 },
  ];

  const particles = new Array(6).fill(0).map((_, i) => ({
    delay: (i % 7) * 0.35,
    duration: 4.5 + (i % 5) * 0.6,
    startX: `${30 + (i * 5)}%`,
    startY: `${60 + (i % 4) * 6}%`,
    size: 4 + (i % 3) * 2,
    color: i % 2 === 0 ? 'rgba(255, 227, 205, 0.9)' : 'rgba(255, 200, 220, 0.85)'
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50" style={{ pointerEvents: 'none' }}>
      <motion.div
        className="relative"
        style={{ width: 220, height: 220 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Blooming petals */}
        {petals.map((p, idx) => (
          <Petal key={idx} {...p} />
        ))}

        {/* Center bud */}
        <motion.div
          className="absolute"
          style={{ left: '50%', top: '50%', width: 18, height: 18, transform: 'translate(-50%, -50%)', borderRadius: '50%' }}
          initial={{ scale: 0.6, boxShadow: '0 0 0 rgba(255, 170, 186, 0)' }}
          animate={{
            scale: [0.6, 1, 0.95, 1],
            background: [
              'radial-gradient(circle, #fff1f5 0%, #ffd6e7 65%, #ffb6c1 100%)',
              'radial-gradient(circle, #fff1f5 0%, #ffd1e8 65%, #ffadc4 100%)'
            ],
          }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Floating pollen */}
        {particles.map((pt, idx) => (
          <Particle key={idx} {...pt} />
        ))}
        {/* Single emoji butterfly with gentle motion and trail */}
        <EmojiButterfly delay={0.4} scale={1.1} path={160} />

        {/* Dew drops and ripples */}
        <DewDrop delay={0.2} startX={'48%'} startY={'40%'} fall={70} />
        <DewDrop delay={1.1} startX={'55%'} startY={'35%'} fall={80} />

        {/* Warm light sweep */}
        <LightSweep />
      </motion.div>
    </div>
  );
}


