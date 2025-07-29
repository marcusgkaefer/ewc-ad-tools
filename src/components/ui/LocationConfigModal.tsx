import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import type { LocationSummary, LocationConfig, CreateLocationConfigRequest, UpdateLocationConfigRequest } from '../../types';
import { supabaseLocationService } from '../../services/supabaseLocationService';

interface LocationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationSummary;
  config?: LocationConfig | null;
  onSave: (config: LocationConfig) => void;
}

export function LocationConfigModal({ 
  isOpen, 
  onClose, 
  location, 
  config,
  onSave 
}: LocationConfigModalProps) {
  const [notes, setNotes] = useState<string>('');
  const [landingPageUrl, setLandingPageUrl] = useState<string>('');
  
  // Targeting fields
  const [primaryLat, setPrimaryLat] = useState<string>('');
  const [primaryLng, setPrimaryLng] = useState<string>('');
  const [radiusMiles, setRadiusMiles] = useState<string>('');
  const [coordinateList, setCoordinateList] = useState<Array<{ lat: string; lng: string; radius: string; id: string }>>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing config data
  useEffect(() => {
    if (config) {
      setNotes(config.notes || '');
      setLandingPageUrl(config.landingPageUrl || '');
      setPrimaryLat(config.primaryLat?.toString() || '');
      setPrimaryLng(config.primaryLng?.toString() || '');
      setRadiusMiles(config.radiusMiles?.toString() || '');
      
      // Convert coordinate list to form format
      if (config.coordinateList) {
        setCoordinateList(config.coordinateList.map((coord, index) => ({
          lat: coord.lat.toString(),
          lng: coord.lng.toString(),
          radius: coord.radius?.toString() || '1',
          id: `coord-${index}`,
        })));
      } else {
        setCoordinateList([]);
      }
    } else {
      // Reset form for new config, but use location's existing data as defaults
      setNotes('');
      setLandingPageUrl('');
      // Use location's existing coordinates as defaults
      setPrimaryLat(location.coordinates.lat.toString());
      setPrimaryLng(location.coordinates.lng.toString());
      // Set default radius of 5 miles
      setRadiusMiles('5');
      setCoordinateList([]);
    }
    setError(null);
  }, [config, isOpen, location.coordinates.lat, location.coordinates.lng]);

  if (!isOpen) return null;

  const addCoordinate = () => {
    setCoordinateList([...coordinateList, { lat: '', lng: '', radius: '', id: `coord-${Date.now()}` }]);
  };

  const removeCoordinate = (id: string) => {
    setCoordinateList(coordinateList.filter(coord => coord.id !== id));
  };

  const updateCoordinate = (id: string, field: 'lat' | 'lng' | 'radius', value: string) => {
    setCoordinateList(coordinateList.map(coord => 
      coord.id === id ? { ...coord, [field]: value } : coord
    ));
  };

  const validateForm = (): string | null => {
    // Primary coordinates validation
    if (primaryLat.trim() || primaryLng.trim() || radiusMiles.trim()) {
      const lat = parseFloat(primaryLat);
      const lng = parseFloat(primaryLng);
      const radius = parseFloat(radiusMiles);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        return 'Primary latitude must be between -90 and 90';
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return 'Primary longitude must be between -180 and 180';
      }
      if (isNaN(radius) || radius <= 0) {
        return 'Radius must be a positive number';
      }
    }

    // Coordinate list validation
    for (const coord of coordinateList) {
      if (coord.lat.trim() && coord.lng.trim()) {
        const lat = parseFloat(coord.lat);
        const lng = parseFloat(coord.lng);
        const radius = coord.radius.trim() ? parseFloat(coord.radius) : 1;
        
        if (isNaN(lat) || lat < -90 || lat > 90) {
          return 'All latitudes must be between -90 and 90';
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          return 'All longitudes must be between -180 and 180';
        }
        if (coord.radius.trim() && (isNaN(radius) || radius <= 0)) {
          return 'All radius values must be positive numbers';
        }
      } else if (coord.lat.trim() || coord.lng.trim() || coord.radius.trim()) {
        return 'Latitude, longitude, and radius are required for each coordinate';
      }
    }

    // Landing page URL validation
    if (landingPageUrl.trim()) {
      try {
        new URL(landingPageUrl);
      } catch {
        return 'Please enter a valid landing page URL';
      }
    }

    return null;
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setIsLoading(false);
        return;
      }

      const primaryLatValue = primaryLat.trim() ? parseFloat(primaryLat) : undefined;
      const primaryLngValue = primaryLng.trim() ? parseFloat(primaryLng) : undefined;
      const radiusValue = radiusMiles.trim() ? parseFloat(radiusMiles) : undefined;
      
      // Process coordinate list
      const validCoordinates = coordinateList
        .filter(coord => coord.lat.trim() && coord.lng.trim())
        .map(coord => ({
          lat: parseFloat(coord.lat),
          lng: parseFloat(coord.lng),
          radius: coord.radius.trim() ? parseFloat(coord.radius) : 1,
        }));

      let savedConfig: LocationConfig;

      if (config) {
        // Update existing config
        const updateRequest: UpdateLocationConfigRequest = {
          notes: notes.trim() || undefined,
          primaryLat: primaryLatValue,
          primaryLng: primaryLngValue,
          radiusMiles: radiusValue,
          coordinateList: validCoordinates.length > 0 ? validCoordinates : undefined,
          landingPageUrl: landingPageUrl.trim() || undefined,
          isActive: true,
        };

        savedConfig = await supabaseLocationService.updateLocationConfig(
          location.id,
          updateRequest
        );
      } else {
        // Create new config
        const createRequest: CreateLocationConfigRequest = {
          locationId: location.id,
          notes: notes.trim() || undefined,
          primaryLat: primaryLatValue,
          primaryLng: primaryLngValue,
          radiusMiles: radiusValue,
          coordinateList: validCoordinates.length > 0 ? validCoordinates : undefined,
          landingPageUrl: landingPageUrl.trim() || undefined,
        };

        savedConfig = await supabaseLocationService.createLocationConfig(createRequest);
      }

      onSave(savedConfig);
      onClose();
    } catch (err) {
      console.error('Error saving location config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configure Location</h2>
            <p className="text-sm text-gray-500 mt-1">{location.displayName}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Landing Page URL */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-sm">
              Landing Page URL
            </label>
            <input
              type="url"
              value={landingPageUrl}
              onChange={(e) => setLandingPageUrl(e.target.value)}
              placeholder="https://example.com/location"
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
            />
          </div>

          {/* Primary Targeting */}
          <div>
            <label className="block font-semibold text-gray-700 mb-3 text-sm">
              Primary Targeting
            </label>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                value={primaryLat}
                onChange={(e) => setPrimaryLat(e.target.value)}
                placeholder="Latitude"
                step="any"
                min="-90"
                max="90"
                disabled={isLoading}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
              />
              <input
                type="number"
                value={primaryLng}
                onChange={(e) => setPrimaryLng(e.target.value)}
                placeholder="Longitude"
                step="any"
                min="-180"
                max="180"
                disabled={isLoading}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
              />
              <input
                type="number"
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(e.target.value)}
                placeholder="Radius (mi)"
                min="0.1"
                step="0.1"
                disabled={isLoading}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all duration-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Additional Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block font-semibold text-gray-700 text-sm">
                Additional Coordinates
              </label>
              <Button
                onClick={addCoordinate}
                size="sm"
                variant="ghost"
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4" />
                Add
              </Button>
            </div>
            
            {coordinateList.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {coordinateList.map((coord, index) => (
                  <div key={coord.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5">#{index + 1}</span>
                    <input
                      type="number"
                      value={coord.lat}
                      onChange={(e) => updateCoordinate(coord.id, 'lat', e.target.value)}
                      placeholder="Lat"
                      step="any"
                      min="-90"
                      max="90"
                      disabled={isLoading}
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
                    />
                    <input
                      type="number"
                      value={coord.lng}
                      onChange={(e) => updateCoordinate(coord.id, 'lng', e.target.value)}
                      placeholder="Lng"
                      step="any"
                      min="-180"
                      max="180"
                      disabled={isLoading}
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
                    />
                    <input
                      type="number"
                      value={coord.radius}
                      onChange={(e) => updateCoordinate(coord.id, 'radius', e.target.value)}
                      placeholder="Radius"
                      step="0.1"
                      min="0.1"
                      disabled={isLoading}
                      className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white transition-all duration-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:outline-none disabled:bg-gray-100 disabled:opacity-50"
                    />
                    <button
                      onClick={() => removeCoordinate(coord.id)}
                      disabled={isLoading}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200 disabled:opacity-50"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 text-sm">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or special instructions..."
              rows={3}
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none disabled:bg-gray-100 disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        {/* Fixed Footer with Save/Cancel Buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50/50">
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleClose}
              variant="ghost"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  {config ? 'Update' : 'Save'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 