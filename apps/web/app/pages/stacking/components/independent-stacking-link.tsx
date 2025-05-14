import { forwardRef } from 'react';

import { Link } from '@leather.io/ui';

export const IndependentStackingLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'>
>((props, ref) => (
  <Link
    ref={ref}
    display="inline-block"
    textStyle="caption.01"
    color="ink.text-subdued"
    mt="space.02"
    href="https://earn.leather.io/sign-in?chain=mainnet#:~:text=Stack%20liquid-,Stack%20independently,-When%20you%20stack"
    {...props}
  >
    Looking to stack independently?
  </Link>
));

IndependentStackingLink.displayName = 'IndependentStackingLink';
