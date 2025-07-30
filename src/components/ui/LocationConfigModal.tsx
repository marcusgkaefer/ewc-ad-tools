import React, { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon, CogIcon } from '@heroicons/react/24/outline';
import type { LocationWithConfig, LocationConfig } from '../../types';
import { supabaseLocationService } from '../../services/supabaseLocationService';

interface LocationConfiguration {
  budget: number;
  radius: number;
}

interface LocationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationWithConfig | null;
  onSave: (updatedConfig: LocationConfig) => void;
}

const LocationConfigModal: React.FC<LocationConfigModalProps> = ({
  isOpen,
  onClose,
  location,
  onSave
}) => {
  const [config, setConfig] = useState<LocationConfiguration>({
    budget: 100,
    radius: 5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load config when location changes
  useEffect(() => {
    console.log('LocationConfigModal - Location changed:', {
      location,
      hasLocation: !!location,
      locationId: location?.id,
      hasConfig: !!location?.config,
      config: location?.config
    });
    
    if (location?.config) {
      setConfig({
        budget: location.config.budget || 100,
        radius: location.config.radiusMiles || 5
      });
    } else {
      setConfig({
        budget: 100,
        radius: 5
      });
    }
    setError(null);
  }, [location]);

  const handleSave = async () => {
    if (!location) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate inputs
      if (config.budget <= 0) {
        setError('Budget must be greater than 0');
        return;
      }

      if (config.radius <= 0) {
        setError('Radius must be greater than 0');
        return;
      }

      let updatedConfig: LocationConfig;

      // Save to Supabase
      if (location.config) {
        // Update existing config
        updatedConfig = await supabaseLocationService.updateLocationConfig(location.id, {
          budget: config.budget,
          radiusMiles: config.radius,
          isActive: true
        });
      } else {
        // Create new config
        updatedConfig = await supabaseLocationService.createLocationConfig({
          locationId: location.id,
          budget: config.budget,
          radiusMiles: config.radius
        });
      }

      // Call parent callback with updated config
      console.log('LocationConfigModal - About to save config:', {
        locationId: location.id,
        updatedConfig,
        hasConfig: !!updatedConfig,
        configLocationId: updatedConfig?.locationId
      });
      onSave(updatedConfig);
      onClose();
    } catch (err) {
      console.error('Error saving location config:', err);
      setError('Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !location) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Close modal when clicking on overlay, but not when loading
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-wax-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-wax-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-wax-red-100 rounded-xl flex items-center justify-center">
              <CogIcon className="w-5 h-5 text-wax-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-wax-gray-800">Configure Location</h3>
              <p className="text-sm text-wax-gray-500">{location.name}, {location.state}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-wax-gray-400 hover:text-wax-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Budget */}
            <div>
              <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                Budget ($)
              </label>
              <input
                type="number"
                value={config.budget}
                onChange={(e) => setConfig({ ...config, budget: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-white transition-all duration-200 focus:border-wax-red-500 focus:ring-2 focus:ring-wax-red-100 focus:outline-none hover:border-wax-gray-300 disabled:opacity-50"
                min="1"
                step="0.01"
                disabled={isLoading}
              />
            </div>

            {/* Radius */}
            <div>
              <label className="block font-medium text-wax-gray-700 mb-2 text-sm">
                Radius (miles)
              </label>
              <input
                type="number"
                value={config.radius}
                onChange={(e) => setConfig({ ...config, radius: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-white transition-all duration-200 focus:border-wax-red-500 focus:ring-2 focus:ring-wax-red-100 focus:outline-none hover:border-wax-gray-300 disabled:opacity-50"
                min="0.1"
                step="0.1"
                disabled={isLoading}
              />
            </div>

            {/* Location Info */}
            <div className="bg-wax-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-4 h-4 text-wax-red-600" />
                <span className="text-sm font-medium text-wax-gray-700">Location Details</span>
              </div>
              <div className="text-sm text-wax-gray-600 space-y-1">
                <div><strong>Address:</strong> {location.address}</div>
                <div><strong>City:</strong> {location.city}, {location.state} {location.zipCode}</div>
                <div><strong>Coordinates:</strong> {location.coordinates.lat}, {location.coordinates.lng}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-wax-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-wax-gray-600 font-medium rounded-xl border-2 border-wax-gray-200 shadow-wax-sm transition-all duration-300 hover:border-wax-gray-300 hover:bg-wax-gray-50 focus:outline-none focus:ring-2 focus:ring-wax-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-wax-red-600 text-white font-semibold rounded-xl shadow-wax-md transition-all duration-300 hover:bg-wax-red-700 hover:-translate-y-0.5 hover:shadow-wax-lg focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export { LocationConfigModal }; 