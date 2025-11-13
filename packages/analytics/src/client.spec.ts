import { AnalyticsClient } from './client';

export const mockExternalAnalyticsClient = {
  track: vi.fn(),
  identify: vi.fn(),
  setGroup: vi.fn(),
  getGroup: vi.fn(() => ({
    set: vi.fn(),
  })),
  getPeople: vi.fn(() => ({
    set: vi.fn(),
  })),
};

describe('AnalyticsClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should be able to track all events with default properties', () => {
    const analytics = AnalyticsClient({
      client: mockExternalAnalyticsClient,
      defaultProperties: { platform: 'web' },
    });

    analytics.track('background_analytics_schema_fail');
    analytics.screen('/home/screen');

    expect(mockExternalAnalyticsClient.track).toHaveBeenCalledWith(
      'background_analytics_schema_fail',
      {
        platform: 'web',
      }
    );

    expect(mockExternalAnalyticsClient.track).toHaveBeenCalledWith('screen_view', {
      screen_name: '/home/screen',
      platform: 'web',
    });
  });

  it('should be able to track group and identify with default traits', async () => {
    const analytics = AnalyticsClient({
      client: mockExternalAnalyticsClient,
      defaultTraits: { user: 'test' },
    });

    await analytics.identify('1df3_34j3');

    expect(mockExternalAnalyticsClient.identify).toHaveBeenCalledWith('1df3_34j3');
    expect(mockExternalAnalyticsClient.getPeople().set).toHaveBeenCalledWith({
      user: 'test',
    });

    expect(mockExternalAnalyticsClient.setGroup).toHaveBeenCalledWith('company', '1df3_34j3');
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
