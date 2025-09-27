import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Balance } from '@/components/balance/balance';
import { InputCurrencyMode } from '@/utils/types';

import { CryptoAssetBalance } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

interface BalancePreviewProps {
  balance?: {
    quote: CryptoAssetBalance;
    crypto: CryptoAssetBalance;
  };
  inputCurrencyMode: InputCurrencyMode;
}

export function BaseAssetBalance({ balance, inputCurrencyMode }: BalancePreviewProps) {
  const displayBalance =
    inputCurrencyMode === 'crypto'
      ? balance?.crypto.availableBalance
      : balance?.quote.availableBalance;

  return (
    <Box height={16}>
      {displayBalance && (
        <Animated.View
          key={inputCurrencyMode}
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
        >
          <Balance
            variant="label03"
            color="ink.text-subdued"
            balance={displayBalance}
            formattingOptions={{ showCurrency: inputCurrencyMode === 'quote' }}
          />
        </Animated.View>
      )}
    </Box>
  );
}
