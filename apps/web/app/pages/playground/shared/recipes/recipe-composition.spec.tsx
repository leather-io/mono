import { MemoryRouter, useSearchParams } from 'react-router';

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Button } from '@leather.io/ui';

import {
  ClosedScreen,
  CopiedScreen,
  SegwitScreen,
} from '../../areas/receive-example/receive-screens';
import type { FrameId } from '../exploration/frame';
import { PageActions } from './page-actions';
import { PopupPage } from './popup-page';
import { ReviewRow, ReviewSection, ReviewSheet } from './review-sheet';
import { FramePage } from './tab-page';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function ReceiveRoute() {
  const [params] = useSearchParams();
  if (params.get('screen') === 'copied') return <CopiedScreen frame="popup" theme="light" />;
  if (params.get('screen') === 'closed') return <ClosedScreen frame="popup" theme="light" />;
  return <SegwitScreen frame="popup" theme="light" />;
}

describe('page composition', () => {
  test.each<FrameId>(['popup', 'tab'])('renders ordered paired actions in the %s shell', frame => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    render(
      <FramePage
        frame={frame}
        title="Review"
        actions={{
          primary: { label: 'Confirm transfer', onClick: onPrimary },
          secondary: { label: 'Cancel', onClick: onSecondary },
        }}
      >
        Transfer details
      </FramePage>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.map(button => button.textContent)).toEqual(['Cancel', 'Confirm transfer']);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onPrimary).toHaveBeenCalledOnce();
    expect(onSecondary).toHaveBeenCalledOnce();
  });

  test.each<'primary' | 'secondary'>(['primary', 'secondary'])(
    'a pending %s action keeps its name and prevents both activations',
    pendingAction => {
      const onPrimary = vi.fn();
      const onSecondary = vi.fn();
      render(
        <PopupPage
          actions={{
            primary: {
              label: 'Confirm transfer',
              onClick: onPrimary,
              pending: pendingAction === 'primary',
            },
            secondary: {
              label: 'Cancel',
              onClick: onSecondary,
              pending: pendingAction === 'secondary',
            },
          }}
        >
          Transfer details
        </PopupPage>
      );
      const primary = screen.getByRole('button', { name: 'Confirm transfer' });
      const secondary = screen.getByRole('button', { name: 'Cancel' });
      expect(primary.hasAttribute('disabled')).toBe(true);
      expect(secondary.hasAttribute('disabled')).toBe(true);
      expect((pendingAction === 'primary' ? primary : secondary).getAttribute('aria-busy')).toBe(
        'true'
      );
      fireEvent.click(primary);
      fireEvent.click(secondary);
      expect(onPrimary).not.toHaveBeenCalled();
      expect(onSecondary).not.toHaveBeenCalled();
    }
  );

  test('supports a disabled single action and icon without losing its accessible name', () => {
    const onClick = vi.fn();
    render(
      <PopupPage
        actions={{
          primary: {
            label: 'Copy address',
            onClick,
            disabled: true,
            iconStart: <span aria-hidden="true">Copy icon</span>,
          },
        }}
      >
        Address
      </PopupPage>
    );
    const button = screen.getByRole('button', { name: 'Copy address' });
    expect(button.hasAttribute('disabled')).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test.each<FrameId>(['popup', 'tab'])('announces an error at the start of the %s body', frame => {
    render(
      <FramePage
        frame={frame}
        pinned={<span>Search controls</span>}
        notice={{ variant: 'error', message: 'Unable to copy. Try again.' }}
      >
        <p>Address details</p>
      </FramePage>
    );
    const notice = screen.getByRole('alert');
    expect(notice.textContent).toContain('Unable to copy. Try again.');
    const body = notice.closest('[data-page-body]');
    expect(body?.firstElementChild).toBe(notice);
    expect(body?.contains(screen.getByText('Address details'))).toBe(true);
  });

  test('announces ordinary feedback as status and permits a custom footer', () => {
    render(
      <PopupPage
        notice={{ variant: 'success', message: 'Address copied' }}
        customFooter={<Button onClick={vi.fn()}>Custom action</Button>}
      >
        Address
      </PopupPage>
    );
    expect(screen.getByRole('status').textContent).toContain('Address copied');
    expect(screen.getByRole('button', { name: 'Custom action' })).toBeDefined();
  });

  test('renders long review details, notice, and pending actions in an inline dialog', () => {
    render(
      <ReviewSheet
        frame="popup"
        title="Review"
        headline={<p>Transfer summary</p>}
        callout={{ variant: 'warning', message: 'Check the destination before sending.' }}
        actions={{ primary: { label: 'Send transfer', onClick: vi.fn(), pending: true } }}
      >
        <ReviewSection>
          <ReviewRow label="To" value="A long destination name with several readable words" />
          <ReviewRow label="Fee" value="0.0004 BTC" caption="$26.00" />
        </ReviewSection>
      </ReviewSheet>
    );
    const dialog = screen.getByRole('dialog', { name: 'Review' });
    expect(dialog.contains(screen.getByText('Transfer summary'))).toBe(true);
    expect(screen.getByRole('status').textContent).toContain('Check the destination');
    expect(screen.getByText('A long destination name with several readable words')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Send transfer' }).hasAttribute('disabled')).toBe(
      true
    );
  });

  test('allows actions again after pending completes', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <PageActions primary={{ label: 'Remove wallet', onClick, intent: 'danger', pending: true }} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove wallet' }));
    expect(onClick).not.toHaveBeenCalled();
    rerender(<PageActions primary={{ label: 'Remove wallet', onClick, intent: 'danger' }} />);
    const button = screen.getByRole('button', { name: 'Remove wallet' });
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  test('keeps management labels readable and usable as a paired choice', () => {
    const onAdd = vi.fn();
    render(
      <PageActions
        mode="management"
        primary={{ label: 'Manage saved addresses', onClick: vi.fn() }}
        secondary={{ label: 'Add another saved address', onClick: onAdd }}
      />
    );
    expect(screen.getAllByRole('button').map(button => button.textContent)).toEqual([
      'Add another saved address',
      'Manage saved addresses',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Add another saved address' }));
    expect(onAdd).toHaveBeenCalledOnce();
  });
});

describe('Receive composition', () => {
  test('closing a pending copy keeps the closed screen after the clipboard resolves', async () => {
    let completeCopy: (() => void) | undefined;
    const pendingCopy = new Promise<void>(resolve => {
      completeCopy = resolve;
    });
    const writeText = vi.fn().mockReturnValue(pendingCopy);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(
      <MemoryRouter>
        <ReceiveRoute />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy address' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('button', { name: 'Receive' })).toBeDefined();
    await act(async () => {
      completeCopy?.();
      await pendingCopy;
    });
    expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Receive' })).toBeDefined();
  });

  test('prevents repeated clipboard writes while copying', () => {
    const writeText = vi.fn().mockReturnValue(new Promise<void>(() => undefined));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(
      <MemoryRouter>
        <ReceiveRoute />
      </MemoryRouter>
    );
    const copy = screen.getByRole('button', { name: 'Copy address' });
    fireEvent.click(copy);
    expect(copy.getAttribute('aria-busy')).toBe('true');
    expect(copy.hasAttribute('disabled')).toBe(true);
    fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledOnce();
  });

  test('announces copy failure, permits retry, and shows copied feedback after success', async () => {
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(
      <MemoryRouter>
        <ReceiveRoute />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy address' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Unable to copy'));
    const retry = screen.getByRole('button', { name: 'Copy address' });
    expect(retry.hasAttribute('disabled')).toBe(false);
    fireEvent.click(retry);
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Copied'));
    expect(screen.getByRole('button', { name: 'Copied' }).hasAttribute('disabled')).toBe(false);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenLastCalledWith('bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq');
  });
});
