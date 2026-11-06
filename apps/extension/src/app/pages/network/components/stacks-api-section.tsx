import type { UseFormRegister } from 'react-hook-form';

import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { Input } from '@leather.io/ui';

import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

interface StacksApiSectionProps {
  register: UseFormRegister<AddNetworkFormValues>;
}

export function StacksApiSection({ register }: StacksApiSectionProps) {
  return (
    <Flex direction="column" gap="space.03">
      <styled.p textStyle="label.02">Stacks API URL</styled.p>
      <Input.Root>
        <Input.Label>Name</Input.Label>
        <Input.Field
          height="inputHeight"
          width="100%"
          data-testid={NetworkSelectors.NetworkStacksAddress}
          {...register('stacksUrl')}
        />
      </Input.Root>
    </Flex>
  );
}
