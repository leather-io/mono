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

// Product colours the shared frame doesn't carry: the light theme's action and hover inks
const productColor = {
  action: '#12100F',
  actionPressed: '#3A3633',
  hover: '#F5F3F1',
  switchBorder: '#D9D6D2',
  switchThumbOff: '#BEB9B5',
  avatar: '#EFEDEA',
} as const;

const ease = 'cubic-bezier(0.25, 1, 0.5, 1)';

function transitionFor(isAnimated: boolean, properties: string[], ms = 350, delayMs = 0) {
  if (!isAnimated) return undefined;
  return properties.map(property => `${property} ${ms}ms ${ease} ${delayMs}ms`).join(', ');
}

// Header band; the Send mockup's first row starts at 68
const headerHeight = 64;
const tokenRowHeight = 46;
const spamTokenId = 'tlc';

const insetX = { paddingLeft: stagePx(mockupSize.inset), paddingRight: stagePx(mockupSize.inset) };

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

function TokenIcon({ src, letter }: { src?: string; letter?: string }) {
  const size = stagePx(mockupSize.icon);
  if (src)
    return (
      <styled.img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        flexShrink={0}
        borderRadius="50%"
        style={{ width: size, height: size }}
      />
    );
  // Tokens without an image get the extension's letter avatar
  return (
    <styled.span
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      borderRadius="50%"
      style={{
        width: size,
        height: size,
        background: productColor.avatar,
        color: mockupColor.secondary,
        ...mockupType.body,
        fontWeight: 500,
      }}
    >
      {letter}
    </styled.span>
  );
}

/** Two-line item, as the extension's ItemLayout: title and caption left, values right. */
function ItemRow({
  img,
  title,
  caption,
  right,
  style,
}: {
  img: ReactNode;
  title: string;
  caption: string;
  right?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <styled.div display="flex" alignItems="center" style={{ gap: stagePx(12), ...style }}>
      {img}
      <styled.div display="flex" flexDirection="column" flex="1" minWidth="0">
        <styled.span style={{ ...mockupType.body, fontWeight: 500 }}>{title}</styled.span>
        <styled.span style={{ ...mockupType.meta, color: mockupColor.secondary }}>
          {caption}
        </styled.span>
      </styled.div>
      {right}
    </styled.div>
  );
}

function RightValues({ title, caption }: { title: string; caption: string }) {
  return (
    <styled.div display="flex" flexDirection="column" alignItems="flex-end">
      <styled.span style={{ ...mockupType.body, fontWeight: 500 }}>{title}</styled.span>
      <styled.span style={{ ...mockupType.meta, color: mockupColor.secondary }}>
        {caption}
      </styled.span>
    </styled.div>
  );
}

/** The extension's Switch (42 × 24 next to a 40 px avatar), scaled to the 28 px stage icon. */
function MockSwitch({ isOn, isAnimated }: { isOn: boolean; isAnimated: boolean }) {
  const width = 30;
  const height = 18;
  const thumb = 13;
  const gap = 2;
  const transition = transitionFor(isAnimated, ['background-color', 'border-color']);
  return (
    <styled.span
      display="flex"
      alignItems="center"
      flexShrink={0}
      borderRadius="9999px"
      style={{
        width: stagePx(width),
        height: stagePx(height),
        border: `1px solid ${isOn ? productColor.action : productColor.switchBorder}`,
        background: isOn ? productColor.action : mockupColor.panel,
        transition,
      }}
    >
      <styled.span
        display="block"
        borderRadius="9999px"
        style={{
          width: stagePx(thumb),
          height: stagePx(thumb),
          background: isOn ? mockupColor.panel : productColor.switchThumbOff,
          transform: `translateX(${stagePx(isOn ? width - 2 - thumb - gap : gap)})`,
          transition: transitionFor(isAnimated, ['transform', 'background-color']),
        }}
      />
    </styled.span>
  );
}

function ScreenHeader({ title }: { title: string }) {
  return (
    <styled.div
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{ height: stagePx(headerHeight), ...insetX }}
    >
      <styled.span
        position="absolute"
        style={{ left: stagePx(mockupSize.inset), color: mockupColor.text }}
      >
        <StrokeIcon size={16}>
          <path d="M10 3 L5 8 L10 13" />
        </StrokeIcon>
      </styled.span>
      <styled.span style={mockupType.title}>{title}</styled.span>
    </styled.div>
  );
}

const manageableTokens = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', src: '/icons/bitcoin.svg' },
  { id: 'stx', name: 'Stacks', symbol: 'STX', src: '/icons/stacks.svg' },
  { id: 'sbtc', name: 'sBTC', symbol: 'sBTC', src: '/icons/sbtc.svg' },
  { id: spamTokenId, name: 'Totally Legit Coin', symbol: 'TLC', letter: 'T' },
  { id: 'usdcx', name: 'USDCx', symbol: 'USDCx', src: '/marketing/apps/usdc.svg' },
  { id: 'alex', name: 'ALEX', symbol: 'ALEX', src: '/icons/alex.svg' },
] as const;

/**
 * "Show or hide tokens": the extension's Manage tokens page (pages/manage-tokens with
 * CryptoAssetItemToggle rows: icon, name, symbol, switch). The spam token's row is pressed, its
 * switch turns off and the row dims; then it starts over. Reduced motion shows it switched off.
 */
export function ManageTokensMockup() {
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([1100, 180], 2600);
  const isPressed = step === 1;
  const isSpamHidden = step >= 2;

  return (
    <BentoStage label="The extension's Manage tokens list, with a spam token named Totally Legit Coin switched off">
      <styled.div ref={ref} position="absolute" inset="0">
        <MockupPanel>
          <ScreenHeader title="Manage tokens" />
          <styled.div display="flex" flexDirection="column" style={insetX}>
            {manageableTokens.map(token => {
              const isSpam = token.id === spamTokenId;
              const isOn = !(isSpam && isSpamHidden);
              return (
                <styled.div
                  key={token.id}
                  display="flex"
                  alignItems="center"
                  style={{
                    height: stagePx(tokenRowHeight),
                    // Pressable's hover fill bleeds a little past the content, as in the extension
                    margin: `0 ${stagePx(-8)}`,
                    padding: `0 ${stagePx(8)}`,
                    borderRadius: stagePx(8),
                    background: isSpam && isPressed ? productColor.hover : 'transparent',
                    transition: transitionFor(isAnimated, ['background-color'], 200),
                  }}
                >
                  <ItemRow
                    style={{
                      flex: 1,
                      opacity: isOn ? 1 : 0.4,
                      transition: transitionFor(isAnimated, ['opacity'], 400),
                    }}
                    img={
                      'src' in token ? (
                        <TokenIcon src={token.src} />
                      ) : (
                        <TokenIcon letter={token.letter} />
                      )
                    }
                    title={token.name}
                    caption={token.symbol}
                  />
                  <MockSwitch isOn={isOn} isAnimated={isAnimated} />
                </styled.div>
              );
            })}
          </styled.div>
        </MockupPanel>
      </styled.div>
    </BentoStage>
  );
}

function RabbitIcon() {
  // The extension's Standard fee icon (AnimalRabbitIcon) on its hover-tone avatar
  return (
    <styled.span
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      borderRadius="50%"
      style={{
        width: stagePx(mockupSize.icon),
        height: stagePx(mockupSize.icon),
        background: productColor.avatar,
        color: mockupColor.text,
      }}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        style={{ width: stagePx(18), height: stagePx(18), display: 'block' }}
      >
        <path
          d="M12.4286 15.7381L15.1775 17.0043C16.4952 17.6112 17.3393 18.9293 17.3393 20.38V20.38M12.4286 20.119H9.30357L6.96986 18.8457C5.03086 17.7877 4.27166 15.3885 5.24906 13.4076V13.4076C6.25555 11.3678 8.725 10.5301 10.7649 11.5364L17.7857 15H21.3571V13.3333L14.9731 9.9085C14.3159 9.55589 14.0847 8.72679 14.4647 8.08498V8.08498C14.8235 7.47902 15.5969 7.26468 16.2164 7.5995L27.2638 13.57C28.0254 13.9816 28.5 14.7776 28.5 15.6433V15.6433C28.5 16.9449 27.4449 18 26.1433 18H22.1515C21.057 18 19.9927 18.3591 19.122 19.0223L17.3393 20.38M12.4286 20.119H13.5V22.7463M12.4286 20.119L7.07143 24.1905L8.07178 25.0014C8.79334 25.5864 9.82265 25.5975 10.5567 25.0284L13.5 22.7463M13.5 22.7463V25H24.0357V24C24.0357 22.8954 23.1403 22 22.0357 22H17.3393V20.38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </styled.span>
  );
}

function Subheader({ children }: { children: ReactNode }) {
  return (
    <styled.span
      display="block"
      style={{ ...mockupType.meta, color: mockupColor.secondary, marginBottom: stagePx(6) }}
    >
      {children}
    </styled.span>
  );
}

function Divider() {
  return <styled.div style={{ height: '1px', background: mockupColor.divider }} />;
}

const buttonBase: CSSProperties = {
  flex: 1,
  height: stagePx(36),
  borderRadius: stagePx(8),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...mockupType.body,
  fontWeight: 500,
};

/**
 * "Review transactions": the extension's Sign transaction approver
 * (features/rpc-stacks-transaction-request, with the mobile approver's "You'll send" wording):
 * what leaves and arrives, the fee, the total spend, and Cancel / Approve. The sections settle in
 * one after another above the actions, then Approve presses. Reduced motion shows the settled screen.
 */
export function ReviewTransactionMockup() {
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([500, 1700, 160], 2400);
  const isShown = step >= 1;
  const isPressed = step === 2;

  function sectionStyle(index: number): CSSProperties {
    return {
      opacity: isShown ? 1 : 0,
      transform: isShown ? 'none' : `translateY(${stagePx(8)})`,
      transition: isShown
        ? transitionFor(isAnimated, ['opacity', 'transform'], 420, index * 90)
        : transitionFor(isAnimated, ['opacity', 'transform'], 300),
    };
  }

  return (
    <BentoStage label="The extension's Sign transaction screen: send 50 STX and receive sBTC, with the fee, total spend and Approve button">
      <styled.div ref={ref} position="absolute" inset="0">
        <MockupPanel style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Approver header: title, then the requesting app */}
          <styled.div
            display="flex"
            flexDirection="column"
            justifyContent="center"
            style={{ height: stagePx(68), ...insetX }}
          >
            <styled.span style={mockupType.title}>Sign transaction</styled.span>
            <styled.span
              display="flex"
              alignItems="center"
              style={{
                ...mockupType.meta,
                color: mockupColor.secondary,
                gap: stagePx(5),
                marginTop: stagePx(4),
              }}
            >
              <styled.img
                src="/icons/bitflow.png"
                alt=""
                loading="lazy"
                decoding="async"
                borderRadius="3px"
                style={{ width: stagePx(12), height: stagePx(12) }}
              />
              Requested by <span style={{ color: mockupColor.text }}>app.bitflow.finance</span>
            </styled.span>
          </styled.div>
          <Divider />

          <styled.div style={{ ...insetX, paddingTop: stagePx(10), ...sectionStyle(0) }}>
            <Subheader>You’ll send</Subheader>
            <ItemRow
              img={<TokenIcon src="/icons/stacks.svg" />}
              title="Stacks"
              caption="STX"
              right={<RightValues title="50 STX" caption="$29.10" />}
            />
          </styled.div>
          <styled.div style={{ ...insetX, paddingTop: stagePx(10), ...sectionStyle(1) }}>
            <Subheader>You’ll receive</Subheader>
            <ItemRow
              img={<TokenIcon src="/icons/sbtc.svg" />}
              title="sBTC"
              caption="sBTC"
              right={<RightValues title="0.00031 sBTC" caption="$29.04" />}
            />
          </styled.div>

          <styled.div style={{ marginTop: stagePx(12), ...sectionStyle(2) }}>
            <Divider />
            <ItemRow
              style={{ ...insetX, height: stagePx(50) }}
              img={<RabbitIcon />}
              title="Standard"
              caption="~2 min"
              right={
                <styled.span display="flex" alignItems="center" style={{ gap: stagePx(6) }}>
                  <RightValues title="0.003 STX" caption="$0.01" />
                  <styled.span style={{ color: mockupColor.secondary }}>
                    <StrokeIcon size={12}>
                      <path d="M6 3 L11 8 L6 13" />
                    </StrokeIcon>
                  </styled.span>
                </styled.span>
              }
            />
            <Divider />
          </styled.div>

          {/* Actions footer */}
          <styled.div marginTop="auto" style={{ ...insetX, paddingBottom: stagePx(16) }}>
            <styled.div
              display="flex"
              justifyContent="space-between"
              style={{ ...mockupType.body, fontWeight: 500, marginBottom: stagePx(10) }}
            >
              <span>Total spend</span>
              <span>$29.11</span>
            </styled.div>
            <styled.div display="flex" style={{ gap: stagePx(10) }}>
              <styled.span style={{ ...buttonBase, border: `1px solid ${mockupColor.border}` }}>
                Cancel
              </styled.span>
              <styled.span
                style={{
                  ...buttonBase,
                  background: isPressed ? productColor.actionPressed : productColor.action,
                  color: mockupColor.panel,
                  transform: isPressed ? 'scale(0.97)' : 'none',
                  transition: transitionFor(isAnimated, ['transform', 'background-color'], 160),
                }}
              >
                Approve
              </styled.span>
            </styled.div>
          </styled.div>
        </MockupPanel>
      </styled.div>
    </BentoStage>
  );
}
