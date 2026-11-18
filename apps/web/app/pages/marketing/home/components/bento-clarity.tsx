import { type CSSProperties, type ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

import {
  BentoStage,
  MockupPanel,
  StrokeIcon,
  TextPair,
  insetX,
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
  switchBorder: '#D9D6D2',
  switchThumbOff: '#BEB9B5',
  avatar: '#EFEDEA',
} as const;

const headerHeight = 64;
const tokenRowHeight = 46;
const spamTokenId = 'tlc';

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
        ...primaryText,
      }}
    >
      {letter}
    </styled.span>
  );
}

/** The extension's ItemLayout: title and caption left, values right. */
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
      <TextPair primary={title} secondary={caption} />
      {right}
    </styled.div>
  );
}

/** The extension's Switch, scaled to the stage icon. */
function MockSwitch({ isOn, isAnimated }: { isOn: boolean; isAnimated: boolean }) {
  const width = 30;
  const height = 18;
  const thumb = 13;
  const gap = 2;
  const transition = transitionFor(isAnimated, ['background-color', 'border-color'], 350);
  return (
    <styled.span
      display="flex"
      alignItems="center"
      flexShrink={0}
      borderRadius="9999px"
      style={{
        width: stagePx(width),
        height: stagePx(height),
        border: `1px solid ${isOn ? mockupColor.text : productColor.switchBorder}`,
        background: isOn ? mockupColor.text : mockupColor.panel,
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
          transition: transitionFor(isAnimated, ['transform', 'background-color'], 350),
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
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', src: tokenIconSrc.btc },
  { id: 'stx', name: 'Stacks', symbol: 'STX', src: tokenIconSrc.stx },
  { id: 'sbtc', name: 'sBTC', symbol: 'sBTC', src: tokenIconSrc.sbtc },
  { id: spamTokenId, name: 'Totally Legit Coin', symbol: 'TLC', letter: 'T' },
  { id: 'usdcx', name: 'USDCx', symbol: 'USDCx', src: '/marketing/apps/usdc.svg' },
  { id: 'alex', name: 'ALEX', symbol: 'ALEX', src: '/icons/alex.svg' },
] as const;

/** The extension's Manage tokens page (pages/manage-tokens): a spam token gets switched off. */
export function ManageTokensMockup() {
  const { ref, step, isAnimated } = useLoopingSequence<HTMLDivElement>([1100, 180], 2600);
  const isPressed = step === 1;
  const isSpamHidden = step >= 2;

  return (
    <BentoStage
      ref={ref}
      label="The extension's Manage tokens list, with a spam token named Totally Legit Coin switched off"
    >
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
                  margin: `0 ${stagePx(-8)}`,
                  padding: `0 ${stagePx(8)}`,
                  borderRadius: stagePx(8),
                  background: isSpam && isPressed ? mockupColor.hover : 'transparent',
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
    </BentoStage>
  );
}

function RabbitIcon() {
  // The extension's Standard fee icon (AnimalRabbitIcon)
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
    <styled.span display="block" style={{ ...secondaryText, marginBottom: stagePx(6) }}>
      {children}
    </styled.span>
  );
}

function Divider() {
  return <styled.div style={{ height: '1px', background: mockupColor.divider }} />;
}

const buttonBase: CSSProperties = {
  flex: 1,
  height: stagePx(38),
  borderRadius: '9999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: stagePx(13),
  whiteSpace: 'nowrap',
  ...primaryText,
};

/** The extension's Sign transaction approver (features/rpc-stacks-transaction-request). */
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
    <BentoStage
      ref={ref}
      label="The extension's Sign transaction screen: send 50 STX and receive sBTC, with the fee, total spend and Approve button"
    >
      <MockupPanel style={{ display: 'flex', flexDirection: 'column' }}>
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
            img={<TokenIcon src={tokenIconSrc.stx} />}
            title="Stacks"
            caption="STX"
            right={<TextPair primary="50 STX" secondary="$29.10" align="end" />}
          />
        </styled.div>
        <styled.div style={{ ...insetX, paddingTop: stagePx(10), ...sectionStyle(1) }}>
          <Subheader>You’ll receive</Subheader>
          <ItemRow
            img={<TokenIcon src={tokenIconSrc.sbtc} />}
            title="sBTC"
            caption="sBTC"
            right={<TextPair primary="0.00031 sBTC" secondary="$29.04" align="end" />}
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
                <TextPair primary="0.003 STX" secondary="$0.01" align="end" />
                <styled.span style={{ color: mockupColor.secondary }}>
                  <StrokeIcon size={12}>
                    <path d="M6 3 L11 8 L6 13" />
                  </StrokeIcon>
                </styled.span>
              </styled.span>
            }
          />
        </styled.div>

        <styled.div marginTop="auto" style={{ borderTop: `1px solid ${mockupColor.border}` }}>
          <styled.div style={{ padding: `${stagePx(19)} ${stagePx(19)}` }}>
            <styled.div
              display="flex"
              justifyContent="space-between"
              style={{ ...primaryText, marginBottom: stagePx(10) }}
            >
              <span>Total spend</span>
              <span>$29.11</span>
            </styled.div>
            <styled.div display="flex" style={{ gap: stagePx(13) }}>
              <styled.span
                style={{
                  ...buttonBase,
                  border: `1px solid ${mockupColor.border}`,
                  color: mockupColor.text,
                }}
              >
                Cancel
              </styled.span>
              <styled.span
                style={{
                  ...buttonBase,
                  background: isPressed ? mockupColor.actionPressed : mockupColor.text,
                  color: mockupColor.panel,
                  transform: isPressed ? 'scale(0.95)' : 'none',
                  transition: transitionFor(isAnimated, ['transform', 'background-color'], 200),
                }}
              >
                Approve
              </styled.span>
            </styled.div>
          </styled.div>
        </styled.div>
      </MockupPanel>
    </BentoStage>
  );
}
