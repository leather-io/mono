import { AnimatePresence, motion } from 'framer-motion';
import { Box } from 'leather-styles/jsx';

import { CryptoAssetBalance, InputCurrencyMode, whenInputCurrencyMode } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';
import { Balance } from '@app/components/balance/balance';

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
    <Box height="16px">
      <AnimatePresence initial={false}>
        {displayBalance && (
          <motion.div
            key={inputCurrencyMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Balance
              textStyle="label.03"
              color="ink.text-subdued"
              balance={displayBalance}
              formatCurrency={formatCurrency}
              formattingOptions={{ showCurrency: inputCurrencyMode === 'quote' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
