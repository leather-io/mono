import { useNavigate } from 'react-router';

import { Flex, FlexProps } from 'leather-styles/jsx';
import { StopPoolingIcon } from '~/components/icons/stop-pooling-icon';
import { useRevokeDelegateStxMutation } from '~/features/stacking/pooled-stacking-info/use-revoke-delegate-stx';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';

import { Button } from '@leather.io/ui';

interface PooledStackingActionButtonsProps extends FlexProps {
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
      <Button
        size="md"
        variant="ghost"
        iconStart={<StopPoolingIcon width="16" height="16" />}
        onClick={handleStopStackingClick}
        disabled={isPending}
      >
        Stop pooling
      </Button>
      <Button size="md" onClick={handleIncreaseStackingClick}>
        Increase pooling amount
      </Button>
    </Flex>
  );
}
