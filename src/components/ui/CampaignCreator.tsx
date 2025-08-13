import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  MapPinIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ScaleIcon,
  CheckIcon,
  PresentationChartLineIcon,
  UserGroupIcon,
  LinkIcon,
  CubeTransparentIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { supabaseLocationService } from '../../services/supabaseLocationService';
import { mockApi } from '../../services/mockApi';
import type { LocationWithConfig, CampaignConfiguration, GenerationJob } from '../../types';
import EnhancedPreview from './EnhancedPreview';
import FileComparisonModal from './FileComparisonModal';
import { LocationConfigModal } from './LocationConfigModal';
import { 
  REFERENCE_AD_TEMPLATE, 
  REFERENCE_CAMPAIGN_SETTINGS, 
  REFERENCE_ADSET_SETTINGS 
} from '../../constants/hardcodedAdValues';

// Boolean Checkbox Component
interface BooleanCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const BooleanCheckbox: React.FC<BooleanCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false
}) => {
  return (
    <div>
      <label className="flex items-center gap-3 font-medium text-wax-gray-700 text-sm cursor-pointer">
        <div
          className={`w-6 h-6 rounded border-2 transition-all duration-200 flex items-center justify-center ${
            checked
              ? 'border-wax-red-500 bg-wax-red-500'
              : 'border-wax-gray-300 bg-white hover:border-wax-red-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {checked && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
        <span>{label}</span>
      </label>
    </div>
  );
};

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  status?: 'pending' | 'completed' | 'error';
  completionCount?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  status = 'pending',
  completionCount
}) => {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-wax-sm border border-wax-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="px-6 py-4 border-b border-wax-gray-100 flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-wax-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-wax-red-100 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-wax-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-wax-gray-800">{title}</h3>
            {completionCount && (
              <p className="text-sm text-wax-gray-500">{completionCount}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === 'completed' && (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          )}
          {status === 'error' && (
            <XCircleIcon className="w-5 h-5 text-red-500" />
          )}
          <ChevronDownIcon
            className={`w-5 h-5 text-wax-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Location List Item Component
interface LocationItemProps {
  location: LocationWithConfig;
  isSelected: boolean;
  onToggle: () => void;
  onConfigure: () => void;
}

const LocationItem: React.FC<LocationItemProps> = ({
  location,
  isSelected,
  onToggle,
  onConfigure
}) => {
  return (
    <div 
      className="flex items-center justify-between py-3 px-4 border-b border-wax-gray-100 transition-all duration-200 hover:bg-wax-gray-50 cursor-pointer"
      onDoubleClick={onConfigure}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center cursor-pointer ${
            isSelected
              ? 'border-wax-red-500 bg-wax-red-500'
              : 'border-wax-gray-300 hover:border-wax-red-300'
          }`}
          onClick={onToggle}
        >
          {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
        <div className="flex-1">
          <div className="font-medium text-wax-gray-800">{location.name}</div>
          <div className="text-sm text-wax-gray-500">
            {location.city}, {location.state} • {location.zipCode}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {location.config && (
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Configured
          </span>
        )}
        <button
          onClick={onConfigure}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-wax-gray-600 hover:text-wax-red-600 hover:bg-wax-red-50 rounded-lg transition-all duration-200"
        >
          <Cog6ToothIcon className="w-4 h-4" />
          Configure
        </button>
      </div>
    </div>
  );
};

interface CampaignCreatorProps {
  campaignConfig?: CampaignConfiguration;
  onCampaignConfigChange?: (config: CampaignConfiguration) => void;
}

const CampaignCreator: React.FC<CampaignCreatorProps> = ({ 
  campaignConfig: externalCampaignConfig,
  onCampaignConfigChange 
}) => {
  // State management
  const [locations, setLocations] = useState<LocationWithConfig[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [configFilter, setConfigFilter] = useState<'all' | 'configured' | 'not-configured'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campaign settings - use external config if provided, otherwise use local state
  const defaultConfig: CampaignConfiguration = {
    prefix: 'EWC',
    platform: 'Meta',
    selectedDate: new Date(),
    month: new Date().toLocaleString('default', { month: 'long' }),
    day: new Date().getDate().toString(),
    objective: 'Engagement',
    testType: 'LocalTest',
    duration: 'Evergreen',
    budget: 50,
    bidStrategy: 'Highest volume or value',
    startDate: new Date().toLocaleDateString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    ads: [{
      id: 'ad-1',
      name: 'Primary Ad',
      templateId: 'template_1',
      radius: '+4m',
      caption: 'Experience premium waxing services',
      additionalNotes: '',
      scheduledDate: new Date().toLocaleDateString(),
      status: 'Active'
    }],
    radius: 5
  };

  const [campaignConfig, setCampaignConfigLocal] = useState<CampaignConfiguration>(
    externalCampaignConfig || defaultConfig
  );

  // Use external config when available
  const effectiveCampaignConfig = externalCampaignConfig || campaignConfig;
  
  const setCampaignConfig = (config: CampaignConfiguration | ((prev: CampaignConfiguration) => CampaignConfiguration)) => {
    const newConfig = typeof config === 'function' ? config(effectiveCampaignConfig) : config;
    if (onCampaignConfigChange) {
      onCampaignConfigChange(newConfig);
    } else {
      setCampaignConfigLocal(newConfig);
    }
  };

  // Generation state
  const [generationJob, setGenerationJob] = useState<GenerationJob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal states
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [showFileComparison, setShowFileComparison] = useState(false);
  const [showLocationConfig, setShowLocationConfig] = useState(false);
  const [selectedLocationForConfig, setSelectedLocationForConfig] = useState<LocationWithConfig | null>(null);
  const [previewGeneratedFile, setPreviewGeneratedFile] = useState<GeneratedFile | null>(null);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    locations: true,
    preview: false,
    comparison: false,
    campaignConfig: true,
    adSetConfig: false,
    creativeConfig: false,
    targetingConfig: false,
    trackingConfig: false,
    platformConfig: false
  });

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Success notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Boolean field states for checkboxes
  const [booleanFields, setBooleanFields] = useState({
    newObjective: true, // "Yes"
    budgetSchedulingEnabled: false, // "No"
    useAcceleratedDelivery: false, // "No"
    budgetSchedulingAdSet: false, // "No"
    optimizeTextPerPerson: false, // "No"
    videoRetargeting: false, // "No"
    usePageAsActor: false, // "No"
  });

  // Generated files session storage
  interface GeneratedFile {
    id: string;
    name: string;
    timestamp: Date;
    locationCount: number;
    jobId: string;
    blob?: Blob;
  }
  
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [showFilesList, setShowFilesList] = useState(false);
  const generatedFilesRef = useRef<HTMLDivElement>(null);

  // Download state management
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [autoDownloadTriggered, setAutoDownloadTriggered] = useState(false);

  // Load locations
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        const data = await supabaseLocationService.getLocationsWithConfigs();
        setLocations(data);
        // Select all locations by default
        setSelectedLocationIds(new Set(data.map(loc => loc.id)));
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error loading locations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Update date fields when selectedDate changes (same logic as default App.tsx)
  useEffect(() => {
    const date = effectiveCampaignConfig.selectedDate;
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
  }, [effectiveCampaignConfig.selectedDate]);

  // Listen for settings modal open event from AppHeader
  useEffect(() => {
    const handleOpenSettingsModal = () => {
      setShowSettingsModal(true);
    };

    window.addEventListener('openSettingsModal', handleOpenSettingsModal);

    return () => {
      window.removeEventListener('openSettingsModal', handleOpenSettingsModal);
    };
  }, []);

  // Poll generation job status and auto-download when complete
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const pollJobStatus = async () => {
      if (generationJob && (generationJob.status === 'pending' || generationJob.status === 'processing')) {
        try {
          const response = await mockApi.getGenerationStatus(generationJob.id);
          if (response.success && response.data) {
            setGenerationJob(response.data);
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }
    };

    const triggerAutoDownload = async () => {
      if (generationJob?.status === 'completed' && !autoDownloadTriggered) {
        setAutoDownloadTriggered(true);
        setIsDownloading(true);
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const response = await mockApi.downloadGeneratedFile(generationJob.id);
          if (response.success && response.data) {
            // Cache the blob in the generated files list
            setGeneratedFiles(prev => 
              prev.map(f => f.jobId === generationJob.id ? { ...f, blob: response.data } : f)
            );
            
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = generationJob.options?.fileName || 'Campaign_Export.csv';
            link.click();
            URL.revokeObjectURL(url);
            
            setDownloadSuccess(true);
            // Reset success state after animation
            setTimeout(() => setDownloadSuccess(false), 3000);
          }
        } catch (error) {
          console.error('Auto-download error:', error);
        } finally {
          setIsDownloading(false);
        }
      }
    };

    // Start polling if we have an active job
    if (generationJob && (generationJob.status === 'pending' || generationJob.status === 'processing')) {
      pollInterval = setInterval(pollJobStatus, 500); // Poll every 500ms
    }

    // Trigger auto-download if job is completed
    if (generationJob?.status === 'completed') {
      triggerAutoDownload();
    }

    // Cleanup
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [generationJob?.status, generationJob?.id, autoDownloadTriggered, generationJob?.options?.fileName]);

  // Filtered and selected locations
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      // Search filter
      const searchMatch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.state.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Configuration filter
      const configMatch = configFilter === 'all' || 
        (configFilter === 'configured' && location.config) ||
        (configFilter === 'not-configured' && !location.config);
      
      return searchMatch && configMatch;
    });
  }, [locations, searchQuery, configFilter]);

  const selectedLocations = useMemo(() => {
    return locations.filter(location => selectedLocationIds.has(location.id));
  }, [locations, selectedLocationIds]);

  // Handlers
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const selectAllLocations = () => {
    setSelectedLocationIds(new Set(filteredLocations.map(loc => loc.id)));
  };

  const clearAllSelections = () => {
    setSelectedLocationIds(new Set());
  };

  const openLocationConfig = (location: LocationWithConfig) => {
    setSelectedLocationForConfig(location);
    setShowLocationConfig(true);
  };

  const handleLocationConfigSave = async () => {
    // Reload locations to get updated config
    try {
      const data = await supabaseLocationService.getLocationsWithConfigs();
      setLocations(data);
    } catch (err) {
      console.error('Error reloading locations:', err);
    }
  };

  const handleGenerateCampaigns = async () => {
    if (selectedLocations.length === 0) {
      setError('Please select at least one location');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      const templateIds = campaignConfig.ads.map(ad => ad.templateId);
      const result = await mockApi.generateAds(
        Array.from(selectedLocationIds),
        templateIds,
        {
          format: 'csv',
          includeHeaders: true,
          customFields: ['radius', 'caption'],
          fileName: `${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.csv`,
          campaign: campaignConfig
        }
      );
              if (result.success && result.data) {
          setGenerationJob(result.data);
          
          // Add to generated files list
          const newFile: GeneratedFile = {
            id: result.data.id,
            name: `${campaignConfig.prefix}_${campaignConfig.platform}_${campaignConfig.month}${campaignConfig.day}_AllCampaigns.csv`,
            timestamp: new Date(),
            locationCount: selectedLocations.length,
            jobId: result.data.id
          };
          setGeneratedFiles(prev => [newFile, ...prev]);
          
          setShowSuccessNotification(true);
          // Auto-hide notification after 5 seconds
          setTimeout(() => setShowSuccessNotification(false), 5000);
        }
    } catch (err) {
      setError('Failed to generate campaigns');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!generationJob) return;

    setIsDownloading(true);
    try {
      const response = await mockApi.downloadGeneratedFile(generationJob.id);
      if (response.success && response.data) {
        // Cache the blob in the generated files list
        setGeneratedFiles(prev => 
          prev.map(f => f.jobId === generationJob.id ? { ...f, blob: response.data } : f)
        );
        
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = generationJob.options?.fileName || 'Campaign_Export.csv';
        link.click();
        URL.revokeObjectURL(url);
        
        setDownloadSuccess(true);
        // Reset success state after animation
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to download CSV');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadFile = async (file: GeneratedFile) => {
    try {
      // If we have the blob cached, use it
      if (file.blob) {
        const url = URL.createObjectURL(file.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Otherwise, fetch it from the API
      const response = await mockApi.downloadGeneratedFile(file.jobId);
      if (response.success && response.data) {
        // Cache the blob for future downloads
        setGeneratedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, blob: response.data } : f)
        );
        
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Failed to download file');
      console.error('Download error:', err);
    }
  };

  const handlePreviewFile = (file: GeneratedFile) => {
    // Use the same preview functionality as the toolbar button but for generated files
    setPreviewGeneratedFile(file);
    setShowEnhancedPreview(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wax-elegant flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 text-wax-red-600 animate-spin mx-auto mb-4" />
          <p className="text-wax-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        

        <div className="grid grid-cols-1 gap-8">
          {/* Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-wax-sm border border-wax-gray-200"
          >
            <div className="px-6 py-4 border-b border-wax-gray-100 flex items-center justify-between">
              {/* Location Selection Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-wax-red-100 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-wax-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-wax-gray-800">Location Selection</h3>
                  <p className="text-sm text-wax-gray-500">{selectedLocations.length} of {locations.length} selected</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                                      <button
                      onClick={() => {
                        setPreviewGeneratedFile(null); // Ensure we're not in file preview mode
                        setShowEnhancedPreview(true);
                      }}
                      disabled={selectedLocations.length === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 text-wax-gray-600 font-medium rounded-lg transition-all duration-200 hover:text-wax-red-600 hover:bg-wax-red-50 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => setShowFileComparison(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-wax-gray-600 font-medium rounded-lg transition-all duration-200 hover:text-wax-red-600 hover:bg-wax-red-50 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
                  >
                    <ScaleIcon className="w-4 h-4" />
                    Compare Files
                  </button>
                                     <button
                     onClick={() => setShowSettingsModal(true)}
                     className="inline-flex items-center gap-2 px-4 py-2 text-wax-gray-600 font-medium rounded-lg transition-all duration-200 hover:text-wax-red-600 hover:bg-wax-red-50 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
                   >
                     <Cog6ToothIcon className="w-4 h-4" />
                     Settings
                   </button>
                   {generatedFiles.length > 0 && (
                     <button
                       onClick={() => {
                         const newShowFilesList = !showFilesList;
                         setShowFilesList(newShowFilesList);
                         // Smooth scroll to generated files section when showing
                         if (newShowFilesList) {
                           setTimeout(() => {
                             generatedFilesRef.current?.scrollIntoView({ 
                               behavior: 'smooth', 
                               block: 'start' 
                             });
                           }, 100); // Small delay to ensure the element is rendered
                         }
                       }}
                       className="inline-flex items-center gap-2 px-4 py-2 text-wax-gray-600 font-medium rounded-lg transition-all duration-200 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                     >
                       <DocumentArrowDownIcon className="w-4 h-4" />
                       Generated Files ({generatedFiles.length})
                     </button>
                   )}
                  <button
                    onClick={handleGenerateCampaigns}
                    disabled={selectedLocations.length === 0 || isGenerating}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-transparent text-success-600 font-medium rounded-lg border border-success-500 transition-all duration-200 hover:text-success-700 hover:border-success-600 hover:bg-success-50 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <DocumentArrowDownIcon className="w-4 h-4" />
                    )}
                    Export
                  </button>
              </div>
            </div>
            <div className="px-6 py-6">
              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-wax-gray-400" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-white transition-all duration-200 focus:border-wax-red-500 focus:ring-2 focus:ring-wax-red-100 focus:outline-none"
                  />
                </div>

                {/* Filters and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-wax-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setConfigFilter('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        configFilter === 'all'
                          ? 'bg-white text-wax-red-600 shadow-sm'
                          : 'text-wax-gray-600 hover:text-wax-gray-800'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setConfigFilter('configured')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        configFilter === 'configured'
                          ? 'bg-white text-wax-red-600 shadow-sm'
                          : 'text-wax-gray-600 hover:text-wax-gray-800'
                      }`}
                    >
                      Configured
                    </button>
                    <button
                      onClick={() => setConfigFilter('not-configured')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        configFilter === 'not-configured'
                          ? 'bg-white text-wax-red-600 shadow-sm'
                          : 'text-wax-gray-600 hover:text-wax-gray-800'
                      }`}
                    >
                      Not Configured
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllLocations}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-wax-gray-600 rounded-lg transition-all duration-200 hover:text-wax-red-600 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Select All
                    </button>
                    <button
                      onClick={clearAllSelections}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-wax-gray-600 rounded-lg transition-all duration-200 hover:text-wax-red-600 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              {/* Locations List */}
              <div className="bg-white rounded-xl border border-wax-gray-200 overflow-hidden overflow-y-auto max-h-[26rem]">
                {filteredLocations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-wax-gray-500">No locations found matching your search.</p>
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <LocationItem
                      key={location.id}
                      location={location}
                      isSelected={selectedLocationIds.has(location.id)}
                      onToggle={() => toggleLocationSelection(location.id)}
                      onConfigure={() => openLocationConfig(location)}
                    />
                  ))
                )}
              </div>
            </div>
            {generationJob && (
              <div className="px-6 py-4 border-t border-wax-gray-100 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Export completed successfully!</p>
                      <p className="text-xs text-green-600">Your campaign file is ready to download</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleDownloadCSV}
                    disabled={isDownloading}
                    whileHover={{ scale: downloadSuccess ? 1 : isDownloading ? 1 : 1.05 }}
                    whileTap={{ scale: downloadSuccess ? 1 : isDownloading ? 1 : 0.95 }}
                    animate={downloadSuccess ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                    className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      downloadSuccess 
                        ? 'bg-emerald-600 text-white ring-emerald-500 hover:bg-emerald-700'
                        : isDownloading
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-indigo-500 opacity-75 cursor-not-allowed'
                        : 'bg-green-600 text-white ring-green-500 hover:bg-green-700'
                    }`}
                  >
                    {downloadSuccess ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Downloaded!
                      </>
                    ) : isDownloading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        Download CSV
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
                     </motion.div>

           {/* Generated Files List */}
           {showFilesList && generatedFiles.length > 0 && (
             <motion.div
               ref={generatedFilesRef}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
               className="bg-white rounded-2xl shadow-wax-sm border border-wax-gray-200"
             >
               <div className="px-6 py-4 border-b border-wax-gray-100">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                       <DocumentArrowDownIcon className="w-4 h-4 text-blue-600" />
                     </div>
                     <div>
                       <h3 className="text-lg font-semibold text-wax-gray-800">Generated Files</h3>
                       <p className="text-sm text-wax-gray-500">{generatedFiles.length} file{generatedFiles.length !== 1 ? 's' : ''} available this session</p>
                     </div>
                   </div>
                   <button
                     onClick={() => setShowFilesList(false)}
                     className="text-wax-gray-400 hover:text-wax-gray-600 transition-colors duration-200"
                   >
                     <XCircleIcon className="w-5 h-5" />
                   </button>
                 </div>
               </div>
               <div className="px-6 py-6">
                 <div className="space-y-3">
                   {generatedFiles.map((file) => (
                     <div
                       key={file.id}
                       className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                     >
                       <div className="flex-1">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                             <DocumentArrowDownIcon className="w-5 h-5 text-green-600" />
                           </div>
                           <div>
                             <h4 className="font-medium text-gray-900 text-sm">{file.name}</h4>
                             <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                               <span>{file.locationCount} locations</span>
                               <span>•</span>
                               <span>{file.timestamp.toLocaleString()}</span>
                             </div>
                           </div>
                         </div>
                                               </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreviewFile(file)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             </motion.div>
           )}

             {/* Generation Status */}
            {generationJob && (
              <div className="bg-white rounded-xl shadow-wax-sm border border-wax-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-wax-gray-800 mb-4">Generation Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-wax-gray-600">Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      generationJob.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : generationJob.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {generationJob.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-wax-gray-600">Progress</span>
                    <span className="text-sm font-medium text-wax-gray-800">
                      {Math.round((generationJob.processedAds / generationJob.totalAds) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-wax-gray-200 rounded-full h-2">
                    <div 
                      className="bg-wax-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((generationJob.processedAds / generationJob.totalAds) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
                 </div>

         {/* Success Notification - Bottom Left */}
         {showSuccessNotification && (
           <motion.div 
             initial={{ opacity: 0, x: -100, y: 50 }}
             animate={{ opacity: 1, x: 0, y: 0 }}
             exit={{ opacity: 0, x: -100, y: 50 }}
             className="fixed bottom-6 left-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg z-50 max-w-sm"
           >
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <CheckCircleIcon className="w-5 h-5 text-green-500" />
                 <p className="text-green-700 font-medium">Campaigns exported successfully!</p>
               </div>
               <button 
                 onClick={() => setShowSuccessNotification(false)}
                 className="text-green-500 hover:text-green-700 transition-colors duration-200"
               >
                 <XCircleIcon className="w-5 h-5" />
               </button>
             </div>
           </motion.div>
         )}

         

         {/* Settings Modal */}
        <AnimatePresence>
          {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-wax-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-wax-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-wax-gray-800">Campaign Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-wax-gray-400 hover:text-wax-gray-600 hover:bg-wax-gray-100 transition-all duration-200"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
                <div className="space-y-6">
                  {/* Campaign Settings */}
                  <CollapsibleSection
                    title="Campaign Settings"
                    icon={AdjustmentsHorizontalIcon}
                    isOpen={openSections.campaignConfig}
                    onToggle={() => toggleSection('campaignConfig')}
                    status="completed"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Campaign Prefix *
                          </label>
                          <input
                            type="text"
                            value={campaignConfig.prefix}
                            onChange={(e) => setCampaignConfig({ ...campaignConfig, prefix: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-white transition-all duration-200 focus:border-wax-red-500 focus:ring-2 focus:ring-wax-red-100 focus:outline-none hover:border-wax-gray-300"
                            placeholder="EWC"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Platform
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_CAMPAIGN_SETTINGS.platform}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Budget per Campaign ($) *
                          </label>
                          <input
                            type="number"
                            value={campaignConfig.budget}
                            onChange={(e) => setCampaignConfig({ ...campaignConfig, budget: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-white transition-all duration-200 focus:border-wax-red-500 focus:ring-2 focus:ring-wax-red-100 focus:outline-none hover:border-wax-gray-300"
                            min="1"
                            step="0.01"
                            placeholder="50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Bid Strategy
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_CAMPAIGN_SETTINGS.bidStrategy}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Objective
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_CAMPAIGN_SETTINGS.objective}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Test Type
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_CAMPAIGN_SETTINGS.testType}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_CAMPAIGN_SETTINGS.duration}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Buying Type
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_CAMPAIGN_SETTINGS.buyingType}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Campaign Status
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_CAMPAIGN_SETTINGS.campaignStatus}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <BooleanCheckbox
                            label="New Objective"
                            checked={booleanFields.newObjective}
                            onChange={(checked) => setBooleanFields(prev => ({ ...prev, newObjective: checked }))}
                            disabled={true}
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Buy With Prime Type
                          </label>
                          <input
                            type="text"
                            value="NONE"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <BooleanCheckbox
                            label="Budget Scheduling Enabled"
                            checked={booleanFields.budgetSchedulingEnabled}
                            onChange={(checked) => setBooleanFields(prev => ({ ...prev, budgetSchedulingEnabled: checked }))}
                            disabled={true}
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            High Demand Periods
                          </label>
                          <input
                            type="text"
                            value="[]"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Buy With Integration Partner
                        </label>
                        <input
                          type="text"
                          value="NONE"
                          disabled
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Ad Set Configuration */}
                  <CollapsibleSection
                    title="Ad Set Configuration"
                    icon={PresentationChartLineIcon}
                    isOpen={openSections.adSetConfig}
                    onToggle={() => toggleSection('adSetConfig')}
                    status="completed"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Ad Set Status
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.adSetStatus}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Optimization Goal
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.optimizationGoal}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Optimized Event
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.optimizedEvent}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Billing Event
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.billingEvent}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Brand Safety Filtering
                        </label>
                        <input
                          type="text"
                          value={REFERENCE_ADSET_SETTINGS.brandSafetyInventoryFilteringLevels}
                          disabled
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Ad Set Lifetime Impressions
                          </label>
                          <input
                            type="text"
                            value="0"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Destination Type
                          </label>
                          <input
                            type="text"
                            value="UNDEFINED"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <BooleanCheckbox
                            label="Use Accelerated Delivery"
                            checked={booleanFields.useAcceleratedDelivery}
                            onChange={(checked) => setBooleanFields(prev => ({ ...prev, useAcceleratedDelivery: checked }))}
                            disabled={true}
                          />
                        </div>
                        <div>
                          <BooleanCheckbox
                            label="Budget Scheduling (Ad Set)"
                            checked={booleanFields.budgetSchedulingAdSet}
                            onChange={(checked) => setBooleanFields(prev => ({ ...prev, budgetSchedulingAdSet: checked }))}
                            disabled={true}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            High Demand Periods (Ad Set)
                          </label>
                          <input
                            type="text"
                            value="[]"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Link Object ID
                          </label>
                          <input
                            type="text"
                            value="o:108555182262"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Conversion Tracking Pixels
                          </label>
                          <input
                            type="text"
                            value="tp:1035642271793092"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Landing Page URL
                          </label>
                          <input
                            type="text"
                            value="https://waxcenter.com"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Targeting Configuration */}
                  <CollapsibleSection
                    title="Targeting Configuration"
                    icon={UserGroupIcon}
                    isOpen={openSections.targetingConfig}
                    onToggle={() => toggleSection('targetingConfig')}
                    status="completed"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Gender
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.gender}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Age Min
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.ageMin}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Age Max
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.ageMax}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Location Types
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.locationType}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Excluded Regions
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.excludedRegions}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Interest Targeting (Auto-configured)
                        </label>
                        <textarea
                          value="Waxing, Beauty & Fashion, Wellness SPA, Self care, Shaving, Health And Beauty, European Wax Center, Brazilian Waxing"
                          disabled
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Targeting Relaxation
                        </label>
                        <input
                          type="text"
                          value={REFERENCE_ADSET_SETTINGS.targetingRelaxation}
                          disabled
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Excluded Zip Codes
                          </label>
                          <input
                            type="text"
                            value=""
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Excluded Custom Audiences
                          </label>
                          <input
                            type="text"
                            value="120213927766160508:AUD-FBAllPriorServicedCustomers"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Flexible Inclusions (Interest Targeting Details)
                        </label>
                        <textarea
                          value='[{"interests":[{"id":"6002997877444","name":"Waxing"},{"id":"6003095705016","name":"Beauty & Fashion"},{"id":"6003152657675","name":"Wellness SPA"},{"id":"6003244295567","name":"Self care"},{"id":"6003251053061","name":"Shaving"},{"id":"6003393295343","name":"Health And Beauty"},{"id":"6003503807196","name":"European Wax Center"},{"id":"6003522953242","name":"Brazilian Waxing"},{"id":"6015279452180","name":"Bombshell Brazilian Waxing & Beauty Lounge"}]}]'
                          disabled
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Creative Configuration */}
                  <CollapsibleSection
                    title="Creative Configuration"
                    icon={PhotoIcon}
                    isOpen={openSections.creativeConfig}
                    onToggle={() => toggleSection('creativeConfig')}
                    status="completed"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Ad Title
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_AD_TEMPLATE.title}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Display Link
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_AD_TEMPLATE.displayLink}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Ad Body Text
                        </label>
                        <input
                          type="text"
                          value={REFERENCE_AD_TEMPLATE.body}
                          disabled
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Call to Action
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_AD_TEMPLATE.callToAction}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Creative Format
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_AD_TEMPLATE.dynamicCreativeAdFormat}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Creative Type
                        </label>
                        <input
                          type="text"
                          value={REFERENCE_AD_TEMPLATE.creativeType}
                          disabled
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Ad Status
                          </label>
                          <input
                            type="text"
                            value="ACTIVE"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Title Placement
                          </label>
                          <input
                            type="text"
                            value="primary_text"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Body Placement
                          </label>
                          <input
                            type="text"
                            value="body"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Link Placement
                          </label>
                          <input
                            type="text"
                            value="link"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Preview Link
                          </label>
                          <input
                            type="text"
                            value="https://www.facebook.com/?feed_demo_ad=120228258706880508"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Instagram Preview Link
                          </label>
                          <input
                            type="text"
                            value="https://www.instagram.com/?feed_demo_ad=120228258706880508"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Image Hash
                          </label>
                          <input
                            type="text"
                            value="e72ba1234567890abcdef"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Image Placement
                          </label>
                          <input
                            type="text"
                            value="image"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Video ID
                          </label>
                          <input
                            type="text"
                            value=""
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Video Placement
                          </label>
                          <input
                            type="text"
                            value=""
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Video Thumbnail URL
                          </label>
                          <input
                            type="text"
                            value=""
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Conversion Tracking Pixels
                          </label>
                          <input
                            type="text"
                            value="fb_pixel_123456"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Additional Images & Placements
                        </label>
                        <textarea
                          value="Additional Image 1 Hash: ai1_hash123, Placement: additional_image_1&#10;Additional Image 2 Hash: ai2_hash456, Placement: additional_image_2&#10;Additional Image 3 Hash: ai3_hash789, Placement: additional_image_3&#10;Additional Image 4 Hash: ai4_hash012, Placement: additional_image_4"
                          disabled
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Additional Video 1 ID
                          </label>
                          <input
                            type="text"
                            value=""
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Additional Video 1 Placement
                          </label>
                          <input
                            type="text"
                            value=""
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Additional Video 1 Thumbnail URL
                        </label>
                        <input
                          type="text"
                          value=""
                          disabled
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Tracking & Attribution */}
                  <CollapsibleSection
                    title="Tracking & Attribution"
                    icon={LinkIcon}
                    isOpen={openSections.trackingConfig}
                    onToggle={() => toggleSection('trackingConfig')}
                    status="completed"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          URL Tags (UTM Parameters)
                        </label>
                        <textarea
                          value={REFERENCE_AD_TEMPLATE.urlTags}
                          disabled
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Attribution Spec
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_ADSET_SETTINGS.attributionSpec}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Instagram Account
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_AD_TEMPLATE.instagramAccountId}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Additional Custom Tracking Specs
                          </label>
                          <input
                            type="text"
                            value="custom_tracking_123"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Permalink
                          </label>
                          <input
                            type="text"
                            value="https://www.facebook.com/ads/permalink/123456789"
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

                  {/* Platform Specific Settings */}
                  <CollapsibleSection
                    title="Platform Specific Settings"
                    icon={CubeTransparentIcon}
                    isOpen={openSections.platformConfig}
                    onToggle={() => toggleSection('platformConfig')}
                    status="completed"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <BooleanCheckbox
                            label="Video Retargeting"
                            checked={booleanFields.videoRetargeting}
                            onChange={(checked) => setBooleanFields(prev => ({ ...prev, videoRetargeting: checked }))}
                            disabled={true}
                          />
                        </div>
                        <div>
                          <BooleanCheckbox
                            label="Use Page as Actor"
                            checked={booleanFields.usePageAsActor}
                            onChange={(checked) => setBooleanFields(prev => ({ ...prev, usePageAsActor: checked }))}
                            disabled={true}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <BooleanCheckbox
                            label="Optimize Text per Person"
                            checked={booleanFields.optimizeTextPerPerson}
                            onChange={(checked) => setBooleanFields(prev => ({ ...prev, optimizeTextPerPerson: checked }))}
                            disabled={true}
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                            Degrees of Freedom
                          </label>
                          <input
                            type="text"
                            value={REFERENCE_AD_TEMPLATE.degreesOfFreedomType}
                            disabled
                            className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Dynamic Creative Call to Action
                        </label>
                        <input
                          type="text"
                          value="Learn More"
                          disabled
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                          Ad Placement Configuration
                        </label>
                        <textarea
                          value="Default placements across Facebook, Instagram, Audience Network, and Messenger including feeds, stories, reels, marketplace, and video formats"
                          disabled
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-wax-gray-50 text-wax-gray-600"
                        />
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <EnhancedPreview
        isOpen={showEnhancedPreview}
        onClose={() => {
          setShowEnhancedPreview(false);
          setPreviewGeneratedFile(null);
        }}
        locations={selectedLocations}
        campaign={campaignConfig}
        title={previewGeneratedFile ? `File Preview: ${previewGeneratedFile.name}` : "Campaign Preview"}
        isGeneratedFile={!!previewGeneratedFile}
        onDownloadFile={previewGeneratedFile ? () => handleDownloadFile(previewGeneratedFile) : undefined}
      />

      <FileComparisonModal
        isOpen={showFileComparison}
        onClose={() => setShowFileComparison(false)}
      />

      <LocationConfigModal
        isOpen={showLocationConfig}
        onClose={() => setShowLocationConfig(false)}
        location={selectedLocationForConfig}
        onSave={handleLocationConfigSave}
      />
    </div>
  );
};

export default CampaignCreator; 