import StudySmall from '../assets/icons/study-small.svg';
import Study from '../assets/icons/study.svg';
import { Icon, IconProps } from './icon/icon.native';

export function StudyIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <StudySmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Study />
    </Icon>
  );
}
