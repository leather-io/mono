import { Fragment } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { leather } from '~/utils/leather-sdk';

import { DropdownMenu, ExitIcon, Flag, WalletSparkleIcon } from '@leather.io/ui';

import { ChainAvatar } from '../chain-avatar';
import { DropdownAddress } from './dropdown-address';
import { SignInItem } from './sign-in-item';
import type { ChainConnection } from './use-chain-connection';

function openExtension() {
  void leather.open({ mode: 'fullpage' });
}

function MenuDivider() {
  return <styled.div height="1px" bg="ink.border-default" mx="space.03" my="space.01" />;
}

export function ConnectedMenu({ chains }: { chains: ChainConnection[] }) {
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
        <Flag textStyle="label.02" img={<WalletSparkleIcon variant="small" />}>
          Open extension
        </Flag>
      </DropdownMenu.Item>
    </>
  );
}
