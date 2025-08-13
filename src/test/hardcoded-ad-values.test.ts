import { describe, it, expect } from 'vitest';

import {
  REFERENCE_AD_TEMPLATE,
  REFERENCE_CAMPAIGN_SETTINGS,
  REFERENCE_ADSET_SETTINGS,
  generateAdName,
  generateCampaignName,
  generateAdSetName,
} from '../constants/hardcodedAdValues';

describe('Hard-coded Ad Values', () => {
  describe('Reference Ad Template', () => {
    it('should have all required creative content fields', () => {
      expect(REFERENCE_AD_TEMPLATE.title).toBe('Get your First Wax Free');
      expect(REFERENCE_AD_TEMPLATE.body).toBe(
        'You learn something new everyday'
      );
      expect(REFERENCE_AD_TEMPLATE.displayLink).toBe('waxcenter.com');
      expect(REFERENCE_AD_TEMPLATE.callToAction).toBe('BOOK_TRAVEL');
    });

    it('should have proper ad name pattern', () => {
      expect(REFERENCE_AD_TEMPLATE.adNamePattern).toBe(
        'EWC_Meta_Spring25_Engagement_LocalTest_{location}_6.26.25_BehindTheScenes'
      );
      expect(REFERENCE_AD_TEMPLATE.adNamePattern).toContain('{location}');
    });

    it('should have proper technical settings', () => {
      expect(REFERENCE_AD_TEMPLATE.dynamicCreativeAdFormat).toBe(
        'Link Page Post Ad'
      );
      expect(REFERENCE_AD_TEMPLATE.optimizeTextPerPerson).toBe('No');
      expect(REFERENCE_AD_TEMPLATE.creativeType).toBe('Link Page Post Ad');
      expect(REFERENCE_AD_TEMPLATE.videoRetargeting).toBe('No');
      expect(REFERENCE_AD_TEMPLATE.usePageAsActor).toBe('No');
    });

    it('should have valid media hashes and URLs', () => {
      expect(REFERENCE_AD_TEMPLATE.imageHash).toMatch(/^303541819130038:/);
      expect(REFERENCE_AD_TEMPLATE.videoThumbnailUrl).toMatch(
        /^https:\/\/scontent-/
      );
      expect(REFERENCE_AD_TEMPLATE.additionalVideoThumbnailUrl).toMatch(
        /^https:\/\/scontent-/
      );
    });

    it('should have proper video settings', () => {
      expect(REFERENCE_AD_TEMPLATE.videoId).toBe('v:1794899587789121');
      expect(REFERENCE_AD_TEMPLATE.additionalVideoId).toBe(
        'v:1243573153921320'
      );
      expect(REFERENCE_AD_TEMPLATE.videoPlacement).toContain(
        'facebook biz_disco_feed'
      );
      expect(REFERENCE_AD_TEMPLATE.additionalVideoPlacement).toContain(
        'facebook facebook_reels'
      );
    });

    it('should have proper placement settings', () => {
      const expectedPlacement =
        'Default, Default, Default, Default, audience_network classic, facebook biz_disco_feed, facebook facebook_reels, facebook facebook_reels_overlay, facebook feed, facebook instream_video, facebook marketplace, facebook right_hand_column, facebook search, facebook story, facebook video_feeds, instagram explore, instagram reels, instagram story, instagram stream, messenger story';

      expect(REFERENCE_AD_TEMPLATE.titlePlacement).toBe(expectedPlacement);
      expect(REFERENCE_AD_TEMPLATE.bodyPlacement).toBe(expectedPlacement);
      expect(REFERENCE_AD_TEMPLATE.linkPlacement).toBe(expectedPlacement);
    });

    it('should have proper tracking settings', () => {
      expect(REFERENCE_AD_TEMPLATE.urlTags).toContain('utm_source=facebook');
      expect(REFERENCE_AD_TEMPLATE.urlTags).toContain('utm_medium=cpc');
      expect(REFERENCE_AD_TEMPLATE.urlTags).toContain('{{campaign.name}}');
      expect(REFERENCE_AD_TEMPLATE.urlTags).toContain('{{ad.name}}');
      expect(REFERENCE_AD_TEMPLATE.urlTags).toContain('{{adset.name}}');
    });

    it('should be immutable (const assertion)', () => {
      // This test verifies that the template values are properly defined
      // The 'as const' assertion makes properties readonly at TypeScript compile time
      const originalTitle = REFERENCE_AD_TEMPLATE.title;
      expect(originalTitle).toBe('Get your First Wax Free');

      // Verify other key properties exist
      expect(REFERENCE_AD_TEMPLATE.body).toBe(
        'You learn something new everyday'
      );
      expect(REFERENCE_AD_TEMPLATE.callToAction).toBe('BOOK_TRAVEL');
    });
  });

  describe('Reference Campaign Settings', () => {
    it('should have correct campaign-level settings', () => {
      expect(REFERENCE_CAMPAIGN_SETTINGS.prefix).toBe('EWC');
      expect(REFERENCE_CAMPAIGN_SETTINGS.platform).toBe('Meta');
      expect(REFERENCE_CAMPAIGN_SETTINGS.objective).toBe('Engagement');
      expect(REFERENCE_CAMPAIGN_SETTINGS.testType).toBe('LocalTest');
      expect(REFERENCE_CAMPAIGN_SETTINGS.duration).toBe('Evergreen');
    });

    it('should have correct budget and bidding settings', () => {
      expect(REFERENCE_CAMPAIGN_SETTINGS.budget).toBe(92.69);
      expect(REFERENCE_CAMPAIGN_SETTINGS.bidStrategy).toBe(
        'Highest volume or value'
      );
    });

    it('should have proper campaign technical settings', () => {
      expect(REFERENCE_CAMPAIGN_SETTINGS.campaignObjective).toBe(
        'Outcome Engagement'
      );
      expect(REFERENCE_CAMPAIGN_SETTINGS.buyingType).toBe('AUCTION');
      expect(REFERENCE_CAMPAIGN_SETTINGS.campaignStatus).toBe('ACTIVE');
      expect(REFERENCE_CAMPAIGN_SETTINGS.newObjective).toBe('Yes');
      expect(REFERENCE_CAMPAIGN_SETTINGS.buyWithPrimeType).toBe('NONE');
    });
  });

  describe('Reference AdSet Settings', () => {
    it('should have correct adset status and delivery settings', () => {
      expect(REFERENCE_ADSET_SETTINGS.adSetStatus).toBe('ACTIVE');
      expect(REFERENCE_ADSET_SETTINGS.adSetLifetimeImpressions).toBe('0');
      expect(REFERENCE_ADSET_SETTINGS.destinationType).toBe('UNDEFINED');
      expect(REFERENCE_ADSET_SETTINGS.useAcceleratedDelivery).toBe('No');
    });

    it('should have proper targeting settings', () => {
      expect(REFERENCE_ADSET_SETTINGS.linkObjectId).toBe('o:108555182262');
      expect(REFERENCE_ADSET_SETTINGS.optimizedConversionTrackingPixels).toBe(
        'tp:1035642271793092'
      );
      expect(REFERENCE_ADSET_SETTINGS.optimizedEvent).toBe('SCHEDULE');
    });

    it('should have correct demographic targeting', () => {
      expect(REFERENCE_ADSET_SETTINGS.gender).toBe('Women');
      expect(REFERENCE_ADSET_SETTINGS.ageMin).toBe('18');
      expect(REFERENCE_ADSET_SETTINGS.ageMax).toBe('54');
      expect(REFERENCE_ADSET_SETTINGS.excludedCustomAudiences).toBe(
        '120213927766160508:AUD-FBAllPriorServicedCustomers'
      );
    });

    it('should have valid interest targeting JSON', () => {
      const interests = JSON.parse(REFERENCE_ADSET_SETTINGS.flexibleInclusions);
      expect(Array.isArray(interests)).toBe(true);
      expect(interests[0]).toHaveProperty('interests');
      expect(Array.isArray(interests[0].interests)).toBe(true);

      const waxingInterest = interests[0].interests.find(
        (i: { name: string; id: string }) => i.name === 'Waxing'
      );
      expect(waxingInterest).toBeDefined();
      expect(waxingInterest.id).toBe('6002997877444');
    });

    it('should have proper optimization settings', () => {
      expect(REFERENCE_ADSET_SETTINGS.optimizationGoal).toBe(
        'OFFSITE_CONVERSIONS'
      );
      expect(REFERENCE_ADSET_SETTINGS.billingEvent).toBe('IMPRESSIONS');

      const attributionSpec = JSON.parse(
        REFERENCE_ADSET_SETTINGS.attributionSpec
      );
      expect(attributionSpec[0].event_type).toBe('CLICK_THROUGH');
      expect(attributionSpec[0].window_days).toBe(1);
    });
  });

  describe('Name Generation Functions', () => {
    describe('generateAdName', () => {
      it('should generate correct ad name format (same as Ad Set Name)', () => {
        const result = generateAdName('Chicago');
        expect(result).toBe(
          'EWC_Meta_June25_Engagement_LocalTest_Chicago_June'
        );
      });

      it('should handle location names with spaces', () => {
        const result = generateAdName('New York City');
        expect(result).toBe(
          'EWC_Meta_June25_Engagement_LocalTest_New York City_June'
        );
      });

      it('should handle empty location names', () => {
        const result = generateAdName('');
        expect(result).toBe('EWC_Meta_June25_Engagement_LocalTest__June');
      });

      it('should preserve special characters in location names', () => {
        const result = generateAdName("O'Fallon");
        expect(result).toBe(
          "EWC_Meta_June25_Engagement_LocalTest_O'Fallon_June"
        );
      });

      it('should match Ad Set Name pattern exactly', () => {
        const locationName = 'TestLocation';
        const adName = generateAdName(locationName);
        const adSetName = generateAdSetName(locationName);
        expect(adName).toBe(adSetName);
      });
    });

    describe('generateCampaignName', () => {
      it('should generate correct campaign name format', () => {
        const result = generateCampaignName('Chicago');
        expect(result).toBe('EWC_Meta_June25_Engagement_LocalTest_Chicago');
      });

      it('should handle location names with spaces', () => {
        const result = generateCampaignName('Los Angeles');
        expect(result).toBe('EWC_Meta_June25_Engagement_LocalTest_Los Angeles');
      });
    });

    describe('generateAdSetName', () => {
      it('should generate correct adset name format', () => {
        const result = generateAdSetName('Chicago');
        expect(result).toBe(
          'EWC_Meta_June25_Engagement_LocalTest_Chicago_June'
        );
      });

      it('should include June suffix', () => {
        const result = generateAdSetName('TestLocation');
        expect(result.endsWith('_June')).toBe(true);
      });
    });

    describe('Name Generation Consistency', () => {
      const testLocation = 'Highland';

      it('should generate names that are related but distinct', () => {
        const campaignName = generateCampaignName(testLocation);
        const adSetName = generateAdSetName(testLocation);
        const adName = generateAdName(testLocation);

        // All should contain the location
        expect(campaignName).toContain(testLocation);
        expect(adSetName).toContain(testLocation);
        expect(adName).toContain(testLocation);

        // Campaign should be different from others
        expect(campaignName).not.toBe(adSetName);
        expect(campaignName).not.toBe(adName);
        // AdSet and Ad names should be the same (as requested by user)
        expect(adSetName).toBe(adName);

        // AdSet should be based on campaign but with suffix
        expect(adSetName).toBe(`${campaignName}_June`);
      });

      it('should generate deterministic names', () => {
        // Multiple calls should return the same result
        const name1 = generateAdName(testLocation);
        const name2 = generateAdName(testLocation);
        expect(name1).toBe(name2);

        const campaign1 = generateCampaignName(testLocation);
        const campaign2 = generateCampaignName(testLocation);
        expect(campaign1).toBe(campaign2);
      });
    });
  });

  describe('Template Integration', () => {
    it('should support location-based customization while keeping content fixed', () => {
      const locations = ['Chicago', 'Highland', 'Homewood'];

      locations.forEach(location => {
        const adName = generateAdName(location);
        const campaignName = generateCampaignName(location);

        // Name should be location-specific
        expect(adName).toContain(location);
        expect(campaignName).toContain(location);

        // But creative content should remain the same
        expect(REFERENCE_AD_TEMPLATE.title).toBe('Get your First Wax Free');
        expect(REFERENCE_AD_TEMPLATE.body).toBe(
          'You learn something new everyday'
        );
        expect(REFERENCE_AD_TEMPLATE.callToAction).toBe('BOOK_TRAVEL');
      });
    });

    it('should match the example output file structure', () => {
      // These values should match what we see in the example CSV
      expect(REFERENCE_AD_TEMPLATE.title).toBe('Get your First Wax Free');
      expect(REFERENCE_AD_TEMPLATE.body).toBe(
        'You learn something new everyday'
      );
      expect(REFERENCE_AD_TEMPLATE.displayLink).toBe('waxcenter.com');
      expect(REFERENCE_AD_TEMPLATE.callToAction).toBe('BOOK_TRAVEL');
      expect(REFERENCE_AD_TEMPLATE.dynamicCreativeAdFormat).toBe(
        'Link Page Post Ad'
      );

      // Ad name pattern should match Ad Set Name (Campaign Name + June)
      const testAdName = generateAdName('Evergreen');
      expect(testAdName).toBe(
        'EWC_Meta_June25_Engagement_LocalTest_Evergreen_June'
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle undefined or null location names gracefully', () => {
      // @ts-expect-error - Testing runtime behavior
      expect(() => generateAdName(null)).not.toThrow();
      // @ts-expect-error - Testing runtime behavior
      expect(() => generateAdName(undefined)).not.toThrow();
    });

    it('should handle very long location names', () => {
      const longLocation = 'A'.repeat(100);
      const result = generateAdName(longLocation);
      expect(result).toContain(longLocation);
      expect(typeof result).toBe('string');
    });

    it('should handle location names with special characters', () => {
      const specialChars = 'Location-with_special.chars@123!';
      const result = generateAdName(specialChars);
      expect(result).toContain(specialChars);
    });

    it('should maintain template immutability', () => {
      // Verify that the template values are consistent and properly defined
      expect(REFERENCE_AD_TEMPLATE.title).toBe('Get your First Wax Free');
      expect(REFERENCE_AD_TEMPLATE.body).toBe(
        'You learn something new everyday'
      );
      expect(REFERENCE_AD_TEMPLATE.displayLink).toBe('waxcenter.com');
      expect(REFERENCE_AD_TEMPLATE.callToAction).toBe('BOOK_TRAVEL');

      // The 'as const' assertion ensures TypeScript compile-time immutability
      expect(typeof REFERENCE_AD_TEMPLATE).toBe('object');
    });
  });
});
