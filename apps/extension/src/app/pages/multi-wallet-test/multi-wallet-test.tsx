import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router';

import { bytesToHex } from '@stacks/common';
import { decryptMnemonic as decrypt, encryptMnemonic as encrypt } from '@stacks/encryption';
import { Box, HStack, Stack } from 'leather-styles/jsx';

import {
  deriveRootKeychainFromMnemonic,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
} from '@leather.io/crypto';
import { userAddsWallet } from '@leather.io/state/wallet';
import { Button } from '@leather.io/ui';
import { toHexString } from '@leather.io/utils';

import { useAppDispatch } from '@app/store';
import { useStacksAccounts } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { inMemoryKeyActions } from '@app/store/in-memory-key/in-memory-key.actions';
import { getWalletSessionKey } from '@app/store/session-restore';
import { keySlice } from '@app/store/software-keys/software-key.slice';

export function MultiWalletTest() {
  const dispatch = useAppDispatch();
  const keys = useSelector(state => state);
  const navigate = useNavigate();
  const accounts = useStacksAccounts();
  console.log(accounts);
  return (
    <>
      <Outlet />
      <Stack px="space.05" py="space.05" gap="space.05" width="100%" bg="ink.1" borderRadius="lg">
        <Box>
          <h1>Multi-Wallet Testing</h1>
          <p>This page is for testing multi-wallet functionality during development.</p>
        </Box>
        <HStack gap="space.03" flexWrap="wrap">
          <Button
            onClick={() => (window as any).debug.setLeatherDevWalletSoftware()}
            variant="outline"
            size="sm"
          >
            Reset to software dev 2 wallet
          </Button>
          <Button
            onClick={() => (window as any).debug.setLeatherDevWalletLedger()}
            variant="outline"
            size="sm"
          >
            Reset to ledger dev 2 wallet
          </Button>
          <Button
            onClick={() => (window as any).debug.setLeatherDevWalletLedgerStacksOnly()}
            variant="outline"
            size="sm"
          >
            Reset to ledger dev 2 wallet stacks only
          </Button>
          <Button
            onClick={() => chrome.storage.session.clear().then(() => console.log('cleared'))}
            variant="outline"
            size="sm"
          >
            clear session storage
          </Button>
          <Button
            onClick={async () => {
              const mnemonic = generateMnemonic();
              console.log(mnemonic);
              const keychain = await deriveRootKeychainFromMnemonic(mnemonic);
              console.log(keychain);
              const derivedKey = await getWalletSessionKey();

              console.log({ derivedKey });

              if (!derivedKey.success) return;
              console.log({ derivedKey: derivedKey.data });
              const encryptedMnemonic = await encrypt(mnemonic, derivedKey.data);
              console.log({ encryptedMnemonic: bytesToHex(encryptedMnemonic) });
              const decrypted = await decrypt(encryptedMnemonic, derivedKey.data);
              console.log({ decrypted });

              dispatch(
                userAddsWallet({
                  wallet: {
                    createdOn: new Date().toISOString(),
                    fingerprint: getMnemonicRootKeyFingerprint(mnemonic),
                    type: 'software',
                  },
                  accountKeychains: [],
                })
              );
              dispatch(
                inMemoryKeyActions.setWalletKeys({
                  [getMnemonicRootKeyFingerprint(mnemonic)]: mnemonic,
                })
              );

              dispatch(
                keySlice.actions.addNewWallet({
                  type: 'software',
                  id: toHexString(keychain.fingerprint),
                  encryptedSecretKey: bytesToHex(encryptedMnemonic),
                })
              );
            }}
            variant="outline"
            size="sm"
          >
            Add new mnemonic
          </Button>

          <Button
            onClick={() =>
              navigate('bitcoin/connect-your-ledger', {
                state: {
                  fromLocation: '/multi-wallet-test',
                },
              })
            }
            variant="outline"
            size="sm"
          >
            Connect Ledger bitcoin wallet
          </Button>
        </HStack>

        <Box>
          <h2>Redux State</h2>
          <pre>{JSON.stringify(keys, null, 2)}</pre>
        </Box>
      </Stack>
    </>
  );
}
