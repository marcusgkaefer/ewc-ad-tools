import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import Select from './Select';
import ModernDatePicker from './ModernDatePicker';
import type { 
  Campaign, 
  CreateCampaignRequest, 
  UpdateCampaignRequest,
  LocationWithConfig as LocationSummary,
  CampaignWithLocations 
} from '../../types';
import { supabaseCampaignService } from '../../services/supabaseCampaignService';
import { supabaseLocationService } from '../../services/supabaseLocationService';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: CampaignWithLocations | null;
  onSave: (campaign: Campaign) => void;
}

const PLATFORM_OPTIONS = [
  { value: 'Meta', label: 'Meta (Facebook/Instagram)' },
  { value: 'Google', label: 'Google Ads' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Twitter', label: 'Twitter' },
];

const OBJECTIVE_OPTIONS = [
  { value: 'Engagement', label: 'Engagement' },
  { value: 'Traffic', label: 'Traffic' },
  { value: 'Conversions', label: 'Conversions' },
  { value: 'Lead Generation', label: 'Lead Generation' },
  { value: 'Brand Awareness', label: 'Brand Awareness' },
  { value: 'Reach', label: 'Reach' },
];

const TEST_TYPE_OPTIONS = [
  { value: 'LocalTest', label: 'Local Test' },
  { value: 'RegionalTest', label: 'Regional Test' },
  { value: 'NationalTest', label: 'National Test' },
  { value: 'ABTest', label: 'A/B Test' },
];

const DURATION_OPTIONS = [
  { value: 'Evergreen', label: 'Evergreen' },
  { value: '1Week', label: '1 Week' },
  { value: '2Weeks', label: '2 Weeks' },
  { value: '1Month', label: '1 Month' },
  { value: '3Months', label: '3 Months' },
  { value: 'Custom', label: 'Custom' },
];

const BID_STRATEGY_OPTIONS = [
  { value: 'Highest volume or value', label: 'Highest volume or value' },
  { value: 'Cost per action', label: 'Cost per action' },
  { value: 'Lowest cost', label: 'Lowest cost' },
  { value: 'Bid cap', label: 'Bid cap' },
  { value: 'Target cost', label: 'Target cost' },
];

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Active', label: 'Active' },
  { value: 'Paused', label: 'Paused' },
  { value: 'Completed', label: 'Completed' },
];

export function CampaignModal({ 
  isOpen, 
  onClose, 
  campaign,
  onSave 
}: CampaignModalProps) {
  // Form state
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Meta');
  const [objective, setObjective] = useState('Engagement');
  const [testType, setTestType] = useState('LocalTest');
  const [duration, setDuration] = useState('Evergreen');
  const [budget, setBudget] = useState('');
  const [bidStrategy, setBidStrategy] = useState('Highest volume or value');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [defaultRadiusMiles, setDefaultRadiusMiles] = useState('5');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Active' | 'Paused' | 'Completed'>('Draft');

  // Location management
  const [availableLocations, setAvailableLocations] = useState<LocationSummary[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [configurationFilter, setConfigurationFilter] = useState<'all' | 'configured' | 'not-configured'>('all');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Load available locations
  useEffect(() => {
    if (isOpen) {
      loadAvailableLocations();
    }
  }, [isOpen]);

  // Initialize form with existing campaign data
  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setPlatform(campaign.platform);
      setObjective(campaign.objective);
      setTestType(campaign.testType);
      setDuration(campaign.duration);
      setBudget(campaign.budget.toString());
      setBidStrategy(campaign.bidStrategy);
      setStartDate(campaign.startDate ? new Date(campaign.startDate) : null);
      setEndDate(campaign.endDate ? new Date(campaign.endDate) : null);
      setDefaultRadiusMiles(campaign.defaultRadiusMiles.toString());
      setNotes(campaign.notes || '');
      setStatus(campaign.status);
      setSelectedLocationIds(campaign.locations.map(cl => cl.locationId));
    } else {
      // Reset form for new campaign
      setName('');
      setPlatform('Meta');
      setObjective('Engagement');
      setTestType('LocalTest');
      setDuration('Evergreen');
      setBudget('');
      setBidStrategy('Highest volume or value');
      setStartDate(null);
      setEndDate(null);
      setDefaultRadiusMiles('5');
      setNotes('');
      setStatus('Draft');
      setSelectedLocationIds([]);
    }
    setError(null);
    setLocationSearchQuery('');
    setConfigurationFilter('all');
    setShowLocationSelector(false);
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const loadAvailableLocations = async () => {
    try {
      const locations = await supabaseLocationService.getLocationsWithConfigs();
      setAvailableLocations(locations);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Failed to load locations');
    }
  };

  const filteredLocations = availableLocations.filter(location => {
    // Search filter
    const searchMatch = location.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
      location.state.toLowerCase().includes(locationSearchQuery.toLowerCase());

    // Configuration filter
    const configMatch = configurationFilter === 'all' || 
      (configurationFilter === 'configured' && location.config) ||
      (configurationFilter === 'not-configured' && !location.config);

    return searchMatch && configMatch;
  });

  const selectedLocations = availableLocations.filter(loc => 
    selectedLocationIds.includes(loc.id)
  );

  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocationIds(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return 'Campaign name is required';
    }

    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      return 'Please enter a valid budget amount';
    }

    const radiusValue = parseFloat(defaultRadiusMiles);
    if (isNaN(radiusValue) || radiusValue <= 0) {
      return 'Please enter a valid default radius';
    }

    if (startDate && endDate && startDate >= endDate) {
      return 'End date must be after start date';
    }

    if (selectedLocationIds.length === 0) {
      return 'Please select at least one location for the campaign';
    }

    return null;
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }

      const budgetValue = parseFloat(budget);
      const radiusValue = parseFloat(defaultRadiusMiles);

      if (campaign) {
        // Update existing campaign
        const updateRequest: UpdateCampaignRequest = {
          name: name.trim(),
          platform,
          objective,
          testType,
          duration,
          budget: budgetValue,
          bidStrategy,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          defaultRadiusMiles: radiusValue,
          status,
          notes: notes.trim() || undefined,
        };

        const updatedCampaign = await supabaseCampaignService.updateCampaign(
          campaign.id,
          updateRequest
        );

        // Handle location changes
        const currentLocationIds = campaign.locations.map(cl => cl.locationId);
        const locationsToAdd = selectedLocationIds.filter(id => !currentLocationIds.includes(id));
        const locationsToRemove = currentLocationIds.filter(id => !selectedLocationIds.includes(id));

        // Add new locations
        if (locationsToAdd.length > 0) {
          await supabaseCampaignService.bulkAddLocationsToCampaign(
            campaign.id,
            locationsToAdd,
            budgetValue,
            radiusValue
          );
        }

        // Remove locations
        for (const locationId of locationsToRemove) {
          await supabaseCampaignService.removeLocationFromCampaign(campaign.id, locationId);
        }

        onSave(updatedCampaign);
      } else {
        // Create new campaign
        const createRequest: CreateCampaignRequest = {
          name: name.trim(),
          platform,
          objective,
          testType,
          duration,
          budget: budgetValue,
          bidStrategy,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          defaultRadiusMiles: radiusValue,
          notes: notes.trim() || undefined,
        };

        const newCampaign = await supabaseCampaignService.createCampaign(createRequest);

        // Add selected locations to campaign
        if (selectedLocationIds.length > 0) {
          await supabaseCampaignService.bulkAddLocationsToCampaign(
            newCampaign.id,
            selectedLocationIds,
            budgetValue,
            radiusValue
          );
        }

        onSave(newCampaign);
      }

      onClose();
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {campaign ? 'Edit Campaign' : 'Create Campaign'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter campaign name"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50"
              />
            </div>

            {/* Platform */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <Select
                value={platform}
                onChange={setPlatform}
                options={PLATFORM_OPTIONS}
                disabled={isLoading}
              />
            </div>

            {/* Objective */}
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
                Objective
              </label>
              <Select
                value={objective}
                onChange={setObjective}
                options={OBJECTIVE_OPTIONS}
                disabled={isLoading}
              />
            </div>

            {/* Test Type */}
            <div>
              <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-2">
                Test Type
              </label>
              <Select
                value={testType}
                onChange={setTestType}
                options={TEST_TYPE_OPTIONS}
                disabled={isLoading}
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <Select
                value={duration}
                onChange={setDuration}
                options={DURATION_OPTIONS}
                disabled={isLoading}
              />
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter budget amount"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Default Radius */}
            <div>
              <label htmlFor="defaultRadius" className="block text-sm font-medium text-gray-700 mb-2">
                Default Radius (miles) *
              </label>
              <input
                type="number"
                id="defaultRadius"
                value={defaultRadiusMiles}
                onChange={(e) => setDefaultRadiusMiles(e.target.value)}
                placeholder="5"
                min="0.1"
                step="0.1"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50"
              />
            </div>

            {/* Bid Strategy */}
            <div>
              <label htmlFor="bidStrategy" className="block text-sm font-medium text-gray-700 mb-2">
                Bid Strategy
              </label>
              <Select
                value={bidStrategy}
                onChange={setBidStrategy}
                options={BID_STRATEGY_OPTIONS}
                disabled={isLoading}
              />
            </div>

            {/* Status (only for edit mode) */}
            {campaign && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={status}
                  onChange={(value: string) => setStatus(value as 'Draft' | 'Active' | 'Paused' | 'Completed')}
                  options={STATUS_OPTIONS}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <ModernDatePicker
                value={startDate}
                onChange={setStartDate}
                disabled={isLoading}
                placeholder="Select start date"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <ModernDatePicker
                value={endDate}
                onChange={setEndDate}
                disabled={isLoading}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Locations * ({selectedLocationIds.length} selected)
              </label>
              <Button
                onClick={() => setShowLocationSelector(!showLocationSelector)}
                size="sm"
                variant="ghost"
                disabled={isLoading}
              >
                {showLocationSelector ? 'Hide' : 'Select'} Locations
              </Button>
            </div>

            {/* Selected Locations Display */}
            {selectedLocations.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {selectedLocations.map(location => (
                    <span
                      key={location.id}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {location.name} ({location.city}, {location.state})
                      <button
                        onClick={() => toggleLocationSelection(location.id)}
                        disabled={isLoading}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location Selector */}
            {showLocationSelector && (
              <div className="border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder="Search locations..."
                  disabled={isLoading}
                  className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50"
                />
                
                {/* Configuration Filter */}
                <div className="mb-3 flex gap-2">
                  <button
                    onClick={() => setConfigurationFilter('all')}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                      configurationFilter === 'all'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Locations
                  </button>
                  <button
                    onClick={() => setConfigurationFilter('configured')}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                      configurationFilter === 'configured'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Configured
                  </button>
                  <button
                    onClick={() => setConfigurationFilter('not-configured')}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                      configurationFilter === 'not-configured'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Not Configured
                  </button>
                </div>
                
                {/* Filter Results Count */}
                {(locationSearchQuery || configurationFilter !== 'all') && (
                  <div className="mb-2 text-xs text-gray-500">
                    Showing {filteredLocations.length} of {availableLocations.length} locations
                  </div>
                )}
                
                <div className="space-y-1">
                  {filteredLocations.map(location => (
                    <label
                      key={location.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocationIds.includes(location.id)}
                        onChange={() => toggleLocationSelection(location.id)}
                        disabled={isLoading}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {location.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {location.city}, {location.state} {location.zipCode}
                        </div>
                        {location.config && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Configured
                            </span>
                            {location.config.budget && (
                              <span className="text-xs text-blue-600 font-medium">
                                Budget: ${location.config.budget.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}
                        {location.config && location.config.notes && (
                          <div className="text-xs text-gray-400 mt-1 italic truncate">
                            "{location.config.notes}"
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                
                {filteredLocations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {locationSearchQuery || configurationFilter !== 'all' 
                      ? `No locations found matching your ${locationSearchQuery ? 'search' : ''}${locationSearchQuery && configurationFilter !== 'all' ? ' and ' : ''}${configurationFilter !== 'all' ? 'filter' : ''}.`
                      : 'No locations available.'
                    }
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or additional information about this campaign..."
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleClose}
              variant="ghost"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 