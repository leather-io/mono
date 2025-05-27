import { useMemo } from 'react';

import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { createCoinSelectionUtxos } from '@/features/send/utils';
import { useAverageBitcoinFeeRates } from '@/queries/fees/fee-estimates.hooks';
import { useAccountUtxos } from '@/queries/utxos/utxos.query';
import { App } from '@/store/apps/utils';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { destructAccountIdentifier } from '@/store/utils';
import { bytesToHex } from '@noble/hashes/utils';
import BigNumber from 'bignumber.js';

import {
  createBitcoinAddress,
  generateBitcoinUnsignedTransactionNativeSegwit,
  getBtcSignerLibNetworkConfigByMode,
  payerToBip32Derivation,
} from '@leather.io/bitcoin';
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
import { createMoneyFromDecimal } from '@leather.io/utils';

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

  const bitcoinAccount = useMemo(
    () => accountIdByPaymentType(props.accountId),
    [accountIdByPaymentType, props.accountId]
  );
  const nativeSegwitPayer = useMemo(
    () => bitcoinAccount.nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 }),
    [bitcoinAccount.nativeSegwit]
  );
  const networkMode = useMemo(
    () => bitcoinNetworkModesSchema.parse(props.request.params.network),
    [props.request.params.network]
  );
  const tx = useMemo(
    () =>
      // if all wallets deleted, nativeSegwitPayer will be undefined
      nativeSegwitPayer &&
      generateBitcoinUnsignedTransactionNativeSegwit({
        payerAddress: createBitcoinAddress(nativeSegwitPayer.address),
        payerPublicKey: bytesToHex(nativeSegwitPayer.publicKey),
        recipients: getSendTransferRecipients(props.request.params),
        feeRate: props.feeRates?.halfHourFee.toNumber() ?? 1,
        isSendingMax: false,
        utxos: createCoinSelectionUtxos(props.utxos.available),
        bip32Derivation: [payerToBip32Derivation(nativeSegwitPayer)],
        network: getBtcSignerLibNetworkConfigByMode(networkMode),
      }),
    [
      nativeSegwitPayer,
      networkMode,
      props.feeRates?.halfHourFee,
      props.request.params,
      props.utxos.available,
    ]
  );
  // if all wallets deleted, tx will be undefined
  const psbtHex = tx ? bytesToHex(tx.psbt) : undefined;
  if (!psbtHex) return null;
  return (
    <PsbtSigner
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
