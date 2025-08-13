import { Cog6ToothIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';

interface AppHeaderProps {
  onSettingsClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSettingsClick }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo/Title */}
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Ad Tools
                </h1>
              </div>
            </motion.div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-4">
            {/* Settings Button */}
            <button
              onClick={onSettingsClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-wax-gray-600 font-medium rounded-lg transition-all duration-200 hover:text-wax-red-600 hover:bg-wax-red-50 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
