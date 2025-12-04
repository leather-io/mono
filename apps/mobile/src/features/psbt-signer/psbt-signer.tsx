import { useMemo, useRef, useState } from 'react';

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
import { analytics } from '@/utils/analytics';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';
import * as Clipboard from 'expo-clipboard';

import {
  PsbtOutputWithAddress,
  getBitcoinFees,
  getPsbtAsTransaction,
  getPsbtDetails,
  getSizeInfo,
} from '@leather.io/bitcoin';
import { btcAsset } from '@leather.io/constants';
import { makeActivityLink } from '@leather.io/features';
import {
  AccountId,
  AverageBitcoinFeeRates,
  BitcoinNetworkModes,
  FeeTypes,
} from '@leather.io/models';
import { RpcParams, signPsbt } from '@leather.io/rpc';
import { Approver, Box, SentIcon, SheetInstance, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney, sumMoney } from '@leather.io/utils';

import { ApproverButtons } from '../approver/components/approver-buttons';
import { BitcoinFeesSheet } from '../approver/components/fees/bitcoin-fee-sheet';
import { BtcStatusRow } from '../approver/components/status-row/btc-status-row';
import { useOpenUrl } from '../browser/browser/use-open-url';
import { signTx } from './signer';
import { useAccountsFromPsbt } from './use-accounts-from-psbt';
import { usePsbtPayers } from './use-psbt-payers';
import { getFeeType, getPsbtNetwork, normalizeSignAtIndex } from './utils';

interface PsbtSignerProps extends AccountId {
  origin?: string;
  psbtHex: string;
  broadcast: RpcParams<typeof signPsbt>['broadcast'];
  allowedSighash?: RpcParams<typeof signPsbt>['allowedSighash'];
  signAtIndex?: RpcParams<typeof signPsbt>['signAtIndex'];
  network?: BitcoinNetworkModes;
  feeEditorEnabled: boolean;
  onBack(): void;
  onResult(result: { hex: string; txid?: string }): void;
  onClose(): void;
}
export function PsbtSigner(props: PsbtSignerProps) {
  const { data: feeRates } = useAverageBitcoinFeeRates();
  if (!feeRates) return null;
  return <BasePsbtSigner feeRates={feeRates} {...props} />;
}

interface BasePsbtSignerProps extends PsbtSignerProps {
  feeRates: AverageBitcoinFeeRates;
}
function BasePsbtSigner(props: BasePsbtSignerProps) {
  const {
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
    origin,
    onClose,
  } = props;
  const [psbtHex, setPsbtHex] = useState(_psbtHex);
  const [broadcastedTxid, setBroadcastedTxid] = useState<null | string>(null);
  const psbtAccounts = useAccountsFromPsbt({ psbtHex });
  const psbtPayers = usePsbtPayers({ psbtHex });
  const { openUrl } = useOpenUrl();

  const { displayToast } = useToastContext();

  const bitcoinAccount = useBitcoinAccounts();
  const { nativeSegwit: nativeSegwitAccount } = bitcoinAccount.accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const psbtAddresses = psbtPayers.map(payer => payer.address);

  if (!nativeSegwitAccount) throw new Error('No account found');
  if (!psbtAccounts[0]) throw new Error('No psbt accounts');
  if (!psbtPayers[0]) throw new Error('No payer found');

  const currentNetwork = useCurrentNetworkState();
  const network = requestedNetwork ? getPsbtNetwork(requestedNetwork) : currentNetwork;
  const { broadcastTx } = useBitcoinBroadcastTransaction();
  const { data: btcMarketData } = useBtcMarketDataQuery();
  const feeSheetRef = useRef<SheetInstance>(null);

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
    .filter(
      (output): output is PsbtOutputWithAddress =>
        !!output.address && !psbtAddresses.includes(output.address)
    )
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
  const totalSpendQuote = baseCurrencyAmountInQuoteWithFallback(totalBtc, btcMarketData);
  const principalSpend = createMoney(
    psbtDetails.addressNativeSegwitTotal.amount.minus(psbtDetails.fee.amount),
    'BTC'
  );

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
    const feeRateMap: Partial<Record<FeeTypes, number>> = {
      [FeeTypes.Low]: feeRates.hourFee.toNumber(),
      [FeeTypes.Middle]: feeRates.halfHourFee.toNumber(),
      [FeeTypes.High]: feeRates.fastestFee.toNumber(),
    };

    const feeRate = feeRateMap[feeType] ?? feeRates.fastestFee.toNumber();
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
        title: t`Fee updated`,
        type: 'success',
      });
    }
  }

  async function onSubmitTransaction() {
    analytics.track('request_sign_psbt_submit');
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

      analytics.track('broadcast_transaction', { symbol: 'BTC' });

      const txid = await broadcastTx({
        skipSpendableCheckUtxoIds: 'all',
        tx: signedTx.hex,
      });
      if (txid) {
        setBroadcastedTxid(txid);
        onResult({ hex: signedTx.hex, txid });
      } else {
        throw new Error('Failed to broadcast');
      }
    } catch (err) {
      displayToast({
        title: t`Failed to broadcast transaction`,
        type: 'error',
      });
      throw err;
    }
  }

  function onViewDetails() {
    if (!broadcastedTxid) return;

    const activityLink = makeActivityLink({
      txid: broadcastedTxid,
      networkPreference: network,
      asset: btcAsset,
    });

    if (!activityLink) return;

    openUrl(activityLink);
    onClose();
  }
  function onCopy() {
    if (!broadcastedTxid) return;
    void Clipboard.setStringAsync(broadcastedTxid);
  }

  return (
    <>
      <Approver requester={origin}>
        <Approver.Container>
          <Approver.Header title={t`Send token`} />
          {broadcastedTxid && <BtcStatusRow txid={broadcastedTxid} />}

          <Approver.Overview>
            <Approver.Section mb="-3">
              <Approver.Subheader icon={<SentIcon variant="small" />}>
                {t`You’ll send`}
              </Approver.Subheader>
              <BitcoinOutcome amount={principalSpend} />
            </Approver.Section>

            <Approver.Section>
              <Approver.Subheader>{t`To address`}</Approver.Subheader>
              <OutcomeAddressesCard addresses={recipients.map(r => r.address)} />
            </Approver.Section>
          </Approver.Overview>

          <Approver.Section>
            <ApproverAccountCard accounts={psbtAccounts} />
          </Approver.Section>

          <Approver.Section>
            <BitcoinFeeCard
              disabled={!feeEditorEnabled}
              feeType={selectedFeeType}
              amount={psbtDetails.fee}
              onPress={() => feeSheetRef.current?.present()}
            />
          </Approver.Section>
          <Approver.Advanced
            titleClosed={t`Show advanced options`}
            titleOpened={t`Hide advanced options`}
          >
            <Approver.Section>
              <InputsAndOutputsCard
                inputs={psbtDetails.psbtInputs}
                outputs={psbtDetails.psbtOutputs}
              />
            </Approver.Section>
          </Approver.Advanced>
        </Approver.Container>
        <Approver.Footer>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="label02">{t`Total spend`}</Text>
            <Text variant="label02">{formatCurrency(totalSpendQuote)}</Text>
          </Box>
          <ApproverButtons
            onBack={onBack}
            onApprove={onSubmitTransaction}
            onCopy={broadcast ? onCopy : undefined}
            onViewDetails={broadcast ? onViewDetails : undefined}
            onClose={onClose}
          />
        </Approver.Footer>
      </Approver>
      <BitcoinFeesSheet
        sheetRef={feeSheetRef}
        selectedFeeType={selectedFeeType}
        onChangeFee={onChangeFee}
        fees={feeRates}
        txSize={txVBytes}
        currentFeeRate={Math.round(psbtDetails.fee.amount.toNumber() / txVBytes)}
      />
    </>
  );
}
