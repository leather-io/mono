import { Fragment, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { useSignOut } from '~/features/multisig/auth/use-sign-out';
import { leather } from '~/utils/leather-sdk';
import { useClipboardCopy } from '~/utils/use-clipboard-copy';

import type { AuthNetworkId } from '@leather.io/models';
import {
  Button,
  CheckmarkIcon,
  ChevronDownIcon,
  CopyIcon,
  DropdownMenu,
  ExitIcon,
  Flag,
  WalletIcon,
} from '@leather.io/ui';

import type { Chain } from '../data/multisig-types';
import { ChainAvatar } from './chain-avatar';

const chainLabels: Record<Chain, string> = {
  btc: 'Bitcoin',
  stx: 'Stacks',
};

const chainSignInDescriptions: Record<Chain, string> = {
  btc: 'BTC native-segwit (P2WPKH) vaults',
  stx: 'STX & sBTC vaults · Stacks signers',
};

// V1 is mainnet-pinned (spec §2.2); the wallet inherits the web app's network.
const multisigV1Networks: Record<Chain, AuthNetworkId> = {
  btc: 'btc:mainnet',
  stx: 'stx:mainnet',
};

function formatAddress(address: string): string {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

function useChainConnection(chain: Chain, network: AuthNetworkId) {
  const session = useSession(network);
  const signIn = useSignIn(network);
  const signOut = useSignOut(network);
  return {
    chain,
    label: chainLabels[chain],
    description: chainSignInDescriptions[chain],
    session,
    signIn,
    signOut,
  };
}

type ChainConnection = ReturnType<typeof useChainConnection>;

function openExtension() {
  void leather.open({ mode: 'fullpage' });
}

function MenuDivider() {
  return <styled.div height="1px" bg="ink.border-default" mx="space.03" my="space.01" />;
}

function OpenExtensionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M20.5 6C20.5 5.72386 20.2761 5.5 20 5.5H4C3.72386 5.5 3.5 5.72386 3.5 6V18C3.5 18.2761 3.72386 18.5 4 18.5H10C10.2761 18.5 10.5 18.7239 10.5 19C10.5 19.2761 10.2761 19.5 10 19.5H4C3.17157 19.5 2.5 18.8284 2.5 18V6C2.5 5.17157 3.17157 4.5 4 4.5H20C20.8284 4.5 21.5 5.17157 21.5 6V8C21.5 8.27614 21.2761 8.5 21 8.5C20.7239 8.5 20.5 8.27614 20.5 8V6ZM18.388 15.1549C18.2931 15.0381 18.1505 14.9702 18 14.9702C17.8495 14.9702 17.7069 15.0381 17.612 15.1549C17.5444 15.2381 17.4722 15.3182 17.3952 15.3952C17.3182 15.4722 17.2381 15.5444 17.1549 15.612C17.0381 15.7069 16.9702 15.8495 16.9702 16C16.9702 16.1505 17.0381 16.2931 17.1549 16.388C17.2381 16.4556 17.3182 16.5278 17.3952 16.6048C17.4722 16.6818 17.5444 16.7619 17.612 16.8451C17.7069 16.9619 17.8495 17.0298 18 17.0298C18.1505 17.0298 18.2931 16.9619 18.388 16.8451C18.4556 16.7619 18.5278 16.6818 18.6048 16.6048C18.6818 16.5278 18.7619 16.4556 18.8451 16.388C18.9619 16.2931 19.0298 16.1505 19.0298 16C19.0298 15.8495 18.9619 15.7069 18.8451 15.612C18.7619 15.5444 18.6818 15.4722 18.6048 15.3952C18.5278 15.3182 18.4556 15.2381 18.388 15.1549ZM18 11.5C18.2761 11.5 18.5 11.7239 18.5 12C18.5 13.3287 18.794 14.1702 19.3119 14.6881C19.8298 15.206 20.6713 15.5 22 15.5C22.2761 15.5 22.5 15.7239 22.5 16C22.5 16.2761 22.2761 16.5 22 16.5C20.6713 16.5 19.8298 16.794 19.3119 17.3119C18.794 17.8298 18.5 18.6713 18.5 20C18.5 20.2761 18.2761 20.5 18 20.5C17.7239 20.5 17.5 20.2761 17.5 20C17.5 18.6713 17.206 17.8298 16.6881 17.3119C16.1702 16.794 15.3287 16.5 14 16.5C13.7239 16.5 13.5 16.2761 13.5 16C13.5 15.7239 13.7239 15.5 14 15.5C15.3287 15.5 16.1702 15.206 16.6881 14.6881C17.206 14.1702 17.5 13.3287 17.5 12C17.5 11.7239 17.7239 11.5 18 11.5ZM6.5 8C6.5 8.27614 6.27614 8.5 6 8.5C5.72386 8.5 5.5 8.27614 5.5 8C5.5 7.72386 5.72386 7.5 6 7.5C6.27614 7.5 6.5 7.72386 6.5 8ZM9.5 8C9.5 8.27614 9.27614 8.5 9 8.5C8.72386 8.5 8.5 8.27614 8.5 8C8.5 7.72386 8.72386 7.5 9 7.5C9.27614 7.5 9.5 7.72386 9.5 8ZM12.5 8C12.5 8.27614 12.2761 8.5 12 8.5C11.7239 8.5 11.5 8.27614 11.5 8C11.5 7.72386 11.7239 7.5 12 7.5C12.2761 7.5 12.5 7.72386 12.5 8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DropdownAddress({ address }: { address: string }) {
  const { copied, copy } = useClipboardCopy();
  const [hovered, setHovered] = useState(false);
  return (
    <styled.button
      type="button"
      onClick={() => copy(address)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Copy address"
      display="inline-flex"
      alignItems="center"
      gap="space.01"
      cursor="pointer"
      ml="-space.02"
      px="space.02"
      py="space.01"
      borderRadius="sm"
      bg="transparent"
      color="ink.text-subdued"
      textStyle="code"
      transition="background 0.1s ease"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <styled.span>{formatAddress(address)}</styled.span>
      {copied ? (
        <CheckmarkIcon variant="small" color="green.action-primary-default" />
      ) : (
        <CopyIcon variant="small" color={hovered ? 'ink.text-primary' : 'ink.text-subdued'} />
      )}
    </styled.button>
  );
}

export function MultisigConnectDropdown() {
  const btc = useChainConnection('btc', multisigV1Networks.btc);
  const stx = useChainConnection('stx', multisigV1Networks.stx);
  const chains = [btc, stx];

  const anySignedIn = chains.some(c => c.session);
  const primaryAddress = (stx.session ?? btc.session)?.identity.address;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {anySignedIn ? (
          <Button variant="outline" size="md" alignSelf="center">
            <Flag reverse spacing="space.01" img={<ChevronDownIcon variant="small" />}>
              <Flex alignItems="center" gap="space.02">
                <Flex alignItems="center">
                  {chains
                    .filter(c => c.session)
                    .map((c, index) => (
                      <styled.div
                        key={c.chain}
                        width="12px"
                        height="12px"
                        borderRadius="round"
                        borderWidth="1.5px"
                        borderStyle="solid"
                        borderColor="ink.background-primary"
                        bg={c.chain === 'btc' ? 'chain.btc' : 'chain.stx'}
                        ml={index > 0 ? '-space.01' : undefined}
                      />
                    ))}
                </Flex>
                {primaryAddress && <styled.span>{formatAddress(primaryAddress)}</styled.span>}
              </Flex>
            </Flag>
          </Button>
        ) : (
          <Button variant="solid" size="md" alignSelf="center">
            <Flag
              reverse
              spacing="space.01"
              img={<ChevronDownIcon variant="small" color="ink.background-primary" />}
            >
              <Flag img={<WalletIcon variant="small" color="ink.background-primary" />}>
                Connect wallet
              </Flag>
            </Flag>
          </Button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="end">
          <styled.div width="340px" py="space.02">
            {anySignedIn ? <ConnectedMenu chains={chains} /> : <ChooseChainMenu chains={chains} />}
          </styled.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface MenuProps {
  chains: ChainConnection[];
}

function ConnectedMenu({ chains }: MenuProps) {
  return (
    <>
      {chains.map(c => {
        const session = c.session;
        if (!session) return null;
        return (
          <Fragment key={c.chain}>
            <Flex alignItems="center" gap="space.03" px="space.03" py="space.02">
              <ChainAvatar chain={c.chain} size="md" />
              <Box minWidth={0}>
                <styled.span display="block" textStyle="label.02">
                  {c.label}
                </styled.span>
                <DropdownAddress address={session.identity.address} />
              </Box>
            </Flex>
            <DropdownMenu.Item onSelect={c.signOut}>
              <Flag
                color="red.action-primary-default"
                textStyle="label.02"
                img={<ExitIcon variant="small" color="red.action-primary-default" />}
              >
                Disconnect {c.label}
              </Flag>
            </DropdownMenu.Item>
            <MenuDivider />
          </Fragment>
        );
      })}

      {chains.map(c => {
        if (c.session) return null;
        return <SignInItem key={c.chain} connection={c} />;
      })}

      <MenuDivider />
      <DropdownMenu.Item onSelect={openExtension}>
        <Flag textStyle="label.02" img={<OpenExtensionIcon />}>
          Open extension
        </Flag>
      </DropdownMenu.Item>
    </>
  );
}

function ChooseChainMenu({ chains }: MenuProps) {
  return (
    <>
      <styled.div px="space.03" py="space.02">
        <styled.p textStyle="label.02">Choose a chain to connect</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          Multisig uses chain-native signing — connect each chain independently.
        </styled.p>
      </styled.div>
      {chains.map(c => (
        <SignInItem key={c.chain} connection={c} detailed />
      ))}
    </>
  );
}

interface SignInItemProps {
  connection: ChainConnection;
  detailed?: boolean;
}

function signInItemTitle(label: string, isPending: boolean, detailed: boolean): string {
  if (isPending) return `Connecting to ${label}…`;
  if (detailed) return label;
  return `Sign in to ${label}`;
}

function SignInItem({ connection, detailed = false }: SignInItemProps) {
  const { label, description, signIn } = connection;
  return (
    <DropdownMenu.Item
      disabled={signIn.isPending}
      onSelect={event => {
        event.preventDefault();
        signIn.mutate();
      }}
    >
      <Flag
        textStyle="label.02"
        img={<ChainAvatar chain={connection.chain} boxSize={detailed ? '40px' : '24px'} />}
      >
        <Box>
          <styled.span display="block" textStyle="label.02">
            {signInItemTitle(label, signIn.isPending, detailed)}
          </styled.span>
          {detailed && (
            <styled.span display="block" textStyle="caption.01" color="ink.text-subdued">
              {description}
            </styled.span>
          )}
          {signIn.error && (
            <styled.span display="block" textStyle="caption.01" color="red.action-primary-default">
              {signIn.error.message}
            </styled.span>
          )}
        </Box>
      </Flag>
    </DropdownMenu.Item>
  );
}
