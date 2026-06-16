import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useToast } from '~/features/toasts/use-toast';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { TextField } from '../components/text-field';
import type { MultisigAccount, Proposer, Vault } from '../data/multisig-types';
import { useMultisigActions } from '../store/use-multisig';

interface SendModalProps {
  vault: Vault;
  account: MultisigAccount;
  isShowing: boolean;
  onClose(): void;
}

export function SendModal({ vault, account, isShowing, onClose }: SendModalProps) {
  const { proposeTransaction } = useMultisigActions();
  const { success: showToast } = useToast();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const myProposers = account.proposers.filter(p => p.userId === 'me');
  const [proposer, setProposer] = useState<Proposer | null>(myProposers[0] ?? null);
  const showPicker = myProposers.length >= 2;

  const symbol = vault.chain === 'btc' ? 'BTC' : 'STX';
  const canSubmit = recipient.trim() !== '' && amount.trim() !== '';

  function submit() {
    if (!canSubmit) return;
    proposeTransaction({
      vaultId: vault.id,
      accountId: account.id,
      recipient: recipient.trim(),
      amount: amount.trim(),
    });
    showToast('Transaction proposed');
    onClose();
  }

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      header={<SheetHeader title={`Send from ${account.name}`} />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" disabled={!canSubmit} onClick={submit}>
            Propose transaction
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.05" px="space.05" pb="space.05">
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Proposing a transaction notifies all {vault.members.length} members. They'll need to sign
          for it to broadcast.
        </styled.p>

        <TextField
          label="Recipient"
          placeholder={vault.chain === 'btc' ? 'bc1q… address' : 'SP… or BNS'}
          value={recipient}
          onChange={setRecipient}
          mono
        />

        <TextField
          label={`Amount (${symbol})`}
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          help={`Available: ${account.balanceSub}`}
        />

        {showPicker && (
          <Box>
            <styled.div textStyle="label.03" color="ink.text-subdued" mb="space.02">
              Propose as
            </styled.div>
            <Flex direction="column" gap="space.02">
              {myProposers.map(p => {
                const selected =
                  proposer?.fingerprint === p.fingerprint &&
                  proposer?.accountIndex === p.accountIndex;
                return (
                  <styled.button
                    key={`${p.fingerprint}-${p.accountIndex}`}
                    type="button"
                    onClick={() => setProposer(p)}
                    aria-pressed={selected}
                    textAlign="left"
                    cursor="pointer"
                    p="space.03"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor={selected ? 'ink.action-primary-default' : 'ink.border-default'}
                    bg="transparent"
                  >
                    <styled.div textStyle="label.02">{p.account}</styled.div>
                    <styled.div textStyle="caption.01" color="ink.text-subdued">
                      {p.wallet} · {p.fingerprint}
                    </styled.div>
                  </styled.button>
                );
              })}
            </Flex>
          </Box>
        )}

        <Box
          p="space.04"
          borderRadius="md"
          bg="ink.background-secondary"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-default"
        >
          <Flex justifyContent="space-between" textStyle="caption.01">
            <styled.span color="ink.text-subdued">Network fee</styled.span>
            <styled.span>{vault.chain === 'btc' ? '~0.00023 BTC' : '~0.0125 STX'}</styled.span>
          </Flex>
          <Flex justifyContent="space-between" textStyle="caption.01" mt="space.02">
            <styled.span color="ink.text-subdued">Threshold</styled.span>
            <styled.span>
              {account.threshold[0]} of {account.threshold[1]} signers required
            </styled.span>
          </Flex>
        </Box>
      </Flex>
    </Sheet>
  );
}
