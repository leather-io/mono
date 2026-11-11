import { type CSSProperties, type ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import {
  BentoStage,
  MockupPanel,
  mockupColor,
  mockupSize,
  mockupType,
  stagePx,
  useLoopingSequence,
} from './bento-mockup';

// Not in the shared frame: a common ease and duration for the list motion below
const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
const durationMs = 420;

function motion(isAnimated: boolean, properties: string[]): CSSProperties {
  if (!isAnimated) return {};
  return {
    transitionProperty: properties.join(', '),
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: ease,
  };
}

/** Fades the bottom edge of a list that runs past its container, as a scrolled list does. */
function fadeBottom(px: number): CSSProperties {
  const mask = `linear-gradient(to bottom, #000 calc(100% - ${stagePx(px)}), transparent)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

const tokenIcon = {
  btc: '/icons/bitcoin.svg',
  stx: '/icons/stacks.svg',
  sbtc: '/icons/sbtc.svg',
} as const;

type Token = keyof typeof tokenIcon;
type Indicator = 'pending' | 'sent' | 'received' | 'swap';

// Status badges, redrawn from packages/ui/src/assets/icons/activity/*.svg (16 × 16 grid)
function IndicatorGlyph({ indicator }: { indicator: Indicator }) {
  if (indicator === 'pending') {
    return (
      <svg viewBox="0 0 16 16" width="100%" height="100%">
        <circle cx="8" cy="8" r="8" fill="#FFFFFF" />
        <circle cx="8" cy="8" r="6.75" fill="none" stroke="#D9D6D3" strokeWidth="2" />
        <path
          d="M8 1.25A6.75 6.75 0 0 1 14.75 8"
          fill="none"
          stroke={mockupColor.text}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const glyph = {
    sent: <path d="M5.9 10.1 10.1 5.9M6.3 5.9h3.8v3.8" />,
    received: <path d="M5.9 5.9l4.2 4.2M5.9 6.3v3.8h3.8" />,
    swap: <path d="M4 9c.84 2.35 4.16 2.35 5 0M12 7c-.84-2.35-4.16-2.35-5 0" />,
  }[indicator];
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%">
      <circle cx="8" cy="8" r="8" fill={mockupColor.text} />
      <g fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {glyph}
      </g>
    </svg>
  );
}

const badgeSize = 12;

function Badge({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <styled.span
      position="absolute"
      borderRadius="50%"
      style={{
        right: stagePx(-2),
        bottom: stagePx(-2),
        width: stagePx(badgeSize),
        height: stagePx(badgeSize),
        boxShadow: `0 0 0 ${stagePx(1.5)} ${mockupColor.panel}`,
        ...style,
      }}
    >
      {children}
    </styled.span>
  );
}

function TokenIcon({ token, size, style }: { token: Token; size: number; style?: CSSProperties }) {
  return (
    <styled.img
      src={tokenIcon[token]}
      alt=""
      position="absolute"
      borderRadius="50%"
      style={{ width: stagePx(size), height: stagePx(size), ...style }}
    />
  );
}

/** ActivityAvatarIcon: the asset, or a dimmed-back pair for swaps, with a status badge. */
function ActivityAvatar({
  token,
  swapFrom,
  indicators,
  activeIndicator,
  isAnimated,
}: {
  token: Token;
  swapFrom?: Token;
  indicators: Indicator[];
  activeIndicator: Indicator;
  isAnimated: boolean;
}) {
  const size = mockupSize.icon;
  return (
    <styled.span
      position="relative"
      flexShrink="0"
      style={{ width: stagePx(size), height: stagePx(size) }}
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
      {indicators.map(indicator => (
        <Badge
          key={indicator}
          style={{
            opacity: indicator === activeIndicator ? 1 : 0,
            ...motion(isAnimated, ['opacity']),
          }}
        >
          <IndicatorGlyph indicator={indicator} />
        </Badge>
      ))}
    </styled.span>
  );
}

interface ActivityRow {
  id: string;
  token: Token;
  swapFrom?: Token;
  title: string;
  caption: string;
  indicator: Indicator;
  quote: string;
  crypto: string;
  /** Confirmed receives show their fiat value in green, as in the app */
  isPositive?: boolean;
}

// Illustrative values at roughly $75,200 / BTC and $0.43 / STX
const confirmedRows: ActivityRow[] = [
  {
    id: 'sbtc-received',
    token: 'sbtc',
    title: 'Received',
    caption: '2h ago',
    indicator: 'received',
    quote: '+ $75.20',
    crypto: '+ 0.001 sBTC',
    isPositive: true,
  },
  {
    id: 'stx-sbtc-swap',
    token: 'sbtc',
    swapFrom: 'stx',
    title: 'Swapped',
    caption: '1d ago',
    indicator: 'swap',
    quote: '+ $37.60',
    crypto: '+ 0.0005 sBTC',
  },
  {
    id: 'stx-sent',
    token: 'stx',
    title: 'Sent',
    caption: '3d ago',
    indicator: 'sent',
    quote: '− $21.50',
    crypto: '− 50 STX',
  },
  {
    id: 'btc-received',
    token: 'btc',
    title: 'Received',
    caption: '5d ago',
    indicator: 'received',
    quote: '+ $188.00',
    crypto: '+ 0.0025 BTC',
    isPositive: true,
  },
  {
    id: 'stx-received',
    token: 'stx',
    title: 'Received',
    caption: '8d ago',
    indicator: 'received',
    quote: '+ $43.00',
    crypto: '+ 100 STX',
    isPositive: true,
  },
  {
    id: 'btc-sent',
    token: 'btc',
    title: 'Sent',
    caption: '12d ago',
    indicator: 'sent',
    quote: '− $60.16',
    crypto: '− 0.0008 BTC',
  },
];

const activityHeader = 62;
const activityRowHeight = mockupSize.rowHeight;

function ActivityRowView({
  row,
  index,
  activeIndicator = row.indicator,
  indicators = [row.indicator],
  title = row.title,
  isVisible = true,
  isAnimated,
}: {
  row: ActivityRow;
  index: number;
  activeIndicator?: Indicator;
  indicators?: Indicator[];
  title?: string;
  isVisible?: boolean;
  isAnimated: boolean;
}) {
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
        transform: `translateY(${stagePx(index * activityRowHeight)}) scale(${isVisible ? 1 : 0.97})`,
        opacity: isVisible ? 1 : 0,
        ...motion(isAnimated, ['transform', 'opacity']),
      }}
    >
      <ActivityAvatar
        token={row.token}
        swapFrom={row.swapFrom}
        indicators={indicators}
        activeIndicator={activeIndicator}
        isAnimated={isAnimated}
      />
      <styled.span display="flex" flexDir="column" flex="1" minWidth="0">
        <styled.span style={{ ...mockupType.body, fontWeight: 500 }}>{title}</styled.span>
        <styled.span style={{ ...mockupType.meta, color: mockupColor.secondary }}>
          {row.caption}
        </styled.span>
      </styled.span>
      <styled.span display="flex" flexDir="column" alignItems="flex-end">
        <styled.span
          style={{
            ...mockupType.body,
            fontWeight: 500,
            color: row.isPositive ? mockupColor.positive : mockupColor.text,
          }}
        >
          {row.quote}
        </styled.span>
        <styled.span style={{ ...mockupType.meta, color: mockupColor.secondary }}>
          {row.crypto}
        </styled.span>
      </styled.span>
    </styled.div>
  );
}

const pendingRow: ActivityRow = {
  id: 'btc-sending',
  token: 'btc',
  title: 'Sent',
  caption: 'Just now',
  indicator: 'sent',
  quote: '− $45.12',
  crypto: '− 0.0006 BTC',
};

/**
 * "Know every move": the Activity list from the mobile app (apps/mobile/src/features/activity,
 * rows from packages/features/src/activity). A new BTC send arrives as Sending with the pending
 * badge, then confirms as Sent.
 */
export function ActivityMockup() {
  // 0: history only · 1: a send appears, pending · 2: it confirms
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([700, 1700], 2600);
  const hasNewRow = step >= 1;
  const isConfirmed = step >= 2;

  return (
    <BentoStage label="The Activity list: a Bitcoin send goes from Sending to Sent above earlier sends, receives and a swap">
      <styled.div ref={ref} position="absolute" inset="0">
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
            <ActivityRowView
              row={pendingRow}
              index={0}
              title={isConfirmed ? 'Sent' : 'Sending'}
              indicators={['pending', 'sent']}
              activeIndicator={isConfirmed ? 'sent' : 'pending'}
              isVisible={hasNewRow}
              isAnimated={isAnimated}
            />
            {confirmedRows.map((row, index) => (
              <ActivityRowView
                key={row.id}
                row={row}
                index={index + (hasNewRow ? 1 : 0)}
                isAnimated={isAnimated}
              />
            ))}
          </styled.div>
        </MockupPanel>
      </styled.div>
    </BentoStage>
  );
}

interface BtcNotification {
  id: string;
  isSender: boolean;
  account: number;
  btc: string;
  usd: string;
  time: string;
}

// Copy format from the extension's Bitcoin transaction monitor (sendNotification):
// title `You ${sent|received} Bitcoin!`, message `Account N ${sent|received} X BTC ($Y.YY)`
const incomingNotifications: BtcNotification[] = [
  { id: 'second', isSender: false, account: 1, btc: '0.0015', usd: '112.80', time: 'now' },
  { id: 'first', isSender: false, account: 1, btc: '0.0042', usd: '315.83', time: 'now' },
];

const earlierNotifications: BtcNotification[] = [
  { id: 'earlier-1', isSender: true, account: 2, btc: '0.0008', usd: '60.16', time: '1h ago' },
  { id: 'earlier-2', isSender: false, account: 2, btc: '0.0125', usd: '939.96', time: '3h ago' },
  { id: 'earlier-3', isSender: false, account: 1, btc: '0.003', usd: '225.59', time: '5h ago' },
];

const notificationHeight = 68;
const notificationGap = 10;
const notificationRadius = 14;

function NotificationCard({
  notification,
  index,
  isVisible = true,
  isAnimated,
}: {
  notification: BtcNotification;
  index: number;
  isVisible?: boolean;
  isAnimated: boolean;
}) {
  const verb = notification.isSender ? 'sent' : 'received';
  const offset = index * (notificationHeight + notificationGap);
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
        // Newer alerts sit above older ones while they slide past
        zIndex: 10 - index,
        transform: isVisible
          ? `translateY(${stagePx(offset)})`
          : `translateY(${stagePx(-24)}) scale(0.96)`,
        opacity: isVisible ? 1 : 0,
        ...motion(isAnimated, ['transform', 'opacity']),
      }}
    >
      {/* The extension passes its own icon (leather-icon-128.png) as the notification icon */}
      <styled.img
        src="/icons/leather.webp"
        alt=""
        flexShrink="0"
        style={{
          width: stagePx(mockupSize.icon),
          height: stagePx(mockupSize.icon),
          borderRadius: stagePx(7),
        }}
      />
      <styled.span display="flex" flexDir="column" flex="1" minWidth="0">
        <styled.span display="flex" justifyContent="space-between" style={{ gap: stagePx(8) }}>
          <styled.span style={{ ...mockupType.body, fontWeight: 500 }}>
            You {verb} Bitcoin!
          </styled.span>
          <styled.span style={{ ...mockupType.meta, color: mockupColor.secondary }}>
            {notification.time}
          </styled.span>
        </styled.span>
        <styled.span style={{ ...mockupType.body, color: mockupColor.secondary }}>
          Account {notification.account} {verb} {notification.btc} BTC (${notification.usd})
        </styled.span>
      </styled.span>
    </styled.div>
  );
}

/**
 * "Get BTC notifications": the browser notifications the extension raises when a monitored
 * Bitcoin address confirms a transaction (apps/extension/src/background/monitors/address-monitors/
 * bitcoin-transaction-monitor.ts). A receive slides in on top of earlier alerts, then a second.
 */
export function BtcNotificationsMockup() {
  // 0: earlier alerts · 1: a receive confirms · 2: a second one stacks on top
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([800, 1700], 2600);
  const arrived = incomingNotifications.filter(
    (_, index) => step >= incomingNotifications.length - index
  ).length;

  return (
    <BentoStage label="Browser notifications from Leather: You received Bitcoin!, Account 1 received 0.0042 BTC, stacking above earlier alerts">
      <styled.div ref={ref} position="absolute" inset="0">
        {/* Same footprint as the shared panel; the notifications are the containers */}
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
          {incomingNotifications.map((notification, index) => {
            const isVisible = step >= incomingNotifications.length - index;
            return (
              <NotificationCard
                key={notification.id}
                notification={notification}
                index={isVisible ? index - (incomingNotifications.length - arrived) : 0}
                isVisible={isVisible}
                isAnimated={isAnimated}
              />
            );
          })}
          {earlierNotifications.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              index={index + arrived}
              isAnimated={isAnimated}
            />
          ))}
        </styled.div>
      </styled.div>
    </BentoStage>
  );
}
