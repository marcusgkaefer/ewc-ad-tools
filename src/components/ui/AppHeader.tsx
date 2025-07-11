import React from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const AppHeader: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-2xl)',
        marginBottom: 'var(--space-2xl)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-2xl)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Animated Background Pattern */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          borderRadius: 'var(--radius-2xl)'
        }}
        animate={{
          background: [
            'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          opacity: 0.2
        }}
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <SparklesIcon style={{ width: '40px', height: '40px', color: 'white' }} />
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          opacity: 0.15
        }}
        animate={{
          y: [10, -10, 10],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <BoltIcon style={{ width: '32px', height: '32px', color: 'white' }} />
      </motion.div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        color: 'white'
      }}>
        {/* Logo/Icon */}
        <motion.div
          style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-lg)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            delay: 0.2 
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <RocketLaunchIcon style={{ width: '40px', height: '40px' }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            margin: 0,
            marginBottom: 'var(--space-md)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Campaign Creator Studio
        </motion.h1>

        {/* Subtitle */}
                 <motion.p
           style={{
             fontSize: '1.25rem',
             fontWeight: 400,
             margin: '0 auto',
             opacity: 0.9,
             lineHeight: 1.6,
             maxWidth: '600px'
           }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Create professional Facebook & Meta campaigns in minutes with AI-powered location targeting and dynamic content generation
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            marginTop: 'var(--space-xl)',
            flexWrap: 'wrap'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {[
            { icon: '🎯', text: 'Smart Targeting' },
            { icon: '⚡', text: 'Lightning Fast' },
            { icon: '📊', text: 'Data Driven' },
            { icon: '🚀', text: 'Ready to Launch' }
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-sm) var(--space-lg)',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.8 + (index * 0.1),
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <span style={{ fontSize: '1rem' }}>{feature.icon}</span>
              {feature.text}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default AppHeader; 