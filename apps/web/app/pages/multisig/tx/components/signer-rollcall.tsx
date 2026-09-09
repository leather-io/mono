import { Box, Flex, styled } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';
import { SignIcon } from '~/components/icons/sign-icon';

import type { MultisigTransaction, Vault, VaultAccount } from '@leather.io/models';
import { Button, ListItemBox, Spinner } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { formatDateTime } from '../relative-time';

const cancellableStatuses = ['queued', 'pending', 'signed'];

interface SignerRollcallProps {
  vault: Vault;
  account: VaultAccount;
  transaction: MultisigTransaction;
  currentUserAddress?: string;
  currentUserId?: string;
  isSigning: boolean;
  isCancelling: boolean;
  isBroadcasting: boolean;
  onSign(): void;
  onCancel(): void;
  onBroadcast(): void;
}

function SignerStatus({
  canSign,
  signed,
  signedAt,
  busy,
  onSign,
}: {
  canSign: boolean;
  signed: boolean;
  signedAt?: string;
  busy: boolean;
  onSign(): void;
}) {
  if (canSign) {
    return (
      <Button variant="solid" size="sm" disabled={busy} onClick={onSign} iconStart={<SignIcon />}>
        Sign
      </Button>
    );
  }
  if (signed) {
    return (
      <styled.span textStyle="caption.01" color="green.action-primary-default">
        {signedAt ? `Signed ${formatDateTime(new Date(signedAt))}` : 'Signed'}
      </styled.span>
    );
  }
  return (
    <styled.span textStyle="caption.01" color="ink.text-subdued">
      Not signed yet
    </styled.span>
  );
}

// Signer list with the sign / cancel / broadcast controls for a proposed
// transaction. Sign shows on the current user's row while collecting; cancel and
// broadcast sit in the footer, broadcast enabling once the threshold is met.
export function SignerRollcall({
  vault,
  account,
  transaction,
  currentUserAddress,
  currentUserId,
  isSigning,
  isCancelling,
  isBroadcasting,
  onSign,
  onCancel,
  onBroadcast,
}: SignerRollcallProps) {
  const signers = [...account.signers].sort((a, b) => a.signerIndex - b.signerIndex);
  const showActions = cancellableStatuses.includes(transaction.status);
  const canCancel =
    showActions &&
    (transaction.status !== 'signed' ||
      transaction.proposerUserId === currentUserId ||
      vault.createdBy === currentUserId);
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
      {transaction.status === 'queued' && (
        <Box
          p="space.04"
          bg="blue.background-primary"
          borderBottomWidth="1px"
          borderBottomStyle="solid"
          borderBottomColor="ink.border-transparent"
        >
          <styled.div textStyle="label.02" color="blue.text-primary">
            Queued behind an active transaction
          </styled.div>
          <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
            You can sign this once this account&rsquo;s active transaction is broadcast or
            cancelled.
          </styled.div>
        </Box>
      )}
      {signers.map(signer => {
        const member = vault.members.find(m => m.user?.id === signer.userId);
        const isMe = signer.address === currentUserAddress;
        const name = isMe ? 'Me' : member?.name || truncateMiddle(signer.address);
        const signature = transaction.signatures.find(
          sig => sig.signerIndex === signer.signerIndex
        );
        const signed = signature !== undefined;
        const canSign = isMe && transaction.status === 'pending' && !signed;
        return (
          <Box key={signer.id} p="space.04">
            <ListItemBox
              variant="plain"
              density="compact"
              leading={<AvatarCircle name={name} size="md" />}
              title={`${name}${isMe ? ' (me)' : ''}`}
              caption={<CopyAddress addr={signer.address} wide />}
              trailing={
                // Fixed-width lane sized to the longest status ("Signed <date>")
                // so every row's trailing column lines up and the adaptive
                // addresses truncate at one even edge.
                <Flex width="128px" flexShrink={0} justifyContent="flex-end" textAlign="right">
                  <SignerStatus
                    canSign={canSign}
                    signed={signed}
                    signedAt={signature?.createdAt}
                    busy={busy}
                    onSign={onSign}
                  />
                </Flex>
              }
            />
          </Box>
        );
      })}

      {isSigning && (
        <Flex
          gap="space.03"
          alignItems="flex-start"
          p="space.04"
          bg="blue.background-primary"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="blue.border"
        >
          <Box pt="space.01">
            <Spinner size="16px" color="blue.action-primary-default" borderRadius="round" />
          </Box>
          <Box>
            <styled.div textStyle="label.02" color="blue.text-primary">
              Verifying transaction…
            </styled.div>
            <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
              Re-deriving the multisig script and checking signer order. The wallet popup will open
              once this completes.
            </styled.div>
          </Box>
        </Flex>
      )}

      {showActions && (
        <Flex
          gap="space.03"
          justifyContent="flex-end"
          flexWrap="wrap"
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-transparent"
        >
          {canCancel && (
            <Button variant="ghost" intent="danger" size="sm" disabled={busy} onClick={onCancel}>
              {isCancelling ? 'Cancelling…' : 'Cancel transaction'}
            </Button>
          )}
          <Button variant="solid" size="sm" disabled={busy || !thresholdMet} onClick={onBroadcast}>
            {isBroadcasting ? 'Broadcasting…' : 'Broadcast transaction'}
          </Button>
        </Flex>
      )}
    </Box>
  );
}
