'use client';

import { useState } from 'react';

import { BitcoinNetworkModes } from '@leather.io/models';

import { LabeledInput } from './labeled-input';
import { Section } from './section';

export function TransferStxSection({ network }: { network: BitcoinNetworkModes }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  return (
    <Section>
      <LabeledInput
        label="recipient"
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
      />
      <LabeledInput label="amount" value={amount} onChange={e => setAmount(e.target.value)} />
      <button
        className="border-2 border-neutral-500 rounded-md p-2"
        onClick={async () => {
          if (!Number.isNaN(amount) && +amount > 0 && recipient) {
            await window.LeatherProvider.request('stx_transferStx', {
              amount: +amount,
              recipient,
              network,
            });
          }
        }}
      >
        stx_transferStx
      </button>
    </Section>
  );
}
