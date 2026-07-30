import { useEffect, useState } from 'react';

import { Flex, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { useStacksAccount } from '~/store/addresses';

import { Spinner } from '@leather.io/ui';

const fadeOutMs = 250;

// Lives beside the wallet control rather than in the content, so the page can
// show the discovery layout immediately and swap to the position layout once the
// scan resolves, instead of holding a placeholder where the content will go.
export function StakingScanIndicator() {
  const stacksAccount = useStacksAccount();
  const { isLoading } = usePox5Position();
  const isScanning = Boolean(stacksAccount) && isLoading;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isScanning) {
      setIsMounted(true);
      return;
    }
    const timeout = setTimeout(() => setIsMounted(false), fadeOutMs);
    return () => clearTimeout(timeout);
  }, [isScanning]);

  if (!isMounted) return null;

  return (
    <Flex
      alignItems="center"
      gap="space.02"
      px="space.03"
      py="space.02"
      mr="space.03"
      borderRadius="md"
      bg="ink.component-background-default"
      flexShrink={0}
      animation={isScanning ? 'fadein 200ms ease-out both' : `fadeout ${fadeOutMs}ms ease-out both`}
      data-testid="staking-scan-indicator"
    >
      <Spinner width="13px" height="13px" color="ink.text-subdued" />
      <styled.span textStyle="label.03" color="ink.text-subdued" whiteSpace="nowrap">
        {bitcoinStakingContent.scanningPositions}
      </styled.span>
    </Flex>
  );
}
