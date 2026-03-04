import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Balance } from '@/components/balance/balance';

import { CryptoAssetBalance, InputCurrencyMode, whenInputCurrencyMode } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

interface AssetBalanceProps {
  balance?: {
    quote: CryptoAssetBalance;
    crypto: CryptoAssetBalance;
  };
  inputCurrencyMode: InputCurrencyMode;
}

export function AssetBalance({ balance, inputCurrencyMode }: AssetBalanceProps) {
  const displayBalance = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: balance?.crypto.availableBalance,
    quote: balance?.quote.availableBalance,
  });

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
            color="ink.text-subdued-secondary"
            balance={displayBalance}
            formattingOptions={{ showCurrency: inputCurrencyMode === 'quote' }}
          />
        </Animated.View>
      )}
    </Box>
  );
}
