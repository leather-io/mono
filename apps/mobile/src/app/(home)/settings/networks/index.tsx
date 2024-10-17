import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { NetworkBadge } from '@/components/network-badge';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { defaultNetworkPreferences } from '@/store/settings/utils';
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
    <AnimatedHeaderScreenLayout
      rightHeaderElement={<NetworkBadge />}
      title={t({
        id: 'networks.header_title',
        message: 'Networks',
      })}
    >
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
    </AnimatedHeaderScreenLayout>
  );
}
