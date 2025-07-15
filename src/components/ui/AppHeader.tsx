import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface AppHeaderProps {
  onSettingsClick?: () => void;
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: useTransform(
          motionScrollY,
          [0, 50],
          [
            'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)'
          ]
        ),
        backdropFilter: useTransform(
          motionScrollY,
          [0, 50],
          ['blur(20px)', 'blur(30px)']
        ),
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: useTransform(
          motionScrollY,
          [0, 50],
          [
            '0 2px 8px rgba(0, 0, 0, 0.04)',
            '0 4px 16px rgba(0, 0, 0, 0.08)'
          ]
        ),
        height: headerHeight,
        padding: '0 var(--space-lg)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        margin: '0 auto'
      }}>
        {/* Left side - Logo and title */}
        <a 
          href="/" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          <motion.div style={{
            width: logoSize,
            height: logoSize,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
            flexShrink: 0
          }}>
            <motion.div style={{ 
              width: useTransform(motionScrollY, [0, 100], [20, 18]), 
              height: useTransform(motionScrollY, [0, 100], [20, 18])
            }}>
              <ChartBarIcon style={{ width: '100%', height: '100%', color: 'white' }} />
            </motion.div>
          </motion.div>
          
          <motion.h1 style={{
            fontSize: titleSize,
            fontWeight: 600,
            margin: 0,
            color: '#1e293b',
            letterSpacing: '-0.025em',
            lineHeight: 1,
            fontSize: '1.5rem'
          }}>
            Ad Tools
          </motion.h1>
        </a>

        {/* Right side - Settings Icon */}
        <div style={{ position: 'relative' }}>
          <motion.button
            onClick={onSettingsClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            whileHover={{
              color: '#3b82f6',
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Cog6ToothIcon style={{ width: '20px', height: '20px' }} />
          </motion.button>

          {/* Tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                padding: '8px 12px',
                background: '#1f2937',
                color: 'white',
                fontSize: '0.75rem',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                zIndex: 1001,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              Quick Actions
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '12px',
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderBottom: '4px solid #1f2937'
              }} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader; 