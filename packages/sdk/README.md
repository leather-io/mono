# Leather SDK

This library exports an SDK to interact with Leather's RPC endpoints.

## Getting started

```bash
npm install @leather.io/sdk
pnpm add @leather.io/sdk
```

```ts
import { createLeatherClient } from '@leather.io/sdk';

const leather = createLeatherClient();

const addresses = await leather.getAddresses();
```
