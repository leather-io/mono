import { useFlags } from '../feature-flags';
import { Settings as CurrentSettings } from './settings-current';
import { Settings as LegacySettings } from './settings-legacy';

interface SettingsProps {
  canLockWallet?: boolean;
  toggleSwitchAccount?(): void;
}
export function Settings(props: SettingsProps) {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <CurrentSettings {...props} /> : <LegacySettings {...props} />;
}
