import { useState } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { buildUnsignedMultisigBtcTransfer } from '~/features/multisig/transactions/build-btc-transfer';
import { useProposeTransaction } from '~/features/multisig/transactions/use-propose-transaction';
import { useVaultBtcTransactionFees } from '~/features/multisig/transactions/use-vault-btc-transaction-fees';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useToast } from '~/features/toasts/use-toast';

import type { AuthNetworkId, Money, TransactionFeeTier } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import { btcToSat, createMoney, satToBtc } from '@leather.io/utils';

import { TextField } from '../text-field';

const btcNetworks: AuthNetworkId[] = ['btc:mainnet', 'btc:testnet'];
const feeTiers: TransactionFeeTier[] = ['low', 'standard', 'high'];

function parseBtcAmount(value: string): Money | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const sats = btcToSat(trimmed);
  if (sats.isNaN() || sats.isLessThanOrEqualTo(0)) return undefined;
  return createMoney(sats, 'BTC');
}

// Builds a real unsigned P2WSH multisig transfer via coin selection at the
// proposer-selected feerate tier, then proposes the PSBT to /propose.
export function BtcProposeTool() {
  const [network, setNetwork] = useState<AuthNetworkId>('btc:mainnet');
  const [accountId, setAccountId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedTier, setSelectedTier] = useState<TransactionFeeTier>('standard');
  const { success, error } = useToast();

  const accountQuery = useVaultAccount(network, accountId.trim() || undefined);
  const account = accountQuery.data;
  const recipientAddress = recipient.trim() || undefined;
  const amount = parseBtcAmount(amountInput);

  const feesQuery = useVaultBtcTransactionFees({ account, recipient: recipientAddress, amount });
  const propose = useProposeTransaction(network);

  const statusError = accountQuery.error ?? feesQuery.error;

  async function submit() {
    const feeRate = feesQuery.data?.options[selectedTier].rate;
    if (!account || !recipientAddress || !amount || feeRate === undefined) {
      error('Enter account, recipient, amount, and wait for fees');
      return;
    }
    try {
      const rawPayload = await buildUnsignedMultisigBtcTransfer({
        account,
        recipient: recipientAddress,
        amount,
        feeRate,
      });
      propose.mutate(
        { multisigAddress: account.multisigAddress, rawPayload },
        {
          onSuccess(result) {
            success(`Proposed ${result.id}`);
          },
          onError(err) {
            error(err.message);
          },
        }
      );
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to build transaction');
    }
  }

  return (
    <Flex direction="column" gap="space.02">
      <Flex gap="space.01">
        {btcNetworks.map(option => (
          <Button
            key={option}
            variant={network === option ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => setNetwork(option)}
          >
            {option === 'btc:mainnet' ? 'mainnet' : 'testnet'}
          </Button>
        ))}
      </Flex>
      <TextField placeholder="Vault account ID" value={accountId} onChange={setAccountId} mono />
      <TextField placeholder="bc1q… recipient" value={recipient} onChange={setRecipient} mono />
      <TextField placeholder="Amount (BTC)" value={amountInput} onChange={setAmountInput} />
      <Flex gap="space.01">
        {feeTiers.map(tier => {
          const quote = feesQuery.data?.options[tier];
          return (
            <Button
              key={tier}
              variant={selectedTier === tier ? 'solid' : 'ghost'}
              size="sm"
              disabled={!quote}
              onClick={() => setSelectedTier(tier)}
            >
              {quote ? `${tier} · ${satToBtc(quote.value.amount).toString()}` : tier}
            </Button>
          );
        })}
      </Flex>
      <Button variant="solid" size="sm" disabled={propose.isPending} onClick={submit}>
        {propose.isPending ? 'Proposing…' : 'Propose BTC tx'}
      </Button>
      {statusError ? (
        <styled.span textStyle="caption.02" color="red.action-primary-default">
          {statusError instanceof Error ? statusError.message : 'Unknown error'}
        </styled.span>
      ) : null}
    </Flex>
  );
}
