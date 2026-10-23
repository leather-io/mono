import {
  type AnimationEvent,
  type ReactNode,
  type RefObject,
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex } from 'leather-styles/jsx';

import { LeatherLettermarkIcon } from '@leather.io/ui';

import {
  AccountAvatar,
  type IdentityPairRing,
  RequesterAccountPairSlot,
  RequesterIcon,
  identityPairTileSize,
} from './approval-identity';
import { type ApprovalLaunch, useApprovalOptions } from './approval-options';
import type { ApprovalAccount } from './approval-types';

type ApprovalLaunchStyle = Exclude<ApprovalLaunch, 'off'>;
type ApprovalSplashStyle = Exclude<ApprovalLaunchStyle, 'handshake'>;

export interface ApprovalIdentity {
  origin: string;
  account?: ApprovalAccount;
}

const launchStrokePath =
  'M56.5 11C56.5 11 54 16 54 16C48.5 26.83 39.69 54.89 71 65.5C100.5 75.5 148.5 52.5 144.5 25.5C141.6 5.9 107.5 -2.5 87 61.5C87 61.5 71 119.39 71 119.39C68.67 126.39 57.1 140 33.5 140C17.5 140 11 128.5 11 120.5C11 113 16.5 102 38.5 102C66.5 102 78.5 140 111 140C132 140 140 126.5 140 104.5';
const launchViewBox = '0 0 156 151';
const launchStrokeWidth = 21;
const launchPatch = { x: 39, y: 1, width: 31, height: 15 };
const launchDrawWidth = 80;
const launchMarkSize = 56;
const launchSafetyTimeoutMs = 3000;

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const handshakePairSize = 'md';
const handshakeStageScale = 1.5;
const handshakeStageHeightRatio = 0.4;
const handshakeApart = 44;
const handshakeConnectorInset = 5;
const handshakeMarkWidth = 18;
const handshakeSiteSlide = -18;
const handshakeSkeletonGap = 20;
const handshakeFallbackHeaderBottom = 72;
const handshakeReducedFadeMs = 200;
const handshakeReducedDelayMs = 60;
const handshakeFallbackFadeMs = 240;

const moveEasing = 'cubic-bezier(0.32, 0.72, 0, 1)';
const dockEasing = 'cubic-bezier(0.65, 0, 0.35, 1)';
const fadeEasing = 'cubic-bezier(0.25, 0, 0.5, 1)';

const connectTimeline = {
  total: 1950,
  markDrawEnd: 700,
  siteStart: 450,
  siteEnd: 800,
  connectorStart: 750,
  connectorEnd: 1050,
  joinStart: 1250,
  crossfadeStart: 1300,
  connectorGone: 1350,
  joinEnd: 1450,
  dockStart: 1500,
  dockEnd: 1800,
  coverStart: 1750,
};

const dockTimeline = {
  total: 560,
  dockStart: 60,
  dockEnd: 420,
  coverStart: 400,
};

const launchKeyframes = `
@keyframes approvalLaunchFade { from { opacity: 1; } to { opacity: 0; } }
@keyframes approvalLaunchDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes approvalLaunchSettleMark { from { transform: scale(1); } to { transform: scale(0.92); } }
@keyframes approvalLaunchSettleDraw { from { transform: scale(1); } to { transform: scale(0.85); } }
.approval-launch-cover-mark { animation: approvalLaunchFade 200ms cubic-bezier(0.25, 0, 0.5, 1) 250ms both; }
.approval-launch-cover-draw { animation: approvalLaunchFade 220ms cubic-bezier(0.345, 0, 0.356, 1) 720ms both; }
.approval-launch-settle-mark { animation: approvalLaunchSettleMark 200ms cubic-bezier(0.25, 0, 0.5, 1) 250ms both; }
.approval-launch-settle-draw { animation: approvalLaunchSettleDraw 220ms cubic-bezier(0.345, 0, 0.356, 1) 720ms both; }
.approval-launch-stroke { stroke-dasharray: 1 1; animation: approvalLaunchDraw 640ms cubic-bezier(0.264, 0, 0.414, 1) both; }
.approval-launch-ghost { animation: approvalLaunchFade 40ms linear 640ms both; }
@media (prefers-reduced-motion: reduce) {
  .approval-launch-cover-mark, .approval-launch-cover-draw { animation: approvalLaunchFade 150ms linear 150ms both; }
  .approval-launch-settle-mark, .approval-launch-settle-draw { animation: none; }
  .approval-launch-stroke { animation: none; stroke-dashoffset: 0; }
  .approval-launch-ghost { animation: none; opacity: 0; }
}
`;

const ghostStroke = css({ stroke: 'ink.text-non-interactive' });
const patchFill = css({ fill: 'ink.background-primary' });

const ApprovalLaunchStateContext = createContext(false);

interface ApprovalLaunchStateProviderProps {
  isLaunching: boolean;
  children: ReactNode;
}

export function ApprovalLaunchStateProvider({
  isLaunching,
  children,
}: ApprovalLaunchStateProviderProps) {
  return (
    <ApprovalLaunchStateContext.Provider value={isLaunching}>
      {children}
    </ApprovalLaunchStateContext.Provider>
  );
}

export function useApprovalLaunching() {
  return useContext(ApprovalLaunchStateContext);
}

function prefersReducedMotion() {
  try {
    return window.matchMedia(reducedMotionQuery).matches;
  } catch {
    return false;
  }
}

function useLaunchCompletion(onDone: () => void) {
  const [isDone, setIsDone] = useState(false);
  const onDoneRef = useRef(onDone);

  useLayoutEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsDone(true), launchSafetyTimeoutMs);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isDone) onDoneRef.current();
  }, [isDone]);

  const finish = useCallback(() => setIsDone(true), []);

  return { isDone, finish };
}

function LaunchDrawnMark() {
  return (
    <svg
      className="approval-launch-settle-draw"
      width={launchDrawWidth}
      viewBox={launchViewBox}
      fill="none"
      strokeWidth={launchStrokeWidth}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit={4}
    >
      <path className={`approval-launch-ghost ${ghostStroke}`} d={launchStrokePath} />
      <path
        className="approval-launch-stroke"
        d={launchStrokePath}
        pathLength={1}
        stroke="currentColor"
      />
      <rect className={patchFill} {...launchPatch} />
    </svg>
  );
}

interface SplashOverlayProps {
  launch: ApprovalSplashStyle;
  onDone(): void;
}

function SplashOverlay({ launch, onDone }: SplashOverlayProps) {
  const { isDone, finish } = useLaunchCompletion(onDone);

  function onAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) finish();
  }

  if (isDone) return null;

  return (
    <Flex
      className={`approval-launch-cover-${launch}`}
      onAnimationEnd={onAnimationEnd}
      aria-hidden
      data-approval-launch={launch}
      position="absolute"
      inset="0"
      zIndex={20}
      alignItems="center"
      justifyContent="center"
      bg="ink.background-primary"
      color="ink.text-primary"
    >
      <style>{launchKeyframes}</style>
      {launch === 'mark' && (
        <LeatherLettermarkIcon
          className="approval-launch-settle-mark"
          color="ink.text-primary"
          width={launchMarkSize}
          height={launchMarkSize}
        />
      )}
      {launch === 'draw' && <LaunchDrawnMark />}
    </Flex>
  );
}

interface LocalRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface DockTarget {
  x: number;
  y: number;
  scale: number;
  hasAccount: boolean;
}

function toLocalRect(rect: DOMRect, frame: DOMRect, scale: number): LocalRect {
  return {
    x: (rect.left - frame.left) / scale,
    y: (rect.top - frame.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

function findDockTarget(
  root: Element | null,
  frame: DOMRect,
  scale: number,
  pairHeight: number
): DockTarget | undefined {
  const header = root?.querySelector('[data-approval-zone="requester"]') ?? null;
  const pair = header?.querySelector('[data-approval-pair]') ?? null;
  if (pair) {
    const rect = toLocalRect(pair.getBoundingClientRect(), frame, scale);
    return { x: rect.x, y: rect.y, scale: rect.height / pairHeight, hasAccount: true };
  }
  const icon = header?.querySelector('[data-approval-site-icon]') ?? null;
  if (!icon) return undefined;
  const rect = toLocalRect(icon.getBoundingClientRect(), frame, scale);
  const iconScale = rect.height / identityPairTileSize(handshakePairSize);
  const siteOffset = (pairHeight - identityPairTileSize(handshakePairSize)) / 2;
  return { x: rect.x, y: rect.y - siteOffset * iconScale, scale: iconScale, hasAccount: false };
}

function headerBottom(root: Element | null, frame: DOMRect, scale: number) {
  const header = root?.querySelector('[data-approval-zone="requester"]') ?? null;
  if (!header) return handshakeFallbackHeaderBottom;
  const rect = toLocalRect(header.getBoundingClientRect(), frame, scale);
  return rect.y + rect.height;
}

function stageTransform(center: Point, dock: DockTarget, point: Point) {
  const x = center.x - dock.x - handshakeStageScale * point.x;
  const y = center.y - dock.y - handshakeStageScale * point.y;
  return `translate(${x}px, ${y}px) scale(${handshakeStageScale})`;
}

function dockTransform(dock: DockTarget) {
  return `translate(0px, 0px) scale(${dock.scale})`;
}

function at(time: number, total: number) {
  return time / total;
}

interface HandshakeElements {
  cover: HTMLDivElement;
  pair: HTMLDivElement;
  site: HTMLDivElement;
  slot?: HTMLDivElement;
  markTile?: HTMLDivElement;
  stroke?: SVGPathElement;
  avatar?: HTMLDivElement;
  connector?: HTMLDivElement;
  skeleton?: HTMLDivElement;
}

function hideElement(element?: HTMLElement | SVGElement) {
  if (element) element.style.visibility = 'hidden';
}

function runReducedMotion({ cover, pair, skeleton }: HandshakeElements) {
  hideElement(pair);
  hideElement(skeleton);
  return [
    cover.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: handshakeReducedFadeMs,
      delay: handshakeReducedDelayMs,
      easing: fadeEasing,
      fill: 'both',
    }),
  ];
}

function runFallbackFade({ cover, pair }: HandshakeElements) {
  hideElement(pair);
  return [
    cover.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: handshakeFallbackFadeMs,
      easing: fadeEasing,
      fill: 'both',
    }),
  ];
}

interface PairGeometry {
  center: Point;
  dock: DockTarget;
  width: number;
  height: number;
  slotLeft: number;
  slotWidth: number;
}

function runConnect(elements: HandshakeElements, geometry: PairGeometry) {
  const { cover, pair, site, slot, markTile, stroke, avatar, connector } = elements;
  const { center, dock, width, height, slotLeft, slotWidth } = geometry;
  const t = connectTimeline;
  const middle = height / 2;
  const alone = { x: slotLeft + slotWidth / 2 + handshakeApart, y: middle };
  const apart = { x: (slotLeft + handshakeApart + slotWidth) / 2, y: middle };
  const joined = { x: width / 2, y: middle };
  const timing: KeyframeAnimationOptions = { duration: t.total, fill: 'both' };
  const animations = [
    pair.animate(
      [
        { offset: 0, transform: stageTransform(center, dock, alone) },
        {
          offset: at(t.siteStart, t.total),
          transform: stageTransform(center, dock, alone),
          easing: moveEasing,
        },
        { offset: at(t.siteEnd, t.total), transform: stageTransform(center, dock, apart) },
        {
          offset: at(t.joinStart, t.total),
          transform: stageTransform(center, dock, apart),
          easing: moveEasing,
        },
        { offset: at(t.joinEnd, t.total), transform: stageTransform(center, dock, joined) },
        {
          offset: at(t.dockStart, t.total),
          transform: stageTransform(center, dock, joined),
          easing: dockEasing,
        },
        { offset: at(t.dockEnd, t.total), transform: dockTransform(dock) },
        { offset: 1, transform: dockTransform(dock) },
      ],
      timing
    ),
    site.animate(
      [
        { offset: 0, opacity: 0, transform: `translateX(${handshakeSiteSlide}px)` },
        {
          offset: at(t.siteStart, t.total),
          opacity: 0,
          transform: `translateX(${handshakeSiteSlide}px)`,
          easing: moveEasing,
        },
        { offset: at(t.siteEnd, t.total), opacity: 1, transform: 'translateX(0px)' },
        { offset: 1, opacity: 1, transform: 'translateX(0px)' },
      ],
      timing
    ),
    cover.animate(
      [
        { offset: 0, opacity: 1 },
        { offset: at(t.coverStart, t.total), opacity: 1, easing: fadeEasing },
        { offset: 1, opacity: 0 },
      ],
      timing
    ),
  ];
  if (slot) {
    const slotFrames: Keyframe[] = [
      { offset: 0, transform: `translateX(${handshakeApart}px)`, opacity: 1 },
      {
        offset: at(t.joinStart, t.total),
        transform: `translateX(${handshakeApart}px)`,
        opacity: 1,
        easing: moveEasing,
      },
      { offset: at(t.joinEnd, t.total), transform: 'translateX(0px)', opacity: 1 },
      { offset: at(t.dockStart, t.total), transform: 'translateX(0px)', opacity: 1 },
      {
        offset: at(t.dockEnd, t.total),
        transform: 'translateX(0px)',
        opacity: dock.hasAccount ? 1 : 0,
      },
      { offset: 1, transform: 'translateX(0px)', opacity: dock.hasAccount ? 1 : 0 },
    ];
    animations.push(slot.animate(slotFrames, timing));
  }
  if (connector) {
    animations.push(
      connector.animate(
        [
          { offset: 0, clipPath: 'inset(0 100% 0 0)', opacity: 1 },
          {
            offset: at(t.connectorStart, t.total),
            clipPath: 'inset(0 100% 0 0)',
            opacity: 1,
            easing: moveEasing,
          },
          { offset: at(t.connectorEnd, t.total), clipPath: 'inset(0 0% 0 0)', opacity: 1 },
          { offset: at(t.joinStart, t.total), clipPath: 'inset(0 0% 0 0)', opacity: 1 },
          { offset: at(t.connectorGone, t.total), clipPath: 'inset(0 0% 0 0)', opacity: 0 },
          { offset: 1, clipPath: 'inset(0 0% 0 0)', opacity: 0 },
        ],
        timing
      )
    );
  }
  if (stroke) {
    animations.push(
      stroke.animate(
        [
          { offset: 0, strokeDashoffset: 1, easing: 'cubic-bezier(0.264, 0, 0.414, 1)' },
          { offset: at(t.markDrawEnd, t.total), strokeDashoffset: 0 },
          { offset: 1, strokeDashoffset: 0 },
        ],
        timing
      )
    );
  }
  if (markTile) {
    animations.push(
      markTile.animate(
        [
          { offset: 0, opacity: 1 },
          { offset: at(t.crossfadeStart, t.total), opacity: 1, easing: fadeEasing },
          { offset: at(t.joinEnd, t.total), opacity: 0 },
          { offset: 1, opacity: 0 },
        ],
        timing
      )
    );
  }
  if (avatar) {
    animations.push(
      avatar.animate(
        [
          { offset: 0, opacity: 0 },
          { offset: at(t.crossfadeStart, t.total), opacity: 0, easing: fadeEasing },
          { offset: at(t.joinEnd, t.total), opacity: 1 },
          { offset: 1, opacity: 1 },
        ],
        timing
      )
    );
  }
  return animations;
}

function runDock(elements: HandshakeElements, geometry: PairGeometry) {
  const { cover, pair, slot, markTile, connector } = elements;
  const { center, dock, width, height } = geometry;
  const t = dockTimeline;
  const joined = { x: width / 2, y: height / 2 };
  const timing: KeyframeAnimationOptions = { duration: t.total, fill: 'both' };
  hideElement(markTile);
  hideElement(connector);
  const animations = [
    pair.animate(
      [
        { offset: 0, transform: stageTransform(center, dock, joined) },
        {
          offset: at(t.dockStart, t.total),
          transform: stageTransform(center, dock, joined),
          easing: dockEasing,
        },
        { offset: at(t.dockEnd, t.total), transform: dockTransform(dock) },
        { offset: 1, transform: dockTransform(dock) },
      ],
      timing
    ),
    cover.animate(
      [
        { offset: 0, opacity: 1 },
        { offset: at(t.coverStart, t.total), opacity: 1, easing: fadeEasing },
        { offset: 1, opacity: 0 },
      ],
      timing
    ),
  ];
  if (slot && !dock.hasAccount) {
    animations.push(
      slot.animate(
        [
          { offset: 0, opacity: 1 },
          { offset: at(t.dockStart, t.total), opacity: 1, easing: fadeEasing },
          { offset: at(t.dockEnd, t.total), opacity: 0 },
          { offset: 1, opacity: 0 },
        ],
        timing
      )
    );
  }
  return animations;
}

function readElements(refs: HandshakeRefs): HandshakeElements | undefined {
  const cover = refs.cover.current;
  const pair = refs.pair.current;
  const site = refs.site.current;
  if (!cover || !pair || !site) return undefined;
  return {
    cover,
    pair,
    site,
    slot: refs.slot.current ?? undefined,
    markTile: refs.markTile.current ?? undefined,
    stroke: refs.stroke.current ?? undefined,
    avatar: refs.avatar.current ?? undefined,
    connector: refs.connector.current ?? undefined,
    skeleton: refs.skeleton.current ?? undefined,
  };
}

interface HandshakeRefs {
  cover: RefObject<HTMLDivElement | null>;
  pair: RefObject<HTMLDivElement | null>;
  site: RefObject<HTMLDivElement | null>;
  slot: RefObject<HTMLDivElement | null>;
  markTile: RefObject<HTMLDivElement | null>;
  stroke: RefObject<SVGPathElement | null>;
  avatar: RefObject<HTMLDivElement | null>;
  connector: RefObject<HTMLDivElement | null>;
  skeleton: RefObject<HTMLDivElement | null>;
}

function createHandshakeRefs(): HandshakeRefs {
  return {
    cover: createRef<HTMLDivElement>(),
    pair: createRef<HTMLDivElement>(),
    site: createRef<HTMLDivElement>(),
    slot: createRef<HTMLDivElement>(),
    markTile: createRef<HTMLDivElement>(),
    stroke: createRef<SVGPathElement>(),
    avatar: createRef<HTMLDivElement>(),
    connector: createRef<HTMLDivElement>(),
    skeleton: createRef<HTMLDivElement>(),
  };
}

function startHandshake(elements: HandshakeElements, isConnect: boolean, hasAccount: boolean) {
  const { cover, pair, slot, connector, skeleton } = elements;
  if (prefersReducedMotion()) return runReducedMotion(elements);
  const frame = cover.getBoundingClientRect();
  const scale = cover.offsetWidth > 0 ? frame.width / cover.offsetWidth : 1;
  const root = cover.parentElement;
  const dock = findDockTarget(root, frame, scale, pair.offsetHeight);
  if (!dock) return runFallbackFade(elements);
  pair.style.left = `${dock.x}px`;
  pair.style.top = `${dock.y}px`;
  const bottom = headerBottom(root, frame, scale);
  if (skeleton) skeleton.style.top = `${bottom + handshakeSkeletonGap}px`;
  const siteWidth = identityPairTileSize(handshakePairSize);
  const slotLeft = slot ? slot.offsetLeft : siteWidth;
  const slotWidth = slot ? slot.offsetWidth : 0;
  if (connector) {
    connector.style.left = `${siteWidth + handshakeConnectorInset}px`;
    connector.style.width = `${Math.max(0, slotLeft + handshakeApart - siteWidth - handshakeConnectorInset * 2)}px`;
  }
  const geometry = {
    center: { x: cover.offsetWidth / 2, y: cover.offsetHeight * handshakeStageHeightRatio },
    dock,
    width: pair.offsetWidth,
    height: pair.offsetHeight,
    slotLeft,
    slotWidth,
  };
  if (isConnect && hasAccount) {
    hideElement(skeleton);
    return runConnect(elements, geometry);
  }
  return runDock(elements, geometry);
}

const skeletonBar = css({ bg: 'ink.component-background-default', borderRadius: 'sm' });

interface HandshakeDivPartProps {
  ref: RefObject<HTMLDivElement | null>;
}

function HandshakeSkeleton({ ref }: HandshakeDivPartProps) {
  return (
    <Box ref={ref} position="absolute" left="space.05" right="space.05" top="0" aria-hidden>
      <Box className={skeletonBar} width="72%" height="24px" />
      <Box className={skeletonBar} width="44%" height="12px" mt="space.02" />
      <Box className={skeletonBar} width="100%" height="56px" mt="space.06" borderRadius="md" />
      <Box className={skeletonBar} width="100%" height="56px" mt="space.02" borderRadius="md" />
      <Box className={skeletonBar} width="36%" height="12px" mt="space.05" />
      <Box className={skeletonBar} width="100%" height="12px" mt="space.03" />
    </Box>
  );
}

function HandshakeFooterSkeleton() {
  return (
    <Flex position="absolute" left="space.05" right="space.05" bottom="space.05" gap="space.03">
      <Box className={skeletonBar} flex="1" height="48px" />
      <Box className={skeletonBar} flex="1" height="48px" />
    </Flex>
  );
}

interface HandshakeMarkProps {
  ref: RefObject<SVGPathElement | null>;
}

function HandshakeMark({ ref }: HandshakeMarkProps) {
  return (
    <svg
      width={handshakeMarkWidth}
      viewBox={launchViewBox}
      fill="none"
      strokeWidth={launchStrokeWidth}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit={4}
    >
      <path
        ref={ref}
        d={launchStrokePath}
        pathLength={1}
        strokeDasharray="1 1"
        stroke="currentColor"
      />
      <rect className={patchFill} {...launchPatch} />
    </svg>
  );
}

function HandshakeConnector({ ref }: HandshakeDivPartProps) {
  return (
    <Box
      ref={ref}
      position="absolute"
      top="50%"
      height="2px"
      mt="-1px"
      color="ink.text-subdued"
      css={{
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1.2px)',
        backgroundSize: '5px 2px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'left center',
      }}
    />
  );
}

interface HandshakeOverlayProps {
  identity?: ApprovalIdentity;
  isConnect: boolean;
  onDone(): void;
}

function HandshakeOverlay({ identity, isConnect, onDone }: HandshakeOverlayProps) {
  const { headerSurface, containers } = useApprovalOptions();
  const { isDone, finish } = useLaunchCompletion(onDone);
  const [refs] = useState(createHandshakeRefs);
  const account = identity?.account;
  const isConnectPlay = isConnect && Boolean(account);
  const ring: IdentityPairRing =
    headerSurface === 'card' && containers === 'groups' ? 'secondary' : 'primary';
  const origin = identity?.origin;

  useLayoutEffect(() => {
    const elements = readElements(refs);
    if (!elements) return undefined;
    const animations = origin
      ? startHandshake(elements, isConnect, Boolean(account))
      : runFallbackFade(elements);
    let isActive = true;
    Promise.all(animations.map(animation => animation.finished)).then(
      () => {
        if (isActive) finish();
      },
      () => undefined
    );
    return () => {
      isActive = false;
      animations.forEach(animation => animation.cancel());
    };
  }, [refs, origin, account, isConnect, finish]);

  if (isDone) return null;

  return (
    <Box
      ref={refs.cover}
      aria-hidden
      data-approval-launch="handshake"
      data-approval-launch-kind={isConnectPlay ? 'connect' : 'dock'}
      position="absolute"
      inset="0"
      zIndex={20}
      bg="ink.background-primary"
      color="ink.text-primary"
      overflow="hidden"
    >
      {!isConnectPlay && <HandshakeSkeleton ref={refs.skeleton} />}
      {!isConnectPlay && <HandshakeFooterSkeleton />}
      {origin && (
        <Flex
          ref={refs.pair}
          position="absolute"
          left="0"
          top="0"
          alignItems="center"
          transformOrigin="0 0"
          willChange="transform"
        >
          <Box ref={refs.site} lineHeight={0}>
            <RequesterIcon origin={origin} size={identityPairTileSize(handshakePairSize)} />
          </Box>
          {isConnectPlay && <HandshakeConnector ref={refs.connector} />}
          {account && (
            <RequesterAccountPairSlot ref={refs.slot} size={handshakePairSize} ring={ring}>
              <Box ref={refs.avatar} lineHeight={0}>
                <AccountAvatar account={account} size={handshakePairSize} />
              </Box>
              {isConnectPlay && (
                <Flex
                  ref={refs.markTile}
                  position="absolute"
                  inset="0"
                  m="2px"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={1}
                  borderColor="ink.border-default"
                  bg="ink.background-primary"
                  color="ink.text-primary"
                  css={{ borderRadius: '13px' }}
                >
                  <HandshakeMark ref={refs.stroke} />
                </Flex>
              )}
            </RequesterAccountPairSlot>
          )}
        </Flex>
      )}
    </Box>
  );
}

interface ApprovalLaunchOverlayProps {
  launch: ApprovalLaunchStyle;
  identity?: ApprovalIdentity;
  isConnect: boolean;
  onDone(): void;
}

export function ApprovalLaunchOverlay({
  launch,
  identity,
  isConnect,
  onDone,
}: ApprovalLaunchOverlayProps) {
  if (launch === 'handshake' && isConnect && identity?.account) {
    return <HandshakeOverlay identity={identity} isConnect onDone={onDone} />;
  }
  if (launch === 'handshake') return <SplashOverlay launch="mark" onDone={onDone} />;
  return <SplashOverlay launch={launch} onDone={onDone} />;
}
