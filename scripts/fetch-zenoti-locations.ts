import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zenoti API configuration
const ZENOTI_API_BASE_URL = 'https://api.zenoti.com/v1';
const ZENOTI_API_KEY = process.env.ZENOTI_API_KEY; // Set this in your environment

// Target locations from the user's selection
const TARGET_LOCATIONS = [
  {
    name: "Minneapolis - Lakes",
    code: "0123",
    city: "Minneapolis",
    state: "MN",
    coordinates: { lat: 44.94934, lng: -93.320789 },
    radius: "3 mi",
    notes: "",
    url: "https://locations.waxcenter.com/mn/minneapolis/minneapolis-lakes-0123.html"
  },
  {
    name: "Minnetonka",
    code: "0236",
    city: "Minnetonka",
    state: "MN",
    coordinates: { lat: 44.964794, lng: -93.44349 },
    radius: "3 mi",
    notes: "This is a mix of radius and zip code targeting.",
    url: "https://locations.waxcenter.com/mn/minnetonka/minnetonka-0236.html"
  },
  {
    name: "St. Paul - Grand Avenue",
    code: "0473",
    city: "St. Paul",
    state: "MN",
    coordinates: { lat: 44.940366, lng: -93.144397 },
    radius: "3 mi",
    notes: "This is a mix of radius and zip code targeting.",
    url: "https://locations.waxcenter.com/mn/st-paul/st.-paul-grand-avenue-0473.html"
  },
  {
    name: "Blaine",
    code: "0535",
    city: "Blaine",
    state: "MN",
    coordinates: { lat: 45.160371, lng: -93.233505 },
    radius: "3 mi",
    notes: "This is a mix of radius and zip code targeting.",
    url: "https://locations.waxcenter.com/mn/blaine/blaine-0535.html"
  }
];

interface ZenotiCenter {
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
    address_2: string;
    city: string;
    zip_code: string;
  };
  settings: any;
  contact_info: {
    phone_1: {
      country_id: number;
      number: string;
      display_number: string;
    };
    phone_2: any;
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
  additional_info: {
    service_tax_no: any;
    tin: any;
    vat: any;
    cst: any;
    can_book: boolean;
    collect_feedback: any;
    services_available: boolean;
    available_services: any;
    unavailable_services: any;
    categories_available: boolean;
    available_categories: any;
    unavailable_categories: any;
    is_add_ons_available: boolean;
    feedback_link: any;
    feedback_label: any;
    is_global_tokenization_supported: boolean;
    is_auto_pay_enabled_at_center: boolean;
    cancellation_fee_duration: number;
    is_center_amenities_enabled: boolean;
    center_amenities: string;
  };
  culture_code_at_center: string;
  is_fbe_enabled: boolean;
  is_hc_call_center: boolean;
  landing_page_url: string;
}

interface ZenotiResponse {
  centers: ZenotiCenter[];
}

async function fetchZenotiCenters(): Promise<ZenotiCenter[]> {
  if (!ZENOTI_API_KEY) {
    throw new Error('ZENOTI_API_KEY environment variable is required');
  }

  const centers: ZenotiCenter[] = [];

  for (const location of TARGET_LOCATIONS) {
    try {
      console.log(`Fetching data for ${location.name}...`);
      
      // Search for centers by location coordinates or name
      const searchParams = new URLSearchParams({
        latitude: location.coordinates.lat.toString(),
        longitude: location.coordinates.lng.toString(),
        radius: '50', // Search within 50 miles
        limit: '10'
      });

      const response = await fetch(`${ZENOTI_API_BASE_URL}/centers/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${ZENOTI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ZenotiResponse = await response.json();
      
      if (data.centers && data.centers.length > 0) {
        // Find the best match based on name similarity and location
        const bestMatch = findBestMatch(data.centers, location);
        if (bestMatch) {
          centers.push(bestMatch);
          console.log(`✓ Found match for ${location.name}`);
        } else {
          console.log(`✗ No good match found for ${location.name}`);
        }
      } else {
        console.log(`✗ No centers found for ${location.name}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error fetching data for ${location.name}:`, error);
    }
  }

  return centers;
}

function findBestMatch(centers: ZenotiCenter[], targetLocation: any): ZenotiCenter | null {
  // Simple matching logic - you might want to improve this based on your needs
  return centers.find(center => 
    center.name.toLowerCase().includes(targetLocation.city.toLowerCase()) ||
    center.code === targetLocation.code ||
    center.display_name.toLowerCase().includes(targetLocation.city.toLowerCase())
  ) || null;
}

function createDefaultCenter(location: any): ZenotiCenter {
  // Create a default center structure when API data is not available
  return {
    id: `default-${location.code}`,
    code: location.code,
    name: `${location.name} - ${location.code}`,
    display_name: location.name,
    description: "",
    online_booking_start_date: "2025-01-01T00:00:00",
    enable_parallel_services_at_center: true,
    country: {
      id: 225,
      code: "US",
      name: "United States",
      phone_code: 1,
      nationality: "American"
    },
    state: {
      id: 67, // Minnesota
      code: "US27",
      name: "Minnesota",
      short_name: "MN"
    },
    location: {
      lattitude: location.coordinates.lat,
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
      time_zone: {
        id: 15,
        name: "(UTC-06:00) Central Time (US & Canada)",
        standard_name: "Central Standard Time",
        symbol: "Central Standard Time"
      }
    },
    currency: {
      id: 148,
      name: "United States Dollar",
      code: "USD",
      symbol: "0024"
    },
    address_info: {
      address_1: `Location in ${location.city}`,
      address_2: "",
      city: location.city,
      zip_code: "00000"
    },
    settings: null,
    contact_info: {
      phone_1: {
        country_id: 225,
        number: "0000000000",
        display_number: "(000) 000-0000"
      },
      phone_2: null,
      email: ""
    },
    working_hours: [
      {
        day_of_week: "Monday",
        start_time: "800",
        end_time: "2000",
        offline_start_time: "800",
        offline_end_time: "2000",
        off_peak_start_time: "800",
        off_peak_end_time: "2000",
        is_closed: false
      },
      {
        day_of_week: "Tuesday",
        start_time: "800",
        end_time: "2000",
        offline_start_time: "800",
        offline_end_time: "2000",
        off_peak_start_time: "800",
        off_peak_end_time: "2000",
        is_closed: false
      },
      {
        day_of_week: "Wednesday",
        start_time: "800",
        end_time: "2000",
        offline_start_time: "800",
        offline_end_time: "2000",
        off_peak_start_time: "800",
        off_peak_end_time: "2000",
        is_closed: false
      },
      {
        day_of_week: "Thursday",
        start_time: "800",
        end_time: "2000",
        offline_start_time: "800",
        offline_end_time: "2000",
        off_peak_start_time: "800",
        off_peak_end_time: "2000",
        is_closed: false
      },
      {
        day_of_week: "Friday",
        start_time: "800",
        end_time: "2000",
        offline_start_time: "800",
        offline_end_time: "2000",
        off_peak_start_time: "800",
        off_peak_end_time: "2000",
        is_closed: false
      },
      {
        day_of_week: "Saturday",
        start_time: "800",
        end_time: "1800",
        offline_start_time: "800",
        offline_end_time: "1800",
        off_peak_start_time: "800",
        off_peak_end_time: "1800",
        is_closed: false
      },
      {
        day_of_week: "Sunday",
        start_time: "800",
        end_time: "1800",
        offline_start_time: "800",
        offline_end_time: "1800",
        off_peak_start_time: "800",
        off_peak_end_time: "1800",
        is_closed: false
      }
    ],
    additional_info: {
      service_tax_no: null,
      tin: null,
      vat: null,
      cst: null,
      can_book: false,
      collect_feedback: null,
      services_available: false,
      available_services: null,
      unavailable_services: null,
      categories_available: false,
      available_categories: null,
      unavailable_categories: null,
      is_add_ons_available: false,
      feedback_link: null,
      feedback_label: null,
      is_global_tokenization_supported: false,
      is_auto_pay_enabled_at_center: false,
      cancellation_fee_duration: -1,
      is_center_amenities_enabled: false,
      center_amenities: "{\"centerAmenitiesSection\":[],\"order\":[]}"
    },
    culture_code_at_center: "en-US",
    is_fbe_enabled: false,
    is_hc_call_center: false,
    landing_page_url: location.url
  };
}

async function main() {
  try {
    console.log('Starting Zenoti API data fetch...');
    
    // Try to fetch from API first
    let centers: ZenotiCenter[] = [];
    try {
      centers = await fetchZenotiCenters();
      console.log(`Successfully fetched ${centers.length} centers from Zenoti API`);
    } catch (error) {
      console.log('Failed to fetch from Zenoti API, creating default centers...');
      centers = TARGET_LOCATIONS.map(createDefaultCenter);
    }

    // Ensure we have all target locations
    const existingCodes = centers.map(c => c.code);
    const missingLocations = TARGET_LOCATIONS.filter(l => !existingCodes.includes(l.code));
    
    for (const missingLocation of missingLocations) {
      centers.push(createDefaultCenter(missingLocation));
    }

    // Create the final JSON structure
    const outputData = {
      centers: centers
    };

    // Write to file
    const outputPath = path.join(__dirname, '..', 'public', 'minneapolis_wax_group.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    console.log(`✓ Successfully created ${outputPath} with ${centers.length} centers`);
    console.log('Centers included:');
    centers.forEach(center => {
      console.log(`  - ${center.display_name} (${center.code})`);
    });

  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the script
main();

export { fetchZenotiCenters, createDefaultCenter };
