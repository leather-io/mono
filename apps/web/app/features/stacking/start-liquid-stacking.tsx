import { useMemo } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'leather-styles/jsx';
import { useStacksNetwork } from '~/store/stacks-network';

import { ChoosePoolingAmount } from './components/choose-pooling-amount';
import { StackingFormItemTitle } from './components/stacking-form-item-title';
import { StackingLiquidFormSchema, createValidationSchema } from './utils/stacking-liquid-schema';
import { ProtocolName } from './utils/types-preset-protocols';

interface StartLiquidStackingProps {
  protocolName: ProtocolName;
}

const initialStackingFormValues: Partial<StackingLiquidFormSchema> = {
  // amount: '',
};

export function StartLiquidStacking({ protocolName }: StartLiquidStackingProps) {
  const { networkPreference } = useStacksNetwork();

  const schema = useMemo(
    () =>
      createValidationSchema({ networkMode: networkPreference.chain.bitcoin.mode, protocolName }),
    [networkPreference.chain.bitcoin.mode, protocolName]
  );

  const formMethods = useForm<StackingLiquidFormSchema>({
    mode: 'onTouched',
    defaultValues: {
      ...initialStackingFormValues,
    },
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...formMethods}>
      <Form>
        <Stack gap="space.07">
          <Stack gap="space.02">
            <StackingFormItemTitle title="Amount" />
            <ChoosePoolingAmount />
          </Stack>
        </Stack>
      </Form>
    </FormProvider>
  );
}
