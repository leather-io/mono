import { useState } from 'react';

import { formatBalance } from '@/components/balance/balance';
import { useToastContext } from '@/components/toast/toast-context';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { destructAccountIdentifier } from '@/store/utils';
import { t } from '@lingui/macro';
import { deserializeTransaction } from '@stacks/transactions';

import { Approver, Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

import { ApproverAccountCard } from '../approver/components/approver-account-card';
import { ApproverButtons } from '../approver/components/approver-buttons';
import { OutcomeAddressesCard } from '../approver/components/outcome-addresses-card';
import { StacksOutcome } from '../approver/components/stacks-outcome';
import { MemoSection } from '../approver/memo.section';
import { NonceSection } from '../approver/nonce.section';
import { StacksFeesSection } from '../approver/stacks-fees.section';
import { ApproverState, getFormReviewTxSummary, useTxOptions } from '../approver/utils';
import { useBroadcastStxTransaction } from './use-broadcast-stx-transaction';

interface StacksTxSignerProps {
  txHex: string;
  onEdit(): void;
  onSuccess(): void;
  accountId: string;
}

export function StacksTxSigner({
  txHex: _txHex,
  onEdit,
  onSuccess,
  accountId,
}: StacksTxSignerProps) {
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const [txHex, setTxHex] = useState(_txHex);
  const tx = deserializeTransaction(txHex);
  const { displayToast } = useToastContext();

  const { mutateAsync: broadcastTransaction } = useBroadcastStxTransaction();

  const { data: stxMarketData } = useStxMarketDataQuery();
  const { recipient, totalSpendMoney } = getFormReviewTxSummary({
    tx,
    symbol: 'STX',
  });
  const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
  const signer = useStacksSigners().fromAccountIndex(fingerprint, accountIndex)[0];
  if (!signer) throw new Error('No signer found');

  const account = useAccountByIndex(fingerprint, accountIndex);

  const txOptions = useTxOptions(signer);

  if (!account) throw new Error('No account found');

  const totalSpendUsd = baseCurrencyAmountInQuoteWithFallback(totalSpendMoney, stxMarketData);

  const [approverState, setApproverState] = useState<ApproverState>('start');
  async function onSubmitTransaction() {
    setApproverState('submitting');
    if (!signer) {
      throw new Error('No signer provided');
    }

    try {
      const signedTx = await signer?.sign(tx);

      await broadcastTransaction(
        { tx: signedTx, stacksNetwork },
        {
          onSuccess() {
            setApproverState('submitted');
            setTimeout(() => onSuccess(), 1000);
          },
        }
      );
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.broadcast',
          message: 'Failed to broadcast transaction',
        }),
        type: 'error',
      });
      setApproverState('start');
    }
  }

  return (
    <>
      <Approver requester="https://leather.io">
        <Approver.Container>
          <Approver.Header
            title={t({
              id: 'approver.send.title',
              message: 'Send',
            })}
          />
          <Approver.Section>
            <Box />
            <ApproverAccountCard accounts={[account]} />
          </Approver.Section>
          <Approver.Section>
            <StacksOutcome amount={totalSpendMoney} />
            <Box alignSelf="center" bg="ink.border-transparent" height={1} width="100%" my="3" />
            <OutcomeAddressesCard addresses={[recipient]} />
          </Approver.Section>
          <StacksFeesSection txHex={txHex} setTxHex={setTxHex} txOptions={txOptions} />
          <NonceSection txHex={txHex} setTxHex={setTxHex} txOptions={txOptions} />
          <MemoSection txHex={txHex} setTxHex={setTxHex} txOptions={txOptions} isMemoEditable />
        </Approver.Container>
        <Approver.Footer>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="label02">
              {t({
                id: 'approver.total_spend',
                message: 'Total spend',
              })}
            </Text>
            <Text variant="label02">{formatBalance({ balance: totalSpendUsd, isFiat: true })}</Text>
          </Box>
          <Approver.Actions>
            <ApproverButtons
              approverState={approverState}
              onBack={onEdit}
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
    </>
  );
}
