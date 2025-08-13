// Component: AdConfigurationStep
// Purpose: Handle ad configuration, template selection, and ad management
// Props: Ad configuration data, templates, and update callbacks
// State: Local ad configuration state and validation
// Dependencies: React, Framer Motion, Heroicons, generateAdName utility

import {
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { generateAdName } from '../../constants/hardcodedAdValues';
import type {
  AdConfiguration,
  AdTemplate,
  CampaignConfiguration,
} from '../../types';

interface AdConfigurationStepProps {
  campaignConfig: CampaignConfiguration;
  templates: AdTemplate[];
  onConfigUpdate: (updates: Partial<CampaignConfiguration>) => void;
  onNext: () => void;
  onBack: () => void;
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const adStatuses = [
  { value: 'Active', label: 'Active', icon: PlayIcon, color: 'text-green-600' },
  {
    value: 'Paused',
    label: 'Paused',
    icon: PauseIcon,
    color: 'text-yellow-600',
  },
  {
    value: 'Draft',
    label: 'Draft',
    icon: DocumentDuplicateIcon,
    color: 'text-blue-600',
  },
];

export default function AdConfigurationStep({
  campaignConfig,
  templates,
  onConfigUpdate,
  onNext,
  onBack,
}: AdConfigurationStepProps) {
  const [localAds, setLocalAds] = useState<AdConfiguration[]>(
    campaignConfig.ads
  );
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {}
  );

  useEffect(() => {
    setLocalAds(campaignConfig.ads);
  }, [campaignConfig.ads]);

  const validateAds = (): boolean => {
    const newErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    localAds.forEach((ad, index) => {
      const adErrors: Record<string, string> = {};

      if (!ad.name.trim()) {
        adErrors.name = 'Ad name is required';
        hasErrors = true;
      }

      if (!ad.templateId) {
        adErrors.templateId = 'Template selection is required';
        hasErrors = true;
      }

      if (!ad.caption.trim()) {
        adErrors.caption = 'Ad caption is required';
        hasErrors = true;
      }

      if (adErrors.name || adErrors.templateId || adErrors.caption) {
        newErrors[index] = adErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const addNewAd = () => {
    const newAd: AdConfiguration = {
      id: `ad-${Date.now()}`,
      name: generateAdName(
        'Template',
        campaignConfig.month,
        campaignConfig.day
      ),
      templateId: templates[0]?.id || '',
      radius: '+4m',
      caption: 'You learn something new everyday',
      additionalNotes: '',
      scheduledDate: campaignConfig.selectedDate.toLocaleDateString('en-US'),
      status: 'Paused',
    };

    setLocalAds(prev => [...prev, newAd]);
  };

  const removeAd = (adId: string) => {
    if (localAds.length > 1) {
      setLocalAds(prev => prev.filter(ad => ad.id !== adId));
    }
  };

  const updateAd = (adId: string, updates: Partial<AdConfiguration>) => {
    setLocalAds(prev =>
      prev.map(ad => (ad.id === adId ? { ...ad, ...updates } : ad))
    );

    // Clear errors for updated field
    const adIndex = localAds.findIndex(ad => ad.id === adId);
    if (adIndex !== -1 && errors[adIndex]) {
      const fieldName = Object.keys(updates)[0];
      if (fieldName && errors[adIndex][fieldName]) {
        setErrors(prev => ({
          ...prev,
          [adIndex]: {
            ...prev[adIndex],
            [fieldName]: '',
          },
        }));
      }
    }
  };

  const handleNext = () => {
    if (validateAds()) {
      onConfigUpdate({ ads: localAds });
      onNext();
    }
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = adStatuses.find(s => s.value === status);
    if (statusConfig) {
      const Icon = statusConfig.icon;
      return <Icon className={`w-4 h-4 ${statusConfig.color}`} />;
    }
    return null;
  };

  return (
    <motion.div
      key="ad-configuration"
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
            Configure your ads with templates, captions, and targeting options.
          </p>
        </div>

        {/* Ad List */}
        <div className="space-y-6">
          {localAds.map((ad, index) => (
            <div
              key={ad.id}
              className="border-2 border-neutral-200 rounded-2xl p-6 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-neutral-900">
                  Ad {index + 1}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(ad.status)}
                  <span className="text-sm font-medium text-neutral-600">
                    {ad.status}
                  </span>
                  {localAds.length > 1 && (
                    <button
                      onClick={() => removeAd(ad.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove ad"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ad Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Ad Name *
                  </label>
                  <input
                    type="text"
                    value={ad.name}
                    onChange={e => updateAd(ad.id, { name: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                      errors[index]?.name
                        ? 'border-red-500 focus:ring-red-100'
                        : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100'
                    }`}
                    placeholder="Enter ad name"
                  />
                  {errors[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[index].name}
                    </p>
                  )}
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Template *
                  </label>
                  <select
                    value={ad.templateId}
                    onChange={e =>
                      updateAd(ad.id, { templateId: e.target.value })
                    }
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                      errors[index]?.templateId
                        ? 'border-red-500 focus:ring-red-100'
                        : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100'
                    }`}
                  >
                    <option value="">Select a template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {errors[index]?.templateId && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[index].templateId}
                    </p>
                  )}
                </div>

                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Target Radius
                  </label>
                  <input
                    type="text"
                    value={ad.radius}
                    onChange={e => updateAd(ad.id, { radius: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-base transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                    placeholder="+4m"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <select
                    value={ad.status}
                    onChange={e =>
                      updateAd(ad.id, {
                        status: e.target.value as AdConfiguration['status'],
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-base transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                  >
                    {adStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Caption */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Ad Caption *
                  </label>
                  <textarea
                    value={ad.caption}
                    onChange={e => updateAd(ad.id, { caption: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                      errors[index]?.caption
                        ? 'border-red-500 focus:ring-red-100'
                        : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100'
                    }`}
                    placeholder="Enter your ad caption"
                  />
                  {errors[index]?.caption && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[index].caption}
                    </p>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={ad.additionalNotes}
                    onChange={e =>
                      updateAd(ad.id, { additionalNotes: e.target.value })
                    }
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-base transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                    placeholder="Any additional notes or instructions"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Ad Button */}
        <div className="mt-6">
          <button
            onClick={addNewAd}
            className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-neutral-300 text-neutral-600 rounded-xl font-medium transition-all duration-300 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50"
          >
            <PlusIcon className="w-5 h-5" />
            Add Another Ad
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-medium transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Continue to Review
          </button>
        </div>
      </div>
    </motion.div>
  );
}
