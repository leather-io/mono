import {
  EventType,
  PlatformPlugin,
  PluginType,
  SegmentClient,
  SegmentEvent,
} from '@segment/analytics-react-native';

/**
 * This plugin is used to ensure that any default event tracks, eg app lifecycle events,
 * have the platform property set to 'mobile'.
 *
 * Docs on these are sparse but this source code is a good reference:
 * https://github.com/segmentio/analytics-react-native/tree/master/packages/plugins
 *
 */
export class AppLifecycleEventPlugin extends PlatformPlugin {
  type = PluginType.before;

  configure(analytics: SegmentClient) {
    this.analytics = analytics;
  }
  // Ensures all events have the platform property set to 'mobile', especially default Segment controlled events.'
  execute(event: SegmentEvent): SegmentEvent {
    if (event.type === EventType.TrackEvent || event.type === EventType.ScreenEvent) {
      return { ...event, properties: { ...event.properties, platform: 'mobile' } };
    }
    return event;
  }
}
