import { FormProvider, useForm } from 'react-hook-form';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useShowFieldError } from './form-utils';

interface RecipientFormValues {
  recipient: string;
}

function ErrorIndicator() {
  const showError = useShowFieldError('recipient');
  return <output data-testid="indicator">{showError ? 'shown' : 'hidden'}</output>;
}

interface FailingFormProps {
  message: string;
}
function FailingForm({ message }: FailingFormProps) {
  const form = useForm<RecipientFormValues>({
    defaultValues: { recipient: '' },
    resolver: () => ({ values: {}, errors: { recipient: { type: 'custom', message } } }),
  });
  const { submitCount } = form.formState;
  return (
    <FormProvider {...form}>
      <form onSubmit={event => void form.handleSubmit(() => undefined)(event)}>
        <input {...form.register('recipient')} />
        <ErrorIndicator />
        <output data-testid="submit-count">{submitCount}</output>
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

async function submitOnce() {
  fireEvent.click(screen.getByText('Submit'));
  await waitFor(() => expect(screen.getByTestId('submit-count').textContent).toBe('1'));
}

describe(useShowFieldError.name, () => {
  test('hides the error before the form is submitted', () => {
    render(<FailingForm message="Enter an address" />);

    expect(screen.getByTestId('indicator').textContent).toBe('hidden');
  });

  test('shows an error with a message after a failed submit', async () => {
    render(<FailingForm message="Enter an address" />);

    await submitOnce();

    expect(screen.getByTestId('indicator').textContent).toBe('shown');
  });

  test('hides an error with an empty message after a failed submit', async () => {
    render(<FailingForm message="" />);

    await submitOnce();

    expect(screen.getByTestId('indicator').textContent).toBe('hidden');
  });
});
