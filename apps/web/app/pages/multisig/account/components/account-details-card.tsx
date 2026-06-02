import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button, CheckmarkIcon } from '@leather.io/ui';

import { AvatarCircle } from '../../components/avatar-circle';
import { AvatarSq } from '../../components/avatar-sq';
import { CopyAddress } from '../../components/copy-address';
import type { MultisigAccount, Vault } from '../../data/multisig-types';

interface AccountDetailsCardProps {
  vault: Vault;
  account: MultisigAccount;
  added: boolean;
  onAddToWallet(): void;
}

function CardRow({ children }: { children: React.ReactNode }) {
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
  added,
  onAddToWallet,
}: AccountDetailsCardProps) {
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      <Flex alignItems="center" gap="space.03" p="space.04">
        <AvatarSq
          chain={vault.chain}
          icon={account.icon}
          themeId={vault.theme}
          size="sm"
          withChainBadge={false}
        />
        <Box>
          <styled.div textStyle="label.01">{account.name}</styled.div>
          <styled.div textStyle="caption.01" color="ink.text-subdued">
            {vault.chain === 'btc' ? 'Bitcoin' : 'Stacks'} vault account
          </styled.div>
        </Box>
      </Flex>

      <CardRow>
        <styled.div textStyle="label.02" mb="space.02">
          Address
        </styled.div>
        <CopyAddress addr={account.addr} full />
      </CardRow>

      <CardRow>
        <Flex justifyContent="space-between" alignItems="center">
          <styled.span textStyle="label.02">Threshold</styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {account.threshold[0]} of {account.threshold[1]}
          </styled.span>
        </Flex>
        <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          Any {account.threshold[0]} of {account.threshold[1]} members can approve transactions on
          this account.
        </styled.div>
      </CardRow>

      <CardRow>
        <styled.div textStyle="label.02" mb="space.02">
          Signers
        </styled.div>
        <Flex gap="space.04" flexWrap="wrap">
          {vault.members.map(member => (
            <Flex key={member.addr} alignItems="center" gap="space.01" textStyle="caption.01">
              <AvatarCircle name={member.name} size="xs" />
              {member.name}
            </Flex>
          ))}
        </Flex>
      </CardRow>

      <CardRow>
        {added ? (
          <Button
            variant="outline"
            fullWidth
            disabled
            iconStart={<CheckmarkIcon variant="small" />}
          >
            Added to your wallet
          </Button>
        ) : (
          <Button variant="solid" fullWidth onClick={onAddToWallet}>
            Add to wallet
          </Button>
        )}
      </CardRow>
    </Box>
  );
}
