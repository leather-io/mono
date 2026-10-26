declare module '*.svg' {
  import type { ComponentType, SVGProps } from 'react';

  const component: ComponentType<SVGProps<SVGSVGElement>>;
  export default component;
}
