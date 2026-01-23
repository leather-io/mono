import { useSelector } from 'react-redux';

import { Box, HStack, Stack } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import {
  useNativeSegwitKeychainsMap,
  useTaprootKeychainsMap,
} from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { CategorySection } from './components/category-section';
import { LedgerConnectionSection } from './components/ledger-connection-section';
import { WalletTreeSection } from './components/wallet-tree-section';
import { useDeveloperWalletActions } from './hooks/use-developer-wallet-actions';
import {
  clearAllChromeStorage,
  clearSessionStorage,
  resetToDevWalletLedger,
  resetToDevWalletLedgerStacksOnly,
  resetToDevWalletSoftware,
} from './utils/dev-wallet-utils';

interface DeveloperUtilitiesSheetProps {
  isShowing: boolean;
  onClose(): void;
}

export function DeveloperUtilitiesSheet({ isShowing, onClose }: DeveloperUtilitiesSheetProps) {
  const { addSoftwareWallet } = useDeveloperWalletActions();

  const reduxState = useSelector((state: any) => ({
    active: state.active,
    keychain: state.keychain,
    inMemoryKeys: state.inMemoryKeys,
    wallets: state.wallets,
    softwareKeys: state.softwareKeys,
    ledger: state.ledger,
  }));

  const accounts = useCurrentNativeSegwitAccount();
  const keychains = useNativeSegwitKeychainsMap();
  const taprootKeychains = useTaprootKeychainsMap();

  return (
    <Sheet
      header={<SheetHeader title="Developer Utilities" />}
      isShowing={isShowing}
      onClose={onClose}
      wrapChildren={false}
    >
      <Stack gap="space.04" px="space.05" py="space.05" maxHeight="80vh" overflowY="auto">
        <CategorySection title="Wallet Management">
          <WalletTreeSection />
        </CategorySection>

        <CategorySection title="Add Wallets">
          <HStack gap="space.03" flexWrap="wrap">
            <Button onClick={() => addSoftwareWallet()} size="sm" variant="outline">
              Add Software Wallet
            </Button>
          </HStack>
          <LedgerConnectionSection />
        </CategorySection>

        <CategorySection title="Dev Wallet Presets">
          <HStack gap="space.03" flexWrap="wrap">
            <Button onClick={resetToDevWalletSoftware} size="sm" variant="outline">
              Reset to Software Dev Wallet
            </Button>
            <Button onClick={resetToDevWalletLedger} size="sm" variant="outline">
              Reset to Ledger Dev Wallet
            </Button>
            <Button onClick={resetToDevWalletLedgerStacksOnly} size="sm" variant="outline">
              Reset to Ledger Dev Wallet (Stacks Only)
            </Button>
          </HStack>
        </CategorySection>

        <CategorySection title="Storage">
          <HStack gap="space.03" flexWrap="wrap">
            <Button onClick={clearSessionStorage} size="sm" variant="outline">
              Clear Session Storage
            </Button>
            <Button onClick={clearAllChromeStorage} size="sm" variant="ghost">
              Clear All Chrome Storage
            </Button>
          </HStack>
        </CategorySection>

        <CategorySection title="State Inspector">
          <Stack gap="space.03">
            <Box>
              <Box fontSize="sm" fontWeight="medium" mb="space.02">
                Redux State
              </Box>
              <Box
                as="pre"
                fontSize="xs"
                p="space.03"
                bg="ink.background-secondary"
                borderRadius="sm"
                overflowX="auto"
              >
                {JSON.stringify(reduxState, null, 2)}
              </Box>
            </Box>

            <Box>
              <Box fontSize="sm" fontWeight="medium" mb="space.02">
                Current Account Descriptor
              </Box>
              <Box
                as="pre"
                fontSize="xs"
                p="space.03"
                bg="ink.background-secondary"
                borderRadius="sm"
                overflowX="auto"
              >
                {JSON.stringify(accounts?.descriptor, null, 2)}
              </Box>
            </Box>

            <Box>
              <Box fontSize="sm" fontWeight="medium" mb="space.02">
                Bitcoin Keychains (Native Segwit)
              </Box>
              <Box
                as="pre"
                fontSize="xs"
                p="space.03"
                bg="ink.background-secondary"
                borderRadius="sm"
                overflowX="auto"
              >
                {JSON.stringify(keychains, null, 2)}
              </Box>
            </Box>

            <Box>
              <Box fontSize="sm" fontWeight="medium" mb="space.02">
                Taproot Keychains
              </Box>
              <Box
                as="pre"
                fontSize="xs"
                p="space.03"
                bg="ink.background-secondary"
                borderRadius="sm"
                overflowX="auto"
              >
                {JSON.stringify(taprootKeychains, null, 2)}
              </Box>
            </Box>
          </Stack>
        </CategorySection>
      </Stack>
    </Sheet>
  );
}
