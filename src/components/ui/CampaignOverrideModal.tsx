import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
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
  TrashIcon
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
    description: 'Override campaign-level settings for all selected ads'
  },
  {
    id: 'creative',
    title: 'Creative Overrides',
    description: 'Customize ad creative content and messaging'
  },
  {
    id: 'targeting',
    title: 'Targeting Overrides',
    description: 'Modify geographic and demographic targeting'
  },
  {
    id: 'location',
    title: 'Location-Specific Overrides',
    description: 'Set custom overrides for specific locations'
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

    // Validate targeting
    if (overrides.targeting?.age_min && overrides.targeting.age_min < 13) {
      newErrors.ageMin = 'Minimum age must be at least 13';
    }

    if (overrides.targeting?.age_max && overrides.targeting.age_max > 65) {
      newErrors.ageMax = 'Maximum age cannot exceed 65';
    }

    if (overrides.targeting?.age_min && overrides.targeting?.age_max && 
        overrides.targeting.age_min > overrides.targeting.age_max) {
      newErrors.ageRange = 'Minimum age cannot be greater than maximum age';
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
      onClose();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                  <CogIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Campaign Overrides</h2>
                  <p className="text-sm text-neutral-600">
                    Customize {selectedAds.length} ads for {locations.length} locations
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('overrides')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overrides'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Overrides
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Preview
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'overrides' && (
                  <motion.div
                    key="overrides"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    {/* Campaign Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">Campaign Settings</h3>
                          <p className="text-sm text-neutral-600">Override campaign-level settings</p>
                        </div>
                        <button
                          onClick={() => toggleSection('campaign')}
                          className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          {expandedSections.includes('campaign') ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedSections.includes('campaign') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 p-4 bg-neutral-50 rounded-xl"
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
                                  Budget (USD)
                                </label>
                                <input
                                  type="number"
                                  value={overrides.budget || ''}
                                  onChange={(e) => updateOverride('budget', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.budget ? 'border-red-300' : 'border-neutral-300'
                                  }`}
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

                    {/* Creative Overrides */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">Creative Overrides</h3>
                          <p className="text-sm text-neutral-600">Customize ad creative content</p>
                        </div>
                        <button
                          onClick={() => toggleSection('creative')}
                          className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          {expandedSections.includes('creative') ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedSections.includes('creative') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 p-4 bg-neutral-50 rounded-xl"
                          >
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                  Ad Title
                                </label>
                                <input
                                  type="text"
                                  value={overrides.creative?.title || ''}
                                  onChange={(e) => updateOverride('creative.title', e.target.value)}
                                  placeholder="Enter custom ad title"
                                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                  Ad Body
                                </label>
                                <textarea
                                  value={overrides.creative?.body || ''}
                                  onChange={(e) => updateOverride('creative.body', e.target.value)}
                                  placeholder="Enter custom ad body text"
                                  rows={3}
                                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                  Call to Action
                                </label>
                                <select
                                  value={overrides.creative?.call_to_action?.type || ''}
                                  onChange={(e) => updateOverride('creative.call_to_action.type', e.target.value)}
                                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="">Select CTA</option>
                                  <option value="BOOK_TRAVEL">Book Travel</option>
                                  <option value="SHOP_NOW">Shop Now</option>
                                  <option value="LEARN_MORE">Learn More</option>
                                  <option value="SIGN_UP">Sign Up</option>
                                  <option value="GET_QUOTE">Get Quote</option>
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Targeting Overrides */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">Targeting Overrides</h3>
                          <p className="text-sm text-neutral-600">Modify geographic and demographic targeting</p>
                        </div>
                        <button
                          onClick={() => toggleSection('targeting')}
                          className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          {expandedSections.includes('targeting') ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedSections.includes('targeting') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 p-4 bg-neutral-50 rounded-xl"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                  Minimum Age
                                </label>
                                <input
                                  type="number"
                                  value={overrides.targeting?.age_min || ''}
                                  onChange={(e) => updateOverride('targeting.age_min', parseInt(e.target.value) || undefined)}
                                  placeholder="18"
                                  min="13"
                                  max="65"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.ageMin ? 'border-red-300' : 'border-neutral-300'
                                  }`}
                                />
                                {errors.ageMin && (
                                  <p className="text-sm text-red-600 mt-1">{errors.ageMin}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                  Maximum Age
                                </label>
                                <input
                                  type="number"
                                  value={overrides.targeting?.age_max || ''}
                                  onChange={(e) => updateOverride('targeting.age_max', parseInt(e.target.value) || undefined)}
                                  placeholder="65"
                                  min="13"
                                  max="65"
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.ageMax ? 'border-red-300' : 'border-neutral-300'
                                  }`}
                                />
                                {errors.ageMax && (
                                  <p className="text-sm text-red-600 mt-1">{errors.ageMax}</p>
                                )}
                              </div>
                            </div>
                            {errors.ageRange && (
                              <p className="text-sm text-red-600">{errors.ageRange}</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Location-Specific Overrides */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">Location-Specific Overrides</h3>
                          <p className="text-sm text-neutral-600">Set custom overrides for specific locations</p>
                        </div>
                        <button
                          onClick={() => toggleSection('location')}
                          className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          {expandedSections.includes('location') ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {expandedSections.includes('location') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 p-4 bg-neutral-50 rounded-xl"
                          >
                            <div className="space-y-4">
                              {locations.map((location) => (
                                <div key={location.id} className="p-4 border border-neutral-200 rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <MapPinIcon className="w-4 h-4 text-neutral-500" />
                                      <span className="font-medium text-neutral-900">{location.name}</span>
                                      <span className="text-sm text-neutral-500">({location.city}, {location.state})</span>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Location Budget (USD)
                                      </label>
                                      <input
                                        type="number"
                                        value={overrides.locationSpecific?.[location.id]?.budget || ''}
                                        onChange={(e) => updateLocationOverride(location.id, 'budget', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Custom Title
                                      </label>
                                      <input
                                        type="text"
                                        value={overrides.locationSpecific?.[location.id]?.creative?.title || ''}
                                        onChange={(e) => updateLocationOverride(location.id, 'creative', {
                                          ...overrides.locationSpecific?.[location.id]?.creative,
                                          title: e.target.value
                                        })}
                                        placeholder="Custom title for this location"
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                    </div>
                                  </div>
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
                    className="p-6 space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Override Preview</h3>
                      <div className="space-y-4">
                        {selectedAds.map((ad) => (
                          <div key={ad.meta_ad_id} className="p-4 border border-neutral-200 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-neutral-900">{ad.name}</h4>
                              <span className="text-sm text-neutral-500">ID: {ad.meta_ad_id}</span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              {overrides.creative?.title && (
                                <div>
                                  <span className="font-medium text-neutral-700">Title Override:</span>
                                  <span className="ml-2 text-neutral-600">{overrides.creative.title}</span>
                                </div>
                              )}
                              {overrides.creative?.body && (
                                <div>
                                  <span className="font-medium text-neutral-700">Body Override:</span>
                                  <span className="ml-2 text-neutral-600">{overrides.creative.body}</span>
                                </div>
                              )}
                              {overrides.budget && (
                                <div>
                                  <span className="font-medium text-neutral-700">Budget Override:</span>
                                  <span className="ml-2 text-neutral-600">${overrides.budget.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-neutral-200">
              <div className="text-sm text-neutral-600">
                {selectedAds.length} ads selected • {locations.length} locations
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-neutral-700 hover:text-neutral-900 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Overrides
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}