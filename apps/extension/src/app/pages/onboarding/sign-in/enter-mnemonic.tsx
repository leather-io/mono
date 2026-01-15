import { useFlags } from '@app/features/feature-flags';

import { EnterMnemonic as EnterMnemonicCurrent } from './enter-mnemonic-current';
import { EnterMnemonic as EnterMnemonicLegacy } from './enter-mnemonic-legacy';

export interface EnterMnemonicProps {
  title: string;
  description: string;
}

export function EnterMnemonic(props: EnterMnemonicProps) {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <EnterMnemonicCurrent {...props} /> : <EnterMnemonicLegacy {...props} />;
}
