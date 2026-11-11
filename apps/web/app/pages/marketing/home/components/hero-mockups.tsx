import { type CSSProperties, type ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import { mockupColor } from './bento-mockup';

/**
 * The homepage hero's two devices, rebuilt in HTML so their screens can follow the headline verbs:
 * the browser extension (dark, in a browser window) and the mobile app (light, in a phone).
 *
 * Like the bento mockups (see bento-mockup.tsx), every size is in reference pixels converted to
 * container units, so the art scales with its frame at every breakpoint. Each device is its own
 * size container and measures in the coordinates of the image it replaces: the extension window
 * is 1214 units wide, the phone 412. Type comes out at about the same unit size in both, so the
 * screens below are shared and only their palette and a few chrome details differ per device.
 *
 * Screens mirror the shipping apps: home (apps/mobile/src/components/home, extension pages/home),
 * Send (features/send), Swap (features/swap, quotes from Bitflow), Buy (the Onramper ramp in
 * features/ramp, pages/fund), Bitcoin Staking (extension pages/all-balances bond positions).
 * Figures are illustrative and use one set of prices: about $110,550 / BTC and $0.436 / STX.
 */

export type HeroView = 'home' | 'buy' | 'send' | 'swap' | 'earn' | 'grow';

/** Reference unit → length; resolves against the nearest device container. */
function u(n: number) {
  return `calc(var(--hero-unit) * ${n})`;
}

const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
const viewTransitionMs = 420;

type DeviceTheme = 'light' | 'dark';

// Product inks per theme, as CSS variables, so one set of screens renders in both
type HeroVariable = `--hero-${string}`;
type DeviceStyle = CSSProperties & Record<HeroVariable, string>;

const palette: Record<DeviceTheme, Record<HeroVariable, string>> = {
  light: {
    '--hero-bg': '#FFFFFF',
    '--hero-ink': mockupColor.text,
    '--hero-secondary': mockupColor.secondary,
    '--hero-border': mockupColor.border,
    '--hero-divider': mockupColor.divider,
    '--hero-surface': '#F5F3F1',
    '--hero-primary-bg': mockupColor.text,
    '--hero-primary-ink': '#FFFFFF',
    '--hero-positive': mockupColor.positive,
    '--hero-positive-wash': 'rgba(31, 154, 93, 0.12)',
  },
  dark: {
    '--hero-bg': '#12100F',
    '--hero-ink': '#F5F1ED',
    '--hero-secondary': '#A39E9A',
    '--hero-border': '#3A3633',
    '--hero-divider': '#2A2725',
    '--hero-surface': '#1E1B1A',
    '--hero-primary-bg': '#F5F1ED',
    '--hero-primary-ink': mockupColor.text,
    '--hero-positive': '#3DBB7A',
    '--hero-positive-wash': 'rgba(61, 187, 122, 0.16)',
  },
};

const ink = 'var(--hero-ink)';
const secondaryInk = 'var(--hero-secondary)';
const border = 'var(--hero-border)';

const type = {
  title: { fontSize: u(18), lineHeight: 1.3, fontWeight: 500 },
  label: { fontSize: u(16), lineHeight: 1.3, fontWeight: 500 },
  body: { fontSize: u(15), lineHeight: 1.35 },
  meta: { fontSize: u(13), lineHeight: 1.35, color: secondaryInk },
  figure: { fontSize: u(46), lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em' },
  amount: { fontSize: u(22), lineHeight: 1.2, fontWeight: 500 },
} as const satisfies Record<string, CSSProperties>;

/* -------------------------------------------------------------------------------------------- */
/* Small parts                                                                                   */
/* -------------------------------------------------------------------------------------------- */

function Icon({ size, children, viewBox = '0 0 24 24' }: IconProps) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: u(size), height: u(size), flexShrink: 0, display: 'block' }}
    >
      {children}
    </svg>
  );
}
interface IconProps {
  size: number;
  children: ReactNode;
  viewBox?: string;
}

const tokenIcon = {
  btc: '/icons/bitcoin.svg',
  stx: '/icons/stacks.svg',
  sbtc: '/icons/sbtc.svg',
} as const;
type Token = keyof typeof tokenIcon;
const tokenChain: Record<Token, Token> = { btc: 'btc', stx: 'stx', sbtc: 'stx' };

/** Token logo with its chain badge, as in the mobile TokenBalance cell. */
function TokenIcon({ token, size = 46 }: { token: Token; size?: number }) {
  const badge = Math.round(size * 0.36);
  return (
    <styled.span position="relative" flexShrink="0" style={{ width: u(size), height: u(size) }}>
      <styled.img
        src={tokenIcon[token]}
        alt=""
        display="block"
        borderRadius="50%"
        style={{ width: '100%', height: '100%' }}
      />
      <styled.img
        src={tokenIcon[tokenChain[token]]}
        alt=""
        position="absolute"
        borderRadius="50%"
        style={{
          width: u(badge),
          height: u(badge),
          right: u(-2),
          bottom: u(-2),
          boxShadow: `0 0 0 ${u(2)} var(--hero-bg)`,
        }}
      />
    </styled.span>
  );
}

function Row({
  children,
  height,
  gap = 12,
  style,
}: {
  children: ReactNode;
  height?: number;
  gap?: number;
  style?: CSSProperties;
}) {
  return (
    <styled.div
      display="flex"
      alignItems="center"
      style={{ height: height ? u(height) : undefined, gap: u(gap), ...style }}
    >
      {children}
    </styled.div>
  );
}

function Stacked({
  primary,
  secondary,
  align = 'start',
  primaryStyle,
}: {
  primary: ReactNode;
  secondary: ReactNode;
  align?: 'start' | 'end';
  primaryStyle?: CSSProperties;
}) {
  return (
    <styled.span
      display="flex"
      flexDir="column"
      minWidth="0"
      style={{ alignItems: align === 'end' ? 'flex-end' : 'flex-start', gap: u(3) }}
    >
      <styled.span whiteSpace="nowrap" style={{ ...type.label, ...primaryStyle }}>
        {primary}
      </styled.span>
      <styled.span whiteSpace="nowrap" style={type.meta}>
        {secondary}
      </styled.span>
    </styled.span>
  );
}

function Divider({ bleed = 0, style }: { bleed?: number; style?: CSSProperties }) {
  return (
    <styled.div
      style={{
        height: 1,
        background: 'var(--hero-divider)',
        marginInline: u(-bleed),
        ...style,
      }}
    />
  );
}

function InfoGlyph() {
  return (
    <Icon size={12} viewBox="0 0 16 16">
      <path d="M7.167 7.333H8v3.5M14.167 8A6.167 6.167 0 1 1 1.834 8a6.167 6.167 0 0 1 12.333 0Z" />
    </Icon>
  );
}

/** Back chevron and a centred title: the header every flow screen opens with. */
function ScreenHeader({ title }: { title: string }) {
  return (
    <styled.div
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{ height: u(48), marginBottom: u(12), ...type.title }}
    >
      <styled.span position="absolute" left="0" style={{ color: ink }}>
        <Icon size={22}>
          <path d="m15 5-7 7 7 7" />
        </Icon>
      </styled.span>
      {title}
    </styled.div>
  );
}

function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <styled.div
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      style={{
        height: u(48),
        marginTop: u(18),
        background: 'var(--hero-primary-bg)',
        color: 'var(--hero-primary-ink)',
        ...type.label,
      }}
    >
      {children}
    </styled.div>
  );
}

function Box({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <styled.div
      style={{
        border: `1px solid ${border}`,
        borderRadius: u(14),
        paddingInline: u(14),
        ...style,
      }}
    >
      {children}
    </styled.div>
  );
}

function Chip({ children, isSelected }: { children: ReactNode; isSelected?: boolean }) {
  return (
    <styled.span
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      flex="1"
      style={{
        height: u(34),
        border: `1px solid ${isSelected ? ink : border}`,
        ...type.body,
        fontWeight: 500,
      }}
    >
      {children}
    </styled.span>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: ReactNode;
  value: ReactNode;
  valueColor?: string;
}) {
  return (
    <Row height={30} style={{ justifyContent: 'space-between', ...type.body }}>
      <styled.span style={{ color: secondaryInk }}>{label}</styled.span>
      <styled.span whiteSpace="nowrap" style={{ fontWeight: 500, color: valueColor }}>
        {value}
      </styled.span>
    </Row>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Screens                                                                                       */
/* -------------------------------------------------------------------------------------------- */

type Device = 'extension' | 'phone';

interface ScreenProps {
  device: Device;
  isActive: boolean;
  isAnimated: boolean;
}

const tokenRows = [
  { token: 'stx', name: 'Stacks', ticker: 'STX', fiat: '$1,503.50', amount: '3,449.3' },
  { token: 'btc', name: 'Bitcoin', ticker: 'BTC', fiat: '$3,758.74', amount: '0.0340' },
  { token: 'sbtc', name: 'sBTC', ticker: 'sBTC', fiat: '$2,255.25', amount: '0.0204' },
] as const satisfies readonly { token: Token; [key: string]: string }[];

function AccountHeader({ device }: { device: Device }) {
  return (
    <Row height={48} style={{ justifyContent: 'space-between' }}>
      <Row gap={12}>
        <styled.span
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{
            width: u(42),
            height: u(42),
            borderRadius: u(12),
            border: `1px solid ${border}`,
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: u(22), height: u(22) }} fill="currentColor">
            <path d="M6.9 3.14C5.8 2.9 5 3.83 5 4.75v2.24c0 .06-.03.15-.1.23a8.06 8.06 0 0 0-1.11 1.56c-.08.16-.21.22-.3.22h-.74C1.78 9 1 9.79 1 10.75v2.5c0 .97.78 1.75 1.75 1.75h.74c.09 0 .22.06.3.22.3.57.67 1.1 1.1 1.56.08.09.11.17.11.23v2.24c0 .96.78 1.75 1.75 1.75h2.5c.97 0 1.75-.79 1.75-1.75 0-.14.11-.25.25-.25h1.5c.14 0 .25.11.25.25 0 .96.78 1.75 1.75 1.75h2.5c.97 0 1.75-.79 1.75-1.75v-2.23c0-.06.03-.15.1-.23.33-.34.61-.71.86-1.11a2.75 2.75 0 0 0 3.44-4.15.75.75 0 1 0-1.17.94 1.25 1.25 0 0 1-1.62 1.85c.26-.73.4-1.51.4-2.32a7 7 0 0 0-7-7h-3.86A6.32 6.32 0 0 0 6.9 3.14ZM8.25 12a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
          </svg>
        </styled.span>
        <Stacked primary="Savings" secondary="Wallet 2" />
      </Row>
      {device === 'phone' ? (
        <Row gap={16}>
          <Icon size={24}>
            <path d="M2.246 13.54c4.841-8.72 14.666-8.72 19.508 0M15 14a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </Icon>
          <Icon size={24}>
            <path d="M11.51 3.28a1 1 0 0 1 .98 0l7 3.93a1 1 0 0 1 .51.88v7.83a1 1 0 0 1-.51.87l-7 3.94a1 1 0 0 1-.98 0l-7-3.94a1 1 0 0 1-.51-.87V8.08a1 1 0 0 1 .51-.87l7-3.93Z" />
            <circle cx="12" cy="12" r="3" />
          </Icon>
        </Row>
      ) : (
        <Icon size={26}>
          <path d="M3 8h18M3 16h18" />
        </Icon>
      )}
    </Row>
  );
}

function BalanceBlock({ label, value }: { label: string; value: string }) {
  return (
    <styled.div display="flex" flexDir="column" style={{ gap: u(8) }}>
      <Row gap={5} style={{ ...type.body, fontWeight: 500 }}>
        {label}
        <styled.span style={{ color: secondaryInk }}>
          <InfoGlyph />
        </styled.span>
      </Row>
      <styled.span style={type.figure}>{value}</styled.span>
    </styled.div>
  );
}

const homeActions = ['Send', 'Receive', 'Swap', 'Buy'] as const;

function HomeScreen({ device }: ScreenProps) {
  const isPhone = device === 'phone';
  const bleed = isPhone ? 22 : 24;
  return (
    <>
      <AccountHeader device={device} />
      <styled.div style={{ marginTop: u(isPhone ? 30 : 46) }}>
        <BalanceBlock label="Total balance" value="$7,517.49" />
      </styled.div>
      <Divider style={{ marginTop: u(22) }} />
      <styled.div display="flex" flexDir="column" style={{ gap: u(8), marginTop: u(18) }}>
        <Row gap={5} style={{ ...type.body, fontWeight: 500 }}>
          Locked
          {isPhone && (
            <styled.span style={{ color: secondaryInk }}>
              <InfoGlyph />
            </styled.span>
          )}
        </Row>
        <styled.span style={type.amount}>$10,751.74</styled.span>
      </styled.div>
      <styled.div display="flex" style={{ gap: u(8), marginTop: u(24) }}>
        {homeActions.map((action, index) => (
          <styled.span
            key={action}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flex="1"
            borderRadius="round"
            style={{
              height: u(isPhone ? 46 : 48),
              border: `1px solid ${index === 0 ? 'transparent' : border}`,
              background: index === 0 ? 'var(--hero-primary-bg)' : 'transparent',
              color: index === 0 ? 'var(--hero-primary-ink)' : ink,
              ...type.body,
              fontWeight: 500,
            }}
          >
            {action}
          </styled.span>
        ))}
      </styled.div>
      <styled.div
        position="relative"
        display="flex"
        style={{
          marginTop: u(isPhone ? 30 : 36),
          marginInline: u(-bleed),
          paddingInline: u(bleed),
          gap: u(48),
          height: u(52),
          borderBottom: `${u(2)} solid var(--hero-divider)`,
          ...type.label,
          fontSize: u(17),
        }}
      >
        {(isPhone ? ['Tokens', 'Collectibles'] : ['Tokens', 'Collectibles', 'Activity']).map(
          (tab, index) => (
            <styled.span
              key={tab}
              position="relative"
              display="flex"
              alignItems="center"
              style={{ color: index === 0 || !isPhone ? ink : secondaryInk }}
            >
              {tab}
              {index === 0 && (
                <styled.span
                  position="absolute"
                  style={{
                    left: u(-bleed),
                    right: u(-26),
                    bottom: u(-2),
                    height: u(2),
                    background: ink,
                  }}
                />
              )}
            </styled.span>
          )
        )}
      </styled.div>
      <Row style={{ justifyContent: 'space-between', marginTop: u(26) }}>
        <styled.span display="flex" flexDir="column" style={{ gap: u(6) }}>
          <Row gap={5} style={{ ...type.meta, color: ink, fontWeight: 500 }}>
            Available
            {isPhone && (
              <styled.span style={{ color: secondaryInk }}>
                <InfoGlyph />
              </styled.span>
            )}
          </Row>
          <styled.span style={{ ...type.amount, fontSize: u(21) }}>$7,000.50</styled.span>
        </styled.span>
        <Icon size={18}>
          <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </Icon>
      </Row>
      <styled.div style={{ marginTop: u(20) }}>
        {tokenRows.map(row => (
          <Row key={row.token} height={isPhone ? 70 : 73} gap={14}>
            <TokenIcon token={row.token} />
            <styled.span flex="1" minWidth="0">
              <Stacked primary={row.name} secondary={row.ticker} />
            </styled.span>
            <Stacked primary={row.fiat} secondary={row.amount} align="end" />
          </Row>
        ))}
      </styled.div>
    </>
  );
}

const buyOffers = [
  { name: 'MoonPay', mark: '#7D00FF', amount: '0.00221 BTC', note: 'Best rate' },
  { name: 'Coinbase', mark: '#0052FF', amount: '0.00219 BTC' },
] as const;

/** Buy: the on-ramp. Leather hands the purchase to a provider; the best offer leads. */
function BuyScreen() {
  return (
    <>
      <ScreenHeader title="Buy" />
      <Box>
        <Row height={66} gap={12}>
          <TokenIcon token="btc" size={38} />
          <styled.span flex="1">
            <Stacked primary="Bitcoin" secondary="BTC" />
          </styled.span>
          <Icon size={18}>
            <path d="m6 9 6 6 6-6" />
          </Icon>
        </Row>
      </Box>
      <styled.div
        display="flex"
        flexDir="column"
        alignItems="center"
        style={{ gap: u(6), paddingBlock: u(26) }}
      >
        <styled.span style={type.meta}>You pay</styled.span>
        <styled.span style={{ ...type.figure, fontSize: u(56) }}>$250</styled.span>
        <styled.span style={{ ...type.body, color: secondaryInk }}>≈ 0.00221 BTC</styled.span>
      </styled.div>
      <styled.div display="flex" style={{ gap: u(8) }}>
        <Chip>$100</Chip>
        <Chip isSelected>$250</Chip>
        <Chip>$500</Chip>
      </styled.div>
      <styled.div style={{ ...type.meta, marginTop: u(22), marginBottom: u(8) }}>
        Provider
      </styled.div>
      <Box style={{ paddingBlock: u(4) }}>
        {buyOffers.map((offer, index) => (
          <Row
            key={offer.name}
            height={56}
            gap={12}
            style={{ borderTop: index > 0 ? `1px solid var(--hero-divider)` : undefined }}
          >
            <styled.span
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="50%"
              color="white"
              fontWeight="600"
              style={{ width: u(30), height: u(30), background: offer.mark, fontSize: u(14) }}
            >
              {offer.name[0]}
            </styled.span>
            <styled.span flex="1" display="flex" alignItems="center" style={{ gap: u(8) }}>
              <styled.span style={type.label}>{offer.name}</styled.span>
              {'note' in offer && (
                <styled.span
                  borderRadius="round"
                  style={{
                    ...type.meta,
                    fontSize: u(12),
                    color: 'var(--hero-positive)',
                    background: 'var(--hero-positive-wash)',
                    paddingInline: u(8),
                    paddingBlock: u(2),
                  }}
                >
                  {offer.note}
                </styled.span>
              )}
            </styled.span>
            <styled.span style={{ ...type.body, fontWeight: 500 }}>{offer.amount}</styled.span>
          </Row>
        ))}
      </Box>
      <PrimaryButton>Continue to MoonPay</PrimaryButton>
    </>
  );
}

function SendScreen() {
  return (
    <>
      <ScreenHeader title="Send" />
      <Box style={{ paddingInline: 0 }}>
        <Row
          height={66}
          gap={12}
          style={{ paddingInline: u(14), borderBottom: `1px solid ${border}` }}
        >
          <TokenIcon token="btc" size={38} />
          <styled.span flex="1" minWidth="0">
            <Stacked primary="Bitcoin" secondary="Native SegWit" />
          </styled.span>
          <Stacked primary="0.0340 BTC" secondary="$3,758.74" align="end" />
        </Row>
        <Row style={{ justifyContent: 'space-between', padding: u(14), alignItems: 'flex-start' }}>
          <styled.span display="flex" flexDir="column" style={{ gap: u(6) }}>
            <styled.span style={{ ...type.figure, fontSize: u(40) }}>0.005</styled.span>
            <Row gap={5} style={type.meta}>
              $552.76
              <Icon size={13}>
                <path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4" />
              </Icon>
            </Row>
          </styled.span>
          <styled.span style={{ ...type.body, fontWeight: 500 }}>MAX</styled.span>
        </Row>
      </Box>
      <Box style={{ marginTop: u(10) }}>
        <Row height={56} style={{ justifyContent: 'space-between' }}>
          <styled.span style={{ ...type.label }}>bc1q8c6f…u7x9h</styled.span>
          <Icon size={20}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M14 14h2.5v2.5M21 14v2.5M14 21h2.5M19 19h2v2" />
          </Icon>
        </Row>
      </Box>
      <styled.div style={{ marginTop: u(16) }}>
        <DetailRow label="Fee" value="Standard · $1.24" />
        <DetailRow label="Arrives" value="~30 min" />
      </styled.div>
      <PrimaryButton>Review</PrimaryButton>
    </>
  );
}

function SwapPanel({
  token,
  ticker,
  amount,
  fiat,
  caption,
}: {
  token: Token;
  ticker: string;
  amount: string;
  fiat: string;
  caption: string;
}) {
  return (
    <styled.div style={{ background: 'var(--hero-surface)', borderRadius: u(16), padding: u(14) }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row
          gap={8}
          style={{
            border: `1px solid ${border}`,
            borderRadius: u(999),
            padding: `${u(5)} ${u(10)} ${u(5)} ${u(5)}`,
            background: 'var(--hero-bg)',
            ...type.label,
          }}
        >
          <styled.img
            src={tokenIcon[token]}
            alt=""
            borderRadius="50%"
            style={{ width: u(26), height: u(26) }}
          />
          {ticker}
          <Icon size={14}>
            <path d="m6 9 6 6 6-6" />
          </Icon>
        </Row>
        <styled.span style={{ ...type.figure, fontSize: u(32), fontWeight: 600 }}>
          {amount}
        </styled.span>
      </Row>
      <Row style={{ justifyContent: 'space-between', marginTop: u(10), ...type.meta }}>
        <span>{caption}</span>
        <span>{fiat}</span>
      </Row>
    </styled.div>
  );
}

function SwapScreen() {
  return (
    <>
      <ScreenHeader title="Swap" />
      <SwapPanel token="stx" ticker="STX" amount="1,000" fiat="$435.90" caption="Balance 3,449.3" />
      <styled.div display="flex" justifyContent="center" style={{ height: u(6) }}>
        <styled.span
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          zIndex="1"
          borderRadius="50%"
          style={{
            width: u(36),
            height: u(36),
            marginTop: u(-15),
            background: 'var(--hero-bg)',
            border: `1px solid ${border}`,
          }}
        >
          <Icon size={16}>
            <path d="M12 4v16M6 14l6 6 6-6" />
          </Icon>
        </styled.span>
      </styled.div>
      <SwapPanel
        token="sbtc"
        ticker="sBTC"
        amount="0.00391"
        fiat="$432.25"
        caption="Balance 0.0204"
      />
      <styled.div display="flex" style={{ gap: u(8), marginTop: u(14) }}>
        <Chip>25%</Chip>
        <Chip>50%</Chip>
        <Chip>75%</Chip>
        <Chip>MAX</Chip>
      </styled.div>
      <styled.div style={{ marginTop: u(14) }}>
        <DetailRow label="Rate" value="1 STX ≈ 0.0000039 sBTC" />
        <DetailRow
          label="Quote from"
          value={
            <Row gap={6}>
              <styled.img
                src="/icons/bitflow.png"
                alt=""
                borderRadius="50%"
                style={{ width: u(18), height: u(18) }}
              />
              Bitflow
            </Row>
          }
        />
      </styled.div>
      <PrimaryButton>Review</PrimaryButton>
    </>
  );
}

const bondCycle = 5;
const bondCycles = 12;

/**
 * Bitcoin Staking: one protocol bond, as the extension lists it (Period, status badge, Amount,
 * STX stacked, Unlocks, Paid out). A bond runs 12 reward cycles, about six months, and pays out
 * in sBTC by default (docs.stacks.co/learn/bitcoin-staking). No rate is shown.
 */
function EarnScreen({ isActive, isAnimated }: ScreenProps) {
  const progress = isActive || !isAnimated ? bondCycle / bondCycles : 0;
  return (
    <>
      <ScreenHeader title="Bitcoin Staking" />
      <styled.div display="flex" flexDir="column" style={{ gap: u(6) }}>
        <styled.span style={{ ...type.body, fontWeight: 500 }}>In a bond</styled.span>
        <styled.span style={{ ...type.figure, fontSize: u(40) }}>0.0150 BTC</styled.span>
        <styled.span style={type.meta}>$1,658.27 · stays on Bitcoin, under a timelock</styled.span>
      </styled.div>
      <Box style={{ marginTop: u(22), paddingBlock: u(14) }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <styled.span style={type.label}>Period 3</styled.span>
          <styled.span
            borderRadius="round"
            style={{
              ...type.meta,
              color: ink,
              fontWeight: 500,
              border: `1px solid ${border}`,
              paddingInline: u(10),
              paddingBlock: u(3),
            }}
          >
            Active
          </styled.span>
        </Row>
        <styled.div style={{ marginTop: u(14) }}>
          <Row style={{ justifyContent: 'space-between', ...type.meta }}>
            <span>
              Cycle {bondCycle} of {bondCycles}
            </span>
            <span>about 6 months</span>
          </Row>
          <styled.div
            overflow="hidden"
            borderRadius="round"
            style={{ height: u(6), marginTop: u(8), background: 'var(--hero-divider)' }}
          >
            <styled.div
              borderRadius="round"
              style={{
                height: '100%',
                width: '100%',
                background: '#F7931A',
                transformOrigin: 'left',
                transform: `scaleX(${progress})`,
                transition: isAnimated ? `transform 900ms ${ease} 200ms` : undefined,
              }}
            />
          </styled.div>
        </styled.div>
        <styled.div style={{ marginTop: u(10) }}>
          <DetailRow label="Amount" value="0.0150 BTC" />
          <DetailRow label="STX stacked" value="20,861 STX" />
          <DetailRow label="Unlocks" value="about May 2027" />
          <DetailRow label="Paid out" value="+0.00012 sBTC" valueColor="var(--hero-positive)" />
        </styled.div>
      </Box>
      <styled.div style={{ ...type.meta, marginTop: u(12) }}>
        Rewards pay out in sBTC by default.
      </styled.div>
    </>
  );
}

// A year of portfolio value, sampled; normalised 0–1. Illustrative.
const growthTrace = [
  0.18, 0.2, 0.16, 0.22, 0.26, 0.24, 0.3, 0.27, 0.33, 0.31, 0.36, 0.42, 0.39, 0.45, 0.43, 0.5, 0.47,
  0.55, 0.58, 0.54, 0.6, 0.66, 0.63, 0.7, 0.68, 0.75, 0.8, 0.77, 0.84, 0.9,
];

const allocation = [
  { token: 'btc', name: 'Bitcoin', share: 0.5, color: '#F7931A' },
  { token: 'sbtc', name: 'sBTC', share: 0.3, color: '#FF5F33' },
  { token: 'stx', name: 'Stacks', share: 0.2, color: '#FC6432' },
] as const;

function GrowthChart({ isActive, isAnimated }: { isActive: boolean; isAnimated: boolean }) {
  const width = 400;
  const height = 150;
  const step = width / (growthTrace.length - 1);
  const points = growthTrace.map(
    (value, index) => `${(index * step).toFixed(1)},${(height - value * height).toFixed(1)}`
  );
  const line = `M${points.join(' L')}`;
  const area = `${line} L${width},${height} L0,${height} Z`;
  const isDrawn = isActive || !isAnimated;
  return (
    <svg
      viewBox={`0 -4 ${width} ${height + 4}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: u(150), display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="hero-growth-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--hero-positive)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--hero-positive)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={area}
        fill="url(#hero-growth-fill)"
        style={{
          opacity: isDrawn ? 1 : 0,
          transition: isAnimated ? `opacity 600ms ${ease} 700ms` : undefined,
        }}
      />
      <path
        d={line}
        fill="none"
        stroke="var(--hero-positive)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: isDrawn ? 0 : 1,
          transition: isAnimated ? `stroke-dashoffset 1400ms ${ease} 150ms` : undefined,
        }}
      />
    </svg>
  );
}

function GrowScreen({ device, isActive, isAnimated }: ScreenProps) {
  return (
    <>
      <AccountHeader device={device} />
      <styled.div style={{ marginTop: u(device === 'phone' ? 30 : 46) }}>
        <BalanceBlock label="Total balance" value="$7,517.49" />
      </styled.div>
      <Row gap={6} style={{ ...type.body, marginTop: u(8), color: 'var(--hero-positive)' }}>
        <Icon size={14}>
          <path d="M7 17 17 7M9 7h8v8" />
        </Icon>
        <styled.span fontWeight="500">$1,412.08 (23.1%)</styled.span>
        <styled.span style={{ color: secondaryInk }}>past year</styled.span>
      </Row>
      <styled.div style={{ marginTop: u(22) }}>
        <GrowthChart isActive={isActive} isAnimated={isAnimated} />
      </styled.div>
      <styled.div display="flex" style={{ gap: u(8), marginTop: u(16) }}>
        <Chip>1W</Chip>
        <Chip>1M</Chip>
        <Chip isSelected>1Y</Chip>
        <Chip>All</Chip>
      </styled.div>
      <styled.div
        display="flex"
        overflow="hidden"
        borderRadius="round"
        style={{ height: u(8), marginTop: u(24), gap: u(3) }}
      >
        {allocation.map(slice => (
          <styled.span key={slice.token} style={{ flex: slice.share, background: slice.color }} />
        ))}
      </styled.div>
      <styled.div style={{ marginTop: u(10) }}>
        {allocation.map(slice => (
          <Row key={slice.token} height={30} gap={8} style={type.body}>
            <styled.span
              borderRadius="50%"
              style={{ width: u(8), height: u(8), background: slice.color }}
            />
            <styled.span flex="1">{slice.name}</styled.span>
            <styled.span style={{ color: secondaryInk }}>
              {Math.round(slice.share * 100)}%
            </styled.span>
          </Row>
        ))}
      </styled.div>
    </>
  );
}

const screens: Record<HeroView, (props: ScreenProps) => ReactNode> = {
  home: HomeScreen,
  buy: BuyScreen,
  send: SendScreen,
  swap: SwapScreen,
  earn: EarnScreen,
  grow: GrowScreen,
};
const views: HeroView[] = ['home', 'buy', 'send', 'swap', 'earn', 'grow'];

/** Out quickly, then in, so two screens never read on top of each other. */
function screenTransition(isActive: boolean) {
  if (!isActive)
    return 'opacity 140ms ease-out, transform 140ms ease-out, visibility 0ms linear 140ms';
  const delay = 120;
  return `opacity ${viewTransitionMs - delay}ms ${ease} ${delay}ms, transform ${viewTransitionMs}ms ${ease} ${delay}ms, visibility 0ms linear 0ms`;
}

/** Every screen, stacked; the active one fades and rises in, the rest fade out. */
function Screens({
  device,
  view,
  isAnimated,
  style,
}: {
  device: Device;
  view: HeroView;
  isAnimated: boolean;
  style: CSSProperties;
}) {
  return (
    <>
      {views.map(key => {
        const Screen = screens[key];
        const isActive = key === view;
        return (
          <styled.div
            key={key}
            position="absolute"
            inset="0"
            style={{
              ...style,
              opacity: isActive ? 1 : 0,
              visibility: isActive ? 'visible' : 'hidden',
              transform: isActive ? 'none' : `translateY(${u(10)})`,
              transition: isAnimated ? screenTransition(isActive) : undefined,
            }}
          >
            <Screen device={device} isActive={isActive} isAnimated={isAnimated} />
          </styled.div>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Devices                                                                                       */
/* -------------------------------------------------------------------------------------------- */

interface DeviceProps {
  view: HeroView;
  isAnimated: boolean;
}

function deviceRoot(theme: DeviceTheme, width: number): DeviceStyle {
  return {
    ...palette[theme],
    '--hero-unit': `calc(100cqw / ${width})`,
    color: 'var(--hero-ink)',
    fontFeatureSettings: '"tnum"',
    textAlign: 'left',
  };
}

const extensionWidth = 1214;

/** The extension popup expanded in a dark browser window, as in the old hero image. */
export function HeroExtension({ view, isAnimated }: DeviceProps) {
  return (
    <styled.div width="100%" style={{ containerType: 'inline-size' }}>
      <styled.div
        position="relative"
        overflow="hidden"
        style={{
          ...deviceRoot('dark', extensionWidth),
          height: u(1000),
          background: 'var(--hero-bg)',
          borderRadius: `${u(18)} ${u(18)} 0 0`,
          boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.06) inset`,
        }}
      >
        {/* Window bar: traffic lights, address bar, extension button */}
        <styled.div
          position="relative"
          display="flex"
          alignItems="center"
          style={{
            height: u(34),
            paddingInline: u(14),
            gap: u(7),
            background: '#1A1817',
            borderBottom: '1px solid #2A2725',
          }}
        >
          {['#FF5F57', '#FEBC2E', '#28C840'].map(color => (
            <styled.span
              key={color}
              borderRadius="50%"
              style={{ width: u(11), height: u(11), background: color }}
            />
          ))}
          <styled.span
            position="absolute"
            borderRadius="round"
            style={{
              left: u(277),
              width: u(690),
              top: u(10),
              height: u(15),
              background: '#2E2B29',
            }}
          />
          <styled.span
            position="absolute"
            style={{
              right: u(12),
              top: u(10),
              width: u(14),
              height: u(14),
              borderRadius: u(3),
              background: '#E9E5E1',
            }}
          />
        </styled.div>
        <Screens
          device="extension"
          view={view}
          isAnimated={isAnimated}
          style={{ top: u(34), paddingTop: u(52), paddingInline: u(281) }}
        />
      </styled.div>
    </styled.div>
  );
}

const phoneWidth = 412;
const phoneHeight = 846;
const phoneBezel = 17;
const phoneTabs = ['Home', 'Activity', 'Browse'] as const;

/** The mobile app in a phone frame: status bar, Dynamic Island, and the tab bar on home. */
export function HeroPhone({ view, isAnimated }: DeviceProps) {
  const showTabBar = view === 'home' || view === 'grow';
  return (
    <styled.div width="100%" style={{ containerType: 'inline-size' }}>
      <styled.div
        position="relative"
        style={{
          ...deviceRoot('light', phoneWidth),
          height: u(phoneHeight),
          borderRadius: u(66),
          background: '#0D0C0B',
          boxShadow: `0 0 0 ${u(2.5)} #3B3836 inset`,
        }}
      >
        <styled.div
          position="absolute"
          overflow="hidden"
          style={{
            inset: u(phoneBezel),
            borderRadius: u(50),
            background: 'var(--hero-bg)',
          }}
        >
          {/* Status bar */}
          <styled.div
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            zIndex="1"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: u(54),
              paddingInline: u(32),
              fontSize: u(16),
              fontWeight: 600,
            }}
          >
            9:41
            <Row gap={5}>
              <svg viewBox="0 0 18 12" style={{ width: u(18), height: u(12) }} fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                <rect x="10" y="3" width="3" height="9" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <svg viewBox="0 0 16 12" style={{ width: u(16), height: u(12) }} fill="currentColor">
                <path d="M8 2.2c2.2 0 4.2.85 5.7 2.25l1.2-1.25A9.9 9.9 0 0 0 8 .4 9.9 9.9 0 0 0 1.1 3.2l1.2 1.25A8.2 8.2 0 0 1 8 2.2Zm0 3.6c1.2 0 2.3.45 3.2 1.2l1.2-1.25A6.4 6.4 0 0 0 8 4a6.4 6.4 0 0 0-4.4 1.75L4.8 7c.9-.75 2-1.2 3.2-1.2Zm0 3.6c-.4 0-.8.15-1.1.4L8 11l1.1-1.2c-.3-.25-.7-.4-1.1-.4Z" />
              </svg>
              <svg viewBox="0 0 27 13" style={{ width: u(27), height: u(13) }}>
                <rect
                  x="0.5"
                  y="0.5"
                  width="23"
                  height="12"
                  rx="3.5"
                  fill="none"
                  stroke="currentColor"
                  opacity="0.4"
                />
                <rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" />
                <path
                  d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
            </Row>
          </styled.div>
          {/* Dynamic Island */}
          <styled.span
            position="absolute"
            zIndex="1"
            borderRadius="round"
            style={{
              top: u(10),
              left: '50%',
              width: u(117),
              height: u(34),
              transform: 'translateX(-50%)',
              background: '#0D0C0B',
            }}
          />
          <Screens
            device="phone"
            view={view}
            isAnimated={isAnimated}
            style={{ paddingTop: u(70), paddingInline: u(22) }}
          />
          {/* Tab bar on the top-level screens; flows open as sheets above it */}
          <styled.div
            position="absolute"
            display="flex"
            justifyContent="space-around"
            zIndex="1"
            style={{
              left: 0,
              right: 0,
              bottom: 0,
              height: u(78),
              paddingTop: u(10),
              paddingInline: u(28),
              background: 'var(--hero-bg)',
              borderTop: '1px solid var(--hero-divider)',
              opacity: showTabBar ? 1 : 0,
              transform: showTabBar ? 'none' : `translateY(${u(20)})`,
              transition: isAnimated
                ? `opacity ${viewTransitionMs}ms ${ease}, transform ${viewTransitionMs}ms ${ease}`
                : undefined,
            }}
          >
            {phoneTabs.map((tab, index) => (
              <styled.span
                key={tab}
                display="flex"
                flexDir="column"
                alignItems="center"
                style={{ gap: u(4), fontSize: u(13), fontWeight: 500 }}
              >
                <Icon size={22}>
                  {index === 0 && (
                    <path
                      d="M13.26 1.74a2 2 0 0 0-2.52 0l-7 5.69A2 2 0 0 0 3 8.98V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.98a2 2 0 0 0-.74-1.55l-7-5.69Z"
                      fill="currentColor"
                      stroke="none"
                    />
                  )}
                  {index === 1 && (
                    <path d="M2 12h3.27a1 1 0 0 0 .95-.7l2.54-8.05c.08-.23.4-.23.48 0l5.52 17.5c.08.23.4.23.48 0l2.54-8.05a1 1 0 0 1 .95-.7H22" />
                  )}
                  {index === 2 && (
                    <>
                      <circle cx="12" cy="12" r="9" />
                      <path d="m14.66 8.73-4.1 1.12a1 1 0 0 0-.7.7l-1.13 4.1c-.1.38.24.72.62.62l4.1-1.12a1 1 0 0 0 .7-.7l1.13-4.1c.1-.38-.24-.72-.62-.62Z" />
                    </>
                  )}
                </Icon>
                {tab}
              </styled.span>
            ))}
          </styled.div>
        </styled.div>
      </styled.div>
    </styled.div>
  );
}

export const heroViewDescriptions: Record<HeroView, string> = {
  home: 'The Leather browser extension and mobile app showing a wallet with a total balance of $7,517.49 and Stacks, Bitcoin and sBTC holdings',
  buy: 'Leather’s Buy screen: $250 of bitcoin, with offers from MoonPay and Coinbase',
  send: 'Leather’s Send screen: 0.005 BTC to a Bitcoin address, ready to review',
  swap: 'Leather’s Swap screen: 1,000 STX to sBTC, with a quote from Bitflow',
  earn: 'Leather’s Bitcoin Staking screen: 0.015 BTC in an active protocol bond, cycle 5 of 12',
  grow: 'Leather’s portfolio: a total balance of $7,517.49 with its value over the past year',
};
