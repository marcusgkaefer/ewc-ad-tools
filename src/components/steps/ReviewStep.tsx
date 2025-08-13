// Component: ReviewStep
// Purpose: Display campaign summary for review before generation
// Props: Campaign configuration, locations, templates, and action callbacks
// State: Review confirmation state
// Dependencies: React, Framer Motion, Heroicons

import {
  MapPinIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  TargetIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useState } from 'react';

import type {
  CampaignConfiguration,
  LocationWithConfig,
  AdTemplate,
} from '../../types';

interface ReviewStepProps {
  campaignConfig: CampaignConfiguration;
  selectedLocations: LocationWithConfig[];
  templates: AdTemplate[];
  onBack: () => void;
  onGenerate: () => void;
  onEditStep: (step: number) => void;
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function ReviewStep({
  campaignConfig,
  selectedLocations,
  templates,
  onBack,
  onGenerate,
  onEditStep,
}: ReviewStepProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const getTemplateName = (templateId: string) => {
    return templates.find(t => t.id === templateId)?.name || 'Unknown Template';
  };

  const totalBudget = campaignConfig.budget * selectedLocations.length;

  return (
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
            Review Campaign
          </h2>
          <p className="text-neutral-600 text-lg">
            Review your campaign configuration before generating the final
            files.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Overview */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-2xl border border-primary-200">
              <h3 className="text-xl font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <DocumentDuplicateIcon className="w-5 h-5" />
                Campaign Overview
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Prefix:</span>
                  <span className="font-semibold text-neutral-900">
                    {campaignConfig.prefix}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Platform:</span>
                  <span className="font-semibold text-neutral-900">
                    {campaignConfig.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Objective:</span>
                  <span className="font-semibold text-neutral-900">
                    {campaignConfig.objective}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Test Type:</span>
                  <span className="font-semibold text-neutral-900">
                    {campaignConfig.testType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Duration:</span>
                  <span className="font-semibold text-neutral-900">
                    {campaignConfig.duration}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Daily Budget:</span>
                  <span className="font-semibold text-neutral-900">
                    ${campaignConfig.budget}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bid Strategy:</span>
                  <span className="font-semibold text-neutral-900">
                    {campaignConfig.bidStrategy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Target Radius:</span>
                  <span className="font-semibold text-neutral-900">
                    {campaignConfig.radius} miles
                  </span>
                </div>
              </div>

              <button
                onClick={() => onEditStep(2)}
                className="mt-4 w-full px-4 py-2 text-sm text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Edit Campaign Settings
              </button>
            </div>

            {/* Date Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Campaign Date
              </h3>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {campaignConfig.month} {campaignConfig.day}
                </div>
                <div className="text-green-600">
                  {campaignConfig.selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <button
                onClick={() => onEditStep(2)}
                className="mt-4 w-full px-4 py-2 text-sm text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
              >
                Change Date
              </button>
            </div>
          </div>

          {/* Locations and Ads */}
          <div className="space-y-6">
            {/* Locations Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                Target Locations ({selectedLocations.length})
              </h3>

              <div className="max-h-32 overflow-y-auto space-y-2 mb-4">
                {selectedLocations.map(location => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-blue-800">{location.name}</span>
                    <span className="text-blue-600 text-xs">
                      {location.city}, {location.state}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center text-blue-800 font-semibold mb-4">
                Total Daily Budget: ${totalBudget.toFixed(2)}
              </div>

              <button
                onClick={() => onEditStep(1)}
                className="w-full px-4 py-2 text-sm text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Edit Locations
              </button>
            </div>

            {/* Ads Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <TargetIcon className="w-5 h-5" />
                Ad Configuration ({campaignConfig.ads.length})
              </h3>

              <div className="space-y-3 mb-4">
                {campaignConfig.ads.map(ad => (
                  <div key={ad.id} className="bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-purple-800">
                        {ad.name}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          ad.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : ad.status === 'Paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Template: {getTemplateName(ad.templateId)}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onEditStep(3)}
                className="w-full px-4 py-2 text-sm text-purple-700 border border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Edit Ads
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mt-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConfirmed}
              onChange={e => setHasConfirmed(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-neutral-700">
              I have reviewed all campaign settings and confirm they are
              correct. I understand that generating the campaign will create
              files for {selectedLocations.length} locations.
            </span>
          </label>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-medium transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50"
          >
            Back to Ad Configuration
          </button>
          <button
            onClick={onGenerate}
            disabled={!hasConfirmed}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 ${
              hasConfirmed
                ? 'bg-success-500 text-white shadow-lg shadow-success-500/25 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <CheckCircleIcon className="w-5 h-5" />
            Generate Campaign Files
          </button>
        </div>
      </div>
    </motion.div>
  );
}
