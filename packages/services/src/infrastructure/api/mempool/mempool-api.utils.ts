import { defaultNetworkConfigurationsSchema } from '@leather.io/models';

import {
  selectBitcoinApiUrl,
  selectNetworkConfigurationId,
} from '../../settings/settings.selectors';
import { type UserSettings } from '../../settings/settings.service';

export function getMempoolUrlFromUserSettings(settings: UserSettings): string | null {
  const networkConfigurationId = selectNetworkConfigurationId(settings);
  const isCustomNetwork =
    !defaultNetworkConfigurationsSchema.safeParse(networkConfigurationId).success;
  return isCustomNetwork ||
    networkConfigurationId === defaultNetworkConfigurationsSchema.enum.primaryStacksTestnet ||
    networkConfigurationId === defaultNetworkConfigurationsSchema.enum.sbtcDevenv ||
    networkConfigurationId === defaultNetworkConfigurationsSchema.enum.btcStakingStacksTestnet
    ? selectBitcoinApiUrl(settings)
    : null;
}
