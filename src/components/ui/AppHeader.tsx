import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChartBarIcon, CogIcon } from "@heroicons/react/24/solid";

interface AppHeaderProps {
  onSettingsClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSettingsClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { scrollY: motionScrollY } = useScroll();

  // More subtle transform values for professional look
  const headerHeight = useTransform(motionScrollY, [0, 100], [72, 64]);
  const logoSize = useTransform(motionScrollY, [0, 100], [40, 36]);

  return (
    <motion.header
      style={{
        height: headerHeight,
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 shadow-professional transition-all duration-300 px-6"
    >
      <div className="flex items-center justify-between h-full mx-auto">
        {/* Left side - Logo and title */}
        <a
          href="/"
          className="flex items-center gap-3 no-underline cursor-pointer"
        >
          <motion.div
            style={{ width: logoSize, height: logoSize }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0"
          >
            <motion.div
              style={{
                width: useTransform(motionScrollY, [0, 100], [20, 18]),
                height: useTransform(motionScrollY, [0, 100], [20, 18]),
              }}
            >
              <ChartBarIcon className="w-full h-full text-white" />
            </motion.div>
          </motion.div>

          <motion.h1 className="font-semibold text-neutral-800 tracking-tight leading-none text-2xl">
            Campaign Creator Studio
          </motion.h1>
        </a>

        {/* Right side - Settings Icon */}
        <div className="relative">
          <motion.button
            onClick={onSettingsClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="flex items-center justify-center w-10 h-10 text-neutral-600 bg-white/90 backdrop-blur-xl border border-neutral-200/50 rounded-xl shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:text-neutral-800 hover:shadow-xl hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
              scale: showTooltip ? 1 : 0.9,
            }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 px-3 py-2 text-xs font-medium text-white bg-neutral-800 rounded-xl shadow-elegant pointer-events-none whitespace-nowrap z-50"
          >
            Quick Settings
            {/* Tooltip arrow */}
            <div className="absolute -top-1 right-3 w-2 h-2 bg-neutral-800 rotate-45"></div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
