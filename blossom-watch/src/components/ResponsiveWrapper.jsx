import React from 'react';
import { motion } from 'framer-motion';

const ResponsiveWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

export default ResponsiveWrapper;
