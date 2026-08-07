import { initialSearchParams } from '@app/common/initial-search-params';
import { LoadingSpinner } from '@app/components/loading-spinner';
import { LegacyRequestCallout } from '@app/features/legacy-request-callout/legacy-request-callout';
import { PsbtSigner } from '@app/features/psbt-signer/psbt-signer';

import { usePsbtRequest } from './use-psbt-request';

export function PsbtRequest() {
  const { appName, indexesToSign, isLoading, onSignPsbt, onDenyPsbtSigning, origin, psbtHex } =
    usePsbtRequest();
  const flow = initialSearchParams.get('flow');

  if (isLoading) return <LoadingSpinner height="100vh" />;

  return (
    <PsbtSigner
      banner={flow ? <LegacyRequestCallout origin={origin} method={flow} /> : undefined}
      name={appName ?? ''}
      indexesToSign={indexesToSign}
      origin={origin ?? ''}
      onSignPsbt={onSignPsbt}
      onCancel={onDenyPsbtSigning}
      psbtHex={psbtHex}
    />
  );
}
