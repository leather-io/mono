import { Outlet } from 'react-router';

import { PsbtSigner } from '@app/features/psbt-signer/psbt-signer';

import { useRpcSignPsbt } from './use-rpc-sign-psbt';

export function RpcSignPsbt() {
  const {
    broadcast,
    descriptor,
    indexesToSign,
    isBroadcasting,
    onSignPsbt,
    onCancel,
    origin,
    psbtHex,
  } = useRpcSignPsbt();

  return (
    <>
      <PsbtSigner
        descriptor={descriptor}
        indexesToSign={indexesToSign}
        isBroadcasting={isBroadcasting}
        origin={origin}
        onSignPsbt={onSignPsbt}
        onCancel={onCancel}
        psbtHex={psbtHex}
        willBroadcast={broadcast}
      />
      <Outlet />
    </>
  );
}
