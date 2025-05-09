import { useNavigate } from 'react-router';

import { useMutation } from '@tanstack/react-query';
import { Flex, FlexProps } from 'leather-styles/jsx';
import { createRevokeDelegateStxMutationOptions } from '~/features/stacking/pooled-stacking-info/use-revoke-delegate-stx';
import { useStackingClientRequired } from '~/features/stacking/providers/stacking-client-provider';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { leather } from '~/helpers/leather-sdk';
import { useStacksNetwork } from '~/store/stacks-network';

import { Button } from '@leather.io/ui';

export interface PooledStackingActionButtonsProps extends FlexProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActionButtons({
  poolSlug,
  ...flexProps
}: PooledStackingActionButtonsProps) {
  const navigate = useNavigate();

  const { client } = useStackingClientRequired();
  const { networkName } = useStacksNetwork();

  const { mutateAsync, isPending } = useMutation(
    createRevokeDelegateStxMutationOptions({
      client,
      leather,
      network: networkName,
    })
  );

  async function handleStopStackingClick() {
    return mutateAsync().then(() => {
      return navigate('/');
    });
  }

  async function handleIncreaseStackingClick() {
    return navigate(`/pooled-stacking/${poolSlug}`);
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
