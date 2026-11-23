import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { NonceSetter } from '@app/components/nonce-setter';

import { EditNonceSheet } from './edit-nonce-dialog';

const initialNextNonce = 5;
const refetchedNextNonce = 6;
const customNonce = '99';

const mocks = vi.hoisted(() => ({ nextNonce: 0, closeSheet: vi.fn<() => void>() }));

interface ChildrenProps {
  children: React.ReactNode;
}

interface MockButtonProps extends ChildrenProps {
  onClick(): void;
}

vi.mock('react-router', () => ({
  useNavigate() {
    return () => mocks.closeSheet();
  },
  useLocation() {
    return { search: '' };
  },
}));

vi.mock('leather-styles/jsx', () => ({
  Stack({ children }: ChildrenProps) {
    return <div>{children}</div>;
  },
  HStack({ children }: ChildrenProps) {
    return <div>{children}</div>;
  },
  styled: {
    span({ children }: ChildrenProps) {
      return <span>{children}</span>;
    },
  },
}));

vi.mock('@leather.io/ui', async () => {
  const { useEffect, useRef } = await import('react');
  return {
    Button({ children, onClick }: MockButtonProps) {
      return (
        <button onClick={onClick} type="button">
          {children}
        </button>
      );
    },
    Input: {
      Root({ children }: ChildrenProps) {
        return <div>{children}</div>;
      },
      Label({ children }: ChildrenProps) {
        return <label>{children}</label>;
      },
      Field(props: React.ComponentProps<'input'>) {
        return <input {...props} />;
      },
    },
    Link({ children }: ChildrenProps) {
      return <span>{children}</span>;
    },
    Sheet({ children }: ChildrenProps) {
      return <div>{children}</div>;
    },
    SheetHeader() {
      return null;
    },
    useOnMount(effect: () => void) {
      const hasRun = useRef(false);
      useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        effect();
      }, [effect]);
    },
  };
});

vi.mock('@app/components/error-label', () => ({
  ErrorLabel({ children }: ChildrenProps) {
    return <div>{children}</div>;
  },
}));

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
}

function SendFormWithNonceSheet() {
  const form = useForm<NonceFormValues>({ defaultValues: { nonce: '' } });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const nonce = form.watch('nonce');
  mocks.closeSheet.mockImplementation(() => setIsSheetOpen(false));
  return (
    <FormProvider {...form}>
      <NonceSetter />
      <output data-testid="nonce">{nonce}</output>
      <button type="button" onClick={() => setIsSheetOpen(true)}>
        Edit nonce
      </button>
      {isSheetOpen && <EditNonceSheet />}
    </FormProvider>
  );
}

function getNonce() {
  return screen.getByTestId('nonce').textContent;
}

async function renderWithOpenSheet() {
  const view = render(<SendFormWithNonceSheet />);
  await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));
  fireEvent.click(screen.getByText('Edit nonce'));
  await screen.findByRole('textbox');
  return view;
}

function typeNonce(value: string) {
  fireEvent.change(screen.getByRole('textbox'), { target: { value } });
}

async function refetchNextNonce(rerender: (ui: React.ReactNode) => void) {
  mocks.nextNonce = refetchedNextNonce;
  await act(async () => {
    rerender(<SendFormWithNonceSheet />);
    await Promise.resolve();
  });
}

describe(EditNonceSheet.name, () => {
  beforeEach(() => {
    mocks.nextNonce = initialNextNonce;
  });

  test('keeps an applied custom nonce when the next nonce changes', async () => {
    const { rerender } = await renderWithOpenSheet();

    typeNonce(customNonce);
    fireEvent.click(screen.getByText('Apply'));
    await waitFor(() => expect(getNonce()).toBe(customNonce));

    await refetchNextNonce(rerender);

    expect(getNonce()).toBe(customNonce);
  });

  test('keeps following the next nonce when the edit is cancelled', async () => {
    const { rerender } = await renderWithOpenSheet();

    typeNonce(customNonce);
    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() => expect(getNonce()).toBe(String(initialNextNonce)));

    await refetchNextNonce(rerender);

    expect(getNonce()).toBe(String(refetchedNextNonce));
  });

  test('keeps following the next nonce when it is applied unchanged', async () => {
    const { rerender } = await renderWithOpenSheet();

    fireEvent.click(screen.getByText('Apply'));
    await refetchNextNonce(rerender);

    expect(getNonce()).toBe(String(refetchedNextNonce));
  });

  test('rejects an empty nonce', async () => {
    await renderWithOpenSheet();

    typeNonce('');
    fireEvent.click(screen.getByText('Apply'));

    expect(await screen.findByText('Nonce must be a positive integer or 0')).toBeDefined();
  });
});
