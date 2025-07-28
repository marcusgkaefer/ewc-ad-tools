-- Corrected SQL for inserting location configs
INSERT INTO location_configs (
  location_id,
  user_id,
  budget,
  custom_settings,
  notes,
  primary_lat,
  primary_lng,
  radius_miles,
  coordinate_list,
  landing_page_url,
  is_active
)
SELECT 
  l.id as location_id,
  NULL as user_id, -- Global config
  NULL as budget,
  NULL as custom_settings,
  'Auto-generated configuration for ' || l.display_name as notes,
  (l.location->>'latitude')::decimal as primary_lat,
  (l.location->>'longitude')::decimal as primary_lng,
  5 as radius_miles, -- Default 5-mile radius
  NULL as coordinate_list,
  -- Try to extract landing page from additional_info
  COALESCE(
    l.additional_info->>'landing_page',
    l.additional_info->>'landing_page_url',
    l.additional_info->>'landingPage',
    l.additional_info->>'landingPageUrl',
    l.additional_info->>'website',
    l.additional_info->>'url',
    l.additional_info->>'page_url'
  ) as landing_page_url,
  true as is_active
FROM locations l
WHERE 
  l.code != 'CORP' -- Exclude corporate location
  AND NOT EXISTS (
    SELECT 1 
    FROM location_configs lc 
    WHERE lc.location_id = l.id 
    AND lc.user_id IS NULL
  );

-- Show summary of what was created
SELECT 
  COUNT(*) as configs_created,
  'location configs created with 5-mile radius' as description
FROM location_configs lc
JOIN locations l ON l.id = lc.location_id
WHERE lc.created_at >= NOW() - INTERVAL '1 minute';