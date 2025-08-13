// Component: StepNavigation
// Purpose: Handle step navigation logic and state management
// Props: Current step, step data, and navigation callbacks
// State: Step validation and navigation state
// Dependencies: React, useCallback, useMemo

import { useCallback, useMemo } from 'react';

export interface StepData {
  id: number;
  name: string;
  description: string;
  isCompleted: boolean;
  isValid: boolean;
  canNavigate: boolean;
}

interface StepNavigationProps {
  currentStep: number;
  steps: StepData[];
  onStepChange: (step: number) => void;
  onStepComplete: (step: number) => void;
  onStepValidate: (step: number) => boolean;
}

export default function useStepNavigation({
  currentStep,
  steps,
  onStepChange,
  onStepComplete,
  onStepValidate,
}: StepNavigationProps) {
  const canGoToStep = useCallback(
    (targetStep: number) => {
      // Can always go back
      if (targetStep < currentStep) {
        return true;
      }

      // Can only go forward if current step is completed and valid
      const currentStepData = steps.find(s => s.id === currentStep);
      if (!currentStepData) return false;

      return currentStepData.isCompleted && currentStepData.isValid;
    },
    [currentStep, steps]
  );

  const goToStep = useCallback(
    (step: number) => {
      if (canGoToStep(step)) {
        onStepChange(step);
      }
    },
    [canGoToStep, onStepChange]
  );

  const goToNextStep = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep <= steps.length && canGoToStep(nextStep)) {
      onStepChange(nextStep);
    }
  }, [currentStep, steps.length, canGoToStep, onStepChange]);

  const goToPreviousStep = useCallback(() => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      onStepChange(prevStep);
    }
  }, [currentStep, onStepChange]);

  const goToFirstStep = useCallback(() => {
    onStepChange(1);
  }, [onStepChange]);

  const goToLastStep = useCallback(() => {
    const lastStep = steps.length;
    if (canGoToStep(lastStep)) {
      onStepChange(lastStep);
    }
  }, [steps.length, canGoToStep, onStepChange]);

  const completeCurrentStep = useCallback(() => {
    if (onStepValidate(currentStep)) {
      onStepComplete(currentStep);
      // Auto-advance to next step if available
      if (currentStep < steps.length) {
        onStepChange(currentStep + 1);
      }
    }
  }, [currentStep, steps.length, onStepValidate, onStepComplete, onStepChange]);

  const isFirstStep = useMemo(() => currentStep === 1, [currentStep]);
  const isLastStep = useMemo(
    () => currentStep === steps.length,
    [currentStep, steps.length]
  );
  const canGoNext = useMemo(() => {
    const currentStepData = steps.find(s => s.id === currentStep);
    return (
      currentStepData?.isCompleted && currentStepData?.isValid && !isLastStep
    );
  }, [currentStep, steps, isLastStep]);
  const canGoPrevious = useMemo(() => !isFirstStep, [isFirstStep]);

  const stepProgress = useMemo(() => {
    const completedSteps = steps.filter(s => s.isCompleted).length;
    return (completedSteps / steps.length) * 100;
  }, [steps]);

  return {
    // Navigation methods
    goToStep,
    goToNextStep,
    goToPreviousStep,
    goToFirstStep,
    goToLastStep,
    completeCurrentStep,

    // State checks
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    canGoToStep,

    // Progress
    stepProgress,

    // Current step info
    currentStepData: steps.find(s => s.id === currentStep),
    totalSteps: steps.length,
  };
}
