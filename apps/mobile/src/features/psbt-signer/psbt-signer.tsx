import { useMemo, useRef, useState } from 'react';

import { useGenerateBtcUnsignedTransactionNativeSegwit } from '@/common/transactions/bitcoin-transactions.hooks';
import { formatBalance } from '@/components/balance/balance';
import { useToastContext } from '@/components/toast/toast-context';
import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { BitcoinOutcome } from '@/features/approver/components/bitcoin-outcome';
import { BitcoinFeeCard } from '@/features/approver/components/fees/bitcoin-fee-card';
import { InputsAndOutputsCard } from '@/features/approver/components/inputs-outputs-card';
import { OutcomeAddressesCard } from '@/features/approver/components/outcome-addresses-card';
import { createCoinSelectionUtxos } from '@/features/send/utils';
import { useAverageBitcoinFeeRates } from '@/queries/fees/fee-estimates.hooks';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { useBitcoinBroadcastTransaction } from '@/queries/transaction/use-bitcoin-broadcast-transaction';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import { t } from '@lingui/macro';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import {
  createBitcoinAddress,
  getBitcoinFees,
  getPsbtAsTransaction,
  getPsbtDetails,
  getSizeInfo,
  payerToBip32Derivation,
} from '@leather.io/bitcoin';
import {
  AverageBitcoinFeeRates,
  BitcoinNetworkModes,
  FeeTypes,
  Money,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';
import { RpcParams, RpcResult, signPsbt } from '@leather.io/rpc';
import { Approver, Box, SheetRef, Text } from '@leather.io/ui/native';
import {
  baseCurrencyAmountInQuoteWithFallback,
  createMoney,
  match,
  sumMoney,
} from '@leather.io/utils';

import { ApproverButtons } from '../approver/components/approver-buttons';
import { FeesSheet } from '../approver/components/fees/bitcoin-fee-sheet';
import { ApproverState } from '../approver/utils';
import { usePsbtAccounts } from './use-psbt-accounts';
import { usePsbtPayers } from './use-psbt-payers';
import { usePsbtSigner } from './use-psbt-signer';
import { normalizeSignAtIndex } from './utils';

interface BasePsbtSignerProps extends PsbtSignerProps {
  feeRates: AverageBitcoinFeeRates;
}

interface PsbtSignerProps {
  psbtHex: string;
  broadcast: RpcParams<typeof signPsbt>['broadcast'];
  onBack(): void;
  onSuccess(result: RpcResult<typeof signPsbt>): void;
  allowedSighash?: RpcParams<typeof signPsbt>['allowedSighash'];
  signAtIndex?: RpcParams<typeof signPsbt>['signAtIndex'];
  network?: BitcoinNetworkModes;
}

interface FeeTypeParams {
  psbtFee: Money;
  fees: ReturnType<typeof getBitcoinFees>;
}

function getFeeType({ psbtFee, fees }: FeeTypeParams) {
  if (fees.standard.fee?.amount && psbtFee.amount.isEqualTo(fees.standard.fee.amount)) {
    return FeeTypes.Middle;
  }
  if (fees.low.fee?.amount && psbtFee.amount.isEqualTo(fees.low.fee.amount)) {
    return FeeTypes.Low;
  }
  if (fees.high.fee?.amount && psbtFee.amount.isEqualTo(fees.high.fee.amount)) {
    return FeeTypes.High;
  }
  return FeeTypes.Custom;
}

export function PsbtSigner(props: PsbtSignerProps) {
  const { data: feeRates } = useAverageBitcoinFeeRates();
  if (!feeRates) return null;

  return <BasePsbtSigner feeRates={feeRates} {...props} />;
}

function getPsbtNetwork(network: BitcoinNetworkModes) {
  if (network === 'testnet')
    return defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.testnet4];
  if (network === 'mainnet')
    return defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet];
  throw new Error('This network is currently not supported');
}

export function BasePsbtSigner({
  psbtHex: _psbtHex,
  onBack,
  onSuccess,
  feeRates,
  signAtIndex,
  allowedSighash,
  broadcast,
  network: requestedNetwork,
}: BasePsbtSignerProps) {
  const [psbtHex, setPsbtHex] = useState(_psbtHex);
  const psbtAccounts = usePsbtAccounts({ psbtHex });
  const psbtPayers = usePsbtPayers({ psbtHex });
  const psbtAddresses = psbtPayers.map(payer => createBitcoinAddress(payer.address));

  const { displayToast } = useToastContext();
  if (!psbtAccounts[0]) throw new Error('No psbt accounts');
  if (psbtAccounts.length > 1)
    throw new Error('Only one psbt account as input is supported right now');
  if (!psbtPayers[0]) throw new Error('No payer found');
  if (psbtPayers.length > 1) throw new Error('Only one psbt payer is supported right now');

  const currentNetwork = useCurrentNetworkState();
  const network = requestedNetwork ? getPsbtNetwork(requestedNetwork) : currentNetwork;
  const { sign } = usePsbtSigner();
  const { broadcastTx } = useBitcoinBroadcastTransaction();
  const [approverState, setApproverState] = useState<ApproverState>('start');
  const { data: btcMarketData } = useBtcMarketDataQuery();
  const feeSheetRef = useRef<SheetRef>(null);

  const utxos = useAccountUtxos(psbtAccounts[0]?.fingerprint, psbtAccounts[0]?.accountIndex);

  const psbtDetails = useMemo(
    () =>
      getPsbtDetails({
        psbtHex,
        psbtAddresses,
        networkMode: network.chain.bitcoin.mode,
      }),
    [psbtHex, network, psbtAddresses]
  );

  const recipients = psbtDetails.psbtOutputs
    .filter(output => !psbtAddresses.includes(createBitcoinAddress(output.address)))
    .map(output => ({
      amount: createMoney(new BigNumber(output.value), 'BTC'),
      address: output.address,
    }));
  const coinSelectionUtxos = createCoinSelectionUtxos(utxos.value?.available ?? []);

  const fees = getBitcoinFees({
    feeRates,
    recipients,
    utxos: coinSelectionUtxos,
    isSendingMax: false,
  });
  const [selectedFeeType, setSelectedFeeType] = useState<FeeTypes>(
    getFeeType({ psbtFee: psbtDetails.fee, fees })
  );

  const { txVBytes } = getSizeInfo({
    inputLength: psbtDetails.psbtInputs.length,
    recipients,
    isSendMax: false,
  });
  const totalBtc = sumMoney([
    psbtDetails.addressNativeSegwitTotal,
    psbtDetails.addressTaprootTotal,
  ]);
  const totalSpend = baseCurrencyAmountInQuoteWithFallback(totalBtc, btcMarketData);

  const payer = psbtPayers[0].address;
  const generateTx = useGenerateBtcUnsignedTransactionNativeSegwit(
    payer,
    bytesToHex(psbtPayers[0].publicKey)
  );

  function onChangeFee(feeType: FeeTypes) {
    const feeRate = match()(feeType, {
      [FeeTypes.Low]: feeRates.hourFee.toNumber(),
      [FeeTypes.Middle]: feeRates.halfHourFee.toNumber(),
      [FeeTypes.High]: feeRates.fastestFee.toNumber(),
    });
    const totalSendValue =
      psbtDetails.addressNativeSegwitTotal.amount.toNumber() +
      psbtDetails.addressTaprootTotal.amount.toNumber() -
      psbtDetails.fee.amount.toNumber();
    if (psbtPayers[0]) {
      const tx = generateTx({
        feeRate: Number(feeRate),
        isSendingMax: false,
        values: { amount: createMoney(totalSendValue, 'BTC'), recipients },
        utxos: coinSelectionUtxos,
        bip32Derivation: [payerToBip32Derivation(psbtPayers[0])],
      });
      if (!tx) throw new Error('No tx');
      const psbtHex = bytesToHex(tx.psbt);

      setPsbtHex(psbtHex);
    }
  }

  async function onSubmitTransaction() {
    setApproverState('submitting');
    try {
      const psbt = getPsbtAsTransaction(psbtHex);
      const signedTx = await sign(psbt.toPSBT(), {
        signAtIndex: normalizeSignAtIndex(signAtIndex),
        allowedSighash,
      });
      signedTx.finalize();

      if (!broadcast) {
        onSuccess({
          hex: signedTx.hex,
        });
        return;
      }

      await broadcastTx({
        // TODO: for now
        skipSpendableCheckUtxoIds: 'all',
        tx: signedTx.hex,
        onSuccess(txid) {
          setApproverState('submitted');
          setTimeout(() => {
            onSuccess({
              hex: signedTx.hex,
              txid,
            });
          }, 1000);
        },
        onError() {
          displayToast({
            title: t({
              id: 'approver.send.btc.error.broadcast',
              message: 'Failed to broadcast transaction',
            }),
            type: 'error',
          });
          setApproverState('start');
        },
      });
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.btc.error.broadcast',
          message: 'Failed to broadcast transaction',
        }),
        type: 'error',
      });
      setApproverState('start');
    }
  }

  return (
    <Box flex={1} backgroundColor="ink.background-secondary">
      <Approver>
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
            <OutcomeAddressesCard addresses={recipients.map(r => r.address)} />
          </Approver.Section>
          <Approver.Section>
            <BitcoinFeeCard
              feeType={selectedFeeType}
              amount={psbtDetails.fee}
              onPress={() => {
                feeSheetRef.current?.present();
              }}
            />
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
            <Text variant="label02">{formatBalance({ balance: totalSpend, isFiat: true })}</Text>
          </Box>
          <Approver.Actions>
            <ApproverButtons
              approverState={approverState}
              onBack={onBack}
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
      <FeesSheet
        sheetRef={feeSheetRef}
        selectedFeeType={selectedFeeType}
        setSelectedFeeType={setSelectedFeeType}
        onChangeFee={onChangeFee}
        fees={feeRates}
        txSize={txVBytes}
        currentFeeRate={Math.round(psbtDetails.fee.amount.toNumber() / txVBytes)}
      />
    </Box>
  );
}
