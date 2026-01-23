import { memo, useMemo } from 'react';
import { GroupedVirtuoso } from 'react-virtuoso';

import { Box, Flex } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { useWalletType } from '@app/common/use-wallet-type';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AccountListUnavailable } from './components/account-list-unavailable';
import { SwitchAccountListItem } from './components/switch-account-list-item';

interface SwitchAccountSheetProps {
  isShowing: boolean;
  onClose(): void;
}
export const SwitchAccountSheet = memo(function SwitchAccountSheet({
  isShowing,
  onClose,
}: SwitchAccountSheetProps) {
  const createAccount = useCreateAccount();
  const { whenWallet } = useWalletType();
  const walletTree = useWalletAccountRefTree();

  const { groupCounts, totalAccounts } = useMemo(() => {
    const counts = walletTree.map(wallet => wallet.accounts.length);
    const total = walletTree.reduce((sum, wallet) => sum + wallet.accounts.length, 0);
    return { groupCounts: counts, totalAccounts: total };
  }, [walletTree]);

  async function onCreateAccount() {
    await createAccount();
    onClose();
  }

  if (isShowing && totalAccounts === 0) {
    return <AccountListUnavailable />;
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
          <GroupedVirtuoso
            groupCounts={groupCounts}
            groupContent={groupIndex => {
              const wallet = walletTree[groupIndex];
              return (
                <Box
                  py="space.03"
                  px="space.05"
                  bg="ink.background-primary"
                  position="sticky"
                  top={0}
                  zIndex={1}
                >
                  <Flex fontWeight="medium" color="ink.text-primary">
                    {wallet.name}
                  </Flex>
                </Box>
              );
            }}
            itemContent={(index, groupIndex) => {
              const wallet = walletTree[groupIndex];
              const accountIndexInGroup =
                index - groupCounts.slice(0, groupIndex).reduce((a, b) => a + b, 0);

              const accountId = wallet.accounts[accountIndexInGroup];

              return (
                <Box
                  key={`${accountId.fingerprint}-${accountId.accountIndex}`}
                  py="space.03"
                  px="space.05"
                >
                  <SwitchAccountListItem accountId={accountId} handleClose={onClose} />
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
});
