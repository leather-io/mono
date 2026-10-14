import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { Button, Callout, Sheet, SheetHeader } from '@leather.io/ui';

import { safeAwait } from '@app/common/utils/safe-await';

import { LedgerTitle } from '../../components/ledger-title';
import { LedgerWrapper } from '../../components/ledger-wrapper';
import { connectLedgerDeviceToApp } from '../../dmk/ledger-device-connection';
import { useLedgerDmk } from '../../dmk/ledger-dmk.context';
import { closeLedgerSession } from '../../dmk/ledger-session';

type PairingStatus = 'idle' | 'connecting' | 'failed' | 'connected';

interface LedgerPairDeviceProps {
  onClose(): void;
}
export function LedgerPairDevice({ onClose }: LedgerPairDeviceProps) {
  const dmk = useLedgerDmk();
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

  return (
    <Sheet isShowing header={<SheetHeader />} onClose={onClose}>
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
          <Button width="100%" onClick={onClose}>
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
