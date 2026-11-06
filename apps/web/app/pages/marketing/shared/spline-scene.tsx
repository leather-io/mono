import {
  Component,
  type ComponentType,
  type ReactNode,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { SplineProps } from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { styled } from 'leather-styles/jsx';

import { useNearViewport, usePrefersReducedMotion } from './lottie-animation';

// The Spline runtime is several hundred KB and needs WebGL, so it is code-split and only
// requested on the client, once the scene nears the viewport. The SSR branch keeps it out of the
// Worker bundle entirely.
const Spline = lazy<ComponentType<SplineProps>>(() =>
  import.meta.env.SSR
    ? Promise.resolve({ default: () => null })
    : import('@splinetool/react-spline')
);

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
  const reducedMotion = usePrefersReducedMotion();
  const motionAllowed = reducedMotion === false;
  const isNear = useNearViewport(wrapperRef, motionAllowed);
  const [app, setApp] = useState<Application | null>(null);
  const isMounted = motionAllowed && isNear;

  // The scene unmounts when reduced motion is switched on mid-session: bring the poster back
  useEffect(() => {
    if (isMounted) return;
    setApp(null);
    onReadyChange?.(false);
  }, [isMounted, onReadyChange]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!app || !wrapper) return;
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
        <SplineErrorBoundary onError={() => onReadyChange?.(false)}>
          <Suspense fallback={null}>
            <Spline
              scene={scene}
              style={{ width: '100%', height: '100%' }}
              onLoad={loaded => {
                setApp(loaded);
                onReadyChange?.(true);
              }}
            />
          </Suspense>
        </SplineErrorBoundary>
      )}
    </styled.div>
  );
}
