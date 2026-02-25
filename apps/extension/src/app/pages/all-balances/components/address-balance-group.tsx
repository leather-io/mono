import { Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer } from '@leather.io/ui';

import { UtxoRow } from './utxo-row';

interface UtxoDisplay {
  label: string;
  sats: string;
  fiatValue: string;
}

interface AddressBalanceGroupProps {
  addressType: string;
  address: string;
  fiatValue: string;
  cryptoValue: string;
  utxos: UtxoDisplay[];
}

export function AddressBalanceGroup({
  addressType,
  address,
  fiatValue,
  cryptoValue,
  utxos,
}: AddressBalanceGroupProps) {
  return (
    <Stack gap="space.03" py="space.04">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {addressType}
      </styled.span>
      <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
        <AddressDisplayer address={address} />
        <Stack alignItems="flex-end" gap="space.01" flexShrink={0}>
          <styled.span textStyle="label.02">{fiatValue}</styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {cryptoValue}
          </styled.span>
        </Stack>
      </Flex>
      <Stack gap="space.01">
        {utxos.map((utxo, index) => (
          <UtxoRow key={index} label={utxo.label} sats={utxo.sats} fiatValue={utxo.fiatValue} />
        ))}
      </Stack>
    </Stack>
  );
}
