import { Box, styled } from 'leather-styles/jsx';

import type { MultisigTransaction, Vault, VaultAccount } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { CopyAddress } from '../../components/copy-address';
import { VaultListItem } from '../../components/vault-list-item';

interface SignerRollcallProps {
  vault: Vault;
  account: VaultAccount;
  transaction: MultisigTransaction;
  currentUserId?: string;
}

// Read-only list of the account's signers and who has signed this transaction.
// Sign / Broadcast / Cancel actions are layered on by the signing flow.
export function SignerRollcall({
  vault,
  account,
  transaction,
  currentUserId,
}: SignerRollcallProps) {
  const signers = [...account.signers].sort((a, b) => a.signerIndex - b.signerIndex);
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
        const isMe = signer.userId === currentUserId;
        const name = isMe ? 'Me' : member?.name || truncateMiddle(signer.address);
        const signed = transaction.signatures.some(sig => sig.signerIndex === signer.signerIndex);
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
                <styled.span
                  textStyle="caption.01"
                  color={signed ? 'green.action-primary-default' : 'ink.text-subdued'}
                >
                  {signed ? 'Signed' : 'Not signed yet'}
                </styled.span>
              }
            />
          </Box>
        );
      })}
    </Box>
  );
}
