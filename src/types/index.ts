// Location Models - Updated to match locations.json structure
export interface Location {
  id: string;
  code: string;
  name: string;
  display_name: string;
  description: string;
  online_booking_start_date: string;
  enable_parallel_services_at_center: boolean;
  country: {
    id: number;
    code: string;
    name: string;
    phone_code: number;
    nationality: string;
  };
  state: {
    id: number;
    code: string;
    name: string;
    short_name: string;
  };
  location: {
    lattitude: number;
    latitude: number;
    longitude: number;
    time_zone: {
      id: number;
      name: string;
      standard_name: string;
      symbol: string;
    };
  };
  currency: {
    id: number;
    name: string;
    code: string;
    symbol: string;
  };
  address_info: {
    address_1: string;
    address_2?: string;
    city: string;
    zip_code: string;
  };
  contact_info: {
    phone_1: {
      country_id: number;
      number: string;
      display_number: string;
    };
    phone_2?: {
      country_id: number;
      number: string;
      display_number: string;
    } | null;
    email: string;
  };
  working_hours: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    offline_start_time: string;
    offline_end_time: string;
    off_peak_start_time: string;
    off_peak_end_time: string;
    is_closed: boolean;
  }>;
  additional_info?: Record<string, unknown>;
  culture_code_at_center?: string;
  is_fbe_enabled?: boolean;
  is_hc_call_center?: boolean;
  landing_page_url?: string; // Center Landing Page URL
}

// Helper properties for easier access
export interface LocationSummary {
  id: string;
  name: string;
  displayName: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  locationPrime: string; // Using code as locationPrime for radius calculation
  landing_page_url?: string; // Center Landing Page URL
}

// Location Group Models
export interface LocationGroup {
  id: string;
  name: string;
  description?: string;
  userId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  locationCount?: number; // Computed field for UI display
}

export interface LocationGroupMember {
  id: string;
  groupId: string;
  locationId: string;
  isActive: boolean;
  createdAt: string;
}

export interface LocationGroupWithMembers extends LocationGroup {
  members: LocationGroupMember[];
  locations?: LocationSummary[]; // Associated locations for convenience
}

export interface CreateLocationGroupRequest {
  name: string;
  description?: string;
  locationIds?: string[]; // Optional initial locations to add
}

export interface UpdateLocationGroupRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AddLocationToGroupRequest {
  groupId: string;
  locationIds: string[];
}

export interface RemoveLocationFromGroupRequest {
  groupId: string;
  locationIds: string[];
}

// Location Configuration Models
export interface LocationConfig {
  id: string;
  locationId: string;
  userId?: string | null;
  budget?: number | null;
  customSettings?: Record<string, unknown> | null;
  notes?: string | null;
  isActive: boolean;
  
  // New targeting fields
  primaryLat?: number | null;
  primaryLng?: number | null;
  radiusMiles?: number | null;
  coordinateList?: Array<{ lat: number; lng: number; radius?: number }> | null;
  landingPageUrl?: string | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface LocationWithConfig extends LocationSummary {
  config?: LocationConfig;
}

export interface CreateLocationConfigRequest {
  locationId: string;
  budget?: number;
  customSettings?: Record<string, unknown>;
  notes?: string;
  
  // New targeting fields
  primaryLat?: number;
  primaryLng?: number;
  radiusMiles?: number;
  coordinateList?: Array<{ lat: number; lng: number; radius?: number }>;
  landingPageUrl?: string;
}

export interface UpdateLocationConfigRequest {
  budget?: number;
  customSettings?: Record<string, unknown>;
  notes?: string;
  isActive?: boolean;
  
  // New targeting fields
  primaryLat?: number;
  primaryLng?: number;
  radiusMiles?: number;
  coordinateList?: Array<{ lat: number; lng: number; radius?: number }>;
  landingPageUrl?: string;
}

export interface LocationFilters {
  search?: string;
  states?: string[];
  cities?: string[];
  zipCodes?: string[];
}

// Ad Template Models
export interface AdTemplate {
  id: string;
  name: string;
  type: 'template_1' | 'template_2' | 'template_3' | 'template_4' | 'custom';
  fields: {
    headline: string;
    description: string;
    callToAction: string;
    imageUrl: string;
    landingPageUrl: string;
  };
  variables: AdVariable[];
  isActive: boolean;
  isCustom?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  type: 'custom';
  fields: {
    headline: string;
    description: string;
    callToAction: string;
    imageUrl: string;
    landingPageUrl: string;
  };
  variables: AdVariable[];
}

export interface AdVariable {
  name: string;
  type: 'location_field' | 'custom' | 'template_specific';
  defaultValue: string;
  required: boolean;
  description?: string;
}

// Generated Ad Models
export interface GeneratedAd {
  id: string;
  locationId: string;
  templateId: string;
  generatedFields: {
    headline: string;
    description: string;
    callToAction: string;
    imageUrl: string;
    landingPageUrl: string;
  };
  metadata: {
    createdAt: string;
    batchId: string;
    locationName: string;
    templateName: string;
  };
}

// Generation Job Models
export interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  locationIds: string[];
  templateIds: string[];
  totalAds: number;
  processedAds: number;
  filePath?: string;
  downloadUrl?: string;
  options: GenerationOptions;
  createdAt: string;
  completedAt?: string;
  estimatedTime?: number;
  error?: string;
}

export interface GenerationOptions {
  format: 'csv' | 'excel' | 'json';
  includeHeaders: boolean;
  customFields: string[];
  fileName?: string;
  campaign: CampaignConfiguration;
}

export interface AdConfiguration {
  id: string;
  name: string;
  templateId: string;
  radius: string; // e.g., "CORP+4m"
  caption: string;
  additionalNotes: string;
  scheduledDate: string; // Matches the ad name date
  status: 'Paused' | 'Active' | 'Draft';
  customizations?: {
    headline?: string;
    description?: string;
    callToAction?: string;
  };
}

// Campaign Management Models
export interface Campaign {
  id: string;
  userId?: string | null;
  name: string;
  platform: string;
  objective: string;
  testType: string;
  duration: string;
  budget: number;
  bidStrategy: string;
  startDate?: string | null;
  endDate?: string | null;
  defaultRadiusMiles: number;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  configuration?: Record<string, unknown> | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignLocation {
  id: string;
  campaignId: string;
  locationId: string;
  locationBudget?: number | null;
  locationRadiusMiles?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CampaignWithLocations extends Campaign {
  locations: Array<CampaignLocation & { location: LocationSummary }>;
}

export interface CreateCampaignRequest {
  name: string;
  platform?: string;
  objective?: string;
  testType?: string;
  duration?: string;
  budget: number;
  bidStrategy?: string;
  startDate?: string;
  endDate?: string;
  defaultRadiusMiles?: number;
  configuration?: Record<string, unknown>;
  notes?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  platform?: string;
  objective?: string;
  testType?: string;
  duration?: string;
  budget?: number;
  bidStrategy?: string;
  startDate?: string;
  endDate?: string;
  defaultRadiusMiles?: number;
  status?: 'Draft' | 'Active' | 'Paused' | 'Completed';
  configuration?: Record<string, unknown>;
  notes?: string;
  isActive?: boolean;
}

export interface CreateCampaignLocationRequest {
  campaignId: string;
  locationId: string;
  locationBudget?: number;
  locationRadiusMiles?: number;
}

export interface UpdateCampaignLocationRequest {
  locationBudget?: number;
  locationRadiusMiles?: number;
  isActive?: boolean;
}

// Enhanced Location targeting types
export interface LocationTargeting {
  type: 'radius' | 'coordinates' | 'both';
  primaryCoordinate?: {
    lat: number;
    lng: number;
  };
  radiusMiles?: number;
  coordinateList?: Array<{ lat: number; lng: number; radius?: number }>;
}

export interface LocationConfigForm {
  budget?: number;
  notes?: string;
  targeting?: LocationTargeting;
  landingPageUrl?: string;
}

// Campaign Form Types
export interface CampaignForm {
  name: string;
  platform: string;
  objective: string;
  testType: string;
  duration: string;
  budget: number;
  bidStrategy: string;
  startDate?: string;
  endDate?: string;
  defaultRadiusMiles: number;
  notes?: string;
  selectedLocationIds: string[];
}

// Campaign Configuration - Enhanced from existing type
export interface CampaignConfiguration {
  prefix: string; // Base prefix, e.g., "EWC"
  platform: string; // e.g., "Meta"
  selectedDate: Date; // Selected date for campaign
  season: string; // e.g., "Spring", "Summer", "Fall", "Winter" - manually entered
  shortYear: string; // e.g., "25" (extracted from selectedDate)
  month: string; // e.g., "June" (extracted from selectedDate) - kept for backward compatibility
  day: string; // e.g., "25" (extracted from selectedDate) - kept for backward compatibility
  objective: string; // e.g., "Engagement" - now customizable
  testType: string; // e.g., "LocalTest"
  duration: string; // e.g., "Evergreen"
  budget: number; // e.g., 92.69
  bidStrategy: string; // e.g., "Highest volume or value"
  startDate: string; // e.g., "06/26/2025 2:32:00 am"
  endDate: string; // e.g., "07/26/2025 11:59:00 pm"
  ads: AdConfiguration[];
  radius: number; // Default radius in miles, e.g., 5
  
  // Enhanced with database campaign id
  campaignId?: string;
}

// Objective autocomplete types
export interface ObjectiveOption {
  id: string;
  label: string;
  value: string;
  isCustom?: boolean;
}

export interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: ObjectiveOption[];
  placeholder?: string;
  allowCustom?: boolean;
  customLabel?: string;
  label?: string;
}

// Template creation UI state
export interface TemplateCreationState {
  isOpen: boolean;
  formData: CreateTemplateRequest;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// UI State Models
export interface LocationSelectionState {
  selectedLocations: string[];
  filters: LocationFilters;
  searchQuery: string;
  isLoading: boolean;
  error?: string;
}

export interface TemplateConfigState {
  selectedTemplates: string[];
  variableMappings: Record<string, string>;
  previewLocation?: Location;
  isLoading: boolean;
  error?: string;
}

export interface GenerationState {
  currentJob?: GenerationJob;
  isGenerating: boolean;
  progress: number;
  error?: string;
}

// Form Models
export interface LocationSearchForm {
  query: string;
  states: string[];
  cities: string[];
}

export interface GenerationForm {
  locationIds: string[];
  templateIds: string[];
  options: GenerationOptions;
}

// Statistics Models
export interface GenerationStats {
  totalLocations: number;
  selectedLocations: number;
  totalTemplates: number;
  selectedTemplates: number;
  estimatedAds: number;
  estimatedTime: number;
}

// Export Models
export interface ExportData {
  locationId: string;
  locationName: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  address: string;
  templateId: string;
  templateName: string;
  headline: string;
  description: string;
  callToAction: string;
  imageUrl: string;
  landingPageUrl: string;
  createdAt: string;
}

// Component Props Models
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AnimationProps {
  delay?: number;
  duration?: number;
  easing?: string;
}

// Utility Types
export type SortDirection = 'asc' | 'desc';
export type SortField = keyof Location | keyof AdTemplate | keyof GeneratedAd;

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Mock Data Types for Development
export interface MockDataConfig {
  locationCount: number;
  templateCount: number;
  generateRealisticData: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Theme Types
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface MotionVariants {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit?: Record<string, unknown>;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Store Types (for Zustand)
export interface AppStore {
  // Location state
  locations: Location[];
  selectedLocationIds: string[];
  locationFilters: LocationFilters;
  
  // Template state
  templates: AdTemplate[];
  selectedTemplateIds: string[];
  variableMappings: Record<string, string>;
  
  // Generation state
  currentJob?: GenerationJob;
  generationHistory: GenerationJob[];
  
  // UI state
  isLoading: boolean;
  error?: string;
  notifications: Notification[];
  
  // Actions
  setLocations: (locations: Location[]) => void;
  setSelectedLocationIds: (ids: string[]) => void;
  setLocationFilters: (filters: LocationFilters) => void;
  setTemplates: (templates: AdTemplate[]) => void;
  setSelectedTemplateIds: (ids: string[]) => void;
  setVariableMappings: (mappings: Record<string, string>) => void;
  setCurrentJob: (job?: GenerationJob) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
} 