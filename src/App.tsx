import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
  SparklesIcon,
  CogIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  DocumentIcon
} from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon as DownloadIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { mockApi } from './services/mockApi';
import { supabaseLocationService } from './services/supabaseLocationService';
import { defaultObjectives } from './data/mockData';
import ModernDatePicker from './components/ui/ModernDatePicker';
import TemplateCreationModal from './components/ui/TemplateCreationModal';
import { LocationConfigModal } from './components/ui/LocationConfigModal';
import FilePreview from './components/ui/FilePreview';
import FirstAccessWizard from './components/ui/FirstAccessWizard';
import Select from './components/ui/Select';
import AppHeader from './components/ui/AppHeader';
import ProgressSteps from './components/ui/ProgressSteps';
import type { 
  LocationWithConfig, 
  AdTemplate, 
  GenerationJob, 
  AdConfiguration, 
  CampaignConfiguration,
  CreateTemplateRequest,
  LocationConfig
} from './types';

// Constants
import { generateAdName } from './constants/hardcodedAdValues';

// Add import for the new simplified creator at the top
import SimplifiedCampaignCreator from './components/ui/SimplifiedCampaignCreator';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [locations, setLocations] = useState<LocationWithConfig[]>([]);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [excludedLocationIds, setExcludedLocationIds] = useState<string[]>([]);
  const [useExclusionMode, setUseExclusionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [configurationFilter, setConfigurationFilter] = useState<'all' | 'configured' | 'not-configured'>('all');
  const [generationJob, setGenerationJob] = useState<GenerationJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplateCreationModal, setShowTemplateCreationModal] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showFirstAccessWizard, setShowFirstAccessWizard] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showLocationConfigModal, setShowLocationConfigModal] = useState(false);
  const [selectedLocationToConfigure, setSelectedLocationToConfigure] = useState<LocationWithConfig | null>(null);
  const [useSimplifiedVersion, setUseSimplifiedVersion] = useState(false);

  const [campaignConfig, setCampaignConfig] = useState<CampaignConfiguration>({
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
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [locationsResponse, templatesResponse] = await Promise.all([
          supabaseLocationService.getLocationsWithConfigs(),
          mockApi.getTemplates()
        ]);

        setLocations(locationsResponse);
        setSelectedLocationIds(locationsResponse.map((loc: LocationWithConfig) => loc.id));

        if (templatesResponse.success && templatesResponse.data) {
          setTemplates(templatesResponse.data);
        }

        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (!hasSeenTour) {
          setTimeout(() => setShowFirstAccessWizard(true), 1000);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize with default ad using hard-coded template values
  useEffect(() => {
    if (templates.length > 0 && campaignConfig.ads.length === 0) {
      const defaultAd: AdConfiguration = {
        id: 'ad-1',
        name: generateAdName('Template'), // Auto-generated using reference template
        templateId: templates[0]?.id || '',
        radius: '+4m',
        caption: 'You learn something new everyday', // Fixed from reference template
        additionalNotes: '',
        scheduledDate: '',
        status: 'Paused'
      };
      setCampaignConfig(prev => ({ ...prev, ads: [defaultAd] }));
    }
  }, [templates, campaignConfig.ads.length]);

  // Update date fields when selectedDate changes
  useEffect(() => {
    const date = campaignConfig.selectedDate;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString();
    const scheduledDate = date.toLocaleDateString('en-US');
    
    setCampaignConfig(prev => ({
      ...prev,
      month,
      day,
      ads: prev.ads.map(ad => ({ ...ad, scheduledDate }))
    }));
  }, [campaignConfig.selectedDate]);

  // Track step completion
  useEffect(() => {
    if (currentStep >= 4 && !hasReviewed) {
      setHasReviewed(true);
    }
  }, [currentStep, hasReviewed]);

  // Smart location filtering
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      // Search filter
      const searchMatch = !searchQuery.trim() || 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.state.toLowerCase().includes(searchQuery.toLowerCase());

      // Configuration filter
      const configMatch = configurationFilter === 'all' || 
        (configurationFilter === 'configured' && location.config) ||
        (configurationFilter === 'not-configured' && !location.config);

      return searchMatch && configMatch;
    });
  }, [locations, searchQuery, configurationFilter]);

  // Calculate effective selected locations
  const effectiveSelectedLocations = useMemo(() => {
    if (useExclusionMode) {
      return filteredLocations.filter(loc => !excludedLocationIds.includes(loc.id));
    }
    return filteredLocations.filter(loc => selectedLocationIds.includes(loc.id));
  }, [useExclusionMode, filteredLocations, excludedLocationIds, selectedLocationIds]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCampaigns = effectiveSelectedLocations.length * campaignConfig.ads.length;
    const totalBudget = campaignConfig.budget * totalCampaigns;
    const estimatedReach = totalCampaigns * 15000;
    
    return {
      totalCampaigns,
      totalBudget,
      estimatedReach,
      selectedLocations: effectiveSelectedLocations.length,
      totalAds: campaignConfig.ads.length,
      totalFiles: 1
    };
  }, [effectiveSelectedLocations.length, campaignConfig.ads.length, campaignConfig.budget]);

  // Event handlers
  const toggleLocationSelection = (locationId: string) => {
    if (useExclusionMode) {
      setExcludedLocationIds(prev =>
        prev.includes(locationId)
          ? prev.filter(id => id !== locationId)
          : [...prev, locationId]
      );
    } else {
      setSelectedLocationIds(prev =>
        prev.includes(locationId)
          ? prev.filter(id => id !== locationId)
          : [...prev, locationId]
      );
    }
  };

  const selectAllLocations = () => {
    if (useExclusionMode) {
      setExcludedLocationIds([]);
    } else {
      setSelectedLocationIds(filteredLocations.map(loc => loc.id));
    }
  };

  const clearAllLocations = () => {
    if (useExclusionMode) {
      setExcludedLocationIds(filteredLocations.map(loc => loc.id));
    } else {
      setSelectedLocationIds([]);
    }
  };

  const addNewAd = () => {
    const newAd: AdConfiguration = {
      id: `ad-${Date.now()}`,
      name: `Ad ${campaignConfig.ads.length + 1}`,
      templateId: templates[0]?.id || '',
      radius: '+4m',
      caption: 'Hello World',
      additionalNotes: '',
      scheduledDate: campaignConfig.selectedDate.toLocaleDateString('en-US'),
      status: 'Paused'
    };
    setCampaignConfig(prev => ({ ...prev, ads: [...prev.ads, newAd] }));
  };

  const removeAd = (adId: string) => {
    setCampaignConfig(prev => ({
      ...prev,
      ads: prev.ads.filter(ad => ad.id !== adId)
    }));
  };



  const handleTemplateCreation = async (templateData: CreateTemplateRequest) => {
    setIsCreatingTemplate(true);
    try {
      const response = await mockApi.createTemplate(templateData);
      if (response.success && response.data) {
        setTemplates(prev => [...prev, response.data!]);
        setShowTemplateCreationModal(false);
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const generateCampaigns = async () => {
    if (effectiveSelectedLocations.length === 0 || campaignConfig.ads.length === 0) return;

    setIsLoading(true);
    try {
      const response = await mockApi.generateAds(
        effectiveSelectedLocations.map(loc => loc.id),
        campaignConfig.ads.map(ad => ad.templateId),
        {
          format: 'csv',
          includeHeaders: true,
          customFields: ['radius', 'caption', 'additionalNotes', 'scheduledDate', 'status'],
          fileName: `${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.csv`,
          campaign: campaignConfig
        }
      );

      if (response.success && response.data) {
        setGenerationJob(response.data);
        setHasGenerated(true);
        setCurrentStep(5);
      }
    } catch (error) {
      console.error('Failed to generate campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Progress steps
  const steps = [
    { 
      id: 1, 
      title: 'Locations', 
      icon: MapPinIcon, 
      completed: effectiveSelectedLocations.length > 0,
      description: 'Select target locations'
    },
    { 
      id: 2, 
      title: 'Campaigns', 
      icon: CogIcon, 
      completed: campaignConfig.prefix !== '',
      description: 'Configure campaigns'
    },
    { 
      id: 3, 
      title: 'Ads', 
      icon: DocumentIcon, 
      completed: campaignConfig.ads.length > 0,
      description: 'Create ads for campaigns'
    },
    { 
      id: 4, 
      title: 'Review', 
      icon: EyeIcon, 
      completed: hasReviewed || currentStep > 4,
      description: 'Preview & validate'
    },
    { 
      id: 5, 
      title: 'Generate', 
      icon: SparklesIcon, 
      completed: hasGenerated || generationJob?.status === 'completed',
      description: 'Export campaigns'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 bg-size-[400%_400%] animate-gradient-shift flex items-center justify-center">
        <motion.div
          className="card-premium rounded-3xl p-10 shadow-elegant max-w-sm mx-auto text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="w-20 h-20 rounded-full mx-auto mb-6 bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">
            Loading Ad Tools
          </h2>
          <p className="text-neutral-600">
            Preparing your professional workspace...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 bg-size-[400%_400%] animate-gradient-shift">
      <div className="flex-1 p-6 relative z-10 pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* App Header */}
          <AppHeader 
            onSettingsClick={() => setShowSettings(!showSettings)} 
            useSimplifiedVersion={useSimplifiedVersion}
            onVersionToggle={() => setUseSimplifiedVersion(!useSimplifiedVersion)}
          />

          {/* Progress Steps - only show in professional mode */}
          {!useSimplifiedVersion && (
            <ProgressSteps
              currentStep={currentStep}
              steps={steps}
              onStepClick={(stepId) => setCurrentStep(stepId)}
            />
          )}

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            {useSimplifiedVersion ? (
              <SimplifiedCampaignCreator />
            ) : (
              <>
                {currentStep === 1 && (
                  <motion.div
                    key="locations"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="max-w-4xl mx-auto"
                  >
                    <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
                      <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
                          Select Target Locations
                        </h2>
                        <p className="text-neutral-600 text-lg">
                          Choose the locations where your campaigns will run. You can select individual locations or use exclusion mode.
                        </p>
                      </div>

                      {/* Location Search */}
                      <div className="mb-6">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search locations by name, city, or state..."
                          className="w-full px-6 py-4 border-2 border-neutral-200 rounded-2xl text-base bg-white/90 backdrop-blur-xl transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 focus:outline-none hover:bg-white"
                        />
                      </div>

                      {/* Configuration Filter */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-neutral-700">Filter by configuration:</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => setConfigurationFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                              configurationFilter === 'all'
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'bg-white/90 backdrop-blur-xl text-neutral-700 border-2 border-neutral-200 hover:border-primary-300 hover:bg-white'
                            }`}
                          >
                            All Locations ({locations.length})
                          </button>
                          <button
                            onClick={() => setConfigurationFilter('configured')}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                              configurationFilter === 'configured'
                                ? 'bg-success-500 text-white shadow-lg shadow-success-500/25'
                                : 'bg-white/90 backdrop-blur-xl text-neutral-700 border-2 border-neutral-200 hover:border-success-300 hover:bg-white'
                            }`}
                          >
                            Configured ({locations.filter(l => l.config).length})
                          </button>
                          <button
                            onClick={() => setConfigurationFilter('not-configured')}
                            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                              configurationFilter === 'not-configured'
                                ? 'bg-warning-500 text-white shadow-lg shadow-warning-500/25'
                                : 'bg-white/90 backdrop-blur-xl text-neutral-700 border-2 border-neutral-200 hover:border-warning-300 hover:bg-white'
                            }`}
                          >
                            Not Configured ({locations.filter(l => !l.config).length})
                          </button>
                        </div>
                        {(searchQuery || configurationFilter !== 'all') && (
                          <div className="mt-2 text-sm text-gray-500">
                            Showing {filteredLocations.length} of {locations.length} locations
                          </div>
                        )}
                      </div>

                      {/* Exclusion Mode Toggle */}
                      <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-2xl">
                        <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-primary-800">
                          <input
                            type="checkbox"
                            checked={useExclusionMode}
                            onChange={(e) => setUseExclusionMode(e.target.checked)}
                            className="w-4 h-4 accent-primary-500 rounded"
                          />
                          Use exclusion mode (select locations to exclude instead)
                        </label>
                      </div>

                      {/* Bulk Actions */}
                      <div className="flex gap-4 mb-6 flex-wrap">
                        <button
                          onClick={selectAllLocations}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Select All
                        </button>
                        <button
                          onClick={clearAllLocations}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-error-300 hover:text-error-600 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 text-sm"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Clear All
                        </button>
                      </div>

                      {/* Locations List */}
                      <div className="max-h-96 overflow-y-auto border border-neutral-200 rounded-2xl bg-white/95 backdrop-blur-xl shadow-professional">
                        {filteredLocations.map((location, index) => {
                          const isSelected = useExclusionMode 
                            ? !excludedLocationIds.includes(location.id)
                            : selectedLocationIds.includes(location.id);

                          return (
                            <motion.div
                              key={location.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              onClick={() => toggleLocationSelection(location.id)}
                              className={`flex items-center justify-between py-3 px-4 cursor-pointer transition-all duration-300 text-sm hover:bg-primary-50 ${
                                index !== filteredLocations.length - 1 ? 'border-b border-neutral-100' : ''
                              } ${isSelected ? 'bg-primary-50' : ''}`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-4 h-4 rounded border-2 transition-all duration-300 flex items-center justify-center ${
                                  isSelected 
                                    ? 'border-primary-500 bg-primary-500' 
                                    : 'border-neutral-300'
                                }`}>
                                  {isSelected && (
                                    <CheckCircleIcon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium text-neutral-800">{location.name}</div>
                                    {location.config && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Configured
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-neutral-500 mt-1">
                                    {location.city}, {location.state} • {location.phoneNumber}
                                    {location.config && location.config.budget && (
                                      <span className="ml-2 text-primary-600 font-medium">
                                        Budget: ${location.config.budget.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                  {location.config && location.config.notes && (
                                    <div className="text-xs text-neutral-400 mt-1 italic truncate">
                                      "{location.config.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-neutral-600 text-xs flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span>{location.city}, {location.state}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-accent-600 font-mono">
                                    {location.config ? (
                                      <>
                                        {location.config.primaryLat && location.config.primaryLng ? (
                                          <>
                                            <span>{location.config.primaryLat.toFixed(4)}, {location.config.primaryLng.toFixed(4)}</span>
                                            {location.config.radiusMiles && (
                                              <>
                                                <span className="text-neutral-400">•</span>
                                                <span className="text-warning-600">{location.config.radiusMiles}mi</span>
                                              </>
                                            )}
                                            {location.config.coordinateList && location.config.coordinateList.length > 0 && (
                                              <>
                                                <span className="text-neutral-400">•</span>
                                                <span className="text-success-600">+{location.config.coordinateList.length} points</span>
                                              </>
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            <span>{location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</span>
                                            <span className="text-neutral-400">• default</span>
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <span>{location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}</span>
                                        <span className="text-neutral-400">• unconfigured</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLocationToConfigure(location);
                                    setShowLocationConfigModal(true);
                                  }}
                                  className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors duration-300"
                                  title="Configure location settings"
                                >
                                  <CogIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Selection Summary */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-2xl">
                        <div className="text-sm font-semibold text-primary-800 mb-1">
                          {useExclusionMode ? 'Exclusion Mode:' : 'Selection Mode:'}
                        </div>
                        <div className="text-sm text-primary-700">
                          {effectiveSelectedLocations.length} locations selected for campaigns
                        </div>
                      </div>

                      {/* Continue Button */}
                      <div className="flex justify-end mt-8">
                        <button
                          className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/25 transition-all duration-300 hover:from-primary-600 hover:to-primary-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg ${
                            effectiveSelectedLocations.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => setCurrentStep(2)}
                          disabled={effectiveSelectedLocations.length === 0}
                        >
                          Continue to Campaigns
                          <ArrowRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="campaigns"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="max-w-4xl mx-auto"
                  >
                    <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
                      <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
                          Campaign Configuration
                        </h2>
                        <p className="text-neutral-600 text-lg">
                          Set up your Meta campaign parameters. These settings will be applied to all generated campaigns.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                          <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                            Campaign Prefix
                          </label>
                          <input
                            type="text"
                            value={campaignConfig.prefix}
                            onChange={(e) => setCampaignConfig(prev => ({ ...prev, prefix: e.target.value }))}
                            className="w-full px-6 py-4 border-2 border-neutral-200 rounded-2xl text-base bg-white/90 backdrop-blur-xl transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 focus:outline-none hover:bg-white"
                            placeholder="EWC_Meta_"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                            Platform
                          </label>
                          <Select
                            value={campaignConfig.platform}
                            onChange={(value) => setCampaignConfig(prev => ({ ...prev, platform: value }))}
                            options={[
                              { value: 'Meta', label: 'Meta' },
                              { value: 'Facebook', label: 'Facebook' },
                              { value: 'Instagram', label: 'Instagram' }
                            ]}
                            label=""
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                            Campaign Date
                          </label>
                          <ModernDatePicker
                            value={campaignConfig.selectedDate}
                            onChange={(date: Date) => setCampaignConfig(prev => ({ ...prev, selectedDate: date }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                          <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                            Campaign Objective
                          </label>
                          <Select
                            value={campaignConfig.objective}
                            onChange={(value) => setCampaignConfig(prev => ({ ...prev, objective: value }))}
                            options={defaultObjectives.map(obj => ({ value: obj.value, label: obj.label }))}
                            label=""
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                            Budget per Campaign ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={campaignConfig.budget}
                            onChange={(e) => setCampaignConfig(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                            className="w-full px-6 py-4 border-2 border-neutral-200 rounded-2xl text-base bg-white/90 backdrop-blur-xl transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 focus:outline-none hover:bg-white"
                            placeholder="92.69"
                          />
                        </div>
                      </div>

                      {/* Continue Button */}
                      <div className="flex justify-between mt-8">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                        >
                          <ArrowRightIcon className="w-4 h-4 rotate-180" />
                          Back to Locations
                        </button>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/25 transition-all duration-300 hover:from-primary-600 hover:to-primary-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg"
                        >
                          Continue to Ads
                          <ArrowRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="ads"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="max-w-6xl mx-auto"
                  >
                    <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
                      <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
                          Ad Configuration
                        </h2>
                        <p className="text-neutral-600 text-lg">
                          Create multiple ad variations for your campaigns. Each ad will be deployed to all selected locations.
                        </p>
                      </div>

                      {/* Add New Ad Button */}
                      <div className="mb-6">
                        <button
                          onClick={addNewAd}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success-500 to-success-600 text-white font-semibold rounded-2xl shadow-lg shadow-success-500/25 transition-all duration-300 hover:from-success-600 hover:to-success-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-success-500/30 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
                        >
                          <PlusIcon className="w-5 h-5" />
                          Add New Ad
                        </button>
                      </div>

                      {/* Ads List */}
                      <div className="space-y-6 mb-8">
                        {campaignConfig.ads.map((ad, index) => (
                                              <motion.div
                          key={ad.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/90 backdrop-blur-xl border border-neutral-200 rounded-3xl p-8 shadow-professional transition-all duration-300 hover:shadow-elegant hover:border-primary-300"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-semibold text-neutral-800">
                              {ad.name}
                            </h3>
                            <button
                              onClick={() => removeAd(ad.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-white/90 backdrop-blur-xl text-neutral-700 rounded-xl border border-neutral-200 shadow-lg shadow-black/5 hover:border-error-500 hover:text-error-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Ad Name <span className="text-gray-500 text-xs">(Auto-generated)</span>
                            </label>
                            <input
                              type="text"
                              value={ad.name}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                              title="This field is auto-generated based on the reference template and location"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Title <span className="text-gray-500 text-xs">(Fixed from template)</span>
                            </label>
                            <input
                              type="text"
                              value="Get your First Wax Free"
                              readOnly
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                              title="This field uses the fixed value from the reference template"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Caption <span className="text-gray-500 text-xs">(Fixed from template)</span>
                            </label>
                            <input
                              type="text"
                              value="You learn something new everyday"
                              readOnly
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                              title="This field uses the fixed value from the reference template"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Call to Action <span className="text-gray-500 text-xs">(Fixed from template)</span>
                            </label>
                            <input
                              type="text"
                              value="BOOK_TRAVEL"
                              readOnly
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                              title="This field uses the fixed value from the reference template"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                    >
                      <ArrowRightIcon className="w-4 h-4 rotate-180" />
                      Back to Campaigns
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/25 transition-all duration-300 hover:from-primary-600 hover:to-primary-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-lg ${
                        campaignConfig.ads.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={campaignConfig.ads.length === 0}
                    >
                      Continue to Review
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="review"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-6xl mx-auto"
              >
                <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
                      Review & Generate
                    </h2>
                    <p className="text-neutral-600 text-lg">
                      Review your campaign configuration before generating the final export file.
                    </p>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
                    <motion.div 
                      className="bg-gradient-to-br from-primary-50/80 to-white/90 backdrop-blur-xl border border-primary-200 rounded-3xl p-8 text-center relative overflow-hidden shadow-professional"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-t-3xl"></div>
                      <MapPinIcon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                      <div className="text-4xl font-extrabold text-neutral-800 mb-1 leading-none">{stats.selectedLocations}</div>
                      <div className="text-neutral-600 font-medium text-sm uppercase tracking-wider">Locations</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-accent-50/80 to-white/90 backdrop-blur-xl border border-accent-200 rounded-3xl p-8 text-center relative overflow-hidden shadow-professional"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 to-primary-500 rounded-t-3xl"></div>
                      <DocumentIcon className="w-8 h-8 text-accent-600 mx-auto mb-3" />
                      <div className="text-4xl font-extrabold text-neutral-800 mb-1 leading-none">{stats.totalAds}</div>
                      <div className="text-neutral-600 font-medium text-sm uppercase tracking-wider">Ad Variations</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-success-50/80 to-white/90 backdrop-blur-xl border border-success-200 rounded-3xl p-8 text-center relative overflow-hidden shadow-professional"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success-500 to-primary-500 rounded-t-3xl"></div>
                      <ChartBarIcon className="w-8 h-8 text-success-600 mx-auto mb-3" />
                      <div className="text-4xl font-extrabold text-neutral-800 mb-1 leading-none">{stats.totalCampaigns.toLocaleString()}</div>
                      <div className="text-neutral-600 font-medium text-sm uppercase tracking-wider">Total Campaigns</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-info-50/80 to-white/90 backdrop-blur-xl border border-info-200 rounded-3xl p-8 text-center relative overflow-hidden shadow-professional"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-info-500 to-accent-500 rounded-t-3xl"></div>
                      <DocumentDuplicateIcon className="w-8 h-8 text-info-600 mx-auto mb-3" />
                      <div className="text-4xl font-extrabold text-neutral-800 mb-1 leading-none">{stats.totalFiles}</div>
                      <div className="text-neutral-600 font-medium text-sm uppercase tracking-wider">CSV File</div>
                    </motion.div>
                  </div>

                  {/* What will be generated */}
                  <div className="bg-white/90 backdrop-blur-xl border border-neutral-200 rounded-3xl p-8 mb-8 shadow-professional">
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">
                      What will be generated:
                    </h3>
                    <div className="space-y-3">
                      {[
                        `${stats.totalFiles} comprehensive CSV file containing all campaigns`,
                        `${stats.totalCampaigns.toLocaleString()} total Meta campaign configurations`,
                        'Complete 73-column campaign import format',
                        `File name: ${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.csv`,
                        'Location-specific targeting coordinates and demographics',
                        'All ad variations organized in a single file',
                        'Ready for Meta Ads Manager bulk import'
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CheckCircleIcon className="w-5 h-5 text-success-500 flex-shrink-0" />
                          <span className="text-neutral-700">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-between items-center">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                      >
                        <ArrowRightIcon className="w-4 h-4 rotate-180" />
                        Back to Ads
                      </button>
                      
                      <button
                        onClick={() => setShowFilePreview(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-primary-300 hover:text-primary-600 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Preview Data
                      </button>
                    </div>

                    <button
                      onClick={generateCampaigns}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-success-600 font-semibold rounded-xl border-2 border-success-500 transition-all duration-300 hover:text-success-700 hover:border-success-600 hover:bg-success-50 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && generationJob && (
              <motion.div
                key="results"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-2xl mx-auto"
              >
                <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="w-24 h-24 bg-gradient-to-r from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-success-500/30"
                  >
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-success-600 to-success-500 bg-clip-text text-transparent mb-4">
                    Campaigns Generated Successfully!
                  </h2>
                  
                  <p className="text-neutral-600 text-lg mb-8">
                    Your campaign file has been generated and is ready for download.
                  </p>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mb-8">
                    <div className="text-sm font-semibold text-neutral-700 mb-2">Generated File:</div>
                    <div className="font-mono text-sm text-neutral-600 break-all">
                      {generationJob.options?.fileName || 'Campaign_Export.csv'}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        // Reset to start over
                        setCurrentStep(1);
                        setGenerationJob(null);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
                    >
                      Create New Campaign
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          // Download the file using the mock API
                          const response = await mockApi.downloadGeneratedFile(generationJob.id);
                          if (response.success && response.data) {
                            const url = URL.createObjectURL(response.data);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = generationJob.options?.fileName || 'Campaign_Export.csv';
                            link.click();
                            URL.revokeObjectURL(url);
                          } else {
                            console.error('Failed to download file:', response.error);
                          }
                        } catch (error) {
                          console.error('Download error:', error);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-success-500 to-success-600 text-white font-semibold rounded-2xl shadow-lg shadow-success-500/25 transition-all duration-300 hover:from-success-600 hover:to-success-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-success-500/30 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 text-lg"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      Download File
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
              </>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-24 right-6 w-80 card-premium rounded-3xl p-6 shadow-elegant z-40"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-neutral-800">Quick Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all duration-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSelectedLocationIds([]);
                    setExcludedLocationIds([]);
                    setCampaignConfig(prev => ({ ...prev, ads: [] }));
                    setCurrentStep(1);
                    setShowSettings(false);
                  }}
                  className="w-full inline-flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-xl text-neutral-700 font-semibold rounded-xl border border-neutral-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-error-500 hover:text-error-600 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 text-sm"
                >
                  Reset All Selections
                </button>
                
                <button
                  onClick={() => {
                    setShowFirstAccessWizard(true);
                    setShowSettings(false);
                  }}
                  className="w-full inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-300 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
                >
                  <PlayIcon className="w-4 h-4" />
                  Take Tour
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <FilePreview
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
        locations={effectiveSelectedLocations}
        ads={campaignConfig.ads}
        campaign={campaignConfig}
        title="Campaign Data Preview"
      />

      <TemplateCreationModal
        isOpen={showTemplateCreationModal}
        onClose={() => setShowTemplateCreationModal(false)}
        onSubmit={handleTemplateCreation}
        isSubmitting={isCreatingTemplate}
      />

      <FirstAccessWizard
        isOpen={showFirstAccessWizard}
        onClose={() => setShowFirstAccessWizard(false)}
        onComplete={() => {
          setShowFirstAccessWizard(false);
          localStorage.setItem('hasSeenTour', 'true');
        }}
      />

      {selectedLocationToConfigure && (
        <LocationConfigModal
          isOpen={showLocationConfigModal}
          onClose={() => {
            setShowLocationConfigModal(false);
            setSelectedLocationToConfigure(null);
          }}
          location={selectedLocationToConfigure}
          config={selectedLocationToConfigure.config}
          onSave={(updatedConfig: LocationConfig) => {
            // Update the location in the locations array
            setLocations(prev => prev.map(loc => 
              loc.id === updatedConfig.locationId ? { ...loc, config: updatedConfig } : loc
            ));
            setShowLocationConfigModal(false);
            setSelectedLocationToConfigure(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
