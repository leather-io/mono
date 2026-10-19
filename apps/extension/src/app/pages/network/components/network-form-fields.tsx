import { useCallback } from 'react';

import { useFormikContext } from 'formik';
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
  const { handleChange, setFieldValue, values } = useFormikContext<AddNetworkFormValues>();
  const setStacksUrl = useCallback(
    (value: string) => {
      void setFieldValue('stacksUrl', value);
    },
    [setFieldValue]
  );

  const setBitcoinUrl = useCallback(
    (value: string) => {
      void setFieldValue('bitcoinUrl', value);
    },
    [setFieldValue]
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
      <NetworkNameSection handleChange={handleChange} values={values} />
      <BitcoinApiSection
        handleChange={handleChange}
        isEditNetworkMode={isEditNetworkMode}
        setFieldValue={setFieldValue}
        setNetworkUrls={setNetworkUrls}
        values={values}
      />
      <StacksApiSection handleChange={handleChange} values={values} />
    </Flex>
  );
}
