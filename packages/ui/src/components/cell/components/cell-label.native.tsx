import { Text, TextProps } from '../../text/text.native';

export interface CellLabelProps extends Omit<TextProps, 'variant'> {
  variant: 'primary' | 'secondary';
}

const labelVariants: Record<CellLabelProps['variant'], TextProps> = {
  primary: {
    variant: 'label02',
  },
  secondary: {
    variant: 'caption01',
    color: 'ink.text-subdued',
  },
};

export function CellLabelNative({ variant, ...textProps }: CellLabelProps) {
  return <Text {...labelVariants[variant]} {...textProps} />;
}
