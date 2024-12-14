import { SVGProps, forwardRef } from 'react';

import AnimalRabbit from '../../assets/icons/fee-animals/animal-rabbit-32-32.svg';
import { Icon } from '../icon/icon.web';

export const AnimalRabbitIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalRabbit />
    </Icon>
  );
});

AnimalRabbitIcon.displayName = 'AnimalRabbitIcon';
