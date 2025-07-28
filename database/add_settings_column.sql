-- Add missing settings column
ALTER TABLE locations ADD COLUMN IF NOT EXISTS settings JSONB;

-- Migration to add radius support to existing coordinate_list data
-- This script updates existing coordinate_list entries to include radius values

-- Update existing coordinate_list entries to add default radius of 1 mile
UPDATE location_configs 
SET coordinate_list = (
  SELECT jsonb_agg(
    coord || jsonb_build_object('radius', 1)
  )
  FROM jsonb_array_elements(coordinate_list) AS coord
)
WHERE coordinate_list IS NOT NULL 
  AND coordinate_list != '[]'::jsonb
  AND NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(coordinate_list) AS coord 
    WHERE coord ? 'radius'
  );

-- Add comment to document the coordinate_list structure
COMMENT ON COLUMN location_configs.coordinate_list IS 'Array of {lat, lng, radius} objects for multi-point targeting. Each coordinate has its own radius in miles.';
