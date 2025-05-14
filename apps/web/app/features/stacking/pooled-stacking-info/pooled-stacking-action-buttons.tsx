import { useNavigate } from 'react-router';

import { Flex, FlexProps } from 'leather-styles/jsx';
import { useRevokeDelegateStxMutation } from '~/features/stacking/pooled-stacking-info/use-revoke-delegate-stx';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';

import { Button } from '@leather.io/ui';

export interface PooledStackingActionButtonsProps extends FlexProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActionButtons({
  poolSlug,
  ...flexProps
}: PooledStackingActionButtonsProps) {
  const navigate = useNavigate();

  const { mutateAsync: revokeDelegateStx, isPending } = useRevokeDelegateStxMutation();

  async function handleStopStackingClick() {
    return revokeDelegateStx().then(() => navigate('/stacking'));
  }

  async function handleIncreaseStackingClick() {
    return navigate(`/stacking/pool/${poolSlug}`);
  }

  return (
    <Flex gap="space.04" {...flexProps}>
      <Button fullWidth variant="outline" onClick={handleStopStackingClick} disabled={isPending}>
        Stop pooling
      </Button>
      <Button fullWidth onClick={handleIncreaseStackingClick}>
        Increase pooling amount
      </Button>
    </Flex>
  );
}
