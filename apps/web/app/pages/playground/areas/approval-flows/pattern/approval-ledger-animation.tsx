import { useEffect, useRef, useSyncExternalStore } from 'react';

import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

import animationData from '@leather.io/ui/assets/ledger/plugged-in-cable-bright.lottie.json';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const connectedFrame = 90;
const connectionSegment: [number, number] = [0, 93];
const fullBleedRendererSettings = {
  preserveAspectRatio: 'xMidYMid slice',
  viewBoxSize: '-1200 0 3278 480',
};

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function readServerReducedMotion() {
  return true;
}

interface ApprovalLedgerAnimationProps {
  isAnimated: boolean;
}

export default function ApprovalLedgerAnimation({ isAnimated }: ApprovalLedgerAnimationProps) {
  const player = useRef<LottieRefCurrentProps | null>(null);
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    readServerReducedMotion
  );
  const shouldPlay = isAnimated && !isReducedMotion;

  function updatePlayback() {
    if (shouldPlay) {
      player.current?.playSegments(connectionSegment, true);
    } else {
      player.current?.goToAndStop(connectedFrame, true);
    }
  }

  useEffect(() => {
    if (shouldPlay) {
      player.current?.playSegments(connectionSegment, true);
    } else {
      player.current?.goToAndStop(connectedFrame, true);
    }
  }, [shouldPlay]);

  return (
    <Lottie
      animationData={animationData}
      lottieRef={player}
      loop={shouldPlay}
      autoplay={false}
      onDOMLoaded={updatePlayback}
      rendererSettings={fullBleedRendererSettings}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
