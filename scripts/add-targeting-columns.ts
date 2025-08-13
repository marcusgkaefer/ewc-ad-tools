#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || 'https://bzqsimgfwgmmhtgpluaz.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cXNpbWdmd2dtbWh0Z3BsdWF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc3NDA3MiwiZXhwIjoyMDY4MzUwMDcyfQ.2bPQgtfo8AzwobM1FzogRnW0BZCnTDx3V5rwwpulitg';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTargetingColumns(): Promise<void> {
  console.log(
    '🔧 Adding missing targeting columns to location_configs table...\n'
  );

  try {
    // Add the missing columns using raw SQL
    const migrationSQL = `
      -- Add targeting fields to location_configs table
      ALTER TABLE location_configs 
      ADD COLUMN IF NOT EXISTS primary_lat DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS primary_lng DECIMAL(11, 8),
      ADD COLUMN IF NOT EXISTS radius_miles DECIMAL(6, 2),
      ADD COLUMN IF NOT EXISTS coordinate_list JSONB,
      ADD COLUMN IF NOT EXISTS landing_page_url TEXT;
    `;

    console.log('📝 Executing migration SQL...');
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (migrationError) {
      // If the RPC doesn't exist, try using a direct query approach
      console.log(
        '⚠️  RPC method not available, trying alternative approach...'
      );

      // Try each column addition separately
      const columns = [
        'ALTER TABLE location_configs ADD COLUMN IF NOT EXISTS primary_lat DECIMAL(10, 8)',
        'ALTER TABLE location_configs ADD COLUMN IF NOT EXISTS primary_lng DECIMAL(11, 8)',
        'ALTER TABLE location_configs ADD COLUMN IF NOT EXISTS radius_miles DECIMAL(6, 2)',
        'ALTER TABLE location_configs ADD COLUMN IF NOT EXISTS coordinate_list JSONB',
        'ALTER TABLE location_configs ADD COLUMN IF NOT EXISTS landing_page_url TEXT',
      ];

      for (const columnSQL of columns) {
        console.log(
          `   Adding column: ${columnSQL.split('ADD COLUMN IF NOT EXISTS ')[1]}`
        );
        // We'll need to use a different approach since Supabase client doesn't allow raw DDL
      }

      console.log(
        '❌ Unable to execute DDL statements through Supabase client.'
      );
      console.log(
        '\n📋 Please run the following SQL manually in your Supabase SQL Editor:'
      );
      console.log('');
      console.log('-- Add targeting fields to location_configs table');
      console.log('ALTER TABLE location_configs');
      console.log('ADD COLUMN IF NOT EXISTS primary_lat DECIMAL(10, 8),');
      console.log('ADD COLUMN IF NOT EXISTS primary_lng DECIMAL(11, 8),');
      console.log('ADD COLUMN IF NOT EXISTS radius_miles DECIMAL(6, 2),');
      console.log('ADD COLUMN IF NOT EXISTS coordinate_list JSONB,');
      console.log('ADD COLUMN IF NOT EXISTS landing_page_url TEXT;');
      console.log('');
      console.log(
        '🔗 Go to: https://supabase.com/dashboard → Your Project → SQL Editor'
      );
      console.log('');
      return;
    }

    console.log('✅ Migration completed successfully!');

    // Verify the columns were added by checking table structure
    console.log('\n🔍 Verifying table structure...');
    const { data: tableInfo, error: infoError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'location_configs')
      .order('ordinal_position');

    if (infoError) {
      console.log(
        '⚠️  Could not verify table structure, but migration should have succeeded'
      );
    } else if (tableInfo) {
      console.log('\n📊 Current location_configs table structure:');
      tableInfo.forEach(col => {
        console.log(
          `   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`
        );
      });
    }

    console.log('\n🎉 Ready to run populate-location-configs script!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.log(
      '\n📋 Please run the following SQL manually in your Supabase SQL Editor:'
    );
    console.log('');
    console.log('-- Add targeting fields to location_configs table');
    console.log('ALTER TABLE location_configs');
    console.log('ADD COLUMN IF NOT EXISTS primary_lat DECIMAL(10, 8),');
    console.log('ADD COLUMN IF NOT EXISTS primary_lng DECIMAL(11, 8),');
    console.log('ADD COLUMN IF NOT EXISTS radius_miles DECIMAL(6, 2),');
    console.log('ADD COLUMN IF NOT EXISTS coordinate_list JSONB,');
    console.log('ADD COLUMN IF NOT EXISTS landing_page_url TEXT;');
    console.log('');
    console.log(
      '🔗 Go to: https://supabase.com/dashboard → Your Project → SQL Editor'
    );
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  addTargetingColumns()
    .then(() => {
      console.log('\n✨ Migration script completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { addTargetingColumns };
