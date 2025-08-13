import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LocationGroupManager from '../ui/LocationGroupManager';
import LocationGroupSelector from '../ui/LocationGroupSelector';
import type { LocationGroup } from '../../types';

export default function LocationGroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null);

  const handleGroupSelect = (group: LocationGroup | null) => {
    setSelectedGroup(group);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Location Groups Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organize your European Wax Center locations into logical groups for easier campaign management and targeting.
          </p>
        </motion.div>

        {/* Group Selection Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Group Selection Demo
          </h2>
          <p className="text-gray-600 mb-4">
            Select a group below to see how it can be used to filter locations in your campaigns:
          </p>
          <div className="max-w-md">
            <LocationGroupSelector
              onGroupSelect={handleGroupSelect}
              selectedGroup={selectedGroup}
              placeholder="Choose a location group..."
            />
          </div>
          {selectedGroup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <h3 className="font-medium text-blue-900 mb-2">
                Selected Group: {selectedGroup.name}
              </h3>
              <p className="text-blue-700 text-sm">
                This group contains {selectedGroup.locationCount || 0} locations and can be used to:
              </p>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• Filter campaign locations automatically</li>
                <li>• Apply consistent settings across all group members</li>
                <li>• Generate targeted ads for specific location clusters</li>
                <li>• Simplify location management and reporting</li>
              </ul>
            </motion.div>
          )}
        </motion.div>

        {/* Group Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <LocationGroupManager
            onGroupSelect={handleGroupSelect}
            selectedGroupId={selectedGroup?.id}
          />
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Organization</h3>
            <p className="text-gray-600">
              Group locations by region, performance, or any criteria that makes sense for your business.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Efficient Targeting</h3>
            <p className="text-gray-600">
              Apply campaigns to entire groups instead of selecting locations one by one.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600">
              Bulk operations, mass updates, and streamlined workflows for managing multiple locations.
            </p>
          </div>
        </motion.div>

        {/* Integration Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Seamless Integration
          </h2>
          <p className="text-gray-700 mb-6">
            Location groups are automatically integrated with your existing campaign creation workflow. 
            When you select a group, all locations within that group are automatically included in your campaigns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Campaign Creation</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Select a group instead of individual locations</li>
                <li>• Automatic location inclusion and exclusion</li>
                <li>• Consistent settings across all group members</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reporting & Analytics</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Group-level performance metrics</li>
                <li>• Comparative analysis between groups</li>
                <li>• Simplified data aggregation</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}