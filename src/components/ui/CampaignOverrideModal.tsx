import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CogIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { CampaignOverrides, LocationOverride, MetaAdTemplateRecord } from '../../types/meta';
import type { LocationWithConfig } from '../../types';

interface CampaignOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (overrides: CampaignOverrides) => void;
  selectedAds: MetaAdTemplateRecord[];
  locations: LocationWithConfig[];
  initialOverrides?: CampaignOverrides;
}

interface OverrideSection {
  id: string;
  title: string;
  description: string;
  isExpanded: boolean;
}

const overrideSections: OverrideSection[] = [
  {
    id: 'campaign',
    title: 'Campaign Settings',
    description: 'Override campaign-level settings for all selected ads',
    isExpanded: false
  },
  {
    id: 'creative',
    title: 'Creative Overrides',
    description: 'Customize ad creative content and messaging',
    isExpanded: false
  },
  {
    id: 'targeting',
    title: 'Targeting Overrides',
    description: 'Modify geographic and demographic targeting',
    isExpanded: false
  },
  {
    id: 'location',
    title: 'Location-Specific Overrides',
    description: 'Set custom overrides for specific locations',
    isExpanded: false
  }
];

export default function CampaignOverrideModal({
  isOpen,
  onClose,
  onSave,
  selectedAds,
  locations,
  initialOverrides
}: CampaignOverrideModalProps) {
  const [overrides, setOverrides] = useState<CampaignOverrides>({
    campaignId: '',
    adSetId: '',
    budget: 0,
    targeting: {},
    creative: {},
    locationSpecific: {}
  });

  const [expandedSections, setExpandedSections] = useState<string[]>(['campaign']);
  const [activeTab, setActiveTab] = useState<'overrides' | 'preview'>('overrides');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize with initial overrides
  useEffect(() => {
    if (initialOverrides) {
      setOverrides(initialOverrides);
    }
  }, [initialOverrides]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateOverride = (path: string, value: any) => {
    setOverrides(prev => {
      const newOverrides = { ...prev };
      const keys = path.split('.');
      let current: any = newOverrides;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newOverrides;
    });
  };

  const updateLocationOverride = (locationId: string, overrideType: keyof LocationOverride, value: any) => {
    setOverrides(prev => ({
      ...prev,
      locationSpecific: {
        ...prev.locationSpecific,
        [locationId]: {
          ...prev.locationSpecific?.[locationId],
          [overrideType]: value
        }
      }
    }));
  };

  const validateOverrides = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate budget
    if (overrides.budget && overrides.budget < 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    // Validate creative overrides
    if (overrides.creative?.title && overrides.creative.title.length > 40) {
      newErrors.creativeTitle = 'Title must be 40 characters or less';
    }

    if (overrides.creative?.body && overrides.creative.body.length > 125) {
      newErrors.creativeBody = 'Body text must be 125 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateOverrides()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(overrides);
    } catch (error) {
      console.error('Error saving overrides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Campaign Overrides</h3>
          <p className="text-sm text-neutral-600">
            Customize campaign settings and location-specific overrides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'overrides' ? 'preview' : 'overrides')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            {activeTab === 'overrides' ? (
              <>
                <EyeIcon className="w-4 h-4" />
                Preview
              </>
            ) : (
              <>
                <CogIcon className="w-4 h-4" />
                Configure
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overrides' && (
          <motion.div
            key="overrides"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Campaign Settings Section */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('campaign')}
                className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-neutral-600" />
                  <div className="text-left">
                    <div className="font-medium text-neutral-900">Campaign Settings</div>
                    <div className="text-sm text-neutral-600">Override campaign-level settings</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${expandedSections.includes('campaign') ? 'rotate-180' : ''}`}>
                  <ArrowRightIcon className="w-5 h-5 text-neutral-400" />
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.includes('campaign') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Campaign ID
                        </label>
                        <input
                          type="text"
                          value={overrides.campaignId || ''}
                          onChange={(e) => updateOverride('campaignId', e.target.value)}
                          placeholder="Enter campaign ID"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Ad Set ID
                        </label>
                        <input
                          type="text"
                          value={overrides.adSetId || ''}
                          onChange={(e) => updateOverride('adSetId', e.target.value)}
                          placeholder="Enter ad set ID"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Budget Override ($)
                        </label>
                        <input
                          type="number"
                          value={overrides.budget || ''}
                          onChange={(e) => updateOverride('budget', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.budget && (
                          <p className="text-sm text-red-600 mt-1">{errors.budget}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Creative Overrides Section */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('creative')}
                className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <EyeIcon className="w-5 h-5 text-neutral-600" />
                  <div className="text-left">
                    <div className="font-medium text-neutral-900">Creative Overrides</div>
                    <div className="text-sm text-neutral-600">Customize ad content and messaging</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${expandedSections.includes('creative') ? 'rotate-180' : ''}`}>
                  <ArrowRightIcon className="w-5 h-5 text-neutral-400" />
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.includes('creative') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-4"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Ad Title Override
                        </label>
                        <input
                          type="text"
                          value={overrides.creative?.title || ''}
                          onChange={(e) => updateOverride('creative.title', e.target.value)}
                          placeholder="Enter custom ad title"
                          maxLength={40}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.creativeTitle && (
                          <p className="text-sm text-red-600 mt-1">{errors.creativeTitle}</p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">
                          {overrides.creative?.title?.length || 0}/40 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Ad Body Override
                        </label>
                        <textarea
                          value={overrides.creative?.body || ''}
                          onChange={(e) => updateOverride('creative.body', e.target.value)}
                          placeholder="Enter custom ad body text"
                          maxLength={125}
                          rows={3}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        {errors.creativeBody && (
                          <p className="text-sm text-red-600 mt-1">{errors.creativeBody}</p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">
                          {overrides.creative?.body?.length || 0}/125 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Call to Action Override
                        </label>
                        <select
                          value={overrides.creative?.call_to_action?.type || ''}
                          onChange={(e) => updateOverride('creative.call_to_action.type', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Use original</option>
                          <option value="LEARN_MORE">Learn More</option>
                          <option value="SHOP_NOW">Shop Now</option>
                          <option value="SIGN_UP">Sign Up</option>
                          <option value="CONTACT_US">Contact Us</option>
                          <option value="BOOK_NOW">Book Now</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location-Specific Overrides Section */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('location')}
                className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-neutral-600" />
                  <div className="text-left">
                    <div className="font-medium text-neutral-900">Location-Specific Overrides</div>
                    <div className="text-sm text-neutral-600">Set custom overrides for specific locations</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${expandedSections.includes('location') ? 'rotate-180' : ''}`}>
                  <ArrowRightIcon className="w-5 h-5 text-neutral-400" />
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.includes('location') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 space-y-4"
                  >
                    <div className="space-y-4">
                      {locations.map((location) => (
                        <div key={location.id} className="p-4 border border-neutral-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-neutral-900">{location.name}</h4>
                              <p className="text-sm text-neutral-600">{location.city}, {location.state}</p>
                            </div>
                            <button
                              onClick={() => {
                                const currentOverrides = overrides.locationSpecific?.[location.id];
                                if (currentOverrides) {
                                  // Remove location overrides
                                  setOverrides(prev => ({
                                    ...prev,
                                    locationSpecific: {
                                      ...prev.locationSpecific,
                                      [location.id]: undefined
                                    }
                                  } as CampaignOverrides));
                                } else {
                                  // Add default location overrides
                                  updateLocationOverride(location.id, 'budget', 0);
                                }
                              }}
                              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                overrides.locationSpecific?.[location.id]
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {overrides.locationSpecific?.[location.id] ? 'Remove' : 'Add'} Overrides
                            </button>
                          </div>

                          {overrides.locationSpecific?.[location.id] && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                  Location Budget ($)
                                </label>
                                <input
                                  type="number"
                                  value={overrides.locationSpecific[location.id]?.budget || 0}
                                  onChange={(e) => updateLocationOverride(location.id, 'budget', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                  Custom Title
                                </label>
                                <input
                                  type="text"
                                  value={overrides.locationSpecific?.[location.id]?.creative?.title || ''}
                                  onChange={(e) => updateLocationOverride(location.id, 'creative', {
                                    ...overrides.locationSpecific?.[location.id]?.creative,
                                    title: e.target.value
                                  })}
                                  placeholder="Enter location-specific title"
                                  maxLength={40}
                                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                  Custom Body
                                </label>
                                <textarea
                                  value={overrides.locationSpecific?.[location.id]?.creative?.body || ''}
                                  onChange={(e) => updateLocationOverride(location.id, 'creative', {
                                    ...overrides.locationSpecific?.[location.id]?.creative,
                                    body: e.target.value
                                  })}
                                  placeholder="Enter location-specific body text"
                                  maxLength={125}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-xl">
              <h4 className="font-medium text-neutral-900 mb-4">Override Summary</h4>
              
              <div className="space-y-4">
                {overrides.budget && overrides.budget > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Budget Override:</span>
                    <span className="font-medium text-neutral-900">${overrides.budget}</span>
                  </div>
                )}

                {overrides.creative?.title && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Title Override:</span>
                    <span className="font-medium text-neutral-900">{overrides.creative.title}</span>
                  </div>
                )}

                {overrides.creative?.body && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Body Override:</span>
                    <span className="font-medium text-neutral-900">{overrides.creative.body}</span>
                  </div>
                )}

                {Object.keys(overrides.locationSpecific || {}).length > 0 && (
                  <div>
                    <span className="text-sm text-neutral-700">Location Overrides:</span>
                    <div className="mt-2 space-y-2">
                      {Object.entries(overrides.locationSpecific || {}).map(([locationId, override]) => {
                        const location = locations.find(l => l.id === locationId);
                        return (
                          <div key={locationId} className="pl-4 border-l-2 border-neutral-300">
                            <div className="text-sm font-medium text-neutral-900">{location?.name}</div>
                            {override?.budget && (
                              <div className="text-xs text-neutral-600">Budget: ${override.budget}</div>
                            )}
                            {override?.creative?.title && (
                              <div className="text-xs text-neutral-600">Title: {override.creative.title}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {Object.keys(overrides.locationSpecific || {}).length === 0 && 
                 !overrides.budget && 
                 !overrides.creative?.title && 
                 !overrides.creative?.body && (
                  <div className="text-center py-8 text-neutral-500">
                    <InformationCircleIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                    <p>No overrides configured</p>
                    <p className="text-sm">Configure overrides to customize your campaign</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="px-4 py-2 text-neutral-700 hover:text-neutral-900 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || Object.keys(errors).length > 0}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Overrides
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}