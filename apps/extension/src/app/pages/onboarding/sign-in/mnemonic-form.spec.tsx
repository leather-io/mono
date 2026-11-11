import { useState } from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { describe, expect, test, vi } from 'vitest';

import { MnemonicForm } from './mnemonic-form';

interface MockButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  'data-testid': string;
  onClick(event: React.MouseEvent<HTMLButtonElement>): void;
}

vi.mock('leather-styles/jsx', () => ({
  Stack({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

vi.mock('@leather.io/ui', () => ({
  Button({ children, disabled, onClick, ...props }: MockButtonProps) {
    return (
      <button
        data-testid={props['data-testid']}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    );
  },
  Input: {
    Root({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
    Label({ children }: { children: React.ReactNode }) {
      return <label>{children}</label>;
    },
    Field(props: React.ComponentProps<'input'>) {
      return <input {...props} />;
    },
  },
}));

vi.mock('@app/components/error-label', () => ({
  ErrorLabel({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

vi.mock('@app/ui/components/secret-key/secret-key-grid', () => ({
  SecretKeyGrid({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

const twelveValidWords =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'.split(
    ' '
  );

interface MnemonicFormHarnessProps {
  onSubmit(mnemonic: string): Promise<void>;
}
function MnemonicFormHarness({ onSubmit }: MnemonicFormHarnessProps) {
  const [mnemonic, setMnemonic] = useState<(string | null)[]>(() =>
    new Array<string | null>(24).fill(null)
  );
  return (
    <MnemonicForm
      mnemonic={mnemonic}
      setMnemonic={setMnemonic}
      twentyFourWordMode
      onSubmit={onSubmit}
      error={undefined}
      isLoading={false}
    />
  );
}

function typeWord(fieldNumber: number, word: string) {
  const input = screen.getByTestId(`mnemonic-input-${fieldNumber}`);
  fireEvent.change(input, { target: { value: word } });
  fireEvent.blur(input);
}

function getContinueButton() {
  return screen.getByTestId(OnboardingSelectors.SignInBtn);
}

describe(MnemonicForm.name, () => {
  test('keeps Continue disabled before any word is typed', () => {
    render(<MnemonicFormHarness onSubmit={vi.fn()} />);

    expect(getContinueButton().hasAttribute('disabled')).toBe(true);
  });

  test('enables Continue after twelve valid words in the twenty-four word grid', async () => {
    const onSubmit = vi.fn<(mnemonic: string) => Promise<void>>(() => Promise.resolve());
    render(<MnemonicFormHarness onSubmit={onSubmit} />);

    twelveValidWords.forEach((word, index) => typeWord(index + 1, word));

    await waitFor(() => expect(getContinueButton().hasAttribute('disabled')).toBe(false));

    fireEvent.click(getContinueButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [submittedKey] = onSubmit.mock.calls[0] ?? [''];
    expect(submittedKey.trim()).toBe(twelveValidWords.join(' '));
  });

  test('disables Continue again when a typed word is not in the word list', async () => {
    render(<MnemonicFormHarness onSubmit={vi.fn()} />);

    twelveValidWords.forEach((word, index) => typeWord(index + 1, word));
    await waitFor(() => expect(getContinueButton().hasAttribute('disabled')).toBe(false));

    typeWord(3, 'notaword');

    await waitFor(() => expect(getContinueButton().hasAttribute('disabled')).toBe(true));
    expect(screen.getByText('Word 3 is incorrect or misspelled')).toBeDefined();
  });
});
