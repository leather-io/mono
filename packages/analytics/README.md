# @leather/analytics

This package provides a client for sending analytics events to various analytics services. Currently, it supports Segment but could be extended to support other services in the future.

## Installation

```bash
pnpm install @leather/analytics
```

## Usage

Before making any analytics calls, you must configure the analytics client with your write key.

```ts
import { AnalyticsClientType, configureAnalyticsClient } from '@leather.io/analytics';

export const analytics: AnalyticsClientType = configureAnalyticsClient({
  client: segmentClient,
  defaultProperties: {
    platform: 'mobile',
  },
});
```

Now you can make analytics calls with your configured client.

```ts
import { analytics } from 'path/to/analytics';

analytics.track('My Event', {
  property: 'value',
});
```

## Development

```sh
pnpm build
```

or

```sh
pnpm build:watch
```
