import { Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer } from '@leather.io/ui';

import type { AddressBalance } from '../mock-data';
import { UtxoRow } from './utxo-row';

interface AddressBalanceGroupProps {
  group: AddressBalance;
}

export function AddressBalanceGroup({ group }: AddressBalanceGroupProps) {
  return (
    <Stack gap="space.03" py="space.04">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {group.addressType}
      </styled.span>
      <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
        <AddressDisplayer address={group.address} />
        <Stack alignItems="flex-end" gap="space.01" flexShrink={0}>
          <styled.span textStyle="label.02">{group.fiatValue}</styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {group.cryptoValue}
          </styled.span>
        </Stack>
      </Flex>
      <Stack gap="space.01">
        {group.utxos.map(utxo => (
          <UtxoRow key={utxo.index} utxo={utxo} />
        ))}
      </Stack>
    </Stack>
  );
}
