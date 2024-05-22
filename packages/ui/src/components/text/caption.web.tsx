// import { forwardRef } from 'react';

// import { HTMLStyledProps, styled } from '../../leather-styles/jsx';

// export const Caption = forwardRef<HTMLSpanElement, HTMLStyledProps<'span'>>(
//   ({ children, ...props }, ref) => (
//     <styled.span
//       _disabled={{ color: 'accent.non-interactive' }}
//       color="accent.text-subdued"
//       ref={ref}
//       textStyle="caption.01"
//       {...props}
//     >
//       {children}
//     </styled.span>
//   )
// );

export const Caption = () => <span>Hello hello</span>;

/**
 * In here run:
 *  - `pnpm build`
 *  - `pnpm panda codegen`
 *
 * Maybe just:
 *  - `pnpm ts:build:web`
 *
 */
