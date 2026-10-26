declare module '*.svg' {
  import type { ComponentPropsWithRef, ComponentType } from 'react';
  import type { Svg } from 'react-native-svg';

  const component: ComponentType<ComponentPropsWithRef<typeof Svg>>;
  export default component;
}
