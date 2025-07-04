import { useMemo } from 'react';

import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { useAverageBitcoinFeeRates } from '@/queries/fees/fee-estimates.hooks';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import { App } from '@/store/apps/utils';
import {
  useBitcoinAccounts,
  useBitcoinPayerFromKeyOrigin,
} from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { destructAccountIdentifier } from '@/store/utils';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import {
  createBitcoinAddress,
  generateBitcoinUnsignedTransaction,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import { extractAccountIndexFromDescriptor } from '@leather.io/crypto';
import { AverageBitcoinFeeRates, bitcoinNetworkModesSchema } from '@leather.io/models';
import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  rpcSendTransferLegacyParamSchema,
  rpcSendTransferNewParamsSchema,
  sendTransfer,
} from '@leather.io/rpc';
import { UtxoTotals } from '@leather.io/services';
import { createMoneyFromDecimal, isDefined } from '@leather.io/utils';

interface SendTransferApproverProps {
  request: RpcRequest<typeof sendTransfer>;
  sendResult(result: RpcResponse<typeof sendTransfer>): void;
  app: App;
  closeApprover(): void;
  accountId: string;
}
export function SendTransferApprover(props: SendTransferApproverProps) {
  const { data: feeRates } = useAverageBitcoinFeeRates();
  const { fingerprint, accountIndex } = destructAccountIdentifier(props.accountId);
  const utxos = useAccountUtxos(fingerprint, accountIndex);

  // TODO: find a better way to handle this
  if (!utxos.value) return null;
  if (!feeRates) return null;

  return <BaseSendTransferApprover {...props} utxos={utxos.value} feeRates={feeRates} />;
}

function getSendTransferRecipients(params: RpcRequest<typeof sendTransfer>['params']) {
  const parsedNewParams = rpcSendTransferNewParamsSchema.safeParse(params);
  const parsedLegacyParams = rpcSendTransferLegacyParamSchema.safeParse(params);

  if (parsedNewParams.success) {
    return parsedNewParams.data.recipients.map(rec => ({
      address: createBitcoinAddress(rec.address),
      amount: createMoneyFromDecimal(new BigNumber(rec.amount), 'BTC'),
    }));
  }
  if (parsedLegacyParams.success) {
    return [
      {
        address: createBitcoinAddress(parsedLegacyParams.data.address),
        amount: createMoneyFromDecimal(new BigNumber(parsedLegacyParams.data.amount), 'BTC'),
      },
    ];
  }
  throw new Error("Send transfer params don't pass zod validation");
}

function BaseSendTransferApprover(
  props: SendTransferApproverProps & {
    utxos: UtxoTotals;
    feeRates: AverageBitcoinFeeRates;
  }
) {
  const { accountIdByPaymentType } = useBitcoinAccounts();
  const payerLookup = useBitcoinPayerFromKeyOrigin();

  const bitcoinAccount = useMemo(
    () => accountIdByPaymentType(props.accountId),
    [accountIdByPaymentType, props.accountId]
  );

  const networkMode = useMemo(
    () => bitcoinNetworkModesSchema.parse(props.request.params.network),
    [props.request.params.network]
  );

  const tx = useMemo(
    () =>
      // if all wallets deleted, bitcoinAccount.nativeSegwit will be undefined
      bitcoinAccount.nativeSegwit &&
      generateBitcoinUnsignedTransaction({
        recipients: getSendTransferRecipients(props.request.params),
        feeRate: props.feeRates?.halfHourFee.toNumber() ?? 1,
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
      props.feeRates?.halfHourFee,
      props.request.params,
      props.utxos.available,
    ]
  );
  // if all wallets deleted, tx will be undefined
  const psbtHex = tx ? bytesToHex(tx.psbt) : undefined;

  const fingerprint = bitcoinAccount?.nativeSegwit?.masterKeyFingerprint;
  const descriptor = bitcoinAccount?.nativeSegwit?.descriptor;

  if (!psbtHex || !isDefined(descriptor) || !isDefined(fingerprint)) return null;
  return (
    <PsbtSigner
      origin={props.app.origin}
      feeEditorEnabled
      accountIndex={extractAccountIndexFromDescriptor(descriptor)}
      fingerprint={fingerprint}
      broadcast
      psbtHex={psbtHex}
      network={networkMode}
      onBack={props.closeApprover}
      onResult={result => {
        if (result.txid) {
          const rpcSuccessResponse = createRpcSuccessResponse('sendTransfer', {
            id: props.request.id,
            result: {
              txid: result.txid,
            },
          });
          props.sendResult(rpcSuccessResponse);
        }
      }}
    />
  );
}
