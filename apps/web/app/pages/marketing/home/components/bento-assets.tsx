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

// Product inks the shared frame doesn't carry (light theme)
const productColor = {
  action: '#12100F',
  actionPressed: '#3A3633',
  disabled: '#F5F3F1',
  hover: '#F5F3F1',
  pill: '#F0EEEC',
  usdc: '#2775CA',
} as const;

const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
const durationMs = 400;

function transitionFor(isAnimated: boolean, properties: string[], ms = durationMs) {
  if (!isAnimated) return undefined;
  return properties.map(property => `${property} ${ms}ms ${ease}`).join(', ');
}

const insetX: CSSProperties = {
  paddingLeft: stagePx(mockupSize.inset),
  paddingRight: stagePx(mockupSize.inset),
};

const strong: CSSProperties = { ...mockupType.body, fontWeight: 500 };
const secondary: CSSProperties = { ...mockupType.meta, color: mockupColor.secondary };

function StrokeIcon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: stagePx(size), height: stagePx(size), flexShrink: 0, display: 'block' }}
    >
      {children}
    </svg>
  );
}

function BackChevron() {
  return (
    <StrokeIcon size={16}>
      <path d="M10 3 5 8l5 5" />
    </StrokeIcon>
  );
}

const tokenIcon = {
  btc: '/icons/bitcoin.svg',
  stx: '/icons/stacks.svg',
  sbtc: '/icons/sbtc.svg',
  ststx: '/icons/ststx.svg',
} as const;

type Token = keyof typeof tokenIcon | 'usdcx';

function TokenIcon({ token, size = mockupSize.icon }: { token: Token; size?: number }) {
  const box: CSSProperties = { width: stagePx(size), height: stagePx(size), flexShrink: 0 };
  if (token === 'usdcx') {
    // No USDCx asset ships with the site; the USDC mark on its brand blue
    return (
      <svg viewBox="0 0 28 28" style={{ ...box, display: 'block' }}>
        <circle cx="14" cy="14" r="14" fill={productColor.usdc} />
        <circle cx="14" cy="14" r="9.5" fill="none" stroke="#FFFFFF" strokeWidth="1.4" />
        <path
          d="M16.4 11.6c-.3-1-1.2-1.6-2.4-1.6-1.4 0-2.4.8-2.4 1.9 0 2.6 4.9 1.5 4.9 4.2 0 1.1-1 1.9-2.5 1.9-1.3 0-2.3-.7-2.6-1.7M14 8.6v1.4M14 18v1.4"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <styled.img src={tokenIcon[token]} alt="" borderRadius="50%" display="block" style={box} />
  );
}

/** Two tightly stacked lines; the pair centres on the icon beside it. */
function StackedLabel({
  primary,
  secondaryText,
  align = 'start',
  primaryColor,
}: {
  primary: ReactNode;
  secondaryText: ReactNode;
  align?: 'start' | 'end';
  primaryColor?: string;
}) {
  return (
    <styled.span
      display="flex"
      flexDir="column"
      justifyContent="center"
      minWidth="0"
      style={{ alignItems: align === 'end' ? 'flex-end' : 'flex-start' }}
    >
      <styled.span whiteSpace="nowrap" style={{ ...strong, color: primaryColor }}>
        {primary}
      </styled.span>
      <styled.span whiteSpace="nowrap" style={secondary}>
        {secondaryText}
      </styled.span>
    </styled.span>
  );
}

// Illustrative prices, matching the other bentos: about $75,200 / BTC and $0.43 / STX

/* -------------------------------------------------------------------------------------------- */
/* Send and receive                                                                              */
/* -------------------------------------------------------------------------------------------- */

const sendHeader = 64;
const sendBoxRadius = 8;

function QrIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      style={{ width: stagePx(16), height: stagePx(16), flexShrink: 0, display: 'block' }}
    >
      <rect x="2" y="2" width="4.5" height="4.5" rx="1" />
      <rect x="9.5" y="2" width="4.5" height="4.5" rx="1" />
      <rect x="2" y="9.5" width="4.5" height="4.5" rx="1" />
      <path d="M9.5 9.5h1.5v1.5M14 9.5v1.5M9.5 14h1.5M12.5 12.5H14V14" strokeLinecap="round" />
    </svg>
  );
}

const sendSteps = [
  { amount: '0', fiat: '$0.00' },
  { amount: '5', fiat: '$2.15' },
  { amount: '50', fiat: '$21.50' },
] as const;

/**
 * "Send and receive": the Send form from the mobile app (apps/mobile/src/features/send), as in
 * the Lottie it replaces. 50 STX is typed in, the recipient fills, and Review turns dark and
 * holds, with a press, before the loop starts over. Reduced motion shows the ready form.
 */
export function SendMockup() {
  // 0: empty · 1: "5" · 2: "50" · 3: recipient, Review enabled · 4: pressed · 5: released
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>(
    [1000, 320, 900, 1000, 200],
    1100
  );
  const entry = sendSteps[Math.min(step, sendSteps.length - 1)] ?? sendSteps[0];
  const hasAmount = step >= 1;
  const hasRecipient = step >= 3;
  const isPressed = step === 4;
  let reviewBackground: string = productColor.disabled;
  if (hasRecipient) reviewBackground = isPressed ? productColor.actionPressed : productColor.action;

  return (
    <BentoStage label="The Send screen: 50 STX from a Stacks account to a recipient, ready to review">
      <styled.div ref={ref} position="absolute" inset="0">
        <MockupPanel>
          {/* Header: back and title */}
          <styled.div
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ height: stagePx(sendHeader), ...mockupType.title }}
          >
            <styled.span position="absolute" style={{ left: stagePx(mockupSize.inset) }}>
              <BackChevron />
            </styled.span>
            Send
          </styled.div>

          <styled.div display="flex" flexDir="column" style={insetX}>
            {/* Asset and amount */}
            <styled.div
              style={{
                border: `1px solid ${mockupColor.border}`,
                borderRadius: stagePx(sendBoxRadius),
              }}
            >
              <styled.div
                display="flex"
                alignItems="center"
                style={{
                  height: stagePx(56),
                  gap: stagePx(12),
                  paddingInline: stagePx(12),
                  borderBottom: `1px solid ${mockupColor.border}`,
                }}
              >
                <styled.span position="relative" flexShrink="0">
                  <TokenIcon token="stx" />
                </styled.span>
                <styled.span flex="1" minWidth="0">
                  <StackedLabel primary="Stacks" secondaryText="Stacks Blockchain" />
                </styled.span>
                <StackedLabel primary="725 STX" secondaryText="$311.75" align="end" />
              </styled.div>
              <styled.div
                display="flex"
                justifyContent="space-between"
                style={{ height: stagePx(80), padding: `${stagePx(12)} ${stagePx(12)}` }}
              >
                <styled.span display="flex" flexDir="column" style={{ gap: stagePx(4) }}>
                  <styled.span
                    style={{
                      ...mockupType.headline,
                      color: hasAmount ? mockupColor.text : mockupColor.secondary,
                      transition: transitionFor(isAnimated, ['color'], 200),
                    }}
                  >
                    {entry.amount}
                  </styled.span>
                  <styled.span
                    display="flex"
                    alignItems="center"
                    style={{ ...secondary, gap: stagePx(4) }}
                  >
                    {entry.fiat}
                    <StrokeIcon size={11}>
                      <path d="M5 13V3M2.5 5.5 5 3l2.5 2.5M11 3v10M8.5 10.5 11 13l2.5-2.5" />
                    </StrokeIcon>
                  </styled.span>
                </styled.span>
                <styled.span style={strong}>MAX</styled.span>
              </styled.div>
            </styled.div>

            {/* Swap-direction chip between the two boxes */}
            <styled.div display="flex" justifyContent="center" style={{ height: stagePx(10) }}>
              <styled.span
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                zIndex="1"
                style={{
                  width: stagePx(22),
                  height: stagePx(22),
                  marginTop: stagePx(-6),
                  background: mockupColor.panel,
                  border: `1px solid ${mockupColor.border}`,
                  borderRadius: stagePx(4),
                  color: mockupColor.secondary,
                }}
              >
                <StrokeIcon size={11}>
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </StrokeIcon>
              </styled.span>
            </styled.div>

            {/* Recipient */}
            <styled.div
              position="relative"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              style={{
                height: stagePx(48),
                paddingInline: stagePx(12),
                border: `1px solid ${mockupColor.border}`,
                borderRadius: stagePx(sendBoxRadius),
              }}
            >
              <styled.span display="grid" style={{ ...strong, gridTemplateAreas: '"field"' }}>
                <styled.span
                  style={{
                    gridArea: 'field',
                    color: mockupColor.secondary,
                    opacity: hasRecipient ? 0 : 1,
                    transition: transitionFor(isAnimated, ['opacity'], 200),
                  }}
                >
                  Enter recipient
                </styled.span>
                <styled.span
                  style={{
                    gridArea: 'field',
                    opacity: hasRecipient ? 1 : 0,
                    transform: hasRecipient ? 'none' : `translateY(${stagePx(4)})`,
                    transition: transitionFor(isAnimated, ['opacity', 'transform']),
                  }}
                >
                  SP2J6…S9EJ7
                </styled.span>
              </styled.span>
              <QrIcon />
            </styled.div>

            {/* Review: disabled until amount and recipient are in, then holds dark */}
            <styled.div
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="round"
              style={{
                height: stagePx(36),
                marginTop: stagePx(18),
                ...strong,
                background: reviewBackground,
                color: hasRecipient ? '#FFFFFF' : mockupColor.secondary,
                transform: isPressed ? 'scale(0.97)' : 'none',
                transition: transitionFor(
                  isAnimated,
                  ['background-color', 'color', 'transform'],
                  300
                ),
              }}
            >
              Review
            </styled.div>
          </styled.div>
        </MockupPanel>
      </styled.div>
    </BentoStage>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Your tokens, at a glance                                                                      */
/* -------------------------------------------------------------------------------------------- */

interface TokenRow {
  token: Token;
  name: string;
  ticker: string;
  fiat: string;
  amount: string;
}

// Mobile TokenBalance cell: name over ticker on the left, fiat over amount on the right
const tokenRows: TokenRow[] = [
  { token: 'btc', name: 'Bitcoin', ticker: 'BTC', fiat: '$1,879.93', amount: '0.025' },
  { token: 'stx', name: 'Stacks', ticker: 'STX', fiat: '$311.75', amount: '725' },
  { token: 'sbtc', name: 'sBTC', ticker: 'sBTC', fiat: '$75.20', amount: '0.001' },
  { token: 'usdcx', name: 'USDCx', ticker: 'USDCx', fiat: '$250.00', amount: '250' },
  { token: 'ststx', name: 'stSTX', ticker: 'stSTX', fiat: '$48.16', amount: '100' },
];

const listHeader = 82;
const rowHeight = mockupSize.rowHeight;

function TokenListView({ isPressed, isAnimated }: { isPressed: boolean; isAnimated: boolean }) {
  return (
    <>
      <styled.div
        display="flex"
        flexDir="column"
        justifyContent="center"
        style={{ height: stagePx(listHeader), ...insetX, gap: stagePx(2) }}
      >
        <styled.span style={secondary}>Account 1</styled.span>
        <styled.span style={mockupType.headline}>$2,565.04</styled.span>
      </styled.div>
      {tokenRows.map((row, index) => (
        <styled.div
          key={row.token}
          display="flex"
          alignItems="center"
          style={{
            height: stagePx(rowHeight),
            ...insetX,
            gap: stagePx(12),
            // The Bitcoin row takes the tap
            background: index === 0 && isPressed ? productColor.hover : 'transparent',
            transition: transitionFor(isAnimated, ['background-color'], 200),
          }}
        >
          <TokenIcon token={row.token} />
          <styled.span flex="1" minWidth="0">
            <StackedLabel primary={row.name} secondaryText={row.ticker} />
          </styled.span>
          <StackedLabel primary={row.fiat} secondaryText={row.amount} align="end" />
        </styled.div>
      ))}
    </>
  );
}

type Indicator = 'pending' | 'sent' | 'received';

// Status badges, redrawn from packages/ui/src/assets/icons/activity/*.svg, as in Know every move
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
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%">
      <circle cx="8" cy="8" r="8" fill={mockupColor.text} />
      <path
        d={
          indicator === 'sent'
            ? 'M5.9 10.1 10.1 5.9M6.3 5.9h3.8v3.8'
            : 'M5.9 5.9l4.2 4.2M5.9 6.3v3.8h3.8'
        }
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface BtcActivity {
  id: string;
  title: string;
  caption: string;
  indicator: Indicator;
  quote: string;
  crypto: string;
  isPositive?: boolean;
}

// Titles from packages/features/src/activity/blockchain-activity-copy.ts (Sending / Received / Sent)
const btcActivity: BtcActivity[] = [
  {
    id: 'sending',
    title: 'Sending',
    caption: 'Just now',
    indicator: 'pending',
    quote: '− $45.12',
    crypto: '− 0.0006 BTC',
  },
  {
    id: 'received',
    title: 'Received',
    caption: '5d ago',
    indicator: 'received',
    quote: '+ $188.00',
    crypto: '+ 0.0025 BTC',
    isPositive: true,
  },
  {
    id: 'sent',
    title: 'Sent',
    caption: '12d ago',
    indicator: 'sent',
    quote: '− $60.16',
    crypto: '− 0.0008 BTC',
  },
];

function ActivityRow({ row }: { row: BtcActivity }) {
  const size = mockupSize.icon;
  return (
    <styled.div
      display="flex"
      alignItems="center"
      style={{ height: stagePx(rowHeight), ...insetX, gap: stagePx(12) }}
    >
      <styled.span
        position="relative"
        flexShrink="0"
        style={{ width: stagePx(size), height: stagePx(size) }}
      >
        <TokenIcon token="btc" />
        <styled.span
          position="absolute"
          borderRadius="50%"
          style={{
            right: stagePx(-2),
            bottom: stagePx(-2),
            width: stagePx(12),
            height: stagePx(12),
            boxShadow: `0 0 0 ${stagePx(1.5)} ${mockupColor.panel}`,
          }}
        >
          <IndicatorGlyph indicator={row.indicator} />
        </styled.span>
      </styled.span>
      <styled.span flex="1" minWidth="0">
        <StackedLabel primary={row.title} secondaryText={row.caption} />
      </styled.span>
      <StackedLabel
        primary={row.quote}
        secondaryText={row.crypto}
        align="end"
        primaryColor={row.isPositive ? mockupColor.positive : undefined}
      />
    </styled.div>
  );
}

// A day of BTC price, sampled; normalised 0–1 (higher is up)
const priceTrace = [
  0.52, 0.58, 0.55, 0.66, 0.6, 0.7, 0.68, 0.78, 0.72, 0.64, 0.66, 0.58, 0.6, 0.5, 0.42, 0.44, 0.34,
  0.38, 0.26, 0.3, 0.2, 0.22, 0.32, 0.38, 0.34, 0.3, 0.36, 0.3, 0.32, 0.42, 0.38, 0.48, 0.52, 0.46,
  0.5, 0.44, 0.48, 0.56, 0.62, 0.8, 0.88, 0.66, 0.6, 0.64, 0.54, 0.58, 0.5, 0.52, 0.56, 0.5, 0.6,
  0.58, 0.62, 0.56, 0.64, 0.68, 0.66, 0.74, 0.72, 0.78, 0.76,
];

function PriceChart() {
  const width = 368;
  const height = 60;
  const step = width / (priceTrace.length - 1);
  const points = priceTrace
    .map((value, index) => `${(index * step).toFixed(1)},${(height - value * height).toFixed(1)}`)
    .join(' ');
  return (
    <svg
      viewBox={`0 -2 ${width} ${height + 4}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: stagePx(height), display: 'block' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={mockupColor.positive}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function InfoTab() {
  return (
    <styled.div display="flex" flexDir="column" style={{ ...insetX, paddingTop: stagePx(12) }}>
      <styled.span style={strong}>$75,197.01</styled.span>
      <styled.span style={{ ...mockupType.meta, color: mockupColor.positive }}>
        + $397.12 (+ 0.53%)
      </styled.span>
      <styled.div style={{ marginTop: stagePx(10) }}>
        <PriceChart />
      </styled.div>
      <styled.div
        display="flex"
        justifyContent="space-between"
        style={{ marginTop: stagePx(12), ...secondary }}
      >
        {['1D', '1W', '1M', '3M', '6M', '1Y'].map((period, index) => (
          <styled.span
            key={period}
            borderRadius="round"
            style={{
              paddingInline: stagePx(9),
              paddingBlock: stagePx(2),
              background: index === 0 ? productColor.pill : 'transparent',
              color: index === 0 ? mockupColor.text : mockupColor.secondary,
              fontWeight: index === 0 ? 500 : undefined,
            }}
          >
            {period}
          </styled.span>
        ))}
      </styled.div>
    </styled.div>
  );
}

// Token detail layout, in stage pixels: no title; coin and amounts sit high, and the actions
// sit midway between the amounts and the tabs
const detail = {
  backTop: 16,
  coinTop: 22,
  coin: 32,
  amountsTop: 68,
  actionsTop: 128,
  actionHeight: 28,
  tabsTop: 170,
  tabHeight: 32,
} as const;

const tabs = ['Activity', 'Balances', 'Info'] as const;

function TokenDetailView({
  activeTab,
  isAnimated,
}: {
  activeTab: (typeof tabs)[number];
  isAnimated: boolean;
}) {
  const activeIndex = tabs.indexOf(activeTab);
  const contentTop = detail.tabsTop + detail.tabHeight;
  return (
    <>
      <styled.span
        position="absolute"
        style={{ top: stagePx(detail.backTop), left: stagePx(mockupSize.inset) }}
      >
        <BackChevron />
      </styled.span>
      <styled.span
        position="absolute"
        left="50%"
        style={{ top: stagePx(detail.coinTop), transform: 'translateX(-50%)' }}
      >
        <TokenIcon token="btc" size={detail.coin} />
      </styled.span>
      <styled.div
        position="absolute"
        left="0"
        right="0"
        display="flex"
        flexDir="column"
        alignItems="center"
        style={{ top: stagePx(detail.amountsTop), gap: stagePx(1) }}
      >
        <styled.span style={mockupType.headline}>0.025 BTC</styled.span>
        <styled.span style={secondary}>$1,879.93</styled.span>
      </styled.div>
      <styled.div
        position="absolute"
        left="0"
        right="0"
        display="flex"
        justifyContent="center"
        style={{ top: stagePx(detail.actionsTop), gap: stagePx(8) }}
      >
        {['Receive', 'Send'].map(label => (
          <styled.span
            key={label}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="round"
            style={{
              width: stagePx(84),
              height: stagePx(detail.actionHeight),
              background: productColor.pill,
              ...strong,
            }}
          >
            {label}
          </styled.span>
        ))}
      </styled.div>

      {/* Tabs with a full-cell underline */}
      <styled.div
        position="absolute"
        left="0"
        right="0"
        display="grid"
        style={{
          top: stagePx(detail.tabsTop),
          height: stagePx(detail.tabHeight),
          gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
          borderBottom: `1px solid ${mockupColor.divider}`,
        }}
      >
        {tabs.map(tab => (
          <styled.span
            key={tab}
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{
              ...strong,
              color: tab === activeTab ? mockupColor.text : mockupColor.secondary,
              transition: transitionFor(isAnimated, ['color'], 250),
            }}
          >
            {tab}
          </styled.span>
        ))}
        <styled.span
          position="absolute"
          style={{
            bottom: -1,
            height: stagePx(2),
            width: `${100 / tabs.length}%`,
            left: `${(100 / tabs.length) * activeIndex}%`,
            background: mockupColor.text,
            transition: transitionFor(isAnimated, ['left']),
          }}
        />
      </styled.div>

      {/* Tab content cross-fades */}
      <styled.div
        position="absolute"
        left="0"
        right="0"
        bottom="0"
        overflow="hidden"
        style={{ top: stagePx(contentTop) }}
      >
        {(['Info', 'Activity'] as const).map(tab => (
          <styled.div
            key={tab}
            position="absolute"
            inset="0"
            style={{
              opacity: tab === activeTab ? 1 : 0,
              transform: tab === activeTab ? 'none' : `translateY(${stagePx(6)})`,
              transition: transitionFor(isAnimated, ['opacity', 'transform']),
            }}
          >
            {tab === 'Info' ? (
              <InfoTab />
            ) : (
              btcActivity.map(row => <ActivityRow key={row.id} row={row} />)
            )}
          </styled.div>
        ))}
      </styled.div>
    </>
  );
}

/**
 * "Your tokens, at a glance": token balances from the mobile app (TokenBalance cells in
 * apps/mobile/src/features/balances), then Bitcoin's detail with its price (Info) and its
 * activity. Tapping Bitcoin slides the detail in; the loop slides back to the list. Reduced
 * motion shows Bitcoin's activity.
 */
export function TokensMockup() {
  // 0: list · 1: Bitcoin pressed · 2: detail, Info · 3: detail, Activity
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([1500, 240, 2400], 2800);
  const isDetail = step >= 2;
  const slide = transitionFor(isAnimated, ['transform', 'opacity'], 450);

  return (
    <BentoStage label="Token balances for Bitcoin, Stacks, sBTC, USDCx and stSTX; Bitcoin opens to its price and its activity">
      <styled.div ref={ref} position="absolute" inset="0">
        <MockupPanel>
          <styled.div
            position="absolute"
            inset="0"
            style={{
              transform: isDetail ? 'translateX(-24%)' : 'none',
              opacity: isDetail ? 0 : 1,
              transition: slide,
            }}
          >
            <TokenListView isPressed={step === 1} isAnimated={isAnimated} />
          </styled.div>
          <styled.div
            position="absolute"
            inset="0"
            style={{
              background: mockupColor.panel,
              transform: isDetail ? 'none' : 'translateX(100%)',
              transition: slide,
            }}
          >
            <TokenDetailView activeTab={step >= 3 ? 'Activity' : 'Info'} isAnimated={isAnimated} />
          </styled.div>
        </MockupPanel>
      </styled.div>
    </BentoStage>
  );
}
