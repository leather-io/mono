import { Box, Flex, styled } from 'leather-styles/jsx';

import type { AuthNetworkId, MultisigTransactionStatus } from '@leather.io/models';

import { TransactionList, type TransactionListItem } from '../components/transaction-list';

// Dev-only preview of the redesigned transaction feed (status off the title line,
// segmented In progress / History, sidebar scale) rendered with mock summaries
// outside the wallet-gated data layer.
const nowSeconds = Math.floor(Date.now() / 1000);

function mockItem(
  id: string,
  network: AuthNetworkId,
  status: MultisigTransactionStatus,
  minutesAgo: number,
  approvalCount: number,
  threshold: number
): TransactionListItem {
  return {
    vaultId: 'vault-preview',
    subtitle: 'Team Treasury',
    threshold,
    transaction: {
      id,
      vaultAccountId: 'account-preview',
      network,
      proposerUserId: 'me',
      proposalTimestamp: nowSeconds - minutesAgo * 60,
      nonce: null,
      txId: null,
      status,
      broadcastAt: null,
      createdAt: '',
      updatedAt: '',
      approvalCount,
    },
  };
}

const items: TransactionListItem[] = [
  mockItem('1', 'stx:mainnet', 'pending', 8, 1, 3),
  mockItem('2', 'btc:mainnet', 'pending', 26, 2, 3),
  mockItem('3', 'stx:mainnet', 'signed', 55, 3, 3),
  mockItem('4', 'btc:mainnet', 'broadcast', 70, 3, 3),
  mockItem('5', 'stx:mainnet', 'confirmed', 240, 3, 3),
  mockItem('6', 'stx:mainnet', 'failed', 1500, 3, 3),
];

function Column({
  label,
  width,
  scale,
  withSubtitle,
}: {
  label: string;
  width: string;
  scale: 'regular' | 'compact';
  withSubtitle: boolean;
}) {
  const data = withSubtitle ? items : items.map(item => ({ ...item, subtitle: undefined }));
  return (
    <Box width={width}>
      <styled.p textStyle="label.03" color="ink.text-subdued" mb="space.03">
        {label}
      </styled.p>
      {/* preview only: row navigation is a no-op here */}
      <TransactionList items={data} scale={scale} onSelect={() => undefined} />
    </Box>
  );
}

export function TransactionListPreviewPage() {
  return (
    <Box p="space.07" bg="ink.background-primary">
      <styled.h1 textStyle="heading.05" mb="space.06">
        Transaction feed — local preview (on #2435)
      </styled.h1>
      <Flex gap="space.07" alignItems="flex-start" flexWrap="wrap">
        <Column
          label="Account main column — regular"
          width="460px"
          scale="regular"
          withSubtitle={false}
        />
        <Column
          label="Dashboard / vault sidebar — compact"
          width="330px"
          scale="compact"
          withSubtitle
        />
      </Flex>
    </Box>
  );
}
