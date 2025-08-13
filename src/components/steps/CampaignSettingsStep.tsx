// Component: CampaignSettingsStep
// Purpose: Handle campaign configuration settings and form inputs
// Props: Campaign configuration data and update callbacks
// State: Local form state and validation
// Dependencies: React, Framer Motion, Heroicons, ModernDatePicker

import { CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import type { CampaignConfiguration } from '../../types';
import ModernDatePicker from '../ui/ModernDatePicker';
import Select from '../ui/Select';

interface CampaignSettingsStepProps {
  campaignConfig: CampaignConfiguration;
  onConfigUpdate: (updates: Partial<CampaignConfiguration>) => void;
  onNext: () => void;
  onBack: () => void;
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const objectives = [
  { value: 'Engagement', label: 'Engagement' },
  { value: 'Reach', label: 'Reach' },
  { value: 'Conversions', label: 'Conversions' },
  { value: 'Brand Awareness', label: 'Brand Awareness' },
];

const testTypes = [
  { value: 'LocalTest', label: 'Local Test' },
  { value: 'RegionalTest', label: 'Regional Test' },
  { value: 'NationalTest', label: 'National Test' },
];

const durations = [
  { value: 'Evergreen', label: 'Evergreen' },
  { value: '30Days', label: '30 Days' },
  { value: '60Days', label: '60 Days' },
  { value: '90Days', label: '90 Days' },
];

const bidStrategies = [
  { value: 'Highest volume or value', label: 'Highest Volume or Value' },
  { value: 'Lowest cost per result', label: 'Lowest Cost per Result' },
  { value: 'Cost cap', label: 'Cost Cap' },
];

export default function CampaignSettingsStep({
  campaignConfig,
  onConfigUpdate,
  onNext,
  onBack,
}: CampaignSettingsStepProps) {
  const [localConfig, setLocalConfig] =
    useState<CampaignConfiguration>(campaignConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalConfig(campaignConfig);
  }, [campaignConfig]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localConfig.prefix.trim()) {
      newErrors.prefix = 'Campaign prefix is required';
    }

    if (!localConfig.platform) {
      newErrors.platform = 'Platform selection is required';
    }

    if (!localConfig.objective) {
      newErrors.objective = 'Campaign objective is required';
    }

    if (!localConfig.testType) {
      newErrors.testType = 'Test type is required';
    }

    if (!localConfig.duration) {
      newErrors.duration = 'Campaign duration is required';
    }

    if (localConfig.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    if (!localConfig.bidStrategy) {
      newErrors.bidStrategy = 'Bid strategy is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof CampaignConfiguration,
    value: string | number
  ) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (date: Date) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString();
    const scheduledDate = date.toLocaleDateString('en-US');

    setLocalConfig(prev => ({
      ...prev,
      selectedDate: date,
      month,
      day,
      ads: prev.ads.map(ad => ({ ...ad, scheduledDate })),
    }));
  };

  const handleNext = () => {
    if (validateForm()) {
      onConfigUpdate(localConfig);
      onNext();
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <motion.div
      key="campaign-settings"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto"
    >
      <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
            Campaign Settings
          </h2>
          <p className="text-neutral-600 text-lg">
            Configure your campaign parameters and targeting options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campaign Prefix */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Campaign Prefix *
            </label>
            <input
              type="text"
              value={localConfig.prefix}
              onChange={e => handleInputChange('prefix', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.prefix
                  ? 'border-red-500 focus:ring-red-100'
                  : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100'
              }`}
              placeholder="e.g., EWC, Summer, Holiday"
            />
            {errors.prefix && (
              <p className="text-red-500 text-sm mt-1">{errors.prefix}</p>
            )}
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Platform *
            </label>
            <Select
              value={localConfig.platform}
              onChange={value => handleInputChange('platform', value)}
              options={[
                { value: 'Meta', label: 'Meta (Facebook & Instagram)' },
                { value: 'Google', label: 'Google Ads' },
                { value: 'TikTok', label: 'TikTok Ads' },
              ]}
              className={errors.platform ? 'border-red-500' : ''}
            />
            {errors.platform && (
              <p className="text-red-500 text-sm mt-1">{errors.platform}</p>
            )}
          </div>

          {/* Campaign Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Campaign Date *
            </label>
            <ModernDatePicker
              selectedDate={localConfig.selectedDate}
              onChange={handleDateChange}
              className={errors.selectedDate ? 'border-red-500' : ''}
            />
            {errors.selectedDate && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedDate}</p>
            )}
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Campaign Objective *
            </label>
            <Select
              value={localConfig.objective}
              onChange={value => handleInputChange('objective', value)}
              options={objectives}
              className={errors.objective ? 'border-red-500' : ''}
            />
            {errors.objective && (
              <p className="text-red-500 text-sm mt-1">{errors.objective}</p>
            )}
          </div>

          {/* Test Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Test Type *
            </label>
            <Select
              value={localConfig.testType}
              onChange={value => handleInputChange('testType', value)}
              options={testTypes}
              className={errors.testType ? 'border-red-500' : ''}
            />
            {errors.testType && (
              <p className="text-red-500 text-sm mt-1">{errors.testType}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Campaign Duration *
            </label>
            <Select
              value={localConfig.duration}
              onChange={value => handleInputChange('duration', value)}
              options={durations}
              className={errors.duration ? 'border-red-500' : ''}
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Daily Budget ($) *
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="number"
                value={localConfig.budget}
                onChange={e =>
                  handleInputChange('budget', parseFloat(e.target.value) || 0)
                }
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                  errors.budget
                    ? 'border-red-500 focus:ring-red-100'
                    : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-100'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.budget && (
              <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
            )}
          </div>

          {/* Bid Strategy */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bid Strategy *
            </label>
            <Select
              value={localConfig.bidStrategy}
              onChange={value => handleInputChange('bidStrategy', value)}
              options={bidStrategies}
              className={errors.bidStrategy ? 'border-red-500' : ''}
            />
            {errors.bidStrategy && (
              <p className="text-red-500 text-sm mt-1">{errors.bidStrategy}</p>
            )}
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Target Radius (miles)
            </label>
            <input
              type="number"
              value={localConfig.radius}
              onChange={e =>
                handleInputChange('radius', parseInt(e.target.value) || 0)
              }
              min="0"
              className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-base transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none"
              placeholder="5"
            />
          </div>
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
            disabled={hasErrors}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              hasErrors
                ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            Continue to Ad Configuration
          </button>
        </div>
      </div>
    </motion.div>
  );
}
