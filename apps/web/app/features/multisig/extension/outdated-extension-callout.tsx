import { useAtomValue } from 'jotai';

import { Callout } from '@leather.io/ui';

import { minSupportedExtensionVersion } from './extension-version';
import { outdatedExtensionVersionAtom } from './outdated-extension.atom';

export function OutdatedExtensionCallout() {
  const installedVersion = useAtomValue(outdatedExtensionVersionAtom);
  if (!installedVersion) return null;
  return (
    <Callout variant="warning" title="Update your Leather extension" mt="space.05">
      Leather Multisig needs extension version {minSupportedExtensionVersion} or newer, but version{' '}
      {installedVersion} is installed. Update the extension in your browser, then reload this page.
    </Callout>
  );
}
