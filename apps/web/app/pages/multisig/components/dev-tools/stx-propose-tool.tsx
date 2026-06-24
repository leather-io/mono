import { useState } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { buildUnsignedMultisigStxTransfer } from '~/features/multisig/transactions/build-stx-transfer';
import { useProposeTransaction } from '~/features/multisig/transactions/use-propose-transaction';
import { useVaultStxTransactionFees } from '~/features/multisig/transactions/use-vault-stx-transaction-fees';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useToast } from '~/features/toasts/use-toast';

import type { AuthNetworkId, Money, TransactionFeeTier } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import { createMoney, microStxToStx, stxToMicroStx } from '@leather.io/utils';

import { TextField } from '../text-field';

const stxNetworks: AuthNetworkId[] = ['stx:mainnet', 'stx:testnet'];
const feeTiers: TransactionFeeTier[] = ['low', 'standard', 'high'];

function parseStxAmount(value: string): Money | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const microStx = stxToMicroStx(trimmed);
  if (microStx.isNaN() || microStx.isLessThanOrEqualTo(0)) return undefined;
  return createMoney(microStx, 'STX');
}

// Builds a real unsigned multisig STX transfer (placeholder nonce 0), estimates
// tiered fees over it, and proposes the proposer-selected tier to /propose.
export function StxProposeTool() {
  const [network, setNetwork] = useState<AuthNetworkId>('stx:mainnet');
  const [accountId, setAccountId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedTier, setSelectedTier] = useState<TransactionFeeTier>('standard');
  const { success, error } = useToast();

  const accountQuery = useVaultAccount(network, accountId.trim() || undefined);
  const account = accountQuery.data;
  const recipientAddress = recipient.trim() || undefined;
  const amount = parseStxAmount(amountInput);

  const feesQuery = useVaultStxTransactionFees({ account, recipient: recipientAddress, amount });
  const propose = useProposeTransaction(network);

  const statusError = accountQuery.error ?? feesQuery.error;

  async function submit() {
    const fee = feesQuery.data?.options[selectedTier].value;
    if (!account || !recipientAddress || !amount || !fee) {
      error('Enter account, recipient, amount, and wait for fees');
      return;
    }
    try {
      const tx = await buildUnsignedMultisigStxTransfer({
        account,
        recipient: recipientAddress,
        amount,
        fee,
      });
      propose.mutate(
        { multisigAddress: account.multisigAddress, rawPayload: tx.serialize() },
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
        {stxNetworks.map(option => (
          <Button
            key={option}
            variant={network === option ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => setNetwork(option)}
          >
            {option === 'stx:mainnet' ? 'mainnet' : 'testnet'}
          </Button>
        ))}
      </Flex>
      <TextField placeholder="Vault account ID" value={accountId} onChange={setAccountId} mono />
      <TextField placeholder="ST… recipient" value={recipient} onChange={setRecipient} mono />
      <TextField placeholder="Amount (STX)" value={amountInput} onChange={setAmountInput} />
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
              {quote ? `${tier} · ${microStxToStx(quote.value.amount).toString()}` : tier}
            </Button>
          );
        })}
      </Flex>
      <Button variant="solid" size="sm" disabled={propose.isPending} onClick={submit}>
        {propose.isPending ? 'Proposing…' : 'Propose STX tx'}
      </Button>
      {statusError ? (
        <styled.span textStyle="caption.02" color="red.action-primary-default">
          {statusError instanceof Error ? statusError.message : 'Unknown error'}
        </styled.span>
      ) : null}
    </Flex>
  );
}
