# Location Configuration Scripts

## populate-location-configs.ts

This script automatically creates location configurations for all locations in your database.

### What it does:

1. **Fetches all locations** from the `locations` table
2. **Checks existing configurations** to avoid duplicates
3. **Creates configs** for locations that don't have them yet with:
   - **Primary lat/lng** from the location's coordinates
   - **Default 5-mile radius**
   - **Auto-detected landing page** from `additional_info` if available
   - **Auto-generated notes** indicating it was created automatically

### Prerequisites:

1. **Environment Variables** - Set these in your `.env` file:

   ```bash
   VITE_SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

2. **Database Setup** - Ensure your Supabase database has:
   - `locations` table with location data
   - `location_configs` table (from schema.sql)

### Usage:

**Option 1: TypeScript Script (Recommended)**

```bash
# Run the population script
npm run populate-configs
```

**Option 2: SQL Script**

```sql
-- Run this SQL directly in your Supabase SQL editor or psql
-- File: database/populate_location_configs.sql
```

### Example Output:

```
🚀 Starting location config population...

📍 Fetching all locations...
✅ Found 150 locations
🔍 Checking existing location configs...
✅ Found 0 existing configurations

📊 Summary:
   Total locations: 150
   Already configured: 0
   Need configuration: 150

📝 Creating configurations...

✅ Created config for Beverly Hills (34.0736, -118.4004, 5mi) with landing page: https://locations.waxcenter.com/ca/beverlyhills/beverly-hills-0123.html
✅ Created config for Manhattan Beach (33.8847, -118.4109, 5mi)
✅ Created config for Santa Monica (34.0195, -118.4912, 5mi) with landing page: https://locations.waxcenter.com/ca/santamonica/santa-monica-0456.html
...

🎯 Population Complete:
   ✅ Successfully created: 150
   ❌ Errors: 0
   📍 Total configs now: 150

🔄 Recommendations:
   1. Review and adjust individual location settings as needed
   2. Set custom budgets for each location
   3. Add additional targeting coordinates where appropriate
   4. Update landing page URLs if auto-detection missed any

✨ Script completed successfully!
```

### Landing Page Detection:

The script automatically looks for landing page URLs in the `additional_info` field under these possible keys:

- `landing_page`
- `landing_page_url`
- `landingPage`
- `landingPageUrl`
- `website`
- `url`
- `page_url`

### After Running:

1. **All locations will have basic configurations** with 5-mile radius
2. **Use the UI** to customize individual location settings
3. **Set budgets** for each location as needed
4. **Add additional coordinates** for complex targeting areas
5. **Verify landing page URLs** and update if needed

### Safety:

- **Idempotent**: Safe to run multiple times - won't create duplicates
- **Non-destructive**: Only creates new configs, never modifies existing ones
- **Global configs**: Creates configs with `user_id = null` (global/default configs)
