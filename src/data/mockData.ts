import type { Location, AdTemplate, GeneratedAd, GenerationJob, ObjectiveOption, CreateTemplateRequest, LocationSummary } from '../types';

// Cache for locations data
let locationsCache: LocationSummary[] | null = null;
let locationsLoadingPromise: Promise<LocationSummary[]> | null = null;

// Convert Location from JSON to LocationSummary for easier use in UI
export const convertToLocationSummary = (location: Location): LocationSummary => {
  return {
    id: location.id || '',
    name: location.name || 'Unknown Location',
    displayName: location.display_name || location.name || 'Unknown Location',
    city: location.address_info?.city || 'Unknown City',
    state: location.state?.short_name || 'Unknown State',
    zipCode: location.address_info?.zip_code || '',
    phoneNumber: location.contact_info?.phone_1?.display_number || 'No phone available',
    address: `${location.address_info?.address_1 || 'Unknown Address'}${location.address_info?.address_2 ? ', ' + location.address_info.address_2 : ''}, ${location.address_info?.city || 'Unknown City'}, ${location.state?.short_name || 'Unknown State'} ${location.address_info?.zip_code || ''}`,
    coordinates: {
      lat: location.location?.latitude || 0,
      lng: location.location?.longitude || 0,
    },
    locationPrime: location.code || 'UNKNOWN', // Using code as locationPrime for radius calculation
  };
};

// Load real locations from JSON file using fetch
export const loadLocationsFromJson = async (): Promise<LocationSummary[]> => {
  // Return cached data if available
  if (locationsCache) {
    console.log('🔍 DEBUG: Returning cached locations');
    return locationsCache;
  }

  // Return existing loading promise if already loading
  if (locationsLoadingPromise) {
    console.log('🔍 DEBUG: Returning existing loading promise');
    return locationsLoadingPromise;
  }

  // Start loading
  locationsLoadingPromise = (async () => {
    try {
      console.log('🔍 DEBUG: Fetching locations from JSON file...');
      const response = await fetch('/locations.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { data: Location[] };
      console.log('🔍 DEBUG: Fetched locations data:', data);
      console.log('🔍 DEBUG: typeof data:', typeof data);
      console.log('🔍 DEBUG: data keys:', Object.keys(data || {}));
      
      // More defensive checks
      if (!data) {
        console.error('❌ Fetched data is null/undefined');
        return getMockLocations(); // Fallback to mock data
      }
      
      console.log('🔍 DEBUG: data.data exists:', !!data.data);
      
      const locations = data.data;
      console.log('🔍 DEBUG: Raw locations count:', locations ? locations.length : 0);
      
      if (!locations || !Array.isArray(locations)) {
        console.error('❌ locations is not an array:', locations);
        return getMockLocations(); // Fallback to mock data
      }
      
      if (locations.length === 0) {
        console.warn('⚠️ locations array is empty');
        return getMockLocations(); // Fallback to mock data
      }
      
      const filtered = locations
        .filter((location: Location) => location.code !== 'CORP') // Filter out corporate location
        .map(convertToLocationSummary)
        .sort((a: LocationSummary, b: LocationSummary) => a.name.localeCompare(b.name));
      
      console.log('🔍 DEBUG: Filtered locations count:', filtered.length);
      console.log('🔍 DEBUG: First few locations:', filtered.slice(0, 3).map(l => l.name));
      
      // Cache the result
      locationsCache = filtered;
      return filtered;
    } catch (error) {
      console.error('❌ Failed to load locations from JSON:', error);
      const fallbackLocations = getMockLocations(); // Fallback to mock data
      locationsCache = fallbackLocations;
      return fallbackLocations;
    }
  })();

  return locationsLoadingPromise;
};

// Fallback mock locations in case JSON loading fails
const getMockLocations = (): LocationSummary[] => {
  console.log('🔍 DEBUG: Using fallback mock locations');
  return [
    {
      id: 'loc_1',
      name: 'European Wax Center - Beverly Hills',
      displayName: 'Beverly Hills',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90210',
      phoneNumber: '(310) 555-0123',
      address: '9876 Rodeo Drive, Beverly Hills, CA 90210',
      coordinates: { lat: 34.0736, lng: -118.4004 },
      locationPrime: 'BEVH'
    },
    {
      id: 'loc_2',
      name: 'European Wax Center - Manhattan',
      displayName: 'Manhattan',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phoneNumber: '(212) 555-0124',
      address: '123 Broadway, New York, NY 10001',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      locationPrime: 'MANH'
    },
    {
      id: 'loc_3',
      name: 'European Wax Center - Miami Beach',
      displayName: 'Miami Beach',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      phoneNumber: '(305) 555-0125',
      address: '456 Ocean Drive, Miami Beach, FL 33139',
      coordinates: { lat: 25.7907, lng: -80.1300 },
      locationPrime: 'MIAM'
    },
    {
      id: 'loc_4',
      name: 'European Wax Center - Austin',
      displayName: 'Austin',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      phoneNumber: '(512) 555-0126',
      address: '789 Congress Avenue, Austin, TX 78701',
      coordinates: { lat: 30.2672, lng: -97.7431 },
      locationPrime: 'AUST'
    },
    {
      id: 'loc_5',
      name: 'European Wax Center - Seattle',
      displayName: 'Seattle',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      phoneNumber: '(206) 555-0127',
      address: '321 Pike Street, Seattle, WA 98101',
      coordinates: { lat: 47.6062, lng: -122.3321 },
      locationPrime: 'SEAT'
    }
  ];
};

// Get all locations
export const getAllLocations = async (): Promise<LocationSummary[]> => {
  return await loadLocationsFromJson();
};

// Predefined campaign objectives
export const defaultObjectives: ObjectiveOption[] = [
  { id: 'engagement', label: 'Engagement', value: 'Engagement' },
  { id: 'traffic', label: 'Traffic', value: 'Traffic' },
  { id: 'conversions', label: 'Conversions', value: 'Conversions' },
  { id: 'brand_awareness', label: 'Brand Awareness', value: 'Brand Awareness' },
  { id: 'reach', label: 'Reach', value: 'Reach' },
  { id: 'video_views', label: 'Video Views', value: 'Video Views' },
  { id: 'lead_generation', label: 'Lead Generation', value: 'Lead Generation' },
  { id: 'messages', label: 'Messages', value: 'Messages' },
  { id: 'app_installs', label: 'App Installs', value: 'App Installs' },
  { id: 'store_visits', label: 'Store Visits', value: 'Store Visits' }
];

// Template storage (simulating persistent storage)
const customTemplates: AdTemplate[] = [];
let templateIdCounter = 5; // Start after built-in templates

// Generate mock ad templates
export const generateMockTemplates = (): AdTemplate[] => {
  const builtInTemplates: AdTemplate[] = [
    {
      id: 'template_1',
      name: 'Promotional Offer Template',
      type: 'template_1',
      fields: {
        headline: 'Special Offer at {{location.name}}!',
        description: 'Visit our {{location.city}} location for exclusive deals and amazing service. Call {{location.phone}} to learn more!',
        callToAction: 'Visit Us Today',
        imageUrl: '/images/template1-hero.jpg',
        landingPageUrl: 'https://example.com/{{location.id}}/promo',
      },
      variables: [
        {
          name: 'location.name',
          type: 'location_field',
          defaultValue: 'Our Store',
          required: true,
          description: 'Location name',
        },
        {
          name: 'location.city',
          type: 'location_field',
          defaultValue: 'Your City',
          required: true,
          description: 'City name',
        },
        {
          name: 'location.phone',
          type: 'location_field',
          defaultValue: '(555) 123-4567',
          required: true,
          description: 'Phone number',
        },
      ],
      isActive: true,
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'template_2',
      name: 'Service Announcement Template',
      type: 'template_2',
      fields: {
        headline: 'Now Serving {{location.city}}!',
        description: 'We\'re excited to announce our new services in {{location.city}}, {{location.state}}. Located at {{location.address}}, we\'re here to help!',
        callToAction: 'Learn More',
        imageUrl: '/images/template2-hero.jpg',
        landingPageUrl: 'https://example.com/{{location.id}}/services',
      },
      variables: [
        {
          name: 'location.city',
          type: 'location_field',
          defaultValue: 'Your City',
          required: true,
          description: 'City name',
        },
        {
          name: 'location.state',
          type: 'location_field',
          defaultValue: 'Your State',
          required: true,
          description: 'State name',
        },
        {
          name: 'location.address',
          type: 'location_field',
          defaultValue: '123 Main St',
          required: true,
          description: 'Full address',
        },
      ],
      isActive: true,
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'template_3',
      name: 'Grand Opening Template',
      type: 'template_3',
      fields: {
        headline: 'Grand Opening in {{location.city}}!',
        description: 'Join us for the grand opening of our newest location in {{location.city}}, {{location.state}}! Special offers available.',
        callToAction: 'Join the Celebration',
        imageUrl: '/images/template3-hero.jpg',
        landingPageUrl: 'https://example.com/{{location.id}}/grand-opening',
      },
      variables: [
        {
          name: 'location.city',
          type: 'location_field',
          defaultValue: 'Your City',
          required: true,
          description: 'City name',
        },
        {
          name: 'location.state',
          type: 'location_field',
          defaultValue: 'Your State',
          required: true,
          description: 'State name',
        },
      ],
      isActive: true,
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'template_4',
      name: 'Contact Information Template',
      type: 'template_4',
      fields: {
        headline: 'Find Us in {{location.city}}',
        description: 'Visit us at {{location.address}} or call {{location.phone}}. We\'re here to serve the {{location.city}} community!',
        callToAction: 'Get Directions',
        imageUrl: '/images/template4-hero.jpg',
        landingPageUrl: 'https://example.com/{{location.id}}/contact',
      },
      variables: [
        {
          name: 'location.city',
          type: 'location_field',
          defaultValue: 'Your City',
          required: true,
          description: 'City name',
        },
        {
          name: 'location.address',
          type: 'location_field',
          defaultValue: '123 Main St',
          required: true,
          description: 'Full address',
        },
        {
          name: 'location.phone',
          type: 'location_field',
          defaultValue: '(555) 123-4567',
          required: true,
          description: 'Phone number',
        },
      ],
      isActive: true,
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Return built-in templates + custom templates
  return [...builtInTemplates, ...customTemplates];
};

// Template creation function
export const createTemplate = (templateData: CreateTemplateRequest): AdTemplate => {
  const newTemplate: AdTemplate = {
    id: `template_${templateIdCounter++}`,
    name: templateData.name,
    type: 'custom',
    fields: { ...templateData.fields },
    variables: [...templateData.variables],
    isActive: true,
    isCustom: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  customTemplates.push(newTemplate);
  return newTemplate;
};

// Get all templates (built-in + custom)
export const getAllTemplates = (): AdTemplate[] => {
  return generateMockTemplates();
};

// Delete custom template
export const deleteTemplate = (templateId: string): boolean => {
  const index = customTemplates.findIndex(t => t.id === templateId);
  if (index > -1) {
    customTemplates.splice(index, 1);
    return true;
  }
  return false;
};

// Generate mock generated ads
export const generateMockGeneratedAds = (locations: LocationSummary[], templates: AdTemplate[]): GeneratedAd[] => {
  const ads: GeneratedAd[] = [];
  const batchId = `batch_${Date.now()}`;
  
  locations.forEach(location => {
    templates.forEach(template => {
      const ad: GeneratedAd = {
        id: `ad_${location.id}_${template.id}`,
        locationId: location.id,
        templateId: template.id,
        generatedFields: {
          headline: substituteVariables(template.fields.headline, location),
          description: substituteVariables(template.fields.description, location),
          callToAction: template.fields.callToAction,
          imageUrl: template.fields.imageUrl,
          landingPageUrl: substituteVariables(template.fields.landingPageUrl, location),
        },
        metadata: {
          createdAt: new Date().toISOString(),
          batchId,
          locationName: location.name,
          templateName: template.name,
        },
      };
      ads.push(ad);
    });
  });
  
  return ads;
};



function substituteVariables(template: string, location: LocationSummary): string {
  return template
    .replace(/\{\{location\.name\}\}/g, location.name)
    .replace(/\{\{location\.city\}\}/g, location.city)
    .replace(/\{\{location\.state\}\}/g, location.state)
    .replace(/\{\{location\.address\}\}/g, location.address)
    .replace(/\{\{location\.phone\}\}/g, location.phoneNumber)
    .replace(/\{\{location\.id\}\}/g, location.id);
}

// Generate mock generation job
export const generateMockGenerationJob = (
  locationIds: string[],
  templateIds: string[]
): GenerationJob => {
  const totalAds = locationIds.length * templateIds.length;
  const estimatedTime = Math.ceil(totalAds / 100) * 10; // 10 seconds per 100 ads
  
  return {
    id: `job_${Date.now()}`,
    status: 'pending',
    locationIds,
    templateIds,
    totalAds,
    processedAds: 0,
    options: {
      format: 'csv',
      includeHeaders: true,
      customFields: ['phoneNumber', 'address'],
      fileName: `ad_generation_${new Date().toISOString().split('T')[0]}.csv`,
      campaign: {
        prefix: 'EWC',
        platform: 'Meta',
        selectedDate: new Date('2025-06-25'),
        month: 'June',
        day: '25',
        objective: 'Engagement',
        testType: 'LocalTest',
        duration: 'Evergreen',
        budget: 92.69,
        bidStrategy: 'Highest volume or value',
        startDate: '06/26/2025 2:32:00 am',
        endDate: '07/26/2025 11:59:00 pm',
        ads: [],
        radius: 5
      }
    },
    createdAt: new Date().toISOString(),
    estimatedTime,
  };
};

// Initialize with fallback data, then load real data asynchronously
// eslint-disable-next-line prefer-const
export let mockLocations: LocationSummary[] = [];

// Initialize locations
const initializeLocations = async () => {
  try {
    // Start with fallback data
    mockLocations.push(...getMockLocations());
    console.log('🔍 DEBUG: Initialized with fallback locations:', mockLocations.length);
    
    // Load real locations and update
    const realLocations = await loadLocationsFromJson();
    mockLocations.length = 0; // Clear array
    mockLocations.push(...realLocations); // Add real locations
    console.log('✅ Updated mockLocations with real data:', mockLocations.length, 'locations');
  } catch (error) {
    console.error('❌ Failed to load real locations, keeping fallback data:', error);
  }
};

// Start initialization
initializeLocations();
console.log('🔍 DEBUG: mockLocations loaded, count:', mockLocations.length);
export const mockTemplates = generateMockTemplates();
export const mockGeneratedAds = generateMockGeneratedAds(mockLocations.slice(0, 10), mockTemplates);

// Export filtered data functions
export const getLocationsByState = (state: string): LocationSummary[] => {
  return mockLocations.filter(location => location.state === state);
};

export const getLocationsByCity = (city: string): LocationSummary[] => {
  return mockLocations.filter(location => location.city === city);
};

export const searchLocations = (query: string): LocationSummary[] => {
  const searchTerm = query.toLowerCase();
  return mockLocations.filter(location => 
    location.name.toLowerCase().includes(searchTerm) ||
    location.city.toLowerCase().includes(searchTerm) ||
    location.state.toLowerCase().includes(searchTerm) ||
    location.zipCode.includes(searchTerm)
  );
};

export const getUniqueStates = (): string[] => {
  return [...new Set(mockLocations.map(location => location.state))].sort();
};

export const getUniqueCities = (): string[] => {
  return [...new Set(mockLocations.map(location => location.city))].sort();
};

export const getLocationStats = () => {
  return {
    totalLocations: mockLocations.length,
    totalStates: getUniqueStates().length,
    totalCities: getUniqueCities().length,
    averageLocationsPerState: Math.round(mockLocations.length / getUniqueStates().length),
  };
}; 