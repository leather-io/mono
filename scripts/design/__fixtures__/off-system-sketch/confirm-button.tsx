// Fixture: a pass-through wrapper that adds nothing Button does not already do.
import { Button, type ButtonProps } from '@leather.io/ui';

export function ConfirmButton(props: ButtonProps) {
  return <Button variant="solid" fullWidth {...props} />;
}
