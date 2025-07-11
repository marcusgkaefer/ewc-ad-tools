import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  MapPinIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface FirstAccessWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const FirstAccessWizard: React.FC<FirstAccessWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const wizardSteps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Campaign Creator',
      description: 'Create professional Facebook & Meta campaigns in 5 simple steps. This quick tour will show you the essentials.',
      icon: SparklesIcon
    },
    {
      id: 'locations',
      title: 'Select Locations',
      description: 'Choose target locations with powerful search and bulk selection tools. Use exclusion mode for easier management.',
      icon: MapPinIcon
    },
    {
      id: 'ads',
      title: 'Configure Ads',
      description: 'Set up multiple ad variations with templates, landing pages, and custom messaging for A/B testing.',
      icon: DocumentTextIcon
    },
    {
      id: 'settings',
      title: 'Campaign Settings',
      description: 'Configure budget, objectives, targeting radius, and other campaign parameters.',
      icon: CogIcon
    },
    {
      id: 'review',
      title: 'Review & Generate',
      description: 'Preview your data and generate professional Excel files ready for Facebook Ads Manager import.',
      icon: EyeIcon
    }
  ];

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const currentStepData = wizardSteps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === wizardSteps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-lg)'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-2xl)',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 'var(--space-lg)',
              right: 'var(--space-lg)',
              background: 'none',
              border: 'none',
              padding: 'var(--space-sm)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-500)',
              transition: 'all 0.2s ease'
            }}
          >
            <XMarkIcon style={{ width: '20px', height: '20px' }} />
          </button>

          {/* Progress Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-xs)',
            marginBottom: 'var(--space-xl)'
          }}>
            {wizardSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === currentStep 
                    ? 'var(--primary-500)' 
                    : index < currentStep 
                    ? 'var(--success-400)' 
                    : 'var(--gray-300)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            {/* Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
            }}>
              <Icon style={{ width: '40px', height: '40px', color: 'white' }} />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--gray-800)',
              margin: 0,
              marginBottom: 'var(--space-md)'
            }}>
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '1rem',
              color: 'var(--gray-600)',
              lineHeight: 1.6,
              margin: 0
            }}>
              {currentStepData.description}
            </p>
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-sm) var(--space-md)' }}
                >
                  <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                  Back
                </button>
              )}
              <button
                onClick={skipTour}
                className="btn btn-ghost"
                style={{ padding: 'var(--space-sm) var(--space-md)' }}
              >
                Skip Tour
              </button>
            </div>

            <button
              onClick={nextStep}
              className="btn btn-primary"
              style={{ padding: 'var(--space-sm) var(--space-lg)' }}
            >
              {isLastStep ? (
                <>
                  <PlayIcon style={{ width: '16px', height: '16px' }} />
                  Start Creating
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          </div>

          {/* Step Counter */}
          <div style={{
            textAlign: 'center',
            marginTop: 'var(--space-lg)',
            fontSize: '0.875rem',
            color: 'var(--gray-500)'
          }}>
            {currentStep + 1} of {wizardSteps.length}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstAccessWizard; 