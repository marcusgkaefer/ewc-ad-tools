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
import { ArrowDownTrayIcon as DownloadIcon } from '@heroicons/react/24/outline';
import { mockApi } from './services/mockApi';
import { defaultObjectives } from './data/mockData';
import ModernDatePicker from './components/ui/ModernDatePicker';
// TEMPORARILY COMMENTED OUT
// import TemplateSelector from './components/ui/TemplateSelector';
import TemplateCreationModal from './components/ui/TemplateCreationModal';
import FilePreview from './components/ui/FilePreview';
import FirstAccessWizard from './components/ui/FirstAccessWizard';
import Select from './components/ui/Select';
import AppHeader from './components/ui/AppHeader';
import ProgressSteps from './components/ui/ProgressSteps';
import type { 
  LocationSummary as Location, 
  AdTemplate, 
  GenerationJob, 
  CampaignConfiguration,
  AdConfiguration,
  CreateTemplateRequest
} from './types';

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [excludedLocationIds, setExcludedLocationIds] = useState<string[]>([]);
  const [useExclusionMode, setUseExclusionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generationJob, setGenerationJob] = useState<GenerationJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplateCreationModal, setShowTemplateCreationModal] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showFirstAccessWizard, setShowFirstAccessWizard] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

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
          mockApi.getLocations(1, 1000),
          mockApi.getTemplates()
        ]);

        if (locationsResponse.success && locationsResponse.data) {
          setLocations(locationsResponse.data.items);
          setSelectedLocationIds(locationsResponse.data.items.map(loc => loc.id));
        }

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

  // Initialize with default ad
  useEffect(() => {
    if (templates.length > 0 && campaignConfig.ads.length === 0) {
      const defaultAd: AdConfiguration = {
        id: 'ad-1',
        name: 'Ad 1',
        templateId: templates[0]?.id || '',
        landingPage: 'www.waxcenter.com',
        radius: '+4m',
        caption: 'Hello World',
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
    if (!searchQuery.trim()) return locations;
    const query = searchQuery.toLowerCase();
    return locations.filter(location =>
      location.name.toLowerCase().includes(query) ||
      location.city.toLowerCase().includes(query) ||
      location.state.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

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
      landingPage: 'www.waxcenter.com',
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

  const updateAd = (adId: string, updates: Partial<AdConfiguration>) => {
    setCampaignConfig(prev => ({
      ...prev,
      ads: prev.ads.map(ad => ad.id === adId ? { ...ad, ...updates } : ad)
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
          format: 'excel',
          includeHeaders: true,
          customFields: ['landingPage', 'radius', 'caption', 'additionalNotes', 'scheduledDate', 'status'],
          fileName: `${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.xlsx`,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-blue-500 bg-size-[400%_400%] animate-gradient-shift flex items-center justify-center">
        <motion.div
          className="bg-white/95 border border-white/20 rounded-2xl p-8 shadow-xl max-w-sm mx-auto text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="w-20 h-20 rounded-full mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Campaign Creator
          </h2>
          <p className="text-gray-600">
            Preparing your creative workspace...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-blue-500 bg-size-[400%_400%] animate-gradient-shift">
      <div className="flex-1 p-6 relative z-10 pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* App Header */}
          <AppHeader onSettingsClick={() => setShowSettings(!showSettings)} />

          {/* Progress Steps */}
          <ProgressSteps
            currentStep={currentStep}
            steps={steps}
            onStepClick={(stepId) => setCurrentStep(stepId)}
          />

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="locations"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white/95 border border-white/20 rounded-2xl p-8 shadow-xl transition-shadow duration-200 hover:shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
                      Select Target Locations
                    </h2>
                    <p className="text-gray-600 text-lg">
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:-translate-y-0.5 focus:outline-none"
                    />
                  </div>

                  {/* Exclusion Mode Toggle */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-blue-800">
                      <input
                        type="checkbox"
                        checked={useExclusionMode}
                        onChange={(e) => setUseExclusionMode(e.target.checked)}
                        className="w-4 h-4 accent-blue-500 rounded"
                      />
                      Use exclusion mode (select locations to exclude instead)
                    </label>
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex gap-4 mb-6 flex-wrap">
                    <button
                      onClick={selectAllLocations}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-blue-500 hover:text-blue-600 hover:-translate-y-0.5 hover:shadow-lg text-sm"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Select All
                    </button>
                    <button
                      onClick={clearAllLocations}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-red-500 hover:text-red-600 hover:-translate-y-0.5 hover:shadow-lg text-sm"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>

                  {/* Locations List */}
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-inner">
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
                          className={`flex items-center justify-between py-3 px-4 cursor-pointer transition-all duration-200 text-sm hover:bg-blue-50 ${
                            index !== filteredLocations.length - 1 ? 'border-b border-gray-100' : ''
                          } ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <CheckCircleIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="font-medium text-gray-800">{location.name}</div>
                          </div>
                          <div className="text-gray-600 text-xs flex items-center gap-2">
                            <span>{location.city}, {location.state}</span>
                            <span className="text-gray-400">•</span>
                            <span>{location.zipCode}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Selection Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                    <div className="text-sm font-semibold text-blue-800 mb-1">
                      {useExclusionMode ? 'Exclusion Mode:' : 'Selection Mode:'}
                    </div>
                    <div className="text-sm text-blue-700">
                      {effectiveSelectedLocations.length} locations selected for campaigns
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="flex justify-end mt-8">
                    <button
                      className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg ${
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
                <div className="bg-white/95 border border-white/20 rounded-2xl p-8 shadow-xl transition-shadow duration-200 hover:shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
                      Campaign Configuration
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Set up your Meta campaign parameters. These settings will be applied to all generated campaigns.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="block font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Campaign Prefix
                      </label>
                      <input
                        type="text"
                        value={campaignConfig.prefix}
                        onChange={(e) => setCampaignConfig(prev => ({ ...prev, prefix: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:-translate-y-0.5 focus:outline-none"
                        placeholder="EWC_Meta_"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block font-semibold text-gray-700 text-sm uppercase tracking-wide">
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
                      <label className="block font-semibold text-gray-700 text-sm uppercase tracking-wide">
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
                      <label className="block font-semibold text-gray-700 text-sm uppercase tracking-wide">
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
                      <label className="block font-semibold text-gray-700 text-sm uppercase tracking-wide">
                        Budget per Campaign ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={campaignConfig.budget}
                        onChange={(e) => setCampaignConfig(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:-translate-y-0.5 focus:outline-none"
                        placeholder="92.69"
                      />
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <ArrowRightIcon className="w-4 h-4 rotate-180" />
                      Back to Locations
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg"
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
                <div className="bg-white/95 border border-white/20 rounded-2xl p-8 shadow-xl transition-shadow duration-200 hover:shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
                      Ad Configuration
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Create multiple ad variations for your campaigns. Each ad will be deployed to all selected locations.
                    </p>
                  </div>

                  {/* Add New Ad Button */}
                  <div className="mb-6">
                    <button
                      onClick={addNewAd}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-xl"
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
                        className="bg-white/70 border-2 border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:border-blue-300"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="text-xl font-semibold text-gray-800">
                            {ad.name}
                          </h3>
                          <button
                            onClick={() => removeAd(ad.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-red-500 hover:text-red-600 transition-all duration-200"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Ad Name
                            </label>
                            <input
                              type="text"
                              value={ad.name}
                              onChange={(e) => updateAd(ad.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200"
                            />
                          </div>

                          {/* TEMPORARILY COMMENTED OUT - Templates Section */}
                          {/* <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Template
                            </label>
                            <TemplateSelector
                              templates={templates}
                              selectedTemplateId={ad.templateId}
                              onTemplateSelect={(templateId: string) => updateAd(ad.id, { templateId })}
                              onCreateTemplate={() => setShowTemplateCreationModal(true)}
                            />
                          </div> */}

                          <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Landing Page
                            </label>
                            <input
                              type="text"
                              value={ad.landingPage}
                              onChange={(e) => updateAd(ad.id, { landingPage: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block font-semibold text-gray-700 text-sm">
                              Caption
                            </label>
                            <input
                              type="text"
                              value={ad.caption}
                              onChange={(e) => updateAd(ad.id, { caption: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* TEMPORARILY COMMENTED OUT - Template Preview */}
                        {/* {templates.find(t => t.id === ad.templateId) && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl">
                            <div className="text-sm font-semibold text-gray-700 mb-2">Template Preview:</div>
                            <div className="text-sm space-y-1">
                              <div><strong>Headline:</strong> {templates.find(t => t.id === ad.templateId)?.fields.headline}</div>
                              <div><strong>Description:</strong> {templates.find(t => t.id === ad.templateId)?.fields.description}</div>
                            </div>
                          </div>
                        )} */}
                      </motion.div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <ArrowRightIcon className="w-4 h-4 rotate-180" />
                      Back to Campaigns
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg ${
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
                <div className="bg-white/95 border border-white/20 rounded-2xl p-8 shadow-xl transition-shadow duration-200 hover:shadow-2xl">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
                      Review & Generate
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Review your campaign configuration before generating the final export file.
                    </p>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
                    <motion.div 
                      className="bg-gradient-to-br from-white/20 to-white/10 border border-white/20 rounded-2xl p-8 text-center relative overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <MapPinIcon className="w-8 h-8 text-white/80 mx-auto mb-2" />
                      <div className="text-4xl font-extrabold text-white mb-1 leading-none">{stats.selectedLocations}</div>
                      <div className="text-white/80 font-medium text-sm uppercase tracking-wider">Locations</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-white/20 to-white/10 border border-white/20 rounded-2xl p-8 text-center relative overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <DocumentIcon className="w-8 h-8 text-white/80 mx-auto mb-2" />
                      <div className="text-4xl font-extrabold text-white mb-1 leading-none">{stats.totalAds}</div>
                      <div className="text-white/80 font-medium text-sm uppercase tracking-wider">Ad Variations</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-white/20 to-white/10 border border-white/20 rounded-2xl p-8 text-center relative overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <ChartBarIcon className="w-8 h-8 text-white/80 mx-auto mb-2" />
                      <div className="text-4xl font-extrabold text-white mb-1 leading-none">{stats.totalCampaigns.toLocaleString()}</div>
                      <div className="text-white/80 font-medium text-sm uppercase tracking-wider">Total Campaigns</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-white/20 to-white/10 border border-white/20 rounded-2xl p-8 text-center relative overflow-hidden"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <DocumentDuplicateIcon className="w-8 h-8 text-white/80 mx-auto mb-2" />
                      <div className="text-4xl font-extrabold text-white mb-1 leading-none">{stats.totalFiles}</div>
                      <div className="text-white/80 font-medium text-sm uppercase tracking-wider">Excel File</div>
                    </motion.div>
                  </div>

                  {/* What will be generated */}
                  <div className="bg-white/50 border border-gray-200 rounded-2xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      What will be generated:
                    </h3>
                    <div className="space-y-3">
                      {[
                        `${stats.totalFiles} comprehensive Excel file containing all campaigns`,
                        `${stats.totalCampaigns.toLocaleString()} total Meta campaign configurations`,
                        'Complete 73-column campaign import format',
                        `File name: ${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.xlsx`,
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
                          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-between items-center">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <ArrowRightIcon className="w-4 h-4 rotate-180" />
                        Back to Ads
                      </button>
                      
                      <button
                        onClick={() => setShowFilePreview(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-blue-500 hover:text-blue-600 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Preview Data
                      </button>
                    </div>

                    <button
                      onClick={generateCampaigns}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      Generate Campaigns
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
                <div className="bg-white/95 border border-white/20 rounded-2xl p-8 shadow-xl transition-shadow duration-200 hover:shadow-2xl text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-4">
                    Campaigns Generated Successfully!
                  </h2>
                  
                  <p className="text-gray-600 text-lg mb-8">
                    Your campaign file has been generated and is ready for download.
                  </p>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Generated File:</div>
                    <div className="font-mono text-sm text-gray-600 break-all">
                      {generationJob.options?.fileName || 'Campaign_Export.xlsx'}
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        // Reset to start over
                        setCurrentStep(1);
                        setGenerationJob(null);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Create New Campaign
                    </button>

                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generationJob.downloadUrl || '#';
                        link.download = generationJob.options?.fileName || 'Campaign_Export.xlsx';
                        link.click();
                      }}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      Download File
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-24 right-6 w-80 bg-white/95 border border-white/20 rounded-2xl p-6 shadow-xl z-40"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Quick Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
                  className="w-full inline-flex items-center gap-2 px-4 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-red-500 hover:text-red-600 text-sm"
                >
                  Reset All Selections
                </button>
                
                <button
                  onClick={() => {
                    setShowFirstAccessWizard(true);
                    setShowSettings(false);
                  }}
                  className="w-full inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 hover:from-purple-600 hover:to-purple-700 text-sm"
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
    </div>
  );
}

export default App;
