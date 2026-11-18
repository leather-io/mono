import { Flex, styled } from 'leather-styles/jsx';
import { token } from 'leather-styles/tokens';
import { customNetworkConfig } from '~/constants/custom-network-config';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useStacksNetwork } from '~/store/stacks-network';

import {
  Button,
  CheckmarkIcon,
  ChevronDownIcon,
  DropdownMenu,
  Flag,
  GlobeIcon,
} from '@leather.io/ui';

import {
  type NetworkMode,
  chainNetworkSummary,
  networkModeInfo,
  orderedNetworkModes,
} from '../data/network-mode';

export function NetworkModeSwitcher() {
  const { networkName, setNetworkName } = useStacksNetwork();
  const { btc, stx } = useMultisigNetworks();
  const btcSession = useSession(btc);
  const stxSession = useSession(stx);

  const mode: NetworkMode = networkName === 'mainnet' ? 'mainnet' : 'testnet';
  const active = networkModeInfo[mode];
  const connected = Boolean(btcSession || stxSession);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="md"
          alignSelf="center"
          aria-label="Change network"
          bg={active.isProduction ? undefined : active.tone.background}
          borderColor={active.isProduction ? undefined : active.tone.border}
          color={active.isProduction ? undefined : active.tone.text}
        >
          <Flag reverse spacing="space.01" img={<ChevronDownIcon variant="small" />}>
            <Flex alignItems="center" gap="space.02">
              <styled.span position="relative" display="inline-flex">
                <GlobeIcon variant="small" />
                <styled.span
                  position="absolute"
                  right="-3px"
                  bottom="-2px"
                  width="9px"
                  height="9px"
                  borderRadius="round"
                  borderWidth="2px"
                  borderStyle="solid"
                  borderColor="ink.background-primary"
                  bg={connected ? 'green.action-primary-default' : 'ink.border-default'}
                />
              </styled.span>
              {!active.isProduction && (
                <styled.span>
                  {customNetworkConfig && mode === 'testnet'
                    ? customNetworkConfig.name
                    : active.label}
                </styled.span>
              )}
            </Flex>
          </Flag>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="end">
          <styled.div mx="space.02" py="space.02" width="240px">
            {orderedNetworkModes.map(id => {
              const info = networkModeInfo[id];
              const selected = id === mode;
              return (
                <DropdownMenu.Item key={id} onSelect={() => setNetworkName(id)}>
                  <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                    gap="space.02"
                  >
                    <styled.div minWidth={0}>
                      <Flex alignItems="center" gap="space.02">
                        <styled.div textStyle="label.03">{info.label}</styled.div>
                        {customNetworkConfig && id === 'testnet' && (
                          <styled.span
                            flexShrink={0}
                            textStyle="caption.01"
                            px="space.02"
                            borderRadius="round"
                            style={{
                              background: token.var(`colors.${info.tone.background}`),
                              color: token.var(`colors.${info.tone.text}`),
                            }}
                          >
                            {customNetworkConfig.name}
                          </styled.span>
                        )}
                      </Flex>
                      <styled.div textStyle="caption.01" color="ink.text-subdued">
                        {customNetworkConfig && id === 'testnet'
                          ? `${customNetworkConfig.bitcoinNetworkMode} · local`
                          : chainNetworkSummary(id)}
                      </styled.div>
                    </styled.div>
                    {selected && (
                      <styled.span flexShrink={0}>
                        <CheckmarkIcon variant="small" />
                      </styled.span>
                    )}
                  </Flex>
                </DropdownMenu.Item>
              );
            })}
          </styled.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
