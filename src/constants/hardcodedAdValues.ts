// Hard-coded ad configuration values extracted from example output CSV
// These values should not be editable by users - they represent the reference template

export const REFERENCE_AD_TEMPLATE = {
  // Ad naming pattern: EWC_Meta_Spring25_Engagement_LocalTest_{Location}_6.26.25_BehindTheScenes
  adNamePattern: 'EWC_Meta_Spring25_Engagement_LocalTest_{location}_6.26.25_BehindTheScenes',
  
  // Creative content - fixed values from example
  title: 'Get your First Wax Free',
  body: 'You learn something new everyday', 
  displayLink: 'waxcenter.com',
  callToAction: 'BOOK_TRAVEL',
  
  // Creative format and placement settings
  dynamicCreativeAdFormat: 'Link Page Post Ad',
  titlePlacement: 'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story',
  bodyPlacement: 'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story',
  linkPlacement: 'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story',
  
  // Technical settings
  optimizeTextPerPerson: 'No',
  creativeType: 'Link Page Post Ad',
  
  // Media settings (from example)
  imageHash: '303541819130038:d28e1dc58e7fcc7ac6d3e309eac2d3ad',
  videoThumbnailUrl: 'https://scontent-dfw5-1.xx.fbcdn.net/v/t15.13418-10/467701760_926931896038122_8058283634477458555_n.jpg?stp=dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=ace027&_nc_oc=AdlRhXqk3kXyhfvnEB8Qa7Oe8kveKql6aq7ivD7J8C1oa6U_ViFu5l3ECSLnLDYj1YI&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-dfw5-1.xx&_nc_gid=DprWR9RBxU4CVd-KxeA7MA&oh=00_AfPBEpbKMyhLvJjipyeZU_KeCjc8t-5S7HwTZ6zRx7Td_Q&oe=685FA2F2',
  imagePlacement: 'Default',
  
  // Video settings
  videoId: 'v:1794899587789121',
  videoPlacement: 'facebook biz_disco_feed, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook video_feeds, instagram explore, instagram stream',
  additionalVideoId: 'v:1243573153921320',
  additionalVideoPlacement: 'facebook facebook_reels, facebook right_hand_column, facebook search, facebook story, instagram reels, instagram story, messenger story',
  additionalVideoThumbnailUrl: 'https://scontent-dfw5-2.xx.fbcdn.net/v/t15.13418-10/467256659_543283285137927_5402167441693162688_n.jpg?stp=dst-jpg_tt6&_nc_cat=102&ccb=1-7&_nc_sid=ace027&_nc_oc=Adl-w5-p4KgKcpfNbwFCMI8p2z8bvGQvk3O2EUHsARUHic1iLG7nej7NHJZf5vrcj-w&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-dfw5-2.xx&_nc_gid=DprWR9RBxU4CVd-KxeA7MA&oh=00_AfMi8ih1MsPowL9pJrKsL6C9UW1sfWFo4HOhjCFJSCvgkA&oe=685F93A7',
  
  // Instagram settings
  instagramAccountId: 'x:602557576501192',
  
  // Tracking settings
  urlTags: 'utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&acadia_source=facebook&acadia_medium=cpc&utm_term={{adset.name}}&placement={{placement}}',
  
  // Additional settings
  videoRetargeting: 'No',
  usePageAsActor: 'No',
  dynamicCreativeCallToAction: 'BOOK_TRAVEL',
  degreesOfFreedomType: 'USER_ENROLLED_AUTOFLOW'
} as const

// Campaign-level settings that are also fixed
export const REFERENCE_CAMPAIGN_SETTINGS = {
  prefix: 'EWC',
  platform: 'Meta', 
  objective: 'Engagement',
  testType: 'LocalTest',
  duration: 'Evergreen',
  budget: 92.69,
  bidStrategy: 'Highest volume or value',
  
  // Fixed campaign settings from example
  campaignObjective: 'Outcome Engagement',
  buyingType: 'AUCTION',
  campaignStatus: 'ACTIVE',
  newObjective: 'Yes',
  buyWithPrimeType: 'NONE',
  isBudgetSchedulingEnabled: 'No',
  campaignHighDemandPeriods: '[]',
  buyWithIntegrationPartner: 'NONE'
} as const

// Ad Set level settings
export const REFERENCE_ADSET_SETTINGS = {
  adSetStatus: 'ACTIVE',
  adSetLifetimeImpressions: '0',
  destinationType: 'UNDEFINED', 
  useAcceleratedDelivery: 'No',
  isBudgetSchedulingEnabledForAdSet: 'No',
  adSetHighDemandPeriods: '[]',
  
  // Targeting settings - fixed from example
  linkObjectId: 'o:108555182262',
  optimizedConversionTrackingPixels: 'tp:1035642271793092',
  optimizedEvent: 'SCHEDULE',
  
  // Geographic and demographic targeting
  locationType: 'home, recent',
  excludedRegions: 'Alaska US, Wyoming US',
  gender: 'Women',
  ageMin: '18',
  ageMax: '54',
  excludedCustomAudiences: '120213927766160508:AUD-FBAllPriorServicedCustomers',
  
  // Interest targeting (JSON string from example)
  flexibleInclusions: '[{"interests":[{"id":"6002997877444","name":"Waxing"},{"id":"6003095705016","name":"Beauty & Fashion"},{"id":"6003152657675","name":"Wellness SPA"},{"id":"6003244295567","name":"Self care"},{"id":"6003251053061","name":"Shaving"},{"id":"6003393295343","name":"Health And Beauty"},{"id":"6003503807196","name":"European Wax Center"},{"id":"6003522953242","name":"Brazilian Waxing"},{"id":"6015279452180","name":"Bombshell Brazilian Waxing & Beauty Lounge"}]}]',
  
  targetingRelaxation: 'custom_audience: Off, lookalike: Off',
  brandSafetyInventoryFilteringLevels: 'FACEBOOK_STANDARD, AN_STANDARD, FEED_RELAXED',
  optimizationGoal: 'OFFSITE_CONVERSIONS',
  attributionSpec: '[{"event_type":"CLICK_THROUGH","window_days":1}]',
  billingEvent: 'IMPRESSIONS'
} as const

// Function to generate ad name from location (same as Ad Set Name pattern)
export function generateAdName(locationName: string, month: string = "June", day: string = "25"): string {
  return `EWC_Meta_${month}${day}_Engagement_LocalTest_${locationName}_${month}`;
}

// Function to generate campaign name from location  
export function generateCampaignName(locationName: string, month: string = "June", day: string = "25"): string {
  return `EWC_Meta_${month}${day}_Engagement_LocalTest_${locationName}`;
}

// Function to generate ad set name from location
export function generateAdSetName(locationName: string, month: string = "June", day: string = "25"): string {
  return `EWC_Meta_${month}${day}_Engagement_LocalTest_${locationName}_${month}`;
} 