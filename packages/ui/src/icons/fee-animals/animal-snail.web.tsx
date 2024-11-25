import { forwardRef } from 'react';

import AnimalSnail from '../../assets/icons/fee-animals/animal-snail-32-32.svg';
import { Icon, IconProps } from '../icon/icon.web';

export const AnimalSnailIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalSnail />
    </Icon>
  );
});
