import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LocationGroupSelector from './LocationGroupSelector';
import { supabaseLocationService } from '../../services/supabaseLocationService';
import type { LocationGroup, LocationSummary } from '../../types';

interface CampaignCreatorWithGroupsProps {
  className?: string;
}

export default function CampaignCreatorWithGroups({ className = '' }: CampaignCreatorWithGroupsProps) {
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null);
  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignBudget, setCampaignBudget] = useState('');

  useEffect(() => {
    if (selectedGroup) {
      loadGroupLocations(selectedGroup.id);
    } else {
      loadAllLocations();
    }
  }, [selectedGroup]);

  const loadGroupLocations = async (groupId: string) => {
    setIsLoading(true);
    try {
      const groupLocations = await supabaseLocationService.getLocationsByGroupId(groupId);
      setLocations(groupLocations);
    } catch (error) {
      console.error('Failed to load group locations:', error);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllLocations = async () => {
    setIsLoading(true);
    try {
      const allLocations = await supabaseLocationService.getAllLocations();
      setLocations(allLocations);
    } catch (error) {
      console.error('Failed to load all locations:', error);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSelect = (group: LocationGroup | null) => {
    setSelectedGroup(group);
    setCampaignName(group ? `${group.name} Campaign` : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    if (!campaignBudget.trim()) {
      alert('Please enter a campaign budget');
      return;
    }

    if (locations.length === 0) {
      alert('No locations selected for campaign');
      return;
    }

    // Here you would typically submit the campaign data
    console.log('Campaign Data:', {
      name: campaignName,
      budget: campaignBudget,
      group: selectedGroup,
      locationCount: locations.length,
      locations: locations.map(loc => ({ id: loc.id, name: loc.name }))
    });

    alert(`Campaign "${campaignName}" created successfully with ${locations.length} locations!`);
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create Campaign with Location Groups
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Group (Optional)
            </label>
            <LocationGroupSelector
              onGroupSelect={handleGroupSelect}
              selectedGroup={selectedGroup}
              placeholder="Select a location group to filter locations..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Choose a group to automatically include all locations, or leave empty to select individual locations.
            </p>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Budget *
              </label>
              <input
                type="number"
                value={campaignBudget}
                onChange={(e) => setCampaignBudget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Location Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Locations
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading locations...</p>
                </div>
              ) : selectedGroup ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Group: {selectedGroup.name}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {locations.length} locations
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    All locations from the "{selectedGroup.name}" group will be included in this campaign.
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {locations.slice(0, 10).map(location => (
                        <div key={location.id} className="text-sm text-gray-700 bg-white p-2 rounded border">
                          <div className="font-medium">{location.name}</div>
                          <div className="text-gray-500">{location.city}, {location.state}</div>
                        </div>
                      ))}
                      {locations.length > 10 && (
                        <div className="text-sm text-gray-500 italic">
                          ... and {locations.length - 10} more locations
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">All Available Locations</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    You can manually select specific locations for this campaign.
                  </p>
                  <div className="text-sm text-gray-500">
                    Total available: {locations.length} locations
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!campaignName.trim() || !campaignBudget.trim() || locations.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </form>

        {/* Benefits Section */}
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <h3 className="font-medium text-green-900 mb-2">
              🎯 Group Campaign Benefits
            </h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• <strong>Consistent Targeting:</strong> All locations in "{selectedGroup.name}" will receive the same campaign settings</li>
              <li>• <strong>Efficient Management:</strong> Update campaign settings once, apply to all {locations.length} locations</li>
              <li>• <strong>Better Performance:</strong> Grouped campaigns often perform better due to consistent messaging</li>
              <li>• <strong>Simplified Reporting:</strong> Track performance across the entire group as a single unit</li>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}