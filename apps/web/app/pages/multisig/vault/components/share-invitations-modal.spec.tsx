import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ToastContext } from '~/features/toasts/use-toast';

import type { Vault } from '@leather.io/models';
import { Tooltip } from '@leather.io/ui';

import { ShareInvitationsModal } from './share-invitations-modal';

interface DeferredWriteControls {
  resolve(): void;
  reject(): void;
}

function deferredWrite() {
  const controls: DeferredWriteControls = {
    resolve() {
      return undefined;
    },
    reject() {
      return undefined;
    },
  };
  const promise = new Promise<void>((resolve, reject) => {
    controls.resolve = resolve;
    controls.reject = () => reject(new Error('Clipboard permission denied'));
  });
  return { ...controls, promise };
}

function retainClosingContent() {
  const getComputedStyle = window.getComputedStyle.bind(window);
  vi.stubGlobal('getComputedStyle', (element: Element) => {
    const styles = getComputedStyle(element);
    Object.defineProperty(styles, 'animationName', {
      get() {
        if (!element.hasAttribute('data-state')) return 'none';
        return element.getAttribute('data-state') === 'closed' ? 'fadeout' : 'fadein';
      },
    });
    return styles;
  });
}

async function settleWrite(
  pending: ReturnType<typeof deferredWrite>,
  settle: keyof DeferredWriteControls
) {
  await act(async () => {
    pending[settle]();
    await Promise.allSettled([pending.promise]);
  });
}

const writeText = vi.fn<(value: string) => Promise<void>>();
const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
const vault: Vault = {
  id: 'vault-id',
  name: 'Shared vault',
  theme: null,
  icon: null,
  network: 'btc:mainnet',
  status: 'pending',
  createdBy: 'creator-id',
  createdAt: '2026-01-01T00:00:00Z',
  members: [
    {
      membershipId: 'member-id',
      address: 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq',
      name: 'Alice',
      membershipStatus: 'invited',
      user: null,
    },
  ],
};

function invitations(isShowing = true) {
  return (
    <ToastContext.Provider value={toast}>
      <Tooltip.Provider>
        <ShareInvitationsModal vault={vault} isShowing={isShowing} onClose={vi.fn()} />
      </Tooltip.Provider>
    </ToastContext.Provider>
  );
}

describe(ShareInvitationsModal.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeText.mockReset();
    vi.stubGlobal('navigator', { clipboard: { writeText } });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  describe.each([
    { button: 'Copy link', subject: 'link' },
    { button: 'Copy message', subject: 'message' },
  ])('$button', ({ button, subject }) => {
    test('shows success only after the clipboard write succeeds', async () => {
      const pending = deferredWrite();
      writeText.mockReturnValue(pending.promise);
      render(invitations());
      fireEvent.click(screen.getByRole('button', { name: button }));
      expect(writeText).toHaveBeenCalledOnce();
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();

      await settleWrite(pending, 'resolve');

      expect(toast.success).toHaveBeenCalledOnce();
      expect(toast.success).toHaveBeenCalledWith(`Invite ${subject} copied`);
      expect(toast.error).not.toHaveBeenCalled();
    });

    test('shows an error when the current clipboard write fails', async () => {
      const pending = deferredWrite();
      writeText.mockReturnValue(pending.promise);
      render(invitations());
      fireEvent.click(screen.getByRole('button', { name: button }));

      await settleWrite(pending, 'reject');

      expect(toast.error).toHaveBeenCalledOnce();
      expect(toast.error).toHaveBeenCalledWith(`Unable to copy invite ${subject}. Try again.`);
      expect(toast.success).not.toHaveBeenCalled();
    });

    test.each<'resolve' | 'reject'>(['resolve', 'reject'])(
      'keeps a successful retry free of feedback from an older %s',
      async settle => {
        const older = deferredWrite();
        const newest = deferredWrite();
        writeText.mockReturnValueOnce(older.promise).mockReturnValueOnce(newest.promise);
        render(invitations());
        fireEvent.click(screen.getByRole('button', { name: button }));
        fireEvent.click(screen.getByRole('button', { name: button }));
        expect(writeText).toHaveBeenCalledTimes(2);

        await settleWrite(newest, 'resolve');
        await settleWrite(older, settle);

        expect(toast.success).toHaveBeenCalledOnce();
        expect(toast.success).toHaveBeenCalledWith(`Invite ${subject} copied`);
        expect(toast.error).not.toHaveBeenCalled();
      }
    );

    test.each<'resolve' | 'reject'>(['resolve', 'reject'])(
      'does not show feedback for a pending %s while dismissed content is still exiting',
      async settle => {
        retainClosingContent();
        const pending = deferredWrite();
        writeText.mockReturnValue(pending.promise);
        const { rerender } = render(invitations());
        const control = screen.getByRole('button', { name: button });
        fireEvent.click(control);
        rerender(invitations(false));
        expect(control.isConnected).toBe(true);
        expect(screen.getByRole('dialog', { hidden: true }).getAttribute('data-state')).toBe(
          'closed'
        );

        await settleWrite(pending, settle);

        expect(toast.success).not.toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
      }
    );

    test.each<'resolve' | 'reject'>(['resolve', 'reject'])(
      'ignores a pending %s from an earlier opening after invitations reopen',
      async settle => {
        retainClosingContent();
        const older = deferredWrite();
        const newest = deferredWrite();
        writeText.mockReturnValueOnce(older.promise).mockReturnValueOnce(newest.promise);
        const { rerender } = render(invitations());
        const control = screen.getByRole('button', { name: button });
        fireEvent.click(control);
        rerender(invitations(false));
        expect(control.isConnected).toBe(true);
        rerender(invitations());
        expect(screen.getByRole('button', { name: button })).toBe(control);

        await settleWrite(older, settle);

        expect(toast.success).not.toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
        fireEvent.click(control);
        await settleWrite(newest, 'resolve');
        expect(toast.success).toHaveBeenCalledOnce();
        expect(toast.success).toHaveBeenCalledWith(`Invite ${subject} copied`);
        expect(toast.error).not.toHaveBeenCalled();
      }
    );
  });
});
