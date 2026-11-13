import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { accountIconUrl, vaultTheme, vaultThemes } from '~/pages/multisig/multisig-tokens';

import {
  ChevronUpIcon,
  ExternalLinkIcon,
  InfoCircleIcon,
  PendingIndicatorIcon,
} from '@leather.io/ui';

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
  useLoopingSequence,
} from './bento-mockup';

const productColor = {
  backgroundSecondary: '#F9F9F8', // ink.background-secondary
  borderTransparent: '#463f3c1a', // ink.border-transparent
  orange: '#F7931A', // orange.action-primary-default
} as const;

const rowHeight = mockupSize.rowHeight;
/** How far a list row bleeds past the content inset, as ListItemBox's does. */
const rowBleed = 8;
const iconSize = mockupSize.icon;
const glyphSize = 12;

// A small overshoot for the reward beats
const popEase = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** Cycles through sample data, wrapping in both directions. */
function pick<T>(list: readonly [T, ...T[]], index: number): T {
  return list[((index % list.length) + list.length) % list.length] ?? list[0];
}

/**
 * Counts how many times a looping sequence has started over, so a loop can move on to the
 * next sample transaction instead of replaying the same one. Adjusts state during render
 * (React's pattern for state derived from a changing value) so the count and the restarted
 * step land in the same commit and nothing flashes back. -1 until the sequence first starts.
 */
function useLoopCount(step: number) {
  const [tracked, setTracked] = useState({ step, count: -1 });
  let count = tracked.count;
  if (tracked.step !== step) {
    if (step < tracked.step) count += 1;
    setTracked({ step, count });
  }
  return count;
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

type Asset = keyof typeof tokenIconSrc;

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
      <styled.img
        src={tokenIconSrc[asset]}
        alt=""
        width="100%"
        height="100%"
        borderRadius="round"
      />
      <StatusBadge style={{ display: 'flex', background: mockupColor.panel }}>
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
      </StatusBadge>
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
        // ListItemBox bleeds a little past the content
        margin: `0 ${stagePx(-rowBleed)}`,
        padding: `0 ${stagePx(rowBleed)}`,
      }}
    >
      <AssetAvatar asset={asset} isDone={isDone} isAnimated={isAnimated} />
      <TextPair primary={`Send ${assetSymbol[asset]}`} secondary={caption} />
      <TextPair primary={amount} secondary={fiat} align="end" />
      {children}
    </styled.div>
  );
}

interface QueuedProposal {
  account: string;
  asset: Asset;
  amount: string;
  fiat: string;
  /** Signatures the vault's policy requires: one bar segment each */
  required: number;
  /** Index into vaultThemes (pages/multisig/multisig-tokens.ts) */
  theme: number;
  icon: string;
  /** In the vault's native asset: Marche is all caps, so an sBTC figure would read "SBTC" */
  balance: string;
  balanceFiat: string;
}

const queue: [QueuedProposal, ...QueuedProposal[]] = [
  {
    account: 'Payroll',
    asset: 'btc',
    amount: '0.0150 BTC',
    fiat: '$1,128.00',
    required: 2, // 2-of-3
    theme: 0,
    icon: 'vault',
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
    icon: 'gift',
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
    icon: 'bank',
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
    icon: 'piggybank',
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

const heroInset = 10;
const heroPadding = 20;
const heroHeight = balanceHeight + heroPadding * 2;
const queueTop = heroInset + heroHeight + 2;
const visibleRows = Math.ceil((mockupSize.panelHeight - queueTop) / rowHeight);

// AvatarSq's lg glyph-to-tile ratio (30 / 56)
const glyphRatio = 0.54;
// The card's theme, the tile's theme and glyph, and the balance all change on one beat
const headerMs = 600;
const headerEase = 'cubic-bezier(0.65, 0, 0.35, 1)';

/** Fades a slot's top and bottom edges, so what rolls through it softens as it enters and leaves. */
function rollMask(edge: string): CSSProperties {
  const mask = `linear-gradient(to bottom, transparent, #000 ${edge}, #000 calc(100% - ${edge}), transparent)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

/**
 * Counts theme changes and remembers the theme shown before the current one. Adjusts state
 * during render, as useLoopCount does, so the new layer and its backing land in one commit.
 */
function useThemeChange(theme: number) {
  const [tracked, setTracked] = useState({ theme, previous: theme, changes: 0 });
  if (tracked.theme === theme) return tracked;
  const next = { theme, previous: tracked.theme, changes: tracked.changes + 1 };
  setTracked(next);
  return next;
}

const themeLayer: CSSProperties = { position: 'absolute', inset: 0, borderRadius: 'inherit' };

/** The incoming theme, fading in from transparent as it mounts. */
function IncomingTheme({ background, isFading }: { background: string; isFading: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Before paint, so the layer never shows a frame at full opacity first
  useLayoutEffect(() => {
    if (!isFading) return;
    const animation = ref.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: headerMs,
      easing: headerEase,
    });
    return () => animation?.cancel();
  }, [isFading]);
  return <span ref={ref} style={{ ...themeLayer, background }} />;
}

/**
 * The vault's theme texture. A change mounts the new theme on top, fading in from transparent,
 * while the old one stays fully opaque beneath it, so the card only ever blends between the two
 * themes and never shows the white panel through. Every theme sits underneath, transparent, so
 * its image is loaded before its turn.
 */
function ThemeBackdrop({ theme, isAnimated }: { theme: number; isAnimated: boolean }) {
  const { previous, changes } = useThemeChange(theme);
  return (
    <span style={{ ...themeLayer, isolation: 'isolate' }}>
      {vaultThemes.map(({ id, background }) => (
        <span
          key={id}
          style={{ ...themeLayer, background, opacity: id === previous && changes > 0 ? 1 : 0 }}
        />
      ))}
      <IncomingTheme
        key={changes}
        background={vaultTheme(theme).background}
        isFading={isAnimated && changes > 0}
      />
    </span>
  );
}

/**
 * A slot-machine slot: the item at `position` sits in the slot, the next one waits just below
 * it and the last one just above, out of sight. Advancing the position rolls the current item
 * up and out as the next one rolls up in from below, each fading as it crosses the slot's top
 * or bottom edge. The slot clips to its own box, so a roll never spills onto its neighbours.
 */
function RollSlot({
  position,
  isAnimated,
  renderItem,
  edge,
  style,
}: {
  position: number;
  isAnimated: boolean;
  renderItem(position: number): ReactNode;
  /** How deep the fade at the top and bottom edges reaches */
  edge: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: 'grid',
        // Clips without becoming a scroll container, so the slot keeps its text baseline
        overflow: 'clip',
        ...rollMask(edge),
        ...style,
      }}
    >
      {[position - 1, position, position + 1].map(item => {
        const offset = Math.sign(item - position);
        return (
          <span
            key={item}
            aria-hidden={offset !== 0 || undefined}
            style={{
              gridArea: '1 / 1',
              position: 'relative',
              transform: offset === 0 ? 'none' : `translateY(${offset * 100}%)`,
              opacity: offset === 0 ? 1 : 0,
              transition: transitionFor(
                isAnimated,
                ['transform', 'opacity'],
                headerMs,
                0,
                headerEase
              ),
            }}
          >
            {renderItem(item)}
          </span>
        );
      })}
    </span>
  );
}

/** A vault glyph in white, as AvatarSq draws it on the dark themes, recoloured through a mask. */
function VaultGlyph({ icon }: { icon: string }) {
  const mask = `url('${accountIconUrl(icon)}') center / contain no-repeat`;
  return (
    <span
      style={{
        position: 'absolute',
        inset: `${(1 - glyphRatio) * 50}%`,
        background: '#FFFFFF',
        mask,
        WebkitMask: mask,
      }}
    />
  );
}

/**
 * AvatarSq (pages/multisig/components/avatar-sq.tsx) in the vault's theme. The ring is drawn
 * inside the tile, at its dark-theme value, so the tile stays flush with the text.
 */
function VaultTile({
  size,
  active,
  isAnimated,
}: {
  size: number;
  active: number;
  isAnimated: boolean;
}) {
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
      {/* Everything out of flow, so the tile's baseline is its bottom edge */}
      <ThemeBackdrop theme={pick(queue, active).theme} isAnimated={isAnimated} />
      <RollSlot
        position={active}
        isAnimated={isAnimated}
        edge="22%"
        style={{ position: 'absolute', inset: 0 }}
        renderItem={position => <VaultGlyph icon={pick(queue, position).icon} />}
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

/** The vault page's balance: tile, figure and fiat roll together to the next vault. */
function VaultBalance({ active, isAnimated }: { active: number; isAnimated: boolean }) {
  return (
    <styled.div display="flex" style={{ alignItems: 'last baseline', gap: stagePx(12) }}>
      <VaultTile size={vaultTileSize} active={active} isAnimated={isAnimated} />
      <styled.div display="flex" flexDirection="column">
        <RollSlot
          position={active}
          isAnimated={isAnimated}
          // Just above Marche's cap top and below its baseline, in the 26 line
          edge={stagePx(3)}
          style={{
            ...brandFigure,
            whiteSpace: 'nowrap',
            lineHeight: stagePx(figureLine),
            color: '#FFFFFF',
          }}
          renderItem={position => pick(queue, position).balance}
        />
        <RollSlot
          position={active}
          isAnimated={isAnimated}
          edge={stagePx(2)}
          style={{
            ...mockupType.meta,
            whiteSpace: 'nowrap',
            lineHeight: stagePx(fiatLine),
            marginTop: stagePx(figureGap),
            color: 'rgb(255 255 255 / 0.85)',
          }}
          renderItem={position => pick(queue, position).balanceFiat}
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
 * A vault page (vault-balance-hero.tsx over vault-transactions.tsx). Members sign the top
 * transaction one by one until it broadcasts and clears; the card then switches to the next
 * transaction's vault. Reduced motion shows the first vault, its transaction broadcast.
 */
export function SharedVaultMockup() {
  // The loop's timing follows the vault on top, so it has as many beats as it needs signatures
  const [cycle, setCycle] = useState(0);
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>(
    loopDelays(pick(queue, cycle).required),
    900
  );
  // -1 until the loop first starts: the frame's final state, which hasn't cleared anything
  const loopCount = useLoopCount(step);
  const loop = Math.max(loopCount, 0);
  if (isAnimated && loop !== cycle) setCycle(loop);
  const head = isAnimated ? loop : 0;
  // Reduced motion: the top row broadcast, the next one at one signature
  const visibleStep = isAnimated ? step : nextSignatureStep;
  const hasCleared = isAnimated && loopCount >= 0 && step >= clearStep;
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
    <BentoStage
      ref={ref}
      label="A vault's balance on its themed card over pending BTC, STX and sBTC transactions whose signature bars fill one segment per required signer, then broadcast and clear one by one, the card switching to each next transaction's vault"
    >
      <MockupPanel>
        {/* MultisigHero, balance variant */}
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
          style={{ top: stagePx(queueTop), ...fadeBottom(36) }}
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
    </BentoStage>
  );
}

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

/** The extension's In a bond page (pages/all-balances/bond-positions-detail.tsx), opening a period. */
export function BondPositionMockup() {
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([1100], 3000);
  const isExpanded = step >= 1;

  return (
    <BentoStage
      ref={ref}
      label="The extension's In a bond balance, 0.50 BTC, opening Period 14 to show its amount, STX stacked, unlock date and timelock"
    >
      <MockupPanel style={{ paddingInline: stagePx(mockupSize.inset) }}>
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
            src={tokenIconSrc.btc}
            alt=""
            borderRadius="round"
            style={{ width: stagePx(iconSize), height: stagePx(iconSize) }}
          />
        </styled.div>

        <Divider />

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
    </BentoStage>
  );
}
