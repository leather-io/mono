import { useNavigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';
import { ProtocolSlug } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';

import { Button } from '@leather.io/ui';

export interface LiquidStackingActionButtonsProps {
  protocolSlug: ProtocolSlug;
}

export function LiquidStackingActionButtons({ protocolSlug }: LiquidStackingActionButtonsProps) {
  const navigate = useNavigate();

  async function handleIncreaseStackingClick() {
    return navigate(`/stacking/liquid/${protocolSlug}/increase`);
  }

  return (
    <Flex mt="space.04" gap="space.04">
      <Button fullWidth onClick={handleIncreaseStackingClick}>
        Increase liquid stacking
      </Button>
    </Flex>
  );
}
