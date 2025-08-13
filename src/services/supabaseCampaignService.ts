import { supabase } from '../lib/supabase';
import type {
  Campaign,
  CampaignLocation,
  CampaignWithLocations,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CreateCampaignLocationRequest,
  UpdateCampaignLocationRequest,
  LocationSummary,
} from '../types';

class SupabaseCampaignService {
  // Campaign CRUD operations
  async createCampaign(
    request: CreateCampaignRequest,
    userId?: string
  ): Promise<Campaign> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          user_id: userId || null,
          name: request.name,
          platform: request.platform || 'Meta',
          objective: request.objective || 'Engagement',
          test_type: request.testType || 'LocalTest',
          duration: request.duration || 'Evergreen',
          budget: request.budget,
          bid_strategy: request.bidStrategy || 'Highest volume or value',
          start_date: request.startDate || null,
          end_date: request.endDate || null,
          default_radius_miles: request.defaultRadiusMiles || 5,
          configuration: request.configuration || null,
          notes: request.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        throw new Error(`Failed to create campaign: ${error.message}`);
      }

      return this.convertToCampaign(data);
    } catch (error) {
      console.error('Error in createCampaign:', error);
      throw error;
    }
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No campaign found
        }
        console.error('Error fetching campaign:', error);
        throw new Error(`Failed to fetch campaign: ${error.message}`);
      }

      return this.convertToCampaign(data);
    } catch (error) {
      console.error('Error in getCampaign:', error);
      throw error;
    }
  }

  async getAllCampaigns(userId?: string): Promise<Campaign[]> {
    try {
      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw new Error(`Failed to fetch campaigns: ${error.message}`);
      }

      return (data || []).map(this.convertToCampaign);
    } catch (error) {
      console.error('Error in getAllCampaigns:', error);
      throw error;
    }
  }

  async updateCampaign(
    id: string,
    request: UpdateCampaignRequest
  ): Promise<Campaign> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          name: request.name,
          platform: request.platform,
          objective: request.objective,
          test_type: request.testType,
          duration: request.duration,
          budget: request.budget,
          bid_strategy: request.bidStrategy,
          start_date: request.startDate,
          end_date: request.endDate,
          default_radius_miles: request.defaultRadiusMiles,
          status: request.status,
          configuration: request.configuration,
          notes: request.notes,
          is_active: request.isActive,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign:', error);
        throw new Error(`Failed to update campaign: ${error.message}`);
      }

      return this.convertToCampaign(data);
    } catch (error) {
      console.error('Error in updateCampaign:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting campaign:', error);
        throw new Error(`Failed to delete campaign: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteCampaign:', error);
      throw error;
    }
  }

  // Campaign Location operations
  async addLocationToCampaign(
    request: CreateCampaignLocationRequest
  ): Promise<CampaignLocation> {
    try {
      const { data, error } = await supabase
        .from('campaign_locations')
        .insert({
          campaign_id: request.campaignId,
          location_id: request.locationId,
          location_budget: request.locationBudget || null,
          location_radius_miles: request.locationRadiusMiles || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding location to campaign:', error);
        throw new Error(`Failed to add location to campaign: ${error.message}`);
      }

      return this.convertToCampaignLocation(data);
    } catch (error) {
      console.error('Error in addLocationToCampaign:', error);
      throw error;
    }
  }

  async updateCampaignLocation(
    campaignId: string,
    locationId: string,
    request: UpdateCampaignLocationRequest
  ): Promise<CampaignLocation> {
    try {
      const { data, error } = await supabase
        .from('campaign_locations')
        .update({
          location_budget: request.locationBudget,
          location_radius_miles: request.locationRadiusMiles,
          is_active: request.isActive,
        })
        .eq('campaign_id', campaignId)
        .eq('location_id', locationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating campaign location:', error);
        throw new Error(`Failed to update campaign location: ${error.message}`);
      }

      return this.convertToCampaignLocation(data);
    } catch (error) {
      console.error('Error in updateCampaignLocation:', error);
      throw error;
    }
  }

  async removeLocationFromCampaign(
    campaignId: string,
    locationId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('campaign_locations')
        .update({ is_active: false })
        .eq('campaign_id', campaignId)
        .eq('location_id', locationId);

      if (error) {
        console.error('Error removing location from campaign:', error);
        throw new Error(
          `Failed to remove location from campaign: ${error.message}`
        );
      }
    } catch (error) {
      console.error('Error in removeLocationFromCampaign:', error);
      throw error;
    }
  }

  async getCampaignWithLocations(
    campaignId: string
  ): Promise<CampaignWithLocations | null> {
    try {
      // Get campaign
      const campaign = await this.getCampaign(campaignId);
      if (!campaign) return null;

      // Get campaign locations with location details
      const { data: campaignLocations, error } = await supabase
        .from('campaign_locations')
        .select(
          `
          *,
          locations (*)
        `
        )
        .eq('campaign_id', campaignId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching campaign locations:', error);
        throw new Error(`Failed to fetch campaign locations: ${error.message}`);
      }

      const locations = (campaignLocations || []).map(cl => ({
        ...this.convertToCampaignLocation(cl),
        location: {
          id: cl.locations.id || '',
          name: cl.locations.name || 'Unknown Location',
          displayName:
            cl.locations.display_name ||
            cl.locations.name ||
            'Unknown Location',
          city: cl.locations.address_info?.city || 'Unknown City',
          state: cl.locations.state?.short_name || 'Unknown State',
          zipCode: cl.locations.address_info?.zip_code || '',
          phoneNumber:
            cl.locations.contact_info?.phone_1?.display_number ||
            'No phone available',
          address: `${cl.locations.address_info?.address_1 || 'Unknown Address'}${cl.locations.address_info?.address_2 ? ', ' + cl.locations.address_info.address_2 : ''}, ${cl.locations.address_info?.city || 'Unknown City'}, ${cl.locations.state?.short_name || 'Unknown State'} ${cl.locations.address_info?.zip_code || ''}`,
          coordinates: {
            lat: cl.locations.location?.latitude || 0,
            lng: cl.locations.location?.longitude || 0,
          },
          locationPrime: cl.locations.code || 'UNKNOWN',
        } as LocationSummary,
      }));

      return {
        ...campaign,
        locations,
      };
    } catch (error) {
      console.error('Error in getCampaignWithLocations:', error);
      throw error;
    }
  }

  async bulkAddLocationsToCampaign(
    campaignId: string,
    locationIds: string[],
    defaultBudget?: number,
    defaultRadius?: number
  ): Promise<CampaignLocation[]> {
    try {
      const inserts = locationIds.map(locationId => ({
        campaign_id: campaignId,
        location_id: locationId,
        location_budget: defaultBudget || null,
        location_radius_miles: defaultRadius || null,
      }));

      const { data, error } = await supabase
        .from('campaign_locations')
        .insert(inserts)
        .select();

      if (error) {
        console.error('Error bulk adding locations to campaign:', error);
        throw new Error(
          `Failed to bulk add locations to campaign: ${error.message}`
        );
      }

      return (data || []).map(this.convertToCampaignLocation);
    } catch (error) {
      console.error('Error in bulkAddLocationsToCampaign:', error);
      throw error;
    }
  }

  // Helper methods for data conversion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertToCampaign(data: any): Campaign {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      platform: data.platform,
      objective: data.objective,
      testType: data.test_type,
      duration: data.duration,
      budget: data.budget,
      bidStrategy: data.bid_strategy,
      startDate: data.start_date,
      endDate: data.end_date,
      defaultRadiusMiles: data.default_radius_miles,
      status: data.status,
      configuration: data.configuration,
      notes: data.notes,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertToCampaignLocation(data: any): CampaignLocation {
    return {
      id: data.id,
      campaignId: data.campaign_id,
      locationId: data.location_id,
      locationBudget: data.location_budget,
      locationRadiusMiles: data.location_radius_miles,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }
}

export const supabaseCampaignService = new SupabaseCampaignService();
