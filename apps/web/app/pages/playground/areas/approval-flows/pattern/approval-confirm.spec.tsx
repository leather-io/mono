import { act } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ApprovalPrimaryButton } from './approval-confirm';

const clickGuardDurationMs = 600;
const holdDurationMs = 1200;
const animationFrameDurationMs = 10;
const beforeDeadlineMs = 1;
const buttonProps = {
  label: 'Sign on Ledger',
  isDisabled: false,
  isFullWidth: true,
  armKey: 'message-request',
};

function advanceTime(durationMs: number) {
  act(() => {
    vi.advanceTimersByTime(durationMs);
  });
}

function clickPrimary() {
  fireEvent.click(screen.getByRole('button', { name: 'Sign on Ledger' }));
}

function startHold() {
  fireEvent.keyDown(screen.getByRole('button', { name: 'Hold to sign on ledger' }), {
    key: ' ',
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent() {
      return true;
    },
  }));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(performance.now()), animationFrameDurationMs)
  );
  vi.stubGlobal('cancelAnimationFrame', (handle: number) => window.clearTimeout(handle));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe(ApprovalPrimaryButton.name, () => {
  test('blocks accidental early clicks and accepts a deliberate click after review time', () => {
    const onClick = vi.fn();
    render(<ApprovalPrimaryButton {...buttonProps} intent="default" onClick={onClick} />);

    clickPrimary();
    advanceTime(clickGuardDurationMs - beforeDeadlineMs);
    clickPrimary();
    expect(onClick).not.toHaveBeenCalled();

    advanceTime(beforeDeadlineMs);
    clickPrimary();
    expect(onClick).toHaveBeenCalledOnce();
  });

  test.each([
    { isDisabled: true, isBusy: false },
    { isDisabled: false, isBusy: true },
  ])('blocks an already armed action when unavailable: %j', unavailable => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ApprovalPrimaryButton {...buttonProps} intent="default" onClick={onClick} />
    );
    advanceTime(clickGuardDurationMs);

    rerender(
      <ApprovalPrimaryButton {...buttonProps} intent="default" {...unavailable} onClick={onClick} />
    );
    advanceTime(holdDurationMs);
    clickPrimary();
    expect(onClick).not.toHaveBeenCalled();
  });

  test.each([
    { isDisabled: true, isBusy: false, armKey: buttonProps.armKey },
    { isDisabled: false, isBusy: true, armKey: buttonProps.armKey },
    { isDisabled: false, isBusy: false, armKey: 'replacement-request' },
  ])('cancels an active hold when approval context changes: %j', changedContext => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ApprovalPrimaryButton
        {...buttonProps}
        intent="default"
        confirmation={{ mode: 'hold' }}
        onClick={onClick}
      />
    );
    advanceTime(clickGuardDurationMs);
    startHold();
    advanceTime(holdDurationMs - animationFrameDurationMs);

    rerender(
      <ApprovalPrimaryButton
        {...buttonProps}
        intent="default"
        {...changedContext}
        confirmation={{ mode: 'hold' }}
        onClick={onClick}
      />
    );
    advanceTime(holdDurationMs);
    expect(onClick).not.toHaveBeenCalled();
  });

  test.each([
    { isDisabled: true, isBusy: false },
    { isDisabled: false, isBusy: true },
  ])(
    'requires fresh review time after an unavailable action becomes available: %j',
    unavailable => {
      const onClick = vi.fn();
      const { rerender } = render(
        <ApprovalPrimaryButton {...buttonProps} intent="default" onClick={onClick} />
      );
      advanceTime(clickGuardDurationMs);

      rerender(
        <ApprovalPrimaryButton
          {...buttonProps}
          intent="default"
          {...unavailable}
          onClick={onClick}
        />
      );
      rerender(<ApprovalPrimaryButton {...buttonProps} intent="default" onClick={onClick} />);
      clickPrimary();
      advanceTime(clickGuardDurationMs - beforeDeadlineMs);
      clickPrimary();
      expect(onClick).not.toHaveBeenCalled();

      advanceTime(beforeDeadlineMs);
      clickPrimary();
      expect(onClick).toHaveBeenCalledOnce();
    }
  );

  test('requires fresh review time when a different request replaces the current request', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ApprovalPrimaryButton {...buttonProps} intent="default" onClick={onClick} />
    );
    advanceTime(clickGuardDurationMs);

    rerender(
      <ApprovalPrimaryButton
        {...buttonProps}
        intent="default"
        armKey="replacement-request"
        onClick={onClick}
      />
    );
    clickPrimary();
    expect(onClick).not.toHaveBeenCalled();

    advanceTime(clickGuardDurationMs);
    clickPrimary();
    expect(onClick).toHaveBeenCalledOnce();
  });

  test('requires a full hold after review time and invokes the action only once', () => {
    const onClick = vi.fn();
    render(
      <ApprovalPrimaryButton
        {...buttonProps}
        intent="default"
        confirmation={{ mode: 'hold' }}
        onClick={onClick}
      />
    );

    startHold();
    advanceTime(clickGuardDurationMs);
    expect(onClick).not.toHaveBeenCalled();

    startHold();
    advanceTime(holdDurationMs - beforeDeadlineMs);
    expect(onClick).not.toHaveBeenCalled();

    advanceTime(beforeDeadlineMs);
    expect(onClick).toHaveBeenCalledOnce();
    clickPrimary();
    advanceTime(animationFrameDurationMs);
    expect(onClick).toHaveBeenCalledOnce();
  });

  test('does not approve a released hold and requires a new full hold', () => {
    const onClick = vi.fn();
    render(
      <ApprovalPrimaryButton
        {...buttonProps}
        intent="default"
        confirmation={{ mode: 'hold' }}
        onClick={onClick}
      />
    );
    advanceTime(clickGuardDurationMs);
    startHold();
    advanceTime(holdDurationMs - animationFrameDurationMs);
    fireEvent.keyUp(screen.getByRole('button', { name: 'Hold to sign on ledger' }), {
      key: ' ',
    });
    advanceTime(holdDurationMs);
    expect(onClick).not.toHaveBeenCalled();

    startHold();
    advanceTime(holdDurationMs - beforeDeadlineMs);
    expect(onClick).not.toHaveBeenCalled();
    advanceTime(beforeDeadlineMs);
    expect(onClick).toHaveBeenCalledOnce();
  });

  test.each([
    { isDisabled: true, isBusy: false },
    { isDisabled: false, isBusy: true },
  ])('does not start a hold while unavailable: %j', unavailable => {
    const onClick = vi.fn();
    render(
      <ApprovalPrimaryButton
        {...buttonProps}
        intent="default"
        {...unavailable}
        confirmation={{ mode: 'hold' }}
        onClick={onClick}
      />
    );
    advanceTime(clickGuardDurationMs);
    startHold();
    advanceTime(holdDurationMs);
    expect(onClick).not.toHaveBeenCalled();
  });
});
