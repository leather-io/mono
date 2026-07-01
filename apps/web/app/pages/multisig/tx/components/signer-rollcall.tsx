import { Box, Flex, styled } from 'leather-styles/jsx';
import { SignIcon } from '~/components/icons/sign-icon';

import type { MultisigTransaction, Vault, VaultAccount } from '@leather.io/models';
import { Button, CheckmarkCircleIcon, ListItemBox, Spinner } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { Badge } from '../../components/badge';
import { CopyAddress } from '../../components/copy-address';

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

function SignerStatus({
  canSign,
  signed,
  busy,
  onSign,
}: {
  canSign: boolean;
  signed: boolean;
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
      <Badge
        variant="success"
        icon={
          <CheckmarkCircleIcon
            variant="small"
            width={16}
            height={16}
            color="green.action-primary-default"
          />
        }
        label="Signed"
      />
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
            <ListItemBox
              variant="plain"
              density="compact"
              leading={<AvatarCircle name={name} size="md" />}
              title={
                <styled.span textStyle="label.03">{`${name}${isMe ? ' (me)' : ''}`}</styled.span>
              }
              caption={<CopyAddress addr={signer.address} />}
              trailing={
                <SignerStatus canSign={canSign} signed={signed} busy={busy} onSign={onSign} />
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
            <Spinner size="14px" color="blue.action-primary-default" />
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
          <Button variant="ghost" intent="danger" size="sm" disabled={busy} onClick={onCancel}>
            {isCancelling ? 'Cancelling…' : 'Cancel transaction'}
          </Button>
          <Button variant="solid" size="sm" disabled={busy || !thresholdMet} onClick={onBroadcast}>
            {isBroadcasting ? 'Broadcasting…' : 'Broadcast transaction'}
          </Button>
        </Flex>
      )}
    </Box>
  );
}
