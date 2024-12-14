import { SVGProps, forwardRef } from 'react';

import AnimalEagle from '../../assets/icons/fee-animals/animal-eagle-32-32.svg';
import { Icon } from '../icon/icon.web';

export const AnimalEagleIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalEagle />
    </Icon>
  );
});

AnimalEagleIcon.displayName = 'AnimalEagleIcon';
