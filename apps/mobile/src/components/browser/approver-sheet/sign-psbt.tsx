import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';
import { App } from '@/store/apps/utils';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';

import { bitcoinNetworkModesSchema } from '@leather.io/models';
import { RpcRequest, RpcResult, createRpcSuccessResponse, signPsbt } from '@leather.io/rpc';

import { addBip32DerivationFieldToInputs } from './utils';

interface SignPsbtApproverProps {
  message: RpcRequest<typeof signPsbt>;
  sendResult(result: object): void;
  origin: string;
  app: App;
  closeApprover(): void;
}

export function SignPsbtApprover(props: SignPsbtApproverProps) {
  const { list: bitcoinAccounts } = useBitcoinAccounts();
  const networkMode = bitcoinNetworkModesSchema.parse(props.message.params.network);
  if (props.app.status === 'connected') {
    const infusedPsbt = addBip32DerivationFieldToInputs({
      psbtHex: props.message.params.hex,
      networkMode,
      bitcoinAccounts,
      accountId: props.app.accountId,
      signAtIndex: props.message.params.signAtIndex,
    });
    return (
      <PsbtSigner
        broadcast={props.message.params.broadcast}
        allowedSighash={props.message.params.allowedSighash}
        signAtIndex={infusedPsbt.signAtIndex}
        psbtHex={infusedPsbt.psbtHex}
        network={networkMode}
        onBack={props.closeApprover}
        onSuccess={(result: RpcResult<typeof signPsbt>) => {
          const rpcSuccessResponse = createRpcSuccessResponse('signPsbt', {
            id: props.message.id,
            result,
          });
          props.sendResult(rpcSuccessResponse);
        }}
      />
    );
  }
  return null;
}
