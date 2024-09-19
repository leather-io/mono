import { useToastContext } from '@/components/toast/toast-context';
import { defaultNetworkPreferences, useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import {
  DefaultNetworkConfigurations,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import { GlobeIcon, PlaygroundFormsIcon, TestTubeIcon } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import SettingsScreenLayout from '../settings-screen.layout';
import { NetworkCell } from './network-cell';

function getNetworkIcon(network: DefaultNetworkConfigurations) {
  switch (network) {
    case WalletDefaultNetworkConfigurationIds.mainnet:
      return <GlobeIcon />;
    case WalletDefaultNetworkConfigurationIds.testnet:
      return <TestTubeIcon />;
    case WalletDefaultNetworkConfigurationIds.signet:
      return <PlaygroundFormsIcon />;
    default:
      return <></>;
  }
}

export default function SettingsNetworksScreen() {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onChangeNetwork(network: DefaultNetworkConfigurations) {
    settings.changeNetworkPreference(network);
    displayToast({ title: t`Network changed`, type: 'success' });
  }

  return (
    <SettingsScreenLayout>
      {defaultNetworkPreferences.map(network => (
        <NetworkCell
          key={network}
          caption={settings.networkPreference.id === network ? t`Enabled` : t`Disabled`}
          icon={getNetworkIcon(network)}
          isSelected={settings.networkPreference.id === network}
          onChangeNetwork={() => onChangeNetwork(network)}
          title={i18n._(capitalize(network))}
        />
      ))}
    </SettingsScreenLayout>
  );
}
