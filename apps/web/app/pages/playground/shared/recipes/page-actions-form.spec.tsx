import type { FormEvent } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Input } from '@leather.io/ui';

import { PageActions } from './page-actions';

afterEach(cleanup);

interface FormExampleProps {
  onSubmit(event: FormEvent<HTMLFormElement>): void;
  onCancel?(): void;
  pending?: boolean;
}

function FormExample({ onSubmit, onCancel, pending }: FormExampleProps) {
  return (
    <>
      <form id="preferences" onSubmit={onSubmit}>
        <Input.Root>
          <Input.Label htmlFor="account-name">Account name</Input.Label>
          <Input.Field id="account-name" name="accountName" required />
        </Input.Root>
      </form>
      <PageActions
        primary={{ label: 'Save', type: 'submit', form: 'preferences', pending }}
        secondary={
          onCancel ? { label: 'Cancel', form: 'preferences', onClick: onCancel } : undefined
        }
      />
    </>
  );
}

describe('PageActions form association', () => {
  test('submits the associated form from outside its body with entered data', () => {
    const values: FormDataEntryValue[] = [];
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = new FormData(event.currentTarget).get('accountName');
      if (value !== null) values.push(value);
    });
    render(<FormExample onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Account name' }), {
      target: { value: 'Operations' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(values).toEqual(['Operations']);
  });

  test('retains native required-field validation and permits correction', () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(<FormExample onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Account name' }), {
      target: { value: 'Treasury' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  test('a secondary command does not submit a valid associated form', () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const onCancel = vi.fn();
    render(<FormExample onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Account name' }), {
      target: { value: 'Operations' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('pending disables form submission and the competing command', () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const onCancel = vi.fn();
    render(<FormExample onSubmit={onSubmit} onCancel={onCancel} pending />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Account name' }), {
      target: { value: 'Operations' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
