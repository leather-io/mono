import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { Flex } from 'leather-styles/jsx';

import { type BitcoinNetwork } from '@leather.io/models';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

import { BitcoinApiSection } from './bitcoin-api-section';
import { NetworkNameSection } from './network-name-section';
import { bitcoinNetworkPresets } from './network-presets';
import { StacksApiSection } from './stacks-api-section';

interface NetworkFormFieldsProps {
  isEditNetworkMode?: boolean;
}

export function NetworkFormFields({ isEditNetworkMode }: NetworkFormFieldsProps) {
  const { register, setValue, watch } = useFormContext<AddNetworkFormValues>();
  const values = watch();
  const setStacksUrl = useCallback(
    (value: string) => {
      setValue('stacksUrl', value);
    },
    [setValue]
  );

  const setBitcoinUrl = useCallback(
    (value: string) => {
      setValue('bitcoinUrl', value);
    },
    [setValue]
  );

  function setNetworkUrls(value: BitcoinNetwork) {
    const preset = bitcoinNetworkPresets[value];
    setStacksUrl(preset.stacksUrl);
    setBitcoinUrl(preset.bitcoinUrl);
  }

  useOnMount(() => {
    if (isEditNetworkMode) {
      return;
    }

    setNetworkUrls(values.bitcoinNetwork);
  });

  return (
    <Flex direction="column" gap="space.05">
      <NetworkNameSection register={register} />
      <BitcoinApiSection
        isEditNetworkMode={isEditNetworkMode}
        register={register}
        setValue={setValue}
        setNetworkUrls={setNetworkUrls}
        values={values}
      />
      <StacksApiSection register={register} />
    </Flex>
  );
}
