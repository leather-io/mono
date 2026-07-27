import { Navigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';
import { LiquidStackingInfo } from '~/features/stacking/direct-stacking-info/liquid-stacking-info';
import { useIsHydrated } from '~/hooks/use-is-hydrated';
import { useLeatherConnect } from '~/store/addresses';

import { LoadingSpinner } from '@leather.io/ui';

import { useStackingClient } from './providers/stacking-client-provider';
import { ProtocolSlug } from './start-liquid-stacking/utils/types-preset-protocols';

interface LiquidStackingActiveInfoProps {
  protocolSlug: ProtocolSlug;
}
export function LiquidStackingActiveInfo({ protocolSlug }: LiquidStackingActiveInfoProps) {
  const isHydrated = useIsHydrated();
  const { client } = useStackingClient();
  const { stacksAccount } = useLeatherConnect();

  if (!isHydrated) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (!stacksAccount || !client) return <Navigate to="/stacking" replace />;

  if (!client) {
    return 'Expected client to be defined';
  }

  return <LiquidStackingInfo address={stacksAccount.address} protocolSlug={protocolSlug} />;
}
