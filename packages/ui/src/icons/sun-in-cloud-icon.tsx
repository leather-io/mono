import { Icon, IconProps, IconSmall } from './icon/icon.web';

export function SunInCloudIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <IconSmall {...props}>
        <g clipPath="url(#clip0_13346_191321)">
          <path
            d="M7.36732 6.23996C7.57162 4.97012 8.67254 4.00016 10 4.00016C11.4728 4.00016 12.6667 5.19407 12.6667 6.66683C12.6667 7.25173 12.4784 7.79265 12.1591 8.23226M7.36732 6.23996C8.15245 6.52552 8.82287 7.04998 9.29067 7.72544C9.50646 8.03702 9.9163 8.17612 10.2844 8.08603C10.5137 8.02992 10.7534 8.00016 11 8.00016C11.4109 8.00016 11.8025 8.08276 12.1591 8.23226M7.36732 6.23996C6.94071 6.08479 6.48024 6.00016 6 6.00016C3.79086 6.00016 2 7.79102 2 10.0002C2 12.2093 3.79086 14.0002 6 14.0002H11C12.6569 14.0002 14 12.657 14 11.0002C14 9.75419 13.2404 8.68562 12.1591 8.23226M10 1.66683V1.3335M6.69924 3.03364L6.46354 2.79793M13.2982 3.03364L13.5339 2.79793M15.3333 6.3335H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_13346_191321">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </IconSmall>
    );

  return (
    <Icon {...props}>
      <path
        d="M11.051 9.35969C11.3574 7.45493 13.0088 6 15 6C17.2091 6 19 7.79086 19 10C19 10.8773 18.7175 11.6887 18.2386 12.3482M11.051 9.35969C12.2287 9.78803 13.2343 10.5747 13.936 11.5879C14.2597 12.0553 14.8744 12.2639 15.4267 12.1288C15.7706 12.0446 16.1301 12 16.5 12C17.1163 12 17.7037 12.1239 18.2386 12.3482M11.051 9.35969C10.4111 9.12695 9.72036 9 9 9C5.68629 9 3 11.6863 3 15C3 18.3137 5.68629 21 9 21H16.5C18.9853 21 21 18.9853 21 16.5C21 14.631 19.8606 13.0282 18.2386 12.3482M15 2.5V2M10.0489 4.55021L9.69531 4.19666M19.9472 4.55021L20.3008 4.19666M23 9.5H22.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
