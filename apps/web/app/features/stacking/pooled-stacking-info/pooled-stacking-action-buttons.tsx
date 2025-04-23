import { useNavigate } from 'react-router';

import { useMutation } from '@tanstack/react-query';
import { Flex } from 'leather-styles/jsx';
import { createRevokeDelegateStxMutationOptions } from '~/features/stacking/pooled-stacking-info/use-revoke-delegate-stx';
import { useStackingClientRequired } from '~/features/stacking/providers/stacking-client-provider';
import { PoolSlug } from '~/features/stacking/start-pooled-stacking/utils/types-preset-pools';
import { leather } from '~/helpers/leather-sdk';
import { useStacksNetwork } from '~/store/stacks-network';

import { Button } from '@leather.io/ui';

export interface PooledStackingActionButtonsProps {
  poolSlug: PoolSlug;
}

export function PooledStackingActionButtons({ poolSlug }: PooledStackingActionButtonsProps) {
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

  async function handleExtendStackingClick() {
    return navigate(`/pooled-stacking/${poolSlug}`);
  }

  return (
    <Flex mt="space.04" gap="space.04">
      <Button fullWidth variant="ghost" onClick={handleStopStackingClick} disabled={isPending}>
        Stop pooling
      </Button>
      <Button fullWidth onClick={handleExtendStackingClick}>
        Increase stacking
      </Button>
    </Flex>
  );
}
