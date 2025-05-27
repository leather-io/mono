import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { App } from '@/store/apps/utils';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';

import { bitcoinNetworkModesSchema } from '@leather.io/models';
import {
  RpcRequest,
  RpcResponse,
  RpcResult,
  createRpcSuccessResponse,
  signPsbt,
} from '@leather.io/rpc';

import { addBip32DerivationFieldToInputs } from './utils';

interface SignPsbtApproverProps {
  request: RpcRequest<typeof signPsbt>;
  app: App;
  sendResult(result: RpcResponse<typeof signPsbt>): void;
  closeApprover(): void;
}
export function SignPsbtApprover(props: SignPsbtApproverProps) {
  const { list: bitcoinAccounts } = useBitcoinAccounts();
  const networkMode = bitcoinNetworkModesSchema.parse(props.request.params.network);

  if (props.app.status !== 'connected') return null;

  const decoratedPsbt = addBip32DerivationFieldToInputs({
    psbtHex: props.request.params.hex,
    accountId: props.app.accountId,
    signAtIndex: props.request.params.signAtIndex,
    networkMode,
    bitcoinAccounts,
  });

  return (
    <PsbtSigner
      {...deserializeAccountId(props.app.accountId)}
      broadcast={props.request.params.broadcast}
      allowedSighash={props.request.params.allowedSighash}
      signAtIndex={decoratedPsbt.signAtIndex}
      psbtHex={decoratedPsbt.psbtHex}
      network={networkMode}
      onBack={props.closeApprover}
      onResult={(result: RpcResult<typeof signPsbt>) => {
        const rpcSuccessResponse = createRpcSuccessResponse('signPsbt', {
          id: props.request.id,
          result,
        });
        props.sendResult(rpcSuccessResponse);
      }}
    />
  );
}
