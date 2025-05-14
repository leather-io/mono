// For image imports
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';

// For SVGs
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '@shopify/flash-list' {
  export const FlashList: any; // Use a better type if possible
  export const AutoLayoutView: any; // Use a better type if possible
}

declare module '@shopify/flash-list/src/index' {
  export const FlashList: any; // Use a better type if possible
  export const AutoLayoutView: any; // Use a better type if possible
}
