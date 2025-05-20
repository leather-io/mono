# @leather.io/rpc

This package provides Typescript typings Leather developers can use when interacting with the `LeatherProvider` global object.

## Consuming as global object

In your Typescript project, import `LeatherProvider` and declare it as a global type.

```ts
import { LeatherProvider } from '@leather.io/rpc';

declare global {
  interface Window {
    LeatherProvider?: LeatherProvider;
  }
}
```

## SIP-30 Support

| Method                      |                                                   |
| --------------------------- | ------------------------------------------------- |
| `stx_getAddresses`          | 🟢 Yes                                            |
| `stx_getAccounts`           | 🔴 No                                             |
| `stx_getNetworks`           | 🔴 No                                             |
| `stx_transferStx`           | 🟢 Yes                                            |
| `stx_transferSip10Ft`       | 🟢 Yes                                            |
| `stx_transferSip9Nft`       | 🟢 Yes                                            |
| `stx_callContract`          | 🟠 Yes <sub>Hex-encoded Clarity values only</sub> |
| `stx_deployContract`        | 🟠 Yes <sub>Hex-encoded Clarity values only</sub> |
| `stx_signTransaction`       | 🟠 Yes <sub>Hex-encoded Clarity values only</sub> |
| `stx_signMessage`           | 🟠 Yes <sub>Hex-encoded Clarity values only</sub> |
| `stx_signStructuredMessage` | 🟠 Yes <sub>Hex-encoded Clarity values only</sub> |
| `stx_updateProfile`         | 🔴 No                                             |
| `stx_accountChange` (event) | 🔴 No                                             |
| `stx_networkChange` (event) | 🔴 No                                             |
