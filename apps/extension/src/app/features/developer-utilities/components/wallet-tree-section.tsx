import { useState } from 'react';

import { Box, HStack, Stack } from 'leather-styles/jsx';

import { Badge, Button } from '@leather.io/ui';

import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';

import { useDeveloperWalletActions } from '../hooks/use-developer-wallet-actions';

interface WalletItemProps {
  fingerprint: string;
  name: string;
  type: 'ledger' | 'software';
  accountCount: number;
  onRename(fingerprint: string, newName: string): void;
  onRemove(fingerprint: string): void;
  onCreateAccount(fingerprint: string): void;
}

function WalletItem({
  fingerprint,
  name,
  type,
  accountCount,
  onRename,
  onRemove,
  onCreateAccount,
}: WalletItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  function handleSaveName() {
    if (editedName.trim()) {
      onRename(fingerprint, editedName.trim());
      setIsEditing(false);
    }
  }

  function handleCancelEdit() {
    setEditedName(name);
    setIsEditing(false);
  }

  return (
    <Stack gap="space.02">
      <HStack justifyContent="space-between" alignItems="center" py="space.02">
        <HStack gap="space.02" alignItems="center" flex="1">
          {isEditing ? (
            <HStack gap="space.02" flex="1">
              <input
                type="text"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--colors-ink-border-default)',
                  fontSize: '14px',
                  flex: 1,
                }}
              />
              <Button onClick={handleSaveName} size="sm" variant="outline">
                Save
              </Button>
              <Button onClick={handleCancelEdit} size="sm" variant="ghost">
                Cancel
              </Button>
            </HStack>
          ) : (
            <>
              <Box fontWeight="medium" fontSize="sm">
                {name}
              </Box>
              <Badge label={type} variant={type === 'ledger' ? 'warning' : 'default'} />
              <Box fontSize="xs" color="ink.text-subdued">
                {fingerprint}
              </Box>
            </>
          )}
        </HStack>
        {!isEditing && (
          <HStack gap="space.02">
            <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost">
              Rename
            </Button>
            <Button
              onClick={() => {
                if (confirm(`Remove wallet "${name}"? This cannot be undone.`)) {
                  onRemove(fingerprint);
                }
              }}
              size="sm"
              variant="ghost"
            >
              Remove
            </Button>
          </HStack>
        )}
      </HStack>

      <Box pl="space.05" borderLeft="default">
        <Stack gap="space.01">
          {accountCount === 0 ? (
            <Box fontSize="xs" color="ink.text-subdued" py="space.02">
              No accounts
            </Box>
          ) : (
            Array.from({ length: accountCount }).map((_, index) => (
              <Box key={index} fontSize="xs" color="ink.text-subdued" py="space.01">
                Account #{index}
              </Box>
            ))
          )}
          {type === 'software' && (
            <Box py="space.01">
              <Button
                onClick={() => onCreateAccount(fingerprint)}
                size="sm"
                variant="ghost"
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                + Create Account
              </Button>
            </Box>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

export function WalletTreeSection() {
  const walletTree = useWalletAccountRefTree();
  const { renameWallet, removeWallet, createAccount } = useDeveloperWalletActions();

  if (walletTree.length === 0) {
    return (
      <Box fontSize="sm" color="ink.text-subdued" py="space.04" textAlign="center">
        No wallets found
      </Box>
    );
  }

  return (
    <Stack gap="space.04">
      {walletTree.map(wallet => (
        <WalletItem
          key={wallet.fingerprint}
          fingerprint={wallet.fingerprint}
          name={wallet.name}
          type={wallet.type}
          accountCount={wallet.accounts.length}
          onRename={renameWallet}
          onRemove={removeWallet}
          onCreateAccount={createAccount}
        />
      ))}
    </Stack>
  );
}
