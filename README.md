# Ad Creation App

A modern React application for creating and managing advertising campaigns across multiple locations with configurable settings and budget management.

## Features

- **Location Management**: Load and manage locations from Supabase database
- **Configurable Locations**: Set custom budgets and notes for each location
- **Template-Based Ad Generation**: Create ads using predefined templates
- **Batch Operations**: Select and configure multiple locations at once
- **Real-time Preview**: See generated ads before exporting
- **Export Capabilities**: Download campaign data in various formats

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks and context
- **Build Tool**: Vite
- **Icons**: Heroicons

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Clone and Install

```bash
cd ad-creation-frontend
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create the database schema by running the SQL commands in `database/schema.sql`

### 3. Environment Configuration

Create a `.env.local` file in the `ad-creation-frontend` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your actual Supabase credentials.

### 4. Database Migration

If you have existing location data in `public/locations.json`, run the migration script:

```bash
npm run migrate-locations
```

This will:
- Read your existing `locations.json` file
- Upload all location data to Supabase
- Skip corporate locations (code: 'CORP')
- Handle the data in batches for optimal performance

### 5. Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Database Schema

### Locations Table
- Stores all location data including address, contact info, and working hours
- Uses JSONB fields for complex nested data structures
- Includes indexes for optimal search performance

### Location Configs Table
- Stores user-specific configuration for each location
- Includes budget settings, custom preferences, and notes
- Supports per-user customization with Row Level Security

## Features Overview

### Location Selection
- Search and filter locations by name, city, or state
- Multi-select with bulk operations
- Real-time location count and statistics

### Location Configuration
- Set custom budgets for each location
- Add notes and special instructions
- Configure location-specific campaign settings

### Template Management
- 4 built-in ad templates
- Custom template creation
- Variable substitution for location-specific content

### Campaign Generation
- Generate ads for selected locations
- Preview before export
- Download as CSV, Excel, or JSON

## API Endpoints

The application uses a service layer that abstracts Supabase operations:

- `getAllLocations()` - Fetch all active locations
- `searchLocations(filters)` - Search with filters
- `getLocationConfig(locationId, userId)` - Get location configuration
- `createLocationConfig(request, userId)` - Create new configuration
- `updateLocationConfig(locationId, request, userId)` - Update configuration

## Configuration Options

### Location Configuration
- **Budget**: Set campaign budget per location
- **Notes**: Add special instructions or notes
- **Custom Settings**: Store additional JSON configuration
- **Active Status**: Enable/disable locations for campaigns

### Campaign Configuration
- **Platform**: Meta, Google, etc.
- **Objective**: Engagement, Conversions, etc.
- **Duration**: Evergreen or time-bound campaigns
- **Radius**: Geographic targeting radius
- **Bid Strategy**: Budget optimization settings

## Security

- Row Level Security (RLS) enabled on all tables
- User-specific configuration isolation
- Secure environment variable handling
- Input validation and sanitization

## Performance Optimizations

- Database indexes on frequently queried fields
- Batch operations for large datasets
- Efficient JSONB queries for complex filters
- Client-side caching where appropriate

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify your `.env.local` file has correct credentials
   - Check that your Supabase project is active
   - Ensure the database schema has been created

2. **Location Loading Issues**
   - Run the migration script if using existing data
   - Check browser console for API errors
   - Verify RLS policies allow data access

3. **Configuration Save Errors**
   - Ensure user authentication is working
   - Check that location_configs table exists
   - Verify the user has proper permissions

### Development Tips

- Use browser dev tools to monitor network requests
- Check Supabase dashboard for real-time database activity
- Enable verbose logging in development mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
