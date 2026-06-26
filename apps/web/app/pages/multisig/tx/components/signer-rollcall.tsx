import { Box, Flex, styled } from 'leather-styles/jsx';

import type { MultisigTransaction, Vault, VaultAccount } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { CopyAddress } from '../../components/copy-address';
import { VaultListItem } from '../../components/vault-list-item';

const cancellableStatuses = ['queued', 'pending', 'signed'];

interface SignerRollcallProps {
  vault: Vault;
  account: VaultAccount;
  transaction: MultisigTransaction;
  currentUserAddress?: string;
  isSigning: boolean;
  isCancelling: boolean;
  isBroadcasting: boolean;
  onSign(): void;
  onCancel(): void;
  onBroadcast(): void;
}

// Signer list with the sign / cancel / broadcast controls for a proposed
// transaction. Sign shows on the current user's row while collecting; cancel and
// broadcast sit in the footer, broadcast enabling once the threshold is met.
export function SignerRollcall({
  vault,
  account,
  transaction,
  currentUserAddress,
  isSigning,
  isCancelling,
  isBroadcasting,
  onSign,
  onCancel,
  onBroadcast,
}: SignerRollcallProps) {
  const signers = [...account.signers].sort((a, b) => a.signerIndex - b.signerIndex);
  const canCancel = cancellableStatuses.includes(transaction.status);
  const thresholdMet = transaction.signatures.length >= account.threshold;
  const busy = isSigning || isCancelling || isBroadcasting;

  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      {signers.map((signer, index) => {
        const member = vault.members.find(m => m.user?.id === signer.userId);
        const isMe = signer.address === currentUserAddress;
        const name = isMe ? 'Me' : member?.name || truncateMiddle(signer.address);
        const signed = transaction.signatures.some(sig => sig.signerIndex === signer.signerIndex);
        const canSign = isMe && transaction.status === 'pending' && !signed;
        return (
          <Box
            key={signer.id}
            p="space.04"
            borderTopWidth={index === 0 ? '0' : '1px'}
            borderTopStyle="solid"
            borderTopColor="ink.border-default"
          >
            <VaultListItem
              tightLeading
              leading={<AvatarCircle name={name} size="lg" />}
              title={
                <styled.span pl="space.02" textStyle="label.02">
                  {`${name}${isMe ? ' (me)' : ''}`}
                </styled.span>
              }
              caption={<CopyAddress addr={signer.address} />}
              trailingTitle={
                canSign ? (
                  <Button variant="solid" size="sm" disabled={busy} onClick={onSign}>
                    {isSigning ? 'Signing…' : 'Sign'}
                  </Button>
                ) : (
                  <styled.span
                    textStyle="caption.01"
                    color={signed ? 'green.action-primary-default' : 'ink.text-subdued'}
                  >
                    {signed ? 'Signed' : 'Not signed yet'}
                  </styled.span>
                )
              }
            />
          </Box>
        );
      })}

      {canCancel && (
        <Flex
          gap="space.03"
          justifyContent="flex-end"
          flexWrap="wrap"
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <Button variant="ghost" intent="danger" disabled={busy} onClick={onCancel}>
            {isCancelling ? 'Cancelling…' : 'Cancel transaction'}
          </Button>
          <Button variant="solid" disabled={busy || !thresholdMet} onClick={onBroadcast}>
            {isBroadcasting ? 'Broadcasting…' : 'Broadcast transaction'}
          </Button>
        </Flex>
      )}
    </Box>
  );
}
