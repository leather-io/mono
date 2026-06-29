import { type ChangeEvent, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { buildUnsignedMultisigBtcTransfer } from '~/features/multisig/transactions/build-btc-transfer';
import { buildUnsignedMultisigStxTransfer } from '~/features/multisig/transactions/build-stx-transfer';
import { useProposeTransaction } from '~/features/multisig/transactions/use-propose-transaction';
import { useVaultBtcTransactionFees } from '~/features/multisig/transactions/use-vault-btc-transaction-fees';
import { useVaultStxTransactionFees } from '~/features/multisig/transactions/use-vault-stx-transaction-fees';
import { useVaultAccountBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { useToast } from '~/features/toasts/use-toast';
import { formatCurrency } from '~/utils/currency-formatter';

import { isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import type { Money, VaultAccount } from '@leather.io/models';
import { isValidStacksAddress } from '@leather.io/stacks';
import { Button, CloseIcon, IconButton, Sheet } from '@leather.io/ui';
import { btcToSat, createMoney, stxToMicroStx } from '@leather.io/utils';

import { TextField } from '../../components/text-field';

function parseBtcAmount(value: string): Money | undefined {
  const sats = btcToSat(value.trim());
  if (sats.isNaN() || sats.isLessThanOrEqualTo(0)) return undefined;
  return createMoney(sats, 'BTC');
}

function parseStxAmount(value: string): Money | undefined {
  const microStx = stxToMicroStx(value.trim());
  if (microStx.isNaN() || microStx.isLessThanOrEqualTo(0)) return undefined;
  return createMoney(microStx, 'STX');
}

// Errors only surface once the field has input, so the form isn't pre-flagged.
function getAmountError(
  amountInput: string,
  amount: Money | undefined,
  available?: Money
): string | undefined {
  if (!amountInput.trim()) return undefined;
  if (!amount) return 'Enter a valid amount';
  if (available && amount.amount.isGreaterThan(available.amount))
    return 'Amount exceeds available balance';
  return undefined;
}

function getRecipientError(recipient: string, isValid: boolean): string | undefined {
  if (!recipient.trim()) return undefined;
  return isValid ? undefined : 'Enter a valid address';
}

interface ProposeFormFieldsProps {
  memberCount: number;
  unit: string;
  recipientPlaceholder: string;
  recipient: string;
  onRecipient(value: string): void;
  amountInput: string;
  onAmount(value: string): void;
  available?: Money;
  fee?: Money;
  threshold: number;
  signerCount: number;
  isProposing: boolean;
  canPropose: boolean;
  recipientError?: string;
  amountError?: string;
  errorMessage?: string;
  onClose(): void;
  onSubmit(): void;
}

function ProposeFormFields({
  memberCount,
  unit,
  recipientPlaceholder,
  recipient,
  onRecipient,
  amountInput,
  onAmount,
  available,
  fee,
  threshold,
  signerCount,
  isProposing,
  canPropose,
  recipientError,
  amountError,
  errorMessage,
  onClose,
  onSubmit,
}: ProposeFormFieldsProps) {
  return (
    <Flex direction="column" gap="space.04" px="space.05" pb="space.05">
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        Proposing a transaction notifies all {memberCount} members. They'll need to sign for it to
        broadcast.
      </styled.p>

      <TextField
        label="Recipient"
        placeholder={recipientPlaceholder}
        value={recipient}
        onChange={onRecipient}
        invalid={Boolean(recipientError)}
        help={
          recipientError ? (
            <styled.span color="red.action-primary-default">{recipientError}</styled.span>
          ) : undefined
        }
        mono
      />

      <Flex direction="column" gap="space.02">
        <styled.label textStyle="label.03" color="ink.text-subdued">
          Amount
        </styled.label>
        <Flex
          alignItems="stretch"
          borderRadius="sm"
          borderWidth="1px"
          borderStyle="solid"
          borderColor={amountError ? 'red.action-primary-default' : 'ink.border-default'}
          bg="ink.background-primary"
          _focusWithin={{ borderColor: 'ink.action-primary-default' }}
        >
          <styled.input
            value={amountInput}
            placeholder="0.00"
            onChange={(e: ChangeEvent<HTMLInputElement>) => onAmount(e.target.value)}
            flex={1}
            minWidth={0}
            px="space.04"
            py="space.03"
            bg="transparent"
            textStyle="body.02"
            _focusVisible={{ outline: 'none' }}
          />
          <styled.span
            display="flex"
            alignItems="center"
            px="space.04"
            textStyle="label.02"
            color="ink.text-subdued"
            borderLeftWidth="1px"
            borderLeftStyle="solid"
            borderLeftColor="ink.border-default"
          >
            {unit}
          </styled.span>
        </Flex>
        {amountError ? (
          <styled.span textStyle="caption.01" color="red.action-primary-default">
            {amountError}
          </styled.span>
        ) : (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Available: <Balance balance={available} formatCurrency={formatCurrency} />
          </styled.span>
        )}
      </Flex>

      <Flex
        direction="column"
        gap="space.03"
        p="space.04"
        borderRadius="md"
        bg="ink.background-secondary"
      >
        <Flex justifyContent="space-between" gap="space.04">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Network fee
          </styled.span>
          <styled.span textStyle="label.02">
            ~<Balance balance={fee} formatCurrency={formatCurrency} />
          </styled.span>
        </Flex>
        <Flex justifyContent="space-between" gap="space.04">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Threshold
          </styled.span>
          <styled.span textStyle="label.02">
            {threshold} of {signerCount} signers required
          </styled.span>
        </Flex>
      </Flex>

      {errorMessage && (
        <styled.span textStyle="caption.01" color="red.action-primary-default">
          {errorMessage}
        </styled.span>
      )}

      <Flex gap="space.03" justifyContent="flex-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="solid" disabled={!canPropose || isProposing} onClick={onSubmit}>
          {isProposing ? 'Proposing…' : 'Propose transaction'}
        </Button>
      </Flex>
    </Flex>
  );
}

function BtcProposeForm({
  account,
  memberCount,
  onClose,
}: {
  account: VaultAccount;
  memberCount: number;
  onClose(): void;
}) {
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const { success, error } = useToast();

  const mode = account.network === 'btc:mainnet' ? 'mainnet' : 'testnet';
  const recipientAddress = recipient.trim() || undefined;
  const amount = parseBtcAmount(amountInput);
  const balance = useVaultAccountBalance(account);
  const recipientError = getRecipientError(
    recipient,
    Boolean(recipientAddress) && isValidBitcoinNetworkAddress(recipient.trim(), mode)
  );
  const amountError = getAmountError(amountInput, amount, balance.crypto);
  const feesQuery = useVaultBtcTransactionFees({
    account,
    recipient: recipientError ? undefined : recipientAddress,
    amount: amountError ? undefined : amount,
  });
  const propose = useProposeTransaction(account.network);
  const feeQuote = feesQuery.data?.options.standard;

  async function submit() {
    if (!recipientAddress || !amount || feeQuote === undefined || recipientError || amountError)
      return;
    try {
      const rawPayload = await buildUnsignedMultisigBtcTransfer({
        account,
        recipient: recipientAddress,
        amount,
        feeRate: feeQuote.rate,
      });
      propose.mutate(
        { multisigAddress: account.multisigAddress, rawPayload },
        {
          onSuccess() {
            success('Transaction proposed');
            onClose();
          },
          onError: err => error(err.message),
        }
      );
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to build transaction');
    }
  }

  return (
    <ProposeFormFields
      memberCount={memberCount}
      unit="BTC"
      recipientPlaceholder="bc1q… address"
      recipient={recipient}
      onRecipient={setRecipient}
      amountInput={amountInput}
      onAmount={setAmountInput}
      available={balance.crypto}
      fee={feeQuote?.value}
      threshold={account.threshold}
      signerCount={account.signers.length}
      isProposing={propose.isPending}
      canPropose={Boolean(
        recipientAddress && amount && feeQuote && !recipientError && !amountError
      )}
      recipientError={recipientError}
      amountError={amountError}
      errorMessage={feesQuery.error instanceof Error ? feesQuery.error.message : undefined}
      onClose={onClose}
      onSubmit={() => void submit()}
    />
  );
}

function StxProposeForm({
  account,
  memberCount,
  onClose,
}: {
  account: VaultAccount;
  memberCount: number;
  onClose(): void;
}) {
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const { success, error } = useToast();

  const recipientAddress = recipient.trim() || undefined;
  const amount = parseStxAmount(amountInput);
  const balance = useVaultAccountBalance(account);
  const recipientError = getRecipientError(
    recipient,
    Boolean(recipientAddress) && isValidStacksAddress(recipient.trim())
  );
  const amountError = getAmountError(amountInput, amount, balance.crypto);
  const feesQuery = useVaultStxTransactionFees({
    account,
    recipient: recipientError ? undefined : recipientAddress,
    amount: amountError ? undefined : amount,
  });
  const propose = useProposeTransaction(account.network);
  const fee = feesQuery.data?.options.standard.value;

  async function submit() {
    if (!recipientAddress || !amount || !fee || recipientError || amountError) return;
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
          onSuccess() {
            success('Transaction proposed');
            onClose();
          },
          onError: err => error(err.message),
        }
      );
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to build transaction');
    }
  }

  return (
    <ProposeFormFields
      memberCount={memberCount}
      unit="STX"
      recipientPlaceholder="ST… address"
      recipient={recipient}
      onRecipient={setRecipient}
      amountInput={amountInput}
      onAmount={setAmountInput}
      available={balance.crypto}
      fee={fee}
      threshold={account.threshold}
      signerCount={account.signers.length}
      isProposing={propose.isPending}
      canPropose={Boolean(recipientAddress && amount && fee && !recipientError && !amountError)}
      recipientError={recipientError}
      amountError={amountError}
      errorMessage={feesQuery.error instanceof Error ? feesQuery.error.message : undefined}
      onClose={onClose}
      onSubmit={() => void submit()}
    />
  );
}

interface ProposeTransactionModalProps {
  account: VaultAccount;
  memberCount: number;
  isShowing: boolean;
  onClose(): void;
}

export function ProposeTransactionModal({
  account,
  memberCount,
  isShowing,
  onClose,
}: ProposeTransactionModalProps) {
  const isBtc = account.network.startsWith('btc');
  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={
        <Flex
          alignItems="center"
          justifyContent="space-between"
          gap="space.04"
          px="space.05"
          py="space.04"
          width="100%"
          minHeight="headerHeight"
        >
          <styled.h2 textStyle="heading.05">Send from {account.name}</styled.h2>
          <IconButton icon={<CloseIcon />} onClick={onClose} />
        </Flex>
      }
    >
      <Box>
        {isBtc ? (
          <BtcProposeForm account={account} memberCount={memberCount} onClose={onClose} />
        ) : (
          <StxProposeForm account={account} memberCount={memberCount} onClose={onClose} />
        )}
      </Box>
    </Sheet>
  );
}
