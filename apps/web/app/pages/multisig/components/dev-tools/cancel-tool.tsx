import { useState } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import type { AuthNetworkId, MultisigTransaction } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';
import { Button } from '@leather.io/ui';

import { TextField } from '../text-field';

const networks: AuthNetworkId[] = [
  'btc:mainnet',
  'btc:testnet',
  'btc:regtest',
  'stx:mainnet',
  'stx:testnet',
];

function modeLabel(network: AuthNetworkId): string {
  if (network.endsWith('mainnet')) return 'main';
  if (network.endsWith('regtest')) return 'regtest';
  return 'test';
}

function networkLabel(network: AuthNetworkId): string {
  const chain = network.startsWith('btc') ? 'BTC' : 'STX';
  return `${chain} ${modeLabel(network)}`;
}

// Cancels a multisig transaction by ID. The backend tears down its signatures,
// clears any txId, and (STX) promotes the next queued transaction.
export function CancelTool() {
  const [network, setNetwork] = useState<AuthNetworkId>('btc:mainnet');
  const [transactionId, setTransactionId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultisigTransaction | null>(null);

  async function run() {
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      setResult(await getMultisigService().cancelTransaction(network, transactionId.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Flex direction="column" gap="space.02">
      <Flex gap="space.01" flexWrap="wrap">
        {networks.map(option => (
          <Button
            key={option}
            variant={network === option ? 'solid' : 'ghost'}
            size="sm"
            onClick={() => setNetwork(option)}
          >
            {networkLabel(option)}
          </Button>
        ))}
      </Flex>
      <TextField
        placeholder="Transaction ID"
        value={transactionId}
        onChange={setTransactionId}
        mono
      />
      <Button
        variant="solid"
        size="sm"
        disabled={!transactionId.trim() || isRunning}
        onClick={() => void run()}
      >
        {isRunning ? 'Cancelling…' : 'Cancel'}
      </Button>
      {result ? (
        <styled.span textStyle="caption.02" color="green.action-primary-default">
          {result.status}
        </styled.span>
      ) : null}
      {error ? (
        <styled.span textStyle="caption.02" color="red.action-primary-default">
          {error}
        </styled.span>
      ) : null}
    </Flex>
  );
}
