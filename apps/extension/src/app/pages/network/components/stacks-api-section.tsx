import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { type FormikHandlers } from 'formik';
import { Flex, styled } from 'leather-styles/jsx';

import { Input } from '@leather.io/ui';

import type { AddNetworkFormValues } from '@app/features/add-network/use-add-network';

interface StacksApiSectionProps {
  handleChange: FormikHandlers['handleChange'];
  values: AddNetworkFormValues;
}

export function StacksApiSection({ handleChange, values }: StacksApiSectionProps) {
  return (
    <Flex direction="column" gap="space.03">
      <styled.p textStyle="label.02">Stacks API URL</styled.p>
      <Input.Root>
        <Input.Label>Name</Input.Label>
        <Input.Field
          height="inputHeight"
          onChange={handleChange}
          name="stacksUrl"
          value={values.stacksUrl}
          width="100%"
          data-testid={NetworkSelectors.NetworkStacksAddress}
        />
      </Input.Root>
    </Flex>
  );
}
