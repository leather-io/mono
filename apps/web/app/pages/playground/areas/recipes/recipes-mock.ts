// Mock values for the recipe demos. Pre-formatted strings: the recipes take
// display values; product code formats Money with Balance + formatCurrency.
export const recipesMock = {
  account: {
    name: 'Account 1',
    address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    balance: '$4,212.80',
  },
  recipient: {
    name: 'Alex Huth',
    address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
  },
  newAddress: 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq',
  // A list long enough to scroll under a pinned field.
  contacts: [
    { name: 'Alex Huth', address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE' },
    { name: 'Sofia Reyes', address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7' },
    { name: 'Kraken deposit', address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9' },
    { name: 'Mum', address: 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB' },
    { name: 'Cold storage', address: 'SP2MV4BKM4TQ8NHSQ4YP1RFDA3GXK0VBF3E8BAH8' },
    { name: 'Rent', address: 'SPS8CKF63P16J28AYF7PXW9E5AACH0NZNTEFWSFE' },
    { name: 'Exchange', address: 'SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE' },
  ],
  assets: [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', balance: '0.04210000 BTC', fiat: '$2,736.50' },
    { id: 'stx', name: 'Stacks', symbol: 'STX', balance: '1,204.50 STX', fiat: '$903.38' },
    { id: 'sbtc', name: 'sBTC', symbol: 'sBTC', balance: '0.01500000 sBTC', fiat: '$975.00' },
    { id: 'usdcx', name: 'USDCx', symbol: 'USDCx', balance: '120.00 USDCx', fiat: '$120.00' },
  ],
  send: {
    amount: '0.00500000',
    symbol: 'sBTC',
    fiat: '~ $325.00',
    fee: '0.00002000 sBTC',
    feeFiat: '$1.30',
    total: '0.00502000 sBTC',
    totalFiat: '$326.30',
    time: '~10 min',
    available: '0.01500000 sBTC',
  },
} as const;
