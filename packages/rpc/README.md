# @leather-wallet/rpc

This package provides Typescript typings Leather developers can use when interacting with the `LeatherProvider` global object.

## Consuming as global object

In your Typescript project, import `LeatherProvider` and declare it as a global type.

```ts
import { LeatherProvider } from '@leather-wallet/rpc';

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}
```

