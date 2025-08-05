import { supabase } from '../lib/supabase';
import { metaApiService } from './metaApiService';
import type {
  MetaAd,
  MetaCampaign,
  MetaAdSet,
  MetaAccount,
  MetaAdTemplateRecord,
  CampaignMetaAdRecord,
  MetaAdVariableRecord,
  MetaAdLocationOverrideRecord,
  MetaAdFilters,
  MetaAdSyncRequest,
  CampaignOverrides,
  LocationOverride,
  ProcessedAd,
  VariableContext,
  TemplateVariable
} from '../types/meta';
import type { LocationWithConfig, CampaignConfiguration } from '../types';

// Meta Integration Service
class MetaIntegrationService {
  // Database Operations for Meta Accounts
  async saveMetaAccount(accountData: {
    user_id: string;
    account_id: string;
    account_name: string;
    access_token: string;
    refresh_token?: string;
    token_expires_at?: string;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('meta_accounts')
      .upsert({
        ...accountData,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving Meta account:', error);
      throw new Error('Failed to save Meta account');
    }

    return data.id;
  }

  async getMetaAccounts(userId: string): Promise<MetaAccountRecord[]> {
    const { data, error } = await supabase
      .from('meta_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Meta accounts:', error);
      throw new Error('Failed to fetch Meta accounts');
    }

    return data || [];
  }

  async deleteMetaAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('meta_accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (error) {
      console.error('Error deleting Meta account:', error);
      throw new Error('Failed to delete Meta account');
    }
  }

  // Meta Ad Templates Management
  async syncMetaAds(accountId: string, forceRefresh = false): Promise<void> {
    try {
      // Get ads from Meta API
      const metaAds = await metaApiService.getAds(accountId);
      
      // Transform and save to database
      const adTemplates: Omit<MetaAdTemplateRecord, 'id' | 'created_at' | 'updated_at'>[] = metaAds.map(ad => ({
        meta_ad_id: ad.id,
        name: ad.name,
        creative: ad.creative,
        targeting: ad.targeting,
        campaign_id: ad.campaign_id,
        ad_set_id: ad.adset_id,
        account_id: ad.account_id,
        status: ad.status,
        performance_metrics: ad.bid_info ? {
          impressions: ad.bid_info.impressions,
          clicks: ad.bid_info.clicks,
          spend: ad.bid_info.spend,
          reach: ad.bid_info.reach
        } : undefined,
        last_synced: new Date().toISOString()
      }));

      // Upsert ad templates
      const { error } = await supabase
        .from('meta_ad_templates')
        .upsert(adTemplates, { onConflict: 'meta_ad_id' });

      if (error) {
        console.error('Error syncing Meta ads:', error);
        throw new Error('Failed to sync Meta ads');
      }

      console.log(`Successfully synced ${adTemplates.length} Meta ads`);
    } catch (error) {
      console.error('Error in syncMetaAds:', error);
      throw error;
    }
  }

  async getMetaAdTemplates(accountId?: string, filters?: MetaAdFilters): Promise<MetaAdTemplateRecord[]> {
    let query = supabase
      .from('meta_ad_templates')
      .select('*')
      .order('name', { ascending: true });

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }

    if (filters?.adSetId) {
      query = query.eq('ad_set_id', filters.adSetId);
    }

    if (filters?.searchQuery) {
      query = query.ilike('name', `%${filters.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching Meta ad templates:', error);
      throw new Error('Failed to fetch Meta ad templates');
    }

    return data || [];
  }

  async getMetaAdTemplateById(templateId: string): Promise<MetaAdTemplateRecord | null> {
    const { data, error } = await supabase
      .from('meta_ad_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Error fetching Meta ad template:', error);
      throw new Error('Failed to fetch Meta ad template');
    }

    return data;
  }

  async updateMetaAdTemplate(templateId: string, updates: Partial<MetaAdTemplateRecord>): Promise<void> {
    const { error } = await supabase
      .from('meta_ad_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) {
      console.error('Error updating Meta ad template:', error);
      throw new Error('Failed to update Meta ad template');
    }
  }

  // Campaign Meta Ads Management
  async saveCampaignMetaAds(campaignId: string, metaAds: {
    meta_ad_id: string;
    meta_ad_name: string;
    location_id?: string;
    override_settings?: Record<string, any>;
  }[]): Promise<void> {
    const campaignMetaAds = metaAds.map(ad => ({
      campaign_id: campaignId,
      meta_ad_id: ad.meta_ad_id,
      meta_ad_name: ad.meta_ad_name,
      location_id: ad.location_id,
      override_settings: ad.override_settings,
      is_active: true
    }));

    const { error } = await supabase
      .from('campaign_meta_ads')
      .upsert(campaignMetaAds, { onConflict: 'campaign_id,meta_ad_id' });

    if (error) {
      console.error('Error saving campaign Meta ads:', error);
      throw new Error('Failed to save campaign Meta ads');
    }
  }

  async getCampaignMetaAds(campaignId: string): Promise<CampaignMetaAdRecord[]> {
    const { data, error } = await supabase
      .from('campaign_meta_ads')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching campaign Meta ads:', error);
      throw new Error('Failed to fetch campaign Meta ads');
    }

    return data || [];
  }

  async updateCampaignMetaAdOverride(
    campaignId: string,
    metaAdId: string,
    overrides: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('campaign_meta_ads')
      .update({
        override_settings: overrides,
        updated_at: new Date().toISOString()
      })
      .eq('campaign_id', campaignId)
      .eq('meta_ad_id', metaAdId);

    if (error) {
      console.error('Error updating campaign Meta ad overrides:', error);
      throw new Error('Failed to update campaign Meta ad overrides');
    }
  }

  // Meta Ad Variables Management
  async saveMetaAdVariables(metaAdId: string, variables: TemplateVariable[]): Promise<void> {
    const variableRecords = variables.map(variable => ({
      meta_ad_id: metaAdId,
      variable_name: variable.name,
      variable_type: variable.type,
      default_value: variable.value,
      is_required: variable.isRequired,
      description: variable.description
    }));

    const { error } = await supabase
      .from('meta_ad_variables')
      .upsert(variableRecords, { onConflict: 'meta_ad_id,variable_name' });

    if (error) {
      console.error('Error saving Meta ad variables:', error);
      throw new Error('Failed to save Meta ad variables');
    }
  }

  async getMetaAdVariables(metaAdId: string): Promise<MetaAdVariableRecord[]> {
    const { data, error } = await supabase
      .from('meta_ad_variables')
      .select('*')
      .eq('meta_ad_id', metaAdId)
      .order('variable_name', { ascending: true });

    if (error) {
      console.error('Error fetching Meta ad variables:', error);
      throw new Error('Failed to fetch Meta ad variables');
    }

    return data || [];
  }

  // Location Overrides Management
  async saveLocationOverrides(
    campaignMetaAdId: string,
    locationId: string,
    overrideType: 'creative' | 'targeting' | 'budget',
    overrideData: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('meta_ad_location_overrides')
      .upsert({
        campaign_meta_ad_id: campaignMetaAdId,
        location_id: locationId,
        override_type: overrideType,
        override_data: overrideData
      }, { onConflict: 'campaign_meta_ad_id,location_id,override_type' });

    if (error) {
      console.error('Error saving location overrides:', error);
      throw new Error('Failed to save location overrides');
    }
  }

  async getLocationOverrides(campaignMetaAdId: string): Promise<MetaAdLocationOverrideRecord[]> {
    const { data, error } = await supabase
      .from('meta_ad_location_overrides')
      .select('*')
      .eq('campaign_meta_ad_id', campaignMetaAdId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching location overrides:', error);
      throw new Error('Failed to fetch location overrides');
    }

    return data || [];
  }

  // Campaign Generation with Meta Ads
  async generateCampaignWithMetaAds(
    campaignConfig: CampaignConfiguration,
    selectedAds: MetaAd[],
    locations: LocationWithConfig[],
    overrides: CampaignOverrides
  ): Promise<ProcessedAd[]> {
    const processedAds: ProcessedAd[] = [];

    for (const location of locations) {
      for (const metaAd of selectedAds) {
        const variableContext: VariableContext = {
          location: {
            name: location.name,
            city: location.city,
            state: location.state,
            zipCode: location.zipCode,
            phoneNumber: location.phoneNumber,
            address: location.address,
            landingPageUrl: location.landing_page_url,
            coordinates: location.coordinates
          },
          campaign: {
            name: campaignConfig.prefix,
            objective: campaignConfig.objective,
            platform: campaignConfig.platform,
            budget: campaignConfig.budget,
            startDate: campaignConfig.startDate,
            endDate: campaignConfig.endDate
          },
          custom: overrides.locationSpecific?.[location.id]?.custom || {}
        };

        const processedAd = await this.processMetaAdWithVariables(metaAd, variableContext, overrides);
        processedAds.push(processedAd);
      }
    }

    return processedAds;
  }

  // Template Processing with Variables
  async processMetaAdWithVariables(
    metaAd: MetaAd,
    variableContext: VariableContext,
    overrides: CampaignOverrides
  ): Promise<ProcessedAd> {
    // Apply overrides to creative
    let processedCreative = { ...metaAd.creative };
    
    if (overrides.creative) {
      processedCreative = { ...processedCreative, ...overrides.creative };
    }

    // Process variables in creative content
    const processedContent = {
      title: this.processTemplateVariables(processedCreative.title || '', variableContext),
      body: this.processTemplateVariables(processedCreative.body || '', variableContext),
      callToAction: this.processTemplateVariables(processedCreative.call_to_action?.type || '', variableContext),
      landingPageUrl: this.processTemplateVariables(processedCreative.call_to_action?.value?.link || '', variableContext)
    };

    return {
      id: metaAd.id,
      name: metaAd.name,
      creative: processedCreative,
      targeting: metaAd.targeting,
      variables: variableContext,
      processedContent
    };
  }

  private processTemplateVariables(template: string, context: VariableContext): string {
    // Simple variable replacement (can be enhanced with Handlebars in V2)
    let processed = template;

    // Location variables
    if (context.location) {
      processed = processed
        .replace(/\{\{location\.name\}\}/g, context.location.name)
        .replace(/\{\{location\.city\}\}/g, context.location.city)
        .replace(/\{\{location\.state\}\}/g, context.location.state)
        .replace(/\{\{location\.zipCode\}\}/g, context.location.zipCode)
        .replace(/\{\{location\.phoneNumber\}\}/g, context.location.phoneNumber)
        .replace(/\{\{location\.address\}\}/g, context.location.address)
        .replace(/\{\{location\.landingPageUrl\}\}/g, context.location.landingPageUrl || '');
    }

    // Campaign variables
    if (context.campaign) {
      processed = processed
        .replace(/\{\{campaign\.name\}\}/g, context.campaign.name)
        .replace(/\{\{campaign\.objective\}\}/g, context.campaign.objective)
        .replace(/\{\{campaign\.platform\}\}/g, context.campaign.platform)
        .replace(/\{\{campaign\.budget\}\}/g, context.campaign.budget.toString())
        .replace(/\{\{campaign\.startDate\}\}/g, context.campaign.startDate)
        .replace(/\{\{campaign\.endDate\}\}/g, context.campaign.endDate);
    }

    // Custom variables
    if (context.custom) {
      Object.entries(context.custom).forEach(([key, value]) => {
        processed = processed.replace(new RegExp(`\\{\\{custom\\.${key}\\}\\}`, 'g'), value);
      });
    }

    return processed;
  }

  // Validation Methods
  async validateMetaAdVariables(template: string, availableVariables: string[]): Promise<{
    isValid: boolean;
    missingVariables: string[];
    errors: string[];
  }> {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const foundVariables: string[] = [];
    const missingVariables: string[] = [];
    const errors: string[] = [];

    let match;
    while ((match = variableRegex.exec(template)) !== null) {
      const variable = match[1];
      foundVariables.push(variable);

      if (!availableVariables.includes(variable)) {
        missingVariables.push(variable);
        errors.push(`Variable '${variable}' is not available`);
      }
    }

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
      errors
    };
  }

  // Cache Management
  async clearMetaAdCache(accountId?: string): Promise<void> {
    let query = supabase
      .from('meta_ad_templates')
      .delete();

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error clearing Meta ad cache:', error);
      throw new Error('Failed to clear Meta ad cache');
    }
  }

  async getCacheStats(accountId?: string): Promise<{
    totalAds: number;
    lastSync: string | null;
    accountId: string | null;
  }> {
    let query = supabase
      .from('meta_ad_templates')
      .select('last_synced, account_id');

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting cache stats:', error);
      throw new Error('Failed to get cache stats');
    }

    const lastSync = data && data.length > 0 
      ? Math.max(...data.map(d => new Date(d.last_synced).getTime()))
      : null;

    return {
      totalAds: data?.length || 0,
      lastSync: lastSync ? new Date(lastSync).toISOString() : null,
      accountId: accountId || null
    };
  }

  // Utility Methods
  async getMetaAdPreview(metaAdId: string, sampleLocation?: LocationWithConfig): Promise<ProcessedAd | null> {
    try {
      const metaAd = await metaApiService.getAdById(metaAdId);
      
      if (!sampleLocation) {
        // Return basic ad info without location-specific processing
        return {
          id: metaAd.id,
          name: metaAd.name,
          creative: metaAd.creative,
          targeting: metaAd.targeting,
          variables: {},
          processedContent: {
            title: metaAd.creative.title || '',
            body: metaAd.creative.body || '',
            callToAction: metaAd.creative.call_to_action?.type || '',
            landingPageUrl: metaAd.creative.call_to_action?.value?.link || ''
          }
        };
      }

      const variableContext: VariableContext = {
        location: {
          name: sampleLocation.name,
          city: sampleLocation.city,
          state: sampleLocation.state,
          zipCode: sampleLocation.zipCode,
          phoneNumber: sampleLocation.phoneNumber,
          address: sampleLocation.address,
          landingPageUrl: sampleLocation.landing_page_url,
          coordinates: sampleLocation.coordinates
        }
      };

      return await this.processMetaAdWithVariables(metaAd, variableContext, {});
    } catch (error) {
      console.error('Error generating Meta ad preview:', error);
      return null;
    }
  }
}

// Export singleton instance
export const metaIntegrationService = new MetaIntegrationService();

// Export class for testing
export { MetaIntegrationService };