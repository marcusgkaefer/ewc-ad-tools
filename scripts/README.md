# Scripts

This directory contains various utility scripts for the EWC Ad Tools application.

## Available Scripts

### `migrate-locations.ts`
Migrates location data from one format to another.

**Usage:**
```bash
npm run migrate-locations
```

### `populate-configs.ts`
Populates location configuration data.

**Usage:**
```bash
npm run populate-configs
```

### `fetch-zenoti-locations.ts`
Fetches location data from the Zenoti API for Minneapolis-St. Paul area locations and creates a JSON file with the same structure as `artemis_wax_group.json`.

**Usage:**
```bash
npm run fetch-zenoti
```

**Prerequisites:**
1. Set the `ZENOTI_API_KEY` environment variable with your Zenoti API key
2. Ensure you have network access to the Zenoti API

**What it does:**
- Attempts to fetch real data from the Zenoti API for the following locations:
  - Minneapolis - Lakes (0123)
  - Minnetonka (0236)
  - St. Paul - Grand Avenue (0473)
  - Blaine (0535)
- If API data is unavailable, creates default center structures with the provided coordinates and information
- Outputs a JSON file at `public/minneapolis_wax_group.json` with the same structure as the existing `artemis_wax_group.json`

**Environment Variables:**
```bash
export ZENOTI_API_KEY="your_zenoti_api_key_here"
```

**Output:**
The script creates a new file `public/minneapolis_wax_group.json` containing the fetched or generated center data in the same format as the existing Artemis Wax Group data.

**Error Handling:**
- If the Zenoti API is unavailable or returns errors, the script will fall back to creating default center structures
- All target locations will be included in the output regardless of API success/failure
- Detailed logging is provided for debugging purposes 