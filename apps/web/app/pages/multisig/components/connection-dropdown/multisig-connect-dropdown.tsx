import { Flex, styled } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';

import { Button, ChevronDownIcon, DropdownMenu, Flag, WalletIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { ChainAvatar } from '../chain-avatar';
import { ChooseChainMenu } from './choose-chain-menu';
import { ConnectedMenu } from './connected-menu';
import { useChainConnection } from './use-chain-connection';

export function MultisigConnectDropdown() {
  const networks = useMultisigNetworks();
  const btc = useChainConnection('btc', networks.btc);
  const stx = useChainConnection('stx', networks.stx);
  const chains = [btc, stx];

  const anySignedIn = chains.some(c => c.session);
  const primaryAddress = (stx.session ?? btc.session)?.identity.address;

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {anySignedIn ? (
          <Button variant="outline" size="md" alignSelf="center" aria-label="Wallet connections">
            <Flag reverse spacing="space.01" img={<ChevronDownIcon variant="small" />}>
              <Flex alignItems="center" gap="space.02">
                <Flex alignItems="center" aria-hidden>
                  {chains.map((c, index) => (
                    <Flex
                      key={c.chain}
                      width="24px"
                      height="24px"
                      alignItems="center"
                      justifyContent="center"
                      position="relative"
                      zIndex={c.chain === 'btc' ? 1 : 0}
                      ml={index > 0 ? '-space.03' : undefined}
                      filter={c.session ? undefined : 'grayscale(1)'}
                    >
                      <ChainAvatar chain={c.chain} boxSize="20px" />
                    </Flex>
                  ))}
                </Flex>
                {primaryAddress && <styled.span>{truncateMiddle(primaryAddress)}</styled.span>}
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
          <styled.div mx="space.02" py="space.02" width="300px">
            {anySignedIn ? <ConnectedMenu chains={chains} /> : <ChooseChainMenu chains={chains} />}
          </styled.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
