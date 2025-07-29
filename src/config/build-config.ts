// Build-time configuration
// This file can be modified before deployment to control app behavior

export const BUILD_CONFIG = {
  // Set to true to use artemis_wax_group.json instead of Supabase for location data
  USE_ARTEMIS_GROUP: import.meta.env.VITE_USE_ARTEMIS_GROUP === 'true' || false,
  
  // Fallback: You can manually set this to true for production deployments
  // USE_ARTEMIS_GROUP: true,
} as const;

// Debug info
console.log('🔧 Build Config:', BUILD_CONFIG); 