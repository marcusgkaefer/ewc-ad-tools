import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  PlayIcon,
  PhotoIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  RefreshIcon
} from '@heroicons/react/24/outline';
import { metaIntegrationService } from '../../services/metaIntegrationService';
import type { MetaAdTemplateRecord, MetaAdFilters, MetaAdPreview } from '../../types/meta';

interface MetaAdsBrowserProps {
  accountId?: string;
  onAdSelect: (ad: MetaAdTemplateRecord) => void;
  onAdDeselect: (adId: string) => void;
  selectedAds: string[];
  className?: string;
}

interface FilterState {
  status: string[];
  campaignId: string;
  adSetId: string;
  searchQuery: string;
  creativeType: string[];
}

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'DELETED', label: 'Deleted' },
  { value: 'ARCHIVED', label: 'Archived' }
];

const creativeTypeOptions = [
  { value: 'image', label: 'Image Ads' },
  { value: 'video', label: 'Video Ads' },
  { value: 'carousel', label: 'Carousel Ads' },
  { value: 'story', label: 'Story Ads' }
];

export default function MetaAdsBrowser({
  accountId,
  onAdSelect,
  onAdDeselect,
  selectedAds,
  className = ''
}: MetaAdsBrowserProps) {
  const [ads, setAds] = useState<MetaAdTemplateRecord[]>([]);
  const [filteredAds, setFilteredAds] = useState<MetaAdTemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [previewAd, setPreviewAd] = useState<MetaAdTemplateRecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    campaignId: '',
    adSetId: '',
    searchQuery: '',
    creativeType: []
  });

  // Load ads on mount and when accountId changes
  useEffect(() => {
    if (accountId) {
      loadAds();
    }
  }, [accountId]);

  // Filter ads when filters change
  useEffect(() => {
    filterAds();
  }, [ads, filters]);

  const loadAds = async () => {
    if (!accountId) return;

    setIsLoading(true);
    setError(null);

    try {
      const metaAds = await metaIntegrationService.getMetaAdTemplates(accountId);
      setAds(metaAds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Meta ads');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAds = () => {
    let filtered = [...ads];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.name.toLowerCase().includes(query) ||
        ad.creative.title?.toLowerCase().includes(query) ||
        ad.creative.body?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(ad => filters.status.includes(ad.status));
    }

    // Campaign filter
    if (filters.campaignId) {
      filtered = filtered.filter(ad => ad.campaign_id === filters.campaignId);
    }

    // Ad Set filter
    if (filters.adSetId) {
      filtered = filtered.filter(ad => ad.ad_set_id === filters.adSetId);
    }

    // Creative type filter
    if (filters.creativeType.length > 0) {
      filtered = filtered.filter(ad => {
        const hasImage = ad.creative.image_url || ad.creative.image_hash;
        const hasVideo = ad.creative.video_id;
        
        if (filters.creativeType.includes('image') && hasImage) return true;
        if (filters.creativeType.includes('video') && hasVideo) return true;
        return false;
      });
    }

    setFilteredAds(filtered);
  };

  const handleAdSelect = (ad: MetaAdTemplateRecord) => {
    if (selectedAds.includes(ad.meta_ad_id)) {
      onAdDeselect(ad.meta_ad_id);
    } else {
      onAdSelect(ad);
    }
  };

  const handlePreview = (ad: MetaAdTemplateRecord) => {
    setPreviewAd(ad);
    setShowPreview(true);
  };

  const getCreativeType = (ad: MetaAdTemplateRecord): string => {
    if (ad.creative.video_id) return 'video';
    if (ad.creative.image_url || ad.creative.image_hash) return 'image';
    return 'text';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'DELETED': return 'bg-red-100 text-red-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      campaignId: '',
      adSetId: '',
      searchQuery: '',
      creativeType: []
    });
  };

  const hasActiveFilters = () => {
    return filters.status.length > 0 || 
           filters.campaignId || 
           filters.adSetId || 
           filters.searchQuery || 
           filters.creativeType.length > 0;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Meta Ads Browser</h2>
          <p className="text-sm text-neutral-600">
            {filteredAds.length} of {ads.length} ads found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {viewMode === 'grid' ? (
              <DocumentTextIcon className="w-5 h-5" />
            ) : (
              <PhotoIcon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={loadAds}
            disabled={isLoading}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search ads by name, title, or description..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
            {hasActiveFilters() && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                {filters.status.length + (filters.campaignId ? 1 : 0) + (filters.adSetId ? 1 : 0) + (filters.creativeType.length)}
              </span>
            )}
            {showFilters ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-neutral-50 rounded-xl space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                status: [...prev.status, option.value]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                status: prev.status.filter(s => s !== option.value)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Creative Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Creative Type
                  </label>
                  <div className="space-y-2">
                    {creativeTypeOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.creativeType.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                creativeType: [...prev.creativeType, option.value]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                creativeType: prev.creativeType.filter(t => t !== option.value)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-neutral-600">Loading Meta ads...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <XMarkIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Ads Grid/List */}
      {!isLoading && !error && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          <AnimatePresence>
            {filteredAds.map((ad) => (
              <motion.div
                key={ad.meta_ad_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${
                  selectedAds.includes(ad.meta_ad_id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                {/* Ad Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                      {ad.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                        {ad.status}
                      </span>
                      <span className="flex items-center gap-1">
                        {getCreativeType(ad) === 'video' ? (
                          <PlayIcon className="w-4 h-4" />
                        ) : (
                          <PhotoIcon className="w-4 h-4" />
                        )}
                        {getCreativeType(ad)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdSelect(ad)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedAds.includes(ad.meta_ad_id)
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {selectedAds.includes(ad.meta_ad_id) ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-current rounded" />
                    )}
                  </button>
                </div>

                {/* Ad Creative Preview */}
                <div className="mb-4">
                  {ad.creative.image_url && (
                    <div className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden mb-3">
                      <img
                        src={ad.creative.image_url}
                        alt={ad.creative.title || 'Ad image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {ad.creative.title && (
                    <h4 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                      {ad.creative.title}
                    </h4>
                  )}
                  
                  {ad.creative.body && (
                    <p className="text-sm text-neutral-600 line-clamp-3">
                      {ad.creative.body}
                    </p>
                  )}
                </div>

                {/* Ad Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <button
                    onClick={() => handlePreview(ad)}
                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </button>
                  
                  {ad.performance_metrics && (
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      {ad.performance_metrics.impressions && (
                        <span className="flex items-center gap-1">
                          <ChartBarIcon className="w-3 h-3" />
                          {ad.performance_metrics.impressions.toLocaleString()}
                        </span>
                      )}
                      {ad.performance_metrics.clicks && (
                        <span className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-3 h-3" />
                          {ad.performance_metrics.clicks.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAds.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No ads found</h3>
          <p className="text-neutral-600">
            {hasActiveFilters() 
              ? 'Try adjusting your filters or search terms'
              : 'No Meta ads are available for this account'
            }
          </p>
        </div>
      )}

      {/* Ad Preview Modal */}
      <AnimatePresence>
        {showPreview && previewAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900">Ad Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {previewAd.creative.image_url && (
                    <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                      <img
                        src={previewAd.creative.image_url}
                        alt={previewAd.creative.title || 'Ad image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">
                      {previewAd.creative.title}
                    </h4>
                    <p className="text-neutral-600 mb-3">
                      {previewAd.creative.body}
                    </p>
                    {previewAd.creative.call_to_action && (
                      <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {previewAd.creative.call_to_action.type}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-neutral-700">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(previewAd.status)}`}>
                        {previewAd.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-neutral-700">Type:</span>
                      <span className="ml-2 text-neutral-600">{getCreativeType(previewAd)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}