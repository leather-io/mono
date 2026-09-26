import {
  WalletDefaultNetworkConfigurationIds,
  defaultNetworkConfigurationsSchema,
  isPublicMempoolUrl,
} from '@leather.io/models';

import {
  selectBitcoinApiUrl,
  selectBitcoinNetworkMode,
  selectNetworkConfigurationId,
} from '../../settings/settings.selectors';
import { UserSettings } from '../../settings/settings.service';

function isCustomNetwork(settings: UserSettings) {
  return !defaultNetworkConfigurationsSchema.safeParse(selectNetworkConfigurationId(settings))
    .success;
}

export function shouldReadBitcoinFromMempool(settings: UserSettings) {
  if (selectBitcoinNetworkMode(settings) === 'regtest') return true;
  return !isCustomNetwork(settings) && !isPublicMempoolUrl(selectBitcoinApiUrl(settings));
}

export function getMempoolUrlFromUserSettings(settings: UserSettings): string | null {
  const networkConfigurationId = selectNetworkConfigurationId(settings);
  return isCustomNetwork(settings) ||
    networkConfigurationId === WalletDefaultNetworkConfigurationIds.sbtcTestnet ||
    networkConfigurationId === WalletDefaultNetworkConfigurationIds.sbtcDevenv ||
    networkConfigurationId === WalletDefaultNetworkConfigurationIds['private-1'] ||
    networkConfigurationId === WalletDefaultNetworkConfigurationIds.stakingTestnet
    ? selectBitcoinApiUrl(settings)
    : null;
}
