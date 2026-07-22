import type { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Vault, VaultAccount } from '@leather.io/models';
import { Button, ListItemBox, PlusIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { AvatarSq } from '../../components/avatar-sq';
import { CopyAddress } from '../../components/copy-address';
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
      borderTopColor="ink.border-transparent"
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
        <ListItemBox
          variant="plain"
          density="compact"
          leading={
            <AvatarSq
              chain={chain}
              icon={account.icon ?? 'piggybank'}
              themeId={theme.id}
              size="sm"
            />
          }
          title={account.name}
          caption={`${chainLabel} Vault Account`}
        />
      </Box>

      <CardRow>
        <styled.div textStyle="label.03" color="ink.text-subdued" mb="space.02">
          Address
        </styled.div>
        <CopyAddress addr={account.multisigAddress} grouped />
      </CardRow>

      <CardRow>
        <styled.div textStyle="label.03" color="ink.text-subdued">
          Threshold
        </styled.div>
        <styled.div textStyle="body.02" color="ink.text-primary" mt="space.01">
          Any {account.threshold} of {signerCount} members can approve transactions on this account.
        </styled.div>
      </CardRow>

      <CardRow>
        <styled.div textStyle="label.03" color="ink.text-subdued" mb="space.03">
          Signers
        </styled.div>
        <Flex direction="column" gap="space.03">
          {account.signers.map(signer => {
            const isMe = signer.address === currentUserAddress;
            const member = vault.members.find(item => item.address === signer.address);
            const name = isMe ? 'Me' : member?.name || truncateMiddle(signer.address);
            return (
              <ListItemBox
                key={signer.id}
                variant="plain"
                density="compact"
                leading={<AvatarCircle name={name} size="md" />}
                title={name}
                caption={<CopyAddress addr={signer.address} wide />}
              />
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
