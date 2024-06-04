import type { Meta } from '@storybook/react';
import { Flex } from 'leather-styles/jsx';

import { IconButton } from '../../components/icon-button/icon-button.web';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, SwapIcon } from '../../icons/index';
import { AccountCard as Component } from './account.card.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Layout/AccountCard',
};

export default meta;

export function AccountCard() {
  return (
    <Component
      name="leather.btc"
      balance="$1,000"
      toggleSwitchAccount={() => null}
      isLoadingBalance={false}
      isFetchingBnsName={false}
    >
      <Flex justify="space-between">
        <IconButton icon={<ArrowUpIcon />} label="Send" />
        <IconButton icon={<ArrowDownIcon />} label="Receive" />
        <IconButton icon={<PlusIcon />} label="Buy" />
        <IconButton icon={<SwapIcon />} label="Swap" />
      </Flex>
    </Component>
  );
}

export function AccountCardLoading() {
  return (
    <Component
      name="leather.btc"
      balance="$1,000"
      toggleSwitchAccount={() => null}
      isLoadingBalance
      isFetchingBnsName={false}
    >
      <Flex justify="space-between">
        <IconButton icon={<ArrowUpIcon />} label="Send" />
        <IconButton icon={<ArrowDownIcon />} label="Receive" />
        <IconButton icon={<PlusIcon />} label="Buy" />
        <IconButton icon={<SwapIcon />} label="Swap" />
      </Flex>
    </Component>
  );
}

export function AccountCardBnsNameLoading() {
  return (
    <Component
      name="leather.btc"
      balance="$1,000"
      toggleSwitchAccount={() => null}
      isLoadingBalance={false}
      isFetchingBnsName
    >
      <Flex justify="space-between">
        <IconButton icon={<ArrowUpIcon />} label="Send" />
        <IconButton icon={<ArrowDownIcon />} label="Receive" />
        <IconButton icon={<PlusIcon />} label="Buy" />
        <IconButton icon={<SwapIcon />} label="Swap" />
      </Flex>
    </Component>
  );
}
