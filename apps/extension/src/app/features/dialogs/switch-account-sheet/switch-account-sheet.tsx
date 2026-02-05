import { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Box, Flex } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { useWalletType } from '@app/common/use-wallet-type';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { SwitchAccountListItem } from './components/switch-account-list-item';

interface SwitchAccountSheetProps {
  isShowing: boolean;
  onClose(): void;
}
export function SwitchAccountSheet({ isShowing, onClose }: SwitchAccountSheetProps) {
  const currentAccountId = useCurrentAccountId();

  const createAccount = useCreateAccount();
  const { whenWallet } = useWalletType();
  const walletTree = useWalletAccountRefTree();

  // Pre-multi-wallet: there should only be one
  const activeWallet = useMemo(
    () => walletTree.find(wallet => wallet.fingerprint === currentAccountId.fingerprint),
    [walletTree, currentAccountId.fingerprint]
  );

  async function onCreateAccount() {
    await createAccount();
    onClose();
  }

  // #4370 SMELL without this early return the wallet crashes on new install with
  // : Wallet is neither of type `ledger` nor `software`
  // FIXME remove this when adding Create Account to Ledger in #2502 #4983
  if (!isShowing) return null;

  return (
    <Sheet
      header={<SheetHeader title="Select account" />}
      isShowing={isShowing}
      onClose={onClose}
      wrapChildren={false}
    >
      <VirtuosoWrapperSheet>
        <Box flex="1">
          <Virtuoso
            initialTopMostItemIndex={currentAccountId.accountIndex}
            totalCount={activeWallet?.accounts.length ?? 0}
            itemContent={index => {
              const accountId = activeWallet?.accounts[index];
              if (!accountId) return null;
              return (
                <Box key={index} py="space.03" px="space.05">
                  <SwitchAccountListItem handleClose={onClose} accountId={accountId} />
                </Box>
              );
            }}
          />
        </Box>
        {whenWallet({
          software: (
            <Flex
              borderBottomRadius="md"
              bg="ink.background-primary"
              boxShadow="contentOverflowFade"
              p="space.05"
            >
              <Button fullWidth onClick={onCreateAccount} data-testid="create-account-btn">
                Create new account
              </Button>
            </Flex>
          ),
          ledger: null,
        })}
      </VirtuosoWrapperSheet>
    </Sheet>
  );
}
