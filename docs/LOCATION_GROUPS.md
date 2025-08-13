# Location Groups Feature

## Overview

The Location Groups feature allows users to organize European Wax Center locations into logical groups for easier campaign management and targeting. Instead of selecting individual locations one by one, users can now create groups and apply campaigns to entire groups at once.

## Features

### 1. Group Management
- **Create Groups**: Create new location groups with custom names and descriptions
- **Edit Groups**: Modify existing group names and descriptions
- **Delete Groups**: Soft delete groups (sets `is_active` to false)
- **View Group Details**: See all locations within a group

### 2. Location Assignment
- **Add Locations**: Assign multiple locations to a group during creation or later
- **Remove Locations**: Remove specific locations from groups
- **Bulk Operations**: Handle multiple locations efficiently

### 3. Group Selection & Filtering
- **Group Selector**: Dropdown component for choosing groups
- **Location Filtering**: Filter locations based on selected groups
- **Integration**: Seamlessly integrate with existing campaign creation workflow

## Database Schema

### Tables

#### `location_groups`
```sql
CREATE TABLE location_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID, -- Can be NULL for global groups
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### `location_group_members`
```sql
CREATE TABLE location_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES location_groups(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique group-location combination
  UNIQUE(group_id, location_id)
);
```

### Indexes
- `idx_location_groups_user_id` - For user-specific group queries
- `idx_location_groups_active` - For active group filtering
- `idx_location_group_members_group_id` - For group member queries
- `idx_location_group_members_location_id` - For location-based queries

## API Endpoints

### Location Group Service

The `SupabaseLocationGroupService` provides the following methods:

#### Group Management
- `getAllGroups()` - Get all active groups
- `getGroupById(id)` - Get a specific group with members
- `createGroup(request)` - Create a new group
- `updateGroup(id, request)` - Update an existing group
- `deleteGroup(id)` - Soft delete a group

#### Location Management
- `addLocationsToGroup(request)` - Add locations to a group
- `removeLocationsFromGroup(request)` - Remove locations from a group
- `getGroupLocations(groupId)` - Get all locations in a group

#### Utility Methods
- `getGroupsWithLocationCounts()` - Get groups with location counts for UI display

## Components

### 1. LocationGroupManager
Main component for managing location groups. Features:
- List all groups with location counts
- Create new groups with location selection
- Edit existing groups
- Delete groups
- View group details

### 2. LocationGroupSelector
Dropdown component for selecting groups. Features:
- Display available groups with location counts
- Clear selection option
- Responsive design
- Loading states

### 3. LocationGroupsPage
Full page showcasing the location groups feature. Features:
- Group selection demo
- Group management interface
- Feature highlights
- Integration information

## Usage Examples

### Creating a Group
```typescript
import { supabaseLocationGroupService } from '../services/supabaseLocationGroupService';

const createGroup = async () => {
  const request = {
    name: 'West Coast Locations',
    description: 'All European Wax Center locations on the West Coast',
    locationIds: ['loc1', 'loc2', 'loc3'] // Optional initial locations
  };

  try {
    const group = await supabaseLocationGroupService.createGroup(request);
    console.log('Group created:', group);
  } catch (error) {
    console.error('Failed to create group:', error);
  }
};
```

### Getting Locations by Group
```typescript
import { supabaseLocationService } from '../services/supabaseLocationService';

const getGroupLocations = async (groupId: string) => {
  try {
    const locations = await supabaseLocationService.getLocationsByGroupId(groupId);
    console.log('Group locations:', locations);
  } catch (error) {
    console.error('Failed to get group locations:', error);
  }
};
```

### Using Group Selector in Campaign Creation
```typescript
import LocationGroupSelector from '../components/ui/LocationGroupSelector';

const CampaignCreator = () => {
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null);

  const handleGroupSelect = (group: LocationGroup | null) => {
    setSelectedGroup(group);
    if (group) {
      // Load locations for the selected group
      loadGroupLocations(group.id);
    } else {
      // Load all locations
      loadAllLocations();
    }
  };

  return (
    <div>
      <LocationGroupSelector
        onGroupSelect={handleGroupSelect}
        selectedGroup={selectedGroup}
        placeholder="Select a location group..."
      />
      {/* Rest of campaign creation form */}
    </div>
  );
};
```

## Integration with Existing System

### Location Loading
The system now supports two modes:
1. **All Locations**: Load all available locations (existing behavior)
2. **Group Locations**: Load only locations from a selected group

### Campaign Creation
When a group is selected:
- All locations in the group are automatically included
- Location selection UI shows only group members
- Campaign settings can be applied consistently across all group locations

### Data Flow
1. User selects a location group
2. System fetches locations for that group
3. Campaign creation form populates with group locations
4. User configures campaign settings
5. Campaign is created with all group locations

## Security & Permissions

### Row Level Security (RLS)
- Users can only access groups they created
- Global groups (user_id = NULL) are accessible to all users
- Location group members inherit group permissions

### API Access
- All authenticated users can create groups
- Users can only modify their own groups
- Read access to global groups for all users

## Setup Instructions

### 1. Database Migration
Run the updated schema to create the new tables:
```bash
psql -d your_database -f database/schema.sql
```

### 2. Populate Sample Data
Create the "Artemix Wax" group with all locations:
```bash
psql -d your_database -f scripts/populate-location-groups.sql
```

### 3. Import Components
Import the new components where needed:
```typescript
import LocationGroupManager from '../components/ui/LocationGroupManager';
import LocationGroupSelector from '../components/ui/LocationGroupSelector';
```

### 4. Update Location Service
The location service now includes group filtering capabilities. No additional configuration needed.

## Best Practices

### Group Naming
- Use descriptive names that clearly indicate the group's purpose
- Include location count or region information
- Use consistent naming conventions across your organization

### Location Assignment
- Keep groups focused and logical (e.g., by region, performance, or business unit)
- Avoid creating groups with too many locations (consider sub-groups)
- Regularly review and update group memberships

### Performance
- Groups with many locations may impact query performance
- Consider pagination for groups with 100+ locations
- Use appropriate indexes for your query patterns

## Troubleshooting

### Common Issues

#### Group Not Loading
- Check if the group is marked as active (`is_active = true`)
- Verify user permissions for the group
- Check database connection and RLS policies

#### Locations Not Appearing in Group
- Ensure locations are properly linked in `location_group_members`
- Check if locations are marked as active
- Verify the group ID is correct

#### Permission Errors
- Confirm user authentication status
- Check RLS policies are properly configured
- Verify user has access to the specific group

### Debug Queries
```sql
-- Check group status
SELECT * FROM location_groups WHERE name = 'Your Group Name';

-- Verify group members
SELECT lg.name, l.name as location_name, lgm.is_active
FROM location_groups lg
JOIN location_group_members lgm ON lg.id = lgm.group_id
JOIN locations l ON lgm.location_id = l.id
WHERE lg.name = 'Your Group Name';

-- Check user permissions
SELECT * FROM location_groups WHERE user_id = 'your-user-id';
```

## Future Enhancements

### Planned Features
- **Nested Groups**: Support for hierarchical group structures
- **Group Templates**: Predefined group configurations
- **Bulk Import**: CSV import for group creation
- **Advanced Filtering**: Group-based location filtering with multiple criteria
- **Group Analytics**: Performance metrics and reporting by group

### API Extensions
- **Group Search**: Search groups by name, description, or location
- **Group Sharing**: Share groups between users
- **Group Permissions**: Fine-grained access control
- **Group Versioning**: Track changes to group configurations

## Support

For technical support or feature requests related to Location Groups:
- Check the troubleshooting section above
- Review database logs for error messages
- Verify component props and state management
- Test with minimal data sets to isolate issues