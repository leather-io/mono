import CreditCardSmall from '../assets/icons/credit-card-16-16.svg';
import CreditCard from '../assets/icons/credit-card-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function CreditCardIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CreditCardSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <CreditCard />
    </Icon>
  );
}
