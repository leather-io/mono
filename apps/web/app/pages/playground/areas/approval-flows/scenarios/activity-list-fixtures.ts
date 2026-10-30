import type { ApprovalHistoryState } from '../pattern/approval-direction';

export interface ActivityListBalance {
  symbol: string;
  amount: string;
  fiat: string;
  direction: 'in' | 'out';
}

export interface ActivityListExample {
  id: string;
  label: string;
  functionName: string;
  contractName: string;
  state: ApprovalHistoryState;
  balances: ActivityListBalance[];
  note: string;
  mapped: 'send' | 'receive' | 'swap';
  mappedLabel: string;
  mappedAmount: ActivityListBalance;
  nft?: string;
}

const stxSpend: ActivityListBalance = {
  symbol: 'STX',
  amount: '50.003',
  fiat: '$40.62',
  direction: 'out',
};
const stxReceive: ActivityListBalance = {
  symbol: 'STX',
  amount: '125',
  fiat: '$101.55',
  direction: 'in',
};
const sbtcReward: ActivityListBalance = {
  symbol: 'sBTC',
  amount: '0.00025',
  fiat: '$27.44',
  direction: 'in',
};
const stxFee: ActivityListBalance = {
  symbol: 'STX',
  amount: '0.003',
  fiat: '< $0.01',
  direction: 'out',
};

export const activityListExamples: ActivityListExample[] = [
  {
    id: 'activity-row-nft-mint',
    label: 'NFT mint paid in STX',
    functionName: 'mint',
    contractName: 'city-coins-nft',
    state: 'confirmed',
    balances: [stxSpend],
    note: 'The fungible balance change includes the 0.003 STX fee. The NFT is listed in details.',
    mapped: 'send',
    mappedLabel: 'Mapped send',
    mappedAmount: stxSpend,
    nft: 'City Coins #184',
  },
  {
    id: 'activity-row-send-many',
    label: 'Send-many receive',
    functionName: 'send-many',
    contractName: 'multi-transfer-v2',
    state: 'confirmed',
    balances: [{ symbol: 'USDCx', amount: '20', fiat: '$20.00', direction: 'in' }, stxReceive],
    note: 'Two net receipts: STX takes priority over USDCx. This account is the recipient; the sender pays the fee.',
    mapped: 'receive',
    mappedLabel: 'Mapped STX receive',
    mappedAmount: stxReceive,
  },
  {
    id: 'activity-row-reward',
    label: 'Signer-manager reward claim',
    functionName: 'claim-rewards',
    contractName: 'signer-manager',
    state: 'confirmed',
    balances: [stxFee, sbtcReward],
    note: 'sBTC received goes on top; the STX fee paid by this account goes underneath.',
    mapped: 'receive',
    mappedLabel: 'Mapped reward claim',
    mappedAmount: sbtcReward,
  },
  {
    id: 'activity-row-swap',
    label: 'Swap-like unmapped call',
    functionName: 'exchange',
    contractName: 'community-pool-v1',
    state: 'confirmed',
    balances: [
      { symbol: 'STX', amount: '100.003', fiat: '$81.24', direction: 'out' },
      { symbol: 'sBTC', amount: '0.00073', fiat: '$80.14', direction: 'in' },
    ],
    note: 'Received sBTC sits above spent STX, despite STX’s higher priority. The STX net spend includes the fee.',
    mapped: 'swap',
    mappedLabel: 'Mapped swap',
    mappedAmount: sbtcReward,
  },
  {
    id: 'activity-row-payout',
    label: 'Three-asset payout',
    functionName: 'distribute',
    contractName: 'rewards-distributor',
    state: 'confirmed',
    balances: [
      { symbol: 'USDCx', amount: '20', fiat: '$20.00', direction: 'in' },
      sbtcReward,
      stxReceive,
    ],
    note: 'STX leads, then +2 more. Details enumerate all three receipts. The distributor pays the fee.',
    mapped: 'receive',
    mappedLabel: 'Mapped STX receive',
    mappedAmount: stxReceive,
  },
  {
    id: 'activity-row-pending',
    label: 'Pending',
    functionName: 'mint',
    contractName: 'city-coins-nft',
    state: 'pending',
    balances: [],
    note: 'No confirmed balance changes yet. The unmapped row stays unchanged.',
    mapped: 'send',
    mappedLabel: 'Mapped pending send',
    mappedAmount: stxSpend,
  },
  {
    id: 'activity-row-failed',
    label: 'Failed',
    functionName: 'mint',
    contractName: 'city-coins-nft',
    state: 'failed',
    balances: [],
    note: 'The mint failed. No net summary is added to the row; only the 0.003 STX fee moved.',
    mapped: 'send',
    mappedLabel: 'Mapped failed send',
    mappedAmount: stxSpend,
  },
];

const assetPriority = ['BTC', 'STX', 'sBTC', 'USDCx'];

function priority(symbol: string) {
  const index = assetPriority.indexOf(symbol);
  return index < 0 ? assetPriority.length : index;
}

function signedAmount(balance: ActivityListBalance) {
  return `${balance.direction === 'in' ? '+' : '−'}${balance.amount} ${balance.symbol}`;
}

export function activityListSummary(example: Pick<ActivityListExample, 'state' | 'balances'>) {
  if (example.state !== 'confirmed') return undefined;
  const sorted = [...example.balances].sort((a, b) => priority(a.symbol) - priority(b.symbol));
  const received = sorted.filter(balance => balance.direction === 'in');
  const sent = sorted.filter(balance => balance.direction === 'out');
  const top = received.length && sent.length ? received[0] : sorted[0];
  if (!top) return undefined;
  const second = received.length && sent.length ? sent[0] : sorted[1];
  const caption = second ? signedAmount(second) : top.fiat;
  return {
    amount: signedAmount(top),
    direction: top.direction,
    caption: sorted.length >= 3 ? `+${sorted.length - 1} more` : caption,
  };
}
