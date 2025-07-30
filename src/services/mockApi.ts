import type { 
  LocationSummary, 
  LocationWithConfig,
  AdTemplate, 
  GeneratedAd, 
  GenerationJob, 
  LocationFilters,
  GenerationOptions,
  ApiResponse,
  PaginatedResponse,
  CreateTemplateRequest
} from '../types';
import { 
  mockLocations, 
  mockTemplates, 
  generateMockGenerationJob,
  createTemplate as createMockTemplate,
  getAllTemplates,
  getAllLocations,
  deleteTemplate as deleteMockTemplate
} from '../data/mockData';
import { supabaseLocationService } from './supabaseLocationService';
import { REFERENCE_AD_TEMPLATE, generateAdName, generateCampaignName, generateAdSetName } from '../constants/hardcodedAdValues';
import Papa from 'papaparse';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random network failures (5% chance) - DISABLED for stable generation
const simulateFailure = () => false;

// Mock API class
class MockApiService {
  private generationJobs: Map<string, GenerationJob> = new Map();

  // Location endpoints
  async getLocations(
    page: number = 1, 
    limit: number = 20, 
    filters?: LocationFilters
  ): Promise<ApiResponse<PaginatedResponse<LocationWithConfig>>> {
    await delay(300);
    
    try {
      console.log('🔍 DEBUG: mockApi.getLocations called with Supabase and configs');
      
      // Get locations with configs from Supabase
      let allLocations: LocationWithConfig[];
      
      if (filters && (filters.search || filters.states || filters.cities || filters.zipCodes)) {
        // For filtered searches, we need to get all locations with configs first, then filter
        const allLocationConfigs = await supabaseLocationService.getLocationsWithConfigs();
        allLocations = allLocationConfigs.filter(location => {
          const searchMatch = !filters.search || 
            location.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            location.displayName.toLowerCase().includes(filters.search.toLowerCase()) ||
            location.city.toLowerCase().includes(filters.search.toLowerCase());
          
          const stateMatch = !filters.states || filters.states.length === 0 || 
            filters.states.includes(location.state);
          
          const cityMatch = !filters.cities || filters.cities.length === 0 || 
            filters.cities.includes(location.city);
          
          const zipCodeMatch = !filters.zipCodes || filters.zipCodes.length === 0 || 
            filters.zipCodes.includes(location.zipCode);
          
          return searchMatch && stateMatch && cityMatch && zipCodeMatch;
        });
      } else {
        allLocations = await supabaseLocationService.getLocationsWithConfigs();
      }

      console.log('🔍 DEBUG: Supabase locations with configs count:', allLocations.length);
      console.log('🔍 DEBUG: Supabase locations first few:', allLocations.slice(0, 3).map(l => ({ id: l.id, name: l.name, hasConfig: !!l.config })));

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = allLocations.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          items: paginatedData,
          total: allLocations.length,
          page,
          limit,
          totalPages: Math.ceil(allLocations.length / limit),
        }
      };
    } catch (error) {
      console.error('Error fetching locations with configs from Supabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch locations'
      };
    }
  }

  async getLocationById(id: string): Promise<ApiResponse<LocationWithConfig | null>> {
    await delay(200);
    
    try {
      const allLocations = await supabaseLocationService.getLocationsWithConfigs();
      const location = allLocations.find(loc => loc.id === id);
      
      if (!location) {
        return {
          success: false,
          error: 'Location not found'
        };
      }

      return {
        success: true,
        data: location
      };
    } catch (error) {
      console.error('Error fetching location by ID from Supabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch location'
      };
    }
  }

  async searchLocations(query: string): Promise<ApiResponse<LocationWithConfig[]>> {
    await delay(300);
    
    try {
      const allLocations = await supabaseLocationService.getLocationsWithConfigs();
      const results = allLocations.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.displayName.toLowerCase().includes(query.toLowerCase()) ||
        location.city.toLowerCase().includes(query.toLowerCase()) ||
        location.state.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        success: true,
        data: results.slice(0, 100) // Limit search results
      };
    } catch (error) {
      console.error('Error searching locations in Supabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  async getLocationStates(): Promise<ApiResponse<string[]>> {
    await delay(200);
    
    try {
      const states = await supabaseLocationService.getUniqueStates();
      return {
        success: true,
        data: states
      };
    } catch (error) {
      console.error('Error fetching location states from Supabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch states'
      };
    }
  }

  async getLocationCities(state?: string): Promise<ApiResponse<string[]>> {
    await delay(200);
    
    try {
      const cities = await supabaseLocationService.getUniqueCities(state);
      return {
        success: true,
        data: cities
      };
    } catch (error) {
      console.error('Error fetching location cities from Supabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cities'
      };
    }
  }

  // Template endpoints
  async getTemplates(): Promise<ApiResponse<AdTemplate[]>> {
    await delay(200);
    
    if (simulateFailure()) {
      throw new Error('Failed to fetch templates');
    }

    return {
      success: true,
      data: getAllTemplates()
    };
  }

  async getTemplateById(id: string): Promise<ApiResponse<AdTemplate>> {
    await delay(200);
    
    const templates = getAllTemplates();
    const template = templates.find(tpl => tpl.id === id);
    
    if (!template) {
      return {
        success: false,
        error: 'Template not found'
      };
    }

    return {
      success: true,
      data: template
    };
  }

  async createTemplate(templateData: CreateTemplateRequest): Promise<ApiResponse<AdTemplate>> {
    await delay(500);
    
    if (simulateFailure()) {
      throw new Error('Failed to create template');
    }

    try {
      const newTemplate = createMockTemplate(templateData);
      return {
        success: true,
        data: newTemplate
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create template'
      };
    }
  }

  async updateTemplate(id: string, templateData: Partial<AdTemplate>): Promise<ApiResponse<AdTemplate>> {
    await delay(500);
    
    if (simulateFailure()) {
      throw new Error('Failed to update template');
    }

    const templates = getAllTemplates();
    const templateIndex = templates.findIndex(tpl => tpl.id === id);
    
    if (templateIndex === -1) {
      return {
        success: false,
        error: 'Template not found'
      };
    }

    // Note: In a real implementation, this would update the template in persistent storage
    // For now, we'll just return the updated template without persistence
    const updatedTemplate = {
      ...templates[templateIndex],
      ...templateData,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: updatedTemplate
    };
  }

  async deleteTemplate(id: string): Promise<ApiResponse<boolean>> {
    await delay(300);
    
    if (simulateFailure()) {
      throw new Error('Failed to delete template');
    }

    const deleted = deleteMockTemplate(id);
    
    if (!deleted) {
      return {
        success: false,
        error: 'Template not found or cannot be deleted'
      };
    }

    return {
      success: true,
      data: true
    };
  }

  // Generation endpoints
  async generateAds(
    locationIds: string[], 
    templateIds: string[], 
    options: GenerationOptions
  ): Promise<ApiResponse<GenerationJob>> {
    await delay(500);
    
    if (simulateFailure()) {
      throw new Error('Failed to start generation');
    }

    const job = generateMockGenerationJob(locationIds, templateIds);
    job.options = options;
    
    this.generationJobs.set(job.id, job);
    
    // Start processing simulation
    this.simulateJobProcessing(job.id);
    
    return {
      success: true,
      data: job
    };
  }

  async getGenerationStatus(jobId: string): Promise<ApiResponse<GenerationJob>> {
    await delay(100);
    
    const job = this.generationJobs.get(jobId);
    
    if (!job) {
      return {
        success: false,
        error: 'Job not found'
      };
    }

    return {
      success: true,
      data: job
    };
  }

  async downloadGeneratedFile(jobId: string): Promise<ApiResponse<Blob>> {
    await delay(1000);
    
    const job = this.generationJobs.get(jobId);
    
    if (!job || job.status !== 'completed') {
      return {
        success: false,
        error: 'File not ready or job not found'
      };
    }

    // Create a mock file blob
    const csvContent = await this.generateMockCsvContent(job);
    console.log('🔍 DEBUG: About to create blob with content length:', csvContent.length);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    console.log('🔍 DEBUG: Blob created with size:', blob.size, 'bytes');
    
    return {
      success: true,
      data: blob
    };
  }

  // Preview endpoints
  async previewGeneratedAds(
    locationIds: string[], 
    templateIds: string[]
  ): Promise<ApiResponse<GeneratedAd[]>> {
    await delay(400);
    
    if (simulateFailure()) {
      throw new Error('Preview generation failed');
    }

    const locations = mockLocations.filter(loc => locationIds.includes(loc.id));
    const templates = mockTemplates.filter(tpl => templateIds.includes(tpl.id));
    
    const previews: GeneratedAd[] = [];
    
    // Generate preview for first few combinations
    const maxPreviews = 12;
    let count = 0;
    
    for (const location of locations) {
      for (const template of templates) {
        if (count >= maxPreviews) break;
        
        const ad: GeneratedAd = {
          id: `preview_${location.id}_${template.id}`,
          locationId: location.id,
          templateId: template.id,
          generatedFields: {
            headline: this.substituteVariables(template.fields.headline, location),
            description: this.substituteVariables(template.fields.description, location),
            callToAction: template.fields.callToAction,
            imageUrl: template.fields.imageUrl,
            landingPageUrl: this.substituteVariables(template.fields.landingPageUrl, location),
          },
          metadata: {
            createdAt: new Date().toISOString(),
            batchId: 'preview',
            locationName: location.name,
            templateName: template.name,
          },
        };
        
        previews.push(ad);
        count++;
      }
      if (count >= maxPreviews) break;
    }
    
    return {
      success: true,
      data: previews
    };
  }

  // Private helper methods
  private simulateJobProcessing(jobId: string) {
    const job = this.generationJobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    const totalAds = job.totalAds;
    const processingTime = Math.max(2000, totalAds * 2); // 2ms per ad, minimum 2 seconds
    const updateInterval = processingTime / 20; // 20 updates

    let processedAds = 0;
    const interval = setInterval(() => {
      const increment = Math.ceil(totalAds / 20);
      processedAds = Math.min(processedAds + increment, totalAds);
      
      job.processedAds = processedAds;
      
      if (processedAds >= totalAds) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.filePath = `/downloads/${jobId}.${job.options.format}`;
        job.downloadUrl = `${window.location.origin}/api/download/${jobId}`;
        clearInterval(interval);
      }
      
      this.generationJobs.set(jobId, { ...job });
    }, updateInterval);

    // Simulate occasional failures (2% chance)
    if (Math.random() < 0.02) {
      setTimeout(() => {
        job.status = 'failed';
        job.error = 'Processing failed due to server error';
        this.generationJobs.set(jobId, { ...job });
        clearInterval(interval);
      }, Math.random() * processingTime);
    }
  }

  private substituteVariables(template: string, location: LocationSummary): string {
    return template
      .replace(/\{\{location\.name\}\}/g, location.name)
      .replace(/\{\{location\.city\}\}/g, location.city)
      .replace(/\{\{location\.state\}\}/g, location.state)
      .replace(/\{\{location\.address\}\}/g, location.address)
      .replace(/\{\{location\.phone\}\}/g, location.phoneNumber)
      .replace(/\{\{location\.id\}\}/g, location.id);
  }

  private async generateMockCsvContent(job: GenerationJob): Promise<string> {
    // Ensure locations are loaded
    await getAllLocations(); // This will load locations if they're not already loaded
    
    // Use mock locations that are already loaded in the app
    const locations = mockLocations.filter(loc => job.locationIds.includes(loc.id));
    const templates = mockTemplates.filter(tpl => job.templateIds.includes(tpl.id));
    
    console.log('🔍 DEBUG: Generating CSV for:', { 
      totalMockLocations: mockLocations.length,
      jobLocationIds: job.locationIds,
      foundLocations: locations.length, 
      jobTemplateIds: job.templateIds.length, 
      foundTemplates: templates.length,
      locationSample: locations.slice(0, 2).map(l => ({ id: l.id, name: l.name })),
      templateSample: templates.slice(0, 2).map(t => ({ id: t.id, name: t.name }))
    });
    
    // Facebook/Meta campaign format headers
    const headers = [
      'Campaign ID', 'Campaign Name', 'Campaign Status', 'Campaign Objective', 'Buying Type',
      'Campaign Lifetime Budget', 'Campaign Bid Strategy', 'Campaign Start Time', 'Campaign Stop Time',
      'New Objective', 'Buy With Prime Type', 'Is Budget Scheduling Enabled For Campaign',
      'Campaign High Demand Periods', 'Buy With Integration Partner', 'Ad Set ID', 'Ad Set Run Status',
      'Ad Set Lifetime Impressions', 'Ad Set Name', 'Ad Set Time Start', 'Ad Set Time Stop',
      'Destination Type', 'Use Accelerated Delivery', 'Is Budget Scheduling Enabled For Ad Set',
      'Ad Set High Demand Periods', 'Link Object ID', 'Optimized Conversion Tracking Pixels',
      'Optimized Event', 'Link', 'Addresses', 'Location Types', 'Excluded Regions', 'Excluded Zip',
      'Gender', 'Age Min', 'Age Max', 'Excluded Custom Audiences', 'Flexible Inclusions',
      'Targeting Relaxation', 'Brand Safety Inventory Filtering Levels', 'Optimization Goal',
      'Attribution Spec', 'Billing Event', 'Ad ID', 'Ad Status', 'Preview Link', 'Instagram Preview Link',
      'Ad Name', 'Dynamic Creative Ad Format', 'Title', 'Title Placement', 'Body', 'Body Placement',
      'Display Link', 'Link Placement', 'Optimize text per person', 'Conversion Tracking Pixels',
      'Image Hash', 'Video Thumbnail URL', 'Image Placement', 'Additional Image 1 Hash',
      'Additional Image 1 Placement', 'Additional Image 2 Hash', 'Additional Image 2 Placement',
      'Additional Image 3 Hash', 'Additional Image 3 Placement', 'Additional Image 4 Hash',
      'Additional Image 4 Placement', 'Creative Type', 'URL Tags', 'Video ID', 'Video Placement',
      'Additional Video 1 ID', 'Additional Video 1 Placement', 'Additional Video 1 Thumbnail URL',
      'Instagram Account ID', 'Call to Action', 'Additional Custom Tracking Specs', 'Video Retargeting',
      'Permalink', 'Use Page as Actor', 'Dynamic Creative Call to Action', 'Degrees of Freedom Type'
    ];
    
    console.log('🔍 DEBUG: CSV headers created, length:', headers.length);
    
    const campaign = job.options.campaign;
    console.log('🔍 DEBUG: Campaign config:', campaign);
    
    // Prepare the interests data as a proper object that will be JSON.stringify'd
    const interestsData = [{
      interests: [
        { id: "6002997877444", name: "Waxing" },
        { id: "6003095705016", name: "Beauty & Fashion" },
        { id: "6003152657675", name: "Wellness SPA" },
        { id: "6003244295567", name: "Self care" },
        { id: "6003251053061", name: "Shaving" },
        { id: "6003393295343", name: "Health And Beauty" },
        { id: "6003503807196", name: "European Wax Center" },
        { id: "6003522953242", name: "Brazilian Waxing" },
        { id: "6015279452180", name: "Bombshell Brazilian Waxing & Beauty Lounge" }
      ]
    }];

    const attributionSpec = [{
      event_type: "CLICK_THROUGH",
      window_days: 1
    }];
    
    const rows: string[][] = [];
    
    for (const location of locations) {
      for (const template of templates) {
        // Use hard-coded values from reference template instead of substitution
        const description = REFERENCE_AD_TEMPLATE.body;
        
        // Use location's landing page URL, template's landing page URL, or default fallback
        const landingPageUrl = location.landing_page_url ||
                               this.substituteVariables(template.fields.landingPageUrl, location) ||
                               'https://waxcenter.com'; // Default fallback
        
        // Generate dynamic names using hard-coded reference template
        const locationName = location.name.replace(/\s+/g, '');
        const campaignName = generateCampaignName(locationName);
        const adSetName = generateAdSetName(locationName);
        const adName = generateAdName(locationName);
        
        const row = [
          '', // Campaign ID (empty in example)
          campaignName,
          'ACTIVE',
          'Outcome Engagement',
          'AUCTION',
          campaign.budget.toString(),
          campaign.bidStrategy,
          campaign.startDate,
          campaign.endDate,
          'Yes',
          'NONE',
          'No',
          '[]',
          'NONE',
          '', // Ad Set ID (empty in example)
          'ACTIVE',
          '0',
          adSetName,
          campaign.startDate,
          campaign.endDate,
          'UNDEFINED',
          'No',
          'No',
          '[]',
          'o:108555182262',
          'tp:1035642271793092',
          'SCHEDULE',
          landingPageUrl,
          `(${location.coordinates.lat.toFixed(3)}, ${location.coordinates.lng.toFixed(3)}) +${campaign.radius}mi`,
          'home, recent',
          'Alaska US, Wyoming US',
          '',
          'Women',
          '18',
          '54',
          '120213927766160508:AUD-FBAllPriorServicedCustomers',
          JSON.stringify(interestsData), // This will be properly escaped by papaparse
          'custom_audience: Off, lookalike: Off',
          'FACEBOOK_STANDARD, AN_STANDARD, FEED_RELAXED',
          'OFFSITE_CONVERSIONS',
          JSON.stringify(attributionSpec), // This will be properly escaped by papaparse
          'IMPRESSIONS',
          'a:120228258706880508',
          'ACTIVE',
          'https://www.facebook.com/?feed_demo_ad=120228258706880508&h=AQCXa9GVq2c5YDX-hxc',
          'https://www.instagram.com/p/DLShxy_sE-_/',
          adName,
          REFERENCE_AD_TEMPLATE.dynamicCreativeAdFormat,
          REFERENCE_AD_TEMPLATE.title, // Hard-coded title
          'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story',
          description,
          'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story',
          'waxcenter.com',
          'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story',
          'No',
          'tp:1035642271793092',
          '303541819130038:d28e1dc58e7fcc7ac6d3e309eac2d3ad',
          'https://scontent-dfw5-1.xx.fbcdn.net/v/t15.13418-10/467701760_926931896038122_8058283634477458555_n.jpg?stp=dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=ace027&_nc_oc=AdlRhXqk3kXyhfvnEB8Qa7Oe8kveKql6aq7ivD7J8C1oa6U_ViFu5l3ECSLnLDYj1YI&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=DprWR9RBxU4CVd-KxeA7MA&oh=00_AfPBEpbKMyhLvJjipyeZU_KeCjc8t-5S7HwTZ6zRx7Td_Q&oe=685FA2F2',
          'Default',
          '303541819130038:0642b7ec8b997de13d35e3760f43ee2e',
          'audience_network classic',
          '', '', '', '', '', '', '', // Additional image placements
          'Link Page Post Ad',
          'utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&acadia_source=facebook&acadia_medium=cpc&utm_term={{adset.name}}&placement={{placement}}',
          'v:1794899587789121',
          'facebook biz_disco_feed, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook video_feeds, instagram explore, instagram stream',
          'v:1243573153921320',
          'facebook facebook_reels, facebook right_hand_column, facebook search, facebook story, instagram reels, instagram story, messenger story',
          'https://scontent-dfw5-2.xx.fbcdn.net/v/t15.13418-10/467256659_543283285137927_5402167441693162688_n.jpg?stp=dst-jpg_tt6&_nc_cat=102&ccb=1-7&_nc_sid=ace027&_nc_oc=Adl-w5-p4KgKcpfNbwFCMI8p2z8bvGQvk3O2EUHsARUHic1iLG7nej7NHJZf5vrcj-w&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-dfw5-2.xx&_nc_gid=DprWR9RBxU4CVd-KxeA7MA&oh=00_AfMi8ih1MsPowL9pJrKsL6C9UW1sfWFo4HOhjCFJSCvgkA&oe=685F93A7',
          'x:602557576501192',
          template.fields.callToAction,
          '[]',
          'No',
          'https://www.facebook.com/100067578193272/posts/pfbid02f9M3ZgPPTqtYjvm3MzhNwE4HVV1BUT4cmZEactPNPvgPUgCnFVYC4GQ6E5pAeCQl?dco_ad_id=120228258706880508',
          'No',
          template.fields.callToAction,
          'USER_ENROLLED_AUTOFLOW'
        ];
        
        rows.push(row);
      }
    }
    
    // Use papaparse to properly escape all values, including JSON
    const csvOutput = Papa.unparse([headers, ...rows], {
      quotes: false,    // Only quote fields that need it (contain commas, quotes, newlines, etc.)
      quoteChar: '"',   // Use double quotes when quoting is needed
      escapeChar: '"'   // Escape quotes by doubling them
    });
    
    console.log('🔍 DEBUG: CSV generation complete. Total length:', csvOutput.length, 'Lines:', csvOutput.split('\n').length);
    console.log('🔍 DEBUG: First 500 chars:', csvOutput.substring(0, 500));
    
    return csvOutput;
  }

  // Statistics endpoints
  async getGenerationStats(): Promise<ApiResponse<{
    totalLocations: number;
    totalTemplates: number;
    totalGenerations: number;
    averageProcessingTime: number;
  }>> {
    await delay(200);
    
    const completedJobs = Array.from(this.generationJobs.values())
      .filter(job => job.status === 'completed');
    
    const totalGenerations = completedJobs.reduce((sum, job) => sum + job.totalAds, 0);
    const averageProcessingTime = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => {
          const processingTime = job.completedAt && job.createdAt 
            ? new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()
            : 0;
          return sum + processingTime;
        }, 0) / completedJobs.length
      : 0;
    
    return {
      success: true,
      data: {
        totalLocations: mockLocations.length,
        totalTemplates: mockTemplates.length,
        totalGenerations,
        averageProcessingTime: Math.round(averageProcessingTime / 1000), // Convert to seconds
      }
    };
  }

  // Utility methods for development
  resetJobs() {
    this.generationJobs.clear();
  }

  getAllJobs(): GenerationJob[] {
    return Array.from(this.generationJobs.values());
  }
}

// Export singleton instance
export const mockApi = new MockApiService();

// Export individual methods for easier testing
export const {
  getLocations,
  getLocationById,
  searchLocations,
  getLocationStates,
  getLocationCities,
  getTemplates,
  getTemplateById,
  generateAds,
  getGenerationStatus,
  downloadGeneratedFile,
  previewGeneratedAds,
  getGenerationStats
} = mockApi; 