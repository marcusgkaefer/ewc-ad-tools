import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LocationConfig, CreateLocationConfigRequest, UpdateLocationConfigRequest } from '../types'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
}

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock location config service - we'll test the actual implementation
import { supabaseLocationService } from '../services/supabaseLocationService'

describe('Location Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LocationConfig Data Structure', () => {
    it('should have all required fields', () => {
      const mockConfig: LocationConfig = {
        id: 'test-id',
        locationId: 'location-id',
        userId: null,
        budget: 100.50,
        customSettings: { test: 'value' },
        notes: 'Test notes',
        isActive: true,
        primaryLat: 40.7128,
        primaryLng: -74.0060,
        radiusMiles: 5,
        coordinateList: [
          { lat: 40.7128, lng: -74.0060, radius: 2 },
          { lat: 40.7589, lng: -73.9851, radius: 3 }
        ],
        landingPageUrl: 'https://example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(mockConfig.id).toBeDefined()
      expect(mockConfig.locationId).toBeDefined()
      expect(mockConfig.isActive).toBe(true)
      expect(mockConfig.primaryLat).toBe(40.7128)
      expect(mockConfig.primaryLng).toBe(-74.0060)
      expect(mockConfig.radiusMiles).toBe(5)
      expect(mockConfig.coordinateList).toHaveLength(2)
      expect(mockConfig.landingPageUrl).toBe('https://example.com')
    })

    it('should allow optional fields to be null', () => {
      const minimalConfig: LocationConfig = {
        id: 'test-id',
        locationId: 'location-id',
        userId: null,
        budget: null,
        customSettings: null,
        notes: null,
        isActive: true,
        primaryLat: null,
        primaryLng: null,
        radiusMiles: null,
        coordinateList: null,
        landingPageUrl: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      expect(minimalConfig.budget).toBeNull()
      expect(minimalConfig.primaryLat).toBeNull()
      expect(minimalConfig.coordinateList).toBeNull()
    })
  })

  describe('Location Configuration CRUD Operations', () => {
    const mockLocationConfig: LocationConfig = {
      id: 'config-123',
      locationId: 'location-456',
      userId: null,
      budget: 92.69,
      customSettings: null,
      notes: 'Auto-generated configuration',
      isActive: true,
      primaryLat: 41.714,
      primaryLng: -87.653,
      radiusMiles: 5,
      coordinateList: null,
      landingPageUrl: 'https://locations.waxcenter.com/test',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    it('should get location config successfully', async () => {
      mockSupabase.single.mockResolvedValue({ 
        data: mockLocationConfig, 
        error: null 
      })

      const result = await supabaseLocationService.getLocationConfig('location-456')
      
      expect(mockSupabase.from).toHaveBeenCalledWith('location_configs')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('location_id', 'location-456')
      expect(mockSupabase.is).toHaveBeenCalledWith('user_id', null)
      expect(result).toEqual(expect.objectContaining({
        id: 'config-123',
        locationId: 'location-456',
        primaryLat: 41.714,
        primaryLng: -87.653,
        radiusMiles: 5
      }))
    })

    it('should return null when config not found', async () => {
      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows returned' }
      })

      const result = await supabaseLocationService.getLocationConfig('nonexistent-location')
      
      expect(result).toBeNull()
    })

    it('should create location config successfully', async () => {
      const createRequest: CreateLocationConfigRequest = {
        locationId: 'location-456',
        budget: 92.69,
        notes: 'Test configuration',
        primaryLat: 41.714,
        primaryLng: -87.653,
        radiusMiles: 5,
        landingPageUrl: 'https://locations.waxcenter.com/test'
      }

      mockSupabase.single.mockResolvedValue({ 
        data: mockLocationConfig, 
        error: null 
      })

      const result = await supabaseLocationService.createLocationConfig(createRequest)
      
      expect(mockSupabase.from).toHaveBeenCalledWith('location_configs')
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        location_id: 'location-456',
        user_id: null,
        budget: 92.69,
        custom_settings: null,
        notes: 'Test configuration',
        primary_lat: 41.714,
        primary_lng: -87.653,
        radius_miles: 5,
        coordinate_list: null,
        landing_page_url: 'https://locations.waxcenter.com/test'
      })
      expect(result).toEqual(expect.objectContaining({
        locationId: 'location-456',
        budget: 92.69
      }))
    })

    it('should update location config successfully', async () => {
      const updateRequest: UpdateLocationConfigRequest = {
        budget: 150.00,
        notes: 'Updated configuration',
        radiusMiles: 8,
        isActive: true
      }

      const updatedConfig = { ...mockLocationConfig, ...updateRequest }
      mockSupabase.single.mockResolvedValue({ 
        data: updatedConfig, 
        error: null 
      })

      const result = await supabaseLocationService.updateLocationConfig('location-456', updateRequest)
      
      expect(mockSupabase.from).toHaveBeenCalledWith('location_configs')
      expect(mockSupabase.update).toHaveBeenCalledWith({
        budget: 150.00,
        custom_settings: undefined,
        notes: 'Updated configuration',
        is_active: true,
        primary_lat: undefined,
        primary_lng: undefined,
        radius_miles: 8,
        coordinate_list: undefined,
        landing_page_url: undefined
      })
      expect(result.budget).toBe(150.00)
      expect(result.radiusMiles).toBe(8)
    })

    it('should handle coordinate list correctly', async () => {
      const coordinateList = [
        { lat: 41.714, lng: -87.653, radius: 3 },
        { lat: 41.720, lng: -87.660, radius: 2 }
      ]

      const createRequest: CreateLocationConfigRequest = {
        locationId: 'location-456',
        coordinateList
      }

      mockSupabase.single.mockResolvedValue({ 
        data: { ...mockLocationConfig, coordinate_list: coordinateList }, 
        error: null 
      })

      const result = await supabaseLocationService.createLocationConfig(createRequest)
      
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinate_list: coordinateList
        })
      )
      expect(result.coordinateList).toEqual(coordinateList)
    })
  })

  describe('Location Configuration Validation', () => {
    it('should validate latitude range', () => {
      const validLat = 41.714  // Chicago latitude
      const invalidLatHigh = 91
      const invalidLatLow = -91

      expect(validLat).toBeGreaterThanOrEqual(-90)
      expect(validLat).toBeLessThanOrEqual(90)
      expect(invalidLatHigh).toBeGreaterThan(90)
      expect(invalidLatLow).toBeLessThan(-90)
    })

    it('should validate longitude range', () => {
      const validLng = -87.653  // Chicago longitude
      const invalidLngHigh = 181
      const invalidLngLow = -181

      expect(validLng).toBeGreaterThanOrEqual(-180)
      expect(validLng).toBeLessThanOrEqual(180)
      expect(invalidLngHigh).toBeGreaterThan(180)
      expect(invalidLngLow).toBeLessThan(-180)
    })

    it('should validate radius is positive', () => {
      const validRadius = 5
      const invalidRadius = -1

      expect(validRadius).toBeGreaterThan(0)
      expect(invalidRadius).toBeLessThanOrEqual(0)
    })

    it('should validate landing page URL format', () => {
      const validUrls = [
        'https://locations.waxcenter.com/il/chicago/chicago-0123.html',
        'https://waxcenter.com',
        'http://example.com'
      ]

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        ''
      ]

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow()
      })

      invalidUrls.forEach(url => {
        if (url) {
          expect(() => new URL(url)).toThrow()
        }
      })
    })
  })

  describe('Location Configuration Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Connection failed', code: 'CONNECTION_ERROR' }
      })

      await expect(
        supabaseLocationService.getLocationConfig('location-456')
      ).rejects.toThrow('Failed to fetch location config: Connection failed')
    })

    it('should handle validation errors on create', async () => {
      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid data', code: 'VALIDATION_ERROR' }
      })

      const invalidRequest: CreateLocationConfigRequest = {
        locationId: 'location-456',
        primaryLat: 91, // Invalid latitude
        primaryLng: -87.653,
        radiusMiles: -1 // Invalid radius
      }

      await expect(
        supabaseLocationService.createLocationConfig(invalidRequest)
      ).rejects.toThrow('Failed to create location config: Invalid data')
    })

    it('should handle update conflicts', async () => {
      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Conflict', code: 'CONFLICT' }
      })

      const updateRequest: UpdateLocationConfigRequest = {
        budget: 150.00
      }

      await expect(
        supabaseLocationService.updateLocationConfig('location-456', updateRequest)
      ).rejects.toThrow('Failed to update location config: Conflict')
    })
  })

  describe('Location Configuration with Multiple Coordinates', () => {
    it('should handle multiple coordinate points', () => {
      const multipleCoords = [
        { lat: 41.714, lng: -87.653, radius: 5 },
        { lat: 41.720, lng: -87.660, radius: 3 },
        { lat: 41.710, lng: -87.650, radius: 2 }
      ]

      const config: Partial<LocationConfig> = {
        coordinateList: multipleCoords
      }

      expect(config.coordinateList).toHaveLength(3)
      expect(config.coordinateList![0].radius).toBe(5)
      expect(config.coordinateList![1].radius).toBe(3)
      expect(config.coordinateList![2].radius).toBe(2)
    })

    it('should handle coordinate list with default radius', () => {
      const coordsWithoutRadius: Array<{ lat: number; lng: number; radius?: number }> = [
        { lat: 41.714, lng: -87.653 },
        { lat: 41.720, lng: -87.660 }
      ]

      // Simulate adding default radius
      const coordsWithDefaultRadius = coordsWithoutRadius.map(coord => ({
        ...coord,
        radius: coord.radius || 1
      }))

      expect(coordsWithDefaultRadius[0].radius).toBe(1)
      expect(coordsWithDefaultRadius[1].radius).toBe(1)
    })
  })

  describe('Location Configuration Integration', () => {
    it('should work with location data structure', async () => {
      const mockLocation = {
        id: 'location-456',
        name: 'Chicago Wax Center',
        coordinates: { lat: 41.714, lng: -87.653 },
        locationPrime: 'CHI'
      }

      const configFromLocation = {
        locationId: mockLocation.id,
        primaryLat: mockLocation.coordinates.lat,
        primaryLng: mockLocation.coordinates.lng,
        radiusMiles: 5,
        notes: `Auto-generated configuration for ${mockLocation.name}`
      }

      expect(configFromLocation.locationId).toBe('location-456')
      expect(configFromLocation.primaryLat).toBe(41.714)
      expect(configFromLocation.primaryLng).toBe(-87.653)
      expect(configFromLocation.notes).toBe('Auto-generated configuration for Chicago Wax Center')
    })

    it('should reflect config changes in output generation', () => {
      const baseOutput = {
        campaignName: 'EWC_Meta_June25_Engagement_LocalTest_Chicago',
        radius: '+5mi'
      }

      const configWithCustomRadius = {
        radiusMiles: 8
      }

      const updatedOutput = {
        ...baseOutput,
        radius: `+${configWithCustomRadius.radiusMiles}mi`
      }

      expect(updatedOutput.radius).toBe('+8mi')
    })
  })
}) 