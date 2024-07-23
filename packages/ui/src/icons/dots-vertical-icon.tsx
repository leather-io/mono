import { Icon, IconProps, IconSmall } from './icon/icon.web';

export function DotsVerticalIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <IconSmall {...props}>
        <g clipPath="url(#clip0_16117_6007)">
          <path
            d="M8.00016 3.33333C8.36835 3.33333 8.66683 3.03486 8.66683 2.66667C8.66683 2.29848 8.36835 2 8.00016 2C7.63197 2 7.3335 2.29848 7.3335 2.66667C7.3335 3.03486 7.63197 3.33333 8.00016 3.33333Z"
            fill="#12100F"
          />
          <path
            d="M8.00016 8.66667C8.36835 8.66667 8.66683 8.36819 8.66683 8C8.66683 7.63181 8.36835 7.33333 8.00016 7.33333C7.63197 7.33333 7.3335 7.63181 7.3335 8C7.3335 8.36819 7.63197 8.66667 8.00016 8.66667Z"
            fill="#12100F"
          />
          <path
            d="M8.00016 14C8.36835 14 8.66683 13.7015 8.66683 13.3333C8.66683 12.9651 8.36835 12.6667 8.00016 12.6667C7.63197 12.6667 7.3335 12.9651 7.3335 13.3333C7.3335 13.7015 7.63197 14 8.00016 14Z"
            fill="#12100F"
          />
          <path
            d="M8.00016 3.33333C8.36835 3.33333 8.66683 3.03486 8.66683 2.66667C8.66683 2.29848 8.36835 2 8.00016 2C7.63197 2 7.3335 2.29848 7.3335 2.66667C7.3335 3.03486 7.63197 3.33333 8.00016 3.33333Z"
            stroke="#12100F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.00016 8.66667C8.36835 8.66667 8.66683 8.36819 8.66683 8C8.66683 7.63181 8.36835 7.33333 8.00016 7.33333C7.63197 7.33333 7.3335 7.63181 7.3335 8C7.3335 8.36819 7.63197 8.66667 8.00016 8.66667Z"
            stroke="#12100F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.00016 14C8.36835 14 8.66683 13.7015 8.66683 13.3333C8.66683 12.9651 8.36835 12.6667 8.00016 12.6667C7.63197 12.6667 7.3335 12.9651 7.3335 13.3333C7.3335 13.7015 7.63197 14 8.00016 14Z"
            stroke="#12100F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_16117_6007">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </IconSmall>
    );

  return (
    <Icon {...props}>
      <g clipPath="url(#clip0_16117_6004)">
        <path
          d="M12 5C12.5523 5 13 4.55228 13 4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5Z"
          stroke="#12100F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
          stroke="#12100F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 21C12.5523 21 13 20.5523 13 20C13 19.4477 12.5523 19 12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21Z"
          stroke="#12100F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_16117_6004">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </Icon>
  );
}
