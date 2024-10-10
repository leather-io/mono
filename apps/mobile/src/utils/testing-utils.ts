import { TestId } from '@/shared/test-id';

export function defaultIconTestId(icon: string) {
  return `${TestId.defaultAccountIcon}_${icon}`;
}
