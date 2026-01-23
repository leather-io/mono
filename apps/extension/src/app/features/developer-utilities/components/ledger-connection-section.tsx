import { useNavigate } from 'react-router';

import { HStack } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

export function LedgerConnectionSection() {
  const navigate = useNavigate();

  function handleConnectBitcoinLedger() {
    void navigate('bitcoin/connect-your-ledger', {
      state: {
        fromLocation: '/multi-wallet-test',
      },
    });
  }

  function handleConnectStacksLedger() {
    void navigate('stacks/connect-your-ledger', {
      state: {
        fromLocation: '/multi-wallet-test',
      },
    });
  }

  return (
    <HStack gap="space.03" flexWrap="wrap">
      <Button onClick={handleConnectBitcoinLedger} size="sm" variant="outline">
        Connect Ledger (Bitcoin)
      </Button>
      <Button onClick={handleConnectStacksLedger} size="sm" variant="outline">
        Connect Ledger (Stacks)
      </Button>
    </HStack>
  );
}
