import type { BaseOnramperProps } from './onramper/types.shared';

export * from './onramper/index.shared';

export type OnramperProps = BaseOnramperProps &
  React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
