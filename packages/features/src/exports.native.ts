import type { WebViewProps } from 'react-native-webview';

import type { BaseOnramperProps } from './onramper/types.shared';

export * from './onramper/index.shared';

export type OnramperProps = BaseOnramperProps & WebViewProps;
