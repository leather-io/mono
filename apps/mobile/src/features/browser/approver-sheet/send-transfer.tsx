import { useMemo } from 'react';

import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { type BitcoinFeeRates, useBitcoinFeeRates } from '@/queries/fees/bitcoin-fee-rates.query';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import { useGetBtcNetworkFromRequestParams } from '@/shared/utils';
import { type App } from '@/store/apps/utils';
import {
  useBitcoinAccounts,
  useBitcoinPayerFromKeyOrigin,
} from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { destructAccountIdentifier } from '@/store/utils';
import { bytesToHex } from '@noble/hashes/utils';

import {
  generateBitcoinUnsignedTransaction,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import { extractAccountIndexFromDescriptor } from '@leather.io/crypto';
import {
  type RpcRequest,
  type RpcResponse,
  createRpcSuccessResponse,
  type sendTransfer,
} from '@leather.io/rpc';
import { type UtxoTotals } from '@leather.io/services';
import { isDefined } from '@leather.io/utils';

import { getSendTransferRecipients } from './send-transfer.utils';

interface SendTransferApproverProps {
  request: RpcRequest<typeof sendTransfer>;
  sendResult(result: RpcResponse<typeof sendTransfer>): void;
  app: App;
  closeApprover(): void;
  accountId: string;
}
export function SendTransferApprover(props: SendTransferApproverProps) {
  const { data: feeRates } = useBitcoinFeeRates();
  const { fingerprint, accountIndex } = destructAccountIdentifier(props.accountId);
  const utxos = useAccountUtxos(fingerprint, accountIndex);

  // TODO: find a better way to handle this
  if (!utxos.value) return null;
  if (!feeRates) return null;

  return <BaseSendTransferApprover {...props} utxos={utxos.value} feeRates={feeRates} />;
}

function BaseSendTransferApprover(
  props: SendTransferApproverProps & {
    utxos: UtxoTotals;
    feeRates: BitcoinFeeRates;
  }
) {
  const { accountIdByPaymentType } = useBitcoinAccounts();
  const payerLookup = useBitcoinPayerFromKeyOrigin();

  const bitcoinAccount = useMemo(
    () => accountIdByPaymentType(props.accountId),
    [accountIdByPaymentType, props.accountId]
  );
  const network = useGetBtcNetworkFromRequestParams(props.request.params.network);
  const networkMode = network.chain.bitcoin.mode;

  const tx = useMemo(
    () =>
      // if all wallets deleted, bitcoinAccount.nativeSegwit will be undefined
      bitcoinAccount.nativeSegwit &&
      generateBitcoinUnsignedTransaction({
        recipients: getSendTransferRecipients(props.request.params),
        feeRate: props.feeRates.standard.rate,
        isSendingMax: false,
        utxos: props.utxos.available,
        network: getBtcSignerLibNetworkConfigByMode(networkMode),
        payerLookup,
        changeAddress: bitcoinAccount.nativeSegwit.derivePayer({
          change: 0,
          addressIndex: 0,
        }).address,
      }),
    [
      bitcoinAccount.nativeSegwit,
      networkMode,
      payerLookup,
      props.feeRates.standard.rate,
      props.request.params,
      props.utxos.available,
    ]
  );
  // if all wallets deleted, tx will be undefined
  const psbtHex = tx ? bytesToHex(tx.psbt) : undefined;
  const broadcast = props.request.params.broadcast ?? true;

  const fingerprint = bitcoinAccount?.nativeSegwit?.masterKeyFingerprint;
  const descriptor = bitcoinAccount?.nativeSegwit?.descriptor;

  if (!psbtHex || !isDefined(descriptor) || !isDefined(fingerprint)) return null;
  return (
    <PsbtSigner
      origin={props.app.origin}
      feeEditorEnabled
      accountIndex={extractAccountIndexFromDescriptor(descriptor)}
      fingerprint={fingerprint}
      broadcast={broadcast}
      signOnly={!broadcast}
      psbtHex={psbtHex}
      network={networkMode}
      onBack={props.closeApprover}
      onClose={props.closeApprover}
      onResult={result => {
        const rpcSuccessResponse = createRpcSuccessResponse('sendTransfer', {
          id: props.request.id,
          result: {
            txid: result.txid,
            transaction: result.hex,
          },
        });
        props.sendResult(rpcSuccessResponse);
      }}
    />
  );
}
