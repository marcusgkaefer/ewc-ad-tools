import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  EyeIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import type { LocationSummary, AdConfiguration, CampaignConfiguration } from '../../types';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationSummary[];
  ads: AdConfiguration[];
  campaign: CampaignConfiguration;
  title?: string;
}

interface PreviewRow {
  locationId: string;
  locationName: string;
  city: string;
  state: string;
  coordinates: string;
  adName: string;
  campaignName: string;
  landingPage: string;
  caption: string;
  status: string;
  scheduledDate: string;
  budget: number;
  objective: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  isOpen,
  onClose,
  locations,
  ads,
  campaign,
  title = 'Campaign Data Preview'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAd, setSelectedAd] = useState<string>('all');
  const itemsPerPage = 12;

  // Generate preview data
  const previewData = useMemo(() => {
    const data: PreviewRow[] = [];
    
    for (const location of locations) {
      for (const ad of ads) {
        const locationName = location.name.replace(/\s+/g, '');
        const campaignName = `${campaign.prefix}${campaign.month}${campaign.day}_${campaign.objective}_${campaign.testType}_${locationName}`;
        
        data.push({
          locationId: location.id,
          locationName: location.name,
          city: location.city,
          state: location.state,
          coordinates: `(${location.coordinates.lat.toFixed(3)}, ${location.coordinates.lng.toFixed(3)}) +${campaign.radius}mi`,
          adName: ad.name,
          campaignName,
          landingPage: ad.landingPage,
          caption: ad.caption,
          status: ad.status,
          scheduledDate: ad.scheduledDate || campaign.selectedDate.toLocaleDateString('en-US'),
          budget: campaign.budget,
          objective: campaign.objective
        });
      }
    }
    
    return data;
  }, [locations, ads, campaign]);

  // Filter data based on search and ad selection
  const filteredData = useMemo(() => {
    let filtered = previewData;
    
    // Filter by ad
    if (selectedAd !== 'all') {
      filtered = filtered.filter(row => row.adName === selectedAd);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row => 
        row.locationName.toLowerCase().includes(query) ||
        row.city.toLowerCase().includes(query) ||
        row.state.toLowerCase().includes(query) ||
        row.campaignName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [previewData, selectedAd, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    totalCampaigns: filteredData.length,
    totalLocations: new Set(filteredData.map(row => row.locationId)).size,
    totalAds: new Set(filteredData.map(row => row.adName)).size,
    totalBudget: filteredData.reduce((sum, row) => sum + row.budget, 0)
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-lg)',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              overflow: 'hidden',
              background: 'white',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-2xl)',
              border: '1px solid var(--gray-200)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-xl)',
              borderBottom: '1px solid var(--gray-200)',
              background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--primary-100)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <EyeIcon style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: 'var(--gray-900)',
                    margin: 0
                  }}>
                    {title}
                  </h2>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--gray-600)',
                    margin: 0
                  }}>
                    Preview of {stats.totalCampaigns} campaigns across {stats.totalLocations} locations
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: 'var(--space-sm)',
                  background: 'var(--gray-100)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--gray-600)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <XMarkIcon style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Stats Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-lg)',
              padding: 'var(--space-lg)',
              background: 'var(--gray-50)',
              borderBottom: '1px solid var(--gray-200)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-xs)'
                }}>
                  <ChartBarIcon style={{ width: '16px', height: '16px', color: 'var(--primary-500)' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                    {stats.totalCampaigns}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Campaigns</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-xs)'
                }}>
                  <MapPinIcon style={{ width: '16px', height: '16px', color: 'var(--success-500)' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-600)' }}>
                    {stats.totalLocations}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Locations</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-xs)'
                }}>
                  <DocumentTextIcon style={{ width: '16px', height: '16px', color: 'var(--secondary-500)' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary-600)' }}>
                    {stats.totalAds}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Ad Variations</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-xs)'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: 700, 
                    color: 'var(--orange-500)' 
                  }}>
                    $
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--orange-600)' }}>
                    {stats.totalBudget.toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>Total Budget</div>
              </div>
            </div>

            {/* Filters */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-lg)',
              padding: 'var(--space-lg)',
              borderBottom: '1px solid var(--gray-200)',
              background: 'white'
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <MagnifyingGlassIcon style={{
                  position: 'absolute',
                  left: 'var(--space-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: 'var(--gray-400)'
                }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-md) var(--space-lg) var(--space-md) var(--space-xl)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease'
                  }}
                  placeholder="Search locations or campaigns..."
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <FunnelIcon style={{ width: '16px', height: '16px', color: 'var(--gray-500)' }} />
                <select
                  value={selectedAd}
                  onChange={(e) => {
                    setSelectedAd(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Ads</option>
                  {ads.map(ad => (
                    <option key={ad.id} value={ad.name}>{ad.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ 
              padding: 'var(--space-lg)', 
              overflowY: 'auto',
              maxHeight: '400px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                gap: 'var(--space-md)',
                padding: 'var(--space-md) 0',
                borderBottom: '2px solid var(--gray-200)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--gray-700)',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>
                <div>Location</div>
                <div>Ad</div>
                <div>Campaign</div>
                <div>Budget</div>
                <div>Status</div>
                <div>Objective</div>
                <div>Date</div>
                <div>Coordinates</div>
              </div>
              
              {paginatedData.map((row, index) => (
                <motion.div
                  key={`${row.locationId}-${row.adName}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md) 0',
                    borderBottom: '1px solid var(--gray-100)',
                    fontSize: '0.875rem',
                    alignItems: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                      {row.locationName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                      {row.city}, {row.state}
                    </div>
                  </div>
                  <div style={{ color: 'var(--gray-800)' }}>{row.adName}</div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem', 
                    color: 'var(--gray-700)' 
                  }}>
                    {row.campaignName.length > 20 ? 
                      `${row.campaignName.substring(0, 20)}...` : 
                      row.campaignName
                    }
                  </div>
                  <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                    ${row.budget}
                  </div>
                  <div>
                    <span style={{
                      padding: 'var(--space-xs) var(--space-sm)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      background: 
                        row.status === 'Active' ? 'var(--success-100)' :
                        row.status === 'Paused' ? 'var(--warning-100)' : 'var(--gray-100)',
                      color: 
                        row.status === 'Active' ? 'var(--success-700)' :
                        row.status === 'Paused' ? 'var(--warning-700)' : 'var(--gray-700)'
                    }}>
                      {row.status}
                    </span>
                  </div>
                  <div style={{ color: 'var(--gray-700)' }}>{row.objective}</div>
                  <div style={{ color: 'var(--gray-700)' }}>{row.scheduledDate}</div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem', 
                    color: 'var(--gray-600)' 
                  }}>
                    {row.coordinates}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-lg)',
                borderTop: '1px solid var(--gray-200)',
                background: 'var(--gray-50)'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: 'var(--space-sm)',
                      background: currentPage === 1 ? 'var(--gray-100)' : 'white',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      color: currentPage === 1 ? 'var(--gray-400)' : 'var(--gray-700)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ChevronLeftIcon style={{ width: '16px', height: '16px' }} />
                  </button>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: 'var(--space-sm)',
                      background: currentPage === totalPages ? 'var(--gray-100)' : 'white',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      color: currentPage === totalPages ? 'var(--gray-400)' : 'var(--gray-700)',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ChevronRightIcon style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilePreview; 