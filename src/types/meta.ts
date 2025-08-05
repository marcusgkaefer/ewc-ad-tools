// Meta Ads Integration Types
// Comprehensive type definitions for Meta ads selection and configuration

// Meta API Response Types
export interface MetaApiResponse<T> {
  data: T[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

// Meta Account Types
export interface MetaAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  account_type: string;
  business_name?: string;
  currency: string;
  timezone_name: string;
  timezone_offset_hours_utc: number;
  is_personal?: boolean;
  is_prepay_account?: boolean;
  is_test?: boolean;
  business_street?: string;
  business_city?: string;
  business_state?: string;
  business_zip?: string;
  business_country_code?: string;
  created_time: string;
  updated_time: string;
}

// Meta Ad Creative Types
export interface MetaAdCreative {
  id: string;
  name?: string;
  title?: string;
  body?: string;
  call_to_action?: {
    type: string;
    value?: {
      link?: string;
      link_format?: string;
    };
  };
  image_url?: string;
  image_hash?: string;
  video_id?: string;
  video_thumbnail_url?: string;
  instagram_actor_id?: string;
  instagram_permalink_url?: string;
  instagram_story_id?: string;
  instagram_username?: string;
  object_story_spec?: {
    page_id?: string;
    instagram_actor_id?: string;
    link_data?: {
      image_hash?: string;
      link?: string;
      message?: string;
      name?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
          link_format?: string;
        };
      };
    };
    video_data?: {
      image_url?: string;
      video_id?: string;
      message?: string;
      title?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
          link_format?: string;
        };
      };
    };
  };
  status: {
    code: number;
    message: string;
  };
  created_time: string;
  updated_time: string;
}

// Meta Ad Targeting Types
export interface MetaAdTargeting {
  age_min?: number;
  age_max?: number;
  genders?: number[];
  geo_locations?: {
    countries?: string[];
    regions?: Array<{
      key: string;
      name: string;
    }>;
    cities?: Array<{
      key: string;
      name: string;
      radius?: number;
      distance_unit?: string;
    }>;
    location_types?: string[];
  };
  excluded_geo_locations?: {
    countries?: string[];
    regions?: Array<{
      key: string;
      name: string;
    }>;
    cities?: Array<{
      key: string;
      name: string;
      radius?: number;
      distance_unit?: string;
    }>;
  };
  custom_audiences?: Array<{
    id: string;
    name: string;
  }>;
  excluded_custom_audiences?: Array<{
    id: string;
    name: string;
  }>;
  interests?: Array<{
    id: string;
    name: string;
  }>;
  behaviors?: Array<{
    id: string;
    name: string;
  }>;
  demographics?: {
    education_statuses?: number[];
    relationship_statuses?: number[];
    income?: Array<{
      id: string;
      name: string;
    }>;
  };
  placements?: string[];
  publisher_platforms?: string[];
  facebook_positions?: string[];
  instagram_positions?: string[];
  audience_network_positions?: string[];
  messenger_positions?: string[];
}

// Meta Ad Types
export interface MetaAd {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED';
  creative: MetaAdCreative;
  targeting: MetaAdTargeting;
  campaign_id: string;
  adset_id: string;
  account_id: string;
  bid_amount?: number;
  bid_info?: {
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
    clicks?: number;
    impressions?: number;
    reach?: number;
    spend?: number;
  };
  conversion_domain?: string;
  conversion_specs?: Array<{
    event: string;
    event_time: number;
    event_source: string;
    event_source_id?: string;
    user_data: {
      em?: string[];
      ph?: string[];
      external_id?: string[];
      client_ip_address?: string;
      client_user_agent?: string;
      fbc?: string;
      fbp?: string;
      subscription_id?: string;
      fb_login_id?: string;
      lead_id?: string;
      f5first?: string;
      f5last?: string;
      f5dob?: string;
      fi?: string;
      dobd?: string;
      dobm?: string;
      doby?: string;
    };
    custom_data?: {
      value?: number;
      currency?: string;
      content_name?: string;
      content_category?: string;
      content_ids?: string[];
      content_type?: string;
      order_id?: string;
      predicted_ltv?: number;
      num_items?: number;
      search_string?: string;
      status?: string;
      delivery_category?: string;
    };
  }>;
  created_time: string;
  updated_time: string;
  effective_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED' | 'CAMPAIGN_PAUSED' | 'ADSET_PAUSED';
  source_ad_id?: string;
  recommendations?: Array<{
    blames?: Array<{
      field: string;
      code: number;
      subcode: number;
      is_transient: boolean;
      user_title: string;
      user_message: string;
      error_user_title: string;
      error_user_message: string;
      error_type: string;
      error_subcode: number;
      error_data?: Record<string, any>;
    }>;
    code: number;
    subcode: number;
    is_transient: boolean;
    user_title: string;
    user_message: string;
    error_user_title: string;
    error_user_message: string;
    error_type: string;
    error_subcode: number;
    error_data?: Record<string, any>;
  }>;
  tracking_specs?: Array<{
    event: string;
    event_time: number;
    event_source: string;
    event_source_id?: string;
    user_data: {
      em?: string[];
      ph?: string[];
      external_id?: string[];
      client_ip_address?: string;
      client_user_agent?: string;
      fbc?: string;
      fbp?: string;
      subscription_id?: string;
      fb_login_id?: string;
      lead_id?: string;
      f5first?: string;
      f5last?: string;
      f5dob?: string;
      fi?: string;
      dobd?: string;
      dobm?: string;
      doby?: string;
    };
    custom_data?: {
      value?: number;
      currency?: string;
      content_name?: string;
      content_category?: string;
      content_ids?: string[];
      content_type?: string;
      order_id?: string;
      predicted_ltv?: number;
      num_items?: number;
      search_string?: string;
      status?: string;
      delivery_category?: string;
    };
  }>;
  application_id?: string;
  object_story_spec?: {
    page_id?: string;
    instagram_actor_id?: string;
    link_data?: {
      image_hash?: string;
      link?: string;
      message?: string;
      name?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
          link_format?: string;
        };
      };
    };
    video_data?: {
      image_url?: string;
      video_id?: string;
      message?: string;
      title?: string;
      description?: string;
      call_to_action?: {
        type: string;
        value?: {
          link?: string;
          link_format?: string;
        };
      };
    };
  };
  thumbnail_url?: string;
  use_unified_creative?: boolean;
  configured_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED';
  creative?: MetaAdCreative;
  targeting?: MetaAdTargeting;
}

// Meta Campaign Types
export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED';
  special_ad_categories: string[];
  created_time: string;
  updated_time: string;
  start_time?: string;
  stop_time?: string;
  daily_budget?: number;
  lifetime_budget?: number;
  budget_remaining?: number;
  buying_type: 'AUCTION' | 'RESERVED';
  can_use_spend_cap: boolean;
  spend_cap?: number;
  is_autobid: boolean;
  is_autobid_override: boolean;
  bid_strategy?: string;
  optimization_goal?: string;
  destination_type?: string;
  source_campaign_id?: string;
  source_campaign?: {
    id: string;
    name: string;
  };
  configured_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED';
  effective_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED' | 'CAMPAIGN_PAUSED' | 'ADSET_PAUSED';
  account_id: string;
}

// Meta Ad Set Types
export interface MetaAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED';
  daily_budget?: number;
  lifetime_budget?: number;
  budget_remaining?: number;
  bid_amount?: number;
  bid_info?: {
    actions?: Array<{
      action_type: string;
      value: string;
    }>;
    clicks?: number;
    impressions?: number;
    reach?: number;
    spend?: number;
  };
  billing_event: 'IMPRESSIONS' | 'LINK_CLICKS' | 'NONE' | 'OUTCOME_CLICKS' | 'OUTCOME_IMPRESSIONS' | 'OUTCOME_QUANTITY' | 'OUTCOME_VALUE' | 'POST_ENGAGEMENT' | 'THRUPLAY';
  optimization_goal: 'APP_INSTALLS' | 'BRAND_AWARENESS' | 'CONVERSATIONS' | 'ENGAGED_USERS' | 'EVENT_RESPONSES' | 'FREQUENCY' | 'IMPRESSIONS' | 'LANDING_PAGE_VIEWS' | 'LINK_CLICKS' | 'NONE' | 'OFFSITE_CONVERSIONS' | 'PAGE_ENGAGEMENT' | 'POST_ENGAGEMENT' | 'QUALITY_IMPRESSIONS' | 'REACH' | 'SOCIAL_IMPRESSIONS' | 'SOCIAL_REACH' | 'SOCIAL_SPEND' | 'SPEND' | 'THRUPLAY' | 'VALUE' | 'VIDEO_VIEWS';
  targeting: MetaAdTargeting;
  created_time: string;
  updated_time: string;
  start_time?: string;
  stop_time?: string;
  configured_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED';
  effective_status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'PENDING_REVIEW' | 'DISAPPROVED' | 'PREAPPROVED' | 'CAMPAIGN_PAUSED' | 'ADSET_PAUSED';
  account_id: string;
}

// Database Types
export interface MetaAccountRecord {
  id: string;
  user_id: string;
  account_id: string;
  account_name: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetaAdTemplateRecord {
  id: string;
  meta_ad_id: string;
  name: string;
  creative: MetaAdCreative;
  targeting?: MetaAdTargeting;
  campaign_id?: string;
  ad_set_id?: string;
  account_id: string;
  status: string;
  performance_metrics?: Record<string, any>;
  last_synced: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignMetaAdRecord {
  id: string;
  campaign_id: string;
  meta_ad_id: string;
  meta_ad_name: string;
  location_id?: string;
  override_settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetaAdVariableRecord {
  id: string;
  meta_ad_id: string;
  variable_name: string;
  variable_type: 'location' | 'campaign' | 'custom';
  default_value?: string;
  is_required: boolean;
  description?: string;
  created_at: string;
}

export interface MetaAdLocationOverrideRecord {
  id: string;
  campaign_meta_ad_id: string;
  location_id: string;
  override_type: 'creative' | 'targeting' | 'budget';
  override_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// UI Component Types
export interface MetaAdSelection {
  metaAdId: string;
  metaAdName: string;
  creative: MetaAdCreative;
  targeting?: MetaAdTargeting;
  isSelected: boolean;
  overrideSettings?: Record<string, any>;
}

export interface MetaAdFilters {
  status?: string[];
  campaignId?: string;
  adSetId?: string;
  searchQuery?: string;
  creativeType?: string[];
  performanceThreshold?: {
    impressions?: number;
    clicks?: number;
    spend?: number;
  };
}

export interface CampaignOverrides {
  campaignId?: string;
  adSetId?: string;
  budget?: number;
  targeting?: MetaAdTargeting;
  creative?: Partial<MetaAdCreative>;
  locationSpecific?: Record<string, LocationOverride>;
}

export interface LocationOverride {
  budget?: number;
  targeting?: MetaAdTargeting;
  creative?: Partial<MetaAdCreative>;
}

export interface MetaAdPreview {
  id: string;
  name: string;
  creative: MetaAdCreative;
  targeting?: MetaAdTargeting;
  performance?: {
    impressions?: number;
    clicks?: number;
    spend?: number;
    ctr?: number;
    cpc?: number;
  };
}

// API Request Types
export interface CreateMetaAdRequest {
  name: string;
  adset_id: string;
  creative: MetaAdCreative;
  targeting?: MetaAdTargeting;
  status?: string;
  bid_amount?: number;
  billing_event?: string;
  optimization_goal?: string;
}

export interface UpdateMetaAdRequest {
  name?: string;
  status?: string;
  creative?: Partial<MetaAdCreative>;
  targeting?: Partial<MetaAdTargeting>;
  bid_amount?: number;
}

export interface MetaAdSyncRequest {
  accountId: string;
  forceRefresh?: boolean;
  filters?: MetaAdFilters;
}

// Variable Processing Types
export interface TemplateVariable {
  name: string;
  type: 'location' | 'campaign' | 'custom';
  value: string;
  description?: string;
  isRequired: boolean;
}

export interface VariableContext {
  location?: {
    name: string;
    city: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    address: string;
    landingPageUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  campaign?: {
    name: string;
    objective: string;
    platform: string;
    budget: number;
    startDate: string;
    endDate: string;
  };
  custom?: Record<string, string>;
}

export interface ProcessedAd {
  id: string;
  name: string;
  creative: MetaAdCreative;
  targeting?: MetaAdTargeting;
  variables: VariableContext;
  processedContent: {
    title: string;
    body: string;
    callToAction: string;
    landingPageUrl: string;
  };
}

// Error Types
export interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

// Authentication Types
export interface MetaAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface MetaAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  accountId?: string;
  accountName?: string;
  expiresAt?: Date;
  isLoading: boolean;
  error?: string;
}