import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const seasons = [
  {
    id: 'spring',
    name: 'Spring',
    months: ['March', 'April', 'May'],
    color: 'from-pink-300 to-green-300',
    description: 'Awakening of nature',
    features: ['Cherry Blossoms', 'Tulips', 'Daffodils', 'Magnolias']
  },
  {
    id: 'summer',
    name: 'Summer',
    months: ['June', 'July', 'August'],
    color: 'from-green-300 to-yellow-300',
    description: 'Peak blooming season',
    features: ['Roses', 'Sunflowers', 'Lavender', 'Wildflowers']
  },
  {
    id: 'autumn',
    name: 'Autumn',
    months: ['September', 'October', 'November'],
    color: 'from-yellow-300 to-orange-300',
    description: 'Golden harvest time',
    features: ['Chrysanthemums', 'Marigolds', 'Asters', 'Cosmos']
  },
  {
    id: 'winter',
    name: 'Winter',
    months: ['December', 'January', 'February'],
    color: 'from-blue-300 to-purple-300',
    description: 'Quiet beauty',
    features: ['Poinsettias', 'Camellias', 'Witch Hazel', 'Snowdrops']
  }
];

function SeasonCard({ season, index }) {
  return (
    <motion.div
      className={`flex-shrink-0 w-72 sm:w-80 h-80 sm:h-96 bg-gradient-to-br ${season.color} rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-lg`}
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -10 }}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">{season.name}</h3>
          <p className="text-white/90 text-lg mb-4">{season.description}</p>
          
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-2">Months:</h4>
            <div className="flex flex-wrap gap-2">
              {season.months.map((month, i) => (
                <span
                  key={i}
                  className="bg-white/20 text-white px-3 py-1 rounded-full text-sm"
                >
                  {month}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-2">Featured Blooms:</h4>
          <div className="space-y-1">
            {season.features.map((feature, i) => (
              <div key={i} className="flex items-center text-white/90">
                <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative flower emoji */}
        <div className="absolute top-4 right-4 text-4xl opacity-20">
          {season.id === 'spring' && '🌸'}
          {season.id === 'summer' && '🌻'}
          {season.id === 'autumn' && '🍂'}
          {season.id === 'winter' && '❄️'}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-br from-blossom-blue to-floral-mint overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-blossom-purple to-floral-rose bg-clip-text text-transparent">
              Seasonal Timeline
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Explore the beautiful cycle of blooming seasons throughout the year
          </p>
        </motion.div>

        {/* Horizontal scrolling timeline */}
        <div className="relative">
          <motion.div
            className="flex overflow-x-auto pb-4 space-x-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {seasons.map((season, index) => (
              <SeasonCard key={season.id} season={season} index={index} />
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-600"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="text-sm">Scroll to explore seasons</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 text-6xl opacity-20"
          style={{ y }}
        >
          🌸
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-5xl opacity-20"
          style={{ y: y }}
        >
          🌻
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-5xl opacity-20"
          style={{ y }}
        >
          🍂
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-6xl opacity-20"
          style={{ y: y }}
        >
          ❄️
        </motion.div>

        {/* Season statistics */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {seasons.map((season, index) => (
            <motion.div
              key={season.id}
              className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-3xl mb-2">
                {season.id === 'spring' && '🌸'}
                {season.id === 'summer' && '🌻'}
                {season.id === 'autumn' && '🍂'}
                {season.id === 'winter' && '❄️'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{season.name}</h3>
              <p className="text-gray-600 text-sm">{season.features.length} featured blooms</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default TimelineSection;
