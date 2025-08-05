# Meta Ads Integration System

## Overview

The Meta Ads Integration System provides a comprehensive solution for selecting and configuring existing Meta ads for campaign creation. This system replaces the traditional template-based approach with a direct selection of Meta ads from your advertising account.

## Features

### V1 Features (Current Implementation)

#### 1. Meta Account Connection
- **Secure Authentication**: Connect your Meta Business account using access tokens
- **Account Management**: Support for multiple Meta advertising accounts
- **Permission Validation**: Automatic verification of required permissions (ads_management, ads_read)
- **Token Refresh**: Automatic token refresh handling

#### 2. Meta Ads Browser
- **Ad Discovery**: Browse all available ads from your Meta account
- **Advanced Filtering**: Filter by status, campaign, ad set, creative type, and performance metrics
- **Search Functionality**: Search ads by name, title, or description
- **Ad Preview**: Preview ad creative content and performance metrics
- **Bulk Selection**: Select multiple ads for campaign creation

#### 3. Campaign Override System
- **Campaign-Level Overrides**: Override campaign settings for all selected ads
- **Creative Overrides**: Customize ad titles, body text, and call-to-action
- **Targeting Overrides**: Modify geographic and demographic targeting
- **Location-Specific Overrides**: Set custom overrides for specific locations
- **Budget Allocation**: Configure budget overrides per location

#### 4. Database Integration
- **Meta Account Storage**: Secure storage of Meta account connections
- **Ad Template Caching**: Cache Meta ads for faster access
- **Campaign Meta Ads**: Store selected ads for campaigns
- **Override Management**: Store and retrieve campaign overrides

### V2 Features (Advanced Variable Replacement)

#### 1. Handlebars Template Engine
- **Variable Replacement**: Advanced variable replacement using Handlebars
- **Custom Helpers**: Built-in helpers for formatting and conditional logic
- **Template Validation**: Real-time validation of template variables
- **XSS Protection**: Built-in security measures against XSS attacks

#### 2. Variable Editor
- **Visual Editor**: User-friendly template editor with syntax highlighting
- **Auto-completion**: Intelligent variable suggestions and auto-completion
- **Real-time Preview**: Live preview with sample data
- **Variable Management**: Create and manage custom variables

## Architecture

### Database Schema

```sql
-- Meta account connections
CREATE TABLE meta_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  account_id VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Cached Meta ad templates
CREATE TABLE meta_ad_templates (
  id UUID PRIMARY KEY,
  meta_ad_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  creative JSONB NOT NULL,
  targeting JSONB,
  campaign_id VARCHAR(255),
  ad_set_id VARCHAR(255),
  account_id VARCHAR(255),
  status VARCHAR(50),
  performance_metrics JSONB,
  last_synced TIMESTAMP
);

-- Selected Meta ads for campaigns
CREATE TABLE campaign_meta_ads (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  meta_ad_id VARCHAR(255) NOT NULL,
  meta_ad_name VARCHAR(500) NOT NULL,
  location_id UUID REFERENCES locations(id),
  override_settings JSONB,
  is_active BOOLEAN DEFAULT true
);
```

### Service Layer

#### MetaApiService
- **Authentication**: Handle Meta API authentication and token management
- **Ad Management**: Fetch, create, update, and duplicate Meta ads
- **Campaign Management**: Manage Meta campaigns and ad sets
- **Performance Metrics**: Retrieve ad performance insights
- **Error Handling**: Comprehensive error handling and rate limiting

#### MetaIntegrationService
- **Database Operations**: Handle all database operations for Meta integration
- **Ad Synchronization**: Sync Meta ads to local cache
- **Campaign Generation**: Generate campaigns with Meta ads
- **Override Processing**: Apply campaign and location overrides
- **Template Processing**: Process templates with variable replacement

#### TemplateEngine (V2)
- **Handlebars Integration**: Advanced template processing with Handlebars
- **Custom Helpers**: Built-in helpers for formatting and logic
- **Variable Validation**: Validate template variables and provide feedback
- **Security**: XSS protection and input sanitization

### UI Components

#### MetaAccountModal
- **Multi-step Flow**: Guided connection process with progress tracking
- **Account Selection**: Support for multiple Meta accounts
- **Permission Verification**: Validate required permissions
- **Error Handling**: Comprehensive error handling and user feedback

#### MetaAdsBrowser
- **Advanced Filtering**: Multiple filter options for ad discovery
- **Grid/List Views**: Flexible view modes for ad browsing
- **Ad Preview**: Detailed ad preview with creative content
- **Performance Metrics**: Display ad performance data
- **Bulk Selection**: Efficient multi-ad selection

#### CampaignOverrideModal
- **Sectioned Interface**: Organized override configuration
- **Real-time Validation**: Validate override settings
- **Preview Mode**: Preview overrides before saving
- **Location-specific**: Configure overrides per location

#### VariableEditor (V2)
- **Visual Editor**: User-friendly template editing
- **Auto-completion**: Intelligent variable suggestions
- **Real-time Preview**: Live preview with sample data
- **Validation**: Template validation and error reporting

## Usage Guide

### Connecting Meta Account

1. **Navigate to Meta Integration**
   - Click on "Meta Ads" in the campaign creation flow
   - Select "Connect Meta Account"

2. **Enter Access Token**
   - Generate an access token from Meta Business Manager
   - Ensure the token has `ads_management` and `ads_read` permissions
   - Enter the token in the connection modal

3. **Select Account**
   - Choose which Meta advertising account to connect
   - Verify account permissions

4. **Complete Connection**
   - Review and confirm the connection
   - The system will sync your Meta ads

### Selecting Meta Ads

1. **Browse Available Ads**
   - Use the Meta Ads Browser to view your ads
   - Apply filters to find specific ads
   - Search by ad name or content

2. **Preview Ads**
   - Click on any ad to preview its creative content
   - Review performance metrics if available
   - Check ad status and targeting

3. **Select Ads**
   - Click the checkbox to select ads
   - Selected ads will be highlighted
   - Continue to override configuration

### Configuring Overrides

1. **Campaign Settings**
   - Set campaign ID and ad set ID overrides
   - Configure budget overrides
   - Set targeting parameters

2. **Creative Overrides**
   - Override ad titles and body text
   - Customize call-to-action buttons
   - Apply creative changes across all selected ads

3. **Location-specific Overrides**
   - Set custom overrides for specific locations
   - Configure location-specific budgets
   - Customize creative content per location

### Creating Campaigns

1. **Review Configuration**
   - Review all selected ads and overrides
   - Verify campaign settings
   - Check location configurations

2. **Generate Campaign**
   - Click "Create Campaign" to generate
   - The system will process all ads with overrides
   - Campaign will be created with Meta ads

## API Reference

### MetaApiService Methods

```typescript
// Authentication
authenticate(accessToken: string, accountId?: string): Promise<boolean>
getAuthState(): Promise<MetaAuthState>

// Account Management
getAccounts(): Promise<MetaAccount[]>
getAccountById(accountId: string): Promise<MetaAccount>

// Ad Management
getAds(accountId?: string, filters?: MetaAdFilters): Promise<MetaAd[]>
getAdById(adId: string): Promise<MetaAd>
createAd(adData: CreateMetaAdRequest): Promise<MetaAd>
updateAd(adId: string, adData: UpdateMetaAdRequest): Promise<MetaAd>
duplicateAd(adId: string, newName: string): Promise<MetaAd>

// Campaign Management
getCampaigns(accountId?: string): Promise<MetaCampaign[]>
getCampaignById(campaignId: string): Promise<MetaCampaign>

// Ad Set Management
getAdSets(accountId?: string, campaignId?: string): Promise<MetaAdSet[]>
getAdSetById(adSetId: string): Promise<MetaAdSet>
```

### MetaIntegrationService Methods

```typescript
// Account Management
saveMetaAccount(accountData: MetaAccountData): Promise<string>
getMetaAccounts(userId: string): Promise<MetaAccountRecord[]>
deleteMetaAccount(accountId: string): Promise<void>

// Ad Template Management
syncMetaAds(accountId: string, forceRefresh?: boolean): Promise<void>
getMetaAdTemplates(accountId?: string, filters?: MetaAdFilters): Promise<MetaAdTemplateRecord[]>
getMetaAdTemplateById(templateId: string): Promise<MetaAdTemplateRecord | null>

// Campaign Management
saveCampaignMetaAds(campaignId: string, metaAds: MetaAdData[]): Promise<void>
getCampaignMetaAds(campaignId: string): Promise<CampaignMetaAdRecord[]>
updateCampaignMetaAdOverride(campaignId: string, metaAdId: string, overrides: Record<string, any>): Promise<void>

// Template Processing (V2)
generateCampaignWithMetaAds(campaignConfig: CampaignConfiguration, selectedAds: MetaAd[], locations: LocationWithConfig[], overrides: CampaignOverrides): Promise<ProcessedAd[]>
processMetaAdWithVariables(metaAd: MetaAd, variableContext: VariableContext, overrides: CampaignOverrides): Promise<ProcessedAd>
```

### TemplateEngine Methods (V2)

```typescript
// Template Processing
compileTemplate(template: string, data: VariableContext): string
processTemplates(templates: Record<string, string>, data: VariableContext): Record<string, string>

// Validation
validateTemplate(template: string, availableVariables: string[]): ValidationResult
extractVariables(template: string): string[]

// Preview
previewTemplate(template: string, sampleData: VariableContext): PreviewResult
getTemplateStats(template: string): TemplateStats

// Security
sanitizeTemplate(template: string): string
createSafeContext(data: VariableContext): VariableContext
```

## Security Considerations

### Authentication
- **Secure Token Storage**: Access tokens are encrypted and stored securely
- **Permission Validation**: Automatic validation of required permissions
- **Token Refresh**: Automatic handling of token expiration
- **Account Isolation**: User accounts are isolated and secure

### Data Protection
- **Input Sanitization**: All user inputs are sanitized to prevent XSS
- **Template Security**: Template processing includes security measures
- **Error Handling**: Comprehensive error handling without exposing sensitive data
- **Rate Limiting**: API rate limiting to prevent abuse

### Privacy
- **Data Minimization**: Only necessary data is stored
- **User Control**: Users can delete their Meta account connections
- **Audit Trail**: All operations are logged for security purposes

## Performance Optimization

### Caching Strategy
- **Ad Template Caching**: Meta ads are cached locally for faster access
- **Incremental Sync**: Only sync changed ads to reduce API calls
- **Lazy Loading**: Load ad previews on demand
- **Connection Pooling**: Efficient API connection management

### UI Performance
- **Virtual Scrolling**: Handle large numbers of ads efficiently
- **Debounced Search**: Optimize search performance
- **Lazy Loading**: Load components and data on demand
- **Optimistic Updates**: Provide immediate feedback for user actions

## Error Handling

### Common Errors
- **Authentication Errors**: Invalid or expired access tokens
- **Permission Errors**: Insufficient permissions for required operations
- **API Rate Limits**: Meta API rate limiting
- **Network Errors**: Connection issues with Meta API

### Error Recovery
- **Automatic Retry**: Automatic retry for transient errors
- **Graceful Degradation**: Fallback options when features are unavailable
- **User Feedback**: Clear error messages and recovery suggestions
- **Logging**: Comprehensive error logging for debugging

## Future Enhancements

### Planned Features
- **Multi-Platform Support**: Support for Google Ads and other platforms
- **Advanced Analytics**: Enhanced performance metrics and reporting
- **A/B Testing**: Built-in A/B testing capabilities
- **Automation**: Automated campaign optimization

### V2 Enhancements
- **Advanced Templates**: More sophisticated template capabilities
- **Custom Helpers**: User-defined template helpers
- **Template Library**: Shared template library
- **Version Control**: Template version control and history

## Troubleshooting

### Common Issues

#### Connection Problems
1. **Invalid Access Token**
   - Verify the token is correct and not expired
   - Ensure the token has required permissions
   - Generate a new token if necessary

2. **Permission Issues**
   - Check that the token has `ads_management` and `ads_read` permissions
   - Verify the account has the necessary roles
   - Contact Meta support if permissions are correct

#### Ad Loading Issues
1. **No Ads Found**
   - Verify the account has active ads
   - Check ad status filters
   - Ensure ads are not archived or deleted

2. **Performance Issues**
   - Clear the ad cache and re-sync
   - Check network connectivity
   - Verify API rate limits

#### Template Processing Issues
1. **Variable Errors**
   - Check variable syntax
   - Verify variables are available in the context
   - Use the template validator

2. **Preview Issues**
   - Ensure sample data is complete
   - Check for circular references
   - Validate template structure

### Support Resources
- **Documentation**: Comprehensive API documentation
- **Examples**: Sample code and templates
- **Community**: User community and forums
- **Support**: Technical support and troubleshooting

## Conclusion

The Meta Ads Integration System provides a powerful and flexible solution for managing Meta ads in campaign creation. With its comprehensive feature set, robust architecture, and user-friendly interface, it enables efficient and effective campaign management using existing Meta ads.

The system is designed to be scalable, secure, and maintainable, with clear separation of concerns and comprehensive error handling. Future enhancements will continue to improve the user experience and add new capabilities for advanced campaign management.