import { useNavigate } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';

import { PlusIcon } from '@leather.io/ui';

import { AddressText } from '../../components/address-text';
import { AvatarSq } from '../../components/avatar-sq';
import { VaultListItem } from '../../components/vault-list-item';
import type { Vault } from '../../data/multisig-types';
import { multisigPaths } from '../../multisig.constants';

interface AccountsListProps {
  vault: Vault;
  onCreate(): void;
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AccountsList({ vault, onCreate }: AccountsListProps) {
  const navigate = useNavigate();
  return (
    <Flex direction="column" gap="space.03">
      {vault.accounts.map(account => (
        <styled.button
          key={account.id}
          type="button"
          onClick={() => navigate(multisigPaths.account(vault.id, account.id))}
          display="block"
          width="100%"
          textAlign="left"
          cursor="pointer"
          p="space.04"
          borderRadius="md"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-default"
          bg="ink.background-primary"
          _hover={{ bg: 'ink.component-background-hover' }}
        >
          <VaultListItem
            leading={
              <AvatarSq chain={vault.chain} icon={account.icon} themeId={vault.theme} size="md" />
            }
            title={account.name}
            caption={<AddressText addr={account.addr} />}
            trailingTitle={formatUsd(account.balanceUsd)}
            trailingSubtitle={account.balanceSub}
          />
        </styled.button>
      ))}
      <styled.button
        type="button"
        onClick={onCreate}
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="space.02"
        width="100%"
        cursor="pointer"
        p="space.04"
        borderRadius="md"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="ink.border-default"
        bg="transparent"
        color="ink.text-subdued"
        textStyle="label.02"
        _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
      >
        <PlusIcon variant="small" />
        Create new account
      </styled.button>
    </Flex>
  );
}
