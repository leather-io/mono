import { useState } from 'react';

import { formatBalance } from '@/components/balance/balance';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { destructAccountIdentifier } from '@/store/utils';
import { t } from '@lingui/macro';
import {
  StacksTransaction,
  TokenTransferPayload,
  addressToString,
  deserializeTransaction,
} from '@stacks/transactions';

import { type CryptoCurrency, FeeTypes } from '@leather.io/models';
import { Approver, Box, Text } from '@leather.io/ui/native';
import {
  baseCurrencyAmountInQuoteWithFallback,
  convertToMoneyTypeWithDefaultOfZero,
} from '@leather.io/utils';

import { ApproverAccountCard } from '../approver/components/approver-account-card';
import { ApproverButtons } from '../approver/components/approver-buttons';
import { OutcomeAddressesCard } from '../approver/components/outcome-addresses-card';
import { StacksFeeCard } from '../approver/components/stacks-fee-card';
import { StacksOutcome } from '../approver/components/stacks-outcome';
import { ApproverState } from '../approver/utils';
import { useBroadcastStxTransaction } from './use-broadcast-stx-transaction';

function formReviewTxSummary({ tx, symbol }: { tx: StacksTransaction; symbol: CryptoCurrency }) {
  if (symbol !== 'STX') {
    throw new Error('No support for SIP10');
  }
  const payload = tx.payload as TokenTransferPayload;
  const txValue = payload.amount;
  const fee = tx.auth.spendingCondition.fee;
  const totalSpendMoney = convertToMoneyTypeWithDefaultOfZero('STX', Number(txValue + fee));
  const feeMoney = convertToMoneyTypeWithDefaultOfZero('STX', Number(fee));

  return {
    recipient: addressToString(payload.recipient.address),
    feeMoney,
    totalSpendMoney,
    symbol: 'STX',
  };
}
interface StacksTxSignerProps {
  txHex: string;
  onEdit(): void;
  onSuccess(): void;
  accountId: string;
}

export function StacksTxSigner({ txHex, onEdit, onSuccess, accountId }: StacksTxSignerProps) {
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const tx = deserializeTransaction(txHex);
  const { mutateAsync: broadcastTransaction } = useBroadcastStxTransaction();

  const { data: stxMarketData } = useStxMarketDataQuery();
  const { recipient, feeMoney, totalSpendMoney } = formReviewTxSummary({
    tx,
    symbol: 'STX',
  });
  const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
  const signer = useStacksSigners().fromAccountIndex(fingerprint, accountIndex)[0];
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!account) {
    throw new Error('No account found');
  }
  const totalSpendUsd = baseCurrencyAmountInQuoteWithFallback(totalSpendMoney, stxMarketData);

  const [approverState, setApproverState] = useState<ApproverState>('start');
  async function onSubmitTransaction() {
    setApproverState('submitting');
    if (!signer) {
      throw new Error('No signer provided');
    }
    try {
      const signedTx = await signer?.sign(tx);
      await broadcastTransaction({ tx: signedTx, stacksNetwork });
      setApproverState('submitted');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (e) {
      /* eslint-disable-next-line no-console  */
      console.log(e);
      setApproverState('start');
    }
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
          <Box />
          <ApproverAccountCard accounts={[account]} />
        </Approver.Section>
        <Approver.Section>
          <StacksOutcome amount={totalSpendMoney} />
          <Box alignSelf="center" bg="ink.border-transparent" height={1} width="100%" my="3" />
          <OutcomeAddressesCard addresses={[recipient]} />
        </Approver.Section>
        <Approver.Section>
          <Box />
          <StacksFeeCard feeType={FeeTypes.Middle} amount={feeMoney} />
        </Approver.Section>
      </Approver.Container>
      <Approver.Footer>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="label02">
            {t({
              id: 'approver.total_spend',
              message: 'Total spend',
            })}
          </Text>
          <Text variant="label02">{formatBalance(totalSpendUsd, true)}</Text>
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
