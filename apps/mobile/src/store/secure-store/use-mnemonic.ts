import { useEffect, useState } from 'react';

import { mnemonicStore } from './mnemonic-store';

export function useMnemonic({
  fingerprint,
  shouldLoadOnInit = true,
}: {
  fingerprint: string;
  shouldLoadOnInit?: boolean;
}) {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  async function getMnemonic() {
    const response = await mnemonicStore(fingerprint).getMnemonic();
    if (response.mnemonic) {
      setMnemonic(response.mnemonic);
    } else {
      throw new Error('No mnemonic found for this fingerprint');
    }

    if (response.passphrase) {
      setPassphrase(response.passphrase);
    }
  }
  useEffect(() => {
    if (shouldLoadOnInit) {
      void getMnemonic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { mnemonic, passphrase };
}
