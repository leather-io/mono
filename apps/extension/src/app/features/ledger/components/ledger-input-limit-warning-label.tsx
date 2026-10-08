import type { BoxProps } from 'leather-styles/jsx';

import { LEDGER_BITCOIN_MAX_INPUTS } from '@leather.io/constants';
import type { Money } from '@leather.io/models';
import { Callout } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';

const ledgerInputLimitWarningTitle = 'Transaction too large for Ledger';

function getLedgerInputLimitWarningText(inputCount: number, maxAmount?: Money) {
  if (maxAmount)
    return `Ledger can sign at most ${LEDGER_BITCOIN_MAX_INPUTS} inputs per transaction, but this transaction would use ${inputCount}. Send ${formatCurrency(maxAmount, { preset: 'pad-decimals' })} or less, or split the payment into multiple transactions.`;
  return `Ledger can sign at most ${LEDGER_BITCOIN_MAX_INPUTS} inputs per transaction, but this PSBT has ${inputCount} inputs. Ask the requesting app to build a smaller transaction.`;
}

interface LedgerInputLimitWarningLabelProps extends BoxProps {
  inputCount: number;
  maxAmount?: Money;
}
export function LedgerInputLimitWarningLabel({
  inputCount,
  maxAmount,
  ...props
}: LedgerInputLimitWarningLabelProps) {
  return (
    <Callout variant="warning" title={ledgerInputLimitWarningTitle} textAlign="left" {...props}>
      {getLedgerInputLimitWarningText(inputCount, maxAmount)}
    </Callout>
  );
}
