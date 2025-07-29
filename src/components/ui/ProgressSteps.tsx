import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface ProgressStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  completed: boolean;
}

interface ProgressStepsProps {
  currentStep: number;
  steps: ProgressStep[];
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
      className="bg-white/90 backdrop-blur-xl border border-neutral-200 rounded-3xl p-8 mb-12 shadow-professional"
    >
      {/* Steps Row */}
      <div className="flex justify-between items-center gap-2 max-w-4xl mx-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.completed && !isActive;
          const isClickable = step.completed || isActive || step.id < currentStep;

          return (
            <motion.div
              key={step.id}
              variants={stepVariants}
              className={`flex flex-col items-center text-center min-w-[120px] flex-1 cursor-pointer transition-all duration-300 ${
                isClickable ? 'hover:scale-105' : 'cursor-not-allowed opacity-60'
              }`}
              onClick={() => isClickable && onStepClick(step.id)}
              whileHover={isClickable ? { scale: 1.05 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
            >
              {/* Step Icon Circle */}
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden mb-3 shadow-lg ${
                isActive 
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-300 shadow-primary-500/25'
                  : isCompleted
                  ? 'bg-gradient-to-br from-success-500 to-success-600 border-success-300 shadow-success-500/25'
                  : 'bg-gradient-to-br from-neutral-200 to-neutral-300 border-neutral-300 shadow-neutral-300/25'
              }`}>
                {/* Animated background pattern for active */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-radial from-white/30 to-transparent"
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
                  <CheckCircleIconSolid className="w-6 h-6 text-white" />
                ) : (
                  <Icon className={`w-6 h-6 ${
                    isActive || isCompleted ? 'text-white' : 'text-neutral-500'
                  }`} />
                )}
              </div>

              {/* Step Text */}
              <div className="text-center min-h-[40px] flex flex-col justify-center">
                <h4 className={`text-sm font-semibold mb-0.5 leading-tight ${
                  isActive 
                    ? 'text-primary-600' 
                    : isCompleted 
                    ? 'text-success-600' 
                    : 'text-neutral-500'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-xs leading-tight ${
                  isActive 
                    ? 'text-primary-500' 
                    : isCompleted 
                    ? 'text-success-500' 
                    : 'text-neutral-400'
                }`}>
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