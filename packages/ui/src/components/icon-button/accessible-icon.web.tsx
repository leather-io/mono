import { AccessibleIcon as AccessibleIconPrimitive } from 'radix-ui';

type Props = AccessibleIconPrimitive.AccessibleIconProps;

export default function AccessibleIcon(props: Props) {
  return <AccessibleIconPrimitive.Root {...props} />;
}
