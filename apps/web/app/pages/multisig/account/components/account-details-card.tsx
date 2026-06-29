import type { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Vault, VaultAccount } from '@leather.io/models';
import { Button, PlusIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { AvatarSq } from '../../components/avatar-sq';
import { CopyAddress } from '../../components/copy-address';
import { VaultListItem } from '../../components/vault-list-item';
import { vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface AccountDetailsCardProps {
  vault: Vault;
  account: VaultAccount;
  currentUserAddress?: string;
  onAddToWallet(): void;
  isAddingToWallet?: boolean;
}

function CardRow({ children }: { children: ReactNode }) {
  return (
    <Box
      p="space.04"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-default"
    >
      {children}
    </Box>
  );
}

export function AccountDetailsCard({
  vault,
  account,
  currentUserAddress,
  onAddToWallet,
  isAddingToWallet,
}: AccountDetailsCardProps) {
  const theme = vaultThemeFromName(vault.theme);
  const chain = chainFromNetwork(vault.network);
  const chainLabel = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const signerCount = account.signers.length;

  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Box p="space.04">
        <VaultListItem
          tightLeading
          leading={
            <AvatarSq
              chain={chain}
              icon={account.icon ?? 'piggybank'}
              themeId={theme.id}
              size="md"
            />
          }
          title={account.name}
          caption={`${chainLabel} Vault Account`}
        />
      </Box>

      <CardRow>
        <styled.div textStyle="label.03" mb="space.02">
          Address
        </styled.div>
        <CopyAddress addr={account.multisigAddress} grouped />
      </CardRow>

      <CardRow>
        <Flex justifyContent="space-between" alignItems="center" gap="space.02">
          <styled.span textStyle="label.03">Threshold</styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {account.threshold} of {signerCount}
          </styled.span>
        </Flex>
        <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          Any {account.threshold} of {signerCount} members can approve transactions on this account.
        </styled.div>
      </CardRow>

      <CardRow>
        <styled.div textStyle="label.03" mb="space.03">
          Signers
        </styled.div>
        <Flex gap="space.04" flexWrap="wrap">
          {account.signers.map(signer => {
            const isMe = signer.address === currentUserAddress;
            const member = vault.members.find(item => item.address === signer.address);
            const name = isMe ? 'Me' : member?.name || truncateMiddle(signer.address);
            return (
              <Flex key={signer.id} alignItems="center" gap="space.02">
                <AvatarCircle name={name} size="sm" />
                <styled.span textStyle="label.03">{name}</styled.span>
              </Flex>
            );
          })}
        </Flex>
      </CardRow>

      <CardRow>
        <Button
          variant="solid"
          size="sm"
          fullWidth
          onClick={onAddToWallet}
          aria-busy={isAddingToWallet}
          disabled={isAddingToWallet}
        >
          <Flex alignItems="center" gap="space.02">
            <PlusIcon variant="small" color="ink.background-primary" />
            Add to wallet
          </Flex>
        </Button>
      </CardRow>
    </Box>
  );
}
