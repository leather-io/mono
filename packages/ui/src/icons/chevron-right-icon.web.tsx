import { Icon, IconProps, IconSmall } from './icon/icon.web';

export function ChevronRightIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <IconSmall {...props}>
        <path
          d="M6.13822 12.0001L9.66678 8.47148C9.92713 8.21113 9.92713 7.78902 9.66678 7.52867L6.13818 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </IconSmall>
    );

  return (
    <Icon {...props}>
      <path
        d="M9 4L16.2929 11.2929C16.6834 11.6834 16.6834 12.3166 16.2929 12.7071L9 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
