import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import { Badge } from '@leather.io/ui';

import type { MultisigTransaction, Vault } from '../data/multisig-types';
import { ChainGlyph } from './chain-glyph';
import { StatusPill } from './status-pill';

interface TxRowProps {
  tx: MultisigTransaction;
  vault: Vault;
  showVaultName?: boolean;
  onClick(): void;
}

// Shared activity row used by the dashboard, vault detail, and account detail.
export function TxRow({ tx, vault, showVaultName, onClick }: TxRowProps) {
  const meSigned = tx.signed.some(name => name === 'Me' || name === 'me');
  const awaitingMySig =
    tx.proposerUserId === 'me' && !meSigned && (tx.status === 'pending' || tx.status === 'queued');
  return (
    <styled.button
      type="button"
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap="space.03"
      width="100%"
      textAlign="left"
      cursor="pointer"
      px="space.03"
      py="space.03"
      borderRadius="sm"
      bg="transparent"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <Circle size="32px" bg="ink.background-secondary" flexShrink={0}>
        <ChainGlyph chain={vault.chain} variant="small" />
      </Circle>
      <Box flex={1} minWidth={0}>
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="label.02" truncate>
            {tx.title}
          </styled.span>
          {awaitingMySig ? (
            <Badge variant="warning" label="Awaiting your signature" />
          ) : (
            tx.highlight && <StatusPill status={tx.status} />
          )}
        </Flex>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate display="block">
          {showVaultName ? vault.name : tx.sub}
        </styled.span>
      </Box>
      <Box textAlign="right" flexShrink={0}>
        <styled.div textStyle="label.02">{tx.amount}</styled.div>
        <styled.div textStyle="caption.01" color="ink.text-subdued">
          {tx.amountUsd}
        </styled.div>
      </Box>
    </styled.button>
  );
}
