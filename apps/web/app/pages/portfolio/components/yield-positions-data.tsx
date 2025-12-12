import { Box, styled } from 'leather-styles/jsx';

interface YieldPosition {
  id: string;
  name: string;
  type: string;
  apy?: number;
  balance: string;
  balanceSecondary?: string;
  positionType: 'supplied' | 'borrowed' | 'collateral' | 'debt' | 'position' | 'pending';
  icon?: string;
}

interface YieldProtocol {
  id: string;
  name: string;
  type: string;
  iconColor: string;
  icon?: string;
  externalUrl?: string;
  metrics: Array<{ label: string; value: string }>;
  totalValue: string;
  positions: YieldPosition[];
}

const protocolIcons: Record<string, string> = {
  zest: '/icons/zest.svg',
  granite: '/icons/granite.svg',
  'stacking-dao': '/icons/stacking-dao.webp',
};

const assetIcons: Record<string, string> = {
  ststxbtc: '/icons/ststxbtc.svg',
  aeusdc: '/icons/aeusdc.svg',
  stacks: '/icons/stacks.svg',
  sbtc: '/icons/sbtc.svg',
  ststx: '/icons/ststx.svg',
};

function ProtocolIcon({ protocolId, color, letter }: { protocolId?: string; color: string; letter: string }) {
  const iconSrc = protocolId ? protocolIcons[protocolId] : undefined;

  if (iconSrc) {
    return (
      <styled.img
        src={iconSrc}
        alt={letter}
        width="40px"
        height="40px"
        borderRadius="xs"
        objectFit="cover"
      />
    );
  }

  return (
    <Box
      width="40px"
      height="40px"
      borderRadius="xs"
      background={color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="bold"
      fontSize="14px"
    >
      {letter}
    </Box>
  );
}

function AssetIcon({ assetId, color, text }: { assetId?: string; color: string; text?: string }) {
  const iconSrc = assetId ? assetIcons[assetId.toLowerCase()] : undefined;

  if (iconSrc) {
    return (
      <styled.img
        src={iconSrc}
        alt={text}
        width="32px"
        height="32px"
        borderRadius="full"
        objectFit="cover"
      />
    );
  }

  return (
    <Box
      width="32px"
      height="32px"
      borderRadius="full"
      background={color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="bold"
      fontSize="10px"
    >
      {text}
    </Box>
  );
}

export const mockYieldProtocols: YieldProtocol[] = [
  {
    id: 'zest',
    name: 'Zest',
    type: 'Lending',
    iconColor: '#22c55e',
    externalUrl: 'https://zestprotocol.com',
    metrics: [
      { label: 'LTV', value: '35.45%' },
      { label: 'APY', value: '0.01%' },
    ],
    totalValue: '$53,941.76',
    positions: [
      {
        id: 'zest-ststxbtc-supplied',
        name: 'stSTXbtc',
        type: 'Supplied',
        apy: 0,
        balance: '$89,331.75',
        positionType: 'supplied',
      },
      {
        id: 'zest-aeusdc-supplied',
        name: 'aeUSDC',
        type: 'Supplied',
        apy: 2.08,
        balance: '$400.39',
        positionType: 'supplied',
      },
      {
        id: 'zest-stacks-borrowed',
        name: 'Stacks',
        type: 'Borrowed',
        apy: -1.41,
        balance: '$6,132.48',
        positionType: 'borrowed',
      },
      {
        id: 'zest-sbtc-borrowed',
        name: 'sBTC',
        type: 'Borrowed',
        apy: -5.05,
        balance: '23,136.43',
        positionType: 'borrowed',
      },
      {
        id: 'zest-ststxbtc-borrowed',
        name: 'stSTXbtc',
        type: 'Borrowed',
        apy: -0.88,
        balance: '$6,518.04',
        positionType: 'borrowed',
      },
      {
        id: 'zest-aeusdc-borrowed',
        name: 'aeUSDC',
        type: 'Borrowed',
        apy: -3.69,
        balance: '$3.54',
        positionType: 'borrowed',
      },
    ],
  },
  {
    id: 'granite',
    name: 'Granite',
    type: 'Collateralized borrowing',
    iconColor: '#6366f1',
    metrics: [{ label: 'APY', value: '0.01%' }],
    totalValue: '$53,941.76',
    positions: [
      {
        id: 'granite-sbtc-collateral',
        name: 'sBTC',
        type: 'Collateral',
        balance: '1,975.00 USD',
        positionType: 'collateral',
      },
      {
        id: 'granite-aeusdc-debt',
        name: 'aeUSDC',
        type: 'Debt',
        apy: 1.07,
        balance: '$700.23',
        positionType: 'debt',
      },
    ],
  },
  {
    id: 'stacking-dao',
    name: 'Stacking DAO',
    type: 'Liquid stacking',
    iconColor: '#8b5cf6',
    metrics: [{ label: 'APY', value: '8.60%' }],
    totalValue: '$1,320.35',
    positions: [
      {
        id: 'stacking-dao-ststx',
        name: 'stSTX',
        type: 'Position',
        apy: 8.81,
        balance: '$195.07',
        positionType: 'position',
      },
      {
        id: 'stacking-dao-ststxbtc',
        name: 'stSTXbtc',
        type: 'Position',
        apy: 1.07,
        balance: '$700.23',
        positionType: 'position',
      },
      {
        id: 'stacking-dao-sbtc-pending',
        name: 'sBTC',
        type: 'Pending unlocks',
        balance: '$330.31',
        positionType: 'pending',
      },
      {
        id: 'stacking-dao-ststxbtc-pending',
        name: 'stSTXbtc',
        type: 'Pending withdrawal',
        balance: '$330.31',
        positionType: 'pending',
      },
    ],
  },
];

export const mockAllocationSegments = [
  { id: 'stacking-dao', label: 'Liquid stacking', percentage: 45, color: '#7bf178', icon: '/icons/stacking-dao.webp' },
  { id: 'zest', label: 'Zest - Lending', percentage: 25, color: '#d8cec4', icon: '/icons/zest.svg' },
  { id: 'granite', label: 'Granite - Borrowing', percentage: 12, color: '#a8e6cf', icon: '/icons/granite.svg' },
  { id: 'other-1', label: 'Other', percentage: 8, color: '#fcd34d' },
  { id: 'other-2', label: 'Other', percentage: 6, color: '#ffb366' },
  { id: 'other-3', label: 'Cash', percentage: 4, color: '#d4d4d8' },
];

export { ProtocolIcon, AssetIcon };
export type { YieldProtocol, YieldPosition };
