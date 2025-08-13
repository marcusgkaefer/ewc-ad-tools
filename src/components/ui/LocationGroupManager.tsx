import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { supabaseLocationGroupService } from '../../services/supabaseLocationGroupService';
import { supabaseLocationService } from '../../services/supabaseLocationService';
import type { 
  LocationGroup, 
  LocationGroupWithMembers, 
  LocationSummary,
  CreateLocationGroupRequest 
} from '../../types';

interface LocationGroupManagerProps {
  onGroupSelect?: (group: LocationGroup) => void;
  selectedGroupId?: string;
  className?: string;
}

export default function LocationGroupManager({ 
  onGroupSelect, 
  selectedGroupId,
  className = '' 
}: LocationGroupManagerProps) {
  const [groups, setGroups] = useState<LocationGroup[]>([]);
  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LocationGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<LocationGroupWithMembers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [groupsData, locationsData] = await Promise.all([
        supabaseLocationGroupService.getGroupsWithLocationCounts(),
        supabaseLocationService.getAllLocations()
      ]);
      setGroups(groupsData);
      setLocations(locationsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      const request: CreateLocationGroupRequest = {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        locationIds: selectedLocationIds
      };

      await supabaseLocationGroupService.createGroup(request);
      setSuccess('Group created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError('Failed to create group');
      console.error(err);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !groupName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      await supabaseLocationGroupService.updateGroup(editingGroup.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined
      });
      setSuccess('Group updated successfully!');
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError('Failed to update group');
      console.error(err);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await supabaseLocationGroupService.deleteGroup(groupId);
      setSuccess('Group deleted successfully!');
      loadData();
    } catch (err) {
      setError('Failed to delete group');
      console.error(err);
    }
  };

  const handleViewGroup = async (group: LocationGroup) => {
    try {
      const groupWithMembers = await supabaseLocationGroupService.getGroupById(group.id);
      setViewingGroup(groupWithMembers);
      setShowViewModal(true);
    } catch (err) {
      setError('Failed to load group details');
      console.error(err);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setGroupDescription('');
    setSelectedLocationIds([]);
    setSearchQuery('');
  };

  const openEditModal = (group: LocationGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Location Groups</h2>
          <p className="text-gray-600">Organize your locations into groups for easier management</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Group
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button onClick={clearMessages} className="ml-auto">
              <XMarkIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
          >
            <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
            <button onClick={clearMessages} className="ml-auto">
              <XMarkIcon className="w-5 h-5 text-green-500 hover:text-green-700" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups List */}
      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <PlusIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-4">Create your first location group to get started</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Group
            </button>
          </div>
        ) : (
          groups.map(group => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                selectedGroupId === group.id ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    {selectedGroupId === group.id && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Selected
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-gray-600 mt-1">{group.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>{group.locationCount || 0} locations</span>
                    <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {onGroupSelect && (
                    <button
                      onClick={() => onGroupSelect(group)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        selectedGroupId === group.id
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedGroupId === group.id ? 'Selected' : 'Select'}
                    </button>
                  )}
                  <button
                    onClick={() => handleViewGroup(group)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View group details"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(group)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit group"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete group"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Create Location Group</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Group Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter group name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter group description (optional)"
                    />
                  </div>
                </div>

                {/* Location Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Locations
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search locations..."
                    />
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {filteredLocations.map(location => (
                        <label key={location.id} className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded px-2">
                          <input
                            type="checkbox"
                            checked={selectedLocationIds.includes(location.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLocationIds([...selectedLocationIds, location.id]);
                              } else {
                                setSelectedLocationIds(selectedLocationIds.filter(id => id !== location.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{location.name}</p>
                            <p className="text-sm text-gray-500">{location.city}, {location.state}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedLocationIds.length} location(s) selected
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3 rounded-b-lg">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditModal && editingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Edit Location Group</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3 rounded-b-lg">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGroup}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Group Modal */}
      <AnimatePresence>
        {showViewModal && viewingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{viewingGroup.name}</h3>
                    {viewingGroup.description && (
                      <p className="text-gray-600 mt-1">{viewingGroup.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Group Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(viewingGroup.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(viewingGroup.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Locations:</span>
                      <span className="ml-2 text-gray-900">
                        {viewingGroup.locations?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Locations in Group ({viewingGroup.locations?.length || 0})
                  </h4>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                    {viewingGroup.locations && viewingGroup.locations.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {viewingGroup.locations.map(location => (
                          <div key={location.id} className="p-3 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{location.name}</p>
                                <p className="text-sm text-gray-500">{location.city}, {location.state}</p>
                                <p className="text-xs text-gray-400">{location.address}</p>
                              </div>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {location.locationPrime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No locations in this group
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex items-center justify-end rounded-b-lg">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}