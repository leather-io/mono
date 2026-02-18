import { PsbtSigner } from '@app/features/psbt-signer/psbt-signer';
import { Outlet } from '@app/routes/compat';

import { useRpcSignPsbt } from './use-rpc-sign-psbt';

export function RpcSignPsbt() {
  const { indexesToSign, isBroadcasting, onSignPsbt, onCancel, origin, psbtHex } = useRpcSignPsbt();

  return (
    <>
      <PsbtSigner
        indexesToSign={indexesToSign}
        isBroadcasting={isBroadcasting}
        origin={origin}
        onSignPsbt={onSignPsbt}
        onCancel={onCancel}
        psbtHex={psbtHex}
      />
      <Outlet />
    </>
  );
}
