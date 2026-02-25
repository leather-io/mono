type BitcoinBalanceCategory = 'available' | 'unavailable' | 'pending' | 'runes';

interface BalanceLineItem {
  label: string;
  fiatValue: string;
  cryptoValue: string;
}

interface BitcoinBalanceSection extends BalanceLineItem {
  category: BitcoinBalanceCategory;
}

interface UtxoItem {
  index: number;
  sats: string;
  fiatValue: string;
}

interface AddressBalance {
  address: string;
  addressType: string;
  fiatValue: string;
  cryptoValue: string;
  utxos: UtxoItem[];
}

interface BitcoinDetailData {
  title: string;
  totalFiatValue: string;
  totalCryptoValue: string;
  addressCount: number;
  addressGroups: AddressBalance[];
}

interface AllBalancesMockData {
  totalFiatBalance: string;
  bitcoin: {
    label: string;
    totalFiatValue: string;
    summary: string;
    sections: BitcoinBalanceSection[];
  };
  stacks: {
    label: string;
    totalFiatValue: string;
    summary: string;
    isLoading: boolean;
    hasNetworkWarning: boolean;
    warningMessage: string;
    sections: BalanceLineItem[];
  };
  bitcoinDetails: Record<BitcoinBalanceCategory, BitcoinDetailData>;
}

const mockUtxos: UtxoItem[] = [
  { index: 1, sats: '400 sats', fiatValue: '$1,000' },
  { index: 2, sats: '400 sats', fiatValue: '$1,000' },
  { index: 3, sats: '400 sats', fiatValue: '$1,000' },
  { index: 4, sats: '400 sats', fiatValue: '$1,000' },
  { index: 5, sats: '400 sats', fiatValue: '$1,000' },
];

const mockNativeSegwitAddress = 'bc1pmzfrwwndsqmk5yh69yjr5lfgfg4ev8c0tsc06e';
const mockTaprootAddress = 'bc1pmzfrwwndsqmk5yh69yjr5lfgfg4ev8c0tsc06e';

function createAddressGroup(addressType: string, address: string): AddressBalance {
  return {
    address,
    addressType,
    fiatValue: '$1,000',
    cryptoValue: '138.85 ABC',
    utxos: mockUtxos,
  };
}

export const mockAllBalancesData: AllBalancesMockData = {
  totalFiatBalance: '$840,000.03',
  bitcoin: {
    label: 'Bitcoin protocol',
    totalFiatValue: '$340,000.00',
    summary: '4 BTC across 8 addresses',
    sections: [
      {
        label: 'Available to transfer',
        fiatValue: '$300,000',
        cryptoValue: '138.85 BTC',
        category: 'available',
      },
      {
        label: 'Unavailable to transfer',
        fiatValue: '$20,000',
        cryptoValue: '138.85 BTC',
        category: 'unavailable',
      },
      {
        label: 'Pending',
        fiatValue: '$15,000',
        cryptoValue: '138.85 BTC',
        category: 'pending',
      },
      {
        label: 'Runes',
        fiatValue: '$5,000',
        cryptoValue: '138.85 BTC',
        category: 'runes',
      },
    ],
  },
  stacks: {
    label: 'Stacks protocol',
    totalFiatValue: '$500,000.00',
    summary: '50,000.00 STX',
    isLoading: true,
    hasNetworkWarning: true,
    warningMessage: 'Network issues might be affecting your balance',
    sections: [
      { label: 'STX available to transfer', fiatValue: '$1,000', cryptoValue: '138.85 ABC' },
      { label: 'STX locked', fiatValue: '$1,000', cryptoValue: '138.85 ABC' },
      { label: 'STX Pending', fiatValue: '$1,000', cryptoValue: '138.85 ABC' },
      { label: 'SIP 10', fiatValue: '$1,000', cryptoValue: '138.85 ABC' },
      { label: 'sBTC available to transfer', fiatValue: '$1,000', cryptoValue: '138.85 ABC' },
      { label: 'sBTC locked', fiatValue: '$1,000', cryptoValue: '138.85 ABC' },
      { label: 'sBTC Pending', fiatValue: '$1,000', cryptoValue: '138.85 ABC' },
    ],
  },
  bitcoinDetails: {
    available: {
      title: 'Available to transfer',
      totalFiatValue: '$300,000.00',
      totalCryptoValue: '2 BTC',
      addressCount: 4,
      addressGroups: [
        createAddressGroup('Native Segwit', mockNativeSegwitAddress),
        createAddressGroup('Taproot', mockTaprootAddress),
        createAddressGroup('Native Segwit', mockNativeSegwitAddress),
      ],
    },
    unavailable: {
      title: 'Unavailable to transfer',
      totalFiatValue: '$20,000.00',
      totalCryptoValue: '2 BTC',
      addressCount: 2,
      addressGroups: [
        createAddressGroup('Taproot', mockTaprootAddress),
        createAddressGroup('Taproot', mockTaprootAddress),
      ],
    },
    pending: {
      title: 'Pending',
      totalFiatValue: '$15,000.00',
      totalCryptoValue: '0.2 BTC',
      addressCount: 1,
      addressGroups: [createAddressGroup('Native Segwit', mockNativeSegwitAddress)],
    },
    runes: {
      title: 'BTC in Runes',
      totalFiatValue: '$5,000.00',
      totalCryptoValue: '0.002 BTC',
      addressCount: 4,
      addressGroups: [createAddressGroup('Native Segwit', mockNativeSegwitAddress)],
    },
  },
};

export type {
  AllBalancesMockData,
  BitcoinBalanceCategory,
  BitcoinBalanceSection,
  BitcoinDetailData,
  BalanceLineItem,
  UtxoItem,
  AddressBalance,
};
