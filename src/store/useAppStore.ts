import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  LocationWithConfig,
  AdTemplate,
  GenerationJob,
  AdConfiguration,
  CampaignConfiguration,
  LocationConfig
} from '../types';

interface AppState {
  // Step management
  currentStep: number;
  useSimplifiedVersion: boolean;
  
  // Data state
  locations: LocationWithConfig[];
  templates: AdTemplate[];
  selectedLocationIds: string[];
  excludedLocationIds: string[];
  useExclusionMode: boolean;
  
  // Campaign configuration
  campaignConfig: CampaignConfiguration;
  
  // Generation state
  generationJob: GenerationJob | null;
  isLoading: boolean;
  
  // Modal states
  showCampaignSettings: boolean;
  showTemplateCreationModal: boolean;
  isCreatingTemplate: boolean;
  showFilePreview: boolean;
  showLocationConfigModal: boolean;
  selectedLocationToConfigure: LocationWithConfig | null;
  
  // Success/Error states
  showLocationConfigSuccess: boolean;
  configSuccessMessage: string;
  showLocationConfigError: boolean;
  configErrorMessage: string;
}

interface AppActions {
  // Step management
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setUseSimplifiedVersion: (useSimplified: boolean) => void;
  
  // Data management
  setLocations: (locations: LocationWithConfig[]) => void;
  setTemplates: (templates: AdTemplate[]) => void;
  setSelectedLocationIds: (ids: string[]) => void;
  setExcludedLocationIds: (ids: string[]) => void;
  setUseExclusionMode: (useExclusion: boolean) => void;
  
  // Campaign configuration
  setCampaignConfig: (config: CampaignConfiguration) => void;
  updateCampaignConfig: (updates: Partial<CampaignConfiguration>) => void;
  
  // Generation management
  setGenerationJob: (job: GenerationJob | null) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Modal management
  setShowCampaignSettings: (show: boolean) => void;
  setShowTemplateCreationModal: (show: boolean) => void;
  setIsCreatingTemplate: (creating: boolean) => void;
  setShowFilePreview: (show: boolean) => void;
  setShowLocationConfigModal: (show: boolean) => void;
  setSelectedLocationToConfigure: (location: LocationWithConfig | null) => void;
  
  // Success/Error management
  setShowLocationConfigSuccess: (show: boolean) => void;
  setConfigSuccessMessage: (message: string) => void;
  setShowLocationConfigError: (show: boolean) => void;
  setConfigErrorMessage: (message: string) => void;
  
  // Utility actions
  resetToDefaults: () => void;
  addAd: (ad: AdConfiguration) => void;
  removeAd: (adId: string) => void;
  updateAd: (adId: string, updates: Partial<AdConfiguration>) => void;
  toggleLocationSelection: (locationId: string) => void;
  selectAllLocations: () => void;
  clearAllLocations: () => void;
}

const defaultCampaignConfig: CampaignConfiguration = {
  prefix: 'EWC',
  platform: 'Meta',
  selectedDate: new Date('2025-06-25'),
  month: 'June',
  day: '25',
  objective: 'Engagement',
  testType: 'LocalTest',
  duration: 'Evergreen',
  budget: 92.69,
  bidStrategy: 'Highest volume or value',
  startDate: '06/26/2025 2:32:00 am',
  endDate: '07/26/2025 11:59:00 pm',
  ads: [],
  radius: 5
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentStep: 1,
        useSimplifiedVersion: false,
        locations: [],
        templates: [],
        selectedLocationIds: [],
        excludedLocationIds: [],
        useExclusionMode: false,
        campaignConfig: defaultCampaignConfig,
        generationJob: null,
        isLoading: false,
        showCampaignSettings: false,
        showTemplateCreationModal: false,
        isCreatingTemplate: false,
        showFilePreview: false,
        showLocationConfigModal: false,
        selectedLocationToConfigure: null,
        showLocationConfigSuccess: false,
        configSuccessMessage: '',
        showLocationConfigError: false,
        configErrorMessage: '',

        // Step management
        setCurrentStep: (step) => set({ currentStep: step }),
        nextStep: () => {
          const { currentStep } = get();
          if (currentStep < 5) {
            set({ currentStep: currentStep + 1 });
          }
        },
        previousStep: () => {
          const { currentStep } = get();
          if (currentStep > 1) {
            set({ currentStep: currentStep - 1 });
          }
        },
        setUseSimplifiedVersion: (useSimplified) => set({ useSimplifiedVersion: useSimplified }),

        // Data management
        setLocations: (locations) => set({ locations }),
        setTemplates: (templates) => set({ templates }),
        setSelectedLocationIds: (ids) => set({ selectedLocationIds: ids }),
        setExcludedLocationIds: (ids) => set({ excludedLocationIds: ids }),
        setUseExclusionMode: (useExclusion) => {
          set({ useExclusionMode: useExclusion });
          if (useExclusion) {
            set({ excludedLocationIds: [] });
          } else {
            set({ selectedLocationIds: [] });
          }
        },

        // Campaign configuration
        setCampaignConfig: (config) => set({ campaignConfig: config }),
        updateCampaignConfig: (updates) => {
          const { campaignConfig } = get();
          set({ campaignConfig: { ...campaignConfig, ...updates } });
        },

        // Generation management
        setGenerationJob: (job) => set({ generationJob: job }),
        setIsLoading: (loading) => set({ isLoading: loading }),

        // Modal management
        setShowCampaignSettings: (show) => set({ showCampaignSettings: show }),
        setShowTemplateCreationModal: (show) => set({ showTemplateCreationModal: show }),
        setIsCreatingTemplate: (creating) => set({ isCreatingTemplate: creating }),
        setShowFilePreview: (show) => set({ showFilePreview: show }),
        setShowLocationConfigModal: (show) => set({ showLocationConfigModal: show }),
        setSelectedLocationToConfigure: (location) => set({ selectedLocationToConfigure: location }),

        // Success/Error management
        setShowLocationConfigSuccess: (show) => set({ showLocationConfigSuccess: show }),
        setConfigSuccessMessage: (message) => set({ configSuccessMessage: message }),
        setShowLocationConfigError: (show) => set({ showLocationConfigError: show }),
        setConfigErrorMessage: (message) => set({ configErrorMessage: message }),

        // Utility actions
        resetToDefaults: () => set({
          currentStep: 1,
          campaignConfig: defaultCampaignConfig,
          selectedLocationIds: [],
          excludedLocationIds: [],
          useExclusionMode: false,
          generationJob: null,
          isLoading: false
        }),

        addAd: (ad) => {
          const { campaignConfig } = get();
          set({
            campaignConfig: {
              ...campaignConfig,
              ads: [...campaignConfig.ads, ad]
            }
          });
        },

        removeAd: (adId) => {
          const { campaignConfig } = get();
          if (campaignConfig.ads.length > 1) {
            set({
              campaignConfig: {
                ...campaignConfig,
                ads: campaignConfig.ads.filter(ad => ad.id !== adId)
              }
            });
          }
        },

        updateAd: (adId, updates) => {
          const { campaignConfig } = get();
          set({
            campaignConfig: {
              ...campaignConfig,
              ads: campaignConfig.ads.map(ad =>
                ad.id === adId ? { ...ad, ...updates } : ad
              )
            }
          });
        },

        toggleLocationSelection: (locationId) => {
          const { useExclusionMode, selectedLocationIds, excludedLocationIds } = get();
          if (useExclusionMode) {
            const newExcludedIds = excludedLocationIds.includes(locationId)
              ? excludedLocationIds.filter(id => id !== locationId)
              : [...excludedLocationIds, locationId];
            set({ excludedLocationIds: newExcludedIds });
          } else {
            const newSelectedIds = selectedLocationIds.includes(locationId)
              ? selectedLocationIds.filter(id => id !== locationId)
              : [...selectedLocationIds, locationId];
            set({ selectedLocationIds: newSelectedIds });
          }
        },

        selectAllLocations: () => {
          const { locations, useExclusionMode } = get();
          if (useExclusionMode) {
            set({ excludedLocationIds: [] });
          } else {
            set({ selectedLocationIds: locations.map(loc => loc.id) });
          }
        },

        clearAllLocations: () => {
          const { locations, useExclusionMode } = get();
          if (useExclusionMode) {
            set({ excludedLocationIds: locations.map(loc => loc.id) });
          } else {
            set({ selectedLocationIds: [] });
          }
        }
      }),
      {
        name: 'ewc-ad-tools-store',
        partialize: (state) => ({
          currentStep: state.currentStep,
          useSimplifiedVersion: state.useSimplifiedVersion,
          campaignConfig: state.campaignConfig,
          selectedLocationIds: state.selectedLocationIds,
          excludedLocationIds: state.excludedLocationIds,
          useExclusionMode: state.useExclusionMode
        })
      }
    ),
    {
      name: 'ewc-ad-tools-store'
    }
  )
);

// Selector hooks for better performance
export const useCurrentStep = () => useAppStore(state => state.currentStep);
export const useLocations = () => useAppStore(state => state.locations);
export const useTemplates = () => useAppStore(state => state.templates);
export const useCampaignConfig = () => useAppStore(state => state.campaignConfig);
export const useGenerationJob = () => useAppStore(state => state.generationJob);
export const useIsLoading = () => useAppStore(state => state.isLoading);

// Computed selectors
export const useEffectiveSelectedLocations = () => {
  const locations = useLocations();
  const selectedLocationIds = useAppStore(state => state.selectedLocationIds);
  const excludedLocationIds = useAppStore(state => state.excludedLocationIds);
  const useExclusionMode = useAppStore(state => state.useExclusionMode);

  if (useExclusionMode) {
    return locations.filter(loc => !excludedLocationIds.includes(loc.id));
  }
  return locations.filter(loc => selectedLocationIds.includes(loc.id));
};

export const useStepNavigation = () => {
  const currentStep = useCurrentStep();
  const setCurrentStep = useAppStore(state => state.setCurrentStep);
  const nextStep = useAppStore(state => state.nextStep);
  const previousStep = useAppStore(state => state.previousStep);

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === 5,
    canGoNext: currentStep < 5,
    canGoPrevious: currentStep > 1
  };
};