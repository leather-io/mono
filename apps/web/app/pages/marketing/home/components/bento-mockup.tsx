import { type CSSProperties, type ReactNode, type Ref, useEffect, useRef, useState } from 'react';

import { styled } from 'leather-styles/jsx';
import { usePrefersReducedMotion } from '~/pages/marketing/shared/lottie-animation';

// Every size is in pixels of the 592 × 444 card stage, converted to container units so the
// mockups scale with their card at every breakpoint.
const stageWidth = 592;

export function stagePx(px: number) {
  return `calc(${px} / ${stageWidth} * 100cqw)`;
}

export const mockupSize = {
  panelWidth: 404,
  panelHeight: 350,
  panelTop: 47,
  panelRadius: 10,
  inset: 18,
  rowHeight: 48,
  icon: 28,
} as const;

export const mockupType = {
  headline: { fontSize: stagePx(26), lineHeight: 1.15, fontWeight: 500 },
  title: { fontSize: stagePx(15), lineHeight: 1.3, fontWeight: 500 },
  body: { fontSize: stagePx(12), lineHeight: 1.35 },
  meta: { fontSize: stagePx(11), lineHeight: 1.35 },
} as const satisfies Record<string, CSSProperties>;

// Hex rather than Panda tokens: the panel stays light whatever the page theme is
export const mockupColor = {
  panel: '#FFFFFF',
  border: '#E6E4E1',
  divider: '#EFEEEC',
  text: '#12100F',
  secondary: '#8C8A87',
  positive: '#1F9A5D',
  actionPressed: '#3A3633',
  hover: '#F5F3F1',
} as const;

export const primaryText: CSSProperties = { ...mockupType.body, fontWeight: 500 };
export const secondaryText: CSSProperties = { ...mockupType.meta, color: mockupColor.secondary };

export const insetX: CSSProperties = {
  paddingLeft: stagePx(mockupSize.inset),
  paddingRight: stagePx(mockupSize.inset),
};

export const tokenIconSrc = {
  btc: '/icons/bitcoin.svg',
  stx: '/icons/stacks.svg',
  sbtc: '/icons/sbtc.svg',
} as const;

const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';

export function transitionFor(
  isAnimated: boolean,
  properties: string[],
  ms = 400,
  delayMs = 0,
  timing = ease
) {
  if (!isAnimated) return undefined;
  return properties.map(property => `${property} ${ms}ms ${timing} ${delayMs}ms`).join(', ');
}

/** Fades the bottom edge of a list that runs past its container. */
export function fadeBottom(px: number): CSSProperties {
  const mask = `linear-gradient(to bottom, #000 calc(100% - ${stagePx(px)}), transparent)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

export function StrokeIcon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: stagePx(size), height: stagePx(size), flexShrink: 0, display: 'block' }}
    >
      {children}
    </svg>
  );
}

interface TextPairProps {
  primary: ReactNode;
  secondary: ReactNode;
  align?: 'start' | 'end';
  primaryStyle?: CSSProperties;
}

/** A row's two stacked lines: the start pair fills the row, the end pair hugs its values. */
export function TextPair({ primary, secondary, align = 'start', primaryStyle }: TextPairProps) {
  const isEnd = align === 'end';
  return (
    <styled.span
      display="flex"
      flexDirection="column"
      minWidth={0}
      flex={isEnd ? undefined : 1}
      flexShrink={isEnd ? 0 : undefined}
      whiteSpace="nowrap"
      style={{ textAlign: isEnd ? 'right' : 'left', alignItems: isEnd ? 'flex-end' : 'stretch' }}
    >
      <span style={{ ...primaryText, ...primaryStyle }}>{primary}</span>
      <span style={secondaryText}>{secondary}</span>
    </styled.span>
  );
}

/** A 12 px status badge on an avatar's corner, ringed in the panel colour. */
export function StatusBadge({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <styled.span
      position="absolute"
      borderRadius="50%"
      style={{
        right: stagePx(-2),
        bottom: stagePx(-2),
        width: stagePx(12),
        height: stagePx(12),
        boxShadow: `0 0 0 ${stagePx(1.5)} ${mockupColor.panel}`,
        ...style,
      }}
    >
      {children}
    </styled.span>
  );
}

interface BentoStageProps {
  /** Describes the illustration for screen readers. */
  label: string;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/** The card's visual area; establishes the container the mockup scales against. */
export function BentoStage({ label, ref, children }: BentoStageProps) {
  return (
    <styled.div
      ref={ref}
      role="img"
      aria-label={label}
      position="relative"
      width="100%"
      overflow="hidden"
      style={{ aspectRatio: '592 / 444', containerType: 'inline-size' }}
    >
      <styled.div aria-hidden position="absolute" inset="0">
        {children}
      </styled.div>
    </styled.div>
  );
}

/** The white panel every mockup sits in. */
export function MockupPanel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <styled.div
      position="absolute"
      left="50%"
      overflow="hidden"
      style={{
        top: stagePx(mockupSize.panelTop),
        width: stagePx(mockupSize.panelWidth),
        height: stagePx(mockupSize.panelHeight),
        transform: 'translateX(-50%)',
        background: mockupColor.panel,
        border: `1px solid ${mockupColor.border}`,
        borderRadius: stagePx(mockupSize.panelRadius),
        color: mockupColor.text,
        fontFeatureSettings: '"tnum"',
        ...mockupType.body,
        ...style,
      }}
    >
      {children}
    </styled.div>
  );
}

/** Whether at least half of the element is on screen; always false while disabled. */
export function useIsHalfInView<T extends Element>(isEnabled: boolean) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!isEnabled || !element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5)),
      { threshold: 0.5 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      setIsInView(false);
    };
  }, [isEnabled]);

  return { ref, isInView };
}

/**
 * Loops a short sequence while at least half of the element is in view: steps advance by
 * `stepDelaysMs`, the last step holds for `holdMs`, then it starts over. Server render and
 * reduced motion show the last step only.
 */
export function useLoopingSequence<T extends Element>(stepDelaysMs: number[], holdMs = 2400) {
  const isAnimated = usePrefersReducedMotion() === false;
  const { ref, isInView } = useIsHalfInView<T>(isAnimated);
  const finalStep = stepDelaysMs.length;
  const [step, setStep] = useState(finalStep);
  const delaysKey = stepDelaysMs.join(',');

  useEffect(() => {
    if (!isAnimated) {
      setStep(finalStep);
      return;
    }
    if (!isInView) {
      setStep(0);
      return;
    }
    const delays = delaysKey.split(',').map(Number);
    const cycle = delays.reduce((sum, delay) => sum + delay, 0) + holdMs;
    let timers: ReturnType<typeof setTimeout>[] = [];
    function run() {
      setStep(0);
      let elapsed = 0;
      timers = delays.map((delay, index) => {
        elapsed += delay;
        return setTimeout(() => setStep(index + 1), elapsed);
      });
    }
    run();
    const loop = setInterval(run, cycle);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, [isInView, isAnimated, finalStep, delaysKey, holdMs]);

  return { ref, step, isAnimated };
}
