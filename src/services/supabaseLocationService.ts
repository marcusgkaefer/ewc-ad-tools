import { supabase } from '../lib/supabase';
import { BUILD_CONFIG } from '../config/build-config';
import type { 
  Location, 
  LocationSummary, 
  LocationConfig, 
  LocationWithConfig,
  CreateLocationConfigRequest,
  UpdateLocationConfigRequest,
  LocationFilters 
} from '../types';

// Helper types for Supabase responses
type State = {
  id: number;
  code: string;
  name: string;
  short_name: string;
};

type AddressInfo = {
  address_1: string;
  address_2?: string;
  city: string;
  zip_code: string;
};

// Convert raw location data from Supabase to LocationSummary format
export const convertToLocationSummary = (location: Location): LocationSummary => {
  // Safely extract nested data with fallbacks
  const addressInfo = location.address_info || {};
  const contactInfo = location.contact_info || {};
  const phone1 = contactInfo.phone_1 || {};
  const state = location.state || {};
  const locationCoords = location.location || {};

  return {
    id: location.id || '',
    name: location.name || 'Unknown Location',
    displayName: location.display_name || location.name || 'Unknown Location',
    city: addressInfo.city || 'Unknown City',
    state: state.short_name || 'Unknown State',
    zipCode: addressInfo.zip_code || '',
    phoneNumber: phone1.display_number || 'No phone available',
    address: `${addressInfo.address_1 || 'Unknown Address'}${addressInfo.address_2 ? ', ' + addressInfo.address_2 : ''}, ${addressInfo.city || 'Unknown City'}, ${state.short_name || 'Unknown State'} ${addressInfo.zip_code || ''}`,
    coordinates: {
      lat: locationCoords.latitude || 0,
      lng: locationCoords.longitude || 0,
    },
    locationPrime: location.code || 'UNKNOWN', // Using code as locationPrime for radius calculation
  };
};

class SupabaseLocationService {
  private ewcCentersCache: Location[] | null = null;
  private ewcCentersLoading: Promise<Location[]> | null = null;

  // Check if we should use EWC Artemis Group centers JSON file
  private shouldUseEwcCentersJson(): boolean {
    const envValue = import.meta.env.VITE_USE_ARTEMIS_GROUP;
    console.log('🔍 VITE_USE_ARTEMIS_GROUP debug:', {
      rawValue: envValue,
      type: typeof envValue,
      length: envValue ? envValue.length : 0,
      trimmed: envValue ? envValue.trim() : null,
      isExactlyTrue: envValue === 'true',
      buildConfig: BUILD_CONFIG.USE_ARTEMIS_GROUP,
      allEnvVars: import.meta.env
    });
    
    // More flexible checking to handle common issues
    const normalizedValue = String(envValue || '').toLowerCase().trim();
    const fromEnv = normalizedValue === 'true' || normalizedValue === '1';
    
    // Use build config as fallback if env var is not set
    const shouldUse = fromEnv || BUILD_CONFIG.USE_ARTEMIS_GROUP;
    
    console.log(`📊 Using ${shouldUse ? 'JSON file' : 'Supabase database'} for location data`);
    return shouldUse;
  }

  // Load EWC centers from JSON file with caching
  private async loadEwcCenters(): Promise<Location[]> {
    // Return cached data if available
    if (this.ewcCentersCache) {
      return this.ewcCentersCache;
    }

    // Return existing loading promise if already loading
    if (this.ewcCentersLoading) {
      return this.ewcCentersLoading;
    }

    // Start loading
    this.ewcCentersLoading = (async () => {
      try {
        const response = await fetch('/artemis_wax_group.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { centers: Location[] };
        
        if (!data.centers || !Array.isArray(data.centers)) {
          throw new Error('Invalid JSON structure: centers array not found');
        }

        // Cache the result
        this.ewcCentersCache = data.centers;
        return this.ewcCentersCache;
      } catch (error) {
        console.error('❌ Failed to load EWC centers from JSON:', error);
        // Reset loading promise to allow retry
        this.ewcCentersLoading = null;
        throw error;
      }
    })();

    return this.ewcCentersLoading;
  }

  // Get locations from EWC centers JSON file
  private async getEwcCentersLocations(): Promise<LocationSummary[]> {
    try {
      const locations = await this.loadEwcCenters();
      return locations
        .filter((location: Location) => location.code !== 'CORP') // Filter out corporate location
        .map(convertToLocationSummary)
        .sort((a: LocationSummary, b: LocationSummary) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error loading EWC centers from JSON:', error);
      return [];
    }
  }

  // Get a location by ID from EWC centers JSON file
  private async getEwcCenterById(id: string): Promise<Location | null> {
    try {
      const locations = await this.loadEwcCenters();
      return locations.find((location: Location) => location.id === id) || null;
    } catch (error) {
      console.error('Error finding EWC center by ID:', error);
      return null;
    }
  }

  // Search locations in EWC centers JSON file
  private async searchEwcCenters(filters: LocationFilters): Promise<LocationSummary[]> {
    try {
      let locations = await this.loadEwcCenters();
      
      // Filter out corporate location
      locations = locations.filter((location: Location) => location.code !== 'CORP');

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        locations = locations.filter((location: Location) => 
          location.name?.toLowerCase().includes(searchTerm) ||
          location.display_name?.toLowerCase().includes(searchTerm) ||
          location.address_info?.city?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply state filter
      if (filters.states && filters.states.length > 0) {
        locations = locations.filter((location: Location) => 
          filters.states!.includes(location.state?.short_name || '')
        );
      }

      // Apply city filter
      if (filters.cities && filters.cities.length > 0) {
        locations = locations.filter((location: Location) => 
          filters.cities!.includes(location.address_info?.city || '')
        );
      }

      // Apply zip code filter
      if (filters.zipCodes && filters.zipCodes.length > 0) {
        locations = locations.filter((location: Location) => 
          filters.zipCodes!.includes(location.address_info?.zip_code || '')
        );
      }

      return locations
        .map(convertToLocationSummary)
        .sort((a: LocationSummary, b: LocationSummary) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error searching EWC centers:', error);
      return [];
    }
  }

  // Get locations by state from EWC centers JSON file
  private async getEwcCentersByState(state: string): Promise<LocationSummary[]> {
    try {
      const locations = await this.loadEwcCenters();
      return locations
        .filter((location: Location) => 
          location.code !== 'CORP' && 
          location.state?.short_name === state
        )
        .map(convertToLocationSummary)
        .sort((a: LocationSummary, b: LocationSummary) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting EWC centers by state:', error);
      return [];
    }
  }

  // Get unique states from EWC centers JSON file
  private async getEwcCentersUniqueStates(): Promise<string[]> {
    try {
      const locations = await this.loadEwcCenters();
      const states = [...new Set(
        locations
          .filter((location: Location) => location.code !== 'CORP')
          .map((location: Location) => location.state?.short_name)
          .filter(Boolean)
      )] as string[];
      return states.sort();
    } catch (error) {
      console.error('Error getting unique states from EWC centers:', error);
      return [];
    }
  }

  // Get unique cities from EWC centers JSON file
  private async getEwcCentersUniqueCities(state?: string): Promise<string[]> {
    try {
      let locations = await this.loadEwcCenters();
      
      // Filter out corporate location
      locations = locations.filter((location: Location) => location.code !== 'CORP');

      // Filter by state if provided
      if (state) {
        locations = locations.filter((location: Location) => 
          location.state?.short_name === state
        );
      }

      const cities = [...new Set(
        locations
          .map((location: Location) => location.address_info?.city)
          .filter(Boolean)
      )] as string[];
      return cities.sort();
    } catch (error) {
      console.error('Error getting unique cities from EWC centers:', error);
      return [];
    }
  }

  // Location management
  async getAllLocations(): Promise<LocationSummary[]> {
    if (this.shouldUseEwcCentersJson()) {
      return await this.getEwcCentersLocations();
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .neq('code', 'CORP') // Filter out corporate location
        .order('name')
        .limit(10000); // Override default 1000 row limit

      if (error) {
        console.error('Error fetching locations:', error);
        throw new Error(`Failed to fetch locations: ${error.message}`);
      }

      return (data || []).map(convertToLocationSummary);
    } catch (error) {
      console.error('Error in getAllLocations:', error);
      throw error;
    }
  }

  async getLocationById(id: string): Promise<Location | null> {
    if (this.shouldUseEwcCentersJson()) {
      return await this.getEwcCenterById(id);
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        console.error('Error fetching location:', error);
        throw new Error(`Failed to fetch location: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getLocationById:', error);
      throw error;
    }
  }

  async searchLocations(filters: LocationFilters): Promise<LocationSummary[]> {
    if (this.shouldUseEwcCentersJson()) {
      return await this.searchEwcCenters(filters);
    }

    try {
      let query = supabase
        .from('locations')
        .select('*')
        .neq('code', 'CORP');

      // Apply search filter
      if (filters.search) {
        const searchTerm = `%${filters.search.toLowerCase()}%`;
        query = query.or(`name.ilike.${searchTerm},display_name.ilike.${searchTerm},address_info->>city.ilike.${searchTerm}`);
      }

      // Apply state filter
      if (filters.states && filters.states.length > 0) {
        query = query.in('state->>short_name', filters.states);
      }

      // Apply city filter
      if (filters.cities && filters.cities.length > 0) {
        query = query.in('address_info->>city', filters.cities);
      }

      // Apply zip code filter
      if (filters.zipCodes && filters.zipCodes.length > 0) {
        query = query.in('address_info->>zip_code', filters.zipCodes);
      }

      const { data, error } = await query.order('name').limit(10000); // Override default 1000 row limit

      if (error) {
        console.error('Error searching locations:', error);
        throw new Error(`Failed to search locations: ${error.message}`);
      }

      return (data || []).map(convertToLocationSummary);
    } catch (error) {
      console.error('Error in searchLocations:', error);
      throw error;
    }
  }

  async getLocationsByState(state: string): Promise<LocationSummary[]> {
    if (this.shouldUseEwcCentersJson()) {
      return await this.getEwcCentersByState(state);
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('state->>short_name', state)
        .neq('code', 'CORP')
        .order('name')
        .limit(10000); // Override default 1000 row limit

      if (error) {
        console.error('Error fetching locations by state:', error);
        throw new Error(`Failed to fetch locations by state: ${error.message}`);
      }

      return (data || []).map(convertToLocationSummary);
    } catch (error) {
      console.error('Error in getLocationsByState:', error);
      throw error;
    }
  }

  async getUniqueStates(): Promise<string[]> {
    if (this.shouldUseEwcCentersJson()) {
      return await this.getEwcCentersUniqueStates();
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('state')
        .neq('code', 'CORP')
        .limit(10000); // Override default 1000 row limit

      if (error) {
        console.error('Error fetching unique states:', error);
        throw new Error(`Failed to fetch unique states: ${error.message}`);
      }

      const states = [...new Set((data || []).map(row => (row.state as State)?.short_name))].filter(Boolean) as string[];
      return states.sort();
    } catch (error) {
      console.error('Error in getUniqueStates:', error);
      throw error;
    }
  }

  async getUniqueCities(state?: string): Promise<string[]> {
    if (this.shouldUseEwcCentersJson()) {
      return await this.getEwcCentersUniqueCities(state);
    }

    try {
      let query = supabase
        .from('locations')
        .select('address_info, state')
        .neq('code', 'CORP');

      if (state) {
        query = query.eq('state->>short_name', state);
      }

      const { data, error } = await query.limit(10000); // Override default 1000 row limit

      if (error) {
        console.error('Error fetching unique cities:', error);
        throw new Error(`Failed to fetch unique cities: ${error.message}`);
      }

      const cities = [...new Set((data || []).map(row => (row.address_info as AddressInfo)?.city))].filter(Boolean) as string[];
      return cities.sort();
    } catch (error) {
      console.error('Error in getUniqueCities:', error);
      throw error;
    }
  }

  // Location Configuration management
  async getLocationConfig(locationId: string, userId?: string): Promise<LocationConfig | null> {
    try {
      let query = supabase
        .from('location_configs')
        .select('*')
        .eq('location_id', locationId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No configuration found
        }
        console.error('Error fetching location config:', error);
        throw new Error(`Failed to fetch location config: ${error.message}`);
      }

      return this.convertToLocationConfig(data);
    } catch (error) {
      console.error('Error in getLocationConfig:', error);
      throw error;
    }
  }

  async createLocationConfig(request: CreateLocationConfigRequest, userId?: string): Promise<LocationConfig> {
    try {
      const { data, error } = await supabase
        .from('location_configs')
        .insert({
          location_id: request.locationId,
          user_id: userId || null,
          budget: request.budget || null,
          custom_settings: request.customSettings || null,
          notes: request.notes || null,
          primary_lat: request.primaryLat || null,
          primary_lng: request.primaryLng || null,
          radius_miles: request.radiusMiles || null,
          coordinate_list: request.coordinateList || null,
          landing_page_url: request.landingPageUrl || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating location config:', error);
        throw new Error(`Failed to create location config: ${error.message}`);
      }

      return this.convertToLocationConfig(data);
    } catch (error) {
      console.error('Error in createLocationConfig:', error);
      throw error;
    }
  }

  async updateLocationConfig(
    locationId: string,
    request: UpdateLocationConfigRequest,
    userId?: string
  ): Promise<LocationConfig> {
    try {
      let query = supabase
        .from('location_configs')
        .update({
          budget: request.budget,
          custom_settings: request.customSettings,
          notes: request.notes,
          is_active: request.isActive,
          primary_lat: request.primaryLat,
          primary_lng: request.primaryLng,
          radius_miles: request.radiusMiles,
          coordinate_list: request.coordinateList,
          landing_page_url: request.landingPageUrl,
        })
        .eq('location_id', locationId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.select().single();

      if (error) {
        console.error('Error updating location config:', error);
        throw new Error(`Failed to update location config: ${error.message}`);
      }

      return this.convertToLocationConfig(data);
    } catch (error) {
      console.error('Error in updateLocationConfig:', error);
      throw error;
    }
  }

  async deleteLocationConfig(locationId: string, userId?: string): Promise<void> {
    try {
      let query = supabase
        .from('location_configs')
        .delete()
        .eq('location_id', locationId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { error } = await query;

      if (error) {
        console.error('Error deleting location config:', error);
        throw new Error(`Failed to delete location config: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteLocationConfig:', error);
      throw error;
    }
  }

  async getLocationsWithConfigs(userId?: string): Promise<LocationWithConfig[]> {
    try {
      // Get all locations (from JSON or database based on environment variable)
      const locations = await this.getAllLocations();

      // Get all configs for the user (always from database)
      let configQuery = supabase
        .from('location_configs')
        .select('*');

      if (userId) {
        configQuery = configQuery.eq('user_id', userId);
      } else {
        configQuery = configQuery.is('user_id', null);
      }

      const { data: configs, error: configError } = await configQuery.limit(10000); // Override default 1000 row limit

      if (configError) {
        console.error('Error fetching location configs:', configError);
        throw new Error(`Failed to fetch location configs: ${configError.message}`);
      }

      // Map configs to locations
      const configMap = new Map<string, LocationConfig>();
      (configs || []).forEach(config => {
        configMap.set(config.location_id, this.convertToLocationConfig(config));
      });

      return locations.map(location => ({
        ...location,
        config: configMap.get(location.id),
      }));
    } catch (error) {
      console.error('Error in getLocationsWithConfigs:', error);
      throw error;
    }
  }

  // Bulk operations for migrating data
  async bulkInsertLocations(locations: Location[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .insert(locations);

      if (error) {
        console.error('Error bulk inserting locations:', error);
        throw new Error(`Failed to bulk insert locations: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in bulkInsertLocations:', error);
      throw error;
    }
  }

  // Helper method to convert raw database response to LocationConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertToLocationConfig(data: any): LocationConfig {
    return {
      id: data.id,
      locationId: data.location_id,
      userId: data.user_id,
      budget: data.budget,
      customSettings: data.custom_settings,
      notes: data.notes,
      isActive: data.is_active,
      primaryLat: data.primary_lat,
      primaryLng: data.primary_lng,
      radiusMiles: data.radius_miles,
      coordinateList: data.coordinate_list,
      landingPageUrl: data.landing_page_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const supabaseLocationService = new SupabaseLocationService(); 