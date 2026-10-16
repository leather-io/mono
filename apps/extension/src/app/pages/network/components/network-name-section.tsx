import type { UseFormRegister } from 'react-hook-form';

import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { Input } from '@leather.io/ui';

import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

interface NetworkNameSectionProps {
  register: UseFormRegister<AddNetworkFormValues>;
}

export function NetworkNameSection({ register }: NetworkNameSectionProps) {
  return (
    <Flex direction="column" gap="space.03">
      <styled.p textStyle="label.02">Network name</styled.p>
      <Input.Root>
        <Input.Label>Name</Input.Label>
        <Input.Field
          autoFocus
          data-testid={NetworkSelectors.NetworkName}
          width="100%"
          {...register('name')}
        />
      </Input.Root>
    </Flex>
  );
}
