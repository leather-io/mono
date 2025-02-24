import type { Meta } from '@storybook/react';

import { ChevronRightIcon } from '../../icons/chevron-right-icon.native';
import { AddressDisplayer } from '../address-displayer/address-displayer.native';
import { BtcAvatarIcon } from '../avatar/btc-avatar-icon.native';
import { Switch } from '../switch/switch.native';
import { Cell } from './cell.native';

const meta: Meta<typeof Cell.Root> = {
  title: 'Cell',
  component: Cell.Root,
};

export default meta;

export const TokenBalance = {
  render: () => {
    return (
      <Cell.Root pressable>
        <Cell.Icon>
          <BtcAvatarIcon />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">Bitcoin</Cell.Label>
          <Cell.Label variant="secondary">Layer 1</Cell.Label>
        </Cell.Content>
        <Cell.Aside>
          <Cell.Label variant="primary">0.0000129269 BTC</Cell.Label>
          <Cell.Label variant="secondary">$123.77</Cell.Label>
        </Cell.Aside>
      </Cell.Root>
    );
  },
};

export const WithSwitch = {
  render: () => {
    return (
      <Cell.Root pressable={false}>
        <Cell.Icon>
          <BtcAvatarIcon />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">Bitcoin</Cell.Label>
          <Cell.Label variant="secondary">Layer 1</Cell.Label>
        </Cell.Content>
        <Cell.Aside>
          <Switch value={false} />
        </Cell.Aside>
      </Cell.Root>
    );
  },
};

export const WithChevron = {
  render: () => {
    return (
      <Cell.Root pressable>
        <Cell.Icon>
          <BtcAvatarIcon />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">Bitcoin</Cell.Label>
          <Cell.Label variant="secondary">Layer 1</Cell.Label>
        </Cell.Content>
        <Cell.Aside>
          <ChevronRightIcon variant="small" />
        </Cell.Aside>
      </Cell.Root>
    );
  },
};

export const Address = {
  render: () => {
    return (
      <Cell.Root pressable={false}>
        <Cell.Icon>
          <BtcAvatarIcon />
        </Cell.Icon>
        <Cell.Content>
          <AddressDisplayer address="bc1pmzfrwwndsqmk5yh69yjr5lfgfg4ev8c0tsc06e" />
        </Cell.Content>
      </Cell.Root>
    );
  },
};
