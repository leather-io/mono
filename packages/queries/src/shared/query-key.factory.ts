import type { UserSettings } from '@leather.io/services';

import {
  type QueryPrefix,
  type QuerySettingsDep,
  querySettingsDepsRegistry,
} from './query-key.registry';

const querySettingsDepExtractors: Record<QuerySettingsDep, (settings: UserSettings) => unknown> = {
  currency: settings => settings.quoteCurrency,
  network: settings => settings.network.id,
  assetVisibility: settings => settings.assetVisibility,
};

export function createServiceQueryKey(
  prefix: QueryPrefix,
  params: readonly unknown[],
  settings: UserSettings
) {
  return [
    prefix,
    ...params,
    ...querySettingsDepsRegistry[prefix].map(dep => querySettingsDepExtractors[dep](settings)),
  ] as const;
}
