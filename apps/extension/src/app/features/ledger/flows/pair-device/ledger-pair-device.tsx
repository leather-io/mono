import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { Button, Callout, Sheet, SheetHeader } from '@leather.io/ui';

import { LedgerTitle } from '../../components/ledger-title';
import { LedgerWrapper } from '../../components/ledger-wrapper';
import { useHardwareWalletConnector } from '../../hardware-wallet/hardware-wallet.context';

type PairingStatus = 'idle' | 'connecting' | 'failed' | 'connected';

interface LedgerPairDeviceProps {
  onClose(): void;
}
export function LedgerPairDevice({ onClose }: LedgerPairDeviceProps) {
  const connector = useHardwareWalletConnector();
  const [status, setStatus] = useState<PairingStatus>('idle');
  const isConnected = status === 'connected';

  async function pairDevice() {
    setStatus('connecting');
    try {
      await connector.pair({});
      setStatus('connected');
    } catch {
      setStatus('failed');
    }
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
          <Button
            width="100%"
            onClick={() => void pairDevice()}
            aria-busy={status === 'connecting'}
          >
            Connect Ledger
          </Button>
        )}
      </LedgerWrapper>
    </Sheet>
  );
}
