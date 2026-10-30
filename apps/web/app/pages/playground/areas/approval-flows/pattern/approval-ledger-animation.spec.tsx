import { act } from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { LottieRefCurrentProps } from 'lottie-react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import ApprovalLedgerAnimation from './approval-ledger-animation';

const playback = vi.hoisted(() => ({
  playSegments: vi.fn(),
  goToAndStop: vi.fn(),
}));
const motionPreference = vi.hoisted(() => ({
  isReducedMotion: false,
  listeners: new Set<() => void>(),
}));

interface MockLottieProps {
  lottieRef?: { current: LottieRefCurrentProps | null };
  loop?: boolean;
  autoplay?: boolean;
  onDOMLoaded?(): void;
}

vi.mock('lottie-react', () => ({
  default({ lottieRef, loop, autoplay, onDOMLoaded }: MockLottieProps) {
    function loadAnimation() {
      if (lottieRef) {
        lottieRef.current = {
          play: vi.fn(),
          stop: vi.fn(),
          pause: vi.fn(),
          setSpeed: vi.fn(),
          goToAndStop: playback.goToAndStop,
          goToAndPlay: vi.fn(),
          setDirection: vi.fn(),
          playSegments: playback.playSegments,
          setSubframe: vi.fn(),
          getDuration: vi.fn(),
          destroy: vi.fn(),
          animationContainerRef: { current: document.createElement('div') },
          animationLoaded: true,
          animationItem: undefined,
        };
      }
      onDOMLoaded?.();
    }

    return (
      <button
        type="button"
        data-loop={String(loop)}
        data-autoplay={String(autoplay)}
        onClick={loadAnimation}
      >
        Load device animation
      </button>
    );
  },
}));

function loadAnimation() {
  fireEvent.click(screen.getByRole('button', { name: 'Load device animation' }));
}

function setReducedMotion(isReducedMotion: boolean) {
  act(() => {
    motionPreference.isReducedMotion = isReducedMotion;
    motionPreference.listeners.forEach(listener => listener());
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  motionPreference.isReducedMotion = false;
  motionPreference.listeners.clear();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return motionPreference.isReducedMotion;
    },
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener(type: string, listener: () => void) {
      if (type === 'change') motionPreference.listeners.add(listener);
    },
    removeEventListener(type: string, listener: () => void) {
      if (type === 'change') motionPreference.listeners.delete(listener);
    },
    dispatchEvent() {
      return true;
    },
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe(ApprovalLedgerAnimation.name, () => {
  test('plays only the connection segment when the active animation becomes ready', () => {
    render(<ApprovalLedgerAnimation isAnimated />);
    expect(playback.playSegments).not.toHaveBeenCalled();

    loadAnimation();

    expect(playback.playSegments).toHaveBeenCalledOnce();
    expect(playback.playSegments).toHaveBeenCalledWith([0, 93], true);
    expect(playback.goToAndStop).not.toHaveBeenCalled();
    expect(screen.getByRole('button').getAttribute('data-autoplay')).toBe('false');
    expect(screen.getByRole('button').getAttribute('data-loop')).toBe('true');
  });

  test('shows the connected frame without motion when reduced motion is requested', () => {
    motionPreference.isReducedMotion = true;
    render(<ApprovalLedgerAnimation isAnimated />);

    loadAnimation();

    expect(playback.playSegments).not.toHaveBeenCalled();
    expect(playback.goToAndStop).toHaveBeenCalledWith(90, true);
    expect(screen.getByRole('button').getAttribute('data-loop')).toBe('false');
  });

  test('stops ongoing motion when the user enables reduced motion', () => {
    render(<ApprovalLedgerAnimation isAnimated />);
    loadAnimation();
    expect(playback.playSegments).toHaveBeenCalledOnce();

    setReducedMotion(true);

    expect(playback.goToAndStop).toHaveBeenCalledWith(90, true);
    expect(playback.playSegments).toHaveBeenCalledOnce();
    expect(screen.getByRole('button').getAttribute('data-loop')).toBe('false');
  });

  test('keeps a noninteractive preview on the connected frame', () => {
    render(<ApprovalLedgerAnimation isAnimated={false} />);

    loadAnimation();
    setReducedMotion(true);
    setReducedMotion(false);

    expect(playback.playSegments).not.toHaveBeenCalled();
    expect(playback.goToAndStop).toHaveBeenCalledWith(90, true);
    expect(screen.getByRole('button').getAttribute('data-loop')).toBe('false');
  });

  test('stops playback when the active preview becomes noninteractive', () => {
    const { rerender } = render(<ApprovalLedgerAnimation isAnimated />);
    loadAnimation();

    rerender(<ApprovalLedgerAnimation isAnimated={false} />);

    expect(playback.playSegments).toHaveBeenCalledOnce();
    expect(playback.goToAndStop).toHaveBeenCalledWith(90, true);
    expect(screen.getByRole('button').getAttribute('data-loop')).toBe('false');
  });
});
