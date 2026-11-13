import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { usePrefersReducedMotion } from '~/pages/marketing/shared/lottie-animation';
import { trackMarketingEvent } from '~/pages/marketing/shared/marketing-analytics';
import { StoreButtons } from '~/pages/marketing/shared/store-buttons';

import {
  HeroExtension,
  HeroPhone,
  type HeroView,
  heroViewDescriptions,
  heroViews,
} from './hero-mockups';

const partners = [
  { name: 'Coinbase', src: '/marketing/home/partner-coinbase.webp', width: 140 },
  { name: 'Binance', src: '/marketing/home/partner-binance.webp', width: 140 },
  { name: 'MoonPay', src: '/marketing/home/partner-moonpay.webp', width: 140 },
  { name: 'Gate', src: '/marketing/home/partner-gate.webp', width: 106 },
];

// Entrances are pure CSS, so they run before hydration and without JS. They start at opacity
// 0.001 rather than 0 so the first paint still counts for LCP.
type HeroVerb = Exclude<HeroView, 'home'>;
const headlineLines: { verb: HeroVerb; word: string }[][] = [
  [
    { verb: 'buy', word: 'Buy.' },
    { verb: 'send', word: 'Send.' },
  ],
  [
    { verb: 'swap', word: 'Swap.' },
    { verb: 'earn', word: 'Earn.' },
  ],
  [{ verb: 'grow', word: 'Grow.' }],
];
const headlineStartDelay = 0.4;
const headlineWordStagger = 0.05;

function wordDelay(lineIndex: number, wordIndex: number) {
  const index = headlineLines.slice(0, lineIndex).flat().length + wordIndex;
  return `${Math.round((headlineStartDelay + index * headlineWordStagger) * 1000)}ms`;
}

/*
 * The devices cycle through the verbs' screens, emphasising the active verb. Each word is a
 * toggle: picking one shows its screen and pauses the cycle; picking it again returns to home.
 * Reduced motion: no auto-advance, still clickable.
 */
const firstHoldMs = 4400;
const holdMs = 2800;
const interactionPauseMs = 8000;
const stageId = 'home-hero-stage';

function nextView(view: HeroView) {
  return heroViews[(heroViews.indexOf(view) + 1) % heroViews.length] ?? 'home';
}

function useHeroSequence(isEnabled: boolean) {
  const [view, setView] = useState<HeroView>('home');
  const [hasStarted, setHasStarted] = useState(false);
  // Bumped by every pick, so a repeat pick restarts the pause
  const [pickCount, setPickCount] = useState(0);

  useEffect(() => {
    if (!isEnabled) return;
    let delay = hasStarted ? holdMs : firstHoldMs;
    if (pickCount > 0) delay = interactionPauseMs;
    const timer = setTimeout(() => {
      setHasStarted(true);
      setPickCount(0);
      setView(nextView);
    }, delay);
    return () => clearTimeout(timer);
  }, [isEnabled, view, hasStarted, pickCount]);

  function pick(verb: HeroVerb) {
    setHasStarted(true);
    setPickCount(count => count + 1);
    setView(current => (current === verb ? 'home' : verb));
  }

  return { view, pick };
}

/** Auto-advance only while the hero is on screen and the tab is visible. */
function useIsHeroVisible(ref: RefObject<HTMLElement | null>) {
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsInView(Boolean(entry?.isIntersecting))
    );
    observer.observe(element);
    function onVisibility() {
      setIsPageVisible(document.visibilityState === 'visible');
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ref]);
  return isInView && isPageVisible;
}

const wordClass = css({
  display: 'inline-block',
  font: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  color: 'ink.text-primary',
  bg: 'transparent',
  border: 'none',
  p: 0,
  borderRadius: 'xs',
  textAlign: 'left',
  transition: 'color 400ms cubic-bezier(0.25, 1, 0.5, 1)',
  '&[data-dimmed=true]': { color: 'ink.text-non-interactive' },
  '&[data-dimmed=true]:hover': { color: 'ink.text-subdued' },
  _focusVisible: { outline: '3px solid', outlineColor: 'blue.border', outlineOffset: '4px' },
  _motionSafe: {
    animation: 'marketingWordIn 0.2s cubic-bezier(0.12, 0.23, 0.5, 1) both',
  },
});

const rigClass = css({
  position: 'absolute',
  inset: 0,
  md: {
    transformStyle: 'preserve-3d',
    transformOrigin: '50% 40%',
    transform:
      'perspective(2400px) translate3d(1.5%, 1%, 0) rotateX(14deg) rotateY(-12deg) rotateZ(2.5deg) scale(0.94)',
  },
});

const deviceShadowClass = css({
  md: {
    filter:
      'drop-shadow(0 28px 36px rgba(18, 16, 15, 0.22)) drop-shadow(0 6px 10px rgba(18, 16, 15, 0.12))',
  },
});

/*
 * Entrance: the stage opens top to bottom while the devices rise in. The SSR markup starts
 * closed ("pending"); without JS the <noscript> rule below opens it, and reduced motion never
 * applies the closed state.
 */
type Entrance = 'pending' | 'run';
const revealMs = 850;
const revealEase = 'cubic-bezier(0.22, 1, 0.36, 1)';
const entranceStartMs = 1000;

const stageClass = css({
  _motionSafe: {
    '&[data-entrance=pending]': { clipPath: 'inset(0 0 100% 0)' },
    '&[data-entrance=run]': {
      clipPath: 'inset(0 0 0 0)',
      transition: `clip-path ${revealMs}ms ${revealEase}`,
    },
  },
});

const riseClass = css({
  _motionSafe: {
    '[data-entrance=pending] &': { transform: 'translate3d(0, 42%, 0)' },
    '[data-entrance=run] &': {
      transform: 'none',
      transition: 'transform 1150ms cubic-bezier(0.16, 1, 0.3, 1) var(--hero-rise-delay, 0ms)',
    },
  },
});

type RiseStyle = CSSProperties & Record<'--hero-rise-delay', string>;
const extensionRise: RiseStyle = { '--hero-rise-delay': '180ms' };
const phoneRise: RiseStyle = { '--hero-rise-delay': '360ms' };

const noScriptStyles = `<style>#${stageId}{clip-path:none!important}#${stageId} [data-rise]{transform:none!important}</style>`;

function useEntrance(targetRef: RefObject<HTMLElement | null>) {
  const [entrance, setEntrance] = useState<Entrance>('pending');
  useEffect(() => {
    const target = targetRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      setEntrance('run');
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        // On load, let the headline lead; scrolled into view later, start at once
        timer = setTimeout(
          () => setEntrance('run'),
          Math.max(0, entranceStartMs - performance.now())
        );
      },
      { threshold: 0.15 }
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [targetRef]);
  return entrance;
}

// The devices turn slightly towards the mouse, smoothed on requestAnimationFrame
const tiltDegrees = { extension: 3, phone: 4.5 };
const tiltPerspective = '1800px';
const tiltLerp = 0.08;

function useTilt(isEnabled: boolean) {
  const extensionRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    []
  );

  function apply() {
    const { x, y } = current.current;
    for (const [element, degrees] of [
      [extensionRef.current, tiltDegrees.extension],
      [phoneRef.current, tiltDegrees.phone],
    ] as const) {
      if (!element) continue;
      element.style.transform = `perspective(${tiltPerspective}) rotateX(${(-y * degrees).toFixed(3)}deg) rotateY(${(x * degrees).toFixed(3)}deg)`;
    }
  }

  function tick() {
    const next = current.current;
    next.x += (target.current.x - next.x) * tiltLerp;
    next.y += (target.current.y - next.y) * tiltLerp;
    const isSettled =
      Math.abs(target.current.x - next.x) < 0.0005 && Math.abs(target.current.y - next.y) < 0.0005;
    if (isSettled) {
      next.x = target.current.x;
      next.y = target.current.y;
    }
    apply();
    frame.current = isSettled ? null : requestAnimationFrame(tick);
  }

  function setTarget(x: number, y: number) {
    target.current = { x, y };
    frame.current ??= requestAnimationFrame(tick);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isEnabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    // -1…1 from the stage centre
    setTarget(
      ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      ((event.clientY - rect.top) / rect.height - 0.5) * 2
    );
  }

  function onPointerLeave() {
    if (!isEnabled) return;
    setTarget(0, 0);
  }

  return { extensionRef, phoneRef, onPointerMove, onPointerLeave };
}

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isAnimated = reducedMotion === false;
  const isVisible = useIsHeroVisible(sectionRef);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const { view, pick } = useHeroSequence(isAnimated && isVisible && !isKeyboardFocused);
  const entrance = useEntrance(revealRef);
  const { extensionRef, phoneRef, onPointerMove, onPointerLeave } = useTilt(isAnimated);

  function onWordKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Tab') setIsKeyboardFocused(true);
  }

  return (
    <styled.section ref={sectionRef} aria-labelledby="home-hero-heading">
      <Grid
        gridTemplateColumns={['1fr', null, null, '1fr 1fr']}
        gap={['space.05', null, null, 'space.07']}
        mt={['space.07', null, 'space.08']}
      >
        <styled.h1
          id="home-hero-heading"
          textStyle="display.02"
          fontSize={['56px', '64px', '68px']}
          lineHeight={['50px', '56px', '60px']}
        >
          {headlineLines.map((line, lineIndex) => (
            <Fragment key={line.map(({ word }) => word).join(' ')}>
              {lineIndex > 0 && ' '}
              <styled.span display="block">
                {line.map(({ verb, word }, wordIndex) => (
                  <Fragment key={verb}>
                    {wordIndex > 0 && ' '}
                    <button
                      type="button"
                      className={wordClass}
                      aria-pressed={view === verb}
                      aria-controls={stageId}
                      data-dimmed={view !== 'home' && view !== verb}
                      style={{ animationDelay: wordDelay(lineIndex, wordIndex) }}
                      onClick={() => {
                        pick(verb);
                        trackMarketingEvent('hero_word_clicked', { word: verb });
                      }}
                      onKeyUp={onWordKeyUp}
                      onBlur={() => setIsKeyboardFocused(false)}
                    >
                      {word}
                    </button>
                  </Fragment>
                ))}
              </styled.span>
            </Fragment>
          ))}
        </styled.h1>
        <Box id="download" scrollMarginTop="space.07">
          <styled.p
            textStyle="heading.04"
            fontWeight="400"
            fontSize={['24px', null, '26px']}
            _motionSafe={{
              animation: 'marketingAppear 0.4s cubic-bezier(0.5, 0, 0.88, 0.77) 0.75s both',
              '@media (min-width: 900px) and (max-width: 1439.98px)': {
                animation: 'marketingAppear 0.3s cubic-bezier(0.5, 0, 0.88, 0.77) 0.65s both',
              },
            }}
          >
            Your Bitcoin and Stacks wallet. Manage your assets, connect to apps, and explore Bitcoin
            DeFi on mobile and in your browser.
          </styled.p>
          <Box
            _motionSafe={{
              animation: 'marketingAppear 0.4s cubic-bezier(0.44, 0, 0.56, 1) 0.5s both',
            }}
          >
            <StoreButtons
              section="home_hero"
              containerProps={{ mt: 'space.05', display: ['none', null, 'flex'] }}
            />
            <StoreButtons
              section="home_hero"
              platforms={['ios', 'chrome', 'android']}
              containerProps={{ mt: 'space.05', display: ['flex', null, 'none'] }}
            />
          </Box>
        </Box>
      </Grid>

      <noscript dangerouslySetInnerHTML={{ __html: noScriptStyles }} />
      {/* Observed for the entrance, since the stage itself is clipped shut until it opens */}
      <Box ref={revealRef} mt={['space.07', null, '40px']}>
        <Box
          id={stageId}
          role="img"
          aria-label={heroViewDescriptions[view]}
          data-entrance={entrance}
          className={stageClass}
          position="relative"
          overflow="hidden"
          bg="ink.border-default"
          borderRadius="md"
          aspectRatio={['342 / 500', null, '1196 / 615']}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          <div aria-hidden className={rigClass}>
            <Box
              display={['none', null, 'block']}
              position="absolute"
              left="3.5%"
              top="7.5%"
              width="68%"
            >
              <div data-rise className={riseClass} style={extensionRise}>
                <div ref={extensionRef} className={deviceShadowClass}>
                  <HeroExtension view={view} isAnimated={isAnimated} />
                </div>
              </div>
            </Box>
            <Box
              position="absolute"
              left={['50%', null, '69.5%']}
              top={['8%', null, '19%']}
              width={['60%', null, '23.5%']}
              transform={['translateX(-50%)', null, 'none']}
            >
              <div data-rise className={riseClass} style={phoneRise}>
                <div ref={phoneRef} className={deviceShadowClass}>
                  <HeroPhone view={view} isAnimated={isAnimated} />
                </div>
              </div>
            </Box>
          </div>
        </Box>
      </Box>

      <Flex
        flexDir={['column', null, 'row']}
        justifyContent="space-between"
        alignItems={[null, null, 'center']}
        gap={['space.03', null, 'space.05']}
        mt={['space.07', null, 'space.05']}
      >
        <styled.p textStyle="caption.01" color="ink.text-secondary" maxW="160px">
          Buy instantly through trusted partners.
        </styled.p>
        <styled.ul
          aria-label="Partners"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={['space.02', null, 'space.09']}
          flex={[null, null, '0 1 794px']}
        >
          {partners.map(partner => (
            <styled.li key={partner.name} flexShrink={1} minW={0}>
              <styled.img
                src={partner.src}
                alt={partner.name}
                style={{ width: partner.width }}
                maxW="100%"
                height="auto"
                loading="lazy"
              />
            </styled.li>
          ))}
        </styled.ul>
      </Flex>
    </styled.section>
  );
}
