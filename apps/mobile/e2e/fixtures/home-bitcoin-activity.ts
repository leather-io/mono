import {
  type LeatherBitcoinTx,
  externalBitcoinAddress,
  readDescriptorOwnedAddress,
} from './bitcoin';

const otherExternalAddress = 'bc1q9d4ywgfnd8h43da5tpcxcn6ajv590cg6d3tg6a';
const blockHeight = 812000;
const blockTime = 1696420800;

const taprootSendTxid = 'e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2';
const taprootReceiveTxid = 'e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3';
const mixedSendTxid = 'e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4';
const unownedTxid = 'e4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5';

function isTaproot(descriptor: string) {
  return descriptor.startsWith('tr(');
}

function taprootOnly(build: (descriptor: string) => LeatherBitcoinTx | null) {
  return (descriptor: string) => {
    if (!isTaproot(descriptor)) return [];
    const tx = build(descriptor);
    return tx ? [tx] : [];
  };
}

export const taprootOnlySendTransactions = taprootOnly(descriptor => {
  const owned = readDescriptorOwnedAddress(descriptor);
  if (!owned) return null;
  return {
    txid: taprootSendTxid,
    height: blockHeight,
    time: blockTime,
    vin: [{ n: 0, owned: true, ...owned, value: '200000' }],
    vout: [{ n: 0, owned: false, address: externalBitcoinAddress, value: '198000' }],
  };
});

export const taprootOnlyReceiveTransactions = taprootOnly(descriptor => {
  const owned = readDescriptorOwnedAddress(descriptor);
  if (!owned) return null;
  return {
    txid: taprootReceiveTxid,
    height: blockHeight,
    time: blockTime,
    vin: [{ n: 0, owned: false, address: externalBitcoinAddress, value: '151000' }],
    vout: [{ n: 0, owned: true, ...owned, value: '150000' }],
  };
});

export const mixedInputSendTransactions = taprootOnly(descriptor => {
  const owned = readDescriptorOwnedAddress(descriptor);
  if (!owned) return null;
  return {
    txid: mixedSendTxid,
    height: blockHeight,
    time: blockTime,
    vin: [
      { n: 0, owned: true, ...owned, value: '250000' },
      { n: 1, owned: true, value: '152000' },
    ],
    vout: [
      { n: 0, owned: false, address: externalBitcoinAddress, value: '300000' },
      { n: 1, owned: true, value: '100000' },
    ],
  };
});

export function unownedTransactions(): LeatherBitcoinTx[] {
  return [
    {
      txid: unownedTxid,
      height: blockHeight,
      time: blockTime,
      vin: [{ n: 0, owned: false, address: externalBitcoinAddress, value: '90000' }],
      vout: [{ n: 0, owned: false, address: otherExternalAddress, value: '89000' }],
    },
  ];
}
