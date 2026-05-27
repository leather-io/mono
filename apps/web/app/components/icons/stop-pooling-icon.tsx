import { HTMLStyledProps, styled } from 'leather-styles/jsx';

export function StopPoolingIcon(props: HTMLStyledProps<'svg'>) {
  return (
    <styled.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M18.364 5.63604C16.7353 4.00736 14.4853 3 12 3C7.02944 3 3 7.02944 3 12C3 14.4853 4.00736 16.7353 5.63604 18.364M18.364 5.63604C19.9926 7.26472 21 9.51472 21 12C21 16.9706 16.9706 21 12 21C9.51472 21 7.26472 19.9926 5.63604 18.364M18.364 5.63604L5.63604 18.364"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </styled.svg>
  );
}
