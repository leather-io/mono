import { type RefObject, useEffect, useId, useRef, useState } from 'react';

import { styled } from 'leather-styles/jsx';
import { usePrefersReducedMotion } from '~/pages/marketing/shared/lottie-animation';

import { useArtClock } from './use-art-clock';

const coinImages = [
  '/marketing/apps/earning/coin-1.webp',
  '/marketing/apps/earning/coin-2.webp',
  '/marketing/apps/earning/coin-3.webp',
];

function Coin({ size, variant }: { size: number; variant: number }) {
  const href = coinImages[((variant % coinImages.length) + coinImages.length) % coinImages.length];
  return <image href={href} x={-size / 2} y={-size / 2} width={size} height={size} />;
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}
function lerp(a: number, b: number, p: number) {
  return a + (b - a) * p;
}
function easeInOutCubic(x: number) {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Staircase in a 560 × 500 viewBox: three treads rising left to right. The top block reaches past
// the right edge and every block past the bottom, so wider boxes still read as bleeding stairs.
const viewBox = { w: 560, h: 500 };
const radius = 20;
const reach = 1200;
const treads = [
  { x: 20, y: 370 },
  { x: 190, y: 245 },
  { x: 360, y: 120 },
];

// One block per tread; a block's top-right fillet meets the next block's wall, which overlaps it.
const blocks = treads.map((tread, step) => {
  const next = treads[step + 1];
  const top = [
    `M${tread.x} ${tread.y + radius} A${radius} ${radius} 0 0 1 ${tread.x + radius} ${tread.y}`,
    next
      ? `H${next.x - radius} A${radius} ${radius} 0 0 0 ${next.x} ${tread.y - radius} H${next.x + radius}`
      : `H${reach}`,
  ].join(' ');
  // Before the build-up each block sits low; the gaps between them stay wider than a fillet.
  const lowHeight = 24 + step * 32;
  return {
    path: `${top} V${reach} H${tread.x} Z`,
    drop: viewBox.h - tread.y - lowHeight,
    // The tallest block leads so the stairs never cross over while rising.
    delay: (treads.length - 1 - step) * 80,
  };
});

const buildDuration = 1000;
const buildEasing = 'cubic-bezier(0.22, 1, 0.36, 1)';
const buildTotal = buildDuration + (blocks[0]?.delay ?? 0);

// Two coins per tread, a little bigger with every step up.
const slots = treads.flatMap((tread, step) =>
  [48, 124].map((offset, i) => {
    const size = 72 + (step * 2 + i) * 6;
    return { x: tread.x + offset, y: tread.y - size / 2, size, step };
  })
);
const lastSlot = slots.length - 1;

const period = 3.2;
const hold = 1.4;
const moveDuration = 0.9;
const startAt = period * 4 + 0.4;
// The top coin leaves first and the rest follow in a wave down the stairs.
function moveDelay(slot: number) {
  return (lastSlot - slot) * 0.1;
}

interface CoinFrame {
  key: string;
  x: number;
  y: number;
  size: number;
  scale: number;
  opacity: number;
  rotate: number;
  variant: number;
  step: number;
}

function coinFrames(t: number): CoinFrame[] {
  const cycle = Math.floor(t / period);
  const local = t - cycle * period;
  const frames: CoinFrame[] = [];
  for (let slot = -1; slot <= lastSlot; slot++) {
    const coinIndex = cycle - slot;
    const p = easeInOutCubic((local - hold - moveDelay(slot)) / moveDuration);
    const arc = Math.sin(Math.PI * p);
    const from = slots[Math.max(0, slot)];
    if (!from) continue;
    const base = { key: `coin-${coinIndex}`, variant: coinIndex, step: from.step };

    if (slot === -1) {
      if (p <= 0) continue;
      frames.push({
        ...base,
        x: from.x,
        y: from.y + (1 - p) * 16,
        size: from.size,
        scale: lerp(0.4, 1, p),
        opacity: p,
        rotate: 0,
      });
      continue;
    }

    if (slot === lastSlot) {
      frames.push({
        ...base,
        x: from.x + p * 24,
        y: from.y - p * 90,
        size: from.size,
        scale: 1 + p * 0.08,
        opacity: 1 - p,
        rotate: arc * 6,
      });
      continue;
    }

    const to = slots[slot + 1];
    if (!to) continue;
    const hop = to.step === from.step ? 18 : 56;
    frames.push({
      ...base,
      x: lerp(from.x, to.x, p),
      y: lerp(from.y, to.y, p) - arc * hop,
      size: lerp(from.size, to.size, p),
      scale: 1,
      opacity: 1,
      rotate: arc * 8,
    });
  }
  return frames;
}

// The stairs start low and rise once, the first time they're mostly in view. Reduced motion skips
// straight to the finished stairs.
type BuildPhase = 'low' | 'rising' | 'built';

function useBuildPhase(ref: RefObject<HTMLElement | null>): BuildPhase {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<BuildPhase>('low');

  useEffect(() => {
    const element = ref.current;
    if (reducedMotion !== false || !element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setPhase('built');
      return;
    }
    const visibleRatio = 0.35;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || entry.intersectionRatio < visibleRatio) return;
        setPhase(current => (current === 'low' ? 'rising' : current));
        observer.disconnect();
      },
      { threshold: visibleRatio }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, reducedMotion]);

  useEffect(() => {
    if (phase !== 'rising') return;
    const timeout = setTimeout(() => setPhase('built'), buildTotal);
    return () => clearTimeout(timeout);
  }, [phase]);

  return reducedMotion ? 'built' : phase;
}

function buildStyle(phase: BuildPhase, step: number) {
  const block = blocks[step];
  if (!block) return undefined;
  if (phase === 'low') return { transform: `translateY(${block.drop}px)` };
  if (phase === 'rising')
    return { transition: `transform ${buildDuration}ms ${buildEasing} ${block.delay}ms` };
  return undefined;
}

export function EarningArt() {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useBuildPhase(ref);
  const time = useArtClock(ref, startAt, phase === 'built');
  const gradientId = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-stairs`;

  return (
    <styled.div ref={ref} aria-hidden position="absolute" inset={0} overflow="hidden">
      <styled.svg
        display="block"
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="120"
            y1="560"
            x2="560"
            y2="120"
          >
            <stop offset="0" stopColor="#FF5A1F" />
            <stop offset="0.5" stopColor="#FFA866" />
            <stop offset="1" stopColor="#FFEBDA" />
          </linearGradient>
        </defs>
        {blocks.map((block, step) => (
          <path
            key={block.path}
            d={block.path}
            fill={`url(#${gradientId})`}
            style={buildStyle(phase, step)}
          />
        ))}
        {coinFrames(time).map(coin => (
          <g key={coin.key} style={buildStyle(phase, coin.step)}>
            <g
              opacity={coin.opacity}
              transform={`translate(${coin.x} ${coin.y}) rotate(${coin.rotate}) scale(${coin.scale})`}
            >
              <Coin size={coin.size} variant={coin.variant} />
            </g>
          </g>
        ))}
      </styled.svg>
    </styled.div>
  );
}
