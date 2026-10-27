// Device frames for exploration canvases and recipes. The canvas draws the
// frame; a screen renders only the frame's content.
//
// Both frames are scroll containers with `display: flex; flex-direction:
// column`, so a screen can use `flex: 1` to fill the height and
// `position: sticky; bottom: 0` for a footer pinned to the bottom edge, the way
// the extension pins its Continue button.
//
// Theme: `className="dark"` on the frame flips every Leather semantic token
// (ink.*, red.*, …) inside it, because Panda's dark condition is `.dark &`.
// That gives a per-frame theme while the canvas itself stays light.
// Caveat: anything portalled to <body> (a real @leather.io/ui Sheet, Popover,
// DropdownMenu, tooltip) escapes the frame: it renders over the whole canvas and
// in the light theme. Mock sheets and menus inline inside the frame instead.
//
// `transform` makes the frame the containing block for `position: fixed`
// descendants, so a fixed footer or overlay stays inside the frame.
//
// `data-frame`, `data-theme`, `data-variant` and `data-screen` label the frame
// for scripts/design/words-per-screen.ts.
import type { ReactNode } from 'react';

import { Flex } from 'leather-styles/jsx';
import { type Token, token } from 'leather-styles/tokens';

// What a screen lays out for: the popup's single column, or the tab's centred
// column. Screens get this as `frame` (ScreenProps).
export const frameIds = ['popup', 'tab'] as const;
export type FrameId = (typeof frameIds)[number];

export const themeIds = ['light', 'dark'] as const;
export type ThemeId = (typeof themeIds)[number];

// The sizes the canvas can draw, picked with `?frame=`. The popup sizes come
// from the same tokens the extension uses (packages/tokens, read in
// apps/extension/theme/global/global.ts and src/background/popup.ts):
// - popup: the toolbar action popup, `popupWidth` × `dialogHeight` (390×600).
// - request-window: the app-request / approval window, `popupWidth` ×
//   `popupHeight` (390×756). It lays out like the popup.
// - tab: the extension in a full browser tab, 1280×800 (no token).
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

// The toolbar popup (390×600) or the request window (390×756); content
// scrolls inside.
function PopupFrame(props: FrameProps & { frame: 'popup' | 'request-window' }) {
  return <FrameShell {...props} />;
}

// The extension in a full tab: 1280×800 with the content in a centred column.
// The real full-page home is `fullPageMaxWidth` (882px) wide: its Header and
// Content layouts use that token, and the home screenshots measure ~834px of
// content inside it: the screen's own 24px side padding (HomeShell, Card
// recipes) makes up the difference, so the column adds none. Pages that are a
// Card in the extension (send, receive) cap themselves at `pageWidth` (500px)
// inside this column (recipes/tab-page.tsx).
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

// `frame` is a size (FrameSizeId); a layout id ('popup', 'tab') works too.
export function DeviceFrame({ frame, ...props }: FrameProps & { frame: FrameSizeId }) {
  return frame === 'tab' ? <TabFrame {...props} /> : <PopupFrame frame={frame} {...props} />;
}
