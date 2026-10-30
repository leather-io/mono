import { useEffect, useRef, useState } from 'react';

import { styled } from 'leather-styles/jsx';
import type { AnimationSegment } from 'lottie-web';
import { LottieFrame, useLottie } from '~/pages/marketing/shared/lottie-animation';
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
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
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
  const lottie = useLottie({ src: `${animationsPath}/spam-free.lottie.json`, segment: spamIdle });
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
      alt="A Hide spam toggle above a list of suspicious tokens"
      aspect={aspect}
    >
      {isReady && (
        <styled.button
          type="button"
          aria-pressed={hideSpam}
          aria-label="Play the Hide spam demo"
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
