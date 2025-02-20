'use client';

import { useState } from 'react';

import { bytesToHex } from '@noble/hashes/utils';
import { useQuery } from '@tanstack/react-query';

import { getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';
import { BitcoinNetworkModes } from '@leather.io/models';
import { Address } from '@leather.io/rpc';
import { createMoney } from '@leather.io/utils';

import { generateBtcTx } from '../utils/bitcoin-transaction';
import { LabeledInput } from './labeled-input';
import { Section } from './section';

export function SignPsbtSection({
  addresses,
  network,
}: {
  addresses: Address[];
  network: BitcoinNetworkModes;
}) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [feeRate, setFeeRate] = useState('5');
  const nativeSegwit = addresses.find(addr => addr.type === 'p2wpkh');

  const { data: utxos } = useQuery({
    queryKey: ['fetch-utxos', nativeSegwit?.address],
    queryFn: async () => {
      const response = await fetch(
        `https://mempool.space/api/address/${nativeSegwit?.address}/utxo`
      );
      const result = await response.json();
      return result.map((utxo: { txid: string; value: number; vout: number }) => ({
        address: nativeSegwit?.address,
        txid: utxo.txid,
        value: utxo.value,
        vout: utxo.vout,
      }));
    },
  });
  return (
    <Section>
      <LabeledInput
        label="recipient"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
      />
      <LabeledInput label="amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <LabeledInput label="feeRate" value={feeRate} onChange={e => setFeeRate(e.target.value)} />

      <button
        className="border-2 border-neutral-500 rounded-md p-2"
        onClick={async () => {
          if (
            !Number.isNaN(amount) &&
            +amount > 0 &&
            recipient &&
            !Number.isNaN(feeRate) &&
            +feeRate > 0
          ) {
            const networkConfig = getBtcSignerLibNetworkConfigByMode(network);
            const tx = generateBtcTx({
              feeRate: +feeRate,
              isSendingMax: false,
              network: networkConfig,
              payerAddress: nativeSegwit?.address ?? '',
              payerPublicKey: nativeSegwit?.publicKey ?? '',
              recipients: [
                {
                  address: recipient,
                  amount: createMoney(+amount, 'BTC'),
                },
              ],
              utxos,
            });
            const psbtHex = bytesToHex(tx.psbt);
            await window.LeatherProvider.request('signPsbt', {
              broadcast: true,
              hex: psbtHex,
              network: 'mainnet',
            });
          }
        }}
      >
        signPsbt
      </button>
    </Section>
  );
}
