import fs from 'fs';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

import type { Location } from '../src/types';

// Load environment variables
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || 'your_supabase_project_url';
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

console.log('supabaseUrl', supabaseUrl);
console.log('supabaseKey', supabaseKey);

if (
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl === 'your_supabase_project_url'
) {
  console.error(
    'Please configure your Supabase credentials in .env.local file'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateLocations() {
  try {
    console.log('🔄 Starting location migration...');

    // Read the locations.json file
    const locationsPath = path.join(
      __dirname,
      '..',
      'public',
      'locations.json'
    );

    if (!fs.existsSync(locationsPath)) {
      console.error('❌ locations.json file not found at:', locationsPath);
      process.exit(1);
    }

    console.log('📂 Reading locations.json...');
    const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

    if (
      !locationsData ||
      !locationsData.data ||
      !Array.isArray(locationsData.data)
    ) {
      console.error(
        '❌ Invalid locations.json format. Expected { data: Location[] }'
      );
      process.exit(1);
    }

    const locations: Location[] = locationsData.data;
    console.log(`📊 Found ${locations.length} locations to migrate`);

    // Filter out corporate location
    const validLocations = locations.filter(
      location => location.code !== 'CORP'
    );
    console.log(
      `✅ ${validLocations.length} valid locations (filtered out corporate)`
    );

    // Check if locations already exist
    const { data: existingLocations, error: checkError } = await supabase
      .from('locations')
      .select('code')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing locations:', checkError);
      process.exit(1);
    }

    if (existingLocations && existingLocations.length > 0) {
      console.log(
        '⚠️  Locations table already contains data. Skipping migration.'
      );
      console.log(
        '   To force re-migration, please truncate the locations table first.'
      );
      return;
    }

    // Insert locations in batches
    const batchSize = 100;
    const totalBatches = Math.ceil(validLocations.length / batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, validLocations.length);
      const batch = validLocations.slice(start, end);

      console.log(
        `📤 Inserting batch ${i + 1}/${totalBatches} (${batch.length} locations)...`
      );

      const { error: insertError } = await supabase
        .from('locations')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${i + 1}:`, insertError);
        process.exit(1);
      }

      console.log(`✅ Batch ${i + 1}/${totalBatches} completed`);
    }

    // Verify migration
    const { data: migratedLocations, error: verifyError } = await supabase
      .from('locations')
      .select('id, code, name')
      .limit(5);

    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError);
      process.exit(1);
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Total locations migrated: ${validLocations.length}`);
    console.log('🔍 Sample migrated locations:');
    migratedLocations?.forEach((loc, index) => {
      console.log(`   ${index + 1}. ${loc.name} (${loc.code})`);
    });

    console.log('\n📝 Next steps:');
    console.log(
      '   1. Update your .env.local file with your actual Supabase credentials'
    );
    console.log('   2. Run the application to test the Supabase integration');
    console.log('   3. The old locations.json file can be archived or removed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateLocations();
}

export { migrateLocations };
