import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function createDefaultCenter(location: any) {
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

function main() {
  try {
    console.log('Creating test Minneapolis Wax Group JSON structure...');
    
    // Create centers for all target locations
    const centers = TARGET_LOCATIONS.map(createDefaultCenter);
    
    // Create the final JSON structure
    const outputData = {
      centers: centers
    };

    // Write to file
    const outputPath = path.join(__dirname, '..', 'public', 'minneapolis_wax_group_test.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    console.log(`✓ Successfully created ${outputPath} with ${centers.length} centers`);
    console.log('Centers included:');
    centers.forEach(center => {
      console.log(`  - ${center.display_name} (${center.code})`);
    });
    
    console.log('\n📁 File created successfully!');
    console.log('📋 This is a test structure - use the main script with your Zenoti API key for real data.');

  } catch (error) {
    console.error('Error creating test structure:', error);
    process.exit(1);
  }
}

// Run the script
main();
