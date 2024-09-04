import { t } from '@lingui/macro';

import { DefaultNetworkConfigurations } from '@leather.io/models';
import {
  Avatar,
  Flag,
  GlobeIcon,
  ItemLayout,
  PlaygroundFormsIcon,
  RadioButton,
  TestTubeIcon,
  TouchableOpacity,
} from '@leather.io/ui/native';

interface NetworksSwitcherProps {
  activeNetwork: DefaultNetworkConfigurations;
  onChangeNetwork(network: DefaultNetworkConfigurations): void;
}
export default function NetworksSwitcher({
  activeNetwork,
  onChangeNetwork,
}: NetworksSwitcherProps) {
  return (
    <>
      <TouchableOpacity onPress={() => onChangeNetwork('mainnet')}>
        <Flag
          img={
            <Avatar>
              <GlobeIcon />
            </Avatar>
          }
        >
          <ItemLayout
            actionIcon={<RadioButton disabled isSelected={activeNetwork === 'mainnet'} />}
            titleLeft={t`Mainnet`}
            captionLeft={activeNetwork === 'mainnet' ? t`Enabled` : t`Disabled`}
          />
        </Flag>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChangeNetwork('testnet')}>
        <Flag
          img={
            <Avatar>
              <TestTubeIcon />
            </Avatar>
          }
        >
          <ItemLayout
            actionIcon={<RadioButton disabled isSelected={activeNetwork === 'testnet'} />}
            titleLeft={t`Testnet`}
            captionLeft={activeNetwork === 'testnet' ? t`Enabled` : t`Disabled`}
          />
        </Flag>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onChangeNetwork('signet')}>
        <Flag
          img={
            <Avatar>
              <PlaygroundFormsIcon />
            </Avatar>
          }
        >
          <ItemLayout
            actionIcon={<RadioButton disabled isSelected={activeNetwork === 'signet'} />}
            titleLeft={t`Signet`}
            captionLeft={activeNetwork === 'signet' ? t`Enabled` : t`Disabled`}
          />
        </Flag>
      </TouchableOpacity>
    </>
  );
}
