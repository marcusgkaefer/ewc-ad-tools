import Papa from 'papaparse';

import {
  REFERENCE_AD_TEMPLATE,
  generateAdName,
  generateCampaignName,
  generateAdSetName,
} from '../constants/hardcodedAdValues';
import {
  mockLocations,
  mockTemplates,
  generateMockGenerationJob,
  createTemplate as createMockTemplate,
  getAllTemplates,
  deleteTemplate as deleteMockTemplate,
} from '../data/mockData';
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
  CreateTemplateRequest,
} from '../types';

import { supabaseLocationService } from './supabaseLocationService';

// Simulate network delay
const delay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

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
      console.log(
        '🔍 DEBUG: mockApi.getLocations called with Supabase and configs'
      );

      // Get locations with configs from Supabase
      let allLocations: LocationWithConfig[];

      if (
        filters &&
        (filters.search || filters.states || filters.cities || filters.zipCodes)
      ) {
        // For filtered searches, we need to get all locations with configs first, then filter
        const allLocationConfigs =
          await supabaseLocationService.getLocationsWithConfigs();
        allLocations = allLocationConfigs.filter(location => {
          const searchMatch =
            !filters.search ||
            location.name
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            location.displayName
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            location.city.toLowerCase().includes(filters.search.toLowerCase());

          const stateMatch =
            !filters.states ||
            filters.states.length === 0 ||
            filters.states.includes(location.state);

          const cityMatch =
            !filters.cities ||
            filters.cities.length === 0 ||
            filters.cities.includes(location.city);

          const zipCodeMatch =
            !filters.zipCodes ||
            filters.zipCodes.length === 0 ||
            filters.zipCodes.includes(location.zipCode);

          return searchMatch && stateMatch && cityMatch && zipCodeMatch;
        });
      } else {
        allLocations = await supabaseLocationService.getLocationsWithConfigs();
      }

      console.log(
        '🔍 DEBUG: Supabase locations with configs count:',
        allLocations.length
      );
      console.log(
        '🔍 DEBUG: Supabase locations first few:',
        allLocations
          .slice(0, 3)
          .map(l => ({ id: l.id, name: l.name, hasConfig: !!l.config }))
      );

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
        },
      };
    } catch (error) {
      console.error(
        'Error fetching locations with configs from Supabase:',
        error
      );
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch locations',
      };
    }
  }

  async getLocationById(
    id: string
  ): Promise<ApiResponse<LocationWithConfig | null>> {
    await delay(200);

    try {
      const allLocations =
        await supabaseLocationService.getLocationsWithConfigs();
      const location = allLocations.find(loc => loc.id === id);

      if (!location) {
        return {
          success: false,
          error: 'Location not found',
        };
      }

      return {
        success: true,
        data: location,
      };
    } catch (error) {
      console.error('Error fetching location by ID from Supabase:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch location',
      };
    }
  }

  async searchLocations(
    query: string
  ): Promise<ApiResponse<LocationWithConfig[]>> {
    await delay(300);

    try {
      const allLocations =
        await supabaseLocationService.getLocationsWithConfigs();
      const results = allLocations.filter(
        location =>
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.displayName.toLowerCase().includes(query.toLowerCase()) ||
          location.city.toLowerCase().includes(query.toLowerCase()) ||
          location.state.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: results.slice(0, 100), // Limit search results
      };
    } catch (error) {
      console.error('Error searching locations in Supabase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  async getLocationStates(): Promise<ApiResponse<string[]>> {
    await delay(200);

    try {
      const states = await supabaseLocationService.getUniqueStates();
      return {
        success: true,
        data: states,
      };
    } catch (error) {
      console.error('Error fetching location states from Supabase:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch states',
      };
    }
  }

  async getLocationCities(state?: string): Promise<ApiResponse<string[]>> {
    await delay(200);

    try {
      const cities = await supabaseLocationService.getUniqueCities(state);
      return {
        success: true,
        data: cities,
      };
    } catch (error) {
      console.error('Error fetching location cities from Supabase:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch cities',
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
      data: getAllTemplates(),
    };
  }

  async getTemplateById(id: string): Promise<ApiResponse<AdTemplate>> {
    await delay(200);

    const templates = getAllTemplates();
    const template = templates.find(tpl => tpl.id === id);

    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    return {
      success: true,
      data: template,
    };
  }

  async createTemplate(
    templateData: CreateTemplateRequest
  ): Promise<ApiResponse<AdTemplate>> {
    await delay(500);

    if (simulateFailure()) {
      throw new Error('Failed to create template');
    }

    try {
      const newTemplate = createMockTemplate(templateData);
      return {
        success: true,
        data: newTemplate,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create template',
      };
    }
  }

  async updateTemplate(
    id: string,
    templateData: Partial<AdTemplate>
  ): Promise<ApiResponse<AdTemplate>> {
    await delay(500);

    if (simulateFailure()) {
      throw new Error('Failed to update template');
    }

    const templates = getAllTemplates();
    const templateIndex = templates.findIndex(tpl => tpl.id === id);

    if (templateIndex === -1) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    // Note: In a real implementation, this would update the template in persistent storage
    // For now, we'll just return the updated template without persistence
    const updatedTemplate = {
      ...templates[templateIndex],
      ...templateData,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: updatedTemplate,
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
        error: 'Template not found or cannot be deleted',
      };
    }

    return {
      success: true,
      data: true,
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
      data: job,
    };
  }

  async getGenerationStatus(
    jobId: string
  ): Promise<ApiResponse<GenerationJob>> {
    await delay(100);

    const job = this.generationJobs.get(jobId);

    if (!job) {
      return {
        success: false,
        error: 'Job not found',
      };
    }

    return {
      success: true,
      data: job,
    };
  }

  async downloadGeneratedFile(jobId: string): Promise<ApiResponse<Blob>> {
    await delay(1000);

    const job = this.generationJobs.get(jobId);

    if (!job || job.status !== 'completed') {
      return {
        success: false,
        error: 'File not ready or job not found',
      };
    }

    // Create a mock file blob
    const csvContent = await this.generateMockCsvContent(job);
    console.log(
      '🔍 DEBUG: About to create blob with content length:',
      csvContent.length
    );
    const blob = new Blob([csvContent], { type: 'text/csv' });
    console.log('🔍 DEBUG: Blob created with size:', blob.size, 'bytes');

    return {
      success: true,
      data: blob,
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
            headline: this.substituteVariables(
              template.fields.headline,
              location
            ),
            description: this.substituteVariables(
              template.fields.description,
              location
            ),
            callToAction: template.fields.callToAction,
            imageUrl: template.fields.imageUrl,
            landingPageUrl: this.substituteVariables(
              template.fields.landingPageUrl,
              location
            ),
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
      data: previews,
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

  private substituteVariables(
    template: string,
    location: LocationSummary
  ): string {
    return template
      .replace(/\{\{location\.name\}\}/g, location.name)
      .replace(/\{\{location\.city\}\}/g, location.city)
      .replace(/\{\{location\.state\}\}/g, location.state)
      .replace(/\{\{location\.address\}\}/g, location.address)
      .replace(/\{\{location\.phone\}\}/g, location.phoneNumber)
      .replace(/\{\{location\.id\}\}/g, location.id);
  }

  private async generateMockCsvContent(job: GenerationJob): Promise<string> {
    // Get locations with configs from Supabase
    const allLocationsWithConfigs =
      await supabaseLocationService.getLocationsWithConfigs();

    // Filter to only the locations for this job
    const locations = allLocationsWithConfigs.filter(loc =>
      job.locationIds.includes(loc.id)
    );
    const templates = mockTemplates.filter(tpl =>
      job.templateIds.includes(tpl.id)
    );

    console.log('🔍 DEBUG: Generating CSV for:', {
      totalLocationsWithConfigs: allLocationsWithConfigs.length,
      jobLocationIds: job.locationIds,
      foundLocations: locations.length,
      jobTemplateIds: job.templateIds.length,
      foundTemplates: templates.length,
      locationSample: locations
        .slice(0, 2)
        .map(l => ({ id: l.id, name: l.name, radius: l.config?.radiusMiles })),
      templateSample: templates
        .slice(0, 2)
        .map(t => ({ id: t.id, name: t.name })),
    });

    // Facebook/Meta campaign format headers
    const headers = [
      'Campaign ID',
      'Campaign Name',
      'Campaign Status',
      'Campaign Objective',
      'Buying Type',
      'Campaign Lifetime Budget',
      'Campaign Bid Strategy',
      'Campaign Start Time',
      'Campaign Stop Time',
      'New Objective',
      'Buy With Prime Type',
      'Is Budget Scheduling Enabled For Campaign',
      'Campaign High Demand Periods',
      'Buy With Integration Partner',
      'Ad Set ID',
      'Ad Set Run Status',
      'Ad Set Lifetime Impressions',
      'Ad Set Name',
      'Ad Set Time Start',
      'Ad Set Time Stop',
      'Destination Type',
      'Use Accelerated Delivery',
      'Is Budget Scheduling Enabled For Ad Set',
      'Ad Set High Demand Periods',
      'Link Object ID',
      'Optimized Conversion Tracking Pixels',
      'Optimized Event',
      'Link',
      'Addresses',
      'Location Types',
      'Excluded Regions',
      'Excluded Zip',
      'Gender',
      'Age Min',
      'Age Max',
      'Excluded Custom Audiences',
      'Flexible Inclusions',
      'Targeting Relaxation',
      'Brand Safety Inventory Filtering Levels',
      'Optimization Goal',
      'Attribution Spec',
      'Billing Event',
      'Ad ID',
      'Ad Status',
      'Preview Link',
      'Instagram Preview Link',
      'Ad Name',
      'Automatic Format',
      'Title',
      'Title Placement',
      'Body',
      'Body Placement',
      'Display Link',
      'Link Placement',
      'Optimize text per person',
      'Conversion Tracking Pixels',
      'Image Hash',
      'Video Thumbnail URL',
      'Image Placement',
      'Additional Image 1 Hash',
      'Additional Image 1 Placement',
      'Additional Image 2 Hash',
      'Additional Image 2 Placement',
      'Additional Image 3 Hash',
      'Additional Image 3 Placement',
      'Additional Image 4 Hash',
      'Additional Image 4 Placement',
      'Creative Type',
      'URL Tags',
      'Video ID',
      'Video Placement',
      'Additional Video 1 ID',
      'Additional Video 1 Placement',
      'Additional Video 1 Thumbnail URL',
      'Instagram Account ID',
      'Call to Action',
      'Additional Custom Tracking Specs',
      'Video Retargeting',
      'Permalink',
      'Use Page as Actor',
      'Dynamic Creative Call to Action',
      'Degrees of Freedom Type',
    ];

    console.log('🔍 DEBUG: CSV headers created, length:', headers.length);

    const campaign = job.options.campaign;
    console.log('🔍 DEBUG: Campaign config:', campaign);

    // Prepare the interests data as a proper object that will be JSON.stringify'd
    const interestsData = [
      {
        interests: [
          { id: '6002997877444', name: 'Waxing' },
          { id: '6003095705016', name: 'Beauty & Fashion' },
          { id: '6003152657675', name: 'Wellness SPA' },
          { id: '6003244295567', name: 'Self care' },
          { id: '6003251053061', name: 'Shaving' },
          { id: '6003393295343', name: 'Health And Beauty' },
          { id: '6003503807196', name: 'European Wax Center' },
          { id: '6003522953242', name: 'Brazilian Waxing' },
          {
            id: '6015279452180',
            name: 'Bombshell Brazilian Waxing & Beauty Lounge',
          },
        ],
      },
    ];

    // Date formatting function for MM/DD/YYYY HH:mm:ss am/pm format
    const formatCsvDate = (dateString: string): string => {
      const date = new Date(dateString);
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const year = date.getUTCFullYear();

      let hours = date.getUTCHours();
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';

      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const hoursStr = String(hours).padStart(2, '0');

      return `${month}/${day}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    };

    // Hardcoded excluded zip codes for all campaigns
    const excludedZipCodes =
      'US:50001, US:50002, US:50003, US:50005, US:50006, US:50007, US:50008, US:50009, US:50010, US:50012, US:50013, US:50014, US:50020, US:50021, US:50022, US:50023, US:50025, US:50026, US:50027, US:50028, US:50029, US:50031, US:50032, US:50033, US:50034, US:50035, US:50036, US:50038, US:50039, US:50040, US:50041, US:50042, US:50044, US:50046, US:50047, US:50048, US:50049, US:50050, US:50051, US:50052, US:50054, US:50055, US:50056, US:50057, US:50058, US:50059, US:50060, US:50061, US:50062, US:50063, US:50064, US:50065, US:50066, US:50067, US:50068, US:50069, US:50070, US:50071, US:50072, US:50073, US:50074, US:50075, US:50076, US:50078, US:50099, US:50101, US:50102, US:50103, US:50104, US:50105, US:50106, US:50107, US:50108, US:50109, US:50110, US:50111, US:50112, US:50115, US:50116, US:50117, US:50118, US:50119, US:50120, US:50122, US:50123, US:50124, US:50125, US:50126, US:50127, US:50128, US:50129, US:50130, US:50131, US:50132, US:50133, US:50134, US:50135, US:50136, US:50137, US:50138, US:50139, US:50140, US:50141, US:50142, US:50143, US:50144, US:50145, US:50146, US:50147, US:50148, US:50149, US:50150, US:50151, US:50152, US:50153, US:50154, US:50155, US:50156, US:50157, US:50158, US:50160, US:50161, US:50162, US:50163, US:50164, US:50165, US:50166, US:50167, US:50168, US:50169, US:50170, US:50171, US:50173, US:50174, US:50201, US:50206, US:50207, US:50208, US:50210, US:50211, US:50212, US:50213, US:50214, US:50216, US:50217, US:50218, US:50219, US:50220, US:50222, US:50223, US:50225, US:50226, US:50227, US:50228, US:50229, US:50230, US:50231, US:50232, US:50233, US:50234, US:50235, US:50236, US:50237, US:50238, US:50239, US:50240, US:50241, US:50242, US:50243, US:50244, US:50246, US:50247, US:50248, US:50249, US:50250, US:50251, US:50252, US:50254, US:50255, US:50256, US:50257, US:50258, US:50259, US:50261, US:50262, US:50263, US:50264, US:50265, US:50266, US:50268, US:50269, US:50271, US:50272, US:50273, US:50274, US:50275, US:50276, US:50277, US:50278, US:50301, US:50302, US:50304, US:50305, US:50306, US:50307, US:50308, US:50309, US:50310, US:50311, US:50312, US:50313, US:50314, US:50315, US:50316, US:50317, US:50318, US:50319, US:50320, US:50321, US:50322, US:50323, US:50324, US:50325, US:50327, US:50328, US:50330, US:50331, US:50332, US:50333, US:50334, US:50335, US:50339, US:50340, US:50347, US:50359, US:50360, US:50361, US:50363, US:50364, US:50367, US:50369, US:50380, US:50391, US:50392, US:50393, US:50395, US:50396, US:50397, US:50398, US:50401, US:50402, US:50420, US:50421, US:50423, US:50424, US:50426, US:50427, US:50428, US:50430, US:50431, US:50432, US:50433, US:50434, US:50435, US:50436, US:50438, US:50439, US:50440, US:50441, US:50444, US:50446, US:50447, US:50448, US:50449, US:50450, US:50451, US:50452, US:50453, US:50454, US:50455, US:50456, US:50457, US:50458, US:50459, US:50460, US:50461, US:50464, US:50465, US:50466, US:50467, US:50468, US:50469, US:50470, US:50471, US:50472, US:50473, US:50475, US:50476, US:50477, US:50478, US:50479, US:50480, US:50481, US:50482, US:50483, US:50484, US:50501, US:50510, US:50511, US:50514, US:50515, US:50516, US:50517, US:50518, US:50519, US:50520, US:50521, US:50522, US:50523, US:50524, US:50525, US:50526, US:50527, US:50528, US:50529, US:50530, US:50531, US:50532, US:50533, US:50535, US:50536, US:50538, US:50539, US:50540, US:50541, US:50542, US:50543, US:50544, US:50545, US:50546, US:50548, US:50551, US:50552, US:50554, US:50556, US:50557, US:50558, US:50559, US:50560, US:50561, US:50562, US:50563, US:50565, US:50566, US:50567, US:50568, US:50569, US:50570, US:50571, US:50573, US:50574, US:50575, US:50576, US:50577, US:50578, US:50579, US:50581, US:50582, US:50583, US:50585, US:50586, US:50588, US:50590, US:50591, US:50592, US:50593, US:50594, US:50595, US:50597, US:50598, US:50599, US:50601, US:50602, US:50603, US:50604, US:50605, US:50606, US:50607, US:50608, US:50609, US:50611, US:50612, US:50613, US:50614, US:50616, US:50619, US:50620, US:50621, US:50622, US:50623, US:50624, US:50625, US:50626, US:50627, US:50628, US:50629, US:50630, US:50631, US:50632, US:50633, US:50634, US:50635, US:50636, US:50638, US:50641, US:50642, US:50643, US:50644, US:50645, US:50647, US:50648, US:50649, US:50650, US:50651, US:50652, US:50653, US:50654, US:50655, US:50657, US:50658, US:50659, US:50660, US:50662, US:50664, US:50665, US:50666, US:50667, US:50668, US:50669, US:50670, US:50671, US:50672, US:50673, US:50674, US:50675, US:50676, US:50677, US:50680, US:50681, US:50682, US:50701, US:50702, US:50703, US:50704, US:50707, US:50801, US:50830, US:50831, US:50833, US:50835, US:50836, US:50837, US:50839, US:50840, US:50841, US:50842, US:50843, US:50845, US:50846, US:50847, US:50848, US:50849, US:50851, US:50853, US:50854, US:50857, US:50858, US:50859, US:50860, US:50861, US:50862, US:50863, US:50864, US:50936, US:50950, US:50980, US:50981, US:50982, US:50983, US:51001, US:51002, US:51003, US:51004, US:51005, US:51006, US:51007, US:51008, US:51009, US:51010, US:51011, US:51012, US:51014, US:51015, US:51016, US:51018, US:51019, US:51020, US:51022, US:51023, US:51024, US:51025, US:51026, US:51027, US:51028, US:51029, US:51030, US:51031, US:51033, US:51034, US:51035, US:51036, US:51037, US:51038, US:51039, US:51040, US:51041, US:51044, US:51045, US:51046, US:51047, US:51048, US:51049, US:51050, US:51051, US:51052, US:51053, US:51054, US:51055, US:51056, US:51058, US:51060, US:51061, US:51062, US:51063, US:51101, US:51102, US:51103, US:51104, US:51105, US:51106, US:51108, US:51109, US:51111, US:51201, US:51230, US:51231, US:51232, US:51234, US:51235, US:51237, US:51238, US:51239, US:51240, US:51241, US:51242, US:51243, US:51244, US:51245, US:51246, US:51247, US:51248, US:51249, US:51250, US:51301, US:51331, US:51333, US:51334, US:51338, US:51340, US:51341, US:51342, US:51343, US:51345, US:51346, US:51347, US:51350, US:51351, US:51354, US:51355, US:51357, US:51358, US:51360, US:51363, US:51364, US:51365, US:51366, US:51401, US:51430, US:51431, US:51432, US:51433, US:51436, US:51439, US:51440, US:51441, US:51442, US:51443, US:51444, US:51445, US:51446, US:51447, US:51448, US:51449, US:51450, US:51451, US:51452, US:51453, US:51454, US:51455, US:51458, US:51459, US:51460, US:51461, US:51462, US:51463, US:51465, US:51466, US:51467, US:51501, US:51503, US:51510, US:51520, US:51521, US:51523, US:51525, US:51526, US:51527, US:51528, US:51529, US:51530, US:51531, US:51532, US:51533, US:51534, US:51535, US:51536, US:51537, US:51540, US:51541, US:51542, US:51543, US:51544, US:51545, US:51546, US:51548, US:51549, US:51550, US:51551, US:51552, US:51553, US:51554, US:51555, US:51556, US:51557, US:51558, US:51559, US:51560, US:51561, US:51562, US:51563, US:51564, US:51565, US:51566, US:51570, US:51571, US:51572, US:51573, US:51575, US:51576, US:51577, US:51578, US:51579, US:51601, US:51630, US:51631, US:51632, US:51636, US:51637, US:51638, US:51639, US:51640, US:51645, US:51646, US:51647, US:51648, US:51649, US:51650, US:51651, US:51652, US:51653, US:51654, US:51656, US:52001, US:52002, US:52003, US:52030, US:52031, US:52032, US:52033, US:52035, US:52036, US:52037, US:52038, US:52039, US:52040, US:52041, US:52042, US:52043, US:52044, US:52045, US:52046, US:52047, US:52048, US:52049, US:52050, US:52052, US:52053, US:52054, US:52056, US:52057, US:52060, US:52064, US:52065, US:52066, US:52068, US:52069, US:52070, US:52071, US:52072, US:52073, US:52074, US:52075, US:52076, US:52077, US:52078, US:52079, US:52101, US:52132, US:52133, US:52134, US:52135, US:52136, US:52140, US:52141, US:52142, US:52144, US:52146, US:52147, US:52151, US:52154, US:52155, US:52156, US:52157, US:52158, US:52159, US:52160, US:52161, US:52162, US:52163, US:52164, US:52165, US:52166, US:52168, US:52169, US:52170, US:52171, US:52172, US:52175, US:52201, US:52202, US:52203, US:52205, US:52206, US:52207, US:52208, US:52209, US:52210, US:52211, US:52212, US:52213, US:52214, US:52215, US:52216, US:52217, US:52218, US:52219, US:52220, US:52221, US:52222, US:52223, US:52224, US:52225, US:52227, US:52228, US:52229, US:52231, US:52232, US:52233, US:52235, US:52236, US:52237, US:52240, US:52241, US:52242, US:52245, US:52246, US:52247, US:52248, US:52249, US:52251, US:52252, US:52253, US:52254, US:52255, US:52257, US:52301, US:52302, US:52305, US:52306, US:52307, US:52308, US:52309, US:52310, US:52312, US:52313, US:52314, US:52315, US:52316, US:52317, US:52318, US:52320, US:52321, US:52322, US:52323, US:52324, US:52325, US:52326, US:52327, US:52328, US:52329, US:52330, US:52332, US:52333, US:52334, US:52335, US:52336, US:52337, US:52338, US:52339, US:52340, US:52341, US:52342, US:52344, US:52345, US:52346, US:52347, US:52348, US:52349, US:52351, US:52352, US:52353, US:52354, US:52355, US:52356, US:52358, US:52359, US:52361, US:52362, US:52401, US:52402, US:52403, US:52404, US:52405, US:52411, US:52501, US:52530, US:52531, US:52533, US:52534, US:52535, US:52536, US:52537, US:52540, US:52542, US:52543, US:52544, US:52548, US:52549, US:52550, US:52551, US:52552, US:52553, US:52554, US:52555, US:52556, US:52557, US:52560, US:52561, US:52562, US:52563, US:52565, US:52566, US:52567, US:52568, US:52569, US:52570, US:52571, US:52572, US:52573, US:52574, US:52576, US:52577, US:52580, US:52581, US:52583, US:52584, US:52585, US:52586, US:52588, US:52590, US:52591, US:52593, US:52594, US:52595, US:52601, US:52619, US:52620, US:52621, US:52623, US:52624, US:52625, US:52626, US:52627, US:52630, US:52631, US:52632, US:52635, US:52637, US:52638, US:52639, US:52640, US:52641, US:52644, US:52645, US:52646, US:52647, US:52649, US:52650, US:52651, US:52652, US:52653, US:52654, US:52655, US:52656, US:52657, US:52658, US:52659, US:52660, US:52701, US:52720, US:52721, US:52727, US:52729, US:52730, US:52731, US:52732, US:52737, US:52738, US:52739, US:52742, US:52747, US:52749, US:52750, US:52751, US:52752, US:52754, US:52755, US:52757, US:52758, US:52759, US:52760, US:52761, US:52765, US:52766, US:52771, US:52772, US:52774, US:52776, US:52777, US:52778, US:52801';

    const rows: string[][] = [];

    // Define placement strings to avoid repetition
    const defaultPlacements =
      'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story';

    for (const location of locations) {
      for (const template of templates) {
        // Use hard-coded values from reference template instead of substitution
        const description = REFERENCE_AD_TEMPLATE.body;

        // Use location's landing page URL, template's landing page URL, or default fallback
        const landingPageUrl =
          location.landing_page_url ||
          this.substituteVariables(template.fields.landingPageUrl, location) ||
          'https://waxcenter.com'; // Default fallback

        // Generate dynamic names using campaign date
        const locationName = location.name.replace(/\s+/g, '');
        const campaignName = generateCampaignName(
          locationName,
          campaign.month,
          campaign.day
        );
        const adSetName = generateAdSetName(
          locationName,
          campaign.month,
          campaign.day
        );
        const adName = generateAdName(
          locationName,
          campaign.month,
          campaign.day
        );

        // Create readable row object
        const rowData = {
          // Campaign Fields
          campaignId: '',
          campaignName: campaignName,
          campaignStatus: 'ACTIVE',
          campaignObjective: 'Outcome Engagement',
          buyingType: 'AUCTION',
          campaignLifetimeBudget: campaign.budget.toString(),
          campaignBidStrategy: campaign.bidStrategy,
          campaignStartTime: formatCsvDate(campaign.startDate),
          campaignStopTime: formatCsvDate(campaign.endDate),
          newObjective: 'Yes',
          buyWithPrimeType: 'NONE',
          isBudgetSchedulingEnabledForCampaign: 'No',
          campaignHighDemandPeriods: '[]',
          buyWithIntegrationPartner: 'NONE',

          // Ad Set Fields
          adSetId: '',
          adSetRunStatus: 'ACTIVE',
          adSetLifetimeImpressions: '0',
          adSetName: adSetName,
          adSetTimeStart: formatCsvDate(campaign.startDate),
          adSetTimeStop: formatCsvDate(campaign.endDate),
          destinationType: 'UNDEFINED',
          useAcceleratedDelivery: 'No',
          isBudgetSchedulingEnabledForAdSet: 'No',
          adSetHighDemandPeriods: '[]',
          linkObjectId: 'o:108555182262',
          optimizedConversionTrackingPixels: 'tp:1035642271793092',
          optimizedEvent: 'SCHEDULE',
          link: landingPageUrl,
          addresses: `(${location.coordinates.lat.toFixed(3)}, ${location.coordinates.lng.toFixed(3)}) +${location.config?.radiusMiles || campaign.radius}mi`,
          locationTypes: 'home, recent',
          excludedRegions: 'Alaska US, Wyoming US',
          excludedZip: excludedZipCodes,
          gender: 'Women',
          ageMin: '18',
          ageMax: '54',
          excludedCustomAudiences:
            '120213927766160508:AUD-FBAllPriorServicedCustomers',
          flexibleInclusions: JSON.stringify(interestsData),
          targetingRelaxation: 'custom_audience: Off, lookalike: Off',
          brandSafetyInventoryFilteringLevels:
            'FACEBOOK_STANDARD, AN_STANDARD, FEED_RELAXED',
          optimizationGoal: 'OFFSITE_CONVERSIONS',
          attributionSpec: '[{"event_type":"CLICK_THROUGH","window_days":1}]',
          billingEvent: 'IMPRESSIONS',

          // Ad Fields
          adId: '',
          adStatus: 'ACTIVE',
          previewLink:
            'https://www.facebook.com/?feed_demo_ad=120228258706880508&h=AQCXa9GVq2c5YDX-hxc',
          instagramPreviewLink: 'https://www.instagram.com/p/DLShxy_sE-_/',
          adName: adName,
          dynamicCreativeAdFormat:
            REFERENCE_AD_TEMPLATE.dynamicCreativeAdFormat,
          title: REFERENCE_AD_TEMPLATE.title,
          titlePlacement: defaultPlacements,
          body: description,
          bodyPlacement: defaultPlacements,
          displayLink: 'waxcenter.com',
          linkPlacement: defaultPlacements,
          optimizeTextPerPerson: 'No',
          conversionTrackingPixels: 'tp:1035642271793092',
          imageHash: '303541819130038:d28e1dc58e7fcc7ac6d3e309eac2d3ad',
          videoThumbnailUrl:
            'https://scontent-dfw5-1.xx.fbcdn.net/v/t15.13418-10/467701760_926931896038122_8058283634477458555_n.jpg?stp=dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=ace027&_nc_oc=AdlRhXqk3kXyhfvnEB8Qa7Oe8kveKql6aq7ivD7J8C1oa6U_ViFu5l3ECSLnLDYj1YI&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=DprWR9RBxU4CVd-KxeA7MA&oh=00_AfPBEpbKMyhLvJjipyeZU_KeCjc8t-5S7HwTZ6zRx7Td_Q&oe=685FA2F2',
          imagePlacement: 'Default',
          additionalImage1Hash:
            '303541819130038:0642b7ec8b997de13d35e3760f43ee2e',
          additionalImage1Placement: 'audience_network classic',
          additionalImage2Hash: '',
          additionalImage2Placement: '',
          additionalImage3Hash: '',
          additionalImage3Placement: '',
          additionalImage4Hash: '',
          additionalImage4Placement: '',
          creativeType: 'Link Page Post Ad',
          urlTags:
            'utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&acadia_source=facebook&acadia_medium=cpc&utm_term={{adset.name}}&placement={{placement}}',
          videoId: REFERENCE_AD_TEMPLATE.videoId,
          videoPlacement: REFERENCE_AD_TEMPLATE.videoPlacement,
          additionalVideo1Id: REFERENCE_AD_TEMPLATE.additionalVideoId,
          additionalVideo1Placement:
            REFERENCE_AD_TEMPLATE.additionalVideoPlacement,
          additionalVideo1ThumbnailUrl:
            REFERENCE_AD_TEMPLATE.additionalVideoThumbnailUrl,
          instagramAccountId: 'x:602557576501192',
          callToAction: template.fields.callToAction,
          additionalCustomTrackingSpecs: '[]',
          videoRetargeting: 'No',
          permalink:
            'https://www.facebook.com/100067578193272/posts/pfbid02f9M3ZgPPTqtYjvm3MzhNwE4HVV1BUT4cmZEactPNPvgPUgCnFVYC4GQ6E5pAeCQl?dco_ad_id=120228258706880508',
          usePageAsActor: 'No',
          dynamicCreativeCallToAction: template.fields.callToAction,
          degreesOfFreedomType: 'USER_ENROLLED_AUTOFLOW',
        };

        // Convert object to array in the same order as headers
        const row = [
          rowData.campaignId,
          rowData.campaignName,
          rowData.campaignStatus,
          rowData.campaignObjective,
          rowData.buyingType,
          rowData.campaignLifetimeBudget,
          rowData.campaignBidStrategy,
          rowData.campaignStartTime,
          rowData.campaignStopTime,
          rowData.newObjective,
          rowData.buyWithPrimeType,
          rowData.isBudgetSchedulingEnabledForCampaign,
          rowData.campaignHighDemandPeriods,
          rowData.buyWithIntegrationPartner,
          rowData.adSetId,
          rowData.adSetRunStatus,
          rowData.adSetLifetimeImpressions,
          rowData.adSetName,
          rowData.adSetTimeStart,
          rowData.adSetTimeStop,
          rowData.destinationType,
          rowData.useAcceleratedDelivery,
          rowData.isBudgetSchedulingEnabledForAdSet,
          rowData.adSetHighDemandPeriods,
          rowData.linkObjectId,
          rowData.optimizedConversionTrackingPixels,
          rowData.optimizedEvent,
          rowData.link,
          rowData.addresses,
          rowData.locationTypes,
          rowData.excludedRegions,
          rowData.excludedZip,
          rowData.gender,
          rowData.ageMin,
          rowData.ageMax,
          rowData.excludedCustomAudiences,
          rowData.flexibleInclusions,
          rowData.targetingRelaxation,
          rowData.brandSafetyInventoryFilteringLevels,
          rowData.optimizationGoal,
          rowData.attributionSpec,
          rowData.billingEvent,
          rowData.adId,
          rowData.adStatus,
          rowData.previewLink,
          rowData.instagramPreviewLink,
          rowData.adName,
          rowData.dynamicCreativeAdFormat,
          rowData.title,
          rowData.titlePlacement,
          rowData.body,
          rowData.bodyPlacement,
          rowData.displayLink,
          rowData.linkPlacement,
          rowData.optimizeTextPerPerson,
          rowData.conversionTrackingPixels,
          rowData.imageHash,
          rowData.videoThumbnailUrl,
          rowData.imagePlacement,
          rowData.additionalImage1Hash,
          rowData.additionalImage1Placement,
          rowData.additionalImage2Hash,
          rowData.additionalImage2Placement,
          rowData.additionalImage3Hash,
          rowData.additionalImage3Placement,
          rowData.additionalImage4Hash,
          rowData.additionalImage4Placement,
          rowData.creativeType,
          rowData.urlTags,
          rowData.videoId,
          rowData.videoPlacement,
          rowData.additionalVideo1Id,
          rowData.additionalVideo1Placement,
          rowData.additionalVideo1ThumbnailUrl,
          rowData.instagramAccountId,
          rowData.callToAction,
          rowData.additionalCustomTrackingSpecs,
          rowData.videoRetargeting,
          rowData.permalink,
          rowData.usePageAsActor,
          rowData.dynamicCreativeCallToAction,
          rowData.degreesOfFreedomType,
        ];

        rows.push(row);
      }
    }

    // Use papaparse to properly escape all values, including JSON
    const csvOutput = Papa.unparse([headers, ...rows], {
      quotes: false, // Only quote fields that need it (contain commas, quotes, newlines, etc.)
      quoteChar: '"', // Use double quotes when quoting is needed
      escapeChar: '"', // Escape quotes by doubling them
    });

    console.log(
      '🔍 DEBUG: CSV generation complete. Total length:',
      csvOutput.length,
      'Lines:',
      csvOutput.split('\n').length
    );
    console.log('🔍 DEBUG: First 500 chars:', csvOutput.substring(0, 500));

    return csvOutput;
  }

  // Statistics endpoints
  async getGenerationStats(): Promise<
    ApiResponse<{
      totalLocations: number;
      totalTemplates: number;
      totalGenerations: number;
      averageProcessingTime: number;
    }>
  > {
    await delay(200);

    const completedJobs = Array.from(this.generationJobs.values()).filter(
      job => job.status === 'completed'
    );

    const totalGenerations = completedJobs.reduce(
      (sum, job) => sum + job.totalAds,
      0
    );
    const averageProcessingTime =
      completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            const processingTime =
              job.completedAt && job.createdAt
                ? new Date(job.completedAt).getTime() -
                  new Date(job.createdAt).getTime()
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
      },
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
  getGenerationStats,
} = mockApi;
