import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { type FormikHandlers } from 'formik';
import { Flex, styled } from 'leather-styles/jsx';

import { Input } from '@leather.io/ui';

import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

interface NetworkNameSectionProps {
  handleChange: FormikHandlers['handleChange'];
  isEditNetworkMode?: boolean;
  values: AddNetworkFormValues;
}

export function NetworkNameSection({
  handleChange,
  isEditNetworkMode,
  values,
}: NetworkNameSectionProps) {
  return (
    <Flex direction="column" gap="space.03">
      <styled.p textStyle="label.02">Network name</styled.p>
      <Input.Root>
        <Input.Label>Name</Input.Label>
        <Input.Field
          autoFocus
          data-testid={NetworkSelectors.NetworkName}
          onChange={handleChange}
          name="name"
          value={values.name}
          width="100%"
        />
      </Input.Root>
      <Input.Root>
        <Input.Label>Network key</Input.Label>
        <Input.Field
          data-testid={NetworkSelectors.NetworkKey}
          onChange={handleChange}
          disabled={isEditNetworkMode}
          name="key"
          value={values.key}
          width="100%"
        />
      </Input.Root>
    </Flex>
  );
}
