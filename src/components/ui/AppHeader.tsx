import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChartBarIcon, CogIcon } from '@heroicons/react/24/solid';

interface AppHeaderProps {
  onSettingsClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSettingsClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { scrollY: motionScrollY } = useScroll();

  // More subtle transform values for professional look
  const headerHeight = useTransform(motionScrollY, [0, 100], [72, 64]);
  const titleSize = useTransform(motionScrollY, [0, 100], [1.75, 1.5]);
  const logoSize = useTransform(motionScrollY, [0, 100], [40, 36]);

  return (
    <motion.header
      style={{
        height: headerHeight,
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-sm transition-all duration-300 px-6"
    >
      <div className="flex items-center justify-between h-full mx-auto">
        {/* Left side - Logo and title */}
        <a 
          href="/" 
          className="flex items-center gap-3 no-underline cursor-pointer"
        >
          <motion.div 
            style={{ width: logoSize, height: logoSize }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0"
          >
            <motion.div style={{ 
              width: useTransform(motionScrollY, [0, 100], [20, 18]), 
              height: useTransform(motionScrollY, [0, 100], [20, 18])
            }}>
              <ChartBarIcon className="w-full h-full text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            style={{ fontSize: titleSize }}
            className="font-semibold text-gray-800 tracking-tight leading-none text-2xl"
          >
            Ad Tools
          </motion.h1>
        </a>

        {/* Right side - Settings Icon */}
        <div className="relative">
          <motion.button
            onClick={onSettingsClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="flex items-center justify-center w-10 h-10 text-gray-600 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-lg transition-all duration-200 hover:bg-white hover:text-gray-800 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: showTooltip ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <CogIcon className="w-5 h-5" />
            </motion.div>
          </motion.button>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ 
              opacity: showTooltip ? 1 : 0, 
              y: showTooltip ? 0 : 5,
              scale: showTooltip ? 1 : 0.9
            }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 px-3 py-2 text-xs font-medium text-white bg-gray-800 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-50"
          >
            Quick Settings
            {/* Tooltip arrow */}
            <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-800 rotate-45"></div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader; 