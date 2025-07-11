import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  completed: boolean;
  description: string;
}

interface ProgressStepsProps {
  currentStep: number;
  steps: Step[];
  onStepClick: (stepId: number) => void;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  steps,
  onStepClick
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, damping: 20, stiffness: 300 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        background: 'rgba(14, 165, 233, 0.15)',
        backdropFilter: 'blur(15px)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        boxShadow: '0 6px 24px rgba(14, 165, 233, 0.15)',
        marginBottom: 'var(--space-2xl)'
      }}
    >
      {/* Steps Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        position: 'relative'
      }}>
        {/* Connection Line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.3)',
          zIndex: 0
        }} />
        
        {/* Progress Line */}
        <motion.div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            height: '2px',
            background: 'linear-gradient(90deg, var(--primary-500), var(--secondary-500))',
            zIndex: 1,
            transformOrigin: 'left'
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (currentStep - 1) / (steps.length - 1) }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        />

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = step.completed || currentStep > step.id;
          const isClickable = step.id <= currentStep || isCompleted;

          return (
            <motion.div
              key={step.id}
              variants={stepVariants}
              style={{
                position: 'relative',
                cursor: isClickable ? 'pointer' : 'default',
                zIndex: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '120px'
              }}
              onClick={() => {
                if (isClickable) {
                  onStepClick(step.id);
                }
              }}
              whileHover={isClickable ? { y: -2 } : {}}
              whileTap={isClickable ? { scale: 0.98 } : {}}
            >
              {/* Step Circle */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isActive 
                  ? 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))'
                  : isCompleted
                  ? 'var(--success-500)'
                  : 'rgba(255, 255, 255, 0.4)',
                border: `2px solid ${
                  isActive 
                    ? 'var(--primary-300)'
                    : isCompleted
                    ? 'var(--success-300)'
                    : 'rgba(255, 255, 255, 0.5)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: 'var(--space-sm)'
              }}>
                {/* Animated background pattern for active */}
                {isActive && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
                      borderRadius: '50%'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Icon or Check */}
                {isCompleted && !isActive ? (
                  <CheckCircleIconSolid 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      color: 'white'
                    }} 
                  />
                ) : (
                  <Icon 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      color: 'white'
                    }} 
                  />
                )}
              </div>

              {/* Step Text */}
              <div style={{ 
                textAlign: 'center',
                minHeight: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <h4 style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isActive 
                    ? 'white' 
                    : isCompleted 
                    ? 'white' 
                    : 'white',
                  margin: 0,
                  marginBottom: '2px',
                  lineHeight: 1.2
                }}>
                  {step.title}
                </h4>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0,
                  lineHeight: 1.3
                }}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ProgressSteps; 