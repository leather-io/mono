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
