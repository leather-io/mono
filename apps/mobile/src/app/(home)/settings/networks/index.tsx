import { useToastContext } from '@/components/toast/toast-context';
import { defaultNetworkPreferences, useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import {
  DefaultNetworkConfigurations,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import {
  Cell,
  GlobeIcon,
  PlaceholderIcon,
  PlaygroundFormsIcon,
  TestTubeIcon,
} from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import SettingsScreenLayout from '../settings-screen.layout';

function getNetworkIcon(network: DefaultNetworkConfigurations) {
  switch (network) {
    case WalletDefaultNetworkConfigurationIds.mainnet:
      return <GlobeIcon />;
    case WalletDefaultNetworkConfigurationIds.testnet:
      return <TestTubeIcon />;
    case WalletDefaultNetworkConfigurationIds.signet:
      return <PlaygroundFormsIcon />;
    default:
      return <PlaceholderIcon />;
  }
}

export default function SettingsNetworksScreen() {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onChangeNetwork(network: DefaultNetworkConfigurations) {
    settings.changeNetworkPreference(network);
    displayToast({
      title: t({
        id: 'settings.networks.toast_title',
        message: 'Network changed',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsScreenLayout>
      {defaultNetworkPreferences.map(network => (
        <Cell.Root
          icon={getNetworkIcon(network)}
          title={i18n._({
            id: 'networks.cell_title',
            message: '{network}',
            values: { network: capitalize(network) },
          })}
          caption={
            settings.networkPreference.id === network
              ? t({
                  id: 'networks.cell_caption_enabled',
                  message: 'Enabled',
                })
              : t({
                  id: 'networks.cell_caption_disabled',
                  message: 'Disabled',
                })
          }
          key={network}
          onPress={() => onChangeNetwork(network)}
        >
          <Cell.Radio isSelected={settings.networkPreference.id === network} />
        </Cell.Root>
      ))}
    </SettingsScreenLayout>
  );
}
