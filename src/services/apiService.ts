import { mockApi } from './mockApi';
import { supabaseLocationService } from './supabaseLocationService';
import type {
  LocationWithConfig,
  AdTemplate,
  GenerationJob,
  CreateTemplateRequest,
  LocationConfig,
  ApiResponse
} from '../types';

// Base API response interface
interface BaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Service class
class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl = '', timeout = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  // Generic request method with timeout and error handling
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = this.timeout
  ): Promise<BaseApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Request timeout' };
        }
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    }
  }

  // Location-related API calls
  async getLocations(): Promise<BaseApiResponse<LocationWithConfig[]>> {
    try {
      const locations = await supabaseLocationService.getLocationsWithConfigs();
      return { success: true, data: locations };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch locations' 
      };
    }
  }

  async updateLocationConfig(
    locationId: string, 
    config: LocationConfig
  ): Promise<BaseApiResponse<LocationConfig>> {
    try {
      await supabaseLocationService.updateLocationConfig(locationId, config);
      return { success: true, data: config };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update location config' 
      };
    }
  }

  async createLocationConfig(
    locationId: string, 
    config: Omit<LocationConfig, 'locationId'>
  ): Promise<BaseApiResponse<LocationConfig>> {
    try {
      const fullConfig = { ...config, locationId };
      await supabaseLocationService.updateLocationConfig(locationId, fullConfig);
      return { success: true, data: fullConfig };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create location config' 
      };
    }
  }

  // Template-related API calls
  async getTemplates(): Promise<BaseApiResponse<AdTemplate[]>> {
    try {
      const response = await mockApi.getTemplates();
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to fetch templates' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch templates' 
      };
    }
  }

  async createTemplate(template: CreateTemplateRequest): Promise<BaseApiResponse<AdTemplate>> {
    try {
      const response = await mockApi.createTemplate(template);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to create template' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create template' 
      };
    }
  }

  async updateTemplate(
    templateId: string, 
    updates: Partial<AdTemplate>
  ): Promise<BaseApiResponse<AdTemplate>> {
    try {
      // Mock API doesn't have update, so we'll simulate it
      const response = await mockApi.getTemplates();
      if (response.success && response.data) {
        const template = response.data.find(t => t.id === templateId);
        if (template) {
          const updatedTemplate = { ...template, ...updates };
          return { success: true, data: updatedTemplate };
        }
      }
      return { success: false, error: 'Template not found' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update template' 
      };
    }
  }

  async deleteTemplate(templateId: string): Promise<BaseApiResponse<boolean>> {
    try {
      // Mock API doesn't have delete, so we'll simulate it
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete template' 
      };
    }
  }

  // Campaign generation API calls
  async generateCampaign(
    campaignData: {
      locations: string[];
      ads: string[];
      campaign: any;
      options?: any;
    }
  ): Promise<BaseApiResponse<GenerationJob>> {
    try {
      const response = await mockApi.generateAds(
        campaignData.locations,
        campaignData.ads,
        campaignData.options
      );
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to generate campaign' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate campaign' 
      };
    }
  }

  async getGenerationStatus(jobId: string): Promise<BaseApiResponse<GenerationJob>> {
    try {
      // Mock API doesn't have status endpoint, so we'll simulate it
      return { 
        success: true, 
        data: {
          id: jobId,
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          campaignId: 'campaign-1',
          locationCount: 0,
          adCount: 0,
          files: []
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get generation status' 
      };
    }
  }

  // File download API calls
  async downloadGeneratedFile(jobId: string): Promise<BaseApiResponse<Blob>> {
    try {
      const response = await mockApi.downloadGeneratedFile(jobId);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Failed to download file' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to download file' 
      };
    }
  }

  // Utility methods
  async healthCheck(): Promise<BaseApiResponse<{ status: string; timestamp: string }>> {
    try {
      return { 
        success: true, 
        data: { 
          status: 'healthy', 
          timestamp: new Date().toISOString() 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      };
    }
  }

  // Batch operations
  async batchUpdateLocationConfigs(
    configs: Array<{ locationId: string; config: LocationConfig }>
  ): Promise<BaseApiResponse<Array<{ locationId: string; success: boolean; error?: string }>>> {
    const results = [];
    
    for (const { locationId, config } of configs) {
      try {
        await this.updateLocationConfig(locationId, config);
        results.push({ locationId, success: true });
      } catch (error) {
        results.push({ 
          locationId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Update failed' 
        });
      }
    }

    const allSuccessful = results.every(r => r.success);
    return { 
      success: allSuccessful, 
      data: results,
      error: allSuccessful ? undefined : 'Some updates failed'
    };
  }

  // Error handling utilities
  isNetworkError(error: any): boolean {
    return error?.name === 'TypeError' && error?.message?.includes('fetch');
  }

  isTimeoutError(error: any): boolean {
    return error?.message?.includes('timeout') || error?.name === 'AbortError';
  }

  isServerError(error: any): boolean {
    return error?.message?.includes('HTTP 5') || error?.message?.includes('HTTP 4');
  }

  getErrorMessage(error: any): string {
    if (this.isNetworkError(error)) {
      return 'Network connection failed. Please check your internet connection.';
    }
    if (this.isTimeoutError(error)) {
      return 'Request timed out. Please try again.';
    }
    if (this.isServerError(error)) {
      return 'Server error occurred. Please try again later.';
    }
    return error?.message || 'An unexpected error occurred.';
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual service functions for backward compatibility
export const {
  getLocations,
  updateLocationConfig,
  createLocationConfig,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateCampaign,
  getGenerationStatus,
  downloadGeneratedFile,
  healthCheck,
  batchUpdateLocationConfigs,
  isNetworkError,
  isTimeoutError,
  isServerError,
  getErrorMessage
} = apiService;

// Export the class for testing or custom instances
export { ApiService };