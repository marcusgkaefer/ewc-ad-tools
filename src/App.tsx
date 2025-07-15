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
import AutocompleteInput from './components/ui/AutocompleteInput';
import ModernDatePicker from './components/ui/ModernDatePicker';
import TemplateSelector from './components/ui/TemplateSelector';
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

// Animation variants for award-winning micro-interactions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, rotateY: -15 },
  visible: { opacity: 1, rotateY: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  exit: { opacity: 0, rotateY: 15, transition: { duration: 0.4 } }
};

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  
  // Debug: Log locations state on each render
  console.log('🔍 RENDER DEBUG: locations.length =', locations.length);
  console.log('🔍 RENDER DEBUG: currentStep =', currentStep);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [excludedLocationIds, setExcludedLocationIds] = useState<string[]>([]);
  const [useExclusionMode, setUseExclusionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generationJob, setGenerationJob] = useState<GenerationJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Debug: Log loading state
  console.log('🔍 RENDER DEBUG: isLoading =', isLoading);
  const [showTemplateCreationModal, setShowTemplateCreationModal] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [showFirstAccessWizard, setShowFirstAccessWizard] = useState(false);
  
  // Debug: Add a temporary test button to check locations
  const testLocationsData = () => {
    console.log('🔍 DEBUG: Testing locations data...');
    console.log('🔍 DEBUG: locations state:', locations);
    console.log('🔍 DEBUG: locations.length:', locations.length);
    console.log('🔍 DEBUG: filteredLocations.length:', filteredLocations.length);
    console.log('🔍 DEBUG: First few locations:', locations.slice(0, 5).map(l => ({ id: l.id, name: l.name })));
  };

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

  // Load initial data with elegant loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🔍 DEBUG: Starting data load...');
        const [locationsResponse, templatesResponse] = await Promise.all([
          mockApi.getLocations(1, 1000),
          mockApi.getTemplates()
        ]);

        console.log('🔍 DEBUG: Locations response:', locationsResponse);
        console.log('🔍 DEBUG: Locations response success:', locationsResponse.success);
        console.log('🔍 DEBUG: Locations response data:', locationsResponse.data);

        if (locationsResponse.success && locationsResponse.data) {
          console.log('🔍 DEBUG: Setting locations, count:', locationsResponse.data.items.length);
          setLocations(locationsResponse.data.items);
          // Pre-select all locations by default
          setSelectedLocationIds(locationsResponse.data.items.map(loc => loc.id));
        } else {
          console.error('❌ Locations response failed or no data');
        }

        if (templatesResponse.success && templatesResponse.data) {
          setTemplates(templatesResponse.data);
        }

        // Check if user has seen the tour before
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (!hasSeenTour) {
          // Show wizard after a short delay to let the UI load
          setTimeout(() => {
            setShowFirstAccessWizard(true);
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Initialize with 1 default ad when templates are loaded
  useEffect(() => {
    if (templates.length > 0 && campaignConfig.ads.length === 0) {
      const defaultAd: AdConfiguration = {
        id: `ad-1`,
        name: `Ad 1`,
        templateId: templates[0]?.id || '',
        landingPage: 'www.waxcenter.com',
        radius: `+4m`, // Will be updated with location code when generated
        caption: 'Hello World',
        additionalNotes: '',
        scheduledDate: '', // Will be set from campaign date
        status: 'Paused'
      };
      setCampaignConfig(prev => ({ ...prev, ads: [defaultAd] }));
    }
  }, [templates, campaignConfig.ads.length]);

  // Update month and day when selectedDate changes
  useEffect(() => {
    const date = campaignConfig.selectedDate;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString();
    const scheduledDate = date.toLocaleDateString('en-US'); // MM/DD/YYYY format
    
    setCampaignConfig(prev => ({
      ...prev,
      month,
      day,
      ads: prev.ads.map(ad => ({ ...ad, scheduledDate }))
    }));
  }, [campaignConfig.selectedDate]);

  // Smart filtering with performance optimization
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const query = searchQuery.toLowerCase();
    return locations.filter(location =>
      location.name.toLowerCase().includes(query) ||
      location.city.toLowerCase().includes(query) ||
      location.state.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  // Calculate effective selected locations based on mode
  const effectiveSelectedLocations = useMemo(() => {
    if (useExclusionMode) {
      return filteredLocations.filter(loc => !excludedLocationIds.includes(loc.id));
    }
    return filteredLocations.filter(loc => selectedLocationIds.includes(loc.id));
  }, [useExclusionMode, filteredLocations, excludedLocationIds, selectedLocationIds]);

  // Dynamic stats calculation - Updated for single file export
  const stats = useMemo(() => {
    const totalCampaigns = effectiveSelectedLocations.length * campaignConfig.ads.length;
    const totalBudget = campaignConfig.budget * totalCampaigns;
    const estimatedReach = totalCampaigns * 15000; // Estimated reach per campaign
    
    return {
      totalCampaigns,
      totalBudget,
      estimatedReach,
      selectedLocations: effectiveSelectedLocations.length,
      totalAds: campaignConfig.ads.length,
      totalFiles: 1 // Single file export
    };
  }, [effectiveSelectedLocations.length, campaignConfig.ads.length, campaignConfig.budget]);

  // Event handlers with optimistic UI updates
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

  const toggleSelectionMode = () => {
    setUseExclusionMode(!useExclusionMode);
    // Reset selections when switching modes
    setSelectedLocationIds(locations.map(loc => loc.id));
    setExcludedLocationIds([]);
  };

  const addAd = () => {
    const newAd: AdConfiguration = {
      id: `ad-${Date.now()}`,
      name: `Ad ${campaignConfig.ads.length + 1}`,
      templateId: templates[0]?.id || '',
      landingPage: 'www.waxcenter.com',
      radius: `+4m`, // Will be updated with location code when generated
      caption: 'Hello World',
      additionalNotes: '',
      scheduledDate: '', // Will be set from campaign date
      status: 'Paused'
    };
    setCampaignConfig(prev => ({
      ...prev,
      ads: [...prev.ads, newAd]
    }));
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
        // Refresh templates list
        const templatesResponse = await mockApi.getTemplates();
        if (templatesResponse.success && templatesResponse.data) {
          setTemplates(templatesResponse.data);
        }
        setShowTemplateCreationModal(false);
      }
    } catch (error) {
      console.error('Failed to create template:', error);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleGeneration = async () => {
    try {
      setCurrentStep(5);
      
      // Generate a single file containing all campaigns and ads
      const locationSpecificAds = effectiveSelectedLocations.flatMap(location => 
        campaignConfig.ads.map(ad => ({
          ...ad,
          radius: `${location.locationPrime}+4m`, // Dynamic radius with location code
          scheduledDate: campaignConfig.selectedDate.toLocaleDateString('en-US'),
          locationId: location.id // Add location reference
        }))
      );

      const response = await mockApi.generateAds(
        effectiveSelectedLocations.map(loc => loc.id),
        campaignConfig.ads.map(ad => ad.templateId),
        {
          format: 'excel',
          includeHeaders: true,
          customFields: ['landingPage', 'radius', 'caption', 'additionalNotes', 'scheduledDate', 'status'],
          fileName: `${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.xlsx`,
          campaign: {
            ...campaignConfig,
            ads: locationSpecificAds // Single file contains all location-ad combinations
          }
        }
      );

      if (response.success && response.data) {
        setGenerationJob(response.data);
        
        // Elegant polling with exponential backoff
        const pollStatus = async () => {
          const statusResponse = await mockApi.getGenerationStatus(response.data!.id);
          if (statusResponse.success && statusResponse.data) {
            setGenerationJob(statusResponse.data);
            
            if (statusResponse.data.status === 'processing') {
              setTimeout(pollStatus, 1000);
            }
          }
        };
        
        pollStatus();
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  // Progress steps with beautiful icons and states - Updated workflow: Locations -> Campaigns -> Ads
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
      completed: false,
      description: 'Preview & validate'
    },
    { 
      id: 5, 
      title: 'Generate', 
      icon: SparklesIcon, 
      completed: false,
      description: 'Export single file'
    }
  ];

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="main-content">
          <motion.div
            className="card"
            style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              className="loading-shimmer"
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                margin: '0 auto 24px' 
              }}
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
              Loading Ad Tools
            </h2>
            <p style={{ color: 'var(--gray-600)' }}>
              Preparing your creative workspace...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content" style={{ paddingTop: '88px' }}>
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
              >
                <div className="card">
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                      Select Target Locations
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
                      Choose which locations to target. You can select individual locations or use exclusion mode for easier bulk selection.
                    </p>
                  </div>

                  {/* Search and Mode Controls */}
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Search locations by name, city, or state..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '1.1rem' }}
                      />
                    </div>
                    
                    {/* Selection Mode Toggle */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-lg)', 
                      marginBottom: 'var(--space-md)',
                      padding: 'var(--space-md)',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--gray-200)'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-sm)',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}>
                        <input
                          type="checkbox"
                          checked={useExclusionMode}
                          onChange={toggleSelectionMode}
                          style={{ 
                            width: '18px', 
                            height: '18px',
                            accentColor: 'var(--primary-500)'
                          }}
                        />
                        Use exclusion mode (select locations to exclude instead)
                      </label>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--gray-600)',
                        fontStyle: 'italic'
                      }}>
                        {useExclusionMode ? 
                          `${effectiveSelectedLocations.length} locations selected (${excludedLocationIds.length} excluded from ${filteredLocations.length} total)` :
                          `${effectiveSelectedLocations.length} locations selected from ${filteredLocations.length} total`
                        }
                      </div>
                    </div>
                    
                    {/* Bulk Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={selectAllLocations}
                      >
                        <CheckCircleIcon className="icon-sm" />
                        {useExclusionMode ? 'Include All' : 'Select All'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={clearAllLocations}
                      >
                        <XMarkIcon className="icon-sm" />
                        {useExclusionMode ? 'Exclude All' : 'Clear All'}
                      </button>
                    </div>
                  </div>

                  {/* Compact Location List */}
                  <div style={{ 
                    marginBottom: 'var(--space-xl)', 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'white'
                  }}>
                    {/* Debug: Show loading state or empty state */}
                    {isLoading && (
                      <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--gray-600)' }}>
                        Loading locations...
                      </div>
                    )}
                    {!isLoading && filteredLocations.length === 0 && (
                      <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--gray-600)' }}>
                        No locations found. Total locations: {locations.length}
                      </div>
                    )}
                    {!isLoading && filteredLocations.length > 0 && filteredLocations.map((location, index) => {
                      const isSelected = useExclusionMode ? 
                        !excludedLocationIds.includes(location.id) :
                        selectedLocationIds.includes(location.id);
                      
                      return (
                        <motion.div
                          key={location.id}
                          className={`compact-location-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleLocationSelection(location.id)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.005, duration: 0.3 }}
                          whileHover={{ backgroundColor: 'rgba(14, 165, 233, 0.05)' }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderBottom: index < filteredLocations.length - 1 ? '1px solid var(--gray-100)' : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.9rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1 }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '3px',
                              border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--gray-300)'}`,
                              background: isSelected ? 'var(--primary-500)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}>
                              {isSelected && (
                                <CheckCircleIcon style={{ width: '10px', height: '10px', color: 'white' }} />
                              )}
                            </div>
                            <div style={{ fontWeight: 500, color: 'var(--gray-800)' }}>
                              {location.name}
                            </div>
                          </div>
                          <div style={{ 
                            color: 'var(--gray-600)', 
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)'
                          }}>
                            <span>{location.city}, {location.state}</span>
                            <span style={{ color: 'var(--gray-400)' }}>•</span>
                            <span>{location.zipCode}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => setCurrentStep(2)}
                      disabled={effectiveSelectedLocations.length === 0}
                      style={{ opacity: effectiveSelectedLocations.length === 0 ? 0.5 : 1 }}
                    >
                      Continue to Campaigns
                      <ArrowRightIcon className="icon" />
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
              >
                <div className="card">
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                      Campaign Configuration
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
                      Set up your Facebook/Meta campaign parameters. These settings will be applied to all generated campaigns.
                    </p>
                  </div>

                  <div className="grid grid-cols-3" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="form-group">
                      <label className="form-label">Campaign Prefix</label>
                      <input
                        type="text"
                        value={campaignConfig.prefix}
                        onChange={(e) => setCampaignConfig(prev => ({ ...prev, prefix: e.target.value }))}
                        className="form-input"
                        placeholder="EWC_Meta_"
                      />
                    </div>
                    
                    <Select
                      value={campaignConfig.platform}
                      onChange={(value) => setCampaignConfig(prev => ({ ...prev, platform: value }))}
                      options={[
                        { value: 'Meta', label: 'Meta' },
                        { value: 'Facebook', label: 'Facebook' },
                        { value: 'Instagram', label: 'Instagram' }
                      ]}
                      label="Platform"
                    />

                    <div className="form-group">
                      <ModernDatePicker
                        value={campaignConfig.selectedDate}
                        onChange={(date) => setCampaignConfig(prev => ({ ...prev, selectedDate: date }))}
                        placeholder="Select campaign date"
                        label="Campaign Date"
                      />
                    </div>

                    <AutocompleteInput
                      value={campaignConfig.objective}
                      onChange={(value) => setCampaignConfig(prev => ({ ...prev, objective: value }))}
                      options={defaultObjectives}
                      placeholder="Select or type objective..."
                      allowCustom={true}
                      customLabel="Add custom objective:"
                      label="Objective"
                    />

                    <Select
                      value={campaignConfig.testType}
                      onChange={(value) => setCampaignConfig(prev => ({ ...prev, testType: value }))}
                      options={[
                        { value: 'LocalTest', label: 'Local Test' },
                        { value: 'RegionalTest', label: 'Regional Test' },
                        { value: 'NationalTest', label: 'National Test' }
                      ]}
                      label="Test Type"
                    />

                    <div className="form-group">
                      <label className="form-label">Budget ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={campaignConfig.budget}
                        onChange={(e) => setCampaignConfig(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                        className="form-input"
                        placeholder="92.69"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Targeting Radius (miles)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="50"
                        value={campaignConfig.radius}
                        onChange={(e) => setCampaignConfig(prev => ({ ...prev, radius: parseFloat(e.target.value) || 5 }))}
                        className="form-input"
                        placeholder="5"
                      />
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>
                        Radius around each location's coordinates for targeting
                      </p>
                    </div>

                    <Select
                      value={campaignConfig.bidStrategy}
                      onChange={(value) => setCampaignConfig(prev => ({ ...prev, bidStrategy: value }))}
                      options={[
                        { value: 'Highest volume or value', label: 'Highest volume or value' },
                        { value: 'Cost cap', label: 'Cost cap' },
                        { value: 'Bid cap', label: 'Bid cap' },
                        { value: 'Target cost', label: 'Target cost' }
                      ]}
                      label="Bid Strategy"
                    />

                    <Select
                      value={campaignConfig.duration}
                      onChange={(value) => setCampaignConfig(prev => ({ ...prev, duration: value }))}
                      options={[
                        { value: 'Evergreen', label: 'Evergreen' },
                        { value: 'Seasonal', label: 'Seasonal' },
                        { value: 'Limited', label: 'Limited Time' }
                      ]}
                      label="Duration"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Locations
                    </button>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => setCurrentStep(3)}
                      disabled={campaignConfig.prefix === ''}
                      style={{ opacity: campaignConfig.prefix === '' ? 0.5 : 1 }}
                    >
                      Continue to Ads
                      <ArrowRightIcon className="icon" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Configure Ads for the Campaign */}
            {currentStep === 3 && (
              <motion.div
                key="ads"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="card">
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                      Configure Campaign Ads
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
                      Set up multiple ads for your campaign. All ads will be included in a single export file. Default is 4 ads per campaign.
                    </p>
                  </div>

                  {/* Ads List */}
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    {campaignConfig.ads.map((ad, index) => (
                      <motion.div
                        key={ad.id}
                        className="card"
                        style={{ 
                          marginBottom: 'var(--space-lg)',
                          background: 'rgba(255, 255, 255, 0.7)',
                          border: '2px solid var(--gray-200)'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--gray-800)' }}>
                            {ad.name}
                          </h3>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => removeAd(ad.id)}
                            disabled={campaignConfig.ads.length <= 1}
                            style={{ opacity: campaignConfig.ads.length <= 1 ? 0.5 : 1 }}
                          >
                            <TrashIcon className="icon-sm" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                          <div className="form-group">
                            <label className="form-label">Ad Name</label>
                            <input
                              type="text"
                              value={ad.name}
                              onChange={(e) => updateAd(ad.id, { name: e.target.value })}
                              className="form-input"
                              placeholder="Ad 1"
                            />
                          </div>
                        </div>

                        {/* Template Selection - Full Width Row */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                          <TemplateSelector
                            templates={templates}
                            selectedTemplateId={ad.templateId}
                            onTemplateSelect={(templateId) => updateAd(ad.id, { templateId })}
                            onCreateTemplate={() => setShowTemplateCreationModal(true)}
                          />
                        </div>

                        {/* Additional Ad Configuration Fields */}
                        <div className="grid grid-cols-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                          <div className="form-group">
                            <label className="form-label">Landing Page</label>
                            <input
                              type="url"
                              value={ad.landingPage}
                              onChange={(e) => updateAd(ad.id, { landingPage: e.target.value })}
                              className="form-input"
                              placeholder="www.waxcenter.com"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Addresses (Coordinates + Radius)</label>
                            <input
                              type="text"
                              value={`(lat, lng) +${campaignConfig.radius}mi`}
                              readOnly
                              className="form-input"
                              style={{ backgroundColor: 'var(--gray-50)', color: 'var(--gray-600)' }}
                              title="Location coordinates with configured radius - automatically populated for each location"
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>
                              Format: (latitude, longitude) +{campaignConfig.radius}mi - dynamically populated for each location
                            </p>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Caption</label>
                            <input
                              type="text"
                              value={ad.caption}
                              onChange={(e) => updateAd(ad.id, { caption: e.target.value })}
                              className="form-input"
                              placeholder="Hello World"
                            />
                          </div>

                          <Select
                            value={ad.status}
                            onChange={(value) => updateAd(ad.id, { status: value as AdConfiguration['status'] })}
                            options={[
                              { value: 'Paused', label: 'Paused' },
                              { value: 'Active', label: 'Active' },
                              { value: 'Draft', label: 'Draft' }
                            ]}
                            label="Status"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                          <label className="form-label">Additional Notes</label>
                          <textarea
                            value={ad.additionalNotes}
                            onChange={(e) => updateAd(ad.id, { additionalNotes: e.target.value })}
                            className="form-input"
                            rows={3}
                            placeholder="Additional notes or configuration..."
                          />
                        </div>

                        {/* Template Preview */}
                        {ad.templateId && (() => {
                          const template = templates.find(t => t.id === ad.templateId);
                          return template ? (
                            <div style={{ 
                              marginTop: 'var(--space-lg)',
                              padding: 'var(--space-md)',
                              background: 'var(--gray-50)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--gray-200)'
                            }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 'var(--space-sm)' }}>
                                Preview:
                              </div>
                              <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                                <div><strong>Headline:</strong> {template.fields.headline}</div>
                                <div><strong>Description:</strong> {template.fields.description}</div>
                                <div><strong>CTA:</strong> {template.fields.callToAction}</div>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </motion.div>
                    ))}

                    {/* Add New Ad Button */}
                    <motion.button
                      className="btn btn-secondary"
                      onClick={addAd}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%',
                        padding: 'var(--space-lg)',
                        border: '2px dashed var(--gray-300)',
                        background: 'transparent'
                      }}
                    >
                      <PlusIcon className="icon" />
                      Add Another Ad
                    </motion.button>
                  </div>

                  {/* Single File Preview */}
                  <div className="file-naming-preview" style={{ 
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(217, 70, 239, 0.1))',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-lg)',
                    marginBottom: 'var(--space-xl)'
                  }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                      Single File Export Preview:
                    </h3>
                    <p style={{ 
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.9rem',
                      color: 'var(--primary-700)',
                      background: 'white',
                      padding: 'var(--space-sm) var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      margin: '0 0 var(--space-xs) 0'
                    }}>
                      {campaignConfig.prefix}_{campaignConfig.platform}_{campaignConfig.month}{campaignConfig.day}_AllCampaigns.xlsx
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 'var(--space-sm) 0 0 0' }}>
                      Single file containing {effectiveSelectedLocations.length} locations × {campaignConfig.ads.length} ads = {effectiveSelectedLocations.length * campaignConfig.ads.length} total campaigns
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Campaigns
                    </button>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => setCurrentStep(4)}
                      disabled={campaignConfig.ads.length === 0}
                      style={{ opacity: campaignConfig.ads.length === 0 ? 0.5 : 1 }}
                    >
                      Review Campaign
                      <ArrowRightIcon className="icon" />
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
              >
                <div className="card">
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                      Review & Generate
                    </h2>
                    <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem' }}>
                      Review your campaign configuration and generate Facebook/Meta ready campaign files.
                    </p>
                  </div>
                  
                  {/* Enhanced Stats Grid */}
                  <div className="stats-grid" style={{ marginBottom: 'var(--space-2xl)' }}>
                    <motion.div 
                      className="stat-card"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      <MapPinIcon className="icon-xl" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 'var(--space-sm)' }} />
                      <div className="stat-value">{stats.selectedLocations}</div>
                      <div className="stat-label">Target Locations</div>
                    </motion.div>
                    
                    <motion.div 
                      className="stat-card"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <DocumentIcon className="icon-xl" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 'var(--space-sm)' }} />
                      <div className="stat-value">{stats.totalAds}</div>
                      <div className="stat-label">Ad Variations</div>
                    </motion.div>
                    
                    <motion.div 
                      className="stat-card"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    >
                      <ChartBarIcon className="icon-xl" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 'var(--space-sm)' }} />
                      <div className="stat-value">{stats.totalCampaigns.toLocaleString()}</div>
                      <div className="stat-label">Total Campaigns</div>
                    </motion.div>
                    
                    <motion.div 
                      className="stat-card"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                    >
                      <DocumentDuplicateIcon className="icon-xl" style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 'var(--space-sm)' }} />
                      <div className="stat-value">{stats.totalFiles}</div>
                      <div className="stat-label">Excel File</div>
                    </motion.div>
                  </div>

                  {/* What will be generated */}
                  <div className="card" style={{ 
                    background: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: 'var(--space-xl)'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
                      What will be generated:
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                      {[
                        `${stats.totalFiles} comprehensive Excel file containing all campaigns`,
                        `${stats.totalCampaigns.toLocaleString()} total Facebook/Meta campaign configurations`,
                        'Complete 73-column campaign import format',
                        `File name: ${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.xlsx`,
                        'Location-specific targeting coordinates and demographics',
                        'All ad variations organized in a single file',
                        'Ready for Facebook Ads Manager bulk import'
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CheckCircleIcon className="icon" style={{ color: 'var(--success-500)' }} />
                          <span style={{ fontSize: '0.95rem' }}>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCurrentStep(3)}
                    >
                      Back to Configuration
                    </button>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowFilePreview(true)}
                      >
                        <EyeIcon className="icon" />
                        Preview Data
                      </button>
                      <motion.button
                        className="btn btn-primary btn-lg"
                        onClick={handleGeneration}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        <PlayIcon className="icon" />
                        Generate Campaign File
                        <SparklesIcon className="icon" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && generationJob && (
              <motion.div
                key="generate"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="card" style={{ textAlign: 'center' }}>
                  {generationJob.status === 'processing' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        style={{
                          width: '120px',
                          height: '120px',
                          margin: '0 auto var(--space-xl)',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary-500), var(--secondary-500))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-2xl)'
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <SparklesIcon className="icon-xl" style={{ color: 'white' }} />
                      </motion.div>
                      
                      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                        Generating Your Campaign File
                      </h2>
                      <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem', marginBottom: 'var(--space-xl)' }}>
                        Creating single Excel file with {stats.totalCampaigns.toLocaleString()} Facebook/Meta campaigns
                      </p>
                      
                      {/* Progress Bar */}
                      <div style={{ 
                        background: 'var(--gray-200)',
                        borderRadius: 'var(--radius-full)',
                        height: '12px',
                        marginBottom: 'var(--space-lg)',
                        overflow: 'hidden'
                      }}>
                        <motion.div
                          style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary-500), var(--secondary-500))',
                            borderRadius: 'var(--radius-full)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(generationJob.processedAds / generationJob.totalAds) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      
                      <p style={{ fontSize: '1rem', color: 'var(--gray-600)' }}>
                        {generationJob.processedAds.toLocaleString()} of {generationJob.totalAds.toLocaleString()} campaigns completed
                      </p>
                    </motion.div>
                  )}

                  {generationJob.status === 'completed' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        style={{
                          width: '120px',
                          height: '120px',
                          margin: '0 auto var(--space-xl)',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--success-500), #059669)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-2xl)'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircleIcon className="icon-xl" style={{ color: 'white' }} />
                      </motion.div>
                      
                      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                        Campaign File Generated!
                      </h2>
                      <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem', marginBottom: 'var(--space-xl)' }}>
                        Successfully generated Excel file with {stats.totalCampaigns.toLocaleString()} Facebook/Meta campaigns
                      </p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'center' }}>
                        <motion.button
                          className="btn btn-secondary btn-lg"
                          onClick={() => setShowFilePreview(true)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ minWidth: '300px' }}
                        >
                          <EyeIcon className="icon" />
                          Preview Generated Data
                        </motion.button>
                        
                        <motion.button
                          className="btn btn-success btn-lg"
                          onClick={async () => {
                            try {
                              const response = await mockApi.downloadGeneratedFile(generationJob.id);
                              if (response.success && response.data) {
                                const url = URL.createObjectURL(response.data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.xlsx`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }
                            } catch (error) {
                              console.error('Download failed:', error);
                            }
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ minWidth: '300px' }}
                        >
                          <DownloadIcon className="icon" />
                          Download All Campaigns
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {generationJob.status === 'failed' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto var(--space-xl)',
                        borderRadius: '50%',
                        background: 'var(--error-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-2xl)',
                        color: 'white',
                        fontSize: '3rem',
                        fontWeight: 'bold'
                      }}>
                        !
                      </div>
                      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                        Generation Failed
                      </h2>
                      <p style={{ color: 'var(--gray-600)', fontSize: '1.1rem', marginBottom: 'var(--space-xl)' }}>
                        {generationJob.error || 'An unexpected error occurred'}
                      </p>
                      
                      <button
                        className="btn btn-primary"
                        onClick={() => setCurrentStep(4)}
                      >
                        Try Again
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Settings Panel */}
      <div className={`settings-panel ${showSettings ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Quick Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <XMarkIcon className="icon" />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
              Campaign Defaults
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-md)' }}>
              Set default values for new campaigns
            </p>
            
            <div className="form-group">
              <label className="form-label">Default Budget</label>
              <input
                type="number"
                value={campaignConfig.budget}
                onChange={(e) => setCampaignConfig(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                className="form-input"
              />
            </div>
            
            <Select
              value={campaignConfig.objective}
              onChange={(value) => setCampaignConfig(prev => ({ ...prev, objective: value }))}
              options={[
                { value: 'Engagement', label: 'Engagement' },
                { value: 'Traffic', label: 'Traffic' },
                { value: 'Conversions', label: 'Conversions' },
                { value: 'Reach', label: 'Reach' }
              ]}
              label="Default Objective"
            />
            
            <div className="form-group">
              <label className="form-label">Default Radius (miles)</label>
              <input
                type="number"
                value={campaignConfig.radius}
                onChange={(e) => setCampaignConfig(prev => ({ ...prev, radius: parseFloat(e.target.value) || 5 }))}
                className="form-input"
                min="1"
                max="50"
                step="0.5"
                placeholder="5"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>
                Default radius for location targeting in miles
              </p>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
              Quick Actions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <button
                className="btn btn-primary"
                onClick={testLocationsData}
                style={{ backgroundColor: '#ff6b6b' }}
              >
                🔍 DEBUG: Test Locations Data
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedLocationIds([]);
                  setExcludedLocationIds([]);
                  setCampaignConfig(prev => ({ ...prev, ads: [] }));
                  setCurrentStep(1);
                }}
              >
                Reset All Selections
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (useExclusionMode) {
                    setExcludedLocationIds([]);
                  } else {
                    setSelectedLocationIds(locations.slice(0, 25).map(l => l.id));
                  }
                }}
              >
                Quick Select 25 Locations
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const defaultAds: AdConfiguration[] = Array.from({ length: 4 }, (_, index) => ({
                    id: `ad-${Date.now()}-${index}`,
                    name: `Ad ${index + 1}`,
                    templateId: templates[0]?.id || '',
                    landingPage: 'www.waxcenter.com',
                    radius: `+4m`,
                    caption: 'Hello World',
                    additionalNotes: '',
                    scheduledDate: '',
                    status: 'Paused' as const
                  }));
                  setCampaignConfig(prev => ({ ...prev, ads: defaultAds }));
                }}
              >
                Reset to 4 Default Ads
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowFirstAccessWizard(true)}
                style={{ backgroundColor: 'var(--secondary-500)' }}
              >
                🎯 Take Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreview
        isOpen={showFilePreview}
        onClose={() => setShowFilePreview(false)}
        locations={effectiveSelectedLocations}
        ads={campaignConfig.ads}
        campaign={campaignConfig}
        title="Campaign Data Preview"
      />

      {/* Template Creation Modal */}
      <TemplateCreationModal
        isOpen={showTemplateCreationModal}
        onClose={() => setShowTemplateCreationModal(false)}
        onSubmit={handleTemplateCreation}
        isSubmitting={isCreatingTemplate}
      />

      {/* First Access Wizard */}
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
