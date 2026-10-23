import { defaultCurrentNetwork } from '@leather.io/models';

import type { UserSettings } from '../infrastructure/settings/settings.service';

export function createTestUserSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    network: defaultCurrentNetwork,
    quoteCurrency: 'USD',
    assetVisibility: {},
    ...overrides,
  };
}
