import { deriveAddressesFromDescriptor } from '@leather.io/bitcoin';

import { bitcoinDescriptorRank } from './account-funding';

export const externalBitcoinAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

const fundingHeight = 870000;
const fundingTime = 1730000000;

const nativeSegwitReceiveTxid = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';
const nativeSegwitSendTxid = 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3';
const taprootReceiveTxid = 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4';
const externalParentTxid = 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5';

const nativeSegwitBalanceSats = 600000;
const nativeSegwitSatsPerRank = 100000;
const nativeSegwitSentSats = 199000;
const nativeSegwitSendFeeSats = 1000;
const taprootBalanceSats = 400000;

function nativeSegwitBalanceOf(descriptor: string) {
  return nativeSegwitBalanceSats + bitcoinDescriptorRank(descriptor) * nativeSegwitSatsPerRank;
}

export interface LeatherUtxo {
  txid: string;
  vout: number;
  value: string;
  height?: number;
  address: string;
  path: string;
}

interface LeatherTxIo {
  n: number;
  txid?: string;
  owned?: boolean;
  address?: string;
  path?: string;
  value: string;
}

export interface LeatherBitcoinTx {
  txid: string;
  height?: number;
  time?: number;
  vin: LeatherTxIo[];
  vout: LeatherTxIo[];
}

interface OwnedAddress {
  address: string;
  path: string;
}

export function readDescriptorOwnedAddress(descriptor: string): OwnedAddress | null {
  try {
    const network = descriptor.includes('tpub') ? 'testnet' : 'mainnet';
    const [receive] = deriveAddressesFromDescriptor({ accountDescriptor: descriptor, network });
    return receive ?? null;
  } catch {
    return null;
  }
}

function isTaprootDescriptor(descriptor: string) {
  return descriptor.startsWith('tr(');
}

export function fundedDescriptorUtxos(descriptor: string): LeatherUtxo[] {
  const owned = readDescriptorOwnedAddress(descriptor);
  if (!owned) return [];
  if (isTaprootDescriptor(descriptor)) {
    return [
      {
        txid: taprootReceiveTxid,
        vout: 0,
        value: String(taprootBalanceSats),
        height: fundingHeight,
        ...owned,
      },
    ];
  }
  return [
    {
      txid: nativeSegwitSendTxid,
      vout: 1,
      value: String(nativeSegwitBalanceOf(descriptor)),
      height: fundingHeight + 10,
      ...owned,
    },
  ];
}

export function fundedDescriptorTransactions(descriptor: string): LeatherBitcoinTx[] {
  const owned = readDescriptorOwnedAddress(descriptor);
  if (!owned) return [];
  if (isTaprootDescriptor(descriptor)) {
    return [
      {
        txid: taprootReceiveTxid,
        height: fundingHeight,
        time: fundingTime,
        vin: [
          {
            n: 0,
            txid: externalParentTxid,
            owned: false,
            address: externalBitcoinAddress,
            value: '401000',
          },
        ],
        vout: [{ n: 0, owned: true, ...owned, value: String(taprootBalanceSats) }],
      },
    ];
  }
  const balance = nativeSegwitBalanceOf(descriptor);
  const received = String(balance + nativeSegwitSentSats + nativeSegwitSendFeeSats);
  return [
    {
      txid: nativeSegwitSendTxid,
      height: fundingHeight + 10,
      time: fundingTime + 6000,
      vin: [{ n: 0, txid: nativeSegwitReceiveTxid, owned: true, ...owned, value: received }],
      vout: [
        {
          n: 0,
          owned: false,
          address: externalBitcoinAddress,
          value: String(nativeSegwitSentSats),
        },
        { n: 1, owned: true, ...owned, value: String(balance) },
      ],
    },
    {
      txid: nativeSegwitReceiveTxid,
      height: fundingHeight - 10,
      time: fundingTime - 6000,
      vin: [
        {
          n: 1,
          txid: externalParentTxid,
          owned: false,
          address: externalBitcoinAddress,
          value: String(Number(received) + nativeSegwitSendFeeSats),
        },
      ],
      vout: [{ n: 0, owned: true, ...owned, value: received }],
    },
  ];
}

export function transactionsPage(txs: LeatherBitcoinTx[]) {
  return {
    meta: { page: 1, pageSize: 750, totalPages: 1, totalItems: txs.length },
    data: txs,
  };
}
