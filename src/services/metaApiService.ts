import type {
  MetaAd,
  MetaCampaign,
  MetaAdSet,
  MetaAccount,
  MetaApiResponse,
  MetaApiError,
  MetaAdFilters,
  CreateMetaAdRequest,
  UpdateMetaAdRequest,
  MetaAuthResponse,
  MetaAuthState
} from '../types/meta';

// Meta Graph API Configuration
const META_API_VERSION = 'v19.0';
const META_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

// Meta API Service Class
class MetaApiService {
  private accessToken: string | null = null;
  private accountId: string | null = null;

  // Authentication Methods
  async authenticate(accessToken: string, accountId?: string): Promise<boolean> {
    try {
      this.accessToken = accessToken;
      this.accountId = accountId || null;

      // Test the token by fetching account info
      const accounts = await this.getAccounts();
      if (accounts.length > 0) {
        if (!this.accountId) {
          this.accountId = accounts[0].account_id;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Meta authentication failed:', error);
      return false;
    }
  }

  async getAuthState(): Promise<MetaAuthState> {
    if (!this.accessToken) {
      return {
        isAuthenticated: false,
        isLoading: false,
        error: 'No access token available'
      };
    }

    try {
      const accounts = await this.getAccounts();
      return {
        isAuthenticated: accounts.length > 0,
        accessToken: this.accessToken,
        accountId: this.accountId || accounts[0]?.account_id,
        accountName: accounts[0]?.name,
        isLoading: false
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Account Management
  async getAccounts(): Promise<MetaAccount[]> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await this.makeApiRequest<MetaAccount>('/me/adaccounts', {
      fields: 'id,name,account_id,account_status,account_type,business_name,currency,timezone_name,timezone_offset_hours_utc,is_personal,is_prepay_account,is_test,business_street,business_city,business_state,business_zip,business_country_code,created_time,updated_time'
    });

    return response.data || [];
  }

  async getAccountById(accountId: string): Promise<MetaAccount> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await this.makeApiRequest<MetaAccount>(`/${accountId}`, {
      fields: 'id,name,account_id,account_status,account_type,business_name,currency,timezone_name,timezone_offset_hours_utc,is_personal,is_prepay_account,is_test,business_street,business_city,business_state,business_zip,business_country_code,created_time,updated_time'
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Account not found');
    }

    return response.data[0];
  }

  // Campaign Management
  async getCampaigns(accountId?: string): Promise<MetaCampaign[]> {
    const targetAccountId = accountId || this.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    const response = await this.makeApiRequest<MetaCampaign>(`/${targetAccountId}/campaigns`, {
      fields: 'id,name,objective,status,special_ad_categories,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,buying_type,can_use_spend_cap,spend_cap,is_autobid,is_autobid_override,bid_strategy,optimization_goal,destination_type,source_campaign_id,source_campaign,configured_status,effective_status,account_id'
    });

    return response.data || [];
  }

  async getCampaignById(campaignId: string): Promise<MetaCampaign> {
    const response = await this.makeApiRequest<MetaCampaign>(`/${campaignId}`, {
      fields: 'id,name,objective,status,special_ad_categories,created_time,updated_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining,buying_type,can_use_spend_cap,spend_cap,is_autobid,is_autobid_override,bid_strategy,optimization_goal,destination_type,source_campaign_id,source_campaign,configured_status,effective_status,account_id'
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Campaign not found');
    }

    return response.data[0];
  }

  // Ad Set Management
  async getAdSets(accountId?: string, campaignId?: string): Promise<MetaAdSet[]> {
    const targetAccountId = accountId || this.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    const endpoint = campaignId 
      ? `/${campaignId}/adsets`
      : `/${targetAccountId}/adsets`;

    const response = await this.makeApiRequest<MetaAdSet>(endpoint, {
      fields: 'id,name,campaign_id,status,daily_budget,lifetime_budget,budget_remaining,bid_amount,bid_info,billing_event,optimization_goal,targeting,created_time,updated_time,start_time,stop_time,configured_status,effective_status,account_id'
    });

    return response.data || [];
  }

  async getAdSetById(adSetId: string): Promise<MetaAdSet> {
    const response = await this.makeApiRequest<MetaAdSet>(`/${adSetId}`, {
      fields: 'id,name,campaign_id,status,daily_budget,lifetime_budget,budget_remaining,bid_amount,bid_info,billing_event,optimization_goal,targeting,created_time,updated_time,start_time,stop_time,configured_status,effective_status,account_id'
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Ad Set not found');
    }

    return response.data[0];
  }

  // Ad Management
  async getAds(accountId?: string, filters?: MetaAdFilters): Promise<MetaAd[]> {
    const targetAccountId = accountId || this.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    // Build query parameters
    const params: Record<string, any> = {
      fields: 'id,name,status,creative,targeting,campaign_id,adset_id,account_id,bid_amount,bid_info,conversion_domain,conversion_specs,created_time,updated_time,effective_status,source_ad_id,recommendations,tracking_specs,application_id,object_story_spec,thumbnail_url,use_unified_creative,configured_status'
    };

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      params.status = filters.status.join(',');
    }

    if (filters?.campaignId) {
      params.campaign_id = filters.campaignId;
    }

    if (filters?.adSetId) {
      params.adset_id = filters.adSetId;
    }

    if (filters?.searchQuery) {
      params.name = filters.searchQuery;
    }

    const response = await this.makeApiRequest<MetaAd>(`/${targetAccountId}/ads`, params);

    return response.data || [];
  }

  async getAdById(adId: string): Promise<MetaAd> {
    const response = await this.makeApiRequest<MetaAd>(`/${adId}`, {
      fields: 'id,name,status,creative,targeting,campaign_id,adset_id,account_id,bid_amount,bid_info,conversion_domain,conversion_specs,created_time,updated_time,effective_status,source_ad_id,recommendations,tracking_specs,application_id,object_story_spec,thumbnail_url,use_unified_creative,configured_status'
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Ad not found');
    }

    return response.data[0];
  }

  async createAd(adData: CreateMetaAdRequest): Promise<MetaAd> {
    const targetAccountId = this.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    const response = await this.makeApiRequest<MetaAd>(`/${targetAccountId}/ads`, {
      method: 'POST',
      data: adData
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Failed to create ad');
    }

    return response.data[0];
  }

  async updateAd(adId: string, adData: UpdateMetaAdRequest): Promise<MetaAd> {
    const response = await this.makeApiRequest<MetaAd>(`/${adId}`, {
      method: 'POST',
      data: adData
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Failed to update ad');
    }

    return response.data[0];
  }

  async duplicateAd(adId: string, newName: string): Promise<MetaAd> {
    const originalAd = await this.getAdById(adId);
    
    const duplicateData: CreateMetaAdRequest = {
      name: newName,
      adset_id: originalAd.adset_id,
      creative: originalAd.creative,
      targeting: originalAd.targeting,
      status: 'PAUSED' // Start as paused for safety
    };

    return await this.createAd(duplicateData);
  }

  // Performance Metrics
  async getAdInsights(adId: string, dateRange?: { since: string; until: string }): Promise<any> {
    const params: Record<string, any> = {
      fields: 'impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,action_values,cost_per_action_type,cost_per_conversion,cost_per_unique_action_type,unique_actions,unique_cost_per_action_type'
    };

    if (dateRange) {
      params.time_range = JSON.stringify({
        since: dateRange.since,
        until: dateRange.until
      });
    }

    const response = await this.makeApiRequest<any>(`/${adId}/insights`, params);

    return response.data || [];
  }

  // Creative Management
  async getAdCreatives(accountId?: string): Promise<any[]> {
    const targetAccountId = accountId || this.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    const response = await this.makeApiRequest<any>(`/${targetAccountId}/adcreatives`, {
      fields: 'id,name,title,body,call_to_action,image_url,image_hash,video_id,video_thumbnail_url,instagram_actor_id,instagram_permalink_url,instagram_story_id,instagram_username,object_story_spec,status,created_time,updated_time'
    });

    return response.data || [];
  }

  // Utility Methods
  private async makeApiRequest<T>(
    endpoint: string, 
    options: {
      method?: 'GET' | 'POST';
      fields?: string;
      data?: any;
      [key: string]: any;
    } = {}
  ): Promise<MetaApiResponse<T>> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const url = `${META_API_BASE_URL}${endpoint}`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      ...options
    });

    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (options.method === 'POST' && options.data) {
      config.body = JSON.stringify(options.data);
    }

    const requestUrl = options.method === 'POST' ? url : `${url}?${params.toString()}`;

    try {
      const response = await fetch(requestUrl, config);
      
      if (!response.ok) {
        const errorData: MetaApiError = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Meta API request failed:', error);
      throw error;
    }
  }

  // Rate Limiting and Error Handling
  private async handleRateLimit(retryAfter: number): Promise<void> {
    console.warn(`Rate limited by Meta API. Waiting ${retryAfter} seconds...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  }

  private async handleApiError(error: any): Promise<never> {
    if (error.error?.code === 4) {
      // Rate limiting
      const retryAfter = parseInt(error.error.error_subcode?.toString() || '60');
      await this.handleRateLimit(retryAfter);
      throw new Error('Rate limited - please try again');
    }

    if (error.error?.code === 190) {
      // Invalid access token
      throw new Error('Invalid access token - please re-authenticate');
    }

    throw new Error(error.error?.message || 'Meta API error occurred');
  }

  // Batch Operations
  async batchGetAds(adIds: string[]): Promise<MetaAd[]> {
    if (adIds.length === 0) return [];

    const batchRequests = adIds.map((adId, index) => ({
      method: 'GET',
      relative_url: `${adId}?fields=id,name,status,creative,targeting,campaign_id,adset_id,account_id,bid_amount,bid_info,created_time,updated_time,effective_status`
    }));

    const response = await this.makeApiRequest<any>('/', {
      method: 'POST',
      data: {
        batch: JSON.stringify(batchRequests)
      }
    });

    return response.data || [];
  }

  // Search and Filter
  async searchAds(query: string, accountId?: string): Promise<MetaAd[]> {
    const targetAccountId = accountId || this.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    return await this.getAds(targetAccountId, { searchQuery: query });
  }

  async getAdsByStatus(status: string[], accountId?: string): Promise<MetaAd[]> {
    const targetAccountId = accountId || this.accountId;
    if (!targetAccountId) {
      throw new Error('No account ID available');
    }

    return await this.getAds(targetAccountId, { status });
  }

  async getAdsByCampaign(campaignId: string): Promise<MetaAd[]> {
    return await this.getAds(undefined, { campaignId });
  }

  async getAdsByAdSet(adSetId: string): Promise<MetaAd[]> {
    return await this.getAds(undefined, { adSetId });
  }

  // Cleanup
  disconnect(): void {
    this.accessToken = null;
    this.accountId = null;
  }
}

// Export singleton instance
export const metaApiService = new MetaApiService();

// Export class for testing
export { MetaApiService };