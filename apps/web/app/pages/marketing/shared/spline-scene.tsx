import {
  Component,
  type ComponentType,
  type ReactNode,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { SplineProps } from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { styled } from 'leather-styles/jsx';

import {
  animationLoadTimeoutMs,
  animationMaxAttempts,
  animationRetryDelayMs,
} from './animation-loading';
import { useNearViewport, usePrefersReducedMotion } from './lottie-animation';

// The Spline runtime is several hundred KB and needs WebGL, so it is code-split and only
// requested on the client, once the scene nears the viewport. The SSR branch keeps it out of the
// Worker bundle entirely.
function createSplineComponent() {
  return lazy<ComponentType<SplineProps>>(() =>
    import.meta.env.SSR
      ? Promise.resolve({ default: () => null })
      : import('@splinetool/react-spline')
  );
}

class SplineErrorBoundary extends Component<
  { children: ReactNode; onError(): void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    // On failure the poster simply stays up, which is the intended fallback
    return this.state.failed ? null : this.props.children;
  }
}

interface SplineAttemptProps {
  scene: string;
  onLoad(app: Application): void;
  onFailure(): void;
}

function SplineAttempt({ scene, onLoad, onFailure }: SplineAttemptProps) {
  const [Spline] = useState(createSplineComponent);
  const active = useRef(true);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    active.current = true;
    timeout.current = setTimeout(() => {
      active.current = false;
      onFailure();
    }, animationLoadTimeoutMs);
    return () => {
      active.current = false;
      clearTimeout(timeout.current);
    };
  }, [onFailure]);

  return (
    <Suspense fallback={null}>
      <Spline
        scene={scene}
        style={{ width: '100%', height: '100%' }}
        onLoad={loaded => {
          clearTimeout(timeout.current);
          if (active.current) onLoad(loaded);
        }}
      />
    </Suspense>
  );
}

interface SplineSceneProps {
  /** URL of the self-hosted .splinecode file. */
  scene: string;
  /** Called with true once the scene has rendered and false when it goes away, so a poster can be
      hidden and shown again. */
  onReadyChange?(ready: boolean): void;
}

/**
 * Client-only Spline scene that fills its parent. Renders nothing on the server, with
 * prefers-reduced-motion, or until it nears the viewport; pauses rendering while off screen.
 * Pointer events are off, so it never blocks the content around it.
 */
export function SplineScene({ scene, onReadyChange }: SplineSceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onReadyChangeRef = useRef(onReadyChange);
  useEffect(() => {
    onReadyChangeRef.current = onReadyChange;
  }, [onReadyChange]);
  const notifyReady = useCallback((ready: boolean) => {
    onReadyChangeRef.current?.(ready);
  }, []);
  const reducedMotion = usePrefersReducedMotion();
  const motionAllowed = reducedMotion === false;
  const isNear = useNearViewport(wrapperRef, motionAllowed);
  const [app, setApp] = useState<Application | null>(null);
  const isMounted = motionAllowed && isNear;
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const handleFailure = useCallback(() => {
    setApp(null);
    setFailed(true);
    notifyReady(false);
  }, [notifyReady]);

  const handleLoaded = useCallback(
    (loaded: Application) => {
      setApp(loaded);
      notifyReady(true);
    },
    [notifyReady]
  );

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    setApp(null);
    notifyReady(false);
  }, [scene, isMounted, notifyReady]);

  useEffect(() => {
    if (!isMounted || !failed || attempt >= animationMaxAttempts - 1) return;
    const timer = setTimeout(
      () => {
        setAttempt(previous => previous + 1);
        setFailed(false);
      },
      animationRetryDelayMs * (attempt + 1)
    );
    return () => clearTimeout(timer);
  }, [isMounted, failed, attempt]);

  // The scene unmounts when reduced motion is switched on mid-session: bring the poster back
  useEffect(() => {
    if (isMounted) return;
    setApp(null);
    notifyReady(false);
  }, [isMounted, notifyReady]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!app || !wrapper) return;
    if (typeof IntersectionObserver === 'undefined') {
      app.play();
      return () => app.stop();
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) app.play();
      else app.stop();
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [app]);

  return (
    <styled.div
      ref={wrapperRef}
      aria-hidden
      position="absolute"
      inset="0"
      pointerEvents="none"
      // The scene asks the runtime to hide the cursor; never let that leak onto the page
      css={{ '& canvas': { cursor: 'auto !important' } }}
    >
      {isMounted && (
        <SplineErrorBoundary key={`${scene}:${attempt}`} onError={handleFailure}>
          {!failed && (
            <SplineAttempt scene={scene} onLoad={handleLoaded} onFailure={handleFailure} />
          )}
        </SplineErrorBoundary>
      )}
    </styled.div>
  );
}
