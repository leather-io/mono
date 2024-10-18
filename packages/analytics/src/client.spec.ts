// write tests for the analytics client
import { AnalyticsClient } from './client';

export const mockExternalAnalyticsClient = {
  track: vi.fn().mockResolvedValue(undefined),
  screen: vi.fn().mockResolvedValue(undefined),
  group: vi.fn().mockResolvedValue(undefined),
  identify: vi.fn().mockResolvedValue(undefined),
};

describe('AnalyticsClient', () => {
  it('should be able to track all events with default properties', async () => {
    const client = AnalyticsClient(mockExternalAnalyticsClient, {
      defaultProperties: { platform: 'web' },
    });

    await client.track('background_analytics_schema_fail', undefined);
    await client.screen('/home/screen', undefined);

    expect(mockExternalAnalyticsClient.track).toHaveBeenCalledWith(
      'background_analytics_schema_fail',
      {
        platform: 'web',
      }
    );

    expect(mockExternalAnalyticsClient.screen).toHaveBeenCalledWith('/home/screen', {
      platform: 'web',
    });
  });

  it('should be able to track group and identify with default traits', async () => {
    const client = AnalyticsClient(mockExternalAnalyticsClient, {
      defaultTraits: { user: 'test' },
    });

    await client.identify('1df3_34j3', undefined);
    await client.group('1df3_34j3', undefined);

    expect(mockExternalAnalyticsClient.identify).toHaveBeenCalledWith('1df3_34j3', {
      user: 'test',
    });

    expect(mockExternalAnalyticsClient.group).toHaveBeenCalledWith('1df3_34j3', {
      user: 'test',
    });
  });

  it('should enforce snake case for untyped track', async () => {
    const client = AnalyticsClient(mockExternalAnalyticsClient, {
      defaultProperties: { platform: 'web' },
    });

    await expect(client.untypedTrack('InvalidEventName', { some: 'property' })).rejects.toThrow(
      'Event must be snake_case'
    );
    await expect(
      client.untypedTrack('Another Invalid Event Name', { another: 'property' })
    ).rejects.toThrow('Event must be snake_case');

    await expect(
      client.untypedTrack('valid_event_name', { some: 'property' })
    ).resolves.not.toThrow();
  });
});
