import { useEffect, useRef } from 'react';

import { css } from 'leather-styles/css';

import {
  prefersReducedMotion,
  toastExitDelayMs,
  toastInOutEasing,
  toastPopEasing,
} from './toast.motion.web';

const iconSize = 24;
const iconCenter = iconSize / 2;
const ringRadius = 9;
const ringStrokeWidth = 2;
const ringCircumference = 2 * Math.PI * ringRadius;
const ringTrackOpacity = 0.3;
const checkmarkDrawDurationMs = 420;
const checkmarkPopDurationMs = toastExitDelayMs;
const checkmarkPopScale = 1.15;
const checkmarkShrinkDelayMs = toastExitDelayMs;
const checkmarkShrinkDurationMs = 180;
const checkmarkShrinkScale = 0.65;

interface ToastCountdownIconProps {
  duration: number;
  isPaused?: boolean;
  isClosing?: boolean;
  onComplete?(this: void): void;
}

export function ToastCountdownIcon({
  duration,
  isPaused = false,
  isClosing = false,
  onComplete,
}: ToastCountdownIconProps) {
  const iconRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef<SVGCircleElement>(null);
  const checkmarkRef = useRef<SVGPathElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const animation = progressRef.current?.animate(
      [{ strokeDashoffset: ringCircumference }, { strokeDashoffset: 0 }],
      { duration, easing: 'linear', fill: 'forwards' }
    );
    animationRef.current = animation ?? null;
    void animation?.finished.then(() => onCompleteRef.current?.()).catch(() => undefined);
    return () => animation?.cancel();
  }, [duration]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const animation = checkmarkRef.current?.animate(
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: checkmarkDrawDurationMs, easing: toastInOutEasing }
    );
    return () => animation?.cancel();
  }, []);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation || animation.playState === 'finished') return;
    if (isPaused) animation.pause();
    else animation.play();
  }, [isPaused]);

  useEffect(() => {
    if (!isClosing || prefersReducedMotion()) return;
    const icon = iconRef.current;
    if (!icon) return;
    icon.animate([{ transform: 'scale(1)' }, { transform: `scale(${checkmarkPopScale})` }], {
      duration: checkmarkPopDurationMs,
      easing: toastPopEasing,
      fill: 'forwards',
    });
    icon.animate(
      [
        { transform: `scale(${checkmarkPopScale})` },
        { transform: `scale(${checkmarkShrinkScale})` },
      ],
      {
        delay: checkmarkShrinkDelayMs,
        duration: checkmarkShrinkDurationMs,
        easing: toastInOutEasing,
        fill: 'forwards',
      }
    );
  }, [isClosing]);

  return (
    <svg
      ref={iconRef}
      aria-hidden
      width={iconSize}
      height={iconSize}
      viewBox={`0 0 ${iconSize} ${iconSize}`}
      fill="none"
    >
      <circle
        className={css({ stroke: 'green.action-primary-default' })}
        opacity={ringTrackOpacity}
        cx={iconCenter}
        cy={iconCenter}
        r={ringRadius}
        strokeWidth={ringStrokeWidth}
      />
      <circle
        ref={progressRef}
        className={css({ stroke: 'green.action-primary-default' })}
        cx={iconCenter}
        cy={iconCenter}
        r={ringRadius}
        strokeWidth={ringStrokeWidth}
        strokeDasharray={ringCircumference}
        strokeDashoffset={ringCircumference}
        transform={`rotate(-90 ${iconCenter} ${iconCenter})`}
      />
      <path
        ref={checkmarkRef}
        className={css({ stroke: 'green.action-primary-default' })}
        d="M8.5 13 10.5 15 15 9.5"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0}
        strokeWidth={ringStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
