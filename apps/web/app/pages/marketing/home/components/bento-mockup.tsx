import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

import { styled } from 'leather-styles/jsx';
import { usePrefersReducedMotion } from '~/pages/marketing/shared/lottie-animation';

/**
 * Shared frame for the homepage bento mockups.
 *
 * Measured from the two reference Lotties, "Send and receive" and "Your tokens, at a glance",
 * on their 592 × 444 stage: a 404 × 350 white panel, 47 px from the top, with 15 px titles,
 * 12 px rows, 11 px secondary text and a 26 px headline figure. Every size below is expressed
 * in stage pixels and converted to container units, so an HTML mockup scales with its card
 * exactly like the Lottie art does at every breakpoint.
 */
const stageWidth = 592;

/** Stage pixels → container-relative length. */
export function stagePx(px: number) {
  return `calc(${px} / ${stageWidth} * 100cqw)`;
}

export const mockupSize = {
  panelWidth: 404,
  panelHeight: 350,
  panelTop: 47,
  panelRadius: 10,
  /** Horizontal padding inside the panel, as in the Send mockup. */
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

export const mockupColor = {
  panel: '#FFFFFF',
  border: '#E6E4E1',
  divider: '#EFEEEC',
  text: '#12100F',
  secondary: '#8C8A87',
  positive: '#1F9A5D',
} as const;

interface BentoStageProps {
  /** Describes the illustration for screen readers. */
  label: string;
  children: ReactNode;
}

/** The 592 × 444 card visual area; establishes the container the mockup scales against. */
export function BentoStage({ label, children }: BentoStageProps) {
  return (
    <styled.div
      role="img"
      aria-label={label}
      position="relative"
      width="100%"
      overflow="hidden"
      style={{ aspectRatio: '592 / 444', containerType: 'inline-size' }}
    >
      {/* Mockup content is decorative; the label above carries its meaning */}
      <styled.div aria-hidden position="absolute" inset="0">
        {children}
      </styled.div>
    </styled.div>
  );
}

interface MockupPanelProps {
  children: ReactNode;
  /** Stage-pixel height; defaults to the reference 350. */
  height?: number | 'auto';
  style?: CSSProperties;
}

/** The white panel every mockup sits in, at the reference size and position. */
export function MockupPanel({
  children,
  height = mockupSize.panelHeight,
  style,
}: MockupPanelProps) {
  return (
    <styled.div
      position="absolute"
      left="50%"
      overflow="hidden"
      style={{
        top: stagePx(mockupSize.panelTop),
        width: stagePx(mockupSize.panelWidth),
        height: height === 'auto' ? undefined : stagePx(height),
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

/**
 * Loops a short sequence while at least half of the element is in view, like the Lotties do:
 * steps advance by `stepDelaysMs`, the last step holds for `holdMs`, then it starts over.
 * Server render and reduced motion show the last step only.
 */
export function useLoopingSequence<T extends Element>(stepDelaysMs: number[], holdMs = 2400) {
  const ref = useRef<T>(null);
  const reducedMotion = usePrefersReducedMotion();
  const finalStep = stepDelaysMs.length;
  const [step, setStep] = useState(finalStep);
  const [isInView, setIsInView] = useState(false);
  const delaysKey = stepDelaysMs.join(',');

  useEffect(() => {
    const element = ref.current;
    if (reducedMotion !== false || !element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5)),
      { threshold: 0.5 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      setIsInView(false);
      setStep(finalStep);
    };
  }, [reducedMotion, finalStep]);

  useEffect(() => {
    if (reducedMotion !== false) return;
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
  }, [isInView, reducedMotion, delaysKey, holdMs]);

  return { ref, step, isAnimated: reducedMotion === false };
}
