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
      className="bg-transparent rounded-2xl p-6 mb-12"
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
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden mb-2 ${
                isActive 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-blue-300'
                  : isCompleted
                  ? 'bg-green-500 border-green-300'
                  : 'bg-white/40 border-white/50'
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
                  <CheckCircleIconSolid className="w-5 h-5 text-white" />
                ) : (
                  <Icon className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Step Text */}
              <div className="text-center min-h-[40px] flex flex-col justify-center">
                <h4 className={`text-sm font-semibold mb-0.5 leading-tight ${
                  isActive 
                    ? 'text-white' 
                    : isCompleted 
                    ? 'text-white' 
                    : 'text-white'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-white/80 leading-tight">
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