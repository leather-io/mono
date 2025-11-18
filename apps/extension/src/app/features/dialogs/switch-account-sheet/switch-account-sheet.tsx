import { memo, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useSelector } from 'react-redux';

import { Box, Flex } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { bitcoinNetworkModeToCoreNetworkMode, inferNetworkFromPath } from '@leather.io/bitcoin';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { useWalletType } from '@app/common/use-wallet-type';
import { useCurrentAccountIndex, useHighestKnownAccountIndex } from '@app/store/accounts/account';
import { selectDefaultWalletBitcoinKeys } from '@app/store/ledger/bitcoin/bitcoin-key.slice';
import { selectDefaultWalletStacksKeys } from '@app/store/ledger/stacks/stacks-key.slice';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AccountListUnavailable } from './components/account-list-unavailable';
import { SwitchAccountListItem } from './components/switch-account-list-item';

interface SwitchAccountSheetProps {
  isShowing: boolean;
  onClose(): void;
}

export const SwitchAccountSheet = memo(({ isShowing, onClose }: SwitchAccountSheetProps) => {
  const currentAccountIndex = useCurrentAccountIndex();
  const highestKnownAccountIndex = useHighestKnownAccountIndex() ?? 0;
  const createAccount = useCreateAccount();
  const { whenWallet } = useWalletType();
  const network = useCurrentNetwork();
  const ledgerStacksAccounts = useSelector(selectDefaultWalletStacksKeys);
  const ledgerBitcoinAccounts = useSelector(selectDefaultWalletBitcoinKeys);

  const ledgerStacksAccountCount = ledgerStacksAccounts.length;
  const ledgerBitcoinAccountCount = useMemo(() => {
    const networkMode = bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode);
    const accountsForNetwork = ledgerBitcoinAccounts.filter(v => {
      return inferNetworkFromPath(v.path) === networkMode;
    });
    return accountsForNetwork.length / 2;
  }, [ledgerBitcoinAccounts, network]);

  const softwareAccountCount = highestKnownAccountIndex + 1;
  const ledgerAccountCount = ledgerStacksAccountCount || ledgerBitcoinAccountCount;
  const hasLedgerAccounts = ledgerStacksAccountCount > 0 || ledgerBitcoinAccountCount > 0;

  const onCreateAccount = () => {
    createAccount();
    onClose();
  };

  // #4370 SMELL without this early return the wallet crashes on new install with
  // : Wallet is neither of type `ledger` nor `software`
  // FIXME remove this when adding Create Account to Ledger in #2502 #4983
  if (!isShowing) return null;

  const accountNum = whenWallet({
    ledger: ledgerAccountCount,
    software: softwareAccountCount,
  });
  const hasAccounts = whenWallet({
    ledger: hasLedgerAccounts,
    software: softwareAccountCount > 0,
  });

  if (!hasAccounts) {
    return <AccountListUnavailable />;
  }

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
              borderTop="default"
              p="space.05"
            >
              <Button fullWidth onClick={() => onCreateAccount()} data-testid="create-account-btn">
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
