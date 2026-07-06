import { useState } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { signBtcTransaction } from '~/features/multisig/transactions/signing/sign-btc-transaction';
import { signStxTransaction } from '~/features/multisig/transactions/signing/sign-stx-transaction';

import type { AuthNetworkId, MultisigTransaction, VaultAccount } from '@leather.io/models';
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

function assertSignable(transaction: MultisigTransaction): void {
  if (transaction.status !== 'pending')
    throw new Error(
      `Transaction is ${transaction.status}; only pending transactions can be signed`
    );
}

function getMySigningPubkey(account: VaultAccount, myAddress: string | undefined): string {
  const mySigner = account.signers.find(signer => signer.address === myAddress);
  if (!mySigner) throw new Error('Connected account is not a signer on this vault account');
  return mySigner.signingPubkey;
}

// Fetches a proposed multisig transaction by ID, signs it with the extension, and
// submits the signature(s) to the backend. The signing ceremony lives in the
// reusable `signing/` functions; this dev tool is just orchestration + UI.
export function SignTool() {
  const [network, setNetwork] = useState<AuthNetworkId>('btc:mainnet');
  const [transactionId, setTransactionId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultisigTransaction | null>(null);
  const myAddress = useSession(network)?.identity.address;

  async function run() {
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      const id = transactionId.trim();
      const service = getMultisigService();
      const transaction = await service.getTransaction(network, id);
      assertSignable(transaction);
      const account = await service.getVaultAccount(network, transaction.vaultAccountId);
      const signatures = network.startsWith('btc')
        ? await signBtcTransaction(transaction, account, getMySigningPubkey(account, myAddress))
        : await signStxTransaction(transaction, account);
      setResult(await service.addTransactionSignatures(network, id, { signatures }));
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
        {isRunning ? 'Signing…' : 'Sign & submit'}
      </Button>
      {result ? (
        <styled.span textStyle="caption.02" color="green.action-primary-default">
          {result.status} · {result.id}
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
