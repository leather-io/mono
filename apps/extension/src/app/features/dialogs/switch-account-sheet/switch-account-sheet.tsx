import { memo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { Box, Flex } from 'leather-styles/jsx';

import { Button, Callout, InfoCircleIcon, Link, Sheet, SheetHeader } from '@leather.io/ui';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { useWalletType } from '@app/common/use-wallet-type';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useFilteredBitcoinAccounts } from '@app/store/accounts/blockchain/bitcoin/bitcoin.ledger';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
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
  const currentAccountIndex = useCurrentAccountIndex();
  const createAccount = useCreateAccount();
  const { whenWallet } = useWalletType();
  const stacksAccounts = useStacksAccounts();
  const bitcoinAccounts = useFilteredBitcoinAccounts();
  const btcAddressesNum = bitcoinAccounts.length / 2;
  const stacksAddressesNum = stacksAccounts.length;

  async function onCreateAccount() {
    await createAccount();
    onClose();
  }

  if (isShowing && stacksAddressesNum === 0 && btcAddressesNum === 0) {
    return <AccountListUnavailable />;
  }
  // #4370 SMELL without this early return the wallet crashes on new install with
  // : Wallet is neither of type `ledger` nor `software`
  // FIXME remove this when adding Create Account to Ledger in #2502 #4983
  if (!isShowing) return null;

  const accountNum = stacksAddressesNum || btcAddressesNum;

  return (
    <Sheet
      header={<SheetHeader title="Select account" />}
      isShowing={isShowing}
      onClose={onClose}
      wrapChildren={false}
    >
      {whenWallet({
        software: null,
        ledger: (
          <Link
            href="https://app.leather.io/support/guide/why-your-ledger-account-might-not-show-up-in-leather"
            target="_blank"
            position="sticky"
            top="0"
            zIndex="10"
            display="block"
            textDecoration="none"
            _hover={{ textDecoration: 'none' }}
          >
            <Callout variant="info" icon={<InfoCircleIcon variant="small" />}>
              Only the first Stacks account matches Ledger Live. Additional accounts may not appear
              here.
            </Callout>
          </Link>
        ),
      })}
      <VirtuosoWrapperSheet>
        <Box flex="1">
          <Virtuoso
            initialTopMostItemIndex={whenWallet({ ledger: 0, software: currentAccountIndex })}
            totalCount={accountNum}
            itemContent={index => (
              <Box key={index} py="space.03" px="space.05">
                <SwitchAccountListItem
                  handleClose={onClose}
                  currentAccountIndex={currentAccountIndex}
                  index={index}
                />
              </Box>
            )}
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
