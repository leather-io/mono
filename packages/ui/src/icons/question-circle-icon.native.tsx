import QuestionCircleSmall from '../assets/icons/question-circle-small.svg';
import QuestionCircle from '../assets/icons/question-circle.svg';
import { Icon, IconProps } from './icon/icon.native';

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
