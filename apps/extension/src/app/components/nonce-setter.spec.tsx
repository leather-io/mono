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
    resolver() {
      return {
        values: {},
        errors: { recipient: { type: 'custom', message: 'Enter an address' } },
      };
    },
  });
  const { submitCount } = form.formState;
  const nonce = form.watch('nonce');
  return (
    <FormProvider {...form}>
      <form onSubmit={event => void form.handleSubmit(() => undefined)(event)}>
        <NonceSetter />
        <output data-testid="nonce">{nonce}</output>
        <output data-testid="submit-count">{submitCount}</output>
        <button
          type="button"
          onClick={() => form.setValue('nonce', customNonce, { shouldTouch: true })}
        >
          Apply custom nonce
        </button>
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

function getNonce() {
  return screen.getByTestId('nonce').textContent;
}

async function refetchNextNonce(rerender: (ui: React.ReactNode) => void) {
  mocks.nextNonce = refetchedNextNonce;
  await act(async () => {
    rerender(<FailingNonceForm />);
    await Promise.resolve();
  });
}

async function submitOnce() {
  fireEvent.click(screen.getByText('Submit'));
  await waitFor(() => expect(screen.getByTestId('submit-count').textContent).toBe('1'));
}

describe(NonceSetter.name, () => {
  beforeEach(() => {
    mocks.nextNonce = initialNextNonce;
  });

  test('follows the next nonce while the user has not applied their own', async () => {
    const { rerender } = render(<FailingNonceForm />);
    await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));

    await refetchNextNonce(rerender);

    expect(getNonce()).toBe(String(refetchedNextNonce));
  });

  test('keeps following the next nonce after a failed submit', async () => {
    const { rerender } = render(<FailingNonceForm />);
    await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));

    await submitOnce();
    await refetchNextNonce(rerender);

    expect(getNonce()).toBe(String(refetchedNextNonce));
  });

  test('keeps an applied nonce when the next nonce changes before a submit', async () => {
    const { rerender } = render(<FailingNonceForm />);
    await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));

    fireEvent.click(screen.getByText('Apply custom nonce'));
    await waitFor(() => expect(getNonce()).toBe(String(customNonce)));

    await refetchNextNonce(rerender);

    expect(getNonce()).toBe(String(customNonce));
  });

  test('keeps an applied nonce when the next nonce changes after a failed submit', async () => {
    const { rerender } = render(<FailingNonceForm />);
    await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));

    fireEvent.click(screen.getByText('Apply custom nonce'));
    await waitFor(() => expect(getNonce()).toBe(String(customNonce)));

    await submitOnce();
    await refetchNextNonce(rerender);

    expect(getNonce()).toBe(String(customNonce));
  });
});
