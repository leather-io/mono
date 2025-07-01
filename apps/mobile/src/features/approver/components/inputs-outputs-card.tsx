import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { t } from '@lingui/macro';

import { PsbtInput, PsbtOutput } from '@leather.io/bitcoin';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney } from '@leather.io/utils';

import { UtxoRow } from './utxo-row';

interface InputsAndOutputsCardProps {
  inputs: PsbtInput[];
  outputs: PsbtOutput[];
}

export function InputsAndOutputsCard({ inputs, outputs }: InputsAndOutputsCardProps) {
  const { data: btcMarketData } = useBtcMarketDataQuery();

  function annotateWithMoney<T extends PsbtInput | PsbtOutput>(inputOutput: T) {
    const btcAmount = createMoney(Number(inputOutput.value), 'BTC');
    const quoteAmount = baseCurrencyAmountInQuoteWithFallback(btcAmount, btcMarketData);
    return {
      ...inputOutput,
      btcAmount,
      quoteAmount,
    };
  }

  const inputsWithMoney = inputs.map(annotateWithMoney);
  const outputsWithMoney = outputs.map(annotateWithMoney);

  return (
    <Box gap="5">
      <Text variant="label02">
        {t({
          id: 'approver.inputs-outputs.title',
          message: 'Inputs and outputs',
        })}
      </Text>
      <Box gap="1">
        <Text variant="label02">
          {t({
            id: 'approver.inputs-outputs.input.title',
            message: 'Input',
          })}
        </Text>
        <Box mx="-5">
          {inputsWithMoney.map(annotateWithMoney).map(input => (
            <UtxoRow
              key={input.txid + input.address + input.btcAmount.amount.valueOf()}
              txid={input.txid}
              address={input.address}
              btcAmount={input.btcAmount}
              quoteAmount={input.quoteAmount}
              isLocked
            />
          ))}
        </Box>
      </Box>
      <Box gap="1">
        <Text variant="label02">
          {t({
            id: 'approver.inputs-outputs.output.title',
            message: 'Output',
          })}
        </Text>
        <Box mx="-5">
          {outputsWithMoney.map(output => (
            <UtxoRow
              key={output.address + output.btcAmount.amount.valueOf()}
              address={output.address}
              btcAmount={output.btcAmount}
              quoteAmount={output.quoteAmount}
              isLocked
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
