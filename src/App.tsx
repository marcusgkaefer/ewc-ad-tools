import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import new decomposed components
import AppLayout from './components/layout/AppLayout';
import LocationSelectionStep from './components/steps/LocationSelectionStep';
import CampaignSettingsStep from './components/steps/CampaignSettingsStep';
import AdConfigurationStep from './components/steps/AdConfigurationStep';
import ReviewStep from './components/steps/ReviewStep';
import ResultsStep from './components/steps/ResultsStep';
import NotificationSystem, { useNotifications } from './components/shared/NotificationSystem';

// Import existing UI components
import CampaignSettingsModal from './components/ui/CampaignSettingsModal';
import FilePreview from './components/ui/FilePreview';
import { LocationConfigModal } from './components/ui/LocationConfigModal';
import TemplateCreationModal from './components/ui/TemplateCreationModal';
import SimplifiedCampaignCreator from './components/ui/SimplifiedCampaignCreator';

// Import services and utilities
import { generateAdName } from './constants/hardcodedAdValues';

// Import types
import type { CreateTemplateRequest, LocationConfig } from './types';

// Import Zustand store and hooks
import { useAppStore } from './store/useAppStore';
import { useLocationsData, useTemplatesData, useCampaignGeneration, useLocationConfiguration, useFileDownload } from './hooks/useDataFetching';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function App() {
  // Zustand store state
  const {
    currentStep,
    useSimplifiedVersion,
    locations,
    templates,
    selectedLocationIds,
    excludedLocationIds,
    useExclusionMode,
    campaignConfig,
    generationJob,
    isLoading,
    showCampaignSettings,
    showTemplateCreationModal,
    isCreatingTemplate,
    showFilePreview,
    showLocationConfigModal,
    selectedLocationToConfigure,
    showLocationConfigSuccess,
    configSuccessMessage,
    showLocationConfigError,
    configErrorMessage,
    // Actions
    setCurrentStep,
    setLocations,
    setTemplates,
    setSelectedLocationIds,
    setExcludedLocationIds,
    setUseExclusionMode,
    updateCampaignConfig,
    setGenerationJob,
    setIsLoading,
    setShowCampaignSettings,
    setShowTemplateCreationModal,
    setIsCreatingTemplate,
    setShowFilePreview,
    setShowLocationConfigModal,
    setSelectedLocationToConfigure,
    setShowLocationConfigSuccess,
    setConfigSuccessMessage,
    setShowLocationConfigError,
    setConfigErrorMessage,
    resetToDefaults,
    addAd,
    removeAd,
    updateAd
  } = useAppStore();

  // Custom hooks for data fetching
  const { fetchLocations, refreshLocations } = useLocationsData();
  const { fetchTemplates, createTemplate, refreshTemplates } = useTemplatesData();
  const { generateCampaign } = useCampaignGeneration();
  const { updateLocationConfig } = useLocationConfiguration();
  const { downloadAllFiles } = useFileDownload();

  // Notifications
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();

  // Initialize with default ad using hard-coded template values
  useEffect(() => {
    if (templates.length > 0 && campaignConfig.ads.length === 0) {
      const defaultAd = {
        id: 'ad-1',
        name: generateAdName('Template', campaignConfig.month, campaignConfig.day),
        templateId: templates[0]?.id || '',
        radius: '+4m',
        caption: 'You learn something new everyday',
        additionalNotes: '',
        scheduledDate: '',
        status: 'Paused' as const
      };
      addAd(defaultAd);
    }
  }, [templates.length, campaignConfig.ads.length, campaignConfig.month, campaignConfig.day, addAd]);

  // Update date fields when selectedDate changes
  useEffect(() => {
    const date = campaignConfig.selectedDate;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString();
    const scheduledDate = date.toLocaleDateString('en-US');
    
    updateCampaignConfig({
      month,
      day,
      ads: campaignConfig.ads.map(ad => ({ ...ad, scheduledDate }))
    });
  }, [campaignConfig.selectedDate, campaignConfig.ads, updateCampaignConfig]);

  // Calculate effective selected locations
  const effectiveSelectedLocations = useExclusionMode
    ? locations.filter(loc => !excludedLocationIds.includes(loc.id))
    : locations.filter(loc => selectedLocationIds.includes(loc.id));

  // Step navigation handlers
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // Location management handlers
  const handleLocationSelect = (locationIds: string[]) => {
    if (useExclusionMode) {
      setExcludedLocationIds(locationIds);
    } else {
      setSelectedLocationIds(locationIds);
    }
  };

  const handleExclusionModeToggle = (useExclusion: boolean) => {
    setUseExclusionMode(useExclusion);
  };

  const handleLocationConfigure = (location: any) => {
    setSelectedLocationToConfigure(location);
    setShowLocationConfigModal(true);
  };

  // Campaign configuration handlers
  const handleCampaignConfigUpdate = (updates: any) => {
    updateCampaignConfig(updates);
  };

  // Generation handlers
  const handleGenerateCampaign = async () => {
    try {
      await generateCampaign({
        locations: effectiveSelectedLocations.map(loc => loc.id),
        ads: campaignConfig.ads.map(ad => ad.templateId),
        campaign: campaignConfig
      });
    } catch (error) {
      console.error('Failed to generate campaign:', error);
    }
  };

  const handleRestart = () => {
    resetToDefaults();
  };

  const handleDownloadAll = () => {
    if (generationJob?.files) {
      downloadAllFiles(generationJob.files);
    }
  };

  const handlePreviewFile = (fileUrl: string, fileName: string) => {
    // This would typically open a file preview modal
    console.log('Preview file:', fileName, fileUrl);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <LocationSelectionStep
            locations={locations}
            selectedLocationIds={selectedLocationIds}
            excludedLocationIds={excludedLocationIds}
            useExclusionMode={useExclusionMode}
            onLocationSelect={handleLocationSelect}
            onExclusionModeToggle={handleExclusionModeToggle}
            onNext={handleNextStep}
            onLocationConfigure={handleLocationConfigure}
          />
        );
      case 2:
        return (
          <CampaignSettingsStep
            campaignConfig={campaignConfig}
            onConfigUpdate={handleCampaignConfigUpdate}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <AdConfigurationStep
            campaignConfig={campaignConfig}
            templates={templates}
            onConfigUpdate={handleCampaignConfigUpdate}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        return (
          <ReviewStep
            campaignConfig={campaignConfig}
            selectedLocations={effectiveSelectedLocations}
            templates={templates}
            onBack={handlePreviousStep}
            onGenerate={handleGenerateCampaign}
            onEditStep={handleStepChange}
          />
        );
      case 5:
        return (
          <ResultsStep
            campaignConfig={campaignConfig}
            selectedLocations={effectiveSelectedLocations}
            generationJob={generationJob}
            onBack={handlePreviousStep}
            onRestart={handleRestart}
            onDownloadAll={handleDownloadAll}
            onPreviewFile={handlePreviewFile}
          />
        );
      default:
        return null;
    }
  };

  // If using simplified version, show the original component
  if (useSimplifiedVersion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50 to-indigo-100">
        <SimplifiedCampaignCreator />
      </div>
    );
  }

  return (
    <>
      <AppLayout
        currentStep={currentStep}
        showProgress={true}
        useSimplifiedVersion={false}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </motion.div>
      </AppLayout>

      {/* Modals */}
      <CampaignSettingsModal
        isOpen={showCampaignSettings}
        onClose={() => setShowCampaignSettings(false)}
        campaignConfig={campaignConfig}
        onSave={handleCampaignConfigUpdate}
      />

      <TemplateCreationModal
        isOpen={showTemplateCreationModal}
        onClose={() => setShowTemplateCreationModal(false)}
        isCreating={isCreatingTemplate}
        onCreateTemplate={async (template: CreateTemplateRequest) => {
          setIsCreatingTemplate(true);
          try {
            await createTemplate(template);
            setShowTemplateCreationModal(false);
          } catch (error) {
            console.error('Failed to create template:', error);
          } finally {
            setIsCreatingTemplate(false);
          }
        }}
      />

      <LocationConfigModal
        isOpen={showLocationConfigModal}
        onClose={() => setShowLocationConfigModal(false)}
        location={selectedLocationToConfigure}
        onSave={async (config: LocationConfig) => {
          try {
            await updateLocationConfig(selectedLocationToConfigure!.id, config);
            setShowLocationConfigSuccess(true);
            setConfigSuccessMessage('Location configuration updated successfully');
            
            // Refresh locations
            await refreshLocations();
            
            setTimeout(() => {
              setShowLocationConfigSuccess(false);
              setConfigSuccessMessage('');
            }, 3000);
          } catch (error) {
            setShowLocationConfigError(true);
            setConfigErrorMessage('Failed to update location configuration');
            setTimeout(() => {
              setShowLocationConfigError(false);
              setConfigErrorMessage('');
            }, 3000);
          }
          setShowLocationConfigModal(false);
        }}
      />

      <FilePreview
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
        fileUrl=""
        fileName=""
      />

      {/* Notifications */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={removeNotification}
        position="top-right"
      />

      {/* Success/Error Messages */}
      {showLocationConfigSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {configSuccessMessage}
        </div>
      )}

      {showLocationConfigError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {configErrorMessage}
        </div>
      )}
    </>
  );
}

export default App;
