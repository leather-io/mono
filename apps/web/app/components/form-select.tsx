import { Box, HTMLStyledProps, styled } from 'leather-styles/jsx';

// We already have a `select` in our component library, however the latest
// designs create input-like select elements. This component styles the native
// select element to emulate this without making further design system changes
// Also, there's an incompatibility with Radix Select and react-hook-form
// further spurring this component
// https://github.com/radix-ui/primitives/issues/2817
interface SelectProps extends HTMLStyledProps<'select'> {
  label: string;
}
export function Select({ label, ...props }: SelectProps) {
  return (
    <Box
      pos="relative"
      height="60px"
      px="space.04"
      _focusWithin={{
        _after: {
          position: 'absolute',
          content: '""',
          top: '-1px',
          left: '-1px',
          right: '-1px',
          bottom: '-1px',
          borderRadius: 'xs',
          border: '2px solid black',
        },
      }}
    >
      <styled.span
        display="inline-block"
        textStyle="label.03"
        pt="space.03"
        color="ink.text-subdued-secondary"
      >
        {label}
      </styled.span>
      <styled.select
        appearance="none"
        textStyle="label.02"
        pos="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        px="space.04"
        pt="space.05"
        width="100%"
        height="60px"
        border="default"
        borderRadius="xs"
        fontWeight="normal"
        _focus={{ outline: 'none' }}
        {...props}
      />
    </Box>
  );
}
