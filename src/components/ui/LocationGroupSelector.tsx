import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabaseLocationGroupService } from '../../services/supabaseLocationGroupService';
import type { LocationGroup } from '../../types';

interface LocationGroupSelectorProps {
  onGroupSelect: (group: LocationGroup | null) => void;
  selectedGroup: LocationGroup | null;
  className?: string;
  placeholder?: string;
}

export default function LocationGroupSelector({
  onGroupSelect,
  selectedGroup,
  className = '',
  placeholder = 'Select a location group...'
}: LocationGroupSelectorProps) {
  const [groups, setGroups] = useState<LocationGroup[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const groupsData = await supabaseLocationGroupService.getGroupsWithLocationCounts();
      setGroups(groupsData);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSelect = (group: LocationGroup) => {
    onGroupSelect(group);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    onGroupSelect(null);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center">
          {selectedGroup ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{selectedGroup.name}</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {selectedGroup.locationCount || 0} locations
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading groups...</div>
            ) : groups.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No groups available</div>
            ) : (
              <>
                {selectedGroup && (
                  <button
                    onClick={handleClearSelection}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Clear selection</span>
                  </button>
                )}
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupSelect(group)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      selectedGroup?.id === group.id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{group.name}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {group.locationCount || 0}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{group.description}</p>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}