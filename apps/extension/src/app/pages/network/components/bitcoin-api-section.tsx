import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { type FormikHandlers, type FormikHelpers } from 'formik';
import { Flex, HStack, styled } from 'leather-styles/jsx';

import { type BitcoinNetwork } from '@leather.io/models';
import { CheckmarkIcon, ChevronDownIcon, Input, Select, SelectItemLayout } from '@leather.io/ui';

import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

import { getSelectedNetworkLabel, getSelectedNetworkValue, networks } from './network-presets';

interface BitcoinApiSectionProps {
  handleChange: FormikHandlers['handleChange'];
  setFieldValue: FormikHelpers<AddNetworkFormValues>['setFieldValue'];
  setNetworkUrls(value: BitcoinNetwork): void;
  values: AddNetworkFormValues;
}
export function BitcoinApiSection({
  handleChange,
  setFieldValue,
  setNetworkUrls,
  values,
}: BitcoinApiSectionProps) {
  return (
    <Flex direction="column" gap="space.03">
      <styled.p textStyle="label.02">Bitcoin API</styled.p>

      <Select.Root
        value={getSelectedNetworkValue(values)}
        onValueChange={(value: BitcoinNetwork) => {
          setNetworkUrls(value);
          void setFieldValue('bitcoinNetwork', value);
        }}
      >
        <Select.Trigger data-testid={NetworkSelectors.AddNetworkBitcoinAPISelector}>
          <styled.span textStyle="label.02">{getSelectedNetworkLabel(values)}</styled.span>
          <Select.Icon>
            <ChevronDownIcon variant="small" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content align="start" position="popper" sideOffset={8}>
            <Select.Viewport>
              {networks.map(item => (
                <Select.Item
                  key={item.label}
                  value={item.value}
                  data-testid={`bitcoin-api-option-${item.value}`}
                >
                  <SelectItemLayout
                    contentLeft={
                      <HStack display="flex" gap="space.02" width="100%">
                        <Select.ItemText>
                          <styled.span textStyle="label.02">{item.label}</styled.span>
                        </Select.ItemText>
                        <Select.ItemIndicator>
                          <CheckmarkIcon variant="small" />
                        </Select.ItemIndicator>
                      </HStack>
                    }
                  />
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <Input.Root>
        <Input.Label>Bitcoin API URL</Input.Label>
        <Input.Field
          onChange={handleChange}
          name="bitcoinUrl"
          value={values.bitcoinUrl}
          width="100%"
          data-testid={NetworkSelectors.NetworkBitcoinAddress}
        />
      </Input.Root>

      <Input.Root>
        <Input.Label>Network key</Input.Label>
        <Input.Field
          data-testid={NetworkSelectors.NetworkKey}
          onChange={handleChange}
          name="key"
          value={values.key}
          width="100%"
        />
      </Input.Root>
    </Flex>
  );
}
