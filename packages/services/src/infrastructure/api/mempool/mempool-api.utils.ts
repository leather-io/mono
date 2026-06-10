import {
  WalletDefaultNetworkConfigurationIds,
  defaultNetworkConfigurationsSchema,
} from '@leather.io/models';

import {
  selectBitcoinApiUrl,
  selectNetworkConfigurationId,
} from '../../settings/settings.selectors';
import { UserSettings } from '../../settings/settings.service';

export function getMempoolUrlFromUserSettings(settings: UserSettings): string | null {
  const networkConfigurationId = selectNetworkConfigurationId(settings);
  const isCustomNetwork =
    !defaultNetworkConfigurationsSchema.safeParse(networkConfigurationId).success;
  return isCustomNetwork ||
    networkConfigurationId === WalletDefaultNetworkConfigurationIds.sbtcTestnet ||
    networkConfigurationId === WalletDefaultNetworkConfigurationIds.sbtcDevenv
    ? selectBitcoinApiUrl(settings)
    : null;
}
