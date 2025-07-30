import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowsUpDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import type { LocationWithConfig, CampaignConfiguration } from '../../types';

interface EnhancedPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationWithConfig[];
  campaign: CampaignConfiguration;
  title?: string;
  isGeneratedFile?: boolean;
  onDownloadFile?: () => void;
}

interface PreviewRow {
  location: LocationWithConfig;
  campaignName: string;
  adSetName: string;
  adName: string;
  objective: string;
  budget: number;
  bidStrategy: string;
  startDate: string;
  endDate: string;
  landingPage: string;
  radius: string;
  caption: string;
  status: string;
  estimatedReach: number;
  coordinates: string;
}

const generatePreviewData = (
  locations: LocationWithConfig[],
  campaign: CampaignConfiguration
): PreviewRow[] => {
  const data: PreviewRow[] = [];
  
  locations.forEach(location => {
    campaign.ads.forEach(ad => {
      const landingPage = location.landing_page_url || location.config?.landingPageUrl || 'https://waxcenter.com';
      const locationName = location.name.replace(/\s+/g, '');
      
      data.push({
        location,
        campaignName: `${campaign.prefix}_${campaign.platform}_${campaign.month}${campaign.day}_${locationName}`,
        adSetName: `${campaign.prefix}_${campaign.platform}_${campaign.month}${campaign.day}_${locationName}_AdSet`,
        adName: `${campaign.prefix}_${campaign.platform}_${campaign.month}${campaign.day}_${locationName}_${ad.name}`,
        objective: campaign.objective,
        budget: campaign.budget,
        bidStrategy: campaign.bidStrategy,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        landingPage,
        radius: `${campaign.radius}mi`,
        caption: ad.caption,
        status: ad.status,
        estimatedReach: 15000, // Base reach estimate
        coordinates: `${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lng.toFixed(4)}`
      });
    });
  });
  
  return data;
};

const EnhancedPreview: React.FC<EnhancedPreviewProps> = ({
  isOpen,
  onClose,
  locations,
  campaign,
  title = "Enhanced Campaign Preview",
  isGeneratedFile = false,
  onDownloadFile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [sortField, setSortField] = useState<keyof PreviewRow>('campaignName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const rowsPerPage = 12;

  const previewData = useMemo(() => 
    generatePreviewData(locations, campaign), 
    [locations, campaign]
  );

  const filteredAndSortedData = useMemo(() => {
    let filtered = previewData;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row =>
        row.location.name.toLowerCase().includes(query) ||
        row.location.city.toLowerCase().includes(query) ||
        row.location.state.toLowerCase().includes(query) ||
        row.campaignName.toLowerCase().includes(query) ||
        row.objective.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(row => row.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });

    return filtered;
  }, [previewData, searchQuery, filterStatus, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);

  const stats = useMemo(() => ({
    totalLocations: locations.length,
    totalCampaigns: previewData.length,
    totalBudget: previewData.reduce((sum, row) => sum + row.budget, 0),
    estimatedReach: previewData.reduce((sum, row) => sum + row.estimatedReach, 0),
    avgBudgetPerLocation: previewData.length > 0 ? previewData.reduce((sum, row) => sum + row.budget, 0) / locations.length : 0,
    uniqueStates: new Set(locations.map(loc => loc.state)).size
  }), [locations, previewData]);

  const handleSort = (field: keyof PreviewRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-7xl max-h-[95vh] bg-white rounded-3xl shadow-wax-2xl border border-wax-gray-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-wax-gray-100 bg-wax-elegant">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-wax-red-100 rounded-xl">
                <EyeIcon className="w-6 h-6 text-wax-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-wax-gray-900 mb-1">
                  {title}
                </h2>
                <p className="text-sm text-wax-gray-600">
                  Interactive preview with real-time data insights
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={onClose}
              className="p-3 text-wax-gray-500 bg-white/80 backdrop-blur-sm border border-wax-gray-200/50 rounded-xl transition-all duration-200 hover:bg-white hover:text-wax-gray-700 hover:shadow-wax-md focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XMarkIcon className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="p-6 bg-wax-red-50/50 border-b border-wax-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <motion.div 
                className="bg-white rounded-xl p-4 text-center shadow-wax-sm border border-wax-gray-100"
                whileHover={{ scale: 1.02 }}
              >
                <MapPinIcon className="w-6 h-6 text-wax-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-wax-gray-900">{stats.totalLocations}</div>
                <div className="text-xs text-wax-gray-600">Locations</div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-4 text-center shadow-wax-sm border border-wax-gray-100"
                whileHover={{ scale: 1.02 }}
              >
                <ChartBarIcon className="w-6 h-6 text-wax-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-wax-gray-900">{stats.totalCampaigns}</div>
                <div className="text-xs text-wax-gray-600">Campaigns</div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-4 text-center shadow-wax-sm border border-wax-gray-100"
                whileHover={{ scale: 1.02 }}
              >
                <CurrencyDollarIcon className="w-6 h-6 text-wax-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-wax-gray-900">${stats.totalBudget.toFixed(0)}</div>
                <div className="text-xs text-wax-gray-600">Total Budget</div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-4 text-center shadow-wax-sm border border-wax-gray-100"
                whileHover={{ scale: 1.02 }}
              >
                <UsersIcon className="w-6 h-6 text-wax-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-wax-gray-900">{stats.estimatedReach.toLocaleString()}</div>
                <div className="text-xs text-wax-gray-600">Est. Reach</div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-4 text-center shadow-wax-sm border border-wax-gray-100"
                whileHover={{ scale: 1.02 }}
              >
                <CurrencyDollarIcon className="w-6 h-6 text-wax-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-wax-gray-900">${stats.avgBudgetPerLocation.toFixed(0)}</div>
                <div className="text-xs text-wax-gray-600">Avg/Location</div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-xl p-4 text-center shadow-wax-sm border border-wax-gray-100"
                whileHover={{ scale: 1.02 }}
              >
                <MapPinIcon className="w-6 h-6 text-wax-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-wax-gray-900">{stats.uniqueStates}</div>
                <div className="text-xs text-wax-gray-600">States</div>
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-wax-gray-100 bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-wax-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-wax-gray-200 rounded-xl focus:border-wax-red-500 focus:ring-4 focus:ring-wax-red-100 focus:outline-none transition-all duration-200"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-wax-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-3 border-2 border-wax-gray-200 rounded-xl focus:border-wax-red-500 focus:ring-4 focus:ring-wax-red-100 focus:outline-none transition-all duration-200 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex bg-wax-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      viewMode === 'cards'
                        ? 'bg-white text-wax-red-600 shadow-sm'
                        : 'text-wax-gray-600 hover:text-wax-gray-800'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      viewMode === 'table'
                        ? 'bg-white text-wax-red-600 shadow-sm'
                        : 'text-wax-gray-600 hover:text-wax-gray-800'
                    }`}
                  >
                    Table
                  </button>
                </div>
                
                <div className="text-sm text-wax-gray-600">
                  {filteredAndSortedData.length} of {previewData.length} campaigns
                </div>
                
                <motion.button
                  className="flex items-center gap-2 px-4 py-3 bg-wax-red-600 text-white font-semibold rounded-xl shadow-wax-md transition-all duration-200 hover:bg-wax-red-700 hover:shadow-wax-lg focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (isGeneratedFile && onDownloadFile) {
                      onDownloadFile();
                    } else {
                      // TODO: Implement export functionality
                      console.log('Export preview data');
                    }
                  }}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  {isGeneratedFile ? 'Download' : 'Export Preview'}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto min-h-0">
            {viewMode === 'cards' ? (
              /* Cards View */
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentData.map((row, index) => (
                    <motion.div
                      key={`${row.location.id}-${row.campaignName}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl border-2 border-wax-gray-200 p-6 hover:border-wax-red-300 hover:shadow-wax-md transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-wax-gray-900 text-sm mb-1 truncate">
                            {row.campaignName}
                          </h3>
                          <p className="text-xs text-wax-gray-600 mb-2">
                            {row.location.name}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'Paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-wax-gray-100 text-wax-gray-800'
                          }`}>
                            {row.status === 'Active' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                            {row.status === 'Paused' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                            {row.status === 'Draft' && <InformationCircleIcon className="w-3 h-3 mr-1" />}
                            {row.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-wax-gray-600">Budget:</span>
                          <span className="font-semibold text-wax-red-600">${row.budget.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-wax-gray-600">Objective:</span>
                          <span className="font-medium text-wax-gray-900">{row.objective}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-wax-gray-600">Location:</span>
                          <span className="font-medium text-wax-gray-900">{row.location.city}, {row.location.state}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-wax-gray-600">Radius:</span>
                          <span className="font-medium text-wax-gray-900">{row.radius}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-wax-gray-600">Est. Reach:</span>
                          <span className="font-medium text-wax-gray-900">{row.estimatedReach.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-wax-gray-100">
                        <p className="text-xs text-wax-gray-600 truncate">
                          {row.caption}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              /* Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-wax-gray-50 sticky top-0">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200 cursor-pointer hover:bg-wax-gray-100"
                        onClick={() => handleSort('campaignName')}
                      >
                        <div className="flex items-center gap-1">
                          Campaign
                          <ArrowsUpDownIcon className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200 cursor-pointer hover:bg-wax-gray-100"
                        onClick={() => handleSort('location')}
                      >
                        <div className="flex items-center gap-1">
                          Location
                          <ArrowsUpDownIcon className="w-3 h-3" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200 cursor-pointer hover:bg-wax-gray-100"
                        onClick={() => handleSort('budget')}
                      >
                        <div className="flex items-center gap-1">
                          Budget
                          <ArrowsUpDownIcon className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-wax-gray-200">
                    {currentData.map((row, index) => (
                      <motion.tr
                        key={`${row.location.id}-${row.campaignName}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-wax-red-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-4 text-sm">
                          <div className="font-medium text-wax-gray-900 truncate max-w-xs">{row.campaignName}</div>
                          <div className="text-wax-gray-500 text-xs">{row.objective}</div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="font-medium text-wax-gray-900">{row.location.name}</div>
                          <div className="text-wax-gray-500 text-xs">{row.location.city}, {row.location.state}</div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-wax-red-600">
                          ${row.budget.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'Paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-wax-gray-100 text-wax-gray-800'
                          }`}>
                            {row.status === 'Active' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                            {row.status === 'Paused' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                            {row.status === 'Draft' && <InformationCircleIcon className="w-3 h-3 mr-1" />}
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-wax-gray-500">
                          <div className="space-y-1">
                            <div>Radius: {row.radius}</div>
                            <div>Reach: {row.estimatedReach.toLocaleString()}</div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-wax-gray-100 bg-wax-gray-50">
              <div className="text-sm text-wax-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} campaigns
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-wax-gray-100 text-wax-gray-400 cursor-not-allowed'
                      : 'bg-white text-wax-gray-700 border border-wax-gray-200 hover:bg-wax-gray-50 hover:border-wax-red-300'
                  }`}
                  whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                  whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                >
                  Previous
                </motion.button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <motion.button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-wax-red-600 text-white shadow-wax-sm'
                            : 'bg-white text-wax-gray-700 border border-wax-gray-200 hover:bg-wax-red-50 hover:border-wax-red-300'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {page}
                      </motion.button>
                    );
                  })}
                </div>
                
                <motion.button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-wax-gray-100 text-wax-gray-400 cursor-not-allowed'
                      : 'bg-white text-wax-gray-700 border border-wax-gray-200 hover:bg-wax-gray-50 hover:border-wax-red-300'
                  }`}
                  whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                  whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedPreview; 