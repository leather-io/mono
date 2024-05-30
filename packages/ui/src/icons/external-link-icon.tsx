import { Icon, IconProps, IconSmall } from './icon/icon.web';

export function ExternalLinkIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <IconSmall {...props}>
        <path
          d="M12.1667 9.33333V12.4333C12.1667 12.8067 12.1667 12.9934 12.094 13.136C12.0301 13.2614 11.9281 13.3634 11.8027 13.4273C11.6601 13.5 11.4734 13.5 11.1 13.5H3.56667C3.1933 13.5 3.00661 13.5 2.86401 13.4273C2.73856 13.3634 2.63658 13.2614 2.57266 13.136C2.5 12.9934 2.5 12.8067 2.5 12.4333V4.9C2.5 4.52663 2.5 4.33995 2.57266 4.19734C2.63658 4.0719 2.73856 3.96991 2.86401 3.906C3.00661 3.83333 3.1933 3.83333 3.56667 3.83333H6.16667M9.16667 2.5H13.5M13.5 2.5V6.83333M13.5 2.5L7.33333 8.66667"
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
        d="M9 6H5.6C5.03995 6 4.75992 6 4.54601 6.10899C4.35785 6.20487 4.20487 6.35785 4.10899 6.54601C4 6.75992 4 7.03995 4 7.6V18.4C4 18.9601 4 19.2401 4.10899 19.454C4.20487 19.6422 4.35785 19.7951 4.54601 19.891C4.75992 20 5.03995 20 5.6 20H16.4C16.9601 20 17.2401 20 17.454 19.891C17.6422 19.7951 17.7951 19.6422 17.891 19.454C18 19.2401 18 18.9601 18 18.4V15M14 4H20M20 4V10M20 4L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
