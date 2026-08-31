import { Controller, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { byosmContractParam } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { Button, Input } from '@leather.io/ui';

import { ByosmContractFormSchema, createByosmContractFormSchema } from './byosm-contract-schema';
import { getStateErrorMessage } from './byosm-error-messages';
import { ByosmSignerManagerState } from './use-byosm-signer-manager';

const byosmContent = bitcoinStakingContent.byosm;

interface ByosmContractEntryProps {
  state: ByosmSignerManagerState;
}

export function ByosmContractEntry({ state }: ByosmContractEntryProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { control, handleSubmit } = useForm<ByosmContractFormSchema>({
    mode: 'onTouched',
    defaultValues: { contract: searchParams.get(byosmContractParam) ?? '' },
    resolver: zodResolver(createByosmContractFormSchema(pox5NetworkConfig.contractNetworkMode)),
  });

  const isChecking = state.status === 'checking';
  const stateErrorMessage = getStateErrorMessage(state);

  const onSubmit = handleSubmit(values => {
    if (state.status === 'check-failed' && values.contract === state.contractId) {
      state.retry();
      return;
    }
    setSearchParams({ [byosmContractParam]: values.contract });
  });

  return (
    <Stack gap="space.05" mb="space.07" maxWidth="60ch">
      <Stack gap="space.02">
        <styled.h2 textStyle="heading.05">{byosmContent.entryTitle}</styled.h2>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {byosmContent.entryDescription}
        </styled.p>
      </Stack>

      <form onSubmit={onSubmit}>
        <Stack gap="space.03" alignItems="flex-start">
          <Controller
            control={control}
            name="contract"
            render={({
              field: { onChange, onBlur, value, ref },
              fieldState: { invalid, error },
            }) => (
              <Stack gap="space.02" width="100%">
                <Input.Root>
                  <Input.Label>{byosmContent.inputLabel}</Input.Label>
                  <Input.Field
                    autoComplete="off"
                    data-1p-ignore
                    data-testid="byosm-contract-input"
                    id="contract"
                    value={value ?? ''}
                    onChange={input => onChange(input.target.value)}
                    onBlur={onBlur}
                    ref={ref}
                  />
                </Input.Root>
                {invalid && error && <ErrorLabel>{error.message}</ErrorLabel>}
              </Stack>
            )}
          />

          {stateErrorMessage && <ErrorLabel>{stateErrorMessage}</ErrorLabel>}

          <Button
            type="submit"
            size="md"
            disabled={isChecking}
            data-testid="byosm-contract-continue"
          >
            {isChecking ? byosmContent.checkingLabel : byosmContent.continueLabel}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
