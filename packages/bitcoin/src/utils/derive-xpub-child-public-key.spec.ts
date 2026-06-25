import { deriveXpubChildPublicKey } from './derive-xpub-child-public-key';

// Real btc:mainnet vault-account signers: each account xpub derives the identity
// key at 0/0 and the signing key at 0/1.
const signers = [
  {
    xpub: 'xpub6DFfyxrMEUfRArb44TcHbuHeGQ1qx3KWKsnykm6XMorKSWpCbnMESPHTZVPG3Tu4c7cdm1nPUxVB7214hkniqtYGYy2tXjP4unaobdPH3Wi',
    at00: '02e50bdeee4839821db5258002f5035f29d9ae908dc363052ddd1bb1399fd65a18',
    at01: '02f7dda37a7732eb2bb3d9f71a583f98ee1aae9c21783ee6e69994f0f1f6f376e7',
  },
  {
    xpub: 'xpub6DFfyxrMEUfR9Fyczq5xK1m8C3zKfi97mZDt3u4UnjjaWPW8q1PY4UogPFbdp4ibSDnmaHZrNCUYwmzj2GjBYVcaJMvniK2chBMqdbebH5f',
    at00: '021a1fdf4bd7dd52d5e672c123e35936def2b7e9f5ff454d3e3f658406a0b39c1e',
    at01: '031d1e0f56085a498534e1f02aed6ecbdb605e6d2541320801e7a92cac69b7c13d',
  },
  {
    xpub: 'xpub6DFfyxrMEUfRCQn3cPkudoGamQQZgExLUepcHduymGMBCBLEZgCoBXrjUWmzF74HXzPMYvsKdL25usDyKYV5PkHtYrM2oSg29j7wj4gu6vW',
    at00: '03595b245a5252c15782eccdea7113f3c85ff999f22fa98eff6c4feea7c75926ae',
    at01: '03cf080fa73f310555c4cf166395f9c224ea767abf41fc981600b06811dc7e52cb',
  },
];

describe(deriveXpubChildPublicKey.name, () => {
  test('derives the child public key at the given path', () => {
    for (const { xpub, at00, at01 } of signers) {
      expect(deriveXpubChildPublicKey({ xpub, changeIndex: 0, addressIndex: 0 })).toEqual(at00);
      expect(deriveXpubChildPublicKey({ xpub, changeIndex: 0, addressIndex: 1 })).toEqual(at01);
    }
  });

  test('throws on an unparseable xpub', () => {
    expect(() =>
      deriveXpubChildPublicKey({ xpub: 'not-an-xpub', changeIndex: 0, addressIndex: 0 })
    ).toThrow();
  });
});
