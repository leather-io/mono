import { type CSSProperties, type ReactNode, useState } from 'react';
import { useSearchParams } from 'react-router';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { SignIcon } from '~/components/icons/sign-icon';
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
 * carry (badge fills, the disabled and pressed button). Hex, not Panda tokens, because the
 * panel stays white whatever the page theme is.
 */
const productColor = {
  backgroundSecondary: '#F9F9F8', // ink.background-secondary
  borderTransparent: '#463f3c1a', // ink.border-transparent
  nonInteractive: '#9E9996', // ink.text-non-interactive
  action: '#12100F', // ink.action-primary-default
  actionPressed: '#3A3634', // ink.action-primary-hover
  red: '#F0231B', // red.action-primary-default
  orange: '#F7931A', // orange.action-primary-default
  blue: '#5E80FF', // blue.action-primary-default
  green: '#1CBA7D', // green.action-primary-default
} as const;

/**
 * Type and sizing, matched to the other homepage bentos (bento-activity, bento-clarity):
 * list rows are 48 high with 28 px icons; a row's primary line is 12/500 and its secondary
 * line 11 in the secondary colour, on both sides; small labels above a group are 11
 * secondary; buttons are 12/500; panel titles 15/500 and headline figures 26/500. Figures use
 * the panel's tabular numerals. Small glyphs sit at 12.
 */
const rowHeight = mockupSize.rowHeight;
/** How far a list row's wash bleeds past the content inset, as ListItemBox's does. */
const rowBleed = 8;
const iconSize = mockupSize.icon;
const glyphSize = 12;
const primaryText: CSSProperties = { ...mockupType.body, fontWeight: 500 };
const secondaryText: CSSProperties = { ...mockupType.meta, color: mockupColor.secondary };

// The product's 0.1 → 0 orange wash on rows that still need a signature (ListItemBox)
const attentionWash = 'linear-gradient(90deg, rgb(247 147 26 / 0.1), rgb(247 147 26 / 0))';

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

type Chain = 'btc' | 'stx';

const chainIcon: Record<Chain, string> = {
  btc: '/icons/bitcoin.svg',
  stx: '/icons/stacks.svg',
};

/** ChainAvatar with its in-flight sub-icon, which turns into a check once broadcast. */
function ChainAvatar({
  chain,
  isDone,
  isAnimated,
}: {
  chain: Chain;
  isDone: boolean;
  isAnimated: boolean;
}) {
  return (
    <styled.span
      position="relative"
      flexShrink={0}
      style={{ width: stagePx(iconSize), height: stagePx(iconSize) }}
    >
      <styled.img src={chainIcon[chain]} alt="" width="100%" height="100%" borderRadius="round" />
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
  chain,
  caption,
  amount,
  fiat,
  needsAttention,
  isDone,
  isAnimated,
  children,
}: {
  chain: Chain;
  caption: ReactNode;
  amount: string;
  fiat: string;
  needsAttention: boolean;
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
        // ListItemBox's wash bleeds a little past the content, as in the product
        margin: `0 ${stagePx(-rowBleed)}`,
        padding: `0 ${stagePx(rowBleed)}`,
        borderRadius: stagePx(8),
        backgroundImage: attentionWash,
        backgroundRepeat: 'no-repeat',
        backgroundSize: needsAttention ? '100% 100%' : '0% 100%',
        transition: transitionFor(isAnimated, ['background-size'], 450),
      }}
    >
      <ChainAvatar chain={chain} isDone={isDone} isAnimated={isAnimated} />
      <TextPair primary={`Send ${chain === 'btc' ? 'BTC' : 'STX'}`} secondary={caption} />
      <TextPair primary={amount} secondary={fiat} align="right" />
      {children}
    </styled.div>
  );
}

const signerTone = [productColor.blue, productColor.orange, productColor.green] as const;

function SignerAvatar({
  name,
  tone,
  size = iconSize,
}: {
  name: string;
  tone: string;
  size?: number;
}) {
  return (
    <styled.span
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      borderRadius="round"
      color="white"
      style={{ width: stagePx(size), height: stagePx(size), background: tone, ...primaryText }}
    >
      {name.charAt(0)}
    </styled.span>
  );
}

type ButtonTone = 'solid' | 'ghost-danger' | 'done';

function buttonColors(tone: ButtonTone, isEnabled: boolean, isPressed: boolean) {
  if (tone === 'ghost-danger') return { background: 'transparent', color: productColor.red };
  if (tone === 'done') return { background: mockupColor.positive, color: '#FFFFFF' };
  if (!isEnabled) {
    return { background: productColor.backgroundSecondary, color: productColor.nonInteractive };
  }
  return {
    background: isPressed ? productColor.actionPressed : productColor.action,
    color: '#FFFFFF',
  };
}

/**
 * The product Button (size sm), 28 high. Pressing scales it in and darkens it, as the
 * Approve press in the Review transactions bento does; releasing springs it back with a small
 * overshoot. Done (option C only) turns it green.
 */
function MockButton({
  children,
  tone = 'solid',
  isEnabled = true,
  isPressed = false,
  isAnimated,
  height = 28,
  radius,
  style,
}: {
  children: ReactNode;
  tone?: ButtonTone;
  isEnabled?: boolean;
  isPressed?: boolean;
  isAnimated: boolean;
  height?: number;
  radius?: number;
  style?: CSSProperties;
}) {
  const { background, color } = buttonColors(tone, isEnabled, isPressed);
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      whiteSpace="nowrap"
      style={{
        height: stagePx(height),
        gap: stagePx(4),
        paddingInline: stagePx(12),
        borderRadius: radius === undefined ? '9999px' : stagePx(radius),
        background,
        color,
        transform: isPressed ? 'scale(0.95)' : 'none',
        transition: isPressed
          ? transitionFor(isAnimated, ['background-color', 'color', 'transform'], 140)
          : transitionFor(isAnimated, ['background-color', 'color', 'transform'], 420, 0, popEase),
        ...primaryText,
        ...style,
      }}
    >
      {children}
    </styled.span>
  );
}

function SignLabel() {
  return (
    <>
      <ScaledIcon size={glyphSize}>
        <SignIcon />
      </ScaledIcon>
      Sign
    </>
  );
}

function BroadcastLabel({ isDone, isAnimated }: { isDone: boolean; isAnimated: boolean }) {
  return (
    <SwapText
      index={isDone ? 1 : 0}
      align="center"
      isAnimated={isAnimated}
      items={[
        'Broadcast transaction',
        <styled.span
          key="done"
          display="inline-flex"
          alignItems="center"
          style={{ gap: stagePx(4) }}
        >
          <ScaledIcon size={glyphSize}>
            <CheckGlyph />
          </ScaledIcon>
          Broadcast
        </styled.span>,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------------------------
// Shared vaults — sample proposals. Illustrative values at roughly $75,200 / BTC and
// $0.43 / STX, as in the other bentos. Each vault is one chain, as in the product.
// ---------------------------------------------------------------------------------------------

const signerNames = ['Amber', 'Sam', 'Jane'] as const;
const meIndex = 1;

const signerAddress: Record<Chain, readonly string[]> = {
  btc: ['bc1qa7…r4m2w', 'bc1qm3…x8k5d', 'bc1qj9…t2c6h'],
  stx: ['SP2J6…K9WQ', 'SP3FB…7M2X', 'SP1HT…Q4ZD'],
};

interface VaultProposal {
  chain: Chain;
  vault: string;
  amount: string;
  fiat: string;
  /** The other member who signed before Sam */
  cosigner: 0 | 2;
  cosignedAt: string;
  signedAt: string;
}

const proposals: [VaultProposal, ...VaultProposal[]] = [
  {
    chain: 'btc',
    vault: 'Team Treasury',
    amount: '0.0150 BTC',
    fiat: '$1,128.00',
    cosigner: 0,
    cosignedAt: 'Mar 4, 09:12',
    signedAt: 'Mar 4, 16:20',
  },
  {
    chain: 'stx',
    vault: 'Grants DAO',
    amount: '2,500 STX',
    fiat: '$1,075.00',
    cosigner: 2,
    cosignedAt: 'Mar 5, 11:03',
    signedAt: 'Mar 5, 14:48',
  },
  {
    chain: 'btc',
    vault: 'Team Treasury',
    amount: '0.0042 BTC',
    fiat: '$315.84',
    cosigner: 0,
    cosignedAt: 'Mar 6, 08:30',
    signedAt: 'Mar 6, 10:15',
  },
];

// ---------------------------------------------------------------------------------------------
// A (default) — the transaction page: feed row over the Signatures card
// (pages/multisig/tx/components/signer-rollcall.tsx). Sign, broadcast, next proposal.
// ---------------------------------------------------------------------------------------------

type ProposalPhase = 'pending' | 'signing' | 'signed' | 'broadcasting' | 'broadcast';

const proposalPhases: ProposalPhase[] = [
  'pending',
  'signing',
  'signed',
  'broadcasting',
  'broadcast',
];

function phaseAtLeast(phase: ProposalPhase, target: ProposalPhase) {
  return proposalPhases.indexOf(phase) >= proposalPhases.indexOf(target);
}

function ProposalCard({
  proposal,
  phase,
  isAnimated,
}: {
  proposal: VaultProposal;
  phase: ProposalPhase;
  isAnimated: boolean;
}) {
  const isSigned = phaseAtLeast(phase, 'signed');
  const isDone = phase === 'broadcast';
  const captionIndex = Number(isSigned) + Number(isDone);

  return (
    <>
      <TransactionRow
        chain={proposal.chain}
        amount={proposal.amount}
        fiat={proposal.fiat}
        needsAttention={!isSigned}
        isDone={isDone}
        isAnimated={isAnimated}
        caption={
          <SwapText
            index={captionIndex}
            isAnimated={isAnimated}
            items={[
              `${proposal.vault} · 1 of 2 signed`,
              `${proposal.vault} · Ready to broadcast`,
              `${proposal.vault} · Broadcast`,
            ]}
          />
        }
      />

      {/* SectionLabel, at the bentos' small-label size */}
      <styled.div style={{ ...secondaryText, marginTop: stagePx(12), marginBottom: stagePx(6) }}>
        Signatures
      </styled.div>

      {/* SignerRollcall */}
      <styled.div
        overflow="hidden"
        style={{ border: `1px solid ${mockupColor.border}`, borderRadius: stagePx(8) }}
      >
        {signerNames.map((name, index) => {
          const isMe = index === meIndex;
          const hasSigned = index === proposal.cosigner || (isMe && isSigned);
          return (
            <styled.div
              key={name}
              display="flex"
              alignItems="center"
              style={{ height: stagePx(rowHeight), gap: stagePx(12), paddingInline: stagePx(12) }}
            >
              <SignerAvatar name={name} tone={signerTone[index] ?? productColor.blue} />
              <TextPair
                primary={isMe ? `${name} (me)` : name}
                secondary={signerAddress[proposal.chain][index]}
              />
              {/* Fixed trailing lane, as in the product, so statuses line up */}
              <styled.div
                display="flex"
                justifyContent="flex-end"
                flexShrink={0}
                style={{ width: stagePx(116) }}
              >
                {isMe ? (
                  <styled.span display="grid" style={{ justifyItems: 'end', alignItems: 'center' }}>
                    <span
                      style={{
                        gridArea: '1 / 1',
                        opacity: isSigned ? 0 : 1,
                        transition: transitionFor(isAnimated, ['opacity'], 220),
                      }}
                    >
                      <MockButton isPressed={phase === 'signing'} isAnimated={isAnimated}>
                        <SignLabel />
                      </MockButton>
                    </span>
                    <span
                      style={{
                        gridArea: '1 / 1',
                        whiteSpace: 'nowrap',
                        opacity: isSigned ? 1 : 0,
                        transform: isSigned ? 'none' : `translateX(${stagePx(6)})`,
                        transition: transitionFor(isAnimated, ['opacity', 'transform'], 400, 80),
                        ...mockupType.meta,
                        color: mockupColor.text,
                      }}
                    >
                      Signed {proposal.signedAt}
                    </span>
                  </styled.span>
                ) : (
                  <styled.span
                    whiteSpace="nowrap"
                    style={{
                      ...mockupType.meta,
                      color: hasSigned ? mockupColor.text : mockupColor.secondary,
                    }}
                  >
                    {hasSigned ? `Signed ${proposal.cosignedAt}` : 'Not signed yet'}
                  </styled.span>
                )}
              </styled.div>
            </styled.div>
          );
        })}
        <styled.div
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          style={{
            gap: stagePx(8),
            height: stagePx(rowHeight),
            paddingInline: stagePx(12),
            borderTop: `1px solid ${productColor.borderTransparent}`,
          }}
        >
          <MockButton tone="ghost-danger" isAnimated={isAnimated}>
            Cancel transaction
          </MockButton>
          {/* Stays the product's dark button: the reward is the check label and the badge */}
          <MockButton
            isEnabled={isSigned}
            isPressed={phase === 'broadcasting'}
            isAnimated={isAnimated}
          >
            <BroadcastLabel isDone={isDone} isAnimated={isAnimated} />
          </MockButton>
        </styled.div>
      </styled.div>
    </>
  );
}

// The feed row's wash bleeds past the content inset, so its left edge sits at 18 − 8 = 10;
// the card starts 10 down so the highlighted row has the same gutter above as beside it
const proposalTop = mockupSize.inset - rowBleed;
// Card height (≈275) plus a gap, so the next proposal waits just below the panel
const proposalPitch = 292;

/**
 * "Shared vaults", default: a vault proposal on its transaction page. Amber has signed; Sign
 * presses in, Sam (me) turns Signed and Broadcast transaction enables; Broadcast presses in and
 * springs back in its own dark colour, its label swapping to a check and Broadcast while the
 * row's badge turns into a green check; then the page scrolls up, fading out at the
 * top edge, and the next proposal (a different vault, asset and amount) slides in from below,
 * fading in only as it moves: until then it is fully hidden. Reduced motion shows the first
 * proposal broadcast.
 */
function SharedVaultBroadcastMockup() {
  // 0 pending · 1 Sign pressed · 2 signed · 3 Broadcast pressed · 4 broadcast · 5 next one in
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>(
    [1200, 180, 1100, 180, 1100],
    900
  );
  const loop = useLoopCount(step);
  const hasMovedOn = isAnimated && step >= 5;
  const current = isAnimated ? loop : 0;
  const currentPhase: ProposalPhase = isAnimated
    ? (proposalPhases[Math.min(step, 4)] ?? 'pending')
    : 'broadcast';

  // Keyed by absolute position in the endless queue, so each card keeps its element as it moves
  const cards = [current - 1, current, current + 1, current + 2].map(position => {
    const slot = position - current - (hasMovedOn ? 1 : 0);
    let phase: ProposalPhase = position < current ? 'broadcast' : 'pending';
    if (position === current) phase = currentPhase;
    return { position, slot, phase };
  });

  return (
    <BentoStage label="A Team Treasury vault proposal to send BTC: Amber has signed, I sign, the transaction is broadcast, and the next proposal comes in">
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
        <MockupPanel>
          {/* The top fade stays above the resting card, so it only touches the one leaving */}
          <styled.div position="absolute" inset="0" style={edgeFade(proposalTop - 2, 44)}>
            {cards.map(({ position, slot, phase }) => (
              <styled.div
                key={position}
                position="absolute"
                style={{
                  top: stagePx(proposalTop),
                  left: stagePx(mockupSize.inset),
                  right: stagePx(mockupSize.inset),
                  transform: `translateY(${stagePx(slot * proposalPitch)})`,
                  // Only the current card shows; the next one fades in as it slides up
                  opacity: slot === 0 ? 1 : 0,
                  transition: transitionFor(isAnimated, ['transform', 'opacity'], 700),
                }}
              >
                <ProposalCard
                  proposal={pick(proposals, position)}
                  phase={phase}
                  isAnimated={isAnimated}
                />
              </styled.div>
            ))}
          </styled.div>
        </MockupPanel>
      </div>
    </BentoStage>
  );
}

// ---------------------------------------------------------------------------------------------
// B — the vault page: balance header (vault/components/vault-balance-hero.tsx) over its pending
// transactions (vault/components/vault-transactions.tsx). Each signature fills one segment of
// a row's threshold bar; at the threshold the proposal is broadcast, clears and the queue
// moves up.
// ---------------------------------------------------------------------------------------------

interface QueuedProposal {
  /** The vault the transaction spends from */
  account: string;
  amount: string;
  fiat: string;
  /** Index into the product's vaultThemes (pages/multisig/multisig-tokens.ts) */
  theme: number;
  balance: string;
  balanceFiat: string;
}

// One vault per transaction, each in its own product theme: Blue, Bronze, Green, Orange
const queue: [QueuedProposal, ...QueuedProposal[]] = [
  {
    account: 'Payroll',
    amount: '0.0150 BTC',
    fiat: '$1,128.00',
    theme: 0,
    balance: '0.4820 BTC',
    balanceFiat: '$36,246.40',
  },
  {
    account: 'Operations',
    amount: '0.0420 BTC',
    fiat: '$3,158.40',
    theme: 1,
    balance: '1.2480 BTC',
    balanceFiat: '$93,849.60',
  },
  {
    account: 'Reserve',
    amount: '0.1000 BTC',
    fiat: '$7,520.00',
    theme: 2,
    balance: '3.5000 BTC',
    balanceFiat: '$263,200.00',
  },
  {
    account: 'Grants',
    amount: '0.0068 BTC',
    fiat: '$511.36',
    theme: 3,
    balance: '0.2150 BTC',
    balanceFiat: '$16,168.00',
  },
];

/** The vault's 2-of-3 policy: one progress segment per required signature. */
const requiredSignatures = 2;

/** The Leather display face, as the bond card's headline figure uses it. */
const brandFigure: CSSProperties = {
  ...mockupType.headline,
  fontFamily: 'Marche, sans-serif',
  fontWeight: 400,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

// The balance block: the Marche figure on a tight line over the fiat line. The vault tile spans
// exactly from the figure's cap top to the fiat line's baseline: its bottom is aligned to that
// baseline (last-baseline alignment), and its size is the distance up to the cap top, measured
// in the browser: Marche's 0.708 em caps start 3.3 down a 26 line, the fiat baseline sits
// 39.7 down.
const figureLine = 26;
const fiatLine = 15;
const figureGap = 2;
const vaultTileSize = 36.4;
const balanceHeight = figureLine + figureGap + fiatLine;

// MultisigHero's themed card, inset by the same small gutter on top, left and right
const heroInset = 10;
const heroPadding = 16;
const heroHeight = balanceHeight + heroPadding * 2;
const pendingTop = heroInset + heroHeight + 14;
const queueTop = pendingTop + 15 + 6;
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
 * theme. A white ring, drawn inside the tile so it stays flush with the text, keeps it from
 * melting into the card behind it.
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
          boxShadow: `inset 0 0 0 ${stagePx(1.75)} #FFFFFF`,
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
      <styled.div display="flex" flexDirection="column" style={{ gap: stagePx(figureGap) }}>
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
  signed,
  isDone,
  isAnimated,
}: {
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
      {Array.from({ length: requiredSignatures }, (_, segment) => (
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
 * "Shared vaults", option B: a vault page. Its themed balance card belongs to the vault of the
 * pending transaction at the top. That transaction gets its second signature (its second bar
 * segment fills), is broadcast (check badge, the bar turns green), the next proposal gets its
 * first signature, then the top one clears, the queue moves up and the card cross-fades to the
 * next vault's theme and balance. Reduced motion shows the first vault, its transaction
 * broadcast.
 */
function SharedVaultQueueMockup() {
  // 0 waiting · 1 second signature · 2 broadcast · 3 next row's first signature · 4 clears
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([1100, 900, 800, 900], 900);
  const loop = useLoopCount(step);
  const head = isAnimated ? loop : 0;
  // Reduced motion: the top row broadcast, the next one at one signature
  const visibleStep = isAnimated ? step : 3;
  const hasCleared = isAnimated && step >= 4;
  // The card follows the vault of the transaction at the top of the queue
  const active = head + (hasCleared ? 1 : 0);

  const rows = Array.from({ length: visibleRows + 2 }, (_, index) => index - 1).map(offset => {
    const slot = offset - (hasCleared ? 1 : 0);
    let signed = 0;
    if (offset < 0) signed = 2;
    else if (offset === 0) signed = visibleStep >= 1 ? 2 : 1;
    else if (offset === 1 && visibleStep >= 3) signed = 1;
    const isDone = offset < 0 || (offset === 0 && visibleStep >= 2);
    return { position: head + offset, slot, signed, isDone };
  });

  return (
    <BentoStage label="A vault's BTC balance on its themed card over pending transactions whose signature bars fill one segment per signer, then broadcast and clear one by one, the card switching to each next transaction's vault">
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
            style={{ top: stagePx(pendingTop), left: stagePx(mockupSize.inset), ...secondaryText }}
          >
            Pending
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
                    chain="btc"
                    amount={entry.amount}
                    fiat={entry.fiat}
                    needsAttention={false}
                    isDone={isDone}
                    isAnimated={isAnimated}
                    caption={
                      <SwapText
                        index={isDone ? requiredSignatures + 1 : signed}
                        isAnimated={isAnimated}
                        items={[
                          ...Array.from(
                            { length: requiredSignatures + 1 },
                            (_, count) =>
                              `${entry.account} · ${count} of ${requiredSignatures} signed`
                          ),
                          `${entry.account} · Broadcast`,
                        ]}
                      />
                    }
                  >
                    <SignatureProgress signed={signed} isDone={isDone} isAnimated={isAnimated} />
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
// C — the signer roll-call as a threshold: a 2-of-3 ring fills as members sign, then the
// proposal is broadcast. Same data and members as the transaction page.
// ---------------------------------------------------------------------------------------------

const ringSize = 112;
const ringStroke = 6;
const ringRadius = 44; // in the 100-unit viewBox
const ringCircumference = 2 * Math.PI * ringRadius;
const ringGap = 16;
const ringSegment = ringCircumference / 2 - ringGap;

function ThresholdRing({
  signed,
  isDone,
  isAnimated,
  isSnapped,
}: {
  signed: number;
  isDone: boolean;
  isAnimated: boolean;
  /** Resets without animating, while the card is faded out between proposals */
  isSnapped: boolean;
}) {
  const animate = isAnimated && !isSnapped;
  const gapDegrees = (ringGap / ringCircumference) * 360;
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: 'visible' }}>
      {[0, 1].map(segment => {
        const rotate = `rotate(${-90 + segment * 180 + gapDegrees / 2} 50 50)`;
        const isFilled = segment < signed;
        return (
          <g key={segment} transform={rotate}>
            <circle
              cx="50"
              cy="50"
              r={ringRadius}
              fill="none"
              stroke={mockupColor.divider}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={`${ringSegment} ${ringCircumference * 2}`}
            />
            <circle
              cx="50"
              cy="50"
              r={ringRadius}
              fill="none"
              stroke={isDone ? mockupColor.positive : productColor.action}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={`${ringSegment} ${ringCircumference * 2}`}
              style={{
                strokeDashoffset: isFilled ? 0 : ringSegment,
                opacity: isFilled ? 1 : 0,
                transition: animate
                  ? `stroke-dashoffset 620ms ${ease}, opacity 120ms linear, stroke 400ms ${ease}`
                  : undefined,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * "Shared vaults", option C: the 2-of-3 threshold as a ring. Amber's signature fills half;
 * Sign presses in, Sam's avatar gets its check and the ring closes; Broadcast transaction
 * presses in, the ring turns green with a check at its centre; then the next proposal fades in.
 */
function SharedVaultThresholdMockup() {
  // 0 one of two · 1 Sign pressed · 2 signed · 3 Broadcast pressed · 4 broadcast · 5 fade out
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>(
    [1200, 180, 1200, 180, 1500],
    450
  );
  const loop = useLoopCount(step);
  const proposal = pick(proposals, isAnimated ? loop : 0);
  const visibleStep = isAnimated ? step : 4;
  const isSigned = visibleStep >= 2;
  const isDone = visibleStep >= 4;
  const isLeaving = visibleStep >= 5;
  // Step 0 is the restart: inner parts snap back while the card fades in
  const isSnapped = visibleStep === 0;
  const innerAnimated = isAnimated && !isSnapped;
  const signedCount = isSigned ? 2 : 1;

  return (
    <BentoStage label="A Team Treasury proposal to send BTC: a two-of-three signature ring fills as I sign, then the transaction is broadcast">
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
        <MockupPanel>
          <styled.div
            position="absolute"
            inset="0"
            display="flex"
            flexDirection="column"
            alignItems="center"
            style={{
              paddingTop: stagePx(28),
              paddingBottom: stagePx(16),
              paddingInline: stagePx(mockupSize.inset),
              opacity: isLeaving ? 0 : 1,
              transform: isLeaving ? `translateY(${stagePx(-10)})` : 'none',
              transition: transitionFor(
                isAnimated,
                ['opacity', 'transform'],
                isLeaving ? 360 : 520
              ),
            }}
          >
            {/* Threshold ring with the count, then a check, at its centre */}
            <styled.div
              position="relative"
              flexShrink={0}
              style={{
                width: stagePx(ringSize),
                height: stagePx(ringSize),
                transform: visibleStep === 3 ? 'scale(0.97)' : 'none',
                transition: transitionFor(innerAnimated, ['transform'], 420, 0, popEase),
              }}
            >
              <ThresholdRing
                signed={signedCount}
                isDone={isDone}
                isAnimated={isAnimated}
                isSnapped={isSnapped}
              />
              <styled.div position="absolute" inset="0" display="grid" placeItems="center">
                <SwapText
                  index={isDone ? 1 : 0}
                  align="center"
                  isAnimated={innerAnimated}
                  items={[
                    <styled.span
                      key="count"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <SwapText
                        index={signedCount - 1}
                        align="center"
                        isAnimated={innerAnimated}
                        items={['1', '2']}
                        style={mockupType.headline}
                      />
                      <styled.span style={secondaryText}>of 2 signed</styled.span>
                    </styled.span>,
                    <styled.span
                      key="done"
                      display="block"
                      style={{
                        width: stagePx(32),
                        height: stagePx(32),
                        transform: isDone ? 'none' : 'scale(0.5)',
                        transition: transitionFor(innerAnimated, ['transform'], 460, 0, popEase),
                      }}
                    >
                      <CheckGlyph color={mockupColor.positive} />
                    </styled.span>,
                  ]}
                />
              </styled.div>
            </styled.div>

            <styled.div style={{ ...mockupType.title, marginTop: stagePx(16) }}>
              Send {proposal.amount}
            </styled.div>
            <SwapText
              index={Number(isSigned) + Number(isDone)}
              align="center"
              isAnimated={innerAnimated}
              style={{ ...secondaryText, marginTop: stagePx(2) }}
              items={[
                `${proposal.vault} · 2 of 3 must sign`,
                `${proposal.vault} · Ready to broadcast`,
                `${proposal.vault} · Broadcast`,
              ]}
            />

            {/* Members, with a check badge as each one signs */}
            <styled.div display="flex" style={{ gap: stagePx(28), marginTop: stagePx(22) }}>
              {signerNames.map((name, index) => {
                const isMe = index === meIndex;
                const hasSigned = index === proposal.cosigner || (isMe && isSigned);
                return (
                  <styled.div
                    key={name}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    style={{ gap: stagePx(4) }}
                  >
                    <styled.span
                      position="relative"
                      style={{
                        opacity: hasSigned ? 1 : 0.4,
                        transition: transitionFor(innerAnimated, ['opacity'], 300),
                      }}
                    >
                      <SignerAvatar name={name} tone={signerTone[index] ?? productColor.blue} />
                      <Badge>
                        <DoneBadge isShown={hasSigned} isAnimated={innerAnimated} />
                      </Badge>
                    </styled.span>
                    <styled.span
                      style={{
                        ...mockupType.meta,
                        color: hasSigned ? mockupColor.text : mockupColor.secondary,
                      }}
                    >
                      {name}
                    </styled.span>
                  </styled.div>
                );
              })}
            </styled.div>

            {/* One action at a time: Sign, then Broadcast transaction */}
            <styled.div marginTop="auto" alignSelf="stretch" display="grid">
              <MockButton
                height={36}
                radius={8}
                isPressed={visibleStep === 1}
                isAnimated={innerAnimated}
                style={{
                  gridArea: '1 / 1',
                  opacity: isSigned ? 0 : 1,
                  pointerEvents: 'none',
                }}
              >
                <SignLabel />
              </MockButton>
              <MockButton
                height={36}
                radius={8}
                tone={isDone ? 'done' : 'solid'}
                isPressed={visibleStep === 3}
                isAnimated={innerAnimated}
                style={{ gridArea: '1 / 1', opacity: isSigned ? 1 : 0 }}
              >
                <BroadcastLabel isDone={isDone} isAnimated={innerAnimated} />
              </MockButton>
            </styled.div>
          </styled.div>
        </MockupPanel>
      </div>
    </BentoStage>
  );
}

/**
 * "Shared vaults". DESIGN REVIEW ONLY: `?vault=b` and `?vault=c` on the homepage preview the
 * two alternative loops; anything else shows the default (A). Remove this switch, and the
 * variants not chosen, once a direction is picked.
 */
export function SharedVaultMockup() {
  const [searchParams] = useSearchParams();
  const variant = searchParams.get('vault');
  if (variant === 'b') return <SharedVaultQueueMockup />;
  if (variant === 'c') return <SharedVaultThresholdMockup />;
  return <SharedVaultBroadcastMockup />;
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
