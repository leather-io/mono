import { ReactNode } from 'react';

import { ValueDisplayerBase } from './reward-value-displayer';

export interface ValueDisplayerProps {
  name: ReactNode;
  value: ReactNode;
}
export function ValueDisplayer({ name, value }: ValueDisplayerProps) {
  return (
    <ValueDisplayerBase>
      <ValueDisplayerBase.Name name={name} />
      <ValueDisplayerBase.Value value={value} />
    </ValueDisplayerBase>
  );
}
