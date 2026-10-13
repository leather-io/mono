import { useEffect, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { VAULT_MAX_NAME_LENGTH } from '@leather.io/constants';
import type { Vault } from '@leather.io/models';
import { Button, CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { AccountIconNameField } from '../../components/account-icon-name-field';
import { ThemePicker } from '../../create-vault/components/theme-picker';
import {
  defaultVaultIcon,
  vaultIcons,
  vaultThemeFromName,
  vaultThemeName,
} from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface EditVaultModalProps {
  vault: Vault;
  isShowing: boolean;
  isSaving?: boolean;
  onClose(): void;
  onSave(update: { name: string; icon: string; theme: string }): void;
}

export function EditVaultModal({
  vault,
  isShowing,
  isSaving,
  onClose,
  onSave,
}: EditVaultModalProps) {
  const currentIcon = vault.icon ?? defaultVaultIcon;
  const currentTheme = vaultThemeFromName(vault.theme);
  const [name, setName] = useState(vault.name);
  const [icon, setIcon] = useState(currentIcon);
  const [themeId, setThemeId] = useState(currentTheme.id);

  useEffect(() => {
    if (isShowing) {
      setName(vault.name);
      setIcon(vault.icon ?? defaultVaultIcon);
      setThemeId(vaultThemeFromName(vault.theme).id);
    }
  }, [isShowing, vault.name, vault.icon, vault.theme]);

  const chain = chainFromNetwork(vault.network);
  const trimmed = name.trim();
  const canSave =
    trimmed !== '' &&
    (trimmed !== vault.name || icon !== currentIcon || themeId !== currentTheme.id) &&
    !isSaving;

  function save() {
    if (!canSave) return;
    onSave({ name: trimmed, icon, theme: vaultThemeName(themeId) });
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
          <styled.h2 textStyle="heading.05">Edit vault</styled.h2>
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
            Vault name
          </styled.div>
          <AccountIconNameField
            chain={chain}
            themeId={themeId}
            name={name}
            icon={icon}
            icons={vaultIcons}
            maxLength={VAULT_MAX_NAME_LENGTH}
            onNameChange={setName}
            onIconChange={setIcon}
            placeholder="Vault name"
            inline
          />
        </Box>
        <Box>
          <styled.div textStyle="label.02" color="ink.text-primary" mb="space.02">
            Theme
          </styled.div>
          <ThemePicker themeId={themeId} onChange={setThemeId} />
        </Box>
      </Flex>
    </Sheet>
  );
}
