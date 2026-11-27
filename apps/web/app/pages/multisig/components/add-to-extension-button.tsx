import { Button, type ButtonProps, LeatherLettermarkIcon } from '@leather.io/ui';

export function AddToExtensionButton({
  size,
  ...props
}: Omit<ButtonProps, 'children' | 'iconStart' | 'iconEnd'>) {
  const compact = size === 'sm';
  return (
    <Button
      {...props}
      size={size}
      gap={compact ? 'space.02' : undefined}
      iconStart={
        <LeatherLettermarkIcon
          variant="small"
          {...(compact && { viewBox: '-4 -3.5 32 32' })}
          aria-hidden="true"
        />
      }
    >
      Add to extension
    </Button>
  );
}
