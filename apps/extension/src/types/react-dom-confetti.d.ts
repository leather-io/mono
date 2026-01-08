import type { ComponentType } from 'react';

interface ConfettiConfig {
  [key: string]: unknown;
}

interface ConfettiProps {
  active: boolean;
  config?: ConfettiConfig;
}

declare const Confetti: ComponentType<ConfettiProps>;
export default Confetti;
