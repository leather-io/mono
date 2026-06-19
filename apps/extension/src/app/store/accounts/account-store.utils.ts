// Mirrors the mobile accounts store shape (`apps/mobile/src/store/accounts`).
// Kept structurally aligned so both apps' accounts slices can later be lifted
// into the shared `@leather.io/state` package.

export type AccountStatus = 'active' | 'hidden';

export interface AccountStore {
  id: string;
  name?: string;
  status?: AccountStatus;
}
