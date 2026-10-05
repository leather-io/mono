import { useState } from 'react';
import { Navigate, Route, useNavigate } from 'react-router';

import { styled } from 'leather-styles/jsx';

import { Button, Callout, Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { safeAwait } from '@app/common/utils/safe-await';
import { useBackgroundLocation } from '@app/routes/hooks/use-background-location';

import { LedgerTitle } from '../../components/ledger-title';
import { LedgerWrapper } from '../../components/ledger-wrapper';
import { connectLedgerDeviceToApp } from '../../dmk/ledger-device-connection';
import { LedgerDmkProvider, useLedgerDmk } from '../../dmk/ledger-dmk.context';
import { closeLedgerSession } from '../../dmk/ledger-session';

type PairingStatus = 'idle' | 'connecting' | 'failed' | 'connected';

function LedgerPairDevice() {
  const dmk = useLedgerDmk();
  const navigate = useNavigate();
  const backgroundLocation = useBackgroundLocation();
  const [status, setStatus] = useState<PairingStatus>('idle');
  const isConnected = status === 'connected';

  async function pairDevice() {
    setStatus('connecting');
    const [error, sessionId] = await safeAwait(connectLedgerDeviceToApp(dmk, null));
    if (error || !sessionId) {
      setStatus('failed');
      return;
    }
    await closeLedgerSession(dmk, sessionId);
    setStatus('connected');
  }

  function returnHome() {
    return navigate(RouteUrls.Home);
  }

  if (!backgroundLocation)
    return (
      <Navigate
        to={`/${RouteUrls.LedgerPairDeviceTab}`}
        replace
        state={{ backgroundLocation: { pathname: RouteUrls.Home } }}
      />
    );

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={returnHome}>
      <LedgerWrapper>
        <LedgerTitle>
          {isConnected ? 'Your Ledger is connected' : 'Connect your Ledger'}
        </LedgerTitle>
        <styled.span textStyle="body.02" color="ink.text-subdued" mt="space.03" mb="space.05">
          {isConnected
            ? 'Go back to the app and start your request again.'
            : 'Plug in and unlock your Ledger, then choose it in the browser prompt.'}
        </styled.span>
        {status === 'failed' && (
          <Callout variant="warning" mb="space.05">
            We couldn't connect to your Ledger. Close Ledger Live and try again.
          </Callout>
        )}
        {isConnected ? (
          <Button width="100%" onClick={returnHome}>
            Done
          </Button>
        ) : (
          <Button width="100%" onClick={pairDevice} aria-busy={status === 'connecting'}>
            Connect Ledger
          </Button>
        )}
      </LedgerWrapper>
    </Sheet>
  );
}

export const pairLedgerDeviceRoute = (
  <Route
    path={RouteUrls.LedgerPairDeviceTab}
    element={
      <LedgerDmkProvider>
        <LedgerPairDevice />
      </LedgerDmkProvider>
    }
  />
);
