import { useCallback } from 'react';

import { useFormikContext } from 'formik';
import { Flex } from 'leather-styles/jsx';

import { MEMPOOL_BASE_URL } from '@leather.io/constants';
import {
  BITCOIN_API_BASE_URL_MAINNET,
  BITCOIN_API_BASE_URL_TESTNET3,
  BITCOIN_API_BASE_URL_TESTNET4,
  type BitcoinNetwork,
} from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import type { AddNetworkFormValues } from '@app/pages/network/components/use-add-network';

import { BitcoinApiSection } from './bitcoin-api-section';
import { NetworkNameSection } from './network-name-section';
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
    switch (value) {
      case 'mainnet':
        setStacksUrl('https://api.hiro.so');
        setBitcoinUrl(BITCOIN_API_BASE_URL_MAINNET);
        break;
      case 'testnet3':
        setStacksUrl('https://api.testnet.hiro.so');
        setBitcoinUrl(BITCOIN_API_BASE_URL_TESTNET3);
        break;
      case 'testnet4':
        setStacksUrl('https://api.testnet.hiro.so');
        setBitcoinUrl(BITCOIN_API_BASE_URL_TESTNET4);
        break;
      case 'signet':
        setStacksUrl('https://api.testnet.hiro.so');
        setBitcoinUrl(`${MEMPOOL_BASE_URL}/signet/api`);
        break;
      case 'regtest':
        setStacksUrl('https://api.testnet.hiro.so');
        setBitcoinUrl(`${MEMPOOL_BASE_URL}/testnet/api`);
        break;
      default:
        assertUnreachable(value);
    }
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
        setFieldValue={setFieldValue}
        setNetworkUrls={setNetworkUrls}
        values={values}
      />
      <StacksApiSection handleChange={handleChange} values={values} />
    </Flex>
  );
}
