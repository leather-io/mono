import { ReactNode } from 'react';

import { FlexProps } from 'leather-styles/jsx';

import { ValueDisplayerBase } from './reward-value-displayer';

export interface ValueDisplayerProps extends FlexProps {
  name: ReactNode;
  value: ReactNode;
  textAlign?: 'left' | 'right' | 'center';
}
export function ValueDisplayer({ name, value, textAlign, ...flexProps }: ValueDisplayerProps) {
  return (
    <ValueDisplayerBase {...flexProps} style={textAlign ? { textAlign } : undefined}>
      <ValueDisplayerBase.Name name={name} />
      <ValueDisplayerBase.Value value={value} />
    </ValueDisplayerBase>
  );
}
