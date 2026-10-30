// For image imports
declare module '*.png' {
  const content: number;
  export default content;
}
declare module '*.jpg' {
  const content: number;
  export default content;
}
declare module '*.jpeg' {
  const content: number;
  export default content;
}
declare module '*.webp' {
  const content: number;
  export default content;
}

// For SVGs
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_BITFLOW_API_HOST?: string;
    EXPO_PUBLIC_BITFLOW_API_KEY?: string;
    EXPO_PUBLIC_BITFLOW_KEEPER_API_HOST?: string;
    EXPO_PUBLIC_BITFLOW_KEEPER_API_KEY?: string;
    EXPO_PUBLIC_BITFLOW_PROVIDER_ADDRESS?: string;
    EXPO_PUBLIC_LAUNCH_DARKLY?: string;
    EXPO_PUBLIC_LEATHER_API_URL?: string;
    EXPO_PUBLIC_MIXPANEL_TOKEN?: string;
    EXPO_PUBLIC_NODE_ENV?: string;
    EXPO_PUBLIC_ONRAMPER_API_KEY?: string;
    EXPO_PUBLIC_ONRAMPER_SIGNING_SECRET?: string;
    EXPO_PUBLIC_ONRAMPER_WIDGET_HOST?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
  }
}
