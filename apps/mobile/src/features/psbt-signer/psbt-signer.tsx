import { useMemo, useRef, useState } from 'react';

import { formatBalance } from '@/components/balance/balance';
import { useToastContext } from '@/components/toast/toast-context';
import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { BitcoinOutcome } from '@/features/approver/components/bitcoin-outcome';
import { BitcoinFeeCard } from '@/features/approver/components/fees/bitcoin-fee-card';
import { InputsAndOutputsCard } from '@/features/approver/components/inputs-outputs-card';
import { OutcomeAddressesCard } from '@/features/approver/components/outcome-addresses-card';
import { useAverageBitcoinFeeRates } from '@/queries/fees/fee-estimates.hooks';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { useGenerateBtcUnsignedTransactionNativeSegwit } from '@/queries/transaction/bitcoin-transactions.hooks';
import { useBitcoinBroadcastTransaction } from '@/queries/transaction/use-bitcoin-broadcast-transaction';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { t } from '@lingui/macro';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import {
  createBitcoinAddress,
  getBitcoinFees,
  getPsbtAsTransaction,
  getPsbtDetails,
  getSizeInfo,
} from '@leather.io/bitcoin';
import {
  AccountId,
  AverageBitcoinFeeRates,
  BitcoinNetworkModes,
  FeeTypes,
} from '@leather.io/models';
import { RpcParams, signPsbt } from '@leather.io/rpc';
import { Approver, Box, SheetRef, Text } from '@leather.io/ui/native';
import {
  baseCurrencyAmountInQuoteWithFallback,
  createMoney,
  match,
  sumMoney,
} from '@leather.io/utils';

import { ApproverButtons } from '../approver/components/approver-buttons';
import { ApproverWrapper } from '../approver/components/approver-wrapper';
import { BitcoinFeesSheet } from '../approver/components/fees/bitcoin-fee-sheet';
import { ApproverState } from '../approver/utils';
import { signTx } from './signer';
import { useAccountsFromPsbt } from './use-accounts-from-psbt';
import { usePsbtPayers } from './use-psbt-payers';
import { getFeeType, getPsbtNetwork, normalizeSignAtIndex } from './utils';

interface PsbtSignerProps extends AccountId {
  psbtHex: string;
  broadcast: RpcParams<typeof signPsbt>['broadcast'];
  allowedSighash?: RpcParams<typeof signPsbt>['allowedSighash'];
  signAtIndex?: RpcParams<typeof signPsbt>['signAtIndex'];
  network?: BitcoinNetworkModes;
  feeEditorEnabled: boolean;
  onBack(): void;
  onResult(result: { hex: string; txid?: string }): void;
}
export function PsbtSigner(props: PsbtSignerProps) {
  const { data: feeRates } = useAverageBitcoinFeeRates();
  if (!feeRates) return null;
  return <BasePsbtSigner feeRates={feeRates} {...props} />;
}

interface BasePsbtSignerProps extends PsbtSignerProps {
  feeRates: AverageBitcoinFeeRates;
}
function BasePsbtSigner({
  psbtHex: _psbtHex,
  fingerprint,
  accountIndex,
  onBack,
  onResult,
  feeRates,
  signAtIndex,
  allowedSighash,
  broadcast,
  feeEditorEnabled,
  network: requestedNetwork,
}: BasePsbtSignerProps) {
  const [psbtHex, setPsbtHex] = useState(_psbtHex);
  const psbtAccounts = useAccountsFromPsbt({ psbtHex });
  const psbtPayers = usePsbtPayers({ psbtHex });

  const { displayToast } = useToastContext();

  const bitcoinAccount = useBitcoinAccounts();
  const { nativeSegwit: nativeSegwitAccount } = bitcoinAccount.accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const psbtAddresses = psbtPayers.map(payer => createBitcoinAddress(payer.address));

  if (!nativeSegwitAccount) throw new Error('No account found');
  if (!psbtAccounts[0]) throw new Error('No psbt accounts');
  if (!psbtPayers[0]) throw new Error('No payer found');

  const currentNetwork = useCurrentNetworkState();
  const network = requestedNetwork ? getPsbtNetwork(requestedNetwork) : currentNetwork;
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

  const coinSelectionUtxos = utxos.value?.available ?? [];

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

  const generateTx = useGenerateBtcUnsignedTransactionNativeSegwit({
    changeAddress: nativeSegwitAccount.derivePayer({ change: 0, addressIndex: 0 }).address,
    fingerprint: nativeSegwitAccount.masterKeyFingerprint,
  });

  // Editing the fee of a PSBT is fairly sensitive operation. The implementation
  // currently generates another tx from our global UTXO set, however if the tx
  // is coming externally, we must not do this, as it may at best invalidate the
  // tx, at worst transfer funds irretrievably. To implement safely, we must
  // first check the sig hash type to make sure the tx is modifiable, and if it
  // is, only append new inputs and outputs, leaving the existing ones
  // untouched.
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
      });
      if (!tx) throw new Error('No tx');
      const psbtHex = bytesToHex(tx.psbt);

      setSelectedFeeType(feeType);
      setPsbtHex(psbtHex);
      displayToast({
        title: t({
          id: 'approver.send.btc.success.change-fee',
          message: 'Fee updated',
        }),
        type: 'success',
      });
    }
  }

  async function onSubmitTransaction() {
    setApproverState('submitting');
    try {
      const psbt = getPsbtAsTransaction(psbtHex);
      const signedTx = await signTx(psbt.toPSBT(), {
        signAtIndex: normalizeSignAtIndex(signAtIndex),
        allowedSighash,
      });

      signedTx.finalize();

      if (!broadcast) {
        onResult({ hex: signedTx.hex });
        return;
      }

      await broadcastTx({
        skipSpendableCheckUtxoIds: 'all',
        tx: signedTx.hex,
        onResult(txid) {
          setApproverState('submitted');
          setTimeout(() => onResult({ hex: signedTx.hex, txid }), 1000);
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
    <ApproverWrapper>
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
          {feeEditorEnabled && (
            <Approver.Section>
              <BitcoinFeeCard
                feeType={selectedFeeType}
                amount={psbtDetails.fee}
                onPress={() => feeSheetRef.current?.present()}
              />
            </Approver.Section>
          )}
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
              {t({ id: 'approver.total_spend', message: 'Total spend' })}
            </Text>
            <Text variant="label02">
              {formatBalance({ balance: totalSpend, isQuoteCurrency: true })}
            </Text>
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
      <BitcoinFeesSheet
        sheetRef={feeSheetRef}
        selectedFeeType={selectedFeeType}
        onChangeFee={onChangeFee}
        fees={feeRates}
        txSize={txVBytes}
        currentFeeRate={Math.round(psbtDetails.fee.amount.toNumber() / txVBytes)}
      />
    </ApproverWrapper>
  );
}
