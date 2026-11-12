import { type CSSProperties, type ReactNode, useState } from 'react';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { vaultThemes } from '~/pages/multisig/multisig-tokens';

import {
  ChevronUpIcon,
  ExternalLinkIcon,
  InfoCircleIcon,
  PendingIndicatorIcon,
} from '@leather.io/ui';

import {
  BentoStage,
  MockupPanel,
  mockupColor,
  mockupSize,
  mockupType,
  stagePx,
  useLoopingSequence,
} from './bento-mockup';

/**
 * Light-theme values of the product tokens these mockups use that the shared frame doesn't
 * carry. Hex, not Panda tokens, because the panel stays white whatever the page theme is.
 */
const productColor = {
  backgroundSecondary: '#F9F9F8', // ink.background-secondary
  borderTransparent: '#463f3c1a', // ink.border-transparent
  orange: '#F7931A', // orange.action-primary-default
} as const;

/**
 * Type and sizing, matched to the other homepage bentos (bento-activity, bento-clarity):
 * list rows are 48 high with 28 px icons; a row's primary line is 12/500 and its secondary
 * line 11 in the secondary colour, on both sides; headline figures 26. Small glyphs sit at 12.
 */
const rowHeight = mockupSize.rowHeight;
/** How far a list row bleeds past the content inset, as ListItemBox's does. */
const rowBleed = 8;
const iconSize = mockupSize.icon;
const glyphSize = 12;
const primaryText: CSSProperties = { ...mockupType.body, fontWeight: 500 };
const secondaryText: CSSProperties = { ...mockupType.meta, color: mockupColor.secondary };

const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';
// A small overshoot for the reward beats
const popEase = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

function transitionFor(
  isAnimated: boolean,
  properties: string[],
  ms = 400,
  delayMs = 0,
  timing = ease
) {
  if (!isAnimated) return undefined;
  return properties.map(property => `${property} ${ms}ms ${timing} ${delayMs}ms`).join(', ');
}

/** Fades a list's top and/or bottom edge, as content scrolling past the panel does. */
function edgeFade(top: number, bottom: number): CSSProperties {
  const mask = `linear-gradient(to bottom, transparent, #000 ${stagePx(top)}, #000 calc(100% - ${stagePx(bottom)}), transparent)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

/** Cycles through sample data, wrapping in both directions. */
function pick<T>(list: readonly [T, ...T[]], index: number): T {
  return list[((index % list.length) + list.length) % list.length] ?? list[0];
}

/**
 * Counts how many times a looping sequence has started over, so a loop can move on to the
 * next sample transaction instead of replaying the same one. Adjusts state during render
 * (React's pattern for state derived from a changing value) so the count and the restarted
 * step land in the same commit and nothing flashes back.
 */
function useLoopCount(step: number) {
  const [tracked, setTracked] = useState({ step, count: -1 });
  let count = tracked.count;
  if (tracked.step !== step) {
    if (step < tracked.step) count += 1;
    setTracked({ step, count });
  }
  return Math.max(count, 0);
}

/** Lets a fixed-size product icon scale with the stage. */
function ScaledIcon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <styled.span
      display="inline-flex"
      flexShrink={0}
      className={css({ '& svg': { width: '100%', height: '100%' } })}
      style={{ width: stagePx(size), height: stagePx(size) }}
    >
      {children}
    </styled.span>
  );
}

// Holds the spinner still when motion is reduced, as the frame's final state does
const stillSpinner = css({ '& svg': { animation: 'none' } });

/** Several labels in one slot, cross-fading so the layout never jumps. */
function SwapText({
  index,
  items,
  isAnimated,
  align = 'start',
  style,
}: {
  index: number;
  items: ReactNode[];
  isAnimated: boolean;
  align?: 'start' | 'center' | 'end';
  style?: CSSProperties;
}) {
  return (
    <styled.span display="grid" whiteSpace="nowrap" style={{ justifyItems: align, ...style }}>
      {items.map((item, itemIndex) => (
        <span
          key={itemIndex}
          style={{
            gridArea: '1 / 1',
            opacity: itemIndex === index ? 1 : 0,
            transform:
              itemIndex === index ? 'none' : `translateY(${stagePx(itemIndex < index ? -3 : 3)})`,
            transition: transitionFor(isAnimated, ['opacity', 'transform'], 320),
          }}
        >
          {item}
        </span>
      ))}
    </styled.span>
  );
}

function CheckGlyph({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="100%" height="100%">
      <path
        d="M4.5 8.3 7 10.7l4.5-5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A 12 px status badge on an avatar's corner, ringed in the panel colour (as in Activity). */
function Badge({ children }: { children: ReactNode }) {
  return (
    <styled.span
      position="absolute"
      display="flex"
      borderRadius="round"
      style={{
        right: stagePx(-2),
        bottom: stagePx(-2),
        width: stagePx(glyphSize),
        height: stagePx(glyphSize),
        background: mockupColor.panel,
        boxShadow: `0 0 0 ${stagePx(1.5)} ${mockupColor.panel}`,
      }}
    >
      {children}
    </styled.span>
  );
}

/** Green check badge that pops in: the reward beat. */
function DoneBadge({ isShown, isAnimated }: { isShown: boolean; isAnimated: boolean }) {
  return (
    <styled.span
      position="absolute"
      inset="0"
      borderRadius="round"
      style={{
        background: mockupColor.positive,
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : 'scale(0.4)',
        transition: transitionFor(isAnimated, ['opacity', 'transform'], 420, 0, popEase),
      }}
    >
      <CheckGlyph />
    </styled.span>
  );
}

type Asset = 'btc' | 'stx' | 'sbtc';

const assetIcon: Record<Asset, string> = {
  btc: '/icons/bitcoin.svg',
  stx: '/icons/stacks.svg',
  sbtc: '/icons/sbtc.svg',
};

const assetSymbol: Record<Asset, string> = { btc: 'BTC', stx: 'STX', sbtc: 'sBTC' };

/** The asset's avatar with its in-flight sub-icon, which turns into a check once broadcast. */
function AssetAvatar({
  asset,
  isDone,
  isAnimated,
}: {
  asset: Asset;
  isDone: boolean;
  isAnimated: boolean;
}) {
  return (
    <styled.span
      position="relative"
      flexShrink={0}
      style={{ width: stagePx(iconSize), height: stagePx(iconSize) }}
    >
      <styled.img src={assetIcon[asset]} alt="" width="100%" height="100%" borderRadius="round" />
      <Badge>
        <styled.span
          display="flex"
          className={isAnimated ? undefined : stillSpinner}
          style={{
            opacity: isDone ? 0 : 1,
            transition: transitionFor(isAnimated, ['opacity'], 200),
          }}
        >
          <ScaledIcon size={glyphSize}>
            <PendingIndicatorIcon size={glyphSize} />
          </ScaledIcon>
        </styled.span>
        <DoneBadge isShown={isDone} isAnimated={isAnimated} />
      </Badge>
    </styled.span>
  );
}

/** Two stacked lines, the row text pattern every bento shares. */
function TextPair({
  primary,
  secondary,
  align = 'left',
}: {
  primary: ReactNode;
  secondary: ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <styled.span
      display="flex"
      flexDirection="column"
      minWidth={0}
      flex={align === 'left' ? 1 : undefined}
      flexShrink={align === 'right' ? 0 : undefined}
      style={{ textAlign: align, alignItems: align === 'right' ? 'flex-end' : 'stretch' }}
    >
      <styled.span style={primaryText}>{primary}</styled.span>
      <styled.span style={secondaryText}>{secondary}</styled.span>
    </styled.span>
  );
}

/** The feed's TransactionRow (pages/multisig/components/transaction-row.tsx), 48 high. */
function TransactionRow({
  asset,
  caption,
  amount,
  fiat,
  isDone,
  isAnimated,
  children,
}: {
  asset: Asset;
  caption: ReactNode;
  amount: string;
  fiat: string;
  isDone: boolean;
  isAnimated: boolean;
  children?: ReactNode;
}) {
  return (
    <styled.div
      position="relative"
      display="flex"
      alignItems="center"
      style={{
        height: stagePx(rowHeight),
        gap: stagePx(12),
        // ListItemBox bleeds a little past the content, as in the product
        margin: `0 ${stagePx(-rowBleed)}`,
        padding: `0 ${stagePx(rowBleed)}`,
      }}
    >
      <AssetAvatar asset={asset} isDone={isDone} isAnimated={isAnimated} />
      <TextPair primary={`Send ${assetSymbol[asset]}`} secondary={caption} />
      <TextPair primary={amount} secondary={fiat} align="right" />
      {children}
    </styled.div>
  );
}

// ---------------------------------------------------------------------------------------------
// Shared vaults — the vault page: balance header (vault/components/vault-balance-hero.tsx) over
// its pending transactions (vault/components/vault-transactions.tsx). Each signature fills one
// segment of a row's threshold bar; the last one broadcasts the transaction, which clears, and
// the queue moves up. Illustrative values at roughly $75,200 / BTC (sBTC is pegged 1:1 to BTC)
// and $0.43 / STX, as in the other bentos.
// ---------------------------------------------------------------------------------------------

interface QueuedProposal {
  /** The vault the transaction spends from */
  account: string;
  /** BTC vaults send BTC; Stacks vaults hold STX and sBTC, as in the product */
  asset: Asset;
  amount: string;
  fiat: string;
  /** Signatures the vault's policy requires (its m-of-n's m): one bar segment each */
  required: number;
  /** Index into the product's vaultThemes (pages/multisig/multisig-tokens.ts) */
  theme: number;
  /**
   * The vault's balance in its native asset (BTC or STX), as the vault page's hero shows it.
   * Marche is all caps, so an sBTC figure would read "SBTC"; the sBTC lives in the row.
   */
  balance: string;
  balanceFiat: string;
}

// One vault per transaction, each in its own product theme: Blue, Bronze, Green, Orange
const queue: [QueuedProposal, ...QueuedProposal[]] = [
  {
    account: 'Payroll',
    asset: 'btc',
    amount: '0.0150 BTC',
    fiat: '$1,128.00',
    required: 2, // 2-of-3
    theme: 0,
    balance: '0.4820 BTC',
    balanceFiat: '$36,246.40',
  },
  {
    account: 'Grants',
    asset: 'stx',
    amount: '2,500 STX',
    fiat: '$1,075.00',
    required: 3, // 3-of-5
    theme: 1,
    balance: '184,200 STX',
    balanceFiat: '$79,206.00',
  },
  {
    account: 'Treasury',
    asset: 'sbtc',
    amount: '0.0420 sBTC',
    fiat: '$3,158.40',
    required: 4, // 4-of-4
    theme: 2,
    balance: '96,500 STX',
    balanceFiat: '$41,495.00',
  },
  {
    account: 'Reserve',
    asset: 'btc',
    amount: '0.1000 BTC',
    fiat: '$7,520.00',
    required: 2, // 2-of-2
    theme: 3,
    balance: '3.5000 BTC',
    balanceFiat: '$263,200.00',
  },
];

/** Signature beats in one loop: a row arrives on top with one signature already in. */
const maxBeats = Math.max(...queue.map(entry => entry.required)) - 1;

/**
 * One loop per vault: 0 waiting · 1…maxBeats a signature each (beats the vault doesn't need
 * take no time) · broadcast · the next row's first signature · clears.
 */
function loopDelays(required: number) {
  const beats = Array.from({ length: maxBeats }, (_, beat) => {
    if (beat === 0) return 1100;
    return beat < required - 1 ? 750 : 0;
  });
  return [...beats, 700, 800, 900];
}
const broadcastStep = maxBeats + 1;
const nextSignatureStep = maxBeats + 2;
const clearStep = maxBeats + 3;

/** The Leather display face, as the bond card's headline figure uses it. */
const brandFigure: CSSProperties = {
  ...mockupType.headline,
  fontFamily: 'Marche, sans-serif',
  fontWeight: 400,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

// The balance block: the Marche figure on a tight line, the fiat line pulled up under it. The
// vault tile spans exactly from the figure's cap top to the fiat line's baseline: its bottom is
// aligned to that baseline (last-baseline alignment), and its size is the distance up to the
// cap top, measured in the browser: Marche's 0.708 em caps start 3.3 down a 26 line, and the
// fiat baseline sits 11.7 down its 15 line.
const figureLine = 26;
const fiatLine = 15;
const figureGap = -3;
const vaultTileSize = figureLine + figureGap + 11.7 - 3.3;
const balanceHeight = figureLine + figureGap + fiatLine;

// MultisigHero's themed card, inset by the same small gutter on top, left and right
const heroInset = 10;
const heroPadding = 20;
const heroHeight = balanceHeight + heroPadding * 2;
// The first row sits just under the card: its 48 line centres the content, so the gap reads
// as the card's own gutter
const queueTop = heroInset + heroHeight + 2;
// Rows that fit above the panel's bottom edge
const visibleRows = Math.ceil((mockupSize.panelHeight - queueTop) / rowHeight);

// AvatarSq's lg glyph-to-tile ratio (30 / 56)
const glyphRatio = 0.54;
const themeFade = 520;

/**
 * Every product vault theme stacked, the active one shown: switching vaults cross-fades the
 * texture instead of swapping it.
 */
function ThemeBackdrop({ theme, isAnimated }: { theme: number; isAnimated: boolean }) {
  return (
    <>
      {vaultThemes.map(({ id, background }) => (
        <span
          key={id}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background,
            opacity: id === theme ? 1 : 0,
            transition: transitionFor(isAnimated, ['opacity'], themeFade),
          }}
        />
      ))}
    </>
  );
}

/**
 * AvatarSq with the vault glyph (pages/multisig/components/avatar-sq.tsx), in the vault's
 * theme. The ring is the product Avatar's own (@leather.io/ui avatar.web.tsx): a 1 px outline
 * inset by 1 px in ink.border-transparent, here at its dark-theme value since the card is a
 * dark surface. Drawn inside the tile so the tile stays flush with the text.
 */
function VaultTile({
  size,
  theme,
  isAnimated,
}: {
  size: number;
  theme: number;
  isAnimated: boolean;
}) {
  const mask = "url('/multisig/icons/account/vault.svg') center / contain no-repeat";
  return (
    <styled.span
      position="relative"
      flexShrink={0}
      overflow="hidden"
      style={{
        width: stagePx(size),
        height: stagePx(size),
        // squareAvatarRadius: 20% of the tile
        borderRadius: stagePx(size * 0.2),
      }}
    >
      {/* Out of flow, so the tile's baseline is its bottom edge */}
      <ThemeBackdrop theme={theme} isAnimated={isAnimated} />
      <span
        style={{
          position: 'absolute',
          inset: `${(1 - glyphRatio) * 50}%`,
          background: '#FFFFFF',
          mask,
          WebkitMask: mask,
        }}
      />
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          // ink.border-transparent, dark theme
          boxShadow: `inset 0 0 0 ${stagePx(1)} #F5F1ED33`,
        }}
      />
    </styled.span>
  );
}

/**
 * The vault page's balance, without the vault name, on its themed card: the vault tile beside
 * the figure and fiat, in white. The figures cross-fade as the vault changes.
 */
function VaultBalance({ active, isAnimated }: { active: number; isAnimated: boolean }) {
  const entry = pick(queue, active);
  const index = queue.indexOf(entry);
  return (
    <styled.div display="flex" style={{ alignItems: 'last baseline', gap: stagePx(12) }}>
      <VaultTile size={vaultTileSize} theme={entry.theme} isAnimated={isAnimated} />
      <styled.div display="flex" flexDirection="column">
        <SwapText
          index={index}
          isAnimated={isAnimated}
          items={queue.map(vault => vault.balance)}
          style={{
            ...brandFigure,
            lineHeight: stagePx(figureLine),
            height: stagePx(figureLine),
            color: '#FFFFFF',
          }}
        />
        <SwapText
          index={index}
          isAnimated={isAnimated}
          items={queue.map(vault => vault.balanceFiat)}
          style={{
            ...mockupType.meta,
            lineHeight: stagePx(fiatLine),
            marginTop: stagePx(figureGap),
            color: 'rgb(255 255 255 / 0.85)',
          }}
        />
      </styled.div>
    </styled.div>
  );
}

/**
 * A row's threshold bar under its text: one segment per required signature, each filling as a
 * member signs, all turning green once the transaction is broadcast.
 */
function SignatureProgress({
  required,
  signed,
  isDone,
  isAnimated,
}: {
  required: number;
  signed: number;
  isDone: boolean;
  isAnimated: boolean;
}) {
  return (
    <styled.span
      position="absolute"
      display="flex"
      style={{
        gap: stagePx(3),
        left: stagePx(rowBleed + iconSize + 12),
        right: stagePx(rowBleed),
        bottom: stagePx(4),
        height: stagePx(2),
      }}
    >
      {Array.from({ length: required }, (_, segment) => (
        <styled.span
          key={segment}
          position="relative"
          flex="1"
          overflow="hidden"
          style={{ borderRadius: stagePx(1), background: mockupColor.divider }}
        >
          <styled.span
            position="absolute"
            inset="0"
            style={{
              transformOrigin: 'left center',
              transform: segment < signed ? 'none' : 'scaleX(0)',
              background: isDone ? mockupColor.positive : productColor.orange,
              transition: transitionFor(isAnimated, ['transform', 'background-color'], 520),
            }}
          />
        </styled.span>
      ))}
    </styled.span>
  );
}

/**
 * "Shared vaults": a vault page. Its themed balance card belongs to the vault of the pending
 * transaction at the top, which arrives with one signature in. The remaining members sign one
 * by one, each filling a segment of its threshold bar (2, 3 or 4, per the vault's policy); the
 * last one broadcasts it (check badge, the bar turns green), the next proposal gets its first
 * signature, then the top one clears, the queue moves up and the card cross-fades to the next
 * vault's theme and balance. Reduced motion shows the first vault, its transaction broadcast.
 */
export function SharedVaultMockup() {
  // The loop's timing follows the vault on top, so it has as many beats as it needs signatures
  const [cycle, setCycle] = useState(0);
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>(
    loopDelays(pick(queue, cycle).required),
    900
  );
  const loop = useLoopCount(step);
  if (isAnimated && loop !== cycle) setCycle(loop);
  const head = isAnimated ? loop : 0;
  // Reduced motion: the top row broadcast, the next one at one signature
  const visibleStep = isAnimated ? step : nextSignatureStep;
  const hasCleared = isAnimated && step >= clearStep;
  // The card follows the vault of the transaction at the top of the queue
  const active = head + (hasCleared ? 1 : 0);

  const rows = Array.from({ length: visibleRows + 2 }, (_, index) => index - 1).map(offset => {
    const { required } = pick(queue, head + offset);
    const slot = offset - (hasCleared ? 1 : 0);
    let signed = 0;
    if (offset < 0) signed = required;
    else if (offset === 0) signed = Math.min(required, 1 + Math.min(visibleStep, maxBeats));
    else if (offset === 1 && visibleStep >= nextSignatureStep) signed = 1;
    const isDone = offset < 0 || (offset === 0 && visibleStep >= broadcastStep);
    return { position: head + offset, slot, signed, isDone };
  });

  return (
    <BentoStage label="A vault's balance on its themed card over pending BTC, STX and sBTC transactions whose signature bars fill one segment per required signer, then broadcast and clear one by one, the card switching to each next transaction's vault">
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
        <MockupPanel>
          {/* MultisigHero, balance variant, in the theme of the vault whose transaction is up */}
          <styled.div
            position="absolute"
            display="flex"
            alignItems="center"
            overflow="hidden"
            style={{
              top: stagePx(heroInset),
              left: stagePx(heroInset),
              right: stagePx(heroInset),
              height: stagePx(heroHeight),
              paddingInline: stagePx(heroPadding),
              borderRadius: stagePx(8),
            }}
          >
            <ThemeBackdrop theme={pick(queue, active).theme} isAnimated={isAnimated} />
            <styled.div position="relative">
              <VaultBalance active={active} isAnimated={isAnimated} />
            </styled.div>
          </styled.div>

          <styled.div
            position="absolute"
            left="0"
            right="0"
            bottom="0"
            overflow="hidden"
            style={{ top: stagePx(queueTop), ...edgeFade(0, 36) }}
          >
            {rows.map(({ position, slot, signed, isDone }) => {
              const entry = pick(queue, position);
              return (
                <styled.div
                  key={position}
                  position="absolute"
                  style={{
                    top: 0,
                    left: stagePx(mockupSize.inset),
                    right: stagePx(mockupSize.inset),
                    transform: `translateY(${stagePx(Math.max(slot, 0) * rowHeight)}) scale(${slot < 0 ? 0.97 : 1})`,
                    opacity: slot < 0 || slot >= visibleRows ? 0 : 1,
                    // The cleared row fades out first, then the queue closes the gap
                    transition: transitionFor(
                      isAnimated,
                      ['transform', 'opacity'],
                      slot < 0 ? 220 : 480,
                      slot < 0 ? 0 : 140
                    ),
                  }}
                >
                  <TransactionRow
                    asset={entry.asset}
                    amount={entry.amount}
                    fiat={entry.fiat}
                    isDone={isDone}
                    isAnimated={isAnimated}
                    caption={
                      <SwapText
                        index={isDone ? entry.required + 1 : signed}
                        isAnimated={isAnimated}
                        items={[
                          ...Array.from(
                            { length: entry.required + 1 },
                            (_, count) => `${entry.account} · ${count} of ${entry.required} signed`
                          ),
                          `${entry.account} · Broadcast`,
                        ]}
                      />
                    }
                  >
                    <SignatureProgress
                      required={entry.required}
                      signed={signed}
                      isDone={isDone}
                      isAnimated={isAnimated}
                    />
                  </TransactionRow>
                </styled.div>
              );
            })}
          </styled.div>
        </MockupPanel>
      </div>
    </BentoStage>
  );
}

// ---------------------------------------------------------------------------------------------
// Bitcoin Staking bonds — mirrors the extension's In a bond page
// (apps/extension/src/app/pages/all-balances/bond-positions-detail.tsx) with one
// BondPositionSection (components/bond-position-section.tsx, bond-detail-row.tsx)
// ---------------------------------------------------------------------------------------------

const bondDetailRows = [
  ['Amount', '0.50 BTC'],
  ['STX stacked', '25,000 STX'],
  ['Policy', 'bc1p…q7x9'],
  ['Unlocks', 'about 12 May · block 951,840'],
  ['Held by', 'Your key, timelock script'],
  // The extension's placeholder until a payout has been claimed
  ['Paid out', '-.--'],
] as const;

function Divider() {
  return (
    <styled.div
      style={{
        height: 1,
        margin: `0 ${stagePx(-mockupSize.inset)}`,
        background: mockupColor.divider,
      }}
    />
  );
}

/**
 * "Bitcoin Staking bonds": the extension's In a bond balance. The Period 14 section starts
 * collapsed to its amount, then opens into the bond's details, as tapping it does in the
 * extension. Loops while in view; reduced motion shows it open.
 */
export function BondPositionMockup() {
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([1100], 3000);
  const isExpanded = step >= 1;

  return (
    <BentoStage label="The extension's In a bond balance, 0.50 BTC, opening Period 14 to show its amount, STX stacked, unlock date and timelock">
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
        <MockupPanel style={{ paddingInline: stagePx(mockupSize.inset) }}>
          {/* Balance header */}
          <styled.div
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            style={{ paddingBlock: stagePx(18) }}
          >
            <div>
              <styled.div display="flex" alignItems="center" style={{ gap: stagePx(4) }}>
                <styled.span style={primaryText}>In a bond</styled.span>
                <ScaledIcon size={glyphSize}>
                  <InfoCircleIcon variant="small" color="ink.text-subdued" />
                </ScaledIcon>
              </styled.div>
              <styled.div style={{ ...brandFigure, marginTop: stagePx(4) }}>$31,420.50</styled.div>
              <styled.div style={{ ...secondaryText, marginTop: stagePx(2) }}>0.50 BTC</styled.div>
            </div>
            <styled.img
              src="/icons/bitcoin.svg"
              alt=""
              borderRadius="round"
              style={{ width: stagePx(iconSize), height: stagePx(iconSize) }}
            />
          </styled.div>

          <Divider />

          {/* BondPositionSection in its CollapsibleSection */}
          <styled.div style={{ paddingBlock: stagePx(14) }}>
            <styled.div
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              style={{ gap: stagePx(6), minHeight: stagePx(20) }}
            >
              <styled.div display="flex" alignItems="center" style={{ gap: stagePx(6) }}>
                <styled.span style={primaryText}>Period 14</styled.span>
                <styled.span
                  display="inline-flex"
                  alignItems="center"
                  borderRadius="round"
                  style={{
                    padding: `${stagePx(1)} ${stagePx(6)}`,
                    background: productColor.backgroundSecondary,
                    border: `1px solid ${productColor.borderTransparent}`,
                    ...secondaryText,
                    fontWeight: 500,
                  }}
                >
                  Active
                </styled.span>
              </styled.div>
              <styled.div display="flex" alignItems="center" style={{ gap: stagePx(6) }}>
                <span
                  style={{
                    ...primaryText,
                    opacity: isExpanded ? 0 : 1,
                    transition: transitionFor(isAnimated, ['opacity'], 250),
                  }}
                >
                  0.50 BTC
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    transform: isExpanded ? 'none' : 'rotate(180deg)',
                    transition: transitionFor(isAnimated, ['transform'], 400),
                  }}
                >
                  <ScaledIcon size={glyphSize}>
                    <ChevronUpIcon variant="small" />
                  </ScaledIcon>
                </span>
              </styled.div>
            </styled.div>

            {/* Height animates through the 0fr → 1fr grid track */}
            <styled.div
              display="grid"
              style={{
                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                transition: transitionFor(isAnimated, ['grid-template-rows'], 450),
              }}
            >
              <styled.div overflow="hidden" minHeight={0}>
                <styled.div
                  display="flex"
                  flexDirection="column"
                  style={{ gap: stagePx(7), paddingTop: stagePx(10) }}
                >
                  {bondDetailRows.map(([label, value], index) => (
                    <styled.div
                      key={label}
                      display="flex"
                      justifyContent="space-between"
                      style={{
                        gap: stagePx(12),
                        ...mockupType.body,
                        opacity: isExpanded ? 1 : 0,
                        transform: isExpanded ? 'none' : `translateY(${stagePx(6)})`,
                        transition: transitionFor(
                          isAnimated,
                          ['opacity', 'transform'],
                          380,
                          isExpanded ? 120 + index * 55 : 0
                        ),
                      }}
                    >
                      <span style={{ color: mockupColor.secondary }}>{label}</span>
                      <span style={{ textAlign: 'right' }}>{value}</span>
                    </styled.div>
                  ))}
                </styled.div>
              </styled.div>
            </styled.div>
          </styled.div>

          <Divider />

          <styled.div
            display="inline-flex"
            alignItems="center"
            style={{ gap: stagePx(4), paddingBlock: stagePx(14), ...primaryText }}
          >
            Manage in Bitcoin Staking
            <ScaledIcon size={glyphSize}>
              <ExternalLinkIcon variant="small" />
            </ScaledIcon>
          </styled.div>
        </MockupPanel>
      </div>
    </BentoStage>
  );
}
