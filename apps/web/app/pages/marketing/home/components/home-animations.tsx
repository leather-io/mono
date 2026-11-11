import { useEffect, useRef, useState } from 'react';

import { styled } from 'leather-styles/jsx';
import type { AnimationSegment } from 'lottie-web';
import {
  LottieFrame,
  useLottie,
  usePrefersReducedMotion,
} from '~/pages/marketing/shared/lottie-animation';
import { SplineScene } from '~/pages/marketing/shared/spline-scene';

export const animationsPath = '/marketing/home/animations';

/** "Decentralized swaps": six line-art coins turning on a ring (Spline, one turn per ~16 s). */
export function SwapsCoins() {
  const [isSceneReady, setIsSceneReady] = useState(false);
  return (
    <styled.div position="relative" width="100%" maxW="640px" justifySelf="center">
      <styled.img
        src="/marketing/home/swaps-coins.webp"
        alt="Hand-drawn Stacks, Bitcoin and sBTC coins tumbling through the air"
        width="100%"
        height="auto"
        style={{
          aspectRatio: '1200 / 876',
          opacity: isSceneReady ? 0 : undefined,
          transition: 'opacity 400ms ease-out',
        }}
        loading="lazy"
      />
      {/* As on leather.io: a 1.65:1 stage tilted -15° (+6° on small screens), sized so the coins
          match the poster. It overhangs the slot; pointer events are off. */}
      <styled.div
        position="absolute"
        top="50%"
        left="50%"
        width="118%"
        transform={[
          'translate(-50%, -50%) rotate(6deg)',
          null,
          'translate(-50%, -50%) rotate(-15deg)',
        ]}
        style={{ aspectRatio: '1.6517' }}
      >
        <SplineScene
          scene={`${animationsPath}/swaps-coins.splinecode`}
          onReadyChange={setIsSceneReady}
        />
      </styled.div>
    </styled.div>
  );
}

const ledgerFadeMs = 400;

/**
 * Ledger Nano drawn in line art. Plays once each time at least half of it scrolls into view,
 * fading in, and fades out and rewinds when it leaves. Reduced motion shows the finished drawing.
 */
export function LedgerAnimation() {
  const lottie = useLottie({
    src: `${animationsPath}/ledger.lottie.json`,
    loop: false,
    fit: 'contain',
    autoplay: false,
  });
  const { wrapperRef, animation, reducedMotion } = lottie;
  // `undefined` until we know motion is allowed, so the SSR still renders at full opacity
  const [isInView, setIsInView] = useState<boolean>();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (reducedMotion !== false || !wrapper) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.5)),
      { threshold: 0.5 }
    );
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      setIsInView(undefined);
    };
  }, [wrapperRef, reducedMotion]);

  useEffect(() => {
    if (!animation || isInView === undefined) return;
    if (isInView) {
      animation.goToAndPlay(0, true);
      return;
    }
    // Rewind once faded out, so the next entry draws it again from the start
    const rewind = setTimeout(() => animation.goToAndStop(0, true), ledgerFadeMs);
    return () => clearTimeout(rewind);
  }, [animation, isInView]);

  return (
    <styled.div
      style={
        isInView === undefined
          ? undefined
          : {
              opacity: isInView ? 1 : 0,
              transition: `opacity ${ledgerFadeMs}ms cubic-bezier(0.25, 1, 0.5, 1)`,
            }
      }
    >
      <LottieFrame
        lottie={lottie}
        poster="/marketing/home/ledger.svg"
        alt="Line drawing of a Ledger Nano hardware wallet plugged into a USB cable"
        aspect="680 / 374"
        fit="contain"
      />
    </styled.div>
  );
}

// Lottielab state machine of the original: Idle loops 0–1.75 s, a click plays Activate
// (2–3 s, the Hide spam switch turning on) and holds, another click goes back to Idle.
const spamIdle: AnimationSegment = [0, 175];
const spamActivate: AnimationSegment = [200, 300];

/** "Stay spam free": idle loop, plus a real toggle button that flips the Hide spam switch. */
export function SpamFreeAnimation({ aspect }: { aspect: string }) {
  const lottie = useLottie({
    src: `${animationsPath}/spam-free.lottie.json`,
    segment: spamIdle,
  });
  const { animation, isReady } = lottie;
  const [hideSpam, setHideSpam] = useState(false);
  const hasToggled = useRef(false);

  useEffect(() => {
    if (!animation || !hasToggled.current) return;
    animation.setLoop(!hideSpam);
    animation.playSegments(hideSpam ? spamActivate : spamIdle, true);
  }, [animation, hideSpam]);

  return (
    <LottieFrame
      lottie={lottie}
      poster="/marketing/home/spam-free.webp"
      alt="A stylized Hide spam control above faded sample token names"
      aspect={aspect}
    >
      {isReady && (
        <styled.button
          type="button"
          aria-pressed={hideSpam}
          aria-label="Toggle the Hide spam illustration"
          onClick={() => {
            hasToggled.current = true;
            setHideSpam(pressed => !pressed);
          }}
          position="absolute"
          inset="0"
          cursor="pointer"
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'ink.action-primary-default',
            outlineOffset: '-4px',
          }}
        />
      )}
    </LottieFrame>
  );
}

// Palette of the static mockups (the Lottie posters): light theme ink tokens
const mockup = {
  panel: '#FFFFFF',
  border: '#E5E3E1',
  text: '#12100F',
  secondary: '#5A5552',
  subdued: '#7B7572',
  muted: '#9E9996',
  chip: '#F1EFED',
  green: '#1CBA7D',
  greenText: '#00753A',
  greenChip: '#E7F8F1',
};

const mockupEase = 'cubic-bezier(0.25, 1, 0.5, 1)';

/**
 * Steps a short sequence each time at least half of the element is in view, and rewinds when it
 * leaves (as the Ledger drawing does). Server render and reduced motion show the last step.
 */
function useInViewSequence<T extends Element>(stepDelaysMs: number[]) {
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
    let elapsed = 0;
    const timers = delaysKey.split(',').map((delay, index) => {
      elapsed += Number(delay);
      return setTimeout(() => setStep(index + 1), elapsed);
    });
    return () => timers.forEach(clearTimeout);
  }, [isInView, reducedMotion, delaysKey]);

  return { ref, step, isAnimated: reducedMotion === false };
}

const mockupTextStyle = { fontFamily: 'inherit', fontFeatureSettings: '"tnum"' } as const;

function SignedCheck({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="7" fill={mockup.green} />
      <path
        d="M-3 0.2 L-0.9 2.3 L3.2 -2"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  );
}

const vaultMembers = [
  { name: 'Ana', tone: '#5546FF' },
  { name: 'Ben', tone: '#F7931A' },
  { name: 'Cleo', tone: '#5E80FF' },
];

/**
 * "Shared vaults": a 2-of-3 vault's BTC send proposal. Ana has signed; on entry Ben signs, the
 * count reaches 2 of 2 and the proposal turns Ready to broadcast. Labels follow the multisig app.
 */
export function MultisigVaultAnimation({ aspect }: { aspect: string }) {
  const { ref, step, isAnimated } = useInViewSequence<SVGSVGElement>([900, 450]);
  const benSigned = step >= 1;
  const isReady = step >= 2;
  function transition(properties: string, ms = 450) {
    if (!isAnimated) return undefined;
    return properties
      .split(',')
      .map(property => `${property.trim()} ${ms}ms ${mockupEase}`)
      .join(', ');
  }

  return (
    <svg
      ref={ref}
      viewBox="0 0 592 444"
      width="100%"
      height="auto"
      role="img"
      aria-label="A 2 of 3 vault proposal to send 0.25 BTC, signed by two of three members and ready to broadcast"
      style={{ aspectRatio: aspect, display: 'block', ...mockupTextStyle }}
    >
      <rect
        x="106.5"
        y="52.5"
        width="379"
        height="339"
        rx="10"
        fill={mockup.panel}
        stroke={mockup.border}
      />

      {/* Vault header */}
      <rect x="130" y="76" width="36" height="36" rx="8" fill={mockup.text} />
      <text x="148" y="99" textAnchor="middle" fontSize="14" fontWeight="500" fill="#FFFFFF">
        T
      </text>
      <text x="178" y="91" fontSize="13" fontWeight="500" fill={mockup.text}>
        Treasury
      </text>
      <text x="178" y="108" fontSize="11.5" fill={mockup.subdued}>
        Any 2 of 3 members can approve
      </text>
      <line x1="107" x2="485" y1="134.5" y2="134.5" stroke={mockup.border} />

      {/* Proposal */}
      <image href="/icons/bitcoin.svg" x="130" y="154" width="32" height="32" />
      <text x="174" y="167" fontSize="13" fontWeight="500" fill={mockup.text}>
        Send 0.25 BTC
      </text>
      <text x="174" y="184" fontSize="11.5" fill={mockup.subdued}>
        To bc1q…8f3k
      </text>
      <g style={{ opacity: isReady ? 0 : 1, transition: transition('opacity', 300) }}>
        <rect x="360" y="159" width="102" height="22" rx="11" fill={mockup.chip} />
        <text x="411" y="174" textAnchor="middle" fontSize="11" fill={mockup.secondary}>
          Needs signatures
        </text>
      </g>
      <g style={{ opacity: isReady ? 1 : 0, transition: transition('opacity', 300) }}>
        <rect x="350" y="159" width="112" height="22" rx="11" fill={mockup.greenChip} />
        <text x="406" y="174" textAnchor="middle" fontSize="11" fill={mockup.greenText}>
          Ready to broadcast
        </text>
      </g>

      {/* Signers */}
      <text x="130" y="226" fontSize="11" fill={mockup.subdued}>
        Signatures
      </text>
      {vaultMembers.map((member, index) => {
        const y = 250 + index * 34;
        const isSigned = index === 0 || (index === 1 && benSigned);
        return (
          <g key={member.name}>
            <circle cx="142" cy={y} r="12" fill={member.tone} />
            <text
              x="142"
              y={y + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              fill="#FFFFFF"
            >
              {member.name.charAt(0)}
            </text>
            <text x="166" y={y + 4.5} fontSize="12" fill={mockup.text}>
              {member.name}
            </text>
            <g style={{ opacity: isSigned ? 0 : 1, transition: transition('opacity', 250) }}>
              <text x="462" y={y + 4.5} textAnchor="end" fontSize="12" fill={mockup.muted}>
                Waiting
              </text>
            </g>
            <g
              style={{
                opacity: isSigned ? 1 : 0,
                transform: isSigned ? 'none' : 'translateX(6px)',
                transition: transition('opacity, transform'),
              }}
            >
              <SignedCheck x={406} y={y} />
              <text x="462" y={y + 4.5} textAnchor="end" fontSize="12" fill={mockup.text}>
                Signed
              </text>
            </g>
          </g>
        );
      })}

      {/* Threshold progress */}
      <rect x="130" y="353" width="220" height="6" rx="3" fill={mockup.chip} />
      <rect
        x="130"
        y="353"
        width="220"
        height="6"
        rx="3"
        fill={isReady ? mockup.green : mockup.text}
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'left center',
          transform: `scaleX(${benSigned ? 1 : 0.5})`,
          transition: transition('transform, fill', 500),
        }}
      />
      <text x="462" y="360.5" textAnchor="end" fontSize="11.5" fill={mockup.subdued}>
        {benSigned ? '2' : '1'} of 2 signed
      </text>
    </svg>
  );
}

const bondDetails = [
  ['Amount', '0.50 BTC'],
  ['STX stacked', '25,000 STX'],
  ['Unlocks', 'about 12 May'],
  ['Held by', 'Your key, timelock script'],
] as const;

/**
 * "Bitcoin Staking bonds": the extension's In a bond page, one active bond period with its
 * details. On entry the detail rows rise in one after another. Labels follow the extension.
 */
export function BondPositionsAnimation({ aspect }: { aspect: string }) {
  const { ref, step, isAnimated } = useInViewSequence<SVGSVGElement>([250]);
  const isShown = step >= 1;
  function rowStyle(index: number) {
    const delay = `${index * 90}ms`;
    return {
      opacity: isShown ? 1 : 0,
      transform: isShown ? 'none' : 'translateY(8px)',
      transition: isAnimated
        ? `opacity 450ms ${mockupEase} ${delay}, transform 450ms ${mockupEase} ${delay}`
        : undefined,
    };
  }

  return (
    <svg
      ref={ref}
      viewBox="0 0 592 444"
      width="100%"
      height="auto"
      role="img"
      aria-label="The extension's In a bond balance: 0.50 BTC in an active bond period, with its STX stacked, unlock date and timelock"
      style={{ aspectRatio: aspect, display: 'block', ...mockupTextStyle }}
    >
      <rect
        x="106.5"
        y="52.5"
        width="379"
        height="339"
        rx="10"
        fill={mockup.panel}
        stroke={mockup.border}
      />

      {/* Balance header */}
      <text x="130" y="88" fontSize="12" fontWeight="500" fill={mockup.text}>
        In a bond
      </text>
      <g transform="translate(200 84)" fill="none" stroke={mockup.subdued}>
        <circle r="6" strokeWidth="1.2" />
        <path d="M0 -0.5 V3" strokeWidth="1.3" strokeLinecap="round" />
        <circle cy="-2.8" r="0.4" fill={mockup.subdued} />
      </g>
      <text x="130" y="122" fontSize="22" fontWeight="500" fill={mockup.text}>
        0.50 BTC
      </text>
      <image href="/icons/bitcoin.svg" x="422" y="72" width="40" height="40" />
      <line x1="107" x2="485" y1="146.5" y2="146.5" stroke={mockup.border} />

      {/* Bond period */}
      <text x="130" y="180" fontSize="13" fontWeight="500" fill={mockup.text}>
        Period 14
      </text>
      <rect x="194" y="166" width="46" height="20" rx="10" fill={mockup.chip} />
      <text x="217" y="180" textAnchor="middle" fontSize="11" fill={mockup.secondary}>
        Active
      </text>
      <path
        d="M455 179 L459.5 174.5 L464 179"
        transform="translate(-2 0)"
        stroke={mockup.subdued}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {bondDetails.map(([label, value], index) => {
        const y = 214 + index * 28;
        return (
          <g key={label} style={rowStyle(index)}>
            <text x="130" y={y} fontSize="12" fill={mockup.subdued}>
              {label}
            </text>
            <text x="462" y={y} textAnchor="end" fontSize="12" fill={mockup.text}>
              {value}
            </text>
          </g>
        );
      })}

      <g style={rowStyle(bondDetails.length)}>
        <line x1="107" x2="485" y1="320.5" y2="320.5" stroke={mockup.border} />
        <text x="130" y="358" fontSize="12" fontWeight="500" fill={mockup.text}>
          Manage in Bitcoin Staking
        </text>
        <g
          transform="translate(289 348)"
          stroke={mockup.text}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M5 0 H10 V5" />
          <path d="M10 0 L4.5 5.5" />
          <path d="M7.5 7 V10 H0 V2.5 H3" />
        </g>
      </g>
    </svg>
  );
}
