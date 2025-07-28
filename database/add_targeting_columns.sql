-- Migration to add targeting columns to location_configs table
-- This adds the columns needed for the populate_location_configs.sql script

-- Add targeting fields to location_configs table
ALTER TABLE location_configs 
ADD COLUMN IF NOT EXISTS primary_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS primary_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS radius_miles DECIMAL(6, 2),
ADD COLUMN IF NOT EXISTS coordinate_list JSONB,
ADD COLUMN IF NOT EXISTS landing_page_url TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN location_configs.primary_lat IS 'Primary latitude for radius targeting';
COMMENT ON COLUMN location_configs.primary_lng IS 'Primary longitude for radius targeting';
COMMENT ON COLUMN location_configs.radius_miles IS 'Radius in miles for targeting';
COMMENT ON COLUMN location_configs.coordinate_list IS 'Array of {lat, lng, radius} objects for polygon/multi-point targeting';
COMMENT ON COLUMN location_configs.landing_page_url IS 'Custom landing page URL';

-- Show the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'location_configs' 
ORDER BY ordinal_position; 