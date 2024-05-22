// import { forwardRef } from 'react';

// import { HTMLStyledProps, styled } from '../../leather-styles/jsx';

// export const Title = forwardRef<HTMLSpanElement, HTMLStyledProps<'span'>>(
//   ({ children, ...props }, ref) => (
//     <styled.span
//       _disabled={{ color: 'accent.non-interactive' }}
//       color="accent.text-primary"
//       display="block"
//       ref={ref}
//       textStyle="label.01"
//       {...props}
//     >
//       {children}
//     </styled.span>
//   )
// );

export const Title = () => <span color="accent.text-primary">Title</span>;
