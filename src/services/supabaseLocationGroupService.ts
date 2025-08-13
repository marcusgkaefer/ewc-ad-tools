import { supabase } from '../lib/supabase';
import type { 
  LocationGroup, 
  LocationGroupWithMembers, 
  LocationGroupMember,
  CreateLocationGroupRequest,
  UpdateLocationGroupRequest,
  AddLocationToGroupRequest,
  RemoveLocationFromGroupRequest,
  LocationSummary
} from '../types';

class SupabaseLocationGroupService {
  // Get all location groups for the current user
  async getAllGroups(): Promise<LocationGroup[]> {
    try {
      const { data, error } = await supabase
        .from('location_groups')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching location groups:', error);
        throw new Error(`Failed to fetch location groups: ${error.message}`);
      }

      return (data || []).map(this.convertToLocationGroup);
    } catch (error) {
      console.error('Error in getAllGroups:', error);
      throw error;
    }
  }

  // Get a specific location group with its members
  async getGroupById(id: string): Promise<LocationGroupWithMembers | null> {
    try {
      const { data, error } = await supabase
        .from('location_groups')
        .select(`
          *,
          location_group_members!inner(
            *,
            locations(*)
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        console.error('Error fetching location group:', error);
        throw new Error(`Failed to fetch location group: ${error.message}`);
      }

      return this.convertToLocationGroupWithMembers(data);
    } catch (error) {
      console.error('Error in getGroupById:', error);
      throw error;
    }
  }

  // Create a new location group
  async createGroup(request: CreateLocationGroupRequest): Promise<LocationGroup> {
    try {
      // Start a transaction
      const { data: group, error: groupError } = await supabase
        .from('location_groups')
        .insert({
          name: request.name,
          description: request.description || null,
          user_id: null, // For now, creating global groups
          is_active: true
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating location group:', groupError);
        throw new Error(`Failed to create location group: ${groupError.message}`);
      }

      // If initial locations are provided, add them to the group
      if (request.locationIds && request.locationIds.length > 0) {
        await this.addLocationsToGroup({
          groupId: group.id,
          locationIds: request.locationIds
        });
      }

      return this.convertToLocationGroup(group);
    } catch (error) {
      console.error('Error in createGroup:', error);
      throw error;
    }
  }

  // Update an existing location group
  async updateGroup(id: string, request: UpdateLocationGroupRequest): Promise<LocationGroup> {
    try {
      const { data, error } = await supabase
        .from('location_groups')
        .update({
          name: request.name,
          description: request.description,
          is_active: request.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating location group:', error);
        throw new Error(`Failed to update location group: ${error.message}`);
      }

      return this.convertToLocationGroup(data);
    } catch (error) {
      console.error('Error in updateGroup:', error);
      throw error;
    }
  }

  // Delete a location group (soft delete by setting is_active to false)
  async deleteGroup(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('location_groups')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting location group:', error);
        throw new Error(`Failed to delete location group: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteGroup:', error);
      throw error;
    }
  }

  // Add locations to a group
  async addLocationsToGroup(request: AddLocationToGroupRequest): Promise<void> {
    try {
      const members = request.locationIds.map(locationId => ({
        group_id: request.groupId,
        location_id: locationId,
        is_active: true
      }));

      const { error } = await supabase
        .from('location_group_members')
        .upsert(members, { 
          onConflict: 'group_id,location_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error adding locations to group:', error);
        throw new Error(`Failed to add locations to group: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in addLocationsToGroup:', error);
      throw error;
    }
  }

  // Remove locations from a group
  async removeLocationsFromGroup(request: RemoveLocationFromGroupRequest): Promise<void> {
    try {
      const { error } = await supabase
        .from('location_group_members')
        .delete()
        .eq('group_id', request.groupId)
        .in('location_id', request.locationIds);

      if (error) {
        console.error('Error removing locations from group:', error);
        throw new Error(`Failed to remove locations from group: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in removeLocationsFromGroup:', error);
      throw error;
    }
  }

  // Get locations that belong to a specific group
  async getGroupLocations(groupId: string): Promise<LocationSummary[]> {
    try {
      const { data, error } = await supabase
        .from('location_group_members')
        .select(`
          locations(*)
        `)
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching group locations:', error);
        throw new Error(`Failed to fetch group locations: ${error.message}`);
      }

      // Extract and convert location data
      const locations = data
        ?.map(item => item.locations)
        .filter(Boolean) as any[];

      return locations.map(this.convertToLocationSummary);
    } catch (error) {
      console.error('Error in getGroupLocations:', error);
      throw error;
    }
  }

  // Get all groups with their location counts
  async getGroupsWithLocationCounts(): Promise<LocationGroup[]> {
    try {
      const { data, error } = await supabase
        .from('location_groups')
        .select(`
          *,
          location_group_members!inner(count)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching groups with counts:', error);
        throw new Error(`Failed to fetch groups with counts: ${error.message}`);
      }

      return (data || []).map(group => ({
        ...this.convertToLocationGroup(group),
        locationCount: group.location_group_members?.[0]?.count || 0
      }));
    } catch (error) {
      console.error('Error in getGroupsWithLocationCounts:', error);
      throw error;
    }
  }

  // Helper method to convert raw data to LocationGroup
  private convertToLocationGroup(raw: any): LocationGroup {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      userId: raw.user_id,
      isActive: raw.is_active,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at
    };
  }

  // Helper method to convert raw data to LocationGroupWithMembers
  private convertToLocationGroupWithMembers(raw: any): LocationGroupWithMembers {
    const group = this.convertToLocationGroup(raw);
    
    const members: LocationGroupMember[] = (raw.location_group_members || []).map((member: any) => ({
      id: member.id,
      groupId: member.group_id,
      locationId: member.location_id,
      isActive: member.is_active,
      createdAt: member.created_at
    }));

    const locations: LocationSummary[] = (raw.location_group_members || [])
      .map((member: any) => member.locations)
      .filter(Boolean)
      .map(this.convertToLocationSummary);

    return {
      ...group,
      members,
      locations
    };
  }

  // Helper method to convert raw location data to LocationSummary
  private convertToLocationSummary(location: any): LocationSummary {
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
      locationPrime: location.code || 'UNKNOWN',
      landing_page_url: location.landing_page_url || undefined,
    };
  }
}

// Export singleton instance
export const supabaseLocationGroupService = new SupabaseLocationGroupService();