import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface FirstAccessWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const wizardSteps = [
  {
    id: 1,
    title: 'Welcome to Ad Tools',
    description: 'Create professional Facebook/Meta ad campaigns with ease. This tour will show you the key features.',
    icon: SparklesIcon
  },
  {
    id: 2,
    title: 'Select Target Locations',
    description: 'Choose from hundreds of locations or use exclusion mode for bulk selection. Smart search and filtering included.',
    icon: MapPinIcon
  },
  {
    id: 3,
    title: 'Create Multiple Ads',
    description: 'Design multiple ad variations per campaign. Each location gets all your ad variations in a single export file.',
    icon: DocumentDuplicateIcon
  },
  {
    id: 4,
    title: 'Generate & Export',
    description: 'Export everything as Facebook/Meta ready Excel files. Complete 73-column format for bulk import.',
    icon: ChartBarIcon
  }
];

const FirstAccessWizard: React.FC<FirstAccessWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = wizardSteps[currentStep];
  const Icon = currentStepData?.icon || SparklesIcon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-500 bg-transparent border-none cursor-pointer rounded-lg transition-all duration-200 hover:text-gray-700 hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Progress Dots */}
          <div className="flex justify-center gap-1 mb-8">
            {wizardSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-blue-500' 
                    : index < currentStep 
                    ? 'bg-green-400' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <Icon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className="text-base text-gray-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{currentStep + 1}</span>
              <span>/</span>
              <span>{wizardSteps.length}</span>
            </div>

            <motion.button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {currentStep === wizardSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep === wizardSteps.length - 1 ? (
                <SparklesIcon className="w-4 h-4" />
              ) : (
                <ArrowRightIcon className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstAccessWizard; 