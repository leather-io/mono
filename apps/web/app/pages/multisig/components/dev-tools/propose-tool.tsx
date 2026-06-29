import { useState } from 'react';

import { Flex } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { BtcProposeTool } from './btc-propose-tool';
import { StxProposeTool } from './stx-propose-tool';

type ProposeChain = 'btc' | 'stx';

export function ProposeTool() {
  const [chain, setChain] = useState<ProposeChain>('btc');
  return (
    <Flex direction="column" gap="space.02">
      <Flex gap="space.01">
        <Button
          variant={chain === 'btc' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => setChain('btc')}
        >
          BTC
        </Button>
        <Button
          variant={chain === 'stx' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => setChain('stx')}
        >
          STX
        </Button>
      </Flex>
      {chain === 'btc' ? <BtcProposeTool /> : <StxProposeTool />}
    </Flex>
  );
}
