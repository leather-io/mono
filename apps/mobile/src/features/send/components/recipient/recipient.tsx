import { FieldError } from 'react-hook-form';

import { useNewRecipientFlowFeatureFlag } from '@/features/feature-flags/use-feature-flags';
import { Recipient as RecipientV1 } from '@/features/send/components/recipient/v1/recipient.v1';
import { Recipient as RecipientV2 } from '@/features/send/components/recipient/v2/recipient.v2';
import { ZodSchema } from 'zod';

interface RecipientProps {
  value: string;
  onChange(value: string): void;
  onBlur(): void;
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error: FieldError | undefined;
  recipientSchema: ZodSchema;
}

export function Recipient(props: RecipientProps) {
  const RecipientComponent = useNewRecipientFlowFeatureFlag() ? RecipientV2 : RecipientV1;
  return <RecipientComponent {...props} />;
}
