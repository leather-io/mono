import { useState } from 'react';

import { InlineLearnMoreLink } from '~/components/inline-learn-more-link';

import type { Vault, VaultAccount } from '@leather.io/models';

import { AccountWalletAvatar } from '../../components/account-wallet-avatar';
import { AddToExtensionButton } from '../../components/add-to-extension-button';
import { vaultThemeFromName } from '../../multisig-tokens';
import { multisigGuides } from '../../multisig.constants';
import { SingleVaultAccountPrompt } from '../../vault/components/vault-account-setup';
import { AccountActionCard } from './account-action-card';

interface AccountWalletOfferProps {
  vault: Vault;
  account: VaultAccount;
  canOpenSheet: boolean;
  isAdding: boolean;
  onAdd(): void;
}

export function AccountWalletOffer({
  vault,
  account,
  canOpenSheet,
  isAdding,
  onAdd,
}: AccountWalletOfferProps) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      <AccountActionCard
        title="Leather extension"
        description="Use this account with apps in this browser."
        icon={
          <AccountWalletAvatar
            account={account}
            themeId={vaultThemeFromName(vault.theme).id}
            size="md"
          />
        }
        help={
          <InlineLearnMoreLink
            href={multisigGuides.addToExtension}
            subject="adding a vault account to Leather"
          />
        }
        action={
          <AddToExtensionButton
            size="sm"
            onClick={onAdd}
            aria-label={`Add to extension: ${account.name}`}
            aria-busy={isAdding}
            disabled={isAdding}
          />
        }
      />
      {canOpenSheet && !dismissed && (
        <SingleVaultAccountPrompt
          vault={vault}
          account={account}
          onClose={() => setDismissed(true)}
          onAdd={onAdd}
          isAdding={isAdding}
        />
      )}
    </>
  );
}
