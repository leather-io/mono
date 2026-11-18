import { FormProvider, useForm } from 'react-hook-form';

import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { MEMPOOL_BASE_URL } from '@leather.io/constants';
import { Button, Link } from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { ErrorLabel } from '@app/components/error-label';
import { Content } from '@app/components/layout';
import {
  type AddNetworkFormValues,
  useAddNetwork,
} from '@app/pages/network/components/use-add-network';

import { NetworkFormFields } from './network-form-fields';

interface NetworkFormProps {
  isEditNetworkMode: boolean;
}

export function NetworkForm({ isEditNetworkMode }: NetworkFormProps) {
  const { error, initialFormValues, loading, onSubmit } = useAddNetwork();
  const title = isEditNetworkMode ? 'Edit Network' : 'Add Network';
  const buttonTitle = isEditNetworkMode ? 'Edit network' : 'Add network';
  const form = useForm<AddNetworkFormValues>({ defaultValues: initialFormValues });
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <FormProvider {...form}>
      <Content>
        <Flex
          direction="column"
          width="100%"
          position="relative"
          justifyContent="space-between"
          height="100%"
          px="space.05"
        >
          <Flex direction="column">
            <styled.h1 textStyle="heading.03" pb="space.05">
              {title}
            </styled.h1>
            <form
              data-testid={NetworkSelectors.NetworkPageReady}
              onSubmit={event => void handleSubmit(event)}
            >
              <Flex direction="column" gap="space.05">
                <styled.span textStyle="body.02">
                  Use this form to add a new instance of the{' '}
                  <Link
                    href="https://github.com/blockstack/stacks-blockchain-api"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Stacks Blockchain API
                  </Link>{' '}
                  or{' '}
                  <Link href={`${MEMPOOL_BASE_URL}/docs/api/rest`} target="_blank" rel="noreferrer">
                    Bitcoin Blockchain API
                  </Link>
                  . Make sure you review and trust the host before you add it.
                </styled.span>
                <NetworkFormFields isEditNetworkMode={isEditNetworkMode} />
                {error ? (
                  <ErrorLabel data-testid={NetworkSelectors.ErrorText}>{error}</ErrorLabel>
                ) : null}
              </Flex>
            </form>
          </Flex>
          <Flex
            gap="space.05"
            pb="space.05"
            pt="space.03"
            px="space.05"
            mx="-space.05"
            background="ink.background-primary"
            position="sticky"
            bottom={0}
            zIndex="100"
            boxShadow="contentOverflowFade"
          >
            <Button
              disabled={loading}
              data-testid={NetworkSelectors.AddNetworkBtn}
              fullWidth
              variant="outline"
              onClick={() => {
                if (isEditNetworkMode) {
                  analytics.track('network_edited');
                } else {
                  analytics.track('network_added');
                  analytics.track('add_network');
                }
                void handleSubmit();
              }}
            >
              {buttonTitle}
            </Button>
          </Flex>
        </Flex>
      </Content>
    </FormProvider>
  );
}
