import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  CogIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import MetaAccountModal from './MetaAccountModal';
import MetaAdsBrowser from './MetaAdsBrowser';
import CampaignOverrideModal from './CampaignOverrideModal';
import { metaIntegrationService } from '../../services/metaIntegrationService';
import type { MetaAdTemplateRecord, CampaignOverrides } from '../../types/meta';
import type { LocationWithConfig, CampaignConfiguration } from '../../types';

interface MetaAdsCampaignCreatorProps {
  locations: LocationWithConfig[];
  onCampaignCreate: (campaignConfig: CampaignConfiguration, selectedAds: MetaAdTemplateRecord[], overrides: CampaignOverrides) => void;
  onClose: () => void;
}

interface CampaignStep {
  id: 'connection' | 'selection' | 'overrides' | 'review';
  title: string;
  description: string;
}

const campaignSteps: CampaignStep[] = [
  {
    id: 'connection',
    title: 'Connect Meta Account',
    description: 'Link your Meta advertising account to access your ads'
  },
  {
    id: 'selection',
    title: 'Select Meta Ads',
    description: 'Choose which Meta ads to use for your campaign'
  },
  {
    id: 'overrides',
    title: 'Configure Overrides',
    description: 'Customize campaign settings and location-specific overrides'
  },
  {
    id: 'review',
    title: 'Review & Create',
    description: 'Review your campaign configuration and create the campaign'
  }
];

export default function MetaAdsCampaignCreator({
  locations,
  onCampaignCreate,
  onClose
}: MetaAdsCampaignCreatorProps) {
  const [currentStep, setCurrentStep] = useState<'connection' | 'selection' | 'overrides' | 'review'>('connection');
  const [metaAccountId, setMetaAccountId] = useState<string | null>(null);
  const [metaAccountName, setMetaAccountName] = useState<string>('');
  const [selectedAds, setSelectedAds] = useState<MetaAdTemplateRecord[]>([]);
  const [campaignOverrides, setCampaignOverrides] = useState<CampaignOverrides>({
    campaignId: '',
    adSetId: '',
    budget: 0,
    targeting: {},
    creative: {},
    locationSpecific: {}
  });
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfiguration>({
    prefix: 'EWC',
    platform: 'Meta',
    selectedDate: new Date(),
    month: new Date().toLocaleString('default', { month: 'long' }),
    day: new Date().getDate().toString(),
    objective: 'Engagement',
    testType: 'LocalTest',
    duration: 'Evergreen',
    budget: 100,
    bidStrategy: 'Highest volume or value',
    startDate: new Date().toLocaleDateString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    ads: [],
    radius: 5
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMetaAccountModal, setShowMetaAccountModal] = useState(false);

  // Check if user has connected Meta account
  useEffect(() => {
    checkMetaConnection();
  }, []);

  const checkMetaConnection = async () => {
    try {
      // TODO: Get user ID from auth context
      const accounts = await metaIntegrationService.getMetaAccounts('current-user-id');
      if (accounts.length > 0) {
        setMetaAccountId(accounts[0].account_id);
        setMetaAccountName(accounts[0].account_name);
        setCurrentStep('selection');
      }
    } catch (error) {
      console.error('Error checking Meta connection:', error);
    }
  };

  const handleMetaAccountSuccess = (accountId: string, accountName: string) => {
    setMetaAccountId(accountId);
    setMetaAccountName(accountName);
    setCurrentStep('selection');
    setShowMetaAccountModal(false);
  };

  const handleAdSelect = (ad: MetaAdTemplateRecord) => {
    setSelectedAds(prev => {
      const exists = prev.find(a => a.meta_ad_id === ad.meta_ad_id);
      if (exists) {
        return prev.filter(a => a.meta_ad_id !== ad.meta_ad_id);
      } else {
        return [...prev, ad];
      }
    });
  };

  const handleAdDeselect = (adId: string) => {
    setSelectedAds(prev => prev.filter(ad => ad.meta_ad_id !== adId));
  };

  const handleOverridesSave = (overrides: CampaignOverrides) => {
    setCampaignOverrides(overrides);
    setCurrentStep('review');
  };

  const handleCampaignCreate = async () => {
    if (selectedAds.length === 0) {
      setError('Please select at least one Meta ad');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCampaignCreate(campaignConfig, selectedAds, campaignOverrides);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'connection':
        return metaAccountId !== null;
      case 'selection':
        return selectedAds.length > 0;
      case 'overrides':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const getStepIndex = (step: string) => {
    return campaignSteps.findIndex(s => s.id === step);
  };

  const isStepComplete = (step: string) => {
    const currentIndex = getStepIndex(currentStep);
    const stepIndex = getStepIndex(step);
    return stepIndex < currentIndex;
  };

  const isStepActive = (step: string) => {
    return step === currentStep;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-6xl bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Meta Ads Campaign Creator</h2>
                <p className="text-sm text-neutral-600">Create campaigns using your existing Meta ads</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-neutral-50">
            <div className="flex items-center justify-between">
              {campaignSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        isStepComplete(step.id)
                          ? 'bg-green-100 text-green-600'
                          : isStepActive(step.id)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {isStepComplete(step.id) ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-neutral-900">{step.title}</div>
                      <div className="text-xs text-neutral-500">{step.description}</div>
                    </div>
                  </div>
                  {index < campaignSteps.length - 1 && (
                    <div className="flex-1 h-px bg-neutral-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentStep === 'connection' && (
                <motion.div
                  key="connection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                      <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Connect Your Meta Account
                      </h3>
                      <p className="text-sm text-neutral-600">
                        To use your existing Meta ads, you'll need to connect your Meta Business account first.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowMetaAccountModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Connect Meta Account
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'selection' && metaAccountId && (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Select Meta Ads
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Choose which ads from your Meta account to use for this campaign.
                      </p>
                    </div>

                    <MetaAdsBrowser
                      accountId={metaAccountId}
                      onAdSelect={handleAdSelect}
                      onAdDeselect={handleAdDeselect}
                      selectedAds={selectedAds.map(ad => ad.meta_ad_id)}
                    />

                    {selectedAds.length > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              {selectedAds.length} ads selected
                            </span>
                          </div>
                          <button
                            onClick={() => setCurrentStep('overrides')}
                            disabled={!canProceedToNext()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            Continue
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 'overrides' && (
                <motion.div
                  key="overrides"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <CampaignOverrideModal
                    isOpen={true}
                    onClose={() => setCurrentStep('selection')}
                    onSave={handleOverridesSave}
                    selectedAds={selectedAds}
                    locations={locations}
                    initialOverrides={campaignOverrides}
                  />
                </motion.div>
              )}

              {currentStep === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      Review Campaign Configuration
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Review your campaign settings before creating the campaign.
                    </p>
                  </div>

                  {/* Campaign Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-900 mb-3">Campaign Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Platform:</strong> {campaignConfig.platform}</div>
                          <div><strong>Objective:</strong> {campaignConfig.objective}</div>
                          <div><strong>Budget:</strong> ${campaignConfig.budget}</div>
                          <div><strong>Duration:</strong> {campaignConfig.duration}</div>
                        </div>
                      </div>

                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-900 mb-3">Selected Ads</h4>
                        <div className="space-y-2">
                          {selectedAds.map((ad) => (
                            <div key={ad.meta_ad_id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{ad.name}</span>
                              <span className="text-neutral-500 text-xs">{ad.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-900 mb-3">Locations</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Total Locations:</strong> {locations.length}</div>
                          <div><strong>Selected Locations:</strong> {locations.length}</div>
                        </div>
                      </div>

                      {campaignOverrides.budget && campaignOverrides.budget > 0 && (
                        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                          <h4 className="font-medium text-neutral-900 mb-3">Overrides</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Budget Override:</strong> ${campaignOverrides.budget}</div>
                            {campaignOverrides.creative?.title && (
                              <div><strong>Title Override:</strong> {campaignOverrides.creative.title}</div>
                            )}
                            {campaignOverrides.creative?.body && (
                              <div><strong>Body Override:</strong> {campaignOverrides.creative.body}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <button
                      onClick={() => setCurrentStep('overrides')}
                      className="px-4 py-2 text-neutral-700 hover:text-neutral-900 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCampaignCreate}
                      disabled={isLoading || !canProceedToNext()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Campaign...
                        </>
                      ) : (
                        <>
                          Create Campaign
                          <ArrowRightIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Meta Account Modal */}
      <MetaAccountModal
        isOpen={showMetaAccountModal}
        onClose={() => setShowMetaAccountModal(false)}
        onSuccess={handleMetaAccountSuccess}
      />
    </>
  );
}