import {
  XMarkIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useMemo } from 'react';

import type {
  LocationWithConfig,
  AdConfiguration,
  CampaignConfiguration,
} from '../../types';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationWithConfig[];
  ads: AdConfiguration[];
  campaign: CampaignConfiguration;
  title?: string;
}

interface PreviewRow {
  location: LocationWithConfig;
  ad: AdConfiguration;
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
}

const generatePreviewData = (
  locations: LocationWithConfig[],
  ads: AdConfiguration[],
  campaign: CampaignConfiguration
): PreviewRow[] => {
  const data: PreviewRow[] = [];

  locations.forEach(location => {
    ads.forEach(ad => {
      // Use location's landing page URL from location model, config, or fallback
      const landingPage =
        location.landing_page_url ||
        location.config?.landingPageUrl ||
        'https://waxcenter.com';

      data.push({
        location,
        ad,
        campaignName: `${campaign.prefix}_${campaign.platform}_${campaign.month}${campaign.day}_${location.locationPrime}`,
        adSetName: `${campaign.prefix}_${campaign.platform}_${campaign.month}${campaign.day}_${location.locationPrime}_AdSet`,
        adName: `${campaign.prefix}_${campaign.platform}_${campaign.month}${campaign.day}_${location.locationPrime}_${ad.name}`,
        objective: campaign.objective,
        budget: campaign.budget,
        bidStrategy: campaign.bidStrategy,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        landingPage,
        radius: `${location.coordinates.lat}, ${location.coordinates.lng} +${location.config?.radiusMiles || campaign.radius}mi`,
        caption: ad.caption,
        status: ad.status,
      });
    });
  });

  return data;
};

const FilePreview: React.FC<FilePreviewProps> = ({
  isOpen,
  onClose,
  locations,
  ads,
  campaign,
  title = 'Campaign Data Preview',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const previewData = useMemo(
    () => generatePreviewData(locations, ads, campaign),
    [locations, ads, campaign]
  );

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return previewData;
    const query = searchQuery.toLowerCase();
    return previewData.filter(
      row =>
        row.location.name.toLowerCase().includes(query) ||
        row.location.city.toLowerCase().includes(query) ||
        row.location.state.toLowerCase().includes(query) ||
        row.ad.name.toLowerCase().includes(query) ||
        row.campaignName.toLowerCase().includes(query)
    );
  }, [previewData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const stats = useMemo(
    () => ({
      totalLocations: locations.length,
      totalAds: ads.length,
      totalCampaigns: previewData.length,
      totalBudget: previewData.reduce((sum, row) => sum + row.budget, 0),
      estimatedReach: previewData.length * 15000,
    }),
    [locations.length, ads.length, previewData]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-7xl max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <EyeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {title}
                </h2>
                <p className="text-sm text-gray-600">
                  Preview of your Facebook/Meta campaign data before generation
                </p>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              className="p-3 text-gray-500 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl transition-all duration-200 hover:bg-white hover:text-gray-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XMarkIcon className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Stats Bar */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalLocations}
                </div>
                <div className="text-sm text-gray-600">Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalAds}
                </div>
                <div className="text-sm text-gray-600">Ad Variations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalCampaigns}
                </div>
                <div className="text-sm text-gray-600">Total Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${stats.totalBudget.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.estimatedReach.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Est. Reach</div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns, locations, ads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {filteredData.length} of {previewData.length} campaigns
                </div>

                <motion.button
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export Data
                </motion.button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-full">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Ad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Budget
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((row, index) => (
                    <motion.tr
                      key={`${row.location.id}-${row.ad.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {row.campaignName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {row.objective}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {row.location.name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {row.location.city}, {row.location.state}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {row.ad.name}
                        </div>
                        <div className="text-gray-500 text-xs truncate max-w-xs">
                          {row.caption}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        ${row.budget.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'Paused'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {row.status === 'Active' && (
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                          )}
                          {row.status === 'Paused' && (
                            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                          )}
                          {row.status === 'Draft' && (
                            <InformationCircleIcon className="w-3 h-3 mr-1" />
                          )}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Radius: {campaign.radius}mi</div>
                          <div>
                            Start:{' '}
                            {new Date(row.startDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(startIndex + rowsPerPage, filteredData.length)} of{' '}
                {filteredData.length} campaigns
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
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
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
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
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
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

export default FilePreview;
