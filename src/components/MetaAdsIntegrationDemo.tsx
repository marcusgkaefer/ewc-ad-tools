import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  PlayIcon,
  EyeIcon,
  CogIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import MetaAdsCampaignCreator from './ui/MetaAdsCampaignCreator';
import type { LocationWithConfig, CampaignConfiguration } from '../types';
import type { MetaAdTemplateRecord, CampaignOverrides } from '../types/meta';

// Mock data for demonstration
const mockLocations: LocationWithConfig[] = [
  {
    id: '1',
    name: 'Downtown Center',
    displayName: 'Downtown Center',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phoneNumber: '+1-555-123-4567',
    address: '123 Main St, New York, NY 10001',
    coordinates: { lat: 40.7505, lng: -73.9934 },
    locationPrime: 'NYC',
    landing_page_url: 'https://example.com/downtown',
    config: {
      id: 'config-1',
      locationId: '1',
      budget: 500,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: '2',
    name: 'Brooklyn Center',
    displayName: 'Brooklyn Center',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    phoneNumber: '+1-555-987-6543',
    address: '456 Brooklyn Ave, Brooklyn, NY 11201',
    coordinates: { lat: 40.7021, lng: -73.9872 },
    locationPrime: 'BKL',
    landing_page_url: 'https://example.com/brooklyn',
    config: {
      id: 'config-2',
      locationId: '2',
      budget: 300,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
];

export default function MetaAdsIntegrationDemo() {
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [campaignHistory, setCampaignHistory] = useState<Array<{
    id: string;
    config: CampaignConfiguration;
    ads: MetaAdTemplateRecord[];
    overrides: CampaignOverrides;
    createdAt: string;
  }>>([]);

  const handleCampaignCreate = (
    campaignConfig: CampaignConfiguration,
    selectedAds: MetaAdTemplateRecord[],
    overrides: CampaignOverrides
  ) => {
    const newCampaign = {
      id: `campaign-${Date.now()}`,
      config: campaignConfig,
      ads: selectedAds,
      overrides,
      createdAt: new Date().toISOString()
    };

    setCampaignHistory(prev => [newCampaign, ...prev]);
    setShowCampaignCreator(false);

    // Show success message
    console.log('Campaign created successfully:', newCampaign);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900">Meta Ads Integration Demo</h1>
          </motion.div>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Experience the seamless integration of Meta ads with your campaign creation workflow.
            Connect your Meta account, select ads, and create customized campaigns.
          </p>
        </div>

        {/* Demo Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Connection Demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Meta Account Connection</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Securely connect your Meta Business account to access your existing ads and campaigns.
            </p>
            <ul className="text-sm text-neutral-600 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                OAuth 2.0 authentication
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Multi-account support
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Automatic token refresh
              </li>
            </ul>
          </motion.div>

          {/* Ad Selection Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                <EyeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Ad Selection & Browsing</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Browse and select from your existing Meta ads with advanced filtering and search capabilities.
            </p>
            <ul className="text-sm text-neutral-600 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Real-time ad preview
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Performance metrics
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Bulk selection
              </li>
            </ul>
          </motion.div>

          {/* Campaign Creation Demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                <CogIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Campaign Configuration</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-4">
              Create customized campaigns with location-specific overrides and creative modifications.
            </p>
            <ul className="text-sm text-neutral-600 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                Location-specific overrides
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                Creative customization
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                Budget allocation
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-12">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowCampaignCreator(true)}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-xl transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlayIcon className="w-6 h-6" />
            Start Meta Ads Campaign Creator
            <ArrowRightIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Campaign History */}
        {campaignHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Campaigns</h3>
            <div className="space-y-4">
              {campaignHistory.map((campaign) => (
                <div key={campaign.id} className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-900">
                      Campaign {campaign.config.prefix} - {campaign.config.platform}
                    </h4>
                    <span className="text-sm text-neutral-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <div>Selected Ads: {campaign.ads.length}</div>
                    <div>Locations: {mockLocations.length}</div>
                    <div>Budget: ${campaign.config.budget}</div>
                    {campaign.overrides.budget && campaign.overrides.budget > 0 && (
                      <div>Budget Override: ${campaign.overrides.budget}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Meta Campaign Creator Modal */}
        {showCampaignCreator && (
          <MetaAdsCampaignCreator
            locations={mockLocations}
            onCampaignCreate={handleCampaignCreate}
            onClose={() => setShowCampaignCreator(false)}
          />
        )}
      </div>
    </div>
  );
}