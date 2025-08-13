#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || 'https://bzqsimgfwgmmhtgpluaz.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cXNpbWdmd2dtbWh0Z3BsdWF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc3NDA3MiwiZXhwIjoyMDY4MzUwMDcyfQ.2bPQgtfo8AzwobM1FzogRnW0BZCnTDx3V5rwwpulitg';

if (
  !supabaseUrl ||
  !supabaseServiceKey ||
  supabaseUrl === 'your-supabase-url'
) {
  console.error(
    '❌ Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Location {
  id: string;
  code: string;
  name: string;
  display_name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  additional_info?: {
    landing_page?: string;
    landing_page_url?: string;
    [key: string]: unknown;
  };
}

async function getAllLocations(): Promise<Location[]> {
  console.log('📍 Fetching all locations...');

  const { data, error } = await supabase
    .from('locations')
    .select('id, code, name, display_name, location, additional_info')
    .neq('code', 'CORP'); // Exclude corporate location

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }

  console.log(`✅ Found ${data?.length || 0} locations`);
  return data || [];
}

async function getExistingConfigs(): Promise<Set<string>> {
  console.log('🔍 Checking existing location configs...');

  const { data, error } = await supabase
    .from('location_configs')
    .select('location_id')
    .is('user_id', null); // Only global configs

  if (error) {
    throw new Error(`Failed to fetch existing configs: ${error.message}`);
  }

  const existingLocationIds = new Set(
    data?.map(config => config.location_id) || []
  );
  console.log(`✅ Found ${existingLocationIds.size} existing configurations`);
  return existingLocationIds;
}

function extractLandingPageUrl(location: Location): string | null {
  if (!location.additional_info) return null;

  // Check various possible landing page field names
  const possibleFields = [
    'landing_page',
    'landing_page_url',
    'landingPage',
    'landingPageUrl',
    'website',
    'url',
    'page_url',
  ];

  for (const field of possibleFields) {
    const value = location.additional_info[field];
    if (value && typeof value === 'string' && value.trim()) {
      // Ensure it's a valid URL format
      if (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('www.')
      ) {
        return value.trim();
      }
    }
  }

  return null;
}

async function createLocationConfig(location: Location): Promise<void> {
  const landingPageUrl = extractLandingPageUrl(location);

  const configData = {
    location_id: location.id,
    user_id: null, // Global config
    budget: null,
    custom_settings: null,
    notes: `Auto-generated configuration for ${location.display_name}`,
    primary_lat: location.location.latitude,
    primary_lng: location.location.longitude,
    radius_miles: 5, // Default 5-mile radius
    coordinate_list: null, // No additional coordinates initially
    landing_page_url: landingPageUrl,
    is_active: true,
  };

  const { error } = await supabase.from('location_configs').insert(configData);

  if (error) {
    throw new Error(
      `Failed to create config for ${location.name}: ${error.message}`
    );
  }

  console.log(
    `✅ Created config for ${location.name} (${location.location.latitude.toFixed(4)}, ${location.location.longitude.toFixed(4)}, 5mi)${landingPageUrl ? ` with landing page: ${landingPageUrl}` : ''}`
  );
}

async function populateLocationConfigs(): Promise<void> {
  console.log('🚀 Starting location config population...\n');

  try {
    // Get all locations and existing configs
    const [locations, existingConfigLocationIds] = await Promise.all([
      getAllLocations(),
      getExistingConfigs(),
    ]);

    // Filter out locations that already have configs
    const locationsNeedingConfigs = locations.filter(
      location => !existingConfigLocationIds.has(location.id)
    );

    console.log(`\n📊 Summary:`);
    console.log(`   Total locations: ${locations.length}`);
    console.log(`   Already configured: ${existingConfigLocationIds.size}`);
    console.log(`   Need configuration: ${locationsNeedingConfigs.length}\n`);

    if (locationsNeedingConfigs.length === 0) {
      console.log('🎉 All locations already have configurations!');
      return;
    }

    console.log('📝 Creating configurations...\n');

    // Create configs for locations that need them
    let successCount = 0;
    let errorCount = 0;

    for (const location of locationsNeedingConfigs) {
      try {
        await createLocationConfig(location);
        successCount++;
      } catch (error) {
        console.error(`❌ Error creating config for ${location.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎯 Population Complete:`);
    console.log(`   ✅ Successfully created: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(
      `   📍 Total configs now: ${existingConfigLocationIds.size + successCount}`
    );

    if (successCount > 0) {
      console.log('\n🔄 Recommendations:');
      console.log(
        '   1. Review and adjust individual location settings as needed'
      );
      console.log('   2. Set custom budgets for each location');
      console.log(
        '   3. Add additional targeting coordinates where appropriate'
      );
      console.log(
        '   4. Update landing page URLs if auto-detection missed any'
      );
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  populateLocationConfigs()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { populateLocationConfigs };
