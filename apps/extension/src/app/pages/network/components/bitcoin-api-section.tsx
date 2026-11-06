import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { Flex, HStack, styled } from 'leather-styles/jsx';

import { type BitcoinNetwork } from '@leather.io/models';
import { CheckmarkIcon, ChevronDownIcon, Input, Select, SelectItemLayout } from '@leather.io/ui';

import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

import { getSelectedNetworkLabel, getSelectedNetworkValue, networks } from './network-presets';

interface BitcoinApiSectionProps {
  isEditNetworkMode?: boolean;
  register: UseFormRegister<AddNetworkFormValues>;
  setValue: UseFormSetValue<AddNetworkFormValues>;
  setNetworkUrls(value: BitcoinNetwork): void;
  values: AddNetworkFormValues;
}
export function BitcoinApiSection({
  isEditNetworkMode,
  register,
  setValue,
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
          setValue('bitcoinNetwork', value);
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
          width="100%"
          data-testid={NetworkSelectors.NetworkBitcoinAddress}
          {...register('bitcoinUrl')}
        />
      </Input.Root>

      <Input.Root>
        <Input.Label>Network key</Input.Label>
        <Input.Field
          data-testid={NetworkSelectors.NetworkKey}
          disabled={isEditNetworkMode}
          width="100%"
          {...register('key')}
        />
      </Input.Root>
    </Flex>
  );
}
