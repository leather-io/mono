import { FormProvider, useForm } from 'react-hook-form';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { NonceSetter } from './nonce-setter';

const initialNextNonce = 5;
const refetchedNextNonce = 6;
const customNonce = 99;

const mocks = vi.hoisted(() => ({ nextNonce: 0 }));

vi.mock('@app/query/stacks/nonce/account-nonces.hooks', () => ({
  useNextNonce() {
    return { data: { nonce: mocks.nextNonce } };
  },
}));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccountAddress() {
    return 'SP000000000000000000002Q6VF78';
  },
}));

vi.mock('@app/store/policy/policy.selectors', () => ({
  useCurrentPolicy() {
    return undefined;
  },
}));

interface NonceFormValues {
  nonce: number | string;
  recipient: string;
}

function FailingNonceForm() {
  const form = useForm<NonceFormValues>({
    defaultValues: { nonce: '', recipient: '' },
    resolver: () => ({
      values: {},
      errors: { recipient: { type: 'custom', message: 'Enter an address' } },
    }),
  });
  const { submitCount } = form.formState;
  const nonce = form.watch('nonce');
  return (
    <FormProvider {...form}>
      <form onSubmit={event => void form.handleSubmit(() => undefined)(event)}>
        <NonceSetter />
        <output data-testid="nonce">{nonce}</output>
        <output data-testid="submit-count">{submitCount}</output>
        <button type="button" onClick={() => form.setValue('nonce', customNonce)}>
          Set custom nonce
        </button>
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

function getNonce() {
  return screen.getByTestId('nonce').textContent;
}

describe(NonceSetter.name, () => {
  beforeEach(() => {
    mocks.nextNonce = initialNextNonce;
  });

  test('follows the next nonce until the form is submitted', async () => {
    const { rerender } = render(<FailingNonceForm />);
    await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));

    mocks.nextNonce = refetchedNextNonce;
    rerender(<FailingNonceForm />);

    await waitFor(() => expect(getNonce()).toBe(String(refetchedNextNonce)));
  });

  test('keeps a custom nonce when the next nonce changes after a failed submit', async () => {
    const { rerender } = render(<FailingNonceForm />);
    await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));

    fireEvent.click(screen.getByText('Set custom nonce'));
    await waitFor(() => expect(getNonce()).toBe(String(customNonce)));

    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(screen.getByTestId('submit-count').textContent).toBe('1'));

    mocks.nextNonce = refetchedNextNonce;
    await act(async () => {
      rerender(<FailingNonceForm />);
      await Promise.resolve();
    });

    expect(getNonce()).toBe(String(customNonce));
  });
});
