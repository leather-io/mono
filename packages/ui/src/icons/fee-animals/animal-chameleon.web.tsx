import { SVGProps, forwardRef } from 'react';

import AnimalChameleon from '../../assets/icons/fee-animals/animal-chameleon-32-32.svg';
import { Icon } from '../icon/icon.web';

export const AnimalChameleonIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <AnimalChameleon />
      </Icon>
    );
  }
);
