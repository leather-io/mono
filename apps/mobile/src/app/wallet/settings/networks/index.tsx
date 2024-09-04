import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';

import { DefaultNetworkConfigurations } from '@leather.io/models';

import NetworksScreenLayout from './networks-screen.layout';
import NetworksSwitcher from './networks-switcher';

export default function SettingsNetworksScreen() {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onChangeNetwork(network: DefaultNetworkConfigurations) {
    settings.changeNetwork(network);
    displayToast({ title: t`Network changed`, type: 'success' });
  }

  return (
    <NetworksScreenLayout>
      <NetworksSwitcher
        activeNetwork={settings.network.id as DefaultNetworkConfigurations}
        onChangeNetwork={onChangeNetwork}
      />
    </NetworksScreenLayout>
  );
}
