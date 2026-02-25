import { Flex, styled } from 'leather-styles/jsx';

import type { UtxoItem } from '../mock-data';

interface UtxoRowProps {
  utxo: UtxoItem;
}

export function UtxoRow({ utxo }: UtxoRowProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      py="space.02"
      px="space.03"
      bg="ink.background-secondary"
      borderRadius="xs"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        UTXO #{utxo.index}
      </styled.span>
      <Flex gap="space.04" alignItems="center">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {utxo.sats}
        </styled.span>
        <styled.span textStyle="caption.01">{utxo.fiatValue}</styled.span>
      </Flex>
    </Flex>
  );
}
