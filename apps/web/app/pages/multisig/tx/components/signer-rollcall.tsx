import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { AddressText } from '../../components/address-text';
import { AvatarCircle } from '../../components/avatar-circle';
import { VaultListItem } from '../../components/vault-list-item';
import type { MultisigTransaction, Vault } from '../../data/multisig-types';

interface SignerRollcallProps {
  vault: Vault;
  tx: MultisigTransaction;
  verifying: boolean;
  onSign(): void;
  onCancel(): void;
  onBroadcast(): void;
}

export function SignerRollcall({
  vault,
  tx,
  verifying,
  onSign,
  onCancel,
  onBroadcast,
}: SignerRollcallProps) {
  const canCancel = tx.status === 'queued' || tx.status === 'pending' || tx.status === 'signed';
  const canBroadcast = tx.status === 'signed';
  const collecting = tx.status === 'pending' || tx.status === 'queued';

  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      {vault.members.map((member, index) => {
        const signed = tx.signed.includes(member.name);
        const isMe = member.isCreator || member.name === 'Me';
        const showSign = !signed && isMe && collecting;
        return (
          <Box
            key={member.addr}
            p="space.04"
            borderTopWidth={index === 0 ? '0' : '1px'}
            borderTopStyle="solid"
            borderTopColor="ink.border-default"
          >
            <VaultListItem
              leading={<AvatarCircle name={member.name} size="lg" />}
              title={`${member.name}${isMe ? ' (me)' : ''}`}
              caption={<AddressText addr={member.addr} />}
              trailingTitle={
                showSign ? (
                  <Button variant="solid" disabled={verifying} onClick={onSign}>
                    {verifying ? 'Verifying…' : 'Sign'}
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

      {verifying && (
        <Box
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <styled.div textStyle="label.03">Verifying transaction…</styled.div>
          <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
            Re-deriving the multisig script and checking signer order.
          </styled.div>
        </Box>
      )}

      {canCancel && (
        <Flex
          gap="space.03"
          justifyContent="flex-end"
          p="space.04"
          borderTopWidth="1px"
          borderTopStyle="solid"
          borderTopColor="ink.border-default"
        >
          <Button variant="ghost" intent="danger" onClick={onCancel}>
            Cancel transaction
          </Button>
          <Button variant="solid" disabled={!canBroadcast} onClick={onBroadcast}>
            Broadcast transaction
          </Button>
        </Flex>
      )}
    </Box>
  );
}
