# Meta Ads Integration - Complete Implementation

This document provides a comprehensive overview of the Meta ads integration system that has been implemented. The system allows users to connect their Meta Business accounts, browse existing ads, and create customized campaigns with location-specific overrides.

## 🚀 Features Implemented

### V1 Features (Current Implementation)
- ✅ **Meta Account Connection**: Secure OAuth 2.0 authentication with Meta Business accounts
- ✅ **Ad Browsing & Selection**: Browse existing Meta ads with filtering and search capabilities
- ✅ **Campaign Configuration**: Create campaigns with location-specific overrides
- ✅ **Creative Customization**: Override ad titles, body text, and call-to-action buttons
- ✅ **Budget Management**: Set campaign-level and location-specific budgets
- ✅ **Real-time Preview**: Preview ads with applied overrides before campaign creation

### V2 Features (Future Implementation)
- 🔄 **Variable Replacement**: Handlebars.js integration for dynamic content
- 🔄 **Advanced Targeting**: Geographic and demographic targeting overrides
- 🔄 **Performance Analytics**: Integration with Meta Insights API
- 🔄 **Bulk Operations**: Batch processing for multiple ads and locations

## 📁 File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── MetaAccountModal.tsx          # Meta account connection modal
│   │   ├── MetaAdsBrowser.tsx            # Ad browsing and selection component
│   │   ├── MetaAdsCampaignCreator.tsx    # Main campaign creation workflow
│   │   └── CampaignOverrideModal.tsx     # Override configuration component
│   └── MetaAdsIntegrationDemo.tsx        # Demo component for testing
├── services/
│   ├── metaApiService.ts                 # Meta Graph API integration
│   └── metaIntegrationService.ts         # Database operations and orchestration
├── types/
│   └── meta.ts                          # Comprehensive type definitions
└── lib/
    └── supabase.ts                      # Database client configuration
```

## 🗄️ Database Schema

The integration includes a complete database schema with the following tables:

### Core Tables
- `meta_accounts`: Store user's Meta account connections
- `meta_ad_templates`: Cache Meta ads for selection and reuse
- `campaign_meta_ads`: Link selected ads to campaigns
- `meta_ad_variables`: Template variables for dynamic content
- `meta_ad_location_overrides`: Location-specific overrides

### Key Features
- **Row Level Security (RLS)**: Secure data access policies
- **Indexing**: Optimized queries for performance
- **Audit Trail**: Created/updated timestamps on all records
- **Soft Deletes**: Maintain data integrity with active/inactive flags

## 🔧 Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Meta API Configuration (for production)
VITE_META_APP_ID=your_meta_app_id
VITE_META_APP_SECRET=your_meta_app_secret
```

### 2. Database Setup
Run the database schema migration:

```sql
-- Execute the schema from database/schema.sql
-- This creates all necessary tables and indexes
```

### 3. Dependencies
All required dependencies are already included in `package.json`:

```json
{
  "@supabase/supabase-js": "^2.52.0",
  "framer-motion": "^11.11.17",
  "@heroicons/react": "^2.0.18",
  "handlebars": "^4.7.8"
}
```

## 🎯 Usage Guide

### 1. Connecting Meta Account

```tsx
import MetaAccountModal from './components/ui/MetaAccountModal';

// In your component
const [showModal, setShowModal] = useState(false);

<MetaAccountModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={(accountId, accountName) => {
    console.log('Connected to:', accountName);
    setShowModal(false);
  }}
/>
```

### 2. Browsing Meta Ads

```tsx
import MetaAdsBrowser from './components/ui/MetaAdsBrowser';

<MetaAdsBrowser
  accountId="your_meta_account_id"
  onAdSelect={(ad) => console.log('Selected:', ad.name)}
  onAdDeselect={(adId) => console.log('Deselected:', adId)}
  selectedAds={['ad_id_1', 'ad_id_2']}
/>
```

### 3. Creating Campaigns

```tsx
import MetaAdsCampaignCreator from './components/ui/MetaAdsCampaignCreator';

<MetaAdsCampaignCreator
  locations={locationData}
  onCampaignCreate={(config, ads, overrides) => {
    // Handle campaign creation
    console.log('Campaign created:', config);
  }}
  onClose={() => setShowCreator(false)}
/>
```

## 🔌 API Integration

### Meta Graph API Service

The `metaApiService.ts` provides comprehensive Meta API integration:

```typescript
import { metaApiService } from './services/metaApiService';

// Authenticate with Meta
await metaApiService.authenticate(accessToken);

// Get user's accounts
const accounts = await metaApiService.getAccounts();

// Fetch ads with filters
const ads = await metaApiService.getAds(accountId, {
  status: ['ACTIVE'],
  searchQuery: 'promotion'
});

// Create new ad
const newAd = await metaApiService.createAd({
  name: 'My New Ad',
  adset_id: 'adset_id',
  creative: { /* creative data */ }
});
```

### Database Integration Service

The `metaIntegrationService.ts` handles all database operations:

```typescript
import { metaIntegrationService } from './services/metaIntegrationService';

// Save Meta account
await metaIntegrationService.saveMetaAccount({
  user_id: 'user_id',
  account_id: 'meta_account_id',
  account_name: 'Account Name',
  access_token: 'token'
});

// Sync ads from Meta
await metaIntegrationService.syncMetaAds(accountId);

// Get cached ad templates
const templates = await metaIntegrationService.getMetaAdTemplates(accountId);
```

## 🎨 UI Components

### Design System Compliance

All components follow the established design system:

- **Colors**: Primary blue (#3B82F6), secondary gray (#6B7280)
- **Typography**: Inter for body text, JetBrains Mono for code
- **Spacing**: Consistent 4px grid system
- **Border Radius**: 8px for cards, 12px for modals
- **Shadows**: Subtle elevation with backdrop blur effects

### Component Features

#### MetaAccountModal
- Multi-step connection flow (Auth → Account → Permissions → Success)
- Real-time validation and error handling
- Secure token input with show/hide functionality
- Progress indicators and success states

#### MetaAdsBrowser
- Grid and list view modes
- Advanced filtering (status, creative type, campaign)
- Real-time search functionality
- Ad preview with performance metrics
- Bulk selection with visual feedback

#### CampaignOverrideModal
- Collapsible sections for different override types
- Real-time validation and character limits
- Location-specific override management
- Preview mode for override summary

## 🧪 Testing

### Demo Component

Use the `MetaAdsIntegrationDemo.tsx` component to test the full integration:

```tsx
import MetaAdsIntegrationDemo from './components/MetaAdsIntegrationDemo';

// In your app
<MetaAdsIntegrationDemo />
```

### Testing Checklist

- [ ] Meta account connection flow
- [ ] Ad browsing and selection
- [ ] Campaign override configuration
- [ ] Location-specific overrides
- [ ] Campaign creation and validation
- [ ] Error handling and user feedback

## 🔒 Security Considerations

### Authentication
- OAuth 2.0 flow for Meta account connection
- Secure token storage in database
- Automatic token refresh handling
- Row Level Security (RLS) policies

### Data Protection
- Input sanitization for all user inputs
- XSS protection in ad content
- Secure API communication with Meta
- Audit logging for all operations

## 🚨 Error Handling

### Common Error Scenarios

1. **Invalid Access Token**
   ```typescript
   // Handled in MetaAccountModal
   if (!isAuthenticated) {
     setError('Invalid access token. Please check your token and try again.');
   }
   ```

2. **API Rate Limiting**
   ```typescript
   // Handled in metaApiService
   if (error.error?.code === 4) {
     await handleRateLimit(retryAfter);
   }
   ```

3. **Database Connection Issues**
   ```typescript
   // Handled in metaIntegrationService
   if (error) {
     throw new Error('Failed to save Meta account');
   }
   ```

### User Feedback

- Loading states with spinners
- Error messages with actionable guidance
- Success confirmations
- Progress indicators for multi-step flows

## 📈 Performance Optimizations

### Caching Strategy
- Meta ads cached in database for faster access
- Incremental sync to avoid full refreshes
- Lazy loading for large ad lists

### UI Performance
- Debounced search inputs
- Virtual scrolling for large lists
- Optimistic updates for better UX
- Memoized components to prevent unnecessary re-renders

## 🔄 Future Enhancements

### V2 Features Roadmap

1. **Variable Replacement System**
   ```typescript
   // Handlebars.js integration
   const template = "Visit {{location.name}} today!";
   const context = { location: { name: "Downtown Center" } };
   const result = Handlebars.compile(template)(context);
   ```

2. **Advanced Targeting**
   - Geographic targeting overrides
   - Demographic targeting options
   - Custom audience integration

3. **Performance Analytics**
   - Real-time performance metrics
   - A/B testing capabilities
   - ROI tracking and reporting

4. **Bulk Operations**
   - Batch ad creation
   - Mass override application
   - Bulk campaign management

## 🐛 Troubleshooting

### Common Issues

1. **Meta API Authentication Fails**
   - Verify access token permissions (ads_management, ads_read)
   - Check token expiration
   - Ensure Meta app is properly configured

2. **Database Connection Issues**
   - Verify Supabase environment variables
   - Check RLS policies are properly configured
   - Ensure database schema is up to date

3. **Component Not Rendering**
   - Check all required props are passed
   - Verify TypeScript types are correct
   - Ensure all dependencies are installed

### Debug Mode

Enable debug logging by setting:

```typescript
// In metaApiService.ts
const DEBUG_MODE = true;

if (DEBUG_MODE) {
  console.log('Meta API Request:', endpoint, options);
}
```

## 📚 Additional Resources

- [Meta Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Supabase Documentation](https://supabase.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Design System Documentation](./DESIGN_SYSTEM.md)

## 🤝 Contributing

When adding new features to the Meta ads integration:

1. Follow the established component patterns
2. Add comprehensive TypeScript types
3. Include error handling and loading states
4. Update this documentation
5. Add tests for new functionality

---

**Status**: ✅ Complete Implementation (V1)
**Last Updated**: December 2024
**Version**: 1.0.0