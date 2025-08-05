-- Meta Ads Integration Database Schema
-- This schema supports Meta ads selection and configuration

-- Meta account connections
CREATE TABLE IF NOT EXISTS meta_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meta ad templates (cached from API)
CREATE TABLE IF NOT EXISTS meta_ad_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_ad_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  creative JSONB NOT NULL,
  targeting JSONB,
  campaign_id VARCHAR(255),
  ad_set_id VARCHAR(255),
  account_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  performance_metrics JSONB,
  last_synced TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Selected Meta ads for campaigns
CREATE TABLE IF NOT EXISTS campaign_meta_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  meta_ad_id VARCHAR(255) NOT NULL,
  meta_ad_name VARCHAR(500) NOT NULL,
  location_id UUID REFERENCES locations(id),
  override_settings JSONB, -- Campaign/location overrides
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meta ad variables for template processing
CREATE TABLE IF NOT EXISTS meta_ad_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_ad_id VARCHAR(255) NOT NULL,
  variable_name VARCHAR(255) NOT NULL,
  variable_type VARCHAR(50) NOT NULL, -- 'location', 'campaign', 'custom'
  default_value TEXT,
  is_required BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meta ad overrides for specific locations
CREATE TABLE IF NOT EXISTS meta_ad_location_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_meta_ad_id UUID REFERENCES campaign_meta_ads(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  override_type VARCHAR(50) NOT NULL, -- 'creative', 'targeting', 'budget'
  override_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meta_accounts_user_id ON meta_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_accounts_account_id ON meta_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_templates_account_id ON meta_ad_templates(account_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_templates_status ON meta_ad_templates(status);
CREATE INDEX IF NOT EXISTS idx_campaign_meta_ads_campaign_id ON campaign_meta_ads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_meta_ads_meta_ad_id ON campaign_meta_ads(meta_ad_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_variables_meta_ad_id ON meta_ad_variables(meta_ad_id);
CREATE INDEX IF NOT EXISTS idx_meta_ad_location_overrides_campaign_meta_ad_id ON meta_ad_location_overrides(campaign_meta_ad_id);

-- Comments for documentation
COMMENT ON TABLE meta_accounts IS 'Stores Meta Business account connections for users';
COMMENT ON TABLE meta_ad_templates IS 'Cached Meta ads from API for selection and reuse';
COMMENT ON TABLE campaign_meta_ads IS 'Selected Meta ads for specific campaigns';
COMMENT ON TABLE meta_ad_variables IS 'Template variables available for Meta ads';
COMMENT ON TABLE meta_ad_location_overrides IS 'Location-specific overrides for Meta ads';

-- Row Level Security (RLS) policies
ALTER TABLE meta_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ad_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ad_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ad_location_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meta_accounts
CREATE POLICY "Users can view their own meta accounts" ON meta_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meta accounts" ON meta_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meta accounts" ON meta_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meta accounts" ON meta_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meta_ad_templates (read-only for now)
CREATE POLICY "Users can view meta ad templates" ON meta_ad_templates
  FOR SELECT USING (true);

-- RLS Policies for campaign_meta_ads
CREATE POLICY "Users can view campaign meta ads" ON campaign_meta_ads
  FOR SELECT USING (true);

CREATE POLICY "Users can insert campaign meta ads" ON campaign_meta_ads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update campaign meta ads" ON campaign_meta_ads
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete campaign meta ads" ON campaign_meta_ads
  FOR DELETE USING (true);

-- RLS Policies for meta_ad_variables
CREATE POLICY "Users can view meta ad variables" ON meta_ad_variables
  FOR SELECT USING (true);

-- RLS Policies for meta_ad_location_overrides
CREATE POLICY "Users can view meta ad location overrides" ON meta_ad_location_overrides
  FOR SELECT USING (true);

CREATE POLICY "Users can insert meta ad location overrides" ON meta_ad_location_overrides
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update meta ad location overrides" ON meta_ad_location_overrides
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete meta ad location overrides" ON meta_ad_location_overrides
  FOR DELETE USING (true);