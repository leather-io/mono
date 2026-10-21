import { type ClarityValue, makeUnsignedSTXTokenTransfer, uintCV } from '@stacks/transactions';

import type { HardwareStacksSigner } from './hardware-wallet';
import { createStacksSignerFnsFromHardwareWallet } from './stacks-signer-bridge';

const key = {
  derivationPath: "m/44'/5757'/0'/0/0",
  publicKey: '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893',
};

function makeSigner() {
  const signer: HardwareStacksSigner = {
    requestAccountKeys: vi.fn(),
    signTransaction: vi.fn(),
    signMessage: vi.fn(),
    signStructuredMessage: vi.fn(),
    showAddress: vi.fn(),
  };
  return signer;
}

describe(createStacksSignerFnsFromHardwareWallet.name, () => {
  test('binds the key and context to each signing call', async () => {
    const signer = makeSigner();
    const ctx = { onInteraction: vi.fn() };
    const transaction = await makeUnsignedSTXTokenTransfer({
      recipient: 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB',
      amount: 1,
      fee: 1,
      nonce: 0,
      network: 'mainnet',
      publicKey: key.publicKey,
    });
    const domain: ClarityValue = uintCV(1);
    const message: ClarityValue = uintCV(2);

    const fns = createStacksSignerFnsFromHardwareWallet(signer, key, ctx);
    await fns.sign(transaction);
    await fns.signMessage('hello');
    await fns.signStructuredMessage(message, domain);

    expect(signer.signTransaction).toHaveBeenCalledWith({ transaction, key }, ctx);
    expect(signer.signMessage).toHaveBeenCalledWith({ message: 'hello', key }, ctx);
    expect(signer.signStructuredMessage).toHaveBeenCalledWith({ message, domain, key }, ctx);
  });
});
