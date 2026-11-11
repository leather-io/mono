import { type CSSProperties, type ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { SignIcon } from '~/components/icons/sign-icon';

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
 * Light-theme values of the product tokens these two mockups use that the shared frame
 * doesn't carry (status colours, badge fills, the disabled button). Hex, not Panda tokens,
 * because the panel stays white whatever the page theme is.
 */
const productColor = {
  subdued: '#7B7572', // ink.text-subdued
  nonInteractive: '#9E9996', // ink.text-non-interactive
  backgroundSecondary: '#F9F9F8', // ink.background-secondary
  borderTransparent: '#463f3c1a', // ink.border-transparent
  action: '#12100F', // ink.action-primary-default
  green: '#1CBA7D', // green.action-primary-default
  red: '#F0231B', // red.action-primary-default
  orange: '#F7931A', // orange.action-primary-default
  blue: '#5E80FF', // blue.action-primary-default
  stacks: '#5546FF',
} as const;

// The product's 0.1 → 0 orange wash on rows that still need a signature (ListItemBox)
const attentionWash = 'linear-gradient(90deg, rgb(247 147 26 / 0.1), rgb(247 147 26 / 0))';

const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';

function transitionFor(isAnimated: boolean, properties: string[], ms = 400, delayMs = 0) {
  if (!isAnimated) return undefined;
  return properties.map(property => `${property} ${ms}ms ${ease} ${delayMs}ms`).join(', ');
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

/** Two labels in one slot, cross-fading so the layout never jumps. */
function SwapText({
  showSecond,
  first,
  second,
  isAnimated,
  style,
}: {
  showSecond: boolean;
  first: ReactNode;
  second: ReactNode;
  isAnimated: boolean;
  style?: CSSProperties;
}) {
  function layer(isShown: boolean): CSSProperties {
    return {
      gridArea: '1 / 1',
      opacity: isShown ? 1 : 0,
      transform: isShown ? 'none' : `translateY(${stagePx(3)})`,
      transition: transitionFor(isAnimated, ['opacity', 'transform'], 320),
    };
  }
  return (
    <styled.span display="grid" whiteSpace="nowrap" style={style}>
      <span style={layer(!showSecond)}>{first}</span>
      <span style={layer(showSecond)}>{second}</span>
    </styled.span>
  );
}

// ---------------------------------------------------------------------------------------------
// Shared vaults — mirrors the web app's multisig transaction page: the feed row
// (pages/multisig/components/transaction-row.tsx) over the Signatures card
// (pages/multisig/tx/components/signer-rollcall.tsx)
// ---------------------------------------------------------------------------------------------

const vaultSigners = [
  { name: 'Amber', address: 'bc1qa7…r4m2w', tone: productColor.blue },
  { name: 'Me', address: 'bc1qm3…x8k5d', tone: productColor.orange, isMe: true },
  { name: 'Jane', address: 'bc1qj9…t2c6h', tone: productColor.green },
] as const;

function SignerAvatar({ name, tone }: { name: string; tone: string }) {
  return (
    <styled.span
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      borderRadius="round"
      color="white"
      style={{
        width: stagePx(26),
        height: stagePx(26),
        background: tone,
        ...mockupType.meta,
        fontWeight: 500,
      }}
    >
      {name.charAt(0)}
    </styled.span>
  );
}

// Button recipe: solid (hover shade while pressed, muted when disabled) and ghost danger
function pillColors(variant: 'solid' | 'ghost-danger', isEnabled: boolean, isPressed: boolean) {
  if (variant === 'ghost-danger') return { background: 'transparent', color: productColor.red };
  if (!isEnabled) {
    return { background: productColor.backgroundSecondary, color: productColor.nonInteractive };
  }
  return { background: isPressed ? '#3A3634' : productColor.action, color: '#FFFFFF' };
}

function PillButton({
  children,
  variant,
  isEnabled = true,
  isPressed = false,
  isAnimated,
  icon,
}: {
  children: ReactNode;
  variant: 'solid' | 'ghost-danger';
  isEnabled?: boolean;
  isPressed?: boolean;
  isAnimated: boolean;
  icon?: ReactNode;
}) {
  const { background, color } = pillColors(variant, isEnabled, isPressed);
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      borderRadius="round"
      whiteSpace="nowrap"
      style={{
        height: stagePx(26),
        gap: stagePx(3),
        paddingInline: stagePx(10),
        paddingRight: icon ? stagePx(12) : undefined,
        background,
        color,
        transform: isPressed ? 'scale(0.95)' : 'none',
        transition: transitionFor(isAnimated, ['background-color', 'color', 'transform'], 300),
        ...mockupType.meta,
        fontWeight: 500,
      }}
    >
      {icon}
      {children}
    </styled.span>
  );
}

/**
 * "Shared vaults": a vault's Send BTC proposal on its transaction page. Amber has signed; Me
 * presses Sign, the row turns Signed, the proposal reads Ready to broadcast and Broadcast
 * transaction enables. Loops while in view; reduced motion shows the ready state.
 */
export function SharedVaultMockup() {
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([1300, 360], 2800);
  const isPressing = step === 1;
  const isSigned = step >= 2;

  return (
    <BentoStage label="A Team Treasury vault proposal to send BTC: two of three members sign, and it becomes ready to broadcast">
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
        <MockupPanel style={{ padding: stagePx(mockupSize.inset) }}>
          {/* Transaction row, as in the feed: chain avatar with the in-flight sub-icon */}
          <styled.div
            display="flex"
            alignItems="center"
            style={{
              gap: stagePx(12),
              margin: `0 ${stagePx(-8)}`,
              padding: `${stagePx(10)} ${stagePx(8)}`,
              borderRadius: stagePx(6),
              backgroundColor: 'transparent',
              backgroundImage: attentionWash,
              backgroundRepeat: 'no-repeat',
              backgroundSize: isSigned ? '0% 100%' : '100% 100%',
              transition: transitionFor(isAnimated, ['background-size'], 450),
            }}
          >
            <styled.span
              position="relative"
              flexShrink={0}
              style={{ width: stagePx(32), height: stagePx(32) }}
            >
              <styled.img
                src="/icons/bitcoin.svg"
                alt=""
                width="100%"
                height="100%"
                borderRadius="round"
              />
              <styled.span
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="round"
                className={isAnimated ? undefined : stillSpinner}
                style={{
                  right: stagePx(-2),
                  bottom: stagePx(-2),
                  width: stagePx(15),
                  height: stagePx(15),
                  background: mockupColor.panel,
                }}
              >
                <ScaledIcon size={12}>
                  <PendingIndicatorIcon size={12} />
                </ScaledIcon>
              </styled.span>
            </styled.span>
            <styled.div minWidth={0} flex={1}>
              <styled.div style={mockupType.title}>Send BTC</styled.div>
              <SwapText
                showSecond={isSigned}
                isAnimated={isAnimated}
                first="Team Treasury · 1 of 2 signed"
                second="Team Treasury · Ready to broadcast"
                style={{ ...mockupType.meta, color: productColor.subdued, marginTop: stagePx(1) }}
              />
            </styled.div>
            <styled.div textAlign="right" flexShrink={0}>
              <styled.div style={{ ...mockupType.body, fontWeight: 500 }}>0.0150 BTC</styled.div>
              <styled.div
                style={{ ...mockupType.meta, color: productColor.subdued, marginTop: stagePx(1) }}
              >
                $990.00
              </styled.div>
            </styled.div>
          </styled.div>

          {/* SectionLabel */}
          <styled.div style={{ ...mockupType.title, marginTop: stagePx(14) }}>
            Signatures
          </styled.div>

          {/* SignerRollcall */}
          <styled.div
            overflow="hidden"
            style={{
              marginTop: stagePx(8),
              border: `1px solid ${mockupColor.border}`,
              borderRadius: stagePx(8),
            }}
          >
            {vaultSigners.map(signer => {
              const isMe = 'isMe' in signer;
              const hasSigned = signer.name === 'Amber' || (isMe && isSigned);
              return (
                <styled.div
                  key={signer.name}
                  display="flex"
                  alignItems="center"
                  style={{ gap: stagePx(10), padding: `${stagePx(11)} ${stagePx(13)}` }}
                >
                  <SignerAvatar name={signer.name} tone={signer.tone} />
                  <styled.div flex={1} minWidth={0}>
                    <styled.div style={{ ...mockupType.body, fontWeight: 500 }}>
                      {signer.name}
                      {isMe ? ' (me)' : ''}
                    </styled.div>
                    <styled.div style={{ ...mockupType.meta, color: productColor.subdued }}>
                      {signer.address}
                    </styled.div>
                  </styled.div>
                  {/* Fixed trailing lane, as in the product, so statuses line up */}
                  <styled.div
                    display="flex"
                    justifyContent="flex-end"
                    flexShrink={0}
                    style={{ width: stagePx(112) }}
                  >
                    {isMe ? (
                      <styled.span display="grid" style={{ justifyItems: 'end' }}>
                        <span
                          style={{
                            gridArea: '1 / 1',
                            opacity: isSigned ? 0 : 1,
                            transition: transitionFor(isAnimated, ['opacity'], 250),
                          }}
                        >
                          <PillButton
                            variant="solid"
                            isPressed={isPressing}
                            isAnimated={isAnimated}
                            icon={
                              <ScaledIcon size={12}>
                                <SignIcon />
                              </ScaledIcon>
                            }
                          >
                            Sign
                          </PillButton>
                        </span>
                        <span
                          style={{
                            gridArea: '1 / 1',
                            alignSelf: 'center',
                            whiteSpace: 'nowrap',
                            opacity: isSigned ? 1 : 0,
                            transform: isSigned ? 'none' : `translateX(${stagePx(6)})`,
                            transition: transitionFor(
                              isAnimated,
                              ['opacity', 'transform'],
                              400,
                              80
                            ),
                            color: productColor.green,
                            ...mockupType.meta,
                          }}
                        >
                          Signed Mar 4, 16:20
                        </span>
                      </styled.span>
                    ) : (
                      <styled.span
                        whiteSpace="nowrap"
                        style={{
                          ...mockupType.meta,
                          color: hasSigned ? productColor.green : productColor.subdued,
                        }}
                      >
                        {hasSigned ? 'Signed Mar 4, 09:12' : 'Not signed yet'}
                      </styled.span>
                    )}
                  </styled.div>
                </styled.div>
              );
            })}
            <styled.div
              display="flex"
              justifyContent="flex-end"
              style={{
                gap: stagePx(8),
                padding: `${stagePx(11)} ${stagePx(13)}`,
                borderTop: `1px solid ${productColor.borderTransparent}`,
              }}
            >
              <PillButton variant="ghost-danger" isAnimated={isAnimated}>
                Cancel transaction
              </PillButton>
              <PillButton variant="solid" isEnabled={isSigned} isAnimated={isAnimated}>
                Broadcast transaction
              </PillButton>
            </styled.div>
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
              <styled.div display="flex" alignItems="center" style={{ gap: stagePx(3) }}>
                <styled.span style={{ ...mockupType.body, fontWeight: 500 }}>In a bond</styled.span>
                <ScaledIcon size={13}>
                  <InfoCircleIcon variant="small" color="ink.text-subdued" />
                </ScaledIcon>
              </styled.div>
              <styled.div
                textTransform="uppercase"
                style={{
                  fontFamily: 'Marche, sans-serif',
                  fontSize: stagePx(26),
                  lineHeight: 1.1,
                  letterSpacing: '0.02em',
                  marginTop: stagePx(4),
                }}
              >
                $31,420.50
              </styled.div>
              <styled.div
                style={{ ...mockupType.meta, color: productColor.subdued, marginTop: stagePx(2) }}
              >
                0.50 BTC
              </styled.div>
            </div>
            <styled.img
              src="/icons/bitcoin.svg"
              alt=""
              borderRadius="round"
              style={{ width: stagePx(38), height: stagePx(38) }}
            />
          </styled.div>

          <Divider />

          {/* BondPositionSection in its CollapsibleSection */}
          <styled.div style={{ paddingBlock: stagePx(15) }}>
            <styled.div
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              style={{ gap: stagePx(6) }}
            >
              <styled.div display="flex" alignItems="center" style={{ gap: stagePx(6) }}>
                <styled.span style={mockupType.title}>Period 14</styled.span>
                <styled.span
                  display="inline-flex"
                  alignItems="center"
                  borderRadius="round"
                  style={{
                    padding: `${stagePx(1)} ${stagePx(6)}`,
                    background: productColor.backgroundSecondary,
                    border: `1px solid ${productColor.borderTransparent}`,
                    color: productColor.subdued,
                    ...mockupType.meta,
                    fontWeight: 500,
                  }}
                >
                  Active
                </styled.span>
              </styled.div>
              <styled.div display="flex" alignItems="center" style={{ gap: stagePx(6) }}>
                <span
                  style={{
                    ...mockupType.body,
                    fontWeight: 500,
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
                  <ScaledIcon size={13}>
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
                  style={{ gap: stagePx(8), paddingTop: stagePx(12) }}
                >
                  {bondDetailRows.map(([label, value], index) => (
                    <styled.div
                      key={label}
                      display="flex"
                      justifyContent="space-between"
                      style={{
                        gap: stagePx(12),
                        ...mockupType.meta,
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
                      <span style={{ color: productColor.subdued }}>{label}</span>
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
            style={{
              gap: stagePx(3),
              paddingBlock: stagePx(15),
              ...mockupType.body,
              fontWeight: 500,
            }}
          >
            Manage in Bitcoin Staking
            <ScaledIcon size={13}>
              <ExternalLinkIcon variant="small" />
            </ScaledIcon>
          </styled.div>
        </MockupPanel>
      </div>
    </BentoStage>
  );
}
