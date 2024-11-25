import { forwardRef } from 'react';

import AnimalEagle from '../../assets/icons/fee-animals/animal-eagle-32-32.svg';
import { Icon, IconProps } from '../icon/icon.web';

export const AnimalEagleIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalEagle />
    </Icon>
  );
});
