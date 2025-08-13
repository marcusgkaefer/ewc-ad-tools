// Component: AppLayout
// Purpose: Handle overall application layout, header, and navigation
// Props: Children components and layout configuration
// State: None (pure layout component)
// Dependencies: React, AppHeader, ProgressSteps

import AppHeader from '../ui/AppHeader';
import ProgressSteps from '../ui/ProgressSteps';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  currentStep?: number;
  showProgress?: boolean;
  useSimplifiedVersion?: boolean;
}

export default function AppLayout({
  children,
  currentStep = 1,
  showProgress = true,
  useSimplifiedVersion = false
}: AppLayoutProps) {
  const steps = [
    { id: 1, name: 'Locations', description: 'Select target locations' },
    { id: 2, name: 'Settings', description: 'Configure campaign settings' },
    { id: 3, name: 'Ads', description: 'Configure ad content' },
    { id: 4, name: 'Review', description: 'Review campaign details' },
    { id: 5, name: 'Results', description: 'Download generated files' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <AppHeader />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps - only show in professional mode */}
        {showProgress && !useSimplifiedVersion && (
          <div className="mb-8">
            <ProgressSteps
              currentStep={currentStep}
              steps={steps}
              onStepClick={() => {
                // This will be handled by the parent component
                // Step navigation logic will be implemented in the parent
              }}
            />
          </div>
        )}
        
        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
