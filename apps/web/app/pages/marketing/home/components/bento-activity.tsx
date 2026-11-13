import { type CSSProperties, useEffect, useState } from 'react';

import { styled } from 'leather-styles/jsx';
import { usePrefersReducedMotion } from '~/pages/marketing/shared/lottie-animation';

import {
  BentoStage,
  MockupPanel,
  StatusBadge,
  TextPair,
  fadeBottom,
  mockupColor,
  mockupSize,
  mockupType,
  primaryText,
  secondaryText,
  stagePx,
  tokenIconSrc,
  transitionFor,
  useIsHalfInView,
} from './bento-mockup';

const durationMs = 520;

/**
 * A list that never rewinds: every `intervalMs` while half the element is in view, one more item
 * arrives at the top, keyed by its arrival number and drawn from a repeating queue. For
 * `settleMs` after each arrival the newest item is still pending.
 */
function useConveyor<T extends Element>(intervalMs: number, settleMs = 0) {
  const isAnimated = usePrefersReducedMotion() === false;
  const { ref, isInView } = useIsHalfInView<T>(isAnimated);
  const [arrived, setArrived] = useState(0);
  const [isSettled, setIsSettled] = useState(true);

  useEffect(() => {
    if (!isAnimated || !isInView) return;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    function advance() {
      setArrived(count => count + 1);
      if (settleMs <= 0) return;
      setIsSettled(false);
      settleTimer = setTimeout(() => setIsSettled(true), settleMs);
    }
    // The first arrival comes quickly so the card is already moving when it is noticed
    const firstTimer = setTimeout(advance, 500);
    const loop = setInterval(advance, intervalMs);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(loop);
      clearTimeout(settleTimer);
      setIsSettled(true);
    };
  }, [isInView, isAnimated, intervalMs, settleMs]);

  return { ref, arrived, isSettled, isAnimated };
}

/** Arrival numbers on screen, newest first: the next one waiting above, then `visible`, then one leaving. */
function conveyorSlots(arrived: number, visible: number) {
  return Array.from({ length: visible + 2 }, (_, index) => {
    const arrival = arrived + 1 - index;
    return { arrival, position: index - 1 };
  });
}

function fromQueue<T>(queue: T[], arrival: number) {
  const length = queue.length;
  return queue[((arrival % length) + length) % length];
}

type Token = keyof typeof tokenIconSrc;
type Indicator = 'pending' | 'sent' | 'received' | 'swap';

// Drawn as in packages/ui/src/assets/icons/activity/*.svg
const arrowGlyph = {
  sent: <path d="M5.88 10.12 10.12 5.88M5.88 5.88h4.24v4.24" />,
  received: <path d="M5.88 5.88l4.24 4.24M5.88 10.12h4.24V5.88" />,
  swap: <path d="M4 9c.84 2.35 4.16 2.35 5 0M12 7c-.84-2.35-4.16-2.35-5 0" />,
} as const;

function Glyph({ indicator, fill }: { indicator: Exclude<Indicator, 'pending'>; fill: string }) {
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%">
      <circle cx="8" cy="8" r="8" fill={fill} />
      <g fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {arrowGlyph[indicator]}
      </g>
    </svg>
  );
}

/** pending.svg, turning while it waits. */
function PendingGlyph({ isAnimated }: { isAnimated: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%">
      <circle cx="8" cy="8" r="8" fill="#FFFFFF" />
      <g fill="none" stroke={mockupColor.text} strokeWidth="2">
        {/* Three quarter-arcs stepping up in opacity stand in for the conic tail */}
        <path d="M8 1.25A6.75 6.75 0 0 1 14.75 8" strokeOpacity="0.15" />
        <path d="M14.75 8A6.75 6.75 0 0 1 8 14.75" strokeOpacity="0.45" />
        <path d="M8 14.75A6.75 6.75 0 0 1 1.25 8" strokeLinecap="round" />
        {isAnimated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 8 8"
            to="360 8 8"
            dur="0.9s"
            repeatCount="indefinite"
          />
        )}
      </g>
    </svg>
  );
}

function TokenIcon({ token, size, style }: { token: Token; size: number; style?: CSSProperties }) {
  return (
    <styled.img
      src={tokenIconSrc[token]}
      alt=""
      position="absolute"
      borderRadius="50%"
      style={{ width: stagePx(size), height: stagePx(size), ...style }}
    />
  );
}

/** ActivityAvatarIcon: the asset, or a pair for swaps, with a status badge. */
function ActivityAvatar({
  token,
  swapFrom,
  indicator,
  isPending,
  isAnimated,
}: {
  token: Token;
  swapFrom?: Token;
  indicator: Exclude<Indicator, 'pending'>;
  isPending: boolean;
  isAnimated: boolean;
}) {
  const size = mockupSize.icon;
  return (
    <styled.span
      position="relative"
      flexShrink="0"
      style={{ width: stagePx(size), height: stagePx(size) }}
    >
      <styled.span
        position="absolute"
        inset="0"
        style={{
          opacity: isPending ? 0.4 : 1,
          transition: transitionFor(isAnimated, ['opacity'], durationMs),
        }}
      >
        {swapFrom ? (
          <>
            <TokenIcon token={swapFrom} size={19} style={{ left: 0, top: 0, opacity: 0.6 }} />
            <TokenIcon
              token={token}
              size={19}
              style={{
                right: 0,
                bottom: 0,
                boxShadow: `0 0 0 ${stagePx(1.5)} ${mockupColor.panel}`,
              }}
            />
          </>
        ) : (
          <TokenIcon token={token} size={size} style={{ inset: 0 }} />
        )}
      </styled.span>
      <StatusBadge
        style={{
          opacity: isPending ? 0 : 1,
          transition: transitionFor(isAnimated, ['opacity'], durationMs),
        }}
      >
        <Glyph indicator={indicator} fill={mockupColor.text} />
      </StatusBadge>
      <StatusBadge
        style={{
          opacity: isPending ? 1 : 0,
          transition: transitionFor(isAnimated, ['opacity'], durationMs),
        }}
      >
        <PendingGlyph isAnimated={isAnimated && isPending} />
      </StatusBadge>
    </styled.span>
  );
}

interface ActivityItem {
  token: Token;
  swapFrom?: Token;
  pendingTitle: string;
  title: string;
  indicator: Exclude<Indicator, 'pending'>;
  amount: string;
  value: string;
  isPositive?: boolean;
}

const activityQueue: ActivityItem[] = [
  {
    token: 'btc',
    pendingTitle: 'Sending',
    title: 'Sent',
    indicator: 'sent',
    amount: '−0.0006 BTC',
    value: '$45.12',
  },
  {
    token: 'sbtc',
    pendingTitle: 'Receiving',
    title: 'Received',
    indicator: 'received',
    amount: '+0.001 sBTC',
    value: '$75.20',
    isPositive: true,
  },
  {
    token: 'sbtc',
    swapFrom: 'stx',
    pendingTitle: 'Swapping via Bitflow',
    title: 'Swapped via Bitflow',
    indicator: 'swap',
    amount: '+0.00064 sBTC',
    value: '$48.13',
  },
  {
    token: 'stx',
    pendingTitle: 'Receiving',
    title: 'Received',
    indicator: 'received',
    amount: '+100 STX',
    value: '$40.30',
    isPositive: true,
  },
  {
    token: 'stx',
    pendingTitle: 'Stacking via Stacking DAO',
    title: 'Stacked via Stacking DAO',
    indicator: 'sent',
    amount: '−1,000 STX',
    value: '$403.00',
  },
  {
    token: 'btc',
    pendingTitle: 'Receiving',
    title: 'Received',
    indicator: 'received',
    amount: '+0.0025 BTC',
    value: '$188.00',
    isPositive: true,
  },
  {
    token: 'sbtc',
    pendingTitle: 'Sending',
    title: 'Sent',
    indicator: 'sent',
    amount: '−0.0004 sBTC',
    value: '$30.08',
  },
  {
    token: 'stx',
    swapFrom: 'sbtc',
    pendingTitle: 'Swapping via Bitflow',
    title: 'Swapped via Bitflow',
    indicator: 'swap',
    amount: '+93 STX',
    value: '$37.48',
  },
];

// By row, so each item ages as newer activity pushes it down
const activityTimes = ['Just now', '3m ago', '12m ago', '41m ago', '1h ago', '2h ago', '3h ago'];

const activityHeader = 62;
const activityRowHeight = mockupSize.rowHeight;
const activityVisibleRows = 6;

function ActivityRowView({
  item,
  position,
  isPending,
  isAnimated,
}: {
  item: ActivityItem;
  /** −1 waits above the list, 0 is the newest row, `activityVisibleRows` is leaving */
  position: number;
  isPending: boolean;
  isAnimated: boolean;
}) {
  const isVisible = position >= 0 && position < activityVisibleRows;
  const amountColor = !isPending && item.isPositive ? mockupColor.positive : mockupColor.text;
  return (
    <styled.div
      position="absolute"
      left="0"
      right="0"
      display="flex"
      alignItems="center"
      style={{
        top: 0,
        height: stagePx(activityRowHeight),
        paddingInline: stagePx(mockupSize.inset),
        gap: stagePx(12),
        transform: `translateY(${stagePx(Math.max(position, 0) * activityRowHeight)}) scale(${position < 0 ? 0.97 : 1})`,
        opacity: isVisible ? 1 : 0,
        transition: transitionFor(isAnimated, ['transform', 'opacity'], durationMs),
      }}
    >
      <ActivityAvatar
        token={item.token}
        swapFrom={item.swapFrom}
        indicator={item.indicator}
        isPending={isPending}
        isAnimated={isAnimated}
      />
      <TextPair
        primary={isPending ? item.pendingTitle : item.title}
        secondary={isPending ? 'Pending' : activityTimes[Math.max(position, 0)]}
      />
      <TextPair
        primary={item.amount}
        secondary={item.value}
        align="end"
        primaryStyle={{
          color: amountColor,
          transition: transitionFor(isAnimated, ['color'], durationMs),
        }}
      />
    </styled.div>
  );
}

/** The mobile Activity list (apps/mobile/src/features/activity): new items arrive pending, then settle. */
export function ActivityMockup() {
  const { ref, arrived, isSettled, isAnimated } = useConveyor<HTMLDivElement>(2800, 1500);

  return (
    <BentoStage
      ref={ref}
      label="The Activity list: new sends, receives, Bitflow swaps and stacking arrive at the top as pending, then confirm"
    >
      <MockupPanel>
        <styled.div
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ height: stagePx(activityHeader), ...mockupType.title }}
        >
          Activity
        </styled.div>
        <styled.div
          position="absolute"
          left="0"
          right="0"
          bottom="0"
          overflow="hidden"
          style={{ top: stagePx(activityHeader), ...fadeBottom(20) }}
        >
          {conveyorSlots(arrived, activityVisibleRows).map(({ arrival, position }) => (
            <ActivityRowView
              key={arrival}
              item={fromQueue(activityQueue, arrival)}
              position={position}
              isPending={position < 0 || (position === 0 && !isSettled)}
              isAnimated={isAnimated}
            />
          ))}
        </styled.div>
      </MockupPanel>
    </BentoStage>
  );
}

interface BtcNotification {
  isSender: boolean;
  account: number;
  btc: string;
  usd: string;
}

// Copy as the extension's Bitcoin transaction monitor sends it
const notificationQueue: BtcNotification[] = [
  { isSender: false, account: 1, btc: '0.0042', usd: '315.83' },
  { isSender: true, account: 2, btc: '0.0008', usd: '60.16' },
  { isSender: false, account: 3, btc: '0.0125', usd: '939.96' },
  { isSender: false, account: 1, btc: '0.00021', usd: '15.79' },
  { isSender: true, account: 1, btc: '0.003', usd: '225.59' },
  { isSender: false, account: 2, btc: '0.0015', usd: '112.80' },
];

const notificationTimes = ['now', '2m ago', '9m ago', '24m ago', '1h ago', '2h ago'];

const notificationHeight = 68;
const notificationGap = 10;
const notificationRadius = 14;
const notificationVisible = 5;
const bitcoinOrange = '#F7931A';

function NotificationCard({
  notification,
  position,
  isAnimated,
}: {
  notification: BtcNotification;
  /** −1 waits above the stack, 0 is the newest alert, `notificationVisible` is leaving */
  position: number;
  isAnimated: boolean;
}) {
  const verb = notification.isSender ? 'sent' : 'received';
  const isVisible = position >= 0 && position < notificationVisible;
  const offset = Math.max(position, 0) * (notificationHeight + notificationGap);
  return (
    <styled.div
      position="absolute"
      left="0"
      right="0"
      top="0"
      display="flex"
      alignItems="center"
      style={{
        height: stagePx(notificationHeight),
        paddingInline: stagePx(16),
        gap: stagePx(12),
        background: mockupColor.panel,
        border: `1px solid ${mockupColor.border}`,
        borderRadius: stagePx(notificationRadius),
        boxShadow: `0 ${stagePx(4)} ${stagePx(14)} rgba(18, 16, 15, 0.05)`,
        zIndex: notificationVisible + 1 - position,
        transform:
          position < 0
            ? `translateY(${stagePx(-24)}) scale(0.96)`
            : `translateY(${stagePx(offset)})`,
        opacity: isVisible ? 1 : 0,
        transition: transitionFor(isAnimated, ['transform', 'opacity'], durationMs),
      }}
    >
      <styled.span
        position="relative"
        flexShrink="0"
        style={{ width: stagePx(mockupSize.icon), height: stagePx(mockupSize.icon) }}
      >
        <styled.img
          src="/icons/leather.webp"
          alt=""
          display="block"
          style={{ width: '100%', height: '100%', borderRadius: stagePx(7) }}
        />
        <StatusBadge style={{ right: stagePx(-3), bottom: stagePx(-3) }}>
          <Glyph indicator={notification.isSender ? 'sent' : 'received'} fill={bitcoinOrange} />
        </StatusBadge>
      </styled.span>
      <styled.span display="flex" flexDir="column" flex="1" minWidth="0">
        <styled.span display="flex" justifyContent="space-between" style={{ gap: stagePx(8) }}>
          <styled.span style={primaryText}>You {verb} Bitcoin!</styled.span>
          <styled.span style={secondaryText}>
            {notificationTimes[Math.max(position, 0)]}
          </styled.span>
        </styled.span>
        <styled.span style={{ ...mockupType.body, color: mockupColor.secondary }}>
          Account {notification.account} {verb} {notification.btc} BTC (${notification.usd})
        </styled.span>
      </styled.span>
    </styled.div>
  );
}

/** The extension's browser notifications for confirmed Bitcoin transactions (bitcoin-transaction-monitor.ts). */
export function BtcNotificationsMockup() {
  const { ref, arrived, isAnimated } = useConveyor<HTMLDivElement>(2400);

  return (
    <BentoStage
      ref={ref}
      label="Browser notifications from Leather, such as You received Bitcoin!, Account 1 received 0.0042 BTC, keep arriving above earlier alerts"
    >
      {/* The shared panel's footprint, without the panel */}
      <styled.div
        position="absolute"
        left="50%"
        style={{
          top: stagePx(mockupSize.panelTop),
          width: stagePx(mockupSize.panelWidth),
          height: stagePx(mockupSize.panelHeight),
          transform: 'translateX(-50%)',
          color: mockupColor.text,
          fontFeatureSettings: '"tnum"',
          ...fadeBottom(56),
        }}
      >
        {conveyorSlots(arrived, notificationVisible).map(({ arrival, position }) => (
          <NotificationCard
            key={arrival}
            notification={fromQueue(notificationQueue, arrival)}
            position={position}
            isAnimated={isAnimated}
          />
        ))}
      </styled.div>
    </BentoStage>
  );
}
