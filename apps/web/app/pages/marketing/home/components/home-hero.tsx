import {
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
import { StoreButtons } from '~/pages/marketing/shared/store-buttons';

import { HeroExtension, HeroPhone, type HeroView, heroViewDescriptions } from './hero-mockups';

const partners = [
  { name: 'Coinbase', src: '/marketing/home/partner-coinbase.webp', width: 140 },
  { name: 'Binance', src: '/marketing/home/partner-binance.webp', width: 140 },
  { name: 'MoonPay', src: '/marketing/home/partner-moonpay.webp', width: 140 },
  { name: 'Gate', src: '/marketing/home/partner-gate.webp', width: 106 },
];

// Entrance motion rebuilt from the Framer site's appear effects. Pure CSS, so it runs before
// hydration and without JS. Every entrance starts at opacity 0.001 rather than 0: the SSR HTML stays
// visible to crawlers and the first paint still counts for LCP. Reduced motion: no animation.
// The 900–1439px overrides are the Framer site's tablet timings.
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
// Framer's default per-word stagger for text effects (not stored in the project config)
const headlineWordStagger = 0.05;

function wordDelay(lineIndex: number, wordIndex: number) {
  const index = headlineLines.slice(0, lineIndex).flat().length + wordIndex;
  return `${Math.round((headlineStartDelay + index * headlineWordStagger) * 1000)}ms`;
}

/*
 * Verb-synced stage. The headline starts with every word in full ink and both devices on the
 * wallet home; then one verb at a time stays emphasised while the others fade back, and both
 * devices switch to that verb's screen. After Grow it rests on the full claim again and loops.
 * Each word is a toggle button: picking one shows its screen and pauses the cycle for a while;
 * picking the active word again returns to home. Reduced motion: no auto-advance, still clickable.
 */
const heroSequence: HeroView[] = ['home', 'buy', 'send', 'swap', 'earn', 'grow'];
// The first hold starts at mount; the stage drops in at about 1.65 s
const firstHoldMs = 4400;
const holdMs = 2800;
const interactionPauseMs = 8000;
const stageId = 'home-hero-stage';

function nextView(view: HeroView) {
  return heroSequence[(heroSequence.indexOf(view) + 1) % heroSequence.length] ?? 'home';
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

type HeroVariant = 'flat' | 'tilt';

// DESIGN REVIEW ONLY: `?hero=tilt` previews the tilted stage next to the default flat one.
// Remove this switch, and the losing variant's styles, once the direction is chosen.
function useHeroVariant() {
  const [variant, setVariant] = useState<HeroVariant>('flat');
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('hero') === 'tilt') setVariant('tilt');
  }, []);
  return variant;
}

// Words: full ink at rest; while a verb is active the others fall back to a lighter tone
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

// The devices: flat, as in the old hero image, or tilted back in 3D on wide screens
const rigClass = css({
  position: 'absolute',
  inset: 0,
  md: {
    '&[data-variant=tilt]': {
      transformStyle: 'preserve-3d',
      transformOrigin: '50% 40%',
      transform:
        'perspective(2400px) translate3d(1.5%, 1%, 0) rotateX(calc(14deg + var(--hero-tilt-y, 0deg))) rotateY(calc(-12deg + var(--hero-tilt-x, 0deg))) rotateZ(2.5deg) scale(0.94)',
      _motionSafe: { transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
});

const deviceShadowClass = css({
  md: {
    '[data-variant=tilt] &': {
      filter:
        'drop-shadow(0 28px 36px rgba(18, 16, 15, 0.22)) drop-shadow(0 6px 10px rgba(18, 16, 15, 0.12))',
    },
  },
});

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isAnimated = reducedMotion === false;
  const isVisible = useIsHeroVisible(sectionRef);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const { view, pick } = useHeroSequence(isAnimated && isVisible && !isKeyboardFocused);
  const variant = useHeroVariant();

  // Tilt variant: the rig leans a few degrees toward the pointer. Wide screens, motion allowed.
  function onStagePointerMove(event: PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (variant !== 'tilt' || !isAnimated || !stage || event.pointerType !== 'mouse') return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty('--hero-tilt-x', `${(x * 5).toFixed(2)}deg`);
    stage.style.setProperty('--hero-tilt-y', `${(-y * 4).toFixed(2)}deg`);
  }
  function onStagePointerLeave() {
    stageRef.current?.style.removeProperty('--hero-tilt-x');
    stageRef.current?.style.removeProperty('--hero-tilt-y');
  }

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
                    {/* Each verb shows its screen in the wallet preview below */}
                    <button
                      type="button"
                      className={wordClass}
                      aria-pressed={view === verb}
                      aria-controls={stageId}
                      data-dimmed={view !== 'home' && view !== verb}
                      style={{ animationDelay: wordDelay(lineIndex, wordIndex) }}
                      onClick={() => pick(verb)}
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
            <StoreButtons containerProps={{ mt: 'space.05', display: ['none', null, 'flex'] }} />
            <StoreButtons
              platforms={['ios', 'chrome', 'android']}
              containerProps={{ mt: 'space.05', display: ['flex', null, 'none'] }}
            />
          </Box>
        </Box>
      </Grid>

      <Box
        ref={stageRef}
        id={stageId}
        role="img"
        aria-label={heroViewDescriptions[view]}
        data-variant={variant}
        position="relative"
        overflow="hidden"
        bg="ink.border-default"
        borderRadius="sm"
        mt={['space.07', null, '86px']}
        aspectRatio={['342 / 500', null, '1196 / 615']}
        className={css({ md: { '&[data-variant=tilt]': { mt: '40px' } } })}
        onPointerMove={onStagePointerMove}
        onPointerLeave={onStagePointerLeave}
        _motionSafe={{
          animation: 'marketingDropIn 0.4s cubic-bezier(0.44, 0, 0.56, 1) 1.25s both',
          '@media (min-width: 900px) and (max-width: 1439.98px)': {
            animation: 'marketingDropIn 0.25s cubic-bezier(0.44, 0, 0.56, 1) 1s both',
          },
        }}
      >
        {/* Desktop: browser extension + phone; mobile: phone only. Placed as in the old image. */}
        <div aria-hidden className={rigClass} data-variant={variant}>
          <Box
            className={deviceShadowClass}
            display={['none', null, 'block']}
            position="absolute"
            left="7.36%"
            top="9.27%"
            width="72.4%"
          >
            <HeroExtension view={view} isAnimated={isAnimated} />
          </Box>
          <Box
            className={deviceShadowClass}
            position="absolute"
            left={['50%', null, '66.56%']}
            top={['8%', null, '22.8%']}
            width={['60%', null, '24.4%']}
            transform={['translateX(-50%)', null, 'none']}
          >
            <HeroPhone view={view} isAnimated={isAnimated} />
          </Box>
        </div>
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
