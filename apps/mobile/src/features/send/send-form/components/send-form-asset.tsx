import { TokenBalance } from '@/features/balances/token-balance';

import { Box, Pressable } from '@leather.io/ui/native';

import { useSendFormContext } from '../send-form-context';

interface SendFormAssetProps {
  icon: React.ReactNode;
  onPress(): void;
}
export function SendFormAsset({ icon, onPress }: SendFormAssetProps) {
  const { name, protocol, availableBalance, fiatBalance, symbol } = useSendFormContext();

  return (
    <Pressable onPress={onPress}>
      <Box borderColor="ink.border-default" borderRadius="sm" borderWidth={1}>
        <TokenBalance
          availableBalance={availableBalance}
          protocol={protocol}
          fiatBalance={fiatBalance}
          icon={icon}
          ticker={symbol}
          tokenName={name}
        />
      </Box>
    </Pressable>
  );
}
