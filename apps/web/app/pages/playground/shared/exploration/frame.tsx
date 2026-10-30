// Theme: `className="dark"` on the frame flips every Leather semantic token
// (ink.*, red.*, …) inside it, because Panda's dark condition is `.dark &`.
// That gives a per-frame theme while the canvas itself stays light.
// Caveat: anything portalled to <body> (a real @leather.io/ui Sheet, Popover,
// DropdownMenu, tooltip) escapes the frame: it renders over the whole canvas and
// in the light theme. Mock sheets and menus inline inside the frame instead.
// `transform` makes the frame the containing block for `position: fixed`
// descendants, so a fixed footer or overlay stays inside the frame.
import type { ReactNode } from 'react';

import { Flex } from 'leather-styles/jsx';
import { type Token, token } from 'leather-styles/tokens';

export const frameIds = ['popup', 'tab'] as const;
export type FrameId = (typeof frameIds)[number];

export const themeIds = ['light', 'dark'] as const;
export type ThemeId = (typeof themeIds)[number];

export const frameSizeIds = ['popup', 'request-window', 'tab'] as const;
export type FrameSizeId = (typeof frameSizeIds)[number];

interface FrameSize {
  width: number;
  height: number;
  label: string;
  layout: FrameId;
}

function px(name: Token) {
  return parseInt(token(name), 10);
}

function frameSize(name: string, width: number, height: number, layout: FrameId): FrameSize {
  return { width, height, layout, label: `${name} ${width}×${height}` };
}

export const frameSizes: Record<FrameSizeId, FrameSize> = {
  popup: frameSize('Popup', px('sizes.popupWidth'), px('sizes.dialogHeight'), 'popup'),
  'request-window': frameSize(
    'Request window',
    px('sizes.popupWidth'),
    px('sizes.popupHeight'),
    'popup'
  ),
  tab: frameSize('Tab', 1280, 800, 'tab'),
};

export function frameLayout(frame: FrameSizeId): FrameId {
  return frameSizes[frame].layout;
}

interface FrameProps {
  theme: ThemeId;
  children: ReactNode;
  variant?: string;
  screen?: string;
}

function FrameShell({
  frame,
  theme,
  variant,
  screen,
  children,
}: FrameProps & { frame: FrameSizeId }) {
  const size = frameSizes[frame];
  return (
    <Flex
      className={theme === 'dark' ? 'dark' : undefined}
      data-frame={frame}
      data-theme={theme}
      data-variant={variant}
      data-screen={screen}
      direction="column"
      flexShrink={0}
      position="relative"
      transform="translateZ(0)"
      style={{ width: size.width, height: size.height }}
      overflowX="hidden"
      overflowY="auto"
      bg="ink.background-primary"
      color="ink.text-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      {children}
    </Flex>
  );
}

function PopupFrame(props: FrameProps & { frame: 'popup' | 'request-window' }) {
  return <FrameShell {...props} />;
}

function TabFrame({ children, ...props }: FrameProps) {
  return (
    <FrameShell frame="tab" {...props}>
      <Flex
        direction="column"
        flex="1"
        width="100%"
        maxWidth="fullPageMaxWidth"
        mx="auto"
        py="space.05"
      >
        {children}
      </Flex>
    </FrameShell>
  );
}

export function DeviceFrame({ frame, ...props }: FrameProps & { frame: FrameSizeId }) {
  return frame === 'tab' ? <TabFrame {...props} /> : <PopupFrame frame={frame} {...props} />;
}
