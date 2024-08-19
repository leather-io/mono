import QuestionCircleSmall from '../assets/icons/question-circle-16-16.svg';
import QuestionCircle from '../assets/icons/question-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function QuestionCircleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <QuestionCircleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <QuestionCircle />
    </Icon>
  );
}
