import { AllBalancesSelectors } from '@tests/selectors/all-balances.selectors';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, ItemLayout } from '@leather.io/ui';

import { BalanceAmount } from './balance-amount';

interface UtxoRowDisplay {
  key: string;
  label: string;
  caption?: string;
  fiatValue: string;
  cryptoValue: string;
}

interface AddressBalanceGroupProps {
  address: string;
  addressTypeLabel?: string;
  fiatValue: string;
  cryptoValue: string;
  utxos: UtxoRowDisplay[];
}

export function AddressBalanceGroup({
  address,
  addressTypeLabel,
  fiatValue,
  cryptoValue,
  utxos,
}: AddressBalanceGroupProps) {
  return (
    <Stack gap="space.03" py="space.04" data-testid={AllBalancesSelectors.DetailAddressGroup}>
      {addressTypeLabel && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {addressTypeLabel}
        </styled.span>
      )}
      <Flex justifyContent="space-between" alignItems="flex-start" gap="space.04">
        {address ? (
          <AddressDisplayer address={address} />
        ) : (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Address unavailable
          </styled.span>
        )}
        <Stack alignItems="flex-end" gap="space.01" flexShrink={0}>
          <BalanceAmount
            textStyle="label.02"
            value={fiatValue}
            skeletonWidth="64px"
            skeletonHeight="20px"
          />
          <BalanceAmount
            textStyle="caption.01"
            color="ink.text-subdued"
            value={cryptoValue}
            skeletonWidth="48px"
            skeletonHeight="16px"
          />
        </Stack>
      </Flex>
      <Stack gap="space.01">
        {utxos.map(utxo => (
          <Box
            key={utxo.key}
            py="space.02"
            px="space.03"
            bg="ink.background-secondary"
            borderRadius="xs"
            data-testid={AllBalancesSelectors.DetailUtxoRow}
          >
            <ItemLayout
              titleLeft={
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {utxo.label}
                </styled.span>
              }
              captionLeft={utxo.caption ?? null}
              titleRight={
                <BalanceAmount
                  textStyle="caption.01"
                  value={utxo.fiatValue}
                  skeletonWidth="48px"
                  skeletonHeight="16px"
                />
              }
              captionRight={
                <BalanceAmount
                  textStyle="caption.01"
                  color="ink.text-subdued"
                  value={utxo.cryptoValue}
                  skeletonWidth="48px"
                  skeletonHeight="16px"
                />
              }
            />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
