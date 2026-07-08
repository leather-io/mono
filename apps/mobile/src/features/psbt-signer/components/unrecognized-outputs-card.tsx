import { Balance } from '@/components/balance/balance';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { t } from '@lingui/core/macro';

import { PsbtOutput } from '@leather.io/bitcoin';
import { Avatar, Cell, ErrorTriangleIcon } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney } from '@leather.io/utils';

const payToAnchorScriptType = 'p2a';

function getUnrecognizedOutputLabel(scriptType: string) {
  if (scriptType === payToAnchorScriptType) return t`Pay-to-anchor output`;
  return t`Unrecognized output`;
}

interface UnrecognizedOutputsCardProps {
  outputs: PsbtOutput[];
}
export function UnrecognizedOutputsCard({ outputs }: UnrecognizedOutputsCardProps) {
  const { data: btcMarketData } = useBtcMarketDataQuery();

  return (
    <>
      {outputs.map((output, index) => {
        const btcAmount = createMoney(output.value, 'BTC');
        const quoteAmount = baseCurrencyAmountInQuoteWithFallback(btcAmount, btcMarketData);
        return (
          <Cell.Root key={`${output.scriptType}-${output.value}-${index}`} pressable={false}>
            <Cell.Icon>
              <Avatar icon={<ErrorTriangleIcon color="red.action-primary-default" />} />
            </Cell.Icon>
            <Cell.Content>
              <Cell.Label variant="primary">
                {getUnrecognizedOutputLabel(output.scriptType)}
              </Cell.Label>
            </Cell.Content>
            <Cell.Aside>
              <Balance balance={btcAmount} variant="label02" />
              <Balance balance={quoteAmount} variant="label02" color="ink.text-subdued" />
            </Cell.Aside>
          </Cell.Root>
        );
      })}
    </>
  );
}
