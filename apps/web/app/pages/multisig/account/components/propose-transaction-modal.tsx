import { type ChangeEvent, type ReactNode, useState } from 'react';

import BigNumber from 'bignumber.js';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { useVaultAccountAssets } from '~/features/multisig/assets/use-vault-account-assets';
import { filterSendableVaultAssets } from '~/features/multisig/assets/vault-asset-items';
import { normalizeNativeSegwitAddress } from '~/features/multisig/network/normalize-btc-address';
import { resolveBtcNetworkMode } from '~/features/multisig/network/resolve-btc-network-mode';
import { buildUnsignedMultisigBtcTransfer } from '~/features/multisig/transactions/build-btc-transfer';
import { buildUnsignedMultisigSip10Transfer } from '~/features/multisig/transactions/build-sip10-transfer';
import { buildUnsignedMultisigStxTransfer } from '~/features/multisig/transactions/build-stx-transfer';
import { useProposeTransaction } from '~/features/multisig/transactions/use-propose-transaction';
import { useVaultBtcTransactionFees } from '~/features/multisig/transactions/use-vault-btc-transaction-fees';
import { useVaultStxTransactionFees } from '~/features/multisig/transactions/use-vault-stx-transaction-fees';
import { useVaultAccountBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { useToast } from '~/features/toasts/use-toast';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';
import { formatCryptoPrecise, formatCurrency } from '~/utils/currency-formatter';

import { isValidBitcoinNetworkAddress } from '@leather.io/bitcoin';
import { STX_DECIMALS, btcAsset, stxAsset } from '@leather.io/constants';
import {
  type MarketData,
  type Money,
  type MultisigTransaction,
  type TransactionFeeTier,
  type TransactionFees,
  type VaultAccount,
  transactionFeeTiers,
} from '@leather.io/models';
import { getErrorDetail } from '@leather.io/services';
import { isValidStacksAddress, stacksAddressNetwork } from '@leather.io/stacks';
import { BasicTooltip, Button, CloseIcon, IconButton, InfoCircleIcon, Sheet } from '@leather.io/ui';
import {
  type SerializedCryptoAssetId,
  baseCurrencyAmountInQuote,
  btcToSat,
  createMoney,
  createMoneyFromDecimal,
} from '@leather.io/utils';

import { TextField } from '../../components/text-field';
import { AssetSelectorSheet, AssetSelectorToggle } from './asset-selector';

function parseBtcAmount(value: string): Money | undefined {
  const sats = btcToSat(value.trim());
  if (sats.isNaN() || sats.isLessThanOrEqualTo(0)) return undefined;
  return createMoney(sats, 'BTC');
}

function parseAssetAmount(value: string, decimals: number, symbol: string): Money | undefined {
  const decimalAmount = new BigNumber(value.trim());
  if (decimalAmount.isNaN() || decimalAmount.isLessThanOrEqualTo(0)) return undefined;
  if ((decimalAmount.decimalPlaces() ?? 0) > decimals) return undefined;
  return createMoneyFromDecimal(decimalAmount, symbol, decimals);
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

function getRecipientError(
  recipient: string,
  isValid: boolean,
  isSelf: boolean
): string | undefined {
  if (!recipient.trim()) return undefined;
  if (!isValid) return 'Enter a valid address';
  if (isSelf) return 'Cannot send to yourself';
  return undefined;
}

function feeTierValues(fees?: TransactionFees): Record<TransactionFeeTier, Money> | undefined {
  if (!fees) return undefined;
  return {
    low: fees.options.low.value,
    standard: fees.options.standard.value,
    high: fees.options.high.value,
  };
}

function toFiat(money: Money, marketData?: MarketData): Money | undefined {
  if (!marketData || money.symbol !== marketData.pair.base) return undefined;
  return baseCurrencyAmountInQuote(money, marketData);
}

function feeTierFiatValues(
  fees?: TransactionFees,
  marketData?: MarketData
): Record<TransactionFeeTier, Money | undefined> | undefined {
  if (!fees) return undefined;
  return {
    low: toFiat(fees.options.low.value, marketData),
    standard: toFiat(fees.options.standard.value, marketData),
    high: toFiat(fees.options.high.value, marketData),
  };
}

function FeeTierSelector({
  options,
  selected,
  onSelect,
  fiatOptions,
}: {
  options?: Record<TransactionFeeTier, Money>;
  selected: TransactionFeeTier;
  onSelect(tier: TransactionFeeTier): void;
  fiatOptions?: Record<TransactionFeeTier, Money | undefined>;
}) {
  if (!options) return null;
  return (
    <Flex direction="column" gap="space.02">
      <Flex alignItems="center" gap="space.01">
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Network fee
        </styled.span>
        <BasicTooltip asChild label="Learn about network fees">
          <styled.button
            type="button"
            onClick={() =>
              window.open(
                'https://leather.gitbook.io/guides/transactions/fees',
                '_blank',
                'noopener,noreferrer'
              )
            }
            aria-label="Learn about network fees"
            display="inline-flex"
            alignItems="center"
            bg="transparent"
            border="none"
            cursor="pointer"
            p="0"
          >
            <InfoCircleIcon variant="small" color="ink.text-subdued" />
          </styled.button>
        </BasicTooltip>
      </Flex>
      <Flex gap="space.02">
        {transactionFeeTiers.map(tier => {
          const isSelected = tier === selected;
          const money = options[tier];
          const fiat = fiatOptions?.[tier];
          const fiatText = fiat ? formatCurrency(fiat) : undefined;
          return (
            <styled.button
              key={tier}
              type="button"
              onClick={() => onSelect(tier)}
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap="space.01"
              p="space.02"
              borderRadius="sm"
              borderWidth="1px"
              borderStyle="solid"
              borderColor={isSelected ? 'ink.text-primary' : 'ink.border-default'}
              bg={isSelected ? 'ink.component-background-hover' : 'transparent'}
              cursor="pointer"
            >
              <styled.span
                textStyle="caption.01"
                textTransform="capitalize"
                color={isSelected ? 'ink.text-primary' : 'ink.text-subdued'}
              >
                {tier}
              </styled.span>
              <styled.span textStyle="label.03">
                <Balance balance={money} formatCurrency={formatCryptoPrecise} />
              </styled.span>
              {fiatText ? (
                <styled.span textStyle="caption.01" color="ink.text-subdued">
                  {fiatText.startsWith('<') ? fiatText : `~${fiatText}`}
                </styled.span>
              ) : null}
            </styled.button>
          );
        })}
      </Flex>
    </Flex>
  );
}

function getStacksNetworkError(
  address: string | undefined,
  accountIsMainnet: boolean
): string | undefined {
  if (!address || !isValidStacksAddress(address)) return undefined;
  const recipientNetwork = stacksAddressNetwork(address);
  if (!recipientNetwork) return undefined;
  const accountNetwork = accountIsMainnet ? 'mainnet' : 'testnet';
  if (recipientNetwork === accountNetwork) return undefined;
  return `Recipient must be a ${accountNetwork} address`;
}

interface ProposeFormFieldsProps {
  memberCount: number;
  unit: string;
  assetToggle?: ReactNode;
  recipientPlaceholder: string;
  recipient: string;
  onRecipient(value: string): void;
  onRecipientBlur?(value: string): void;
  amountInput: string;
  onAmount(value: string): void;
  available?: Money;
  feeOptions?: Record<TransactionFeeTier, Money>;
  feeFiatOptions?: Record<TransactionFeeTier, Money | undefined>;
  feeTier: TransactionFeeTier;
  onFeeTier(tier: TransactionFeeTier): void;
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
  assetToggle,
  recipientPlaceholder,
  recipient,
  onRecipient,
  onRecipientBlur,
  amountInput,
  onAmount,
  available,
  feeOptions,
  feeFiatOptions,
  feeTier,
  onFeeTier,
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
        onBlur={onRecipientBlur}
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
          {assetToggle ?? (
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
          )}
        </Flex>
        {amountError ? (
          <styled.span textStyle="caption.01" color="red.action-primary-default">
            {amountError}
          </styled.span>
        ) : (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Available: <Balance balance={available} formatCurrency={formatCryptoPrecise} />
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
        <FeeTierSelector
          options={feeOptions}
          fiatOptions={feeFiatOptions}
          selected={feeTier}
          onSelect={onFeeTier}
        />
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
  onProposed,
}: {
  account: VaultAccount;
  memberCount: number;
  onClose(): void;
  onProposed(transaction: MultisigTransaction): void;
}) {
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const { error } = useToast();

  const mode = resolveBtcNetworkMode(account.network);
  const recipientAddress = recipient.trim()
    ? normalizeNativeSegwitAddress(recipient.trim().toLowerCase(), mode)
    : undefined;
  const amount = parseBtcAmount(amountInput);
  const balance = useVaultAccountBalance(account);
  const recipientError = getRecipientError(
    recipient,
    Boolean(recipientAddress) && isValidBitcoinNetworkAddress(recipientAddress ?? '', mode),
    recipientAddress === account.multisigAddress
  );
  const amountError = getAmountError(amountInput, amount, balance.crypto);
  const feesQuery = useVaultBtcTransactionFees({
    account,
    recipient: recipientError ? undefined : recipientAddress,
    amount: amountError ? undefined : amount,
  });
  const propose = useProposeTransaction(account.network);
  const marketData = useMarketDataQuery(btcAsset);
  const [feeTier, setFeeTier] = useState<TransactionFeeTier>('standard');
  const feeQuote = feesQuery.data?.options[feeTier];
  const feeOptions = feeTierValues(feesQuery.data);
  const feeFiatOptions = feeTierFiatValues(feesQuery.data, marketData.data);

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
          onSuccess(transaction) {
            onProposed(transaction);
          },
          onError: err => error(getErrorDetail(err) ?? 'Unknown error'),
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
      onRecipientBlur={value => {
        const trimmed = value.trim();
        if (trimmed) setRecipient(normalizeNativeSegwitAddress(trimmed.toLowerCase(), mode));
      }}
      amountInput={amountInput}
      onAmount={setAmountInput}
      available={balance.crypto}
      feeOptions={feeOptions}
      feeFiatOptions={feeFiatOptions}
      feeTier={feeTier}
      onFeeTier={setFeeTier}
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
  initialAssetId,
  onClose,
  onProposed,
}: {
  account: VaultAccount;
  memberCount: number;
  initialAssetId?: SerializedCryptoAssetId;
  onClose(): void;
  onProposed(transaction: MultisigTransaction): void;
}) {
  const [recipient, setRecipient] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<SerializedCryptoAssetId | undefined>(
    initialAssetId
  );
  const [isSelectorShowing, setIsSelectorShowing] = useState(false);
  const { error } = useToast();

  const recipientAddress = recipient.trim() || undefined;
  const assets = useVaultAccountAssets(account);
  const sendableItems = filterSendableVaultAssets(assets.items);
  const selectedItem =
    sendableItems.find(item => item.id === selectedAssetId) ??
    sendableItems.find(item => item.asset.protocol === 'nativeStx');
  const decimals = selectedItem?.asset.decimals ?? STX_DECIMALS;
  const symbol = selectedItem?.asset.symbol ?? 'STX';
  const amount = parseAssetAmount(amountInput, decimals, symbol);
  const sip10Asset = selectedItem?.asset.protocol === 'sip10' ? selectedItem.asset : undefined;
  const recipientError =
    getRecipientError(
      recipient,
      Boolean(recipientAddress) && isValidStacksAddress(recipient.trim()),
      recipientAddress === account.multisigAddress
    ) ?? getStacksNetworkError(recipientAddress, account.network === 'stx:mainnet');
  const amountError = getAmountError(amountInput, amount, selectedItem?.crypto);
  const feesQuery = useVaultStxTransactionFees({
    account,
    recipient: recipientError ? undefined : recipientAddress,
    amount: amountError ? undefined : amount,
    asset: sip10Asset,
  });
  const propose = useProposeTransaction(account.network);
  const marketData = useMarketDataQuery(stxAsset);
  const [feeTier, setFeeTier] = useState<TransactionFeeTier>('standard');
  const fee = feesQuery.data?.options[feeTier].value;
  const feeOptions = feeTierValues(feesQuery.data);
  const feeFiatOptions = feeTierFiatValues(feesQuery.data, marketData.data);

  async function submit() {
    if (!recipientAddress || !amount || !fee || recipientError || amountError) return;
    try {
      const tx = sip10Asset
        ? await buildUnsignedMultisigSip10Transfer({
            account,
            assetId: sip10Asset.assetId,
            recipient: recipientAddress,
            amount,
            fee,
          })
        : await buildUnsignedMultisigStxTransfer({
            account,
            recipient: recipientAddress,
            amount,
            fee,
          });
      propose.mutate(
        { multisigAddress: account.multisigAddress, rawPayload: tx.serialize() },
        {
          onSuccess(transaction) {
            onProposed(transaction);
          },
          onError: err => error(getErrorDetail(err) ?? 'Unknown error'),
        }
      );
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to build transaction');
    }
  }

  return (
    <>
      <ProposeFormFields
        memberCount={memberCount}
        unit={symbol}
        assetToggle={
          selectedItem ? (
            <AssetSelectorToggle item={selectedItem} onClick={() => setIsSelectorShowing(true)} />
          ) : undefined
        }
        recipientPlaceholder="Stacks address"
        recipient={recipient}
        onRecipient={setRecipient}
        amountInput={amountInput}
        onAmount={setAmountInput}
        available={selectedItem?.crypto}
        feeOptions={feeOptions}
        feeFiatOptions={feeFiatOptions}
        feeTier={feeTier}
        onFeeTier={setFeeTier}
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
      <AssetSelectorSheet
        items={sendableItems}
        isShowing={isSelectorShowing}
        onSelect={item => {
          setSelectedAssetId(item.id);
          setIsSelectorShowing(false);
        }}
        onClose={() => setIsSelectorShowing(false)}
      />
    </>
  );
}

interface ProposeTransactionModalProps {
  account: VaultAccount;
  memberCount: number;
  isShowing: boolean;
  initialAssetId?: SerializedCryptoAssetId;
  onClose(): void;
  onProposed(transaction: MultisigTransaction): void;
}

export function ProposeTransactionModal({
  account,
  memberCount,
  isShowing,
  initialAssetId,
  onClose,
  onProposed,
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
          <BtcProposeForm
            account={account}
            memberCount={memberCount}
            onClose={onClose}
            onProposed={onProposed}
          />
        ) : (
          <StxProposeForm
            account={account}
            memberCount={memberCount}
            initialAssetId={initialAssetId}
            onClose={onClose}
            onProposed={onProposed}
          />
        )}
      </Box>
    </Sheet>
  );
}
