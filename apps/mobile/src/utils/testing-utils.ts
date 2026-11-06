import { SharedSelectors } from '@/shared/selectors/shared.selectors';

export function defaultIconTestId(icon: string) {
  return `${SharedSelectors.DefaultAccountIcon}_${icon}`;
}
