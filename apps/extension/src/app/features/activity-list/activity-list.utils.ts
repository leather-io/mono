import type { BlockchainActivityItem } from '@leather.io/features';

function insertByTimestampDesc(items: BlockchainActivityItem[], item: BlockchainActivityItem) {
  const index = items.findIndex(candidate => candidate.view.timestamp < item.view.timestamp);
  if (index === -1) items.push(item);
  else items.splice(index, 0, item);
}

export function mergeSbtcDepositItems(
  feed: BlockchainActivityItem[],
  deposits: BlockchainActivityItem[]
): BlockchainActivityItem[] {
  if (deposits.length === 0) return feed;
  const pending = deposits.filter(item => item.view.status === 'pending');
  const settled = deposits.filter(item => item.view.status !== 'pending');
  const merged = [...pending, ...feed];
  for (const item of settled) insertByTimestampDesc(merged, item);
  return merged;
}
