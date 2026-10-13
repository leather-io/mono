import { useEffect, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import type { Vault, VaultAccount } from '@leather.io/models';
import { Button, CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { AccountIconNameField } from '../../components/account-icon-name-field';
import { defaultAccountIcon, vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface EditAccountModalProps {
  vault: Vault;
  account: VaultAccount;
  isShowing: boolean;
  isSaving?: boolean;
  onClose(): void;
  onSave(update: { name: string; icon: string }): void;
}

export function EditAccountModal({
  vault,
  account,
  isShowing,
  isSaving,
  onClose,
  onSave,
}: EditAccountModalProps) {
  const currentIcon = account.icon ?? defaultAccountIcon;
  const [name, setName] = useState(account.name);
  const [icon, setIcon] = useState(currentIcon);

  useEffect(() => {
    if (isShowing) {
      setName(account.name);
      setIcon(account.icon ?? defaultAccountIcon);
    }
  }, [isShowing, account.name, account.icon]);

  const theme = vaultThemeFromName(vault.theme);
  const chain = chainFromNetwork(vault.network);
  const trimmed = name.trim();
  const canSave = trimmed !== '' && (trimmed !== account.name || icon !== currentIcon) && !isSaving;

  function save() {
    if (!canSave) return;
    onSave({ name: trimmed, icon });
  }

  return (
    <Sheet
      isShowing={isShowing}
      onClose={onClose}
      contentMaxVh={90}
      header={
        <Flex
          alignItems="center"
          justifyContent="space-between"
          gap="space.04"
          px="space.05"
          py="space.04"
          width="100%"
          minHeight="headerHeight"
        >
          <styled.h2 textStyle="heading.05">Edit account</styled.h2>
          <IconButton icon={<CloseIcon />} onClick={onClose} />
        </Flex>
      }
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" disabled={!canSave} aria-busy={isSaving} onClick={save}>
            Save
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.05" px="space.05" pb="space.05">
        <Box>
          <styled.div textStyle="label.02" color="ink.text-primary" mb="space.02">
            Account name
          </styled.div>
          <AccountIconNameField
            chain={chain}
            themeId={theme.id}
            name={name}
            icon={icon}
            onNameChange={setName}
            onIconChange={setIcon}
            placeholder="Account name"
            inline
          />
        </Box>
      </Flex>
    </Sheet>
  );
}
