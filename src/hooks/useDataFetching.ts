import { useEffect, useState, useCallback } from 'react';
import { mockApi } from '../services/mockApi';
import { supabaseLocationService } from '../services/supabaseLocationService';
import { useAppStore } from '../store/useAppStore';
import { useNotifications } from '../components/shared/NotificationSystem';
import type { LocationWithConfig, AdTemplate } from '../types';

export function useLocationsData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locations, setLocations } = useAppStore();
  const { showSuccess, showError } = useNotifications();

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await supabaseLocationService.getLocationsWithConfigs();
      setLocations(response);
      showSuccess('Locations Loaded', `${response.length} locations loaded successfully`);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load locations';
      setError(errorMessage);
      showError('Location Load Error', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setLocations, showSuccess, showError]);

  const refreshLocations = useCallback(async () => {
    return fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (locations.length === 0) {
      fetchLocations();
    }
  }, [fetchLocations, locations.length]);

  return {
    locations,
    isLoading,
    error,
    fetchLocations,
    refreshLocations
  };
}

export function useTemplatesData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { templates, setTemplates } = useAppStore();
  const { showSuccess, showError } = useNotifications();

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
        showSuccess('Templates Loaded', `${response.data.length} templates loaded successfully`);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to load templates');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      showError('Template Load Error', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setTemplates, showSuccess, showError]);

  const createTemplate = useCallback(async (templateData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mockApi.createTemplate(templateData);
      if (response.success && response.data) {
        // Refresh templates after creation
        await fetchTemplates();
        showSuccess('Template Created', 'New template created successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create template');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      showError('Template Creation Failed', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTemplates, showSuccess, showError]);

  const refreshTemplates = useCallback(async () => {
    return fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (templates.length === 0) {
      fetchTemplates();
    }
  }, [fetchTemplates, templates.length]);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    refreshTemplates
  };
}

export function useCampaignGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setGenerationJob, setCurrentStep } = useAppStore();
  const { showSuccess, showError } = useNotifications();

  const generateCampaign = useCallback(async (campaignData: any) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Simulate generation process
      const job = {
        id: `job-${Date.now()}`,
        status: 'processing' as const,
        createdAt: new Date().toISOString(),
        campaignId: 'campaign-1',
        locationCount: campaignData.locations?.length || 0,
        adCount: campaignData.ads?.length || 0
      };

      setGenerationJob(job);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      const completedJob = {
        ...job,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        files: [
          {
            name: `${campaignData.prefix}_Campaign_${campaignData.month}_${campaignData.day}.csv`,
            url: 'data:text/csv;base64,ZXhhbXBsZQ==',
            size: 1024
          }
        ]
      };

      setGenerationJob(completedJob);
      setCurrentStep(5);
      showSuccess('Campaign Generated', 'Your campaign files are ready for download!');
      
      return completedJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate campaign';
      setError(errorMessage);
      showError('Generation Failed', errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [setGenerationJob, setCurrentStep, showSuccess, showError]);

  return {
    isGenerating,
    error,
    generateCampaign
  };
}

export function useLocationConfiguration() {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotifications();

  const updateLocationConfig = useCallback(async (locationId: string, config: any) => {
    setIsConfiguring(true);
    setError(null);
    
    try {
      await supabaseLocationService.updateLocationConfig(locationId, config);
      showSuccess('Configuration Updated', 'Location configuration updated successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location configuration';
      setError(errorMessage);
      showError('Configuration Update Failed', errorMessage);
      throw err;
    } finally {
      setIsConfiguring(false);
    }
  }, [showSuccess, showError]);

  return {
    isConfiguring,
    error,
    updateLocationConfig
  };
}

// Hook for managing file downloads
export function useFileDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const downloadFile = useCallback(async (fileUrl: string, fileName: string) => {
    setIsDownloading(true);
    
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.click();
      
      showSuccess('Download Started', 'File download has begun');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      showError('Download Failed', errorMessage);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, [showSuccess, showError]);

  const downloadAllFiles = useCallback(async (files: Array<{ url: string; name: string }>) => {
    setIsDownloading(true);
    
    try {
      files.forEach(file => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.click();
      });
      
      showSuccess('Download Started', 'All files are being downloaded');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download files';
      showError('Download Failed', errorMessage);
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, [showSuccess, showError]);

  return {
    isDownloading,
    downloadFile,
    downloadAllFiles
  };
}