import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import SettingsLayout from '@/features/settings/settings-layout';
import { useSettings } from '@/store/settings/settings';
import { defaultNetworkPreferences } from '@/store/settings/utils';
import { t } from '@lingui/core/macro';

import {
  DefaultNetworkConfigurations,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import {
  GlobeIcon,
  PlaceholderIcon,
  PlaygroundFormsIcon,
  TestTubeIcon,
} from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

function getNetworkIcon(network: DefaultNetworkConfigurations) {
  switch (network) {
    case WalletDefaultNetworkConfigurationIds.mainnet:
      return <GlobeIcon />;
    case WalletDefaultNetworkConfigurationIds.testnet4:
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

  function onChangeNetwork(network: DefaultNetworkConfigurations) {
    settings.changeNetworkPreference(network);
    displayToast({
      title: t`Changed network`,
      type: 'success',
    });
  }

  return (
    <SettingsLayout title={t`Networks`}>
      <SettingsList>
        {defaultNetworkPreferences.map(network => (
          <SettingsListItem
            icon={getNetworkIcon(network)}
            title={capitalize(network)}
            caption={settings.networkPreference.id === network ? t`Enabled` : t`Disabled`}
            key={network}
            onPress={() => onChangeNetwork(network)}
            type="radio"
            isRadioSelected={settings.networkPreference.id === network}
          />
        ))}
      </SettingsList>
    </SettingsLayout>
  );
}
