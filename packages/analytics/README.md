# @leather/analytics

This package provides a client for sending analytics events to various analytics services. Currently, it supports Segment but could be extended to support other services in the future.

## Installation

```bash
pnpm install @leather/analytics
```

## Usage

Before making any analytics calls, you must configure the analytics client with your write key.

```ts
import { configureAnalyticsClient } from '@leather.io/analytics';

configureAnalyticsClient({
  writeKey: 'YOUR_WRITE_KEY',
  defaultProperties: {
    platform: 'web',
  },
});
```

Now you can make analytics calls.

```ts
import { analyticsClient } from '@leather/analytics';

analyticsClient.track('My Event', {
  property: 'value',
});
```

You can also inject your own analytics client if you are using a custom analytics service or want to use a stubbed client for testing.

````ts
import { configureAnalyticsClient } from '@leather/analytics';

configureAnalyticsClient({
  client: myAnalyticsClient,
});

## Development

```bash
pnpm build
````

or

```bash
pnpm build:watch
```
