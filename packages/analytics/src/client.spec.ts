// write tests for the analytics client
import { AnalyticsClient } from './client';

export const mockExternalAnalyticsClient = {
  track: vi.fn(),
  screen: vi.fn(),
  group: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
  register: vi.fn(),
  deregister: vi.fn(),
};

describe('AnalyticsClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should be able to track all events with default properties', async () => {
    const analytics = AnalyticsClient({
      client: mockExternalAnalyticsClient,
      defaultProperties: { platform: 'web' },
    });

    await analytics.track('background_analytics_schema_fail');
    await analytics.screen('/home/screen');

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
    const analytics = AnalyticsClient({
      client: mockExternalAnalyticsClient,
      defaultTraits: { user: 'test' },
    });

    await analytics.identify('1df3_34j3');
    await analytics.group('1df3_34j3');

    expect(mockExternalAnalyticsClient.identify).toHaveBeenCalledWith('1df3_34j3', {
      user: 'test',
    });

    expect(mockExternalAnalyticsClient.group).toHaveBeenCalledWith('1df3_34j3', {
      user: 'test',
    });
  });

  it('should enforce snake case for untyped track', async () => {
    const client = AnalyticsClient({
      client: mockExternalAnalyticsClient,
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
