import { Fragment } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { leather } from '~/utils/leather-sdk';

import { DropdownMenu, ExitIcon, Flag, WalletSparkleIcon } from '@leather.io/ui';

import { ChainAvatar } from '../chain-avatar';
import { DropdownAddress } from './dropdown-address';
import { IconSlot } from './icon-slot';
import { SignInItem } from './sign-in-item';
import type { ChainConnection } from './use-chain-connection';

function openExtension() {
  void leather.open({ mode: 'fullpage' });
}

function MenuDivider() {
  return <styled.div height="1px" bg="ink.border-default" my="space.01" />;
}

function AccountSection({
  connection,
  bnsName,
}: {
  connection: ChainConnection;
  bnsName?: string;
}) {
  const { session } = connection;
  if (!session) return null;
  return (
    <>
      <Flex alignItems="center" gap="space.03" px="space.03" py="space.02">
        <ChainAvatar chain={connection.chain} boxSize="32px" />
        <Box minWidth={0}>
          <styled.span display="block" textStyle="label.03">
            {bnsName ?? connection.label}
          </styled.span>
          {connection.isRestoring ? (
            <styled.span display="block" textStyle="caption.01" color="ink.text-subdued">
              Restoring…
            </styled.span>
          ) : (
            <DropdownAddress address={session.identity.address} />
          )}
        </Box>
      </Flex>
      <DropdownMenu.Item onSelect={connection.signOut}>
        <Flag
          color="red.action-primary-default"
          textStyle="label.03"
          img={
            <IconSlot>
              <ExitIcon variant="small" color="red.action-primary-default" />
            </IconSlot>
          }
        >
          Disconnect {connection.label}
        </Flag>
      </DropdownMenu.Item>
    </>
  );
}

export function ConnectedMenu({
  chains,
  bnsName,
}: {
  chains: ChainConnection[];
  bnsName?: string;
}) {
  const signedIn = chains.filter(c => c.session);
  const notSignedIn = chains.filter(c => !c.session);

  return (
    <>
      {signedIn.map((c, index) => (
        <Fragment key={c.chain}>
          {index > 0 && <MenuDivider />}
          <AccountSection connection={c} bnsName={c.chain === 'stx' ? bnsName : undefined} />
        </Fragment>
      ))}

      {notSignedIn.map(c => (
        <Fragment key={c.chain}>
          <MenuDivider />
          <SignInItem connection={c} />
        </Fragment>
      ))}

      <MenuDivider />
      <DropdownMenu.Item onSelect={openExtension}>
        <Flag
          textStyle="label.03"
          img={
            <IconSlot>
              <WalletSparkleIcon variant="small" />
            </IconSlot>
          }
        >
          Open extension
        </Flag>
      </DropdownMenu.Item>
    </>
  );
}
