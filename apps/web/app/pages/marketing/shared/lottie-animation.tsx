import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { styled } from 'leather-styles/jsx';
import type { AnimationItem, AnimationSegment, LottiePlayer } from 'lottie-web';

import { loadAnimationWithRetry } from './animation-loading';

// The SVG build, not lottie_light: several home animations use Gaussian Blur and Drop Shadow,
// which only the full SVG renderer draws (as SVG filters).
async function importLottiePlayer(): Promise<LottiePlayer> {
  // Keeps lottie-web (which touches `document` on import) out of the Worker bundle
  if (import.meta.env.SSR) throw new Error('lottie-web is client-only');
  const module = await import('lottie-web/build/player/lottie_svg');
  return module.default;
}

// Loaded once, on first use
let lottiePlayer: Promise<LottiePlayer> | undefined;
function loadLottiePlayer() {
  lottiePlayer ??= importLottiePlayer().catch((error: unknown) => {
    // Let the next animation retry (e.g. a stale chunk after a deploy) instead of failing forever
    lottiePlayer = undefined;
    throw error;
  });
  return lottiePlayer;
}

interface LottieJson {
  assets?: { p?: string }[];
}

async function fetchLottieJson(src: string, signal: AbortSignal): Promise<LottieJson> {
  const response = await fetch(src, { signal });
  if (!response.ok) throw new Error(`Failed to load ${src}: ${response.status}`);
  return response.json();
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** `null` until hydrated, so server and first client render agree. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore<boolean | null>(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => null
  );
}

/** Turns true (and stays true) once the element comes within `rootMargin` of the viewport. */
export function useNearViewport(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  rootMargin = '800px 0px'
) {
  const [isNear, setIsNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!enabled || isNear || !element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNear(true);
        observer.disconnect();
      },
      { rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled, isNear, rootMargin]);
  return isNear;
}

type LottieReadinessEvent = 'DOMLoaded' | 'loaded_images' | 'data_failed' | 'error';

interface LottieReadinessItem {
  isLoaded: boolean;
  imagePreloader?: { loadedImages(): boolean } | null;
  addEventListener(name: LottieReadinessEvent, callback: () => void): () => void;
  removeEventListener(name: LottieReadinessEvent, callback: () => void): void;
}

export function waitForLottieReady(
  item: LottieReadinessItem,
  hasImages: boolean,
  signal: AbortSignal
): Promise<boolean> {
  return new Promise(resolve => {
    let domLoaded = item.isLoaded;
    let imagesLoaded = !hasImages;
    function finish(ready: boolean) {
      item.removeEventListener('DOMLoaded', markDomLoaded);
      item.removeEventListener('loaded_images', markImagesLoaded);
      item.removeEventListener('data_failed', failed);
      item.removeEventListener('error', failed);
      signal.removeEventListener('abort', failed);
      resolve(ready);
    }
    function checkReady() {
      if (domLoaded && (imagesLoaded || item.imagePreloader?.loadedImages() === true)) {
        finish(true);
      }
    }
    function markDomLoaded() {
      domLoaded = true;
      checkReady();
    }
    function markImagesLoaded() {
      imagesLoaded = true;
      checkReady();
    }
    function failed() {
      finish(false);
    }
    item.addEventListener('DOMLoaded', markDomLoaded);
    item.addEventListener('loaded_images', markImagesLoaded);
    item.addEventListener('data_failed', failed);
    item.addEventListener('error', failed);
    signal.addEventListener('abort', failed, { once: true });
    if (signal.aborted) failed();
    else checkReady();
  });
}

interface UseLottieOptions {
  /** URL of the Lottie JSON (self-hosted under /public). */
  src: string;
  loop?: boolean;
  /** Frame range to play (and loop over) instead of the whole file. */
  segment?: AnimationSegment;
  /** `cover` crops like `object-fit: cover`, `contain` letterboxes. */
  fit?: 'cover' | 'contain';
  /** Play while on screen and pause while off it. Turn off to drive playback yourself. */
  autoplay?: boolean;
}

/**
 * Loads lottie-web and the animation JSON only when the element nears the viewport, and never
 * with prefers-reduced-motion. Destroys the animation on unmount.
 */
export function useLottie({
  src,
  loop = true,
  segment,
  fit = 'cover',
  autoplay = true,
}: UseLottieOptions) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const motionAllowed = reducedMotion === false;
  const isNear = useNearViewport(wrapperRef, motionAllowed);
  const [animation, setAnimation] = useState<AnimationItem | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [segmentStart, segmentEnd] = segment ?? [];

  useEffect(() => {
    const container = containerRef.current;
    if (!motionAllowed || !isNear || !container) return;

    const abort = new AbortController();
    let item: AnimationItem | undefined;

    async function load(container: HTMLDivElement, signal: AbortSignal) {
      const [lottie, animationData] = await Promise.all([
        loadLottiePlayer(),
        fetchLottieJson(src, signal),
      ]);
      if (signal.aborted) return null;
      const animationItem = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop,
        autoplay: false,
        animationData,
        initialSegment:
          segmentStart !== undefined && segmentEnd !== undefined
            ? [segmentStart, segmentEnd]
            : undefined,
        rendererSettings: {
          preserveAspectRatio: fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet',
        },
      });

      item = animationItem;

      // Keep the poster up until bitmaps inside the animation have loaded too
      const loaded = await waitForLottieReady(
        animationItem,
        animationData.assets?.some(asset => asset.p) ?? false,
        signal
      );
      if (!loaded || signal.aborted) {
        animationItem.destroy();
        if (item === animationItem) item = undefined;
        return null;
      }
      return animationItem;
    }

    // On failure the poster simply stays up, which is the intended fallback
    async function start(container: HTMLDivElement) {
      const loaded = await loadAnimationWithRetry(signal => load(container, signal), abort.signal);
      if (!loaded || abort.signal.aborted) return;
      setAnimation(loaded);
      setIsReady(true);
    }
    void start(container);

    return () => {
      abort.abort();
      item?.destroy();
      setAnimation(null);
      setIsReady(false);
    };
  }, [motionAllowed, isNear, src, loop, segmentStart, segmentEnd, fit]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!autoplay || !animation || !wrapper) return;
    if (typeof IntersectionObserver === 'undefined') {
      animation.play();
      return () => animation.pause();
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) animation.play();
      else animation.pause();
    });
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      animation.pause();
    };
  }, [autoplay, animation]);

  return { wrapperRef, containerRef, animation, isReady, reducedMotion };
}

interface LottieFrameProps {
  lottie: Pick<ReturnType<typeof useLottie>, 'wrapperRef' | 'containerRef' | 'isReady'>;
  /** Still shown before the animation loads, without JS, and with prefers-reduced-motion. */
  poster: string;
  alt: string;
  /** CSS aspect-ratio of the visual. */
  aspect: string;
  fit?: 'cover' | 'contain';
  children?: ReactNode;
}

/** Poster image with the Lottie SVG layered on top once it has loaded. */
export function LottieFrame({
  lottie,
  poster,
  alt,
  aspect,
  fit = 'cover',
  children,
}: LottieFrameProps) {
  return (
    <styled.div
      ref={lottie.wrapperRef}
      position="relative"
      width="100%"
      style={{ aspectRatio: aspect }}
    >
      <styled.img
        src={poster}
        alt={alt}
        width="100%"
        height="100%"
        loading="lazy"
        decoding="async"
        // Hidden visually only once the animation is up, so the alt text still describes it
        style={{ objectFit: fit, opacity: lottie.isReady ? 0 : undefined }}
      />
      <styled.div
        ref={lottie.containerRef}
        aria-hidden
        position="absolute"
        inset="0"
        style={{ visibility: lottie.isReady ? 'visible' : 'hidden' }}
        css={{ '& svg': { display: 'block' } }}
      />
      {children}
    </styled.div>
  );
}

interface LottieAnimationProps extends Omit<LottieFrameProps, 'lottie' | 'children'> {
  src: string;
  segment?: AnimationSegment;
}

/** Looping Lottie that plays while on screen, with `poster` as its static fallback. */
export function LottieAnimation({ src, segment, fit, ...frameProps }: LottieAnimationProps) {
  const lottie = useLottie({ src, segment, fit });
  return <LottieFrame lottie={lottie} fit={fit} {...frameProps} />;
}
