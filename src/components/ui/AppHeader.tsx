import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cog6ToothIcon,
  SparklesIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface AppHeaderProps {
  onSettingsClick: () => void;
  useSimplifiedVersion?: boolean;
  onVersionToggle?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  onSettingsClick, 
  useSimplifiedVersion = false, 
  onVersionToggle 
}) => {
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
            {/* Version Toggle */}
            {onVersionToggle && (
              <motion.div
                className="flex bg-neutral-100 rounded-xl p-1"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => useSimplifiedVersion && onVersionToggle()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    !useSimplifiedVersion
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Default
                </button>
                <button
                  onClick={() => !useSimplifiedVersion && onVersionToggle()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    useSimplifiedVersion
                      ? 'bg-wax-red-600 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  <BeakerIcon className="w-4 h-4" />
                  Simplified
                </button>
              </motion.div>
            )}

            {/* Settings Button */}
            <motion.button
              onClick={onSettingsClick}
              className="p-3 text-neutral-600 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl transition-all duration-200 hover:bg-white hover:text-neutral-800 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
