import { LiquidStackingInfo } from '~/features/stacking/direct-stacking-info/liquid-stacking-info';
import { useLeatherConnect } from '~/store/addresses';

import { useStackingClient } from './providers/stacking-client-provider';
import { ProtocolSlug } from './start-liquid-stacking/utils/types-preset-protocols';

interface LiquidStackingActiveInfoProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingActiveInfo({ protocolSlug }: LiquidStackingActiveInfoProps) {
  const { client } = useStackingClient();
  const { stacksAccount: stxAddress } = useLeatherConnect();

  if (!stxAddress || !client) {
    return 'You should connect STX wallet';
  }
  if (!client) {
    return 'Expected client to be defined';
  }

  return <LiquidStackingInfo address={stxAddress.address} protocolSlug={protocolSlug} />;
}
