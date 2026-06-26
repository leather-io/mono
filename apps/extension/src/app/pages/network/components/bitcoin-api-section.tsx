import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { type FormikHandlers, type FormikHelpers } from 'formik';
import { Flex, HStack, styled } from 'leather-styles/jsx';

import { type BitcoinNetwork } from '@leather.io/models';
import { CheckmarkIcon, ChevronDownIcon, Input, Select, SelectItemLayout } from '@leather.io/ui';

import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

const networks: {
  label: string;
  value: BitcoinNetwork;
}[] = [
  {
    label: 'Mainnet',
    value: 'mainnet',
  },
  {
    label: 'Testnet3',
    value: 'testnet3',
  },
  {
    label: 'Testnet4',
    value: 'testnet4',
  },
  {
    label: 'Signet',
    value: 'signet',
  },
  {
    label: 'Regtest',
    value: 'regtest',
  },
];

interface BitcoinApiSectionProps {
  handleChange: FormikHandlers['handleChange'];
  isEditNetworkMode?: boolean;
  setFieldValue: FormikHelpers<AddNetworkFormValues>['setFieldValue'];
  setNetworkUrls(value: BitcoinNetwork): void;
  values: AddNetworkFormValues;
}
export function BitcoinApiSection({
  handleChange,
  isEditNetworkMode,
  setFieldValue,
  setNetworkUrls,
  values,
}: BitcoinApiSectionProps) {
  return (
    <Flex direction="column" gap="space.03">
      <styled.p textStyle="label.02">Bitcoin API</styled.p>

      <Select.Root
        defaultValue={values.bitcoinNetwork || networks[0].value}
        onValueChange={(value: BitcoinNetwork) => {
          setNetworkUrls(value);
          void setFieldValue('bitcoinNetwork', value);
        }}
      >
        <Select.Trigger data-testid={NetworkSelectors.AddNetworkBitcoinAPISelector}>
          <Select.Value />
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
          disabled={isEditNetworkMode}
          name="key"
          value={values.key}
          width="100%"
        />
      </Input.Root>
    </Flex>
  );
}
