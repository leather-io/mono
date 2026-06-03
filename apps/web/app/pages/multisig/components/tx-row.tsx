import type { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';

import { FailedIcon, SentIcon } from '@leather.io/ui';

import type { MultisigTransaction, Vault } from '../data/multisig-types';
import { Badge } from './badge';
import { ChainAvatar } from './chain-avatar';
import { StatusPill } from './status-pill';
import { type TxIndicatorKind, txStatusToIndicatorKind } from './tx-status-indicator';
import { VaultListItem } from './vault-list-item';

interface TxRowProps {
  tx: MultisigTransaction;
  vault: Vault;
  showVaultName?: boolean;
  onClick(): void;
}

const txIndicatorIcon: Record<TxIndicatorKind, ReactElement> = {
  sent: <SentIcon width={16} height={16} />,
  failed: <FailedIcon width={16} height={16} />,
};

// Shared activity row used by the dashboard, vault detail, and account detail.
export function TxRow({ tx, vault, showVaultName, onClick }: TxRowProps) {
  const meSigned = tx.signed.some(name => name === 'Me' || name === 'me');
  const awaitingMySig =
    tx.proposerUserId === 'me' && !meSigned && (tx.status === 'pending' || tx.status === 'queued');

  function renderTitleAccessory() {
    if (awaitingMySig) return <Badge variant="warning" label="Awaiting your signature" />;
    if (tx.highlight) return <StatusPill status={tx.status} />;
    return undefined;
  }

  return (
    <styled.button
      type="button"
      onClick={onClick}
      display="block"
      width="100%"
      textAlign="left"
      cursor="pointer"
      px="space.03"
      py="space.03"
      borderRadius="sm"
      bg="transparent"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <VaultListItem
        leading={
          <ChainAvatar
            chain={vault.chain}
            size="lg"
            indicator={txIndicatorIcon[txStatusToIndicatorKind(tx.status)]}
          />
        }
        title={tx.title}
        titleAccessory={renderTitleAccessory()}
        caption={showVaultName ? vault.name : tx.sub}
        trailingTitle={tx.amount}
        trailingSubtitle={tx.amountUsd}
      />
    </styled.button>
  );
}
