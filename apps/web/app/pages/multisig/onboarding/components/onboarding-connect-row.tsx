import { Box } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { Badge } from '../../components/badge';
import { ChainAvatar } from '../../components/chain-avatar';
import { VaultListItem } from '../../components/vault-list-item';
import type { Chain } from '../../data/multisig-types';

interface OnboardingConnectRowProps {
  chain: Chain;
  connected: boolean;
  onConnect(): void;
}

export function OnboardingConnectRow({ chain, connected, onConnect }: OnboardingConnectRowProps) {
  const label = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const desc = chain === 'btc' ? 'Sign PSBT-based BTC vaults' : 'Sign on-chain STX & sBTC vaults';
  return (
    <Box
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      <VaultListItem
        leading={<ChainAvatar chain={chain} size="lg" />}
        title={`Connect ${label}`}
        caption={desc}
        trailingTitle={
          connected ? (
            <Badge variant="success" label="Connected" />
          ) : (
            <Button variant="solid" onClick={onConnect}>
              Connect
            </Button>
          )
        }
      />
    </Box>
  );
}
