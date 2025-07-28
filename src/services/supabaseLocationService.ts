import { supabase } from '../lib/supabase';
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
  // Location management
  async getAllLocations(): Promise<LocationSummary[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .neq('code', 'CORP') // Filter out corporate location
        .order('name');

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

      const { data, error } = await query.order('name');

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
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('state->>short_name', state)
        .neq('code', 'CORP')
        .order('name');

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
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('state')
        .neq('code', 'CORP');

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
    try {
      let query = supabase
        .from('locations')
        .select('address_info, state')
        .neq('code', 'CORP');

      if (state) {
        query = query.eq('state->>short_name', state);
      }

      const { data, error } = await query;

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
      // Get all locations
      const locations = await this.getAllLocations();

      // Get all configs for the user
      let configQuery = supabase
        .from('location_configs')
        .select('*');

      if (userId) {
        configQuery = configQuery.eq('user_id', userId);
      } else {
        configQuery = configQuery.is('user_id', null);
      }

      const { data: configs, error: configError } = await configQuery;

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