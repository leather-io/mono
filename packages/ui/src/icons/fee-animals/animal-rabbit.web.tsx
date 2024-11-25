import { forwardRef } from 'react';

import AnimalRabbit from '../../assets/icons/fee-animals/animal-rabbit-32-32.svg';
import { Icon, IconProps } from '../icon/icon.web';

export const AnimalRabbitIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalRabbit />
    </Icon>
  );
});
