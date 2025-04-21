import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
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
  sendResult(result: RpcResponse<typeof signPsbt>): void;
  app: App;
  closeApprover(): void;
}

export function SignPsbtApprover(props: SignPsbtApproverProps) {
  const { list: bitcoinAccounts } = useBitcoinAccounts();
  const networkMode = bitcoinNetworkModesSchema.parse(props.request.params.network);
  if (props.app.status === 'connected') {
    const infusedPsbt = addBip32DerivationFieldToInputs({
      psbtHex: props.request.params.hex,
      networkMode,
      bitcoinAccounts,
      accountId: props.app.accountId,
      signAtIndex: props.request.params.signAtIndex,
    });
    return (
      <PsbtSigner
        broadcast={props.request.params.broadcast}
        allowedSighash={props.request.params.allowedSighash}
        signAtIndex={infusedPsbt.signAtIndex}
        psbtHex={infusedPsbt.psbtHex}
        network={networkMode}
        onBack={props.closeApprover}
        onSuccess={(result: RpcResult<typeof signPsbt>) => {
          const rpcSuccessResponse = createRpcSuccessResponse('signPsbt', {
            id: props.request.id,
            result,
          });
          props.sendResult(rpcSuccessResponse);
        }}
      />
    );
  }
  return null;
}
