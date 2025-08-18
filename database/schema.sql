-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  online_booking_start_date TIMESTAMP WITH TIME ZONE,
  enable_parallel_services_at_center BOOLEAN DEFAULT FALSE,
  country JSONB NOT NULL,
  state JSONB NOT NULL,
  location JSONB NOT NULL,
  currency JSONB NOT NULL,
  address_info JSONB NOT NULL,
  contact_info JSONB NOT NULL,
  working_hours JSONB[] NOT NULL DEFAULT '{}',
  additional_info JSONB,
  culture_code_at_center VARCHAR(10),
  is_fbe_enabled BOOLEAN,
  is_hc_call_center BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create location_configs table for user-specific location settings
CREATE TABLE location_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id UUID, -- Can be NULL for global configs
  budget DECIMAL(10, 2),
  custom_settings JSONB,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- New targeting fields
  primary_lat DECIMAL(10, 8), -- Primary latitude for radius targeting
  primary_lng DECIMAL(11, 8), -- Primary longitude for radius targeting
  radius_miles DECIMAL(6, 2), -- Radius in miles for targeting
  coordinate_list JSONB, -- Array of {lat, lng, radius} objects for polygon/multi-point targeting
  landing_page_url TEXT, -- Custom landing page URL
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique config per user per location
  UNIQUE(location_id, user_id)
);

-- Create campaigns table for campaign management
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Can be NULL for global campaigns
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'Meta', -- Meta, Google, etc.
  objective VARCHAR(100) NOT NULL DEFAULT 'Engagement',
  test_type VARCHAR(50) DEFAULT 'LocalTest',
  duration VARCHAR(50) DEFAULT 'Evergreen',
  budget DECIMAL(10, 2) NOT NULL,
  bid_strategy VARCHAR(100) DEFAULT 'Highest volume or value',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  default_radius_miles DECIMAL(6, 2) DEFAULT 5,
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed')),
  configuration JSONB, -- Additional campaign configuration
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create campaign_locations table for many-to-many relationship
CREATE TABLE campaign_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  location_budget DECIMAL(10, 2), -- Override campaign budget for this location
  location_radius_miles DECIMAL(6, 2), -- Override default radius for this location
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique campaign-location combination
  UNIQUE(campaign_id, location_id)
);



-- Create indexes for better performance
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_name ON locations(name);
-- Corrected indexes for JSONB columns
CREATE INDEX idx_locations_state ON locations USING GIN (state jsonb_path_ops);
CREATE INDEX idx_locations_city ON locations USING GIN (address_info jsonb_path_ops);

CREATE INDEX idx_location_configs_location_id ON location_configs(location_id);
CREATE INDEX idx_location_configs_user_id ON location_configs(user_id);
CREATE INDEX idx_location_configs_active ON location_configs(is_active);

-- New indexes for campaigns
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_platform ON campaigns(platform);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_active ON campaigns(is_active);

CREATE INDEX idx_campaign_locations_campaign_id ON campaign_locations(campaign_id);
CREATE INDEX idx_campaign_locations_location_id ON campaign_locations(location_id);
CREATE INDEX idx_campaign_locations_active ON campaign_locations(is_active);



-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_configs_updated_at BEFORE UPDATE ON location_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- Add Row Level Security (RLS) policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_locations ENABLE ROW LEVEL SECURITY;


-- Public read access to locations (adjust as needed for your security requirements)
CREATE POLICY "Locations are viewable by everyone" ON locations
  FOR SELECT USING (true);

-- Location configs are only accessible by the user who created them
CREATE POLICY "Users can view their own location configs" ON location_configs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own location configs" ON location_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own location configs" ON location_configs
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own location configs" ON location_configs
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Campaign policies
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Campaign location policies
CREATE POLICY "Users can view campaign locations for their campaigns" ON campaign_locations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_locations.campaign_id 
    AND (campaigns.user_id = auth.uid() OR campaigns.user_id IS NULL)
  ));

CREATE POLICY "Users can insert campaign locations for their campaigns" ON campaign_locations
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_locations.campaign_id 
    AND (campaigns.user_id = auth.uid() OR campaigns.user_id IS NULL)
  ));

CREATE POLICY "Users can update campaign locations for their campaigns" ON campaign_locations
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_locations.campaign_id 
    AND (campaigns.user_id = auth.uid() OR campaigns.user_id IS NULL)
  ));

CREATE POLICY "Users can delete campaign locations for their campaigns" ON campaign_locations
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM campaigns 
    WHERE campaigns.id = campaign_locations.campaign_id 
    AND (campaigns.user_id = auth.uid() OR campaigns.user_id IS NULL)
  ));



-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON locations TO anon, authenticated;
GRANT ALL ON location_configs TO authenticated;
GRANT ALL ON campaigns TO authenticated;
<<<<<<< Current (Your changes)
GRANT ALL ON campaign_locations TO authenticated; 
=======
GRANT ALL ON campaign_locations TO authenticated;
 
>>>>>>> Incoming (Background Agent changes)
