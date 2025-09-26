import { Text } from 'react-native';

import { FungibleCryptoAsset } from '@leather.io/models';

interface SwapProps {
  baseAsset?: FungibleCryptoAsset;
  targetAsset?: FungibleCryptoAsset;
}

export function Swap({ baseAsset, targetAsset }: SwapProps) {
  return (
    <>
      <Text>{baseAsset?.symbol}</Text>
      <Text>{targetAsset?.symbol}</Text>
    </>
  );
}
