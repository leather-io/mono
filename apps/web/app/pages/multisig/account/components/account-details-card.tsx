import type { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';

import type { Vault, VaultAccount } from '@leather.io/models';
import {
  BasicTooltip,
  Button,
  CheckmarkIcon,
  IconButton,
  ListItemBox,
  PencilIcon,
  PlusIcon,
} from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../../components/avatar-circle';
import { AvatarSq } from '../../components/avatar-sq';
import { vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface AccountDetailsCardProps {
  vault: Vault;
  account: VaultAccount;
  currentUserAddress?: string;
  onAddToWallet(): void;
  isAddingToWallet?: boolean;
  isAddedToWallet?: boolean;
  onEdit?(): void;
}

function CardRow({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return (
    <Box
      p="space.04"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-transparent"
      bgImage={highlight ? 'var(--multisig-collecting-wash)' : undefined}
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
  isAddedToWallet,
  onEdit,
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
          trailing={
            onEdit ? (
              <BasicTooltip asChild label="Edit account">
                <IconButton
                  icon={<PencilIcon variant="small" color="ink.text-subdued" />}
                  onClick={onEdit}
                  aria-label="Edit account"
                  size="sm"
                />
              </BasicTooltip>
            ) : undefined
          }
        />
      </Box>

      <CardRow highlight={!isAddedToWallet}>
        {isAddedToWallet ? (
          <>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={onAddToWallet}
              aria-busy={isAddingToWallet}
              disabled={isAddingToWallet}
            >
              <Flex alignItems="center" gap="space.02">
                <CheckmarkIcon variant="small" color="ink.text-subdued" />
                Added to your Leather extension
              </Flex>
            </Button>
            <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.03">
              On this browser. Using another device? Add it again there.
            </styled.p>
          </>
        ) : (
          <>
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
                Add account to wallet
              </Flex>
            </Button>
            <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.03">
              Apps talk to your Leather extension, not this site. Until this account is in your
              extension, dApps, contract calls and staking can&rsquo;t see it.
            </styled.p>
          </>
        )}
      </CardRow>

      <CardRow>
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
    </Box>
  );
}
