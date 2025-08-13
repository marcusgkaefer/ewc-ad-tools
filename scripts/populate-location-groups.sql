-- Script to populate location groups with "Artemix Wax" group
-- This script creates a group and associates it with all locations from the artemis_wax_group.json file

-- First, create the "Artemix Wax" group
INSERT INTO location_groups (id, name, description, user_id, is_active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- Fixed UUID for consistency
  'Artemix Wax',
  'All European Wax Center locations from the Artemis Wax Group',
  NULL, -- Global group (no specific user)
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Now associate all locations (excluding CORP) with this group
-- We'll use a subquery to get all location IDs that are not corporate
INSERT INTO location_group_members (id, group_id, location_id, is_active, created_at)
SELECT 
  gen_random_uuid() as id,
  '550e8400-e29b-41d4-a716-446655440000' as group_id,
  l.id as location_id,
  TRUE as is_active,
  CURRENT_TIMESTAMP as created_at
FROM locations l
WHERE l.code != 'CORP' -- Exclude corporate location
  AND l.is_active = TRUE; -- Only active locations

-- Verify the group was created
SELECT 
  lg.name as group_name,
  lg.description,
  COUNT(lgm.location_id) as location_count
FROM location_groups lg
LEFT JOIN location_group_members lgm ON lg.id = lgm.group_id AND lgm.is_active = TRUE
WHERE lg.id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY lg.id, lg.name, lg.description;

-- Show a sample of locations in the group
SELECT 
  l.name as location_name,
  l.code as location_code,
  l.address_info->>'city' as city,
  l.state->>'short_name' as state
FROM location_group_members lgm
JOIN locations l ON lgm.location_id = l.id
WHERE lgm.group_id = '550e8400-e29b-41d4-a716-446655440000'
  AND lgm.is_active = TRUE
  AND l.is_active = TRUE
ORDER BY l.name
LIMIT 10;