import { Flex, styled } from 'leather-styles/jsx';

import { Button, ChevronDownIcon, DropdownMenu, Flag, WalletIcon } from '@leather.io/ui';

import { ChooseChainMenu } from './choose-chain-menu';
import { ConnectedMenu } from './connected-menu';
import { formatAddress, multisigV1Networks, useChainConnection } from './use-chain-connection';

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
