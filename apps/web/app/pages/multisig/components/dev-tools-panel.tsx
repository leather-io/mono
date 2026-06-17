import { type ReactNode, useState } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { useProposeTransaction } from '~/features/multisig/transactions/use-propose-transaction';
import { useToast } from '~/features/toasts/use-toast';

import { Button, Popover, SettingsSliderIcon } from '@leather.io/ui';

import { useMultisigActions } from '../store/use-multisig';
import { TextField } from './text-field';

const mockBtcPsbt = 'cHNidP8BAAoCAAAAAAAAAAAAAA==';
const mockStxRawTx =
  '00000000010401cd350f8985f1d1574fc35d9f20dd5c949c13dab7000000000000000000000000000003e8000000000002030200000000000516000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000000000';

type ProposeChain = 'btc' | 'stx';

function ToolRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Flex direction="column" gap="space.02">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {label}
      </styled.span>
      <Flex alignItems="center" gap="space.01">
        {children}
      </Flex>
    </Flex>
  );
}

// Multisig Tx proposal tool.
// Accepts a vault-account address the signed-in user is a signer of. Builds the
// proposal-commitment signature via the wallet and POSTs to /v1/multisig-ext/propose.
function ProposeLiveTool() {
  const [chain, setChain] = useState<ProposeChain>('btc');
  const [address, setAddress] = useState('');
  const btcPropose = useProposeTransaction('btc:mainnet');
  const stxPropose = useProposeTransaction('stx:mainnet');
  const { success, error } = useToast();

  const propose = chain === 'btc' ? btcPropose : stxPropose;
  const rawPayload = chain === 'btc' ? mockBtcPsbt : mockStxRawTx;

  function submit() {
    const multisigAddress = address.trim();
    if (!multisigAddress) {
      error('Enter a multisig address');
      return;
    }
    propose.mutate(
      { multisigAddress, rawPayload },
      {
        onSuccess(tx) {
          success(`Proposed ${tx.id}`);
        },
        onError(err) {
          error(err.message);
        },
      }
    );
  }

  return (
    <Flex direction="column" gap="space.02">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        Propose live tx
      </styled.span>
      <Flex gap="space.01">
        <Button
          variant={chain === 'btc' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => setChain('btc')}
        >
          BTC
        </Button>
        <Button
          variant={chain === 'stx' ? 'solid' : 'ghost'}
          size="sm"
          onClick={() => setChain('stx')}
        >
          STX
        </Button>
      </Flex>
      <TextField
        placeholder={chain === 'btc' ? 'bc1q… multisig address' : 'SM… multisig address'}
        value={address}
        onChange={setAddress}
        mono
      />
      <Button variant="solid" size="sm" disabled={propose.isPending} onClick={submit}>
        {propose.isPending ? 'Proposing…' : `Propose mock ${chain.toUpperCase()} tx`}
      </Button>
    </Flex>
  );
}

export function DevToolsPanel() {
  const { resetSession } = useMultisigActions();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <styled.button
          type="button"
          aria-label="Open dev tools"
          position="fixed"
          bottom="space.05"
          right="space.05"
          zIndex={90}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="44px"
          height="44px"
          borderRadius="round"
          bg="ink.text-primary"
          color="ink.background-primary"
          boxShadow="elevationLight"
          cursor="pointer"
          transition="transform 160ms ease"
          _hover={{ transform: 'scale(1.05)' }}
          _active={{ transform: 'scale(0.97)' }}
        >
          <SettingsSliderIcon color="ink.background-primary" />
        </styled.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="end" aria-label="Dev tools">
          <Flex direction="column" gap="space.04" minWidth="260px">
            <styled.span textStyle="label.02">Dev tools</styled.span>
            <ToolRow label="Preview data">
              <Button variant="ghost" size="sm" onClick={() => resetSession('seed')}>
                Populated
              </Button>
              <Button variant="ghost" size="sm" onClick={() => resetSession('empty')}>
                Empty
              </Button>
            </ToolRow>
            <ProposeLiveTool />
          </Flex>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
