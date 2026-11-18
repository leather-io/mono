import { act } from 'react';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ApprovalLedgerSheet } from './approval-ledger-sheet';

interface SheetPreviewProps {
  isOpen?: boolean;
  isInteractive?: boolean;
  showDuplicate?: boolean;
  onDismiss?(): void;
  onSimulate?(): void;
}

const sheetTitle = 'Sign with your Ledger';
const sheetDescription = 'Connect your device, then review this request on your Ledger.';

async function settleCloseFocus() {
  await act(async () => {
    await new Promise<void>(resolve => window.setTimeout(resolve, 0));
  });
}

function SheetPreview({
  isOpen = true,
  isInteractive = true,
  showDuplicate = false,
  onDismiss,
  onSimulate,
}: SheetPreviewProps) {
  return (
    <>
      <div data-approval-shell>
        <div inert={isOpen}>
          <h1>Sign a message</h1>
          <div data-approval-zone="footer">
            <button type="button">Cancel</button>
            <button type="button">Sign on Ledger</button>
          </div>
        </div>
        {isOpen && (
          <ApprovalLedgerSheet
            title={sheetTitle}
            description={sheetDescription}
            isInteractive={isInteractive}
            onDismiss={onDismiss}
          >
            <button type="button">Connect Ledger</button>
          </ApprovalLedgerSheet>
        )}
      </div>
      <button type="button" onClick={onSimulate}>
        Simulate device approval
      </button>
      {showDuplicate && (
        <div inert aria-hidden="true">
          <ApprovalLedgerSheet
            title="Filmstrip Ledger preview"
            description={sheetDescription}
            isInteractive={false}
            onDismiss={onDismiss}
          >
            <button type="button">Thumbnail connect button</button>
          </ApprovalLedgerSheet>
        </div>
      )}
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe(ApprovalLedgerSheet.name, () => {
  test('labels the active dialog and focuses its title within the wallet frame', () => {
    render(<SheetPreview />);

    const dialog = screen.getByRole('dialog', { name: sheetTitle });
    const title = screen.getByRole('heading', { name: sheetTitle });
    expect(dialog.contains(title)).toBe(true);
    expect(document.activeElement).toBe(title);
    expect(dialog.closest('[data-approval-shell]')).not.toBeNull();
    const descriptionId = dialog.getAttribute('aria-describedby');
    expect(descriptionId).not.toBeNull();
    expect(descriptionId && document.getElementById(descriptionId)?.textContent).toBe(
      sheetDescription
    );
    expect(dialog.getAttribute('aria-modal')).not.toBe('true');
  });

  test('dismisses once on Escape without closing the surrounding page viewer', () => {
    const onDismiss = vi.fn();
    const onViewerKeyDown = vi.fn();
    render(<SheetPreview onDismiss={onDismiss} />);
    window.addEventListener('keydown', onViewerKeyDown);

    try {
      fireEvent.keyDown(screen.getByRole('heading', { name: sheetTitle }), { key: 'Escape' });
      expect(onDismiss).toHaveBeenCalledOnce();
      expect(onViewerKeyDown).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('keydown', onViewerKeyDown);
    }
  });

  test('does not create another active dialog or steal focus when a filmstrip duplicate mounts', () => {
    const { rerender } = render(<SheetPreview />);
    const simulator = screen.getByRole('button', { name: 'Simulate device approval' });
    simulator.focus();

    rerender(<SheetPreview showDuplicate />);

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(
      screen.queryByRole('dialog', { name: 'Filmstrip Ledger preview', hidden: true })
    ).toBeNull();
    expect(document.activeElement).toBe(simulator);
  });

  test('keeps simulator interaction accessible without dismissing the wallet sheet', () => {
    const onDismiss = vi.fn();
    const onSimulate = vi.fn();
    render(<SheetPreview onDismiss={onDismiss} onSimulate={onSimulate} />);
    const simulator = screen.getByRole('button', { name: 'Simulate device approval' });

    fireEvent.pointerDown(simulator);
    simulator.focus();
    fireEvent.click(simulator);

    expect(onSimulate).toHaveBeenCalledOnce();
    expect(onDismiss).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(simulator);
    expect(screen.getByRole('dialog', { name: sheetTitle })).toBeDefined();
  });

  test('does not steal focus from the simulator when the sheet closes', async () => {
    const { rerender } = render(<SheetPreview />);
    const simulator = screen.getByRole('button', { name: 'Simulate device approval' });
    simulator.focus();

    rerender(<SheetPreview isOpen={false} />);
    await settleCloseFocus();

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(simulator));
  });

  test('restores the signing action when a sheet that owns focus closes', async () => {
    const { rerender } = render(<SheetPreview />);
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: sheetTitle }));

    rerender(<SheetPreview isOpen={false} />);
    await settleCloseFocus();

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Sign on Ledger' }))
    );
  });
});
