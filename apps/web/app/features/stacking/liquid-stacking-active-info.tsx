import { LiquidStackingInfo } from '~/features/stacking/direct-stacking-info/liquid-stacking-info';
import { useLeatherConnect } from '~/store/addresses';

import { ProtocolSlug } from './start-liquid-stacking/utils/types-preset-protocols';

interface LiquidStackingActiveInfoProps {
  protocolSlug: ProtocolSlug;
}
export function LiquidStackingActiveInfo({ protocolSlug }: LiquidStackingActiveInfoProps) {
  const { stacksAccount } = useLeatherConnect();

  if (!stacksAccount) {
    return 'Expected stacksAccount to be defined';
  }

  return <LiquidStackingInfo address={stacksAccount.address} protocolSlug={protocolSlug} />;
}
