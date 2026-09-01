import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router';

import { PsbtSigner } from '@app/features/psbt-signer/psbt-signer';

import { useRpcSignPsbt } from './use-rpc-sign-psbt';

export function RpcSignPsbt() {
  const {
    broadcast,
    descriptor,
    bondProposal,
    hasDisallowedSighash,
    indexesToSign,
    isBroadcasting,
    onSignPsbt,
    onCancel,
    origin,
    psbtHex,
    rejectDisallowedSighash,
  } = useRpcSignPsbt();
  const hasRejectedDisallowedSighash = useRef(false);

  useEffect(() => {
    if (!hasDisallowedSighash || hasRejectedDisallowedSighash.current) return;
    hasRejectedDisallowedSighash.current = true;
    rejectDisallowedSighash();
  }, [hasDisallowedSighash, rejectDisallowedSighash]);

  if (hasDisallowedSighash) return null;

  return (
    <>
      <PsbtSigner
        descriptor={bondProposal ? bondProposal.bondDescriptor : descriptor}
        bondProposal={bondProposal ?? undefined}
        indexesToSign={indexesToSign}
        isBroadcasting={isBroadcasting}
        origin={origin}
        onSignPsbt={onSignPsbt}
        onCancel={onCancel}
        psbtHex={psbtHex}
        willBroadcast={bondProposal ? false : broadcast}
      />
      <Outlet />
    </>
  );
}
