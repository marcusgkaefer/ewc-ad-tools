import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { CampaignConfiguration } from '../../types';
import ModernDatePicker from './ModernDatePicker';
import Select from './Select';
import { defaultObjectives } from '../../data/mockData';

interface CampaignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignConfig: CampaignConfiguration;
  onSave: (config: CampaignConfiguration) => void;
}

const CampaignSettingsModal: React.FC<CampaignSettingsModalProps> = ({
  isOpen,
  onClose,
  campaignConfig,
  onSave
}) => {
  const [config, setConfig] = useState<CampaignConfiguration>(campaignConfig);

  // Update local state when campaignConfig prop changes
  useEffect(() => {
    setConfig(campaignConfig);
  }, [campaignConfig]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-elegant max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Campaign Settings</h2>
              <button
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-neutral-600 mt-2">
              Configure your Meta campaign parameters. These settings will be applied to all generated campaigns.
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                  Campaign Prefix
                </label>
                <input
                  type="text"
                  value={config.prefix}
                  onChange={(e) => setConfig(prev => ({ ...prev, prefix: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-base bg-white transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none hover:border-neutral-300"
                  placeholder="EWC_Meta_"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                  Platform
                </label>
                <Select
                  value={config.platform}
                  onChange={(value) => setConfig(prev => ({ ...prev, platform: value }))}
                  options={[
                    { value: 'Meta', label: 'Meta' },
                    { value: 'Facebook', label: 'Facebook' },
                    { value: 'Instagram', label: 'Instagram' }
                  ]}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                  Campaign Date
                </label>
                <ModernDatePicker
                  value={config.selectedDate}
                  onChange={(date: Date) => setConfig(prev => ({ ...prev, selectedDate: date }))}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                  Campaign Objective
                </label>
                <Select
                  value={config.objective}
                  onChange={(value) => setConfig(prev => ({ ...prev, objective: value }))}
                  options={defaultObjectives.map(obj => ({ value: obj.value, label: obj.label }))}
                  label=""
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                  Budget per Campaign ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.budget}
                  onChange={(e) => setConfig(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-base bg-white transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none hover:border-neutral-300"
                  placeholder="92.69"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                  Radius (miles)
                </label>
                <input
                  type="number"
                  value={config.radius}
                  onChange={(e) => setConfig(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-xl text-base bg-white transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none hover:border-neutral-300"
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-neutral-200 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-neutral-700 font-semibold rounded-xl border border-neutral-200 transition-all duration-300 hover:bg-neutral-50 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CampaignSettingsModal; 