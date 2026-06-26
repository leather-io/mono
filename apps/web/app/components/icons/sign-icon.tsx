import { HTMLStyledProps, styled } from 'leather-styles/jsx';

export function SignIcon(props: HTMLStyledProps<'svg'>) {
  return (
    <styled.svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle cx="6.66668" cy="9.42843" r="1.33333" fill="currentColor" />
      <path
        d="M8.28596 4.03781L2.95262 6.49536L2 14.095L9.55228 13.095L12.0572 7.80905M12.0572 7.80905L8.28596 4.03781M12.0572 7.80905L13 8.75186L14.6667 7.0852L9.00982 1.42834L7.34315 3.095L8.28596 4.03781M2 14.095L6.66666 9.42835"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </styled.svg>
  );
}
