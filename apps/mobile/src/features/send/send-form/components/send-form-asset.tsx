import { TokenBalance } from '@/features/balances/token-balance';

import { Box, Pressable } from '@leather.io/ui/native';

import { useSendFormContext } from '../send-form-context';

interface SendFormAssetProps {
  assetName: string;
  chain: string;
  icon: React.ReactNode;
  onPress(): void;
}
export function SendFormAsset({ assetName, chain, icon, onPress }: SendFormAssetProps) {
  const { availableBalance, fiatBalance, symbol } = useSendFormContext();

  return (
    <Pressable onPress={onPress}>
      <Box borderColor="ink.border-default" borderRadius="sm" borderWidth={1} p="4" mb="0">
        <TokenBalance
          availableBalance={availableBalance}
          chain={chain}
          fiatBalance={fiatBalance}
          icon={icon}
          ticker={symbol}
          tokenName={assetName}
        />
      </Box>
    </Pressable>
  );
}
