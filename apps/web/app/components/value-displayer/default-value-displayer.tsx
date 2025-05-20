import { ReactNode } from 'react';

import { FlexProps } from 'leather-styles/jsx';

import { ValueDisplayerBase } from './reward-value-displayer';

export interface ValueDisplayerProps extends FlexProps {
  name: ReactNode;
  value: ReactNode;
  // textAlign is already included in FlexProps
}

export function ValueDisplayer({ name, value, ...flexProps }: ValueDisplayerProps) {
  return (
    <ValueDisplayerBase {...flexProps}>
      <ValueDisplayerBase.Name name={name} />
      <ValueDisplayerBase.Value value={value} />
    </ValueDisplayerBase>
  );
}
