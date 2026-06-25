import { useState } from 'react';

import { Flex } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { BroadcastTool } from './broadcast-tool';
import { CancelTool } from './cancel-tool';
import { ProposeTool } from './propose-tool';
import { SignTool } from './sign-tool';

type TransactionTab = 'propose' | 'sign' | 'broadcast' | 'cancel';

const tabs: { key: TransactionTab; label: string }[] = [
  { key: 'propose', label: 'Propose' },
  { key: 'sign', label: 'Sign' },
  { key: 'broadcast', label: 'Broadcast' },
  { key: 'cancel', label: 'Cancel' },
];

// Propose / Sign / Broadcast, one at a time, walking a live transaction through
// its lifecycle.
export function TransactionTools() {
  const [tab, setTab] = useState<TransactionTab>('propose');
  return (
    <Flex direction="column" gap="space.03">
      <Flex gap="space.01">
        {tabs.map(({ key, label }) => (
          <Button
            key={key}
            variant={tab === key ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </Flex>
      {tab === 'propose' ? <ProposeTool /> : null}
      {tab === 'sign' ? <SignTool /> : null}
      {tab === 'broadcast' ? <BroadcastTool /> : null}
      {tab === 'cancel' ? <CancelTool /> : null}
    </Flex>
  );
}
