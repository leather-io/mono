import { HTMLStyledProps, styled } from 'leather-styles/jsx';

export function StackingIcon(props: HTMLStyledProps<'svg'>) {
  return (
    <styled.svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      {...props}
    >
      <path
        d="M6.86338 3.1583V7.00132M6.86338 3.1583H5.32617M6.86338 3.1583H10.5783C11.6395 3.1583 12.4998 4.01859 12.4998 5.07981C12.4998 6.14103 11.6395 7.00132 10.5783 7.00132M6.86338 7.00132V10.8443M6.86338 7.00132H10.5783M6.86338 10.8443H5.32617M6.86338 10.8443H10.5783C11.6395 10.8443 12.4998 9.98404 12.4998 8.92282C12.4998 7.8616 11.6395 7.00132 10.5783 7.00132M9.16919 1.62109V3.1583M9.16919 10.8443V12.3815"
        stroke="#12100F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.71296 4.75H2.14679C1.51344 4.75 1 5.26344 1 5.89679V5.89679C1 6.53015 1.51344 7.04359 2.14679 7.04359H3.60972C4.21902 7.04359 4.71296 7.53753 4.71296 8.14683V8.14683C4.71296 8.75613 4.21902 9.25007 3.60972 9.25007H1"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </styled.svg>
  );
}
