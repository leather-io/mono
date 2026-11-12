import { type CSSProperties, type ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

/**
 * The homepage hero's two devices, rebuilt in HTML so their screens can follow the headline verbs.
 * The large frame is a browser window running the Leather EXTENSION (dark theme); the phone runs
 * the Leather MOBILE app (light theme). Each device mirrors its own app's screens, labels and
 * layout, from its own source in this repo:
 *
 *   Extension (apps/extension/src/app), in its full-page tab: the same routes the popup shows,
 *   laid out for a tab. Headers and the home column are centred and at most 882 wide
 *   (`sizes.fullPageMaxWidth`, components/layout/headers/header.tsx, layouts/content.layout.tsx);
 *   form pages sit in a centred 500 card (`sizes.pageWidth`, page/page.layout.tsx, card/card.tsx).
 *   - home   pages/home/home.tsx: features/container/headers/home.header.tsx (no Expand button
 *            in a tab), account-card.tsx, features/bonds/components/locked-balance-card.tsx,
 *            account-actions-current/* (md and up: Buy, Sell, Send, Receive, Swap),
 *            home-tabs.tsx, tokens-tab-header.tsx,
 *            components/crypto-asset-item/crypto-asset-item.layout.tsx
 *   - buy    pages/fund/fund.tsx: page.header.tsx, then the Onramper widget, themed with
 *            Leather's colours (packages/features/src/onramper/onramper-params.ts)
 *   - send   pages/send/send-crypto-asset-form/form/btc/btc-send-form.tsx and its components
 *   - swap   pages/swap/swap-form.tsx and pages/swap/components/*
 *   - earn   pages/all-balances/all-balances-detail.tsx, bond-positions-detail.tsx,
 *            components/bond-position-section.tsx
 *   - grow   features/token/token-details.layout.tsx in its 780 column
 *            (components/token-details-screen.tsx, token-details-header.tsx), token-overview.tsx,
 *            token-details-actions.tsx, token-details-tabs.tsx, price-history/*
 *
 *   Mobile (apps/mobile/src)
 *   - home   components/home/home-with-account-screen.tsx, features/account/components/*
 *            (account-header, account-total-balance, account-stacking, account-actions,
 *            available-account-balance), components/home/components/asset-tabs.tsx,
 *            features/token/components/token-cell.tsx, features/navigation/tab-layout.tsx
 *   - buy    features/ramp/ramp-sheet.tsx: a full-height sheet holding the Onramper widget
 *   - send   features/send/screens/form.tsx, forms/btc/btc-form.tsx, components/amount-field
 *   - swap   features/swap/screens/swap-form-screen.tsx and its components
 *   - earn   Mobile has no staking or bond screen. It shows its real stacking surface instead: the
 *            Locked STX block on home with its "Locked" description sheet open
 *            (features/account/components/account-stacking.tsx, features/settings/description-sheet.tsx)
 *   - grow   Mobile token details (features/token/token.tsx, token-details-table.tsx,
 *            components/balance/price-change.tsx). Mobile has no price chart; this is its
 *            price and 24-hour-change view. The chart is on the extension.
 *
 * Every size is in reference pixels converted to container units, so the art scales with its
 * frame: the browser window is 1040 units wide, the phone 412, and the apps inside use their real
 * pixel sizes. Figures are illustrative and use one set of prices: $110,550 / BTC, $0.436 / STX.
 */

export type HeroView = 'home' | 'buy' | 'send' | 'swap' | 'earn' | 'grow';

/** Reference unit → length; resolves against the nearest device container. */
function u(n: number) {
  return `calc(var(--hero-unit) * ${n})`;
}

const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
const viewTransitionMs = 420;

/* -------------------------------------------------------------------------------------------- */
/* Tokens: packages/tokens (colorThemes, text variants)                                          */
/* -------------------------------------------------------------------------------------------- */

type Theme = 'light' | 'dark';
type InkVariable = `--ink-${string}`;
type ThemeStyle = CSSProperties & Record<InkVariable | '--hero-unit', string>;

const themes: Record<Theme, Record<InkVariable, string>> = {
  light: {
    '--ink-bg': '#FFFFFF',
    '--ink-bg-2': '#F9F9F8',
    '--ink-text': '#12100F',
    '--ink-subdued': '#7B7572',
    '--ink-muted': '#9E9996',
    '--ink-border': '#E5E3E1',
    '--ink-border-t': '#463f3c1a',
    '--ink-component': '#F1EFED',
    '--ink-hover': '#BEB0A71A',
    '--ink-action': '#12100F',
    '--ink-overlay': '#12100F66',
  },
  dark: {
    '--ink-bg': '#12100F',
    '--ink-bg-2': '#1F1C1A',
    '--ink-text': '#F9F9F8',
    '--ink-subdued': '#D9D6D4',
    '--ink-muted': '#9E9996',
    '--ink-border': '#46413E',
    '--ink-border-t': '#F5F1ED33',
    '--ink-component': '#292623',
    '--ink-hover': '#716A604D',
    '--ink-action': '#F9F9F8',
    '--ink-overlay': '#12100FA6',
  },
};

const c = {
  bg: 'var(--ink-bg)',
  bg2: 'var(--ink-bg-2)',
  text: 'var(--ink-text)',
  subdued: 'var(--ink-subdued)',
  muted: 'var(--ink-muted)',
  border: 'var(--ink-border)',
  borderT: 'var(--ink-border-t)',
  component: 'var(--ink-component)',
  hover: 'var(--ink-hover)',
  action: 'var(--ink-action)',
  overlay: 'var(--ink-overlay)',
  green: '#1CBA7D',
};

const marche = { fontFamily: 'Marche', textTransform: 'uppercase' } as const;
const t = {
  heading02: { ...marche, fontSize: u(44), lineHeight: u(44) },
  heading03: { ...marche, fontSize: u(32), lineHeight: u(35), letterSpacing: u(0.64) },
  heading05: { fontSize: u(21), lineHeight: u(28), fontWeight: 500 },
  label01: { fontSize: u(17), lineHeight: u(24), fontWeight: 500, letterSpacing: u(0.16) },
  label02: { fontSize: u(15), lineHeight: u(20), fontWeight: 500 },
  label03: { fontSize: u(13), lineHeight: u(16), fontWeight: 500 },
  body01: { fontSize: u(17), lineHeight: u(24), fontWeight: 400 },
  body02: { fontSize: u(15), lineHeight: u(20), fontWeight: 400 },
  caption01: { fontSize: u(13), lineHeight: u(20), fontWeight: 400 },
} as const satisfies Record<string, CSSProperties>;

/* -------------------------------------------------------------------------------------------- */
/* Figures, kept consistent across both devices                                                 */
/* -------------------------------------------------------------------------------------------- */

const figures = {
  total: '$10,920.06',
  available: '$7,517.81',
  locked: '$3,402.25',
  lockedStx: '$1,744.00',
  btcPrice: '$110,550.00',
  btcChangePercent: '1.84%',
  btcChangeFiat: '$1,997.40',
};

const tokenIcon = {
  btc: '/icons/bitcoin.svg',
  stx: '/icons/stacks.svg',
  sbtc: '/icons/sbtc.svg',
} as const;
type Token = keyof typeof tokenIcon;
const tokenChain: Record<Token, Token> = { btc: 'btc', stx: 'stx', sbtc: 'stx' };

const holdings = [
  {
    token: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    fiat: '$5,416.95',
    amount: '0.049',
    locked: '0.015',
  },
  {
    token: 'stx',
    name: 'Stacks',
    symbol: 'STX',
    fiat: '$3,247.89',
    amount: '7,449.3',
    locked: '4,000',
  },
  { token: 'sbtc', name: 'sBTC', symbol: 'sBTC', fiat: '$2,255.22', amount: '0.0204' },
] as const satisfies readonly { token: Token; [key: string]: string }[];

/* -------------------------------------------------------------------------------------------- */
/* Small parts                                                                                   */
/* -------------------------------------------------------------------------------------------- */

const Div = styled.div;
const Span = styled.span;

function Icon({ size, children, viewBox = '0 0 24 24', strokeWidth = 1.75, style }: IconProps) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: u(size), height: u(size), flexShrink: 0, display: 'block', ...style }}
    >
      {children}
    </svg>
  );
}
interface IconProps {
  size: number;
  children: ReactNode;
  viewBox?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

const glyph = {
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m18 15-6-6-6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M11 11h1v5M12 8h.01" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.4M12 17h.01" />
    </>
  ),
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  gear: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h2.5v2.5M21 14v2.5M14 21h2.5M19 19h2v2" />
    </>
  ),
  switch: <path d="M7 20V4M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4" />,
  flip: <path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" />,
  external: (
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  ),
  backspace: <path d="M21 5H8l-6 7 6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1ZM17 9l-6 6M11 9l6 6" />,
};

/** Token logo, with the chain badge the mobile avatars carry. */
function TokenIcon({ token, size, badge }: { token: Token; size: number; badge?: boolean }) {
  const badgeSize = Math.round(size * 0.36);
  return (
    <Span position="relative" flexShrink="0" style={{ width: u(size), height: u(size) }}>
      <styled.img
        src={tokenIcon[token]}
        alt=""
        display="block"
        borderRadius="50%"
        style={{ width: '100%', height: '100%' }}
      />
      {badge && (
        <styled.img
          src={tokenIcon[tokenChain[token]]}
          alt=""
          position="absolute"
          borderRadius="50%"
          style={{
            width: u(badgeSize),
            height: u(badgeSize),
            right: u(-2),
            bottom: u(-2),
            boxShadow: `0 0 0 ${u(2)} ${c.bg}`,
          }}
        />
      )}
    </Span>
  );
}

function Row({
  children,
  gap = 0,
  justify,
  align = 'center',
  style,
}: {
  children: ReactNode;
  gap?: number;
  justify?: CSSProperties['justifyContent'];
  align?: CSSProperties['alignItems'];
  style?: CSSProperties;
}) {
  return (
    <Div
      display="flex"
      style={{ gap: u(gap), justifyContent: justify, alignItems: align, ...style }}
    >
      {children}
    </Div>
  );
}

function Column({
  children,
  gap = 0,
  align,
  style,
}: {
  children: ReactNode;
  gap?: number;
  align?: CSSProperties['alignItems'];
  style?: CSSProperties;
}) {
  return (
    <Div display="flex" flexDir="column" style={{ gap: u(gap), alignItems: align, ...style }}>
      {children}
    </Div>
  );
}

function Text({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <Span whiteSpace="nowrap" style={style}>
      {children}
    </Span>
  );
}

/** Label with the small info or question glyph after it (Flag reverse). */
function LabelWithHint({
  children,
  hint = 'info',
  style,
}: {
  children: ReactNode;
  hint?: 'info' | 'question';
  style?: CSSProperties;
}) {
  return (
    <Row gap={4} style={style}>
      <Text>{children}</Text>
      <Span style={{ color: c.subdued }}>
        <Icon size={14}>{glyph[hint]}</Icon>
      </Span>
    </Row>
  );
}

/** packages/ui Button: always a pill; solid or outline; sm 32, md 36, lg 48. */
function Pill({
  children,
  variant = 'outline',
  height = 48,
  px = 16,
  style,
}: {
  children: ReactNode;
  variant?: 'solid' | 'outline';
  height?: number;
  px?: number;
  style?: CSSProperties;
}) {
  const isSolid = variant === 'solid';
  return (
    <Span
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      whiteSpace="nowrap"
      flexShrink="0"
      style={{
        height: u(height),
        paddingInline: u(px),
        background: isSolid ? c.action : 'transparent',
        color: isSolid ? c.bg : c.action,
        border: isSolid ? 'none' : `1px solid ${c.border}`,
        ...t.label02,
        ...style,
      }}
    >
      {children}
    </Span>
  );
}

function Hairline({ bleed = 0, color = c.border, style }: HairlineProps) {
  return (
    <Div
      style={{ height: 1, background: color, marginInline: u(-bleed), flexShrink: 0, ...style }}
    />
  );
}
interface HairlineProps {
  bleed?: number;
  color?: string;
  style?: CSSProperties;
}

/** packages/ui Tabs (web): equal-width triggers, label.01, a 2px rule under the active one. */
function WebTabs({ tabs, active }: { tabs: string[]; active: string }) {
  return (
    <Div display="flex" position="relative" style={{ boxShadow: `inset 0 ${u(-2)} 0 ${c.border}` }}>
      {tabs.map(tab => (
        <Span
          key={tab}
          flex="1"
          display="flex"
          justifyContent="center"
          position="relative"
          style={{
            ...t.label01,
            paddingBlock: u(16),
            color: tab === active ? c.text : c.subdued,
            boxShadow: tab === active ? `inset 0 ${u(-2)} 0 ${c.subdued}` : undefined,
          }}
        >
          {tab}
        </Span>
      ))}
    </Div>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Price chart (extension features/token/components/price-history)                              */
/* -------------------------------------------------------------------------------------------- */

// One day of BTC prices, normalised 0–1. Illustrative; ends at the current price.
const dayTrace = [
  0.32, 0.3, 0.34, 0.29, 0.25, 0.27, 0.22, 0.2, 0.24, 0.31, 0.28, 0.35, 0.4, 0.37, 0.42, 0.39, 0.45,
  0.52, 0.48, 0.5, 0.56, 0.53, 0.47, 0.51, 0.58, 0.62, 0.59, 0.66, 0.63, 0.7, 0.74, 0.69, 0.72,
  0.78, 0.75, 0.81, 0.86, 0.83, 0.88, 0.92,
];

function PriceChart({ isDrawn, isAnimated }: { isDrawn: boolean; isAnimated: boolean }) {
  // The chart's own size in the 780 token details column (less 24 padding each side, by 140), so
  // the stroke stays even without vector-effect, which renders unreliably inside the tilted rig
  const width = 732;
  const height = 140;
  const step = width / (dayTrace.length - 1);
  const path = `M${dayTrace
    .map((value, index) => `${(index * step).toFixed(2)},${((1 - value) * height).toFixed(2)}`)
    .join(' L')}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{
        width: '100%',
        height: u(height),
        display: 'block',
        overflow: 'visible',
        clipPath: isDrawn ? 'inset(-8px -8px -8px -8px)' : 'inset(-8px 100% -8px -8px)',
        transition: isAnimated ? `clip-path 1400ms ${ease} 200ms` : undefined,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={c.green}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Onramper widget, themed with Leather's colours (onramper-params.ts)                           */
/* -------------------------------------------------------------------------------------------- */

function OnramperField({
  label,
  amount,
  asset,
}: {
  label: string;
  amount: string;
  asset: ReactNode;
}) {
  return (
    <Div style={{ background: c.hover, borderRadius: u(12), padding: u(14) }}>
      <Text style={{ ...t.caption01, color: c.subdued }}>{label}</Text>
      <Row justify="space-between" style={{ marginTop: u(4) }}>
        <Text style={{ fontSize: u(26), lineHeight: u(32), fontWeight: 500 }}>{amount}</Text>
        <Row
          gap={6}
          style={{
            ...t.label02,
            background: c.bg,
            borderRadius: u(999),
            padding: `${u(5)} ${u(10)}`,
          }}
        >
          {asset}
          <Icon size={14}>{glyph.chevronDown}</Icon>
        </Row>
      </Row>
    </Div>
  );
}

function OnramperWidget() {
  return (
    <Column gap={10} style={{ padding: u(16), color: c.text }}>
      <Row gap={20} style={{ ...t.label01, marginBottom: u(4) }}>
        <Text>Buy</Text>
        <Text style={{ color: c.subdued }}>Sell</Text>
      </Row>
      <OnramperField label="You pay" amount="250" asset={<Text>USD</Text>} />
      <OnramperField
        label="You get"
        amount="0.00221"
        asset={
          <>
            <TokenIcon token="btc" size={20} />
            <Text>BTC</Text>
          </>
        }
      />
      <Row
        justify="space-between"
        style={{ ...t.body02, border: `1px solid ${c.hover}`, borderRadius: u(12), padding: u(14) }}
      >
        <Text style={{ color: c.subdued }}>Pay with</Text>
        <Row gap={6}>
          <Text style={t.label02}>Card</Text>
          <Icon size={14}>{glyph.chevronDown}</Icon>
        </Row>
      </Row>
      <Row
        justify="space-between"
        style={{ ...t.body02, border: `1px solid ${c.hover}`, borderRadius: u(12), padding: u(14) }}
      >
        <Text style={{ color: c.subdued }}>Via</Text>
        <Row gap={8}>
          <Span
            borderRadius="round"
            style={{
              ...t.label03,
              color: c.green,
              background: 'rgba(28, 186, 125, 0.14)',
              padding: `${u(2)} ${u(8)}`,
            }}
          >
            Best rate
          </Span>
          <Text style={t.label02}>MoonPay</Text>
          <Icon size={14}>{glyph.chevronDown}</Icon>
        </Row>
      </Row>
      <Div
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{
          ...t.label02,
          height: u(48),
          borderRadius: u(12),
          background: c.action,
          color: c.bg,
          marginTop: u(6),
        }}
      >
        Buy BTC
      </Div>
      <Text style={{ ...t.caption01, color: c.subdued, textAlign: 'center' }}>
        Powered by Onramper
      </Text>
    </Column>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Extension screens (dark theme, full-page tab)                                                 */
/* -------------------------------------------------------------------------------------------- */

interface ScreenProps {
  isActive: boolean;
  isAnimated: boolean;
}

// packages/tokens sizes: the full-page header and content column, and the centred form page
const fullPageMaxWidth = 882;
const pageWidth = 500;
// features/token/components/token-details-screen.tsx: the token details column from md up
const tokenDetailsWidth = 780;

function HeaderButton({ children }: { children: ReactNode }) {
  return (
    <Span
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{ width: u(40), height: u(40) }}
    >
      {children}
    </Span>
  );
}

/** packages/ui logo.web.tsx: the Leather logomark (assets/icons/leather-logomark.svg). */
function Logomark() {
  return (
    <svg
      viewBox="0 0 86 19"
      fill="currentColor"
      style={{ width: u(86), height: u(19), display: 'block', flexShrink: 0 }}
    >
      <path d="M83.004 13.53c-.796 1.504-1.965 2.427-2.868 2.427-.691 0-1.222-.58-1.222-1.952 0-2.136 1.062-5.46 1.567-7.2h-7.916l-.77 2.664c-1.169 4.088-3.002 6.488-5.897 6.488-.425 0-.93-.08-1.195-.237 2.178-1.556 4.383-4.036 4.383-6.489 0-2.03-1.488-2.822-2.843-2.822-4.25 0-7.278 5.539-6.136 9.02-.69.238-1.328.528-2.098.528-.77 0-1.195-.527-1.036-1.24.186-.844 1.248-3.666 1.248-5.196 0-1.872-1.46-3.138-3.665-3.138-.505 0-1.063.132-1.62.343l1.407-4.932h-2.762l-3.294 11.5c-.505 1.793-2.019 2.663-3.267 2.663-1.567 0-2.152-1.24-1.78-2.48l1.169-4.035h3.002l.77-2.637h-3.028l1.434-5.011h-2.763L40.24 14.295c-.346 1.187-1.17 1.662-1.886 1.662-1.143 0-1.488-.923-1.249-1.767l2.125-7.385c-.744-.238-1.806-.422-2.63-.422-4.754 0-9.243 4.193-9.243 8.334v.012c-1.272.81-2.748 1.228-4.038 1.228-.903 0-1.408-.08-1.806-.29 2.231-1.45 4.542-3.877 4.542-6.436 0-2.03-1.487-2.822-2.842-2.822-4.224 0-7.172 5.407-6.19 8.862-.929.475-1.779.712-2.709.712-1.46 0-2.842-.606-3.904-1.82l1.354-4.72c3.294-.264 7.65-2.955 7.65-6.252C19.413 1.134 18.033 0 16.28 0c-3.108 0-5.445 2.98-6.534 6.805-2.02-.238-3.108-2.4-1.514-5.011H5.36C3.581 5.724 5.387 8.466 9 9.442l-.877 3.034c-1.328-.818-2.364-1.135-3.586-1.135-5.87 0-6.11 7.254-.345 7.254 1.673 0 3.692-.87 4.755-2.031 1.514 1.319 3.001 2.03 4.914 2.03 1.46 0 2.948-.421 4.489-1.318 1.036.844 2.39 1.319 4.33 1.319 1.722 0 3.444-.355 5.218-1.593.525.918 1.484 1.593 3.096 1.593 1.354 0 2.842-.58 3.958-1.82.823 1.187 2.072 1.82 3.346 1.82 1.063 0 2.152-.422 3.082-1.266.743.79 2.098 1.266 3.586 1.266 2.31 0 4.887-1.214 5.79-4.352l1.036-3.64c.32-1.082 1.17-1.583 2.152-1.583.85 0 1.301.422 1.301 1.16 0 1.372-1.221 4.643-1.221 5.803 0 1.952 1.328 2.612 3.107 2.612 1.116 0 1.993-.027 4.49-1.134 1.009.738 2.576 1.134 4.356 1.134 3.958 0 6.72-2.69 8.606-9.153h2.39c-.45 1.504-.77 3.165-.77 4.642 0 2.48.904 4.51 3.693 4.51 2.178 0 5.206-2.189 5.976-5.064h-2.869ZM15.881 2.639c.504 0 .85.29.85.712 0 1.398-2.497 3.191-4.224 3.455.797-2.743 2.417-4.167 3.374-4.167ZM4.326 15.958c-2.258 0-2.072-2.216.186-2.216.983 0 1.753.316 2.683 1.107-.638.712-1.86 1.108-2.87 1.108ZM22.415 9.02c.558 0 .903.343.903.897 0 1.477-1.939 3.297-3.586 4.22-.584-1.688 1.09-5.117 2.683-5.117Zm9.058 6.937c-.824 0-1.222-.58-1.222-1.424 0-2.031 2.205-5.46 5.578-5.513-1.222 4.247-2.045 6.937-4.356 6.937ZM65.447 9.02c.557 0 .903.343.903.897 0 1.477-2.02 3.376-3.56 4.326-.664-1.583 1.036-5.223 2.657-5.223Z" />
    </svg>
  );
}

/**
 * components/layout/headers/header.tsx + header-grid.tsx: a 72-high row centred in the window,
 * left column, centred heading.05 title, right column.
 */
function ExtHeader({
  left,
  title,
  right,
  maxWidth = fullPageMaxWidth,
  paddingInline = 16,
}: {
  left?: ReactNode;
  title?: string;
  right?: ReactNode;
  maxWidth?: number;
  paddingInline?: number;
}) {
  return (
    <Div
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      style={{
        width: '100%',
        maxWidth: u(maxWidth),
        height: u(72),
        margin: '0 auto',
        paddingInline: u(paddingInline),
      }}
    >
      <Row gap={8}>{left}</Row>
      {title && (
        <Span
          position="absolute"
          whiteSpace="nowrap"
          style={{ left: '50%', transform: 'translateX(-50%)', ...t.heading05 }}
        >
          {title}
        </Span>
      )}
      <Row>{right}</Row>
    </Div>
  );
}

const backButton = (
  <HeaderButton>
    <Icon size={22}>{glyph.arrowLeft}</Icon>
  </HeaderButton>
);
const settingsButton = (
  <HeaderButton>
    <Icon size={22}>{glyph.gear}</Icon>
  </HeaderButton>
);

/** features/container/headers/page.header.tsx: back and the logo, title, Settings. */
function ExtPageHeader({ title }: { title?: string }) {
  return (
    <ExtHeader
      paddingInline={0}
      left={
        <>
          {backButton}
          <Logomark />
        </>
      }
      title={title}
      right={settingsButton}
    />
  );
}

/** components/layout/page/page.layout.tsx + card/card.tsx: the bordered form card, 500 wide. */
function ExtPageCard({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <Div
      style={{
        width: u(pageWidth),
        margin: '0 auto',
        border: `1px solid ${c.border}`,
        borderRadius: u(12),
        overflow: 'hidden',
      }}
    >
      <Div style={{ padding: u(20) }}>{children}</Div>
      <Column gap={12} style={{ padding: u(20) }}>
        {footer}
      </Column>
    </Div>
  );
}

function ExtTokenRow({ row }: { row: (typeof holdings)[number] }) {
  return (
    <Row gap={12} style={{ paddingBlock: u(8) }}>
      <TokenIcon token={row.token} size={40} badge />
      <Column style={{ flex: 1, minWidth: 0 }}>
        <Text style={t.label01}>{row.name}</Text>
        <Text style={t.label03}>{row.symbol}</Text>
      </Column>
      <Column align="flex-end">
        <Text style={t.label02}>{row.fiat}</Text>
        <Row gap={6} style={{ ...t.caption01, color: c.subdued }}>
          <Text>{row.amount}</Text>
          {'locked' in row && (
            <Row gap={2} style={{ ...t.label03, color: c.text }}>
              <Icon size={12} strokeWidth={2}>
                {glyph.lock}
              </Icon>
              <Text>{row.locked}</Text>
            </Row>
          )}
        </Row>
      </Column>
    </Row>
  );
}

/**
 * pages/home/home.tsx in the full-page tab: home.header.tsx (account selector and Settings; no
 * Expand button in a tab), then the 882 column: account-card.tsx with the locked balance card,
 * the md-and-up actions (Buy, Sell, Send, Receive, Swap), home-tabs.tsx and the token list.
 */
function ExtHome() {
  return (
    <>
      <ExtHeader
        left={
          <Row gap={8} style={t.label01}>
            <Text>Savings</Text>
            <Icon size={16}>{glyph.chevronDown}</Icon>
          </Row>
        }
        right={settingsButton}
      />
      <Div
        style={{
          maxWidth: u(fullPageMaxWidth),
          margin: '0 auto',
          paddingInline: u(20),
          paddingTop: u(16),
        }}
      >
        <Column gap={20} style={{ paddingBottom: u(20) }}>
          <Column>
            <LabelWithHint style={t.label02}>Total balance</LabelWithHint>
            <Text style={{ ...t.heading02, marginTop: u(8) }}>{figures.total}</Text>
            {/* features/bonds/components/locked-balance-card.tsx */}
            <Row
              justify="space-between"
              style={{
                marginTop: u(16),
                border: `1px solid ${c.border}`,
                borderRadius: u(8),
                padding: `${u(12)} ${u(16)}`,
              }}
            >
              <Column gap={4}>
                <LabelWithHint style={t.label02}>Locked</LabelWithHint>
                <Text style={t.heading05}>{figures.locked}</Text>
              </Column>
              <Icon size={18}>{glyph.chevronRight}</Icon>
            </Row>
          </Column>
          <Row gap={16}>
            {['Buy', 'Sell', 'Send', 'Receive', 'Swap'].map((label, index) => (
              <Pill
                key={label}
                variant={index === 0 ? 'solid' : 'outline'}
                style={{ flex: 1, minWidth: u(100) }}
              >
                {label}
              </Pill>
            ))}
          </Row>
        </Column>
        <WebTabs tabs={['Tokens', 'Collectibles', 'Activity']} active="Tokens" />
        <Column gap={16} style={{ paddingBlock: u(24) }}>
          <Row justify="space-between" align="flex-start">
            <Column gap={4}>
              <LabelWithHint style={t.label02}>Available</LabelWithHint>
              <Text style={t.heading05}>{figures.available}</Text>
            </Column>
            <HeaderButton>
              <Icon size={18}>{glyph.sliders}</Icon>
            </HeaderButton>
          </Row>
          <Column>
            {holdings.map(row => (
              <ExtTokenRow key={row.token} row={row} />
            ))}
          </Column>
        </Column>
      </Div>
    </>
  );
}

/** pages/fund/fund.tsx: page header, then the Onramper widget in the 500 page. */
function ExtFund() {
  return (
    <>
      <ExtPageHeader />
      <Div style={{ width: u(pageWidth), margin: '0 auto', paddingTop: u(8) }}>
        <OnramperWidget />
      </Div>
    </>
  );
}

/** pages/send/.../btc-send-form.tsx: amount, asset, recipient, then Continue in the card footer. */
function ExtSend() {
  return (
    <>
      <ExtPageHeader title="Send" />
      <ExtPageCard
        footer={
          <>
            <Pill variant="solid">Continue</Pill>
            <Row justify="space-between" style={{ ...t.caption01, color: c.subdued }}>
              <LabelWithHint>Available balance</LabelWithHint>
              <Text>$3,758.70</Text>
            </Row>
          </>
        }
      >
        <Column align="center" style={{ paddingTop: u(24) }}>
          <Row
            gap={8}
            style={{
              fontFamily: 'Marche',
              fontSize: u(48),
              lineHeight: u(55),
              letterSpacing: u(0.64),
            }}
          >
            <Text>0.005</Text>
            <Text>BTC</Text>
          </Row>
          <Row gap={6} style={{ ...t.body02, color: c.subdued, marginTop: u(12) }}>
            <Text>~ $552.75</Text>
            <Icon size={14}>{glyph.switch}</Icon>
          </Row>
          <Text style={{ ...t.label02, marginTop: u(32), textDecoration: 'underline' }}>
            Send max
          </Text>
        </Column>
        <Row
          gap={12}
          style={{
            marginTop: u(32),
            minHeight: u(64),
            border: `1px solid ${c.border}`,
            borderRadius: u(4),
            paddingInline: u(16),
          }}
        >
          <TokenIcon token="btc" size={36} />
          <Text style={t.label01}>Bitcoin</Text>
        </Row>
        <Row
          justify="space-between"
          style={{
            marginTop: u(16),
            height: u(64),
            border: `1px solid ${c.border}`,
            borderRadius: u(4),
            paddingInline: u(16),
          }}
        >
          <Column gap={2}>
            <Text style={{ ...t.label03, color: c.subdued }}>Recipient</Text>
            <Text style={t.body02}>bc1q8c6fh7…2kqu7x9h</Text>
          </Column>
          <Row gap={6} style={{ ...t.label03, color: c.subdued }}>
            <Text>Address</Text>
            <Icon size={14}>{glyph.chevronDown}</Icon>
          </Row>
        </Row>
      </ExtPageCard>
    </>
  );
}

function AssetChip({ token, symbol }: { token: Token; symbol: string }) {
  return (
    <Row
      gap={8}
      style={{
        height: u(32),
        paddingLeft: u(4),
        paddingRight: u(8),
        borderRadius: u(999),
        background: c.hover,
        ...t.label03,
      }}
    >
      <TokenIcon token={token} size={24} />
      <Text>{symbol}</Text>
      <Icon size={14}>{glyph.chevronDown}</Icon>
    </Row>
  );
}

function SwapLeg({
  amount,
  fiat,
  token,
  symbol,
  balance,
  showSwitch,
}: {
  amount: string;
  fiat: string;
  token: Token;
  symbol: string;
  balance: string;
  showSwitch?: boolean;
}) {
  return (
    <Row justify="space-between" align="flex-start">
      <Column gap={12}>
        <Text style={{ ...t.heading03, fontSize: u(26), lineHeight: u(32) }}>{amount}</Text>
        <Row gap={4} style={{ ...t.label03, color: c.subdued }}>
          <Text>{fiat}</Text>
          {showSwitch && <Icon size={12}>{glyph.switch}</Icon>}
        </Row>
      </Column>
      <Column gap={12} align="flex-end">
        <AssetChip token={token} symbol={symbol} />
        <Text style={{ ...t.label03, color: c.subdued }}>{balance}</Text>
      </Column>
    </Row>
  );
}

/** pages/swap/swap-form.tsx: base and target legs, flip button, Rate and Estimated fees. */
function ExtSwap() {
  return (
    <>
      <ExtPageHeader title="Swap" />
      <ExtPageCard footer={<Pill variant="solid">Continue</Pill>}>
        <Column gap={20}>
          <Div position="relative">
            <SwapLeg
              amount="1,000"
              fiat="$436.00"
              token="stx"
              symbol="STX"
              balance="3,449.3"
              showSwitch
            />
            <Hairline color={c.borderT} style={{ marginBlock: u(24) }} />
            <SwapLeg amount="0.00394" fiat="$435.56" token="sbtc" symbol="sBTC" balance="0.0204" />
            <Span
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="50%"
              style={{
                left: '50%',
                top: '50%',
                width: u(32),
                height: u(32),
                transform: 'translate(-50%, -50%)',
                background: c.bg,
                border: `1px solid ${c.borderT}`,
              }}
            >
              <Icon size={16}>{glyph.flip}</Icon>
            </Span>
          </Div>
          <Column>
            <Row justify="space-between" style={{ height: u(40), ...t.label03 }}>
              <Text style={{ color: c.subdued }}>Rate</Text>
              <Text>1 STX ≈ 0.0000039 sBTC</Text>
            </Row>
            <Hairline color={c.borderT} />
            <Row justify="space-between" style={{ height: u(40), ...t.label03 }}>
              <Text style={{ color: c.subdued }}>Estimated fees</Text>
              <Text>$0.28</Text>
            </Row>
          </Column>
        </Column>
      </ExtPageCard>
    </>
  );
}

function BondRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Row justify="space-between" gap={16} style={t.caption01}>
      <Text style={{ color: c.subdued }}>{label}</Text>
      <Text style={{ color }}>{value}</Text>
    </Row>
  );
}

/** pages/all-balances/bond-positions-detail.tsx: the In a bond detail of All balances. */
function ExtEarn() {
  return (
    <>
      {/* all-balances-detail.tsx: back button and title, no Settings */}
      <ExtHeader left={backButton} title="All balances" />
      <Column style={{ maxWidth: u(fullPageMaxWidth), margin: '0 auto', paddingInline: u(20) }}>
        <Row justify="space-between" align="flex-start" style={{ paddingBlock: u(16) }}>
          <Column gap={4}>
            <LabelWithHint style={t.label02}>In a bond</LabelWithHint>
            <Column gap={2}>
              <Text style={t.heading03}>$1,658.25</Text>
              <Text style={{ ...t.caption01, color: c.subdued }}>0.015 BTC</Text>
            </Column>
          </Column>
          <TokenIcon token="btc" size={40} />
        </Row>
        <Hairline bleed={20} />
        <Column gap={12} style={{ paddingBlock: u(16) }}>
          <Row justify="space-between">
            <Row gap={8}>
              <Text style={t.label01}>Period 3</Text>
              <Span
                borderRadius="round"
                style={{
                  ...t.label03,
                  border: `1px solid ${c.border}`,
                  padding: `${u(2)} ${u(8)}`,
                }}
              >
                Active
              </Span>
            </Row>
            <Icon size={16}>{glyph.chevronUp}</Icon>
          </Row>
          <Column gap={8}>
            <BondRow label="Amount" value="0.015 BTC" />
            <BondRow label="STX stacked" value="4,000.00 STX" />
            <BondRow label="Policy" value="bc1p…q7k2" />
            <BondRow label="Unlocks" value="about May 14 · block 1,001,520" />
            <BondRow label="Held by" value="Your key, timelock script" />
            <BondRow label="Paid out" value="+0.00012 BTC" color={c.green} />
          </Column>
        </Column>
        <Hairline bleed={20} />
        <Row gap={4} style={{ ...t.label02, paddingBlock: u(16) }}>
          <Text>Manage in Bitcoin Staking</Text>
          <Icon size={14}>{glyph.external}</Icon>
        </Row>
      </Column>
    </>
  );
}

/**
 * features/token/token-details.layout.tsx in its 780 column (token-details-screen.tsx):
 * Bitcoin details, Info tab, Price section.
 */
function ExtGrow({ isActive, isAnimated }: ScreenProps) {
  return (
    <>
      <ExtHeader maxWidth={tokenDetailsWidth} paddingInline={0} left={backButton} title="Bitcoin" />
      <Div style={{ maxWidth: u(tokenDetailsWidth), margin: '0 auto' }}>
        <Column gap={12} align="center" style={{ padding: u(24), paddingTop: u(8) }}>
          <TokenIcon token="btc" size={48} />
          <Column align="center">
            <Text style={t.heading03}>
              0.049 <Span style={{ color: c.subdued }}>BTC</Span>
            </Text>
            <Text style={t.label01}>$5,416.95</Text>
          </Column>
          <Row gap={8} style={{ width: '100%', paddingTop: u(4) }}>
            {['Receive', 'Send', 'Buy', 'Swap'].map(label => (
              <Pill key={label} height={36} px={12} style={{ flex: 1 }}>
                {label}
              </Pill>
            ))}
          </Row>
        </Column>
        <WebTabs tabs={['Activity', 'Balances', 'Info']} active="Info" />
        <Column gap={12} style={{ paddingInline: u(24), paddingTop: u(16) }}>
          <Column gap={4}>
            <Text style={t.label01}>{figures.btcPrice}</Text>
            <Text style={{ ...t.label03, color: c.green }}>
              + {figures.btcChangePercent} ({figures.btcChangeFiat})
            </Text>
          </Column>
          <PriceChart isDrawn={isActive || !isAnimated} isAnimated={isAnimated} />
          <Row gap={4}>
            {['1d', '1w', '1m', '3m', '6m', '1y'].map(period => (
              <Span
                key={period}
                flex="1"
                display="flex"
                justifyContent="center"
                style={{
                  ...t.label03,
                  textTransform: 'uppercase',
                  paddingBlock: u(4),
                  borderRadius: u(4),
                  color: period === '1d' ? c.text : c.subdued,
                  background: period === '1d' ? c.component : 'transparent',
                }}
              >
                {period}
              </Span>
            ))}
          </Row>
        </Column>
      </Div>
    </>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Mobile screens (light theme, 390 x 844)                                                        */
/* -------------------------------------------------------------------------------------------- */

const statusBarHeight = 54;

/** features/account/components/account-header.tsx + header-actions.tsx */
function PhoneHomeHeader() {
  return (
    <Row justify="space-between" style={{ height: u(64), paddingInline: u(16) }}>
      <Row gap={12}>
        <Span
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ width: u(40), height: u(40), borderRadius: u(14), background: c.component }}
        >
          <svg viewBox="0 0 24 24" style={{ width: u(22), height: u(22) }} fill="currentColor">
            <path d="M6.9 3.14C5.8 2.9 5 3.83 5 4.75v2.24c0 .06-.03.15-.1.23a8.06 8.06 0 0 0-1.11 1.56c-.08.16-.21.22-.3.22h-.74C1.78 9 1 9.79 1 10.75v2.5c0 .97.78 1.75 1.75 1.75h.74c.09 0 .22.06.3.22.3.57.67 1.1 1.1 1.56.08.09.11.17.11.23v2.24c0 .96.78 1.75 1.75 1.75h2.5c.97 0 1.75-.79 1.75-1.75 0-.14.11-.25.25-.25h1.5c.14 0 .25.11.25.25 0 .96.78 1.75 1.75 1.75h2.5c.97 0 1.75-.79 1.75-1.75v-2.23c0-.06.03-.15.1-.23.33-.34.61-.71.86-1.11a2.75 2.75 0 0 0 3.44-4.15.75.75 0 1 0-1.17.94 1.25 1.25 0 0 1-1.62 1.85c.26-.73.4-1.51.4-2.32a7 7 0 0 0-7-7h-3.86A6.32 6.32 0 0 0 6.9 3.14ZM8.25 12a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
          </svg>
        </Span>
        <Text style={t.label01}>Savings</Text>
      </Row>
      <Row gap={16}>
        <Icon size={24}>{glyph.eye}</Icon>
        <Icon size={24}>{glyph.gear}</Icon>
      </Row>
    </Row>
  );
}

const phoneTabs = ['Home', 'Activity', 'Browser'] as const;

/** features/navigation/tab-layout.tsx: icon over label, hairline above. */
function PhoneTabBar() {
  return (
    <Div
      position="absolute"
      display="flex"
      justifyContent="space-between"
      style={{
        left: 0,
        right: 0,
        bottom: 0,
        height: u(84),
        paddingTop: u(12),
        paddingInline: u(64),
        background: c.bg,
        borderTop: `1px solid ${c.border}`,
      }}
    >
      {phoneTabs.map((tab, index) => (
        <Span
          key={tab}
          display="flex"
          flexDir="column"
          alignItems="center"
          style={{ gap: u(4), ...t.label03, color: index === 0 ? c.text : c.subdued }}
        >
          <Icon size={24}>
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
        </Span>
      ))}
    </Div>
  );
}

/** features/token/components/token-cell.tsx */
function PhoneTokenCell({ row }: { row: (typeof holdings)[number] }) {
  return (
    <Row gap={12} style={{ paddingInline: u(24), paddingBlock: u(12) }}>
      <TokenIcon token={row.token} size={48} badge />
      <Column style={{ flex: 1, minWidth: 0 }}>
        <Text style={t.label02}>{row.name}</Text>
        <Text style={{ ...t.caption01, lineHeight: u(16), color: c.subdued }}>{row.symbol}</Text>
      </Column>
      <Column align="flex-end" gap={2}>
        <Text style={{ ...t.label02, lineHeight: u(16) }}>{row.fiat}</Text>
        <Text style={{ ...t.caption01, color: c.subdued }}>{row.amount}</Text>
      </Column>
    </Row>
  );
}

function PhoneHome() {
  return (
    <>
      <PhoneHomeHeader />
      {/* account-total-balance.tsx */}
      <Column gap={4} style={{ padding: `${u(12)} ${u(24)} ${u(24)}` }}>
        <LabelWithHint hint="question" style={t.label02}>
          Total balance
        </LabelWithHint>
        <Text style={t.heading02}>{figures.total}</Text>
      </Column>
      {/* account-stacking.tsx: shown while STX is stacked */}
      <Div style={{ paddingInline: u(24), paddingBottom: u(24) }}>
        <Hairline color={c.component} style={{ marginBottom: u(12) }} />
        <Column gap={4}>
          <LabelWithHint hint="question" style={t.label02}>
            Locked STX
          </LabelWithHint>
          <Text style={t.heading05}>{figures.lockedStx}</Text>
        </Column>
      </Div>
      {/* account-actions.tsx: a scrolling row of lg pills */}
      <Row gap={8} style={{ paddingInline: u(12), paddingBottom: u(24), overflow: 'hidden' }}>
        {['Send', 'Receive', 'Buy', 'Sell', 'Swap'].map((label, index) => (
          <Pill key={label} variant={index === 0 ? 'solid' : 'outline'} style={{ minWidth: u(86) }}>
            {label}
          </Pill>
        ))}
      </Row>
      {/* asset-tabs.tsx */}
      <Div display="flex" style={{ boxShadow: `inset 0 ${u(-2)} 0 ${c.border}` }}>
        {['Tokens', 'Collectibles'].map((tab, index) => (
          <Span
            key={tab}
            display="flex"
            justifyContent="center"
            style={{
              width: u(104),
              paddingBlock: u(16),
              ...t.label01,
              color: index === 0 ? c.text : c.subdued,
              boxShadow: index === 0 ? `inset 0 ${u(-2)} 0 ${c.text}` : undefined,
            }}
          >
            {tab}
          </Span>
        ))}
      </Div>
      {/* available-account-balance.tsx */}
      <Row justify="space-between" style={{ padding: u(24) }}>
        <Column gap={4}>
          <LabelWithHint hint="question" style={t.label03}>
            Available
          </LabelWithHint>
          <Text style={t.heading05}>{figures.available}</Text>
        </Column>
        <Icon size={22}>{glyph.sliders}</Icon>
      </Row>
      {holdings.map(row => (
        <PhoneTokenCell key={row.token} row={row} />
      ))}
      <PhoneTabBar />
    </>
  );
}

/** Sheet header: back on the left, heading.05 title with the account name under it. */
function PhoneSheetHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Div
      position="relative"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      style={{ height: u(64) }}
    >
      <Span position="absolute" style={{ left: u(16) }}>
        <Icon size={24}>{glyph.chevronLeft}</Icon>
      </Span>
      <Text style={t.heading05}>{title}</Text>
      {subtitle && <Text style={{ ...t.label03, color: c.subdued }}>{subtitle}</Text>}
    </Div>
  );
}

/** packages/ui numpad: 1–9, then . 0 and backspace. */
function Numpad() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];
  return (
    <Div display="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {keys.map(key => (
        <Span
          key={key}
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ height: u(56), ...t.heading05 }}
        >
          {key === 'back' ? <Icon size={24}>{glyph.backspace}</Icon> : key}
        </Span>
      ))}
    </Div>
  );
}

function PhoneSend() {
  return (
    <>
      <PhoneSheetHeader title="Send" subtitle="Savings" />
      <Column gap={12} style={{ paddingInline: u(24), paddingTop: u(8) }}>
        <Div>
          <Row
            gap={12}
            style={{
              padding: `${u(12)} ${u(16)}`,
              border: `1px solid ${c.border}`,
              borderRadius: `${u(4)} ${u(4)} 0 0`,
            }}
          >
            <TokenIcon token="btc" size={40} badge />
            <Column style={{ flex: 1 }}>
              <Text style={t.label02}>Bitcoin</Text>
              <Text style={{ ...t.caption01, color: c.subdued }}>BTC</Text>
            </Column>
            <Column align="flex-end">
              <Text style={t.label02}>$3,758.70</Text>
              <Text style={{ ...t.caption01, color: c.subdued }}>0.034</Text>
            </Column>
          </Row>
          <Div
            style={{
              padding: u(16),
              border: `1px solid ${c.border}`,
              borderTop: 'none',
              borderRadius: `0 0 ${u(4)} ${u(4)}`,
            }}
          >
            <Row justify="space-between">
              <Text style={t.heading02}>0.005</Text>
              <Text style={{ ...t.label02, textTransform: 'uppercase' }}>Max</Text>
            </Row>
            <Row gap={4} style={{ ...t.label02, color: c.subdued, marginTop: u(4) }}>
              <Text>$552.75</Text>
              <Icon size={14}>{glyph.switch}</Icon>
            </Row>
          </Div>
        </Div>
        <Row
          justify="space-between"
          style={{
            height: u(56),
            paddingInline: u(16),
            border: `1px solid ${c.border}`,
            borderRadius: u(4),
          }}
        >
          <Text style={t.label02}>bc1q8c6f…u7x9h</Text>
          <Icon size={22}>{glyph.qr}</Icon>
        </Row>
      </Column>
      <Div style={{ paddingInline: u(24), marginTop: u(16) }}>
        <Numpad />
        <Pill variant="solid" style={{ marginTop: u(12) }}>
          Review
        </Pill>
      </Div>
    </>
  );
}

function PhoneSwapCard({
  amount,
  fiat,
  token,
  symbol,
  balance,
  radius,
}: {
  amount: string;
  fiat: string;
  token: Token;
  symbol: string;
  balance: string;
  radius: string;
}) {
  return (
    <Row
      justify="space-between"
      align="flex-start"
      style={{ padding: u(16), border: `1px solid ${c.borderT}`, borderRadius: radius }}
    >
      <Column gap={4}>
        <Text style={{ fontFamily: 'Marche', fontSize: u(24), lineHeight: u(32) }}>{amount}</Text>
        <Text style={{ ...t.label03, color: c.subdued }}>{fiat}</Text>
      </Column>
      <Column gap={8} align="flex-end">
        <AssetChip token={token} symbol={symbol} />
        <Text style={{ ...t.label03, color: c.subdued }}>{balance}</Text>
      </Column>
    </Row>
  );
}

function PhoneSwap() {
  return (
    <>
      <PhoneSheetHeader title="Swap" />
      <Column gap={12} style={{ paddingInline: u(24), paddingTop: u(8) }}>
        <Div position="relative">
          <PhoneSwapCard
            amount="1,000"
            fiat="$436.00"
            token="stx"
            symbol="STX"
            balance="3,449.3"
            radius={`${u(4)} ${u(4)} 0 0`}
          />
          <PhoneSwapCard
            amount="0.00394"
            fiat="$435.56"
            token="sbtc"
            symbol="sBTC"
            balance="0.0204"
            radius={`0 0 ${u(4)} ${u(4)}`}
          />
          <Span
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="50%"
            style={{
              left: '50%',
              top: '50%',
              width: u(32),
              height: u(32),
              transform: 'translate(-50%, -50%)',
              background: c.bg,
              border: `1px solid ${c.borderT}`,
            }}
          >
            <Icon size={16}>{glyph.flip}</Icon>
          </Span>
        </Div>
        <Column>
          <Row justify="space-between" style={{ height: u(40), ...t.label03 }}>
            <Text style={{ color: c.subdued }}>Rate</Text>
            <Text>1 STX ≈ 0.0000039 sBTC</Text>
          </Row>
          <Hairline color={c.borderT} />
          <Row justify="space-between" style={{ height: u(40), ...t.label03 }}>
            <Text style={{ color: c.subdued }}>Estimated fees</Text>
            <Text>$0.28</Text>
          </Row>
        </Column>
        <Row gap={8}>
          {['25%', '50%', '75%', 'MAX'].map(label => (
            <Pill key={label} height={32} px={12} style={{ flex: 1 }}>
              {label}
            </Pill>
          ))}
        </Row>
      </Column>
      <Div style={{ paddingInline: u(24), marginTop: u(4) }}>
        <Numpad />
        <Pill variant="solid" style={{ marginTop: u(8) }}>
          Review
        </Pill>
      </Div>
    </>
  );
}

/** A sheet over home, under the overlay; Buy is full height, descriptions hug their content. */
function PhoneSheet({ children, top }: { children: ReactNode; top?: number }) {
  return (
    <>
      <Div position="absolute" inset="0" style={{ background: c.overlay }} />
      <Div
        position="absolute"
        overflow="hidden"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          top: top === undefined ? undefined : u(top),
          background: c.bg,
          borderRadius: `${u(28)} ${u(28)} 0 0`,
        }}
      >
        <Div
          style={{
            width: u(36),
            height: u(5),
            borderRadius: u(3),
            background: c.border,
            margin: `${u(8)} auto 0`,
          }}
        />
        {children}
      </Div>
    </>
  );
}

/** features/ramp/ramp-sheet.tsx: the Onramper widget in a full-height sheet. */
function PhoneBuy() {
  return (
    <>
      <PhoneHome />
      <PhoneSheet top={statusBarHeight + 6}>
        <Div style={{ padding: u(8) }}>
          <OnramperWidget />
        </Div>
      </PhoneSheet>
    </>
  );
}

/** EARN on mobile: home with the Locked STX description sheet (no staking screen on mobile). */
function PhoneEarn() {
  return (
    <>
      <PhoneHome />
      {/* Sized to the stage's crop: the phone's lower third sits below the fold of the stage */}
      <PhoneSheet top={430}>
        <Column gap={20} style={{ padding: `${u(20)} ${u(24)}` }}>
          <Text style={t.heading05}>Locked</Text>
          <Span style={t.body01}>
            Amount you’ve committed to stacking. You won’t be able to move or spend it until the
            stacking period ends.
          </Span>
        </Column>
      </PhoneSheet>
    </>
  );
}

function DetailsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Column gap={8} style={{ padding: `${u(12)} ${u(24)}`, background: c.bg }}>
      <Text style={t.label03}>{title}</Text>
      {children}
    </Column>
  );
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Row justify="space-between" style={{ height: u(32) }}>
      <Text style={{ ...t.label02, color: c.subdued }}>{label}</Text>
      <Span style={t.body02}>{value}</Span>
    </Row>
  );
}

/** features/token/token.tsx: Bitcoin details; price and 24 Hour Change, no chart on mobile. */
function PhoneGrow() {
  return (
    <>
      <Div
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{ height: u(64) }}
      >
        <Span position="absolute" style={{ left: u(16) }}>
          <Icon size={24}>{glyph.chevronLeft}</Icon>
        </Span>
        <Text style={t.heading05}>Bitcoin</Text>
      </Div>
      <Column gap={12} align="center" style={{ padding: u(24), paddingTop: u(8) }}>
        <TokenIcon token="btc" size={48} badge />
        <Column align="center">
          <Text style={t.heading03}>
            0.049 <Span style={{ color: c.subdued }}>BTC</Span>
          </Text>
          <Text style={t.label01}>$5,416.95</Text>
        </Column>
        <Row gap={6}>
          {['Send', 'Receive', 'Buy', 'Sell', 'Swap'].map((label, index) => (
            <Pill key={label} variant={index === 0 ? 'solid' : 'outline'} height={36} px={12}>
              {label}
            </Pill>
          ))}
        </Row>
      </Column>
      <Column gap={4} style={{ background: c.bg2, paddingTop: u(4) }}>
        <DetailsCard title="Token Details">
          <Column>
            <SummaryRow label="Name" value="Bitcoin (BTC)" />
            <SummaryRow label="Price" value={figures.btcPrice} />
            <SummaryRow
              label="24 Hour Change"
              value={
                <Row gap={4} style={{ ...t.label02, color: c.green }}>
                  <svg viewBox="0 0 8 8" style={{ width: u(8), height: u(8) }} fill="currentColor">
                    <path d="M4 1 7.5 7h-7Z" />
                  </svg>
                  <Text>
                    {figures.btcChangePercent} {figures.btcChangeFiat}
                  </Text>
                </Row>
              }
            />
            <SummaryRow label="Layer" value="Layer 1" />
          </Column>
        </DetailsCard>
      </Column>
      <PhoneTabBar />
    </>
  );
}

/* -------------------------------------------------------------------------------------------- */
/* Screen stacks                                                                                 */
/* -------------------------------------------------------------------------------------------- */

const views: HeroView[] = ['home', 'buy', 'send', 'swap', 'earn', 'grow'];

/** Out quickly, then in, so two screens never read on top of each other. */
function screenTransition(isActive: boolean) {
  if (!isActive)
    return 'opacity 140ms ease-out, transform 140ms ease-out, visibility 0ms linear 140ms';
  const delay = 120;
  return `opacity ${viewTransitionMs - delay}ms ${ease} ${delay}ms, transform ${viewTransitionMs}ms ${ease} ${delay}ms, visibility 0ms linear 0ms`;
}

function ScreenStack({
  screens,
  view,
  isAnimated,
  style,
}: {
  screens: Partial<Record<HeroView, (props: ScreenProps) => ReactNode>>;
  view: HeroView;
  isAnimated: boolean;
  style?: CSSProperties;
}) {
  return (
    <>
      {views.map(key => {
        const Screen = screens[key];
        if (!Screen) return null;
        const isActive = key === view;
        return (
          <Div
            key={key}
            position="absolute"
            inset="0"
            overflow="hidden"
            style={{
              ...style,
              opacity: isActive ? 1 : 0,
              visibility: isActive ? 'visible' : 'hidden',
              transform: isActive ? 'none' : `translateY(${u(10)})`,
              transition: isAnimated ? screenTransition(isActive) : undefined,
            }}
          >
            <Screen isActive={isActive} isAnimated={isAnimated} />
          </Div>
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

function deviceRoot(theme: Theme, width: number): ThemeStyle {
  return {
    ...themes[theme],
    '--hero-unit': `calc(100cqw / ${width})`,
    color: 'var(--ink-text)',
    fontFamily: 'Diatype',
    fontVariantLigatures: 'none',
    textAlign: 'left',
  };
}

// The window is wide enough that the extension's 882 column sits centred with room either side
const windowWidth = 1040;
const windowHeight = 850;
const toolbarHeight = 52;

const extensionScreens: Record<HeroView, (props: ScreenProps) => ReactNode> = {
  home: ExtHome,
  buy: ExtFund,
  send: ExtSend,
  swap: ExtSwap,
  earn: ExtEarn,
  grow: ExtGrow,
};

/** The extension's full-page tab in a browser window: the same routes, laid out for a tab. */
export function HeroExtension({ view, isAnimated }: DeviceProps) {
  return (
    <Div width="100%" style={{ containerType: 'inline-size' }}>
      <Div
        position="relative"
        overflow="hidden"
        style={{
          ...deviceRoot('dark', windowWidth),
          height: u(windowHeight),
          background: c.bg,
          borderRadius: `${u(16)} ${u(16)} 0 0`,
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.08) inset',
        }}
      >
        {/* Toolbar: traffic lights, address bar with the Leather tab, extension button */}
        <Div
          position="relative"
          display="flex"
          alignItems="center"
          style={{
            height: u(toolbarHeight),
            paddingInline: u(18),
            gap: u(8),
            background: '#292623',
            borderBottom: '1px solid #36322F',
          }}
        >
          {['#FF5F57', '#FEBC2E', '#28C840'].map(color => (
            <Span
              key={color}
              borderRadius="50%"
              style={{ width: u(13), height: u(13), background: color }}
            />
          ))}
          <Row
            gap={8}
            style={{
              marginLeft: u(80),
              flex: 1,
              height: u(32),
              borderRadius: u(999),
              background: '#1A1817',
              paddingInline: u(16),
              color: '#9E9996',
              ...t.label03,
              fontWeight: 400,
            }}
          >
            <styled.img
              src="/icons/leather.webp"
              alt=""
              style={{ width: u(16), height: u(16), borderRadius: u(4) }}
            />
            Leather
          </Row>
          <Span
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ width: u(32), height: u(32), marginLeft: u(16) }}
          >
            <styled.img
              src="/icons/leather.webp"
              alt=""
              style={{ width: u(20), height: u(20), borderRadius: u(5) }}
            />
          </Span>
          <Span borderRadius="50%" style={{ width: u(24), height: u(24), background: '#46413E' }} />
        </Div>

        <Div position="absolute" inset="0" style={{ top: u(toolbarHeight) }}>
          <ScreenStack screens={extensionScreens} view={view} isAnimated={isAnimated} />
        </Div>
      </Div>
    </Div>
  );
}

const phoneWidth = 412;
const phoneHeight = 866;
const phoneBezel = 11;

const phoneScreens: Record<HeroView, (props: ScreenProps) => ReactNode> = {
  home: PhoneHome,
  buy: PhoneBuy,
  send: PhoneSend,
  swap: PhoneSwap,
  earn: PhoneEarn,
  grow: PhoneGrow,
};

/** The mobile app in a phone frame: status bar and Dynamic Island over the screens. */
export function HeroPhone({ view, isAnimated }: DeviceProps) {
  return (
    <Div width="100%" style={{ containerType: 'inline-size' }}>
      <Div
        position="relative"
        style={{
          ...deviceRoot('light', phoneWidth),
          height: u(phoneHeight),
          borderRadius: u(64),
          background: '#0D0C0B',
          boxShadow: `0 0 0 ${u(2.5)} #3B3836 inset`,
        }}
      >
        <Div
          position="absolute"
          overflow="hidden"
          style={{ inset: u(phoneBezel), borderRadius: u(54), background: c.bg }}
        >
          <ScreenStack
            screens={phoneScreens}
            view={view}
            isAnimated={isAnimated}
            style={{ paddingTop: u(statusBarHeight) }}
          />
          {/* Status bar */}
          <Div
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            zIndex="1"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: u(statusBarHeight),
              paddingInline: u(36),
              fontSize: u(16),
              fontWeight: 600,
              color: '#12100F',
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
              </svg>
            </Row>
          </Div>
          <Span
            position="absolute"
            zIndex="1"
            borderRadius="round"
            style={{
              top: u(11),
              left: '50%',
              width: u(120),
              height: u(35),
              transform: 'translateX(-50%)',
              background: '#0D0C0B',
            }}
          />
        </Div>
      </Div>
    </Div>
  );
}

export const heroViewDescriptions: Record<HeroView, string> = {
  home: 'The Leather browser extension and mobile app on the wallet home: a total balance of $10,920.06 across Bitcoin, Stacks and sBTC',
  buy: 'Buying $250 of bitcoin through the Onramper widget, in the extension’s full-page tab and in the mobile app',
  send: 'The Send form in the extension and the mobile app: 0.005 BTC to a Bitcoin address',
  swap: 'The Swap form in the extension and the mobile app: 1,000 STX to sBTC',
  earn: 'The extension’s All balances page showing 0.015 BTC in an active bond, and the mobile app’s Locked STX explanation',
  grow: 'Bitcoin token details: the extension’s price chart for the past day, and the mobile app’s price and 24-hour change',
};
