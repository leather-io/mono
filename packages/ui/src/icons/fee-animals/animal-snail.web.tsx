import { SVGProps, forwardRef } from 'react';

import AnimalSnail from '../../assets/icons/fee-animals/animal-snail-32-32.svg';
import { Icon } from '../icon/icon.web';

export const AnimalSnailIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalSnail />
    </Icon>
  );
});

AnimalSnailIcon.displayName = 'AnimalSnailIcon';
