// Component: LocationSelectionStep
// Purpose: Handle location selection, search, filtering, and configuration
// Props: Location data, selection state, and callbacks
// State: Local search and filter state
// Dependencies: React, Framer Motion, Heroicons

import { MapPinIcon, CogIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';

import type { LocationWithConfig } from '../../types';

interface LocationSelectionStepProps {
  locations: LocationWithConfig[];
  selectedLocationIds: string[];
  excludedLocationIds: string[];
  useExclusionMode: boolean;
  onLocationSelect: (locationIds: string[]) => void;
  onExclusionModeToggle: (useExclusion: boolean) => void;
  onNext: () => void;
  onLocationConfigure: (location: LocationWithConfig) => void;
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function LocationSelectionStep({
  locations,
  selectedLocationIds,
  excludedLocationIds,
  useExclusionMode,
  onLocationSelect,
  onExclusionModeToggle,
  onNext,
  onLocationConfigure,
}: LocationSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [configurationFilter, setConfigurationFilter] = useState<
    'all' | 'configured' | 'not-configured'
  >('all');

  // Smart location filtering
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      // Search filter
      const searchMatch =
        !searchQuery.trim() ||
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.state.toLowerCase().includes(searchQuery.toLowerCase());

      // Configuration filter
      const configMatch =
        configurationFilter === 'all' ||
        (configurationFilter === 'configured' && location.config) ||
        (configurationFilter === 'not-configured' && !location.config);

      return searchMatch && configMatch;
    });
  }, [locations, searchQuery, configurationFilter]);

  // Calculate effective selected locations
  const effectiveSelectedLocations = useMemo(() => {
    if (useExclusionMode) {
      return filteredLocations.filter(
        loc => !excludedLocationIds.includes(loc.id)
      );
    }
    return filteredLocations.filter(loc =>
      selectedLocationIds.includes(loc.id)
    );
  }, [
    filteredLocations,
    selectedLocationIds,
    excludedLocationIds,
    useExclusionMode,
  ]);

  const handleLocationToggle = (locationId: string) => {
    if (useExclusionMode) {
      const newExcludedIds = excludedLocationIds.includes(locationId)
        ? excludedLocationIds.filter(id => id !== locationId)
        : [...excludedLocationIds, locationId];
      onLocationSelect(newExcludedIds);
    } else {
      const newSelectedIds = selectedLocationIds.includes(locationId)
        ? selectedLocationIds.filter(id => id !== locationId)
        : [...selectedLocationIds, locationId];
      onLocationSelect(newSelectedIds);
    }
  };

  const canProceed = effectiveSelectedLocations.length > 0;

  return (
    <motion.div
      key="locations"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto"
    >
      <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
            Select Target Locations
          </h2>
          <p className="text-neutral-600 text-lg">
            Choose the locations where your campaigns will run. You can select
            individual locations or use exclusion mode.
          </p>
        </div>

        {/* Location Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search locations by name, city, or state..."
            className="w-full px-6 py-4 border-2 border-neutral-200 rounded-2xl text-base bg-white/90 backdrop-blur-xl transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 focus:outline-none hover:bg-white"
          />
        </div>

        {/* Configuration Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Filter by configuration:
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setConfigurationFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                configurationFilter === 'all'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white/90 backdrop-blur-xl text-neutral-700 border-2 border-neutral-200 hover:border-primary-300 hover:bg-white'
              }`}
            >
              All Locations ({locations.length})
            </button>
            <button
              onClick={() => setConfigurationFilter('configured')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                configurationFilter === 'configured'
                  ? 'bg-success-500 text-white shadow-lg shadow-success-500/25'
                  : 'bg-white/90 backdrop-blur-xl text-neutral-700 border-2 border-neutral-200 hover:border-success-300 hover:bg-white'
              }`}
            >
              Configured ({locations.filter(l => l.config).length})
            </button>
            <button
              onClick={() => setConfigurationFilter('not-configured')}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                configurationFilter === 'not-configured'
                  ? 'bg-warning-500 text-white shadow-lg shadow-warning-500/25'
                  : 'bg-white/90 backdrop-blur-xl text-neutral-700 border-2 border-neutral-200 hover:border-warning-300 hover:bg-white'
              }`}
            >
              Not Configured ({locations.filter(l => !l.config).length})
            </button>
          </div>
          {(searchQuery || configurationFilter !== 'all') && (
            <div className="mt-2 text-sm text-gray-500">
              Showing {filteredLocations.length} of {locations.length} locations
            </div>
          )}
        </div>

        {/* Exclusion Mode Toggle */}
        <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-2xl">
          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-primary-800">
            <input
              type="checkbox"
              checked={useExclusionMode}
              onChange={e => onExclusionModeToggle(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span>
              Use exclusion mode (select locations to exclude instead of
              include)
            </span>
          </label>
          <p className="text-xs text-primary-600 mt-1 ml-7">
            {useExclusionMode
              ? `Excluding ${excludedLocationIds.length} locations from ${locations.length} total`
              : `Including ${selectedLocationIds.length} locations from ${locations.length} total`}
          </p>
        </div>

        {/* Location List */}
        <div className="mb-8">
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {filteredLocations.map(location => {
              const isSelected = useExclusionMode
                ? !excludedLocationIds.includes(location.id)
                : selectedLocationIds.includes(location.id);

              return (
                <div
                  key={location.id}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-primary-500/25'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                  onClick={() => handleLocationToggle(location.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-full h-full rounded-full bg-white scale-75" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {location.name}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {location.city}, {location.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {location.config ? (
                        <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-lg">
                          Configured
                        </span>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onLocationConfigure(location);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-lg hover:bg-warning-200 transition-colors"
                        >
                          <CogIcon className="w-3 h-3" />
                          Configure
                        </button>
                      )}
                      <MapPinIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              canProceed
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Continue with {effectiveSelectedLocations.length} Location
            {effectiveSelectedLocations.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
