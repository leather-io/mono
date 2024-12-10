import { useMemo, useState } from 'react';

import { formatBalance } from '@/components/balance/balance';
import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { BitcoinFeeCard } from '@/features/approver/components/bitcoin-fee-card';
import { BitcoinOutcome } from '@/features/approver/components/bitcoin-outcome';
import { InputsAndOutputsCard } from '@/features/approver/components/inputs-outputs-card';
import { OutcomeAddressesCard } from '@/features/approver/components/outcome-addresses-card';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { t } from '@lingui/macro';

import { getPsbtAsTransaction, getPsbtDetails } from '@leather.io/bitcoin';
import { FeeTypes } from '@leather.io/models';
import { useBitcoinBroadcastTransaction, useCurrentNetworkState } from '@leather.io/query';
import { Approver, Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, sumMoney } from '@leather.io/utils';

import { ApproverButtons } from '../approver/components/approver-buttons';
import { ApproverState } from '../approver/utils';
import { usePsbtAccounts } from './use-psbt-accounts';
import { usePsbtPayers } from './use-psbt-payers';
import { usePsbtSigner } from './use-psbt-signer';

interface PsbtSignerProps {
  psbtHex: string;
  onEdit(): void;
  onSuccess(): void;
}

export function PsbtSigner({ psbtHex, onEdit, onSuccess }: PsbtSignerProps) {
  const network = useCurrentNetworkState();
  const psbtAccounts = usePsbtAccounts({ psbtHex });
  const psbtPayers = usePsbtPayers({ psbtHex });
  const psbtAddresses = psbtPayers.map(payer => payer.address);
  const { sign } = usePsbtSigner();
  const { broadcastTx } = useBitcoinBroadcastTransaction();
  const [approverState, setApproverState] = useState<ApproverState>('start');
  const { data: btcMarketData } = useBtcMarketDataQuery();

  const psbtDetails = useMemo(
    () =>
      getPsbtDetails({
        psbtHex,
        psbtAddresses,
        networkMode: network.chain.bitcoin.mode,
      }),
    [psbtHex, network, psbtAddresses]
  );
  const totalBtc = sumMoney([
    psbtDetails.addressNativeSegwitTotal,
    psbtDetails.addressTaprootTotal,
  ]);

  const totalSpend = baseCurrencyAmountInQuoteWithFallback(totalBtc, btcMarketData);
  async function onSubmitTransaction() {
    setApproverState('submitting');
    const psbt = getPsbtAsTransaction(psbtHex);
    const signedTx = await sign(psbt.toPSBT());
    signedTx.finalize();
    await broadcastTx({
      // TODO: for now
      skipSpendableCheckUtxoIds: 'all',
      onSuccess() {
        setApproverState('submitted');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      },
      tx: signedTx.hex,
    });
  }

  return (
    <Approver requester="https://leather.io">
      <Approver.Container>
        <Approver.Header
          title={t({
            id: 'approver.send.title',
            message: 'Send',
          })}
        />
        <Approver.Section>
          <ApproverAccountCard accounts={psbtAccounts} />
        </Approver.Section>
        <Approver.Section>
          <BitcoinOutcome amount={psbtDetails.addressNativeSegwitTotal} />
          <Box alignSelf="center" bg="ink.border-transparent" height={1} width="100%" my="3" />
          <OutcomeAddressesCard addresses={psbtDetails.psbtOutputs.map(o => o.address)} />
        </Approver.Section>
        <Approver.Section>
          <BitcoinFeeCard feeType={FeeTypes.Middle} amount={psbtDetails.fee} />
        </Approver.Section>
        <Approver.Advanced
          titleClosed={t({
            id: 'approver.advanced.show',
            message: 'Show advanced options',
          })}
          titleOpened={t({
            id: 'approver.advanced.hide',
            message: 'Hide advanced options',
          })}
        >
          <Approver.Section noTopPadding>
            <InputsAndOutputsCard
              inputs={psbtDetails.psbtInputs}
              outputs={psbtDetails.psbtOutputs}
            />
          </Approver.Section>
        </Approver.Advanced>
      </Approver.Container>
      <Approver.Footer>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="label02">
            {t({
              id: 'approver.total_spend',
              message: 'Total spend',
            })}
          </Text>
          <Text variant="label02">{formatBalance(totalSpend, true)}</Text>
        </Box>
        <Approver.Actions>
          <ApproverButtons
            approverState={approverState}
            onEdit={onEdit}
            onApprove={onSubmitTransaction}
          />
        </Approver.Actions>
      </Approver.Footer>
      {approverState !== 'start' && (
        <Box
          position="absolute"
          top={0}
          bottom={0}
          right={0}
          left={0}
          backgroundColor="ink.background-overlay"
        />
      )}
    </Approver>
  );
}
