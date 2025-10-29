import {
  EventType,
  PlatformPlugin,
  PluginType,
  SegmentClient,
  SegmentEvent,
} from '@segment/analytics-react-native';

import type { NetworkConfiguration } from '@leather.io/models';

type Network = NetworkConfiguration['chain']['bitcoin']['mode'];

/**
 * This plugin is used to ensure that any default event tracks, eg app lifecycle events,
 * have the platform property set to 'mobile'.
 *
 * Docs on these are sparse but this source code is a good reference:
 * https://github.com/segmentio/analytics-react-native/tree/master/packages/plugins
 *
 */
class ContextMiddlewarePlugin extends PlatformPlugin {
  type = PluginType.before;
  private network: Network | null = null;

  configure(analytics: SegmentClient) {
    this.analytics = analytics;
  }
  // Ensures all events have the platform property set to 'mobile', especially default Segment controlled events.'
  execute(event: SegmentEvent): SegmentEvent {
    if (event.type === EventType.TrackEvent || event.type === EventType.ScreenEvent) {
      return {
        ...event,
        properties: { ...event.properties, platform: 'mobile', network: this.network },
      };
    }
    return event;
  }

  setNetwork(network: Network) {
    this.network = network;
  }
}

export const contextMiddlewarePluginInstance = new ContextMiddlewarePlugin();
