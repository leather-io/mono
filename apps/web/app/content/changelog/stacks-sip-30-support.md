---
title: 'Stacks SIP-30 support'
slug: stacks-sip-30-support
publishedAt: 2025-05-20T11:55:00.000Z
tags: ['extension', 'RPC API']
---

Available in [v6.70.0](https://github.com/leather-io/extension/releases/tag/v6.70.0), this release brings full support for [SIP-30](https://github.com/stacksgov/sips/pull/166), a standard API that makes it easier for apps to interact with the Stacks ecosystem through a consistent interface.

With SIP-30, developers can now call standardized methods—like `stx_transferStx` to initiate a transfer—without needing to manually construct JWT payloads or rely on custom libraries. This simplifies integration, reduces developer friction, and makes it easier for apps and wallets to work together smoothly.

Open up the developer console and try it out.

```typescript
await LeatherProvider.request('stx_transferStx', {
  recipient: 'SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H',
  amount: 100_000,
});
```

These new APIs are supported across both the Leather mobile app and browser extension, giving developers a unified way to build Stacks-powered experiences. For end users, this translates into faster, more reliable interactions with Stacks applications directly from their wallet.

SIP-30 methods are also available through [@stacks/connect](https://github.com/hirosystems/connect). Developers can find additional usage examples and detailed documentation to help streamline their integration process. [See the documentation for more examples](https://github.com/hirosystems/connect/tree/main/packages/connect#readme).
