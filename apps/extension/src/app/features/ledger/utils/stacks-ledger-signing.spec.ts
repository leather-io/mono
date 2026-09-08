import {
  ClarityValue,
  PostConditionMode,
  bufferCV,
  contractPrincipalCV,
  intCV,
  makeUnsignedContractCall,
  makeUnsignedSTXTokenTransfer,
  noneCV,
  serializeCV,
  someCV,
  standardPrincipalCV,
  stringAsciiCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import StacksApp, { LedgerError, ResponseSign } from '@zondax/ledger-stacks';

import {
  signLedgerStacksStructuredMessage,
  signLedgerStacksTransaction,
  signLedgerStacksUtf8Message,
} from './stacks-ledger-utils';

const address = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';
const publicKey = '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893';
const derivationPath = "m/44'/5757'/0'/0/0";
const transferArguments = [
  uintCV(1),
  standardPrincipalCV(address),
  standardPrincipalCV(address),
  noneCV(),
];
const domain = serializeCV(
  tupleCV({ name: stringAsciiCV('test'), version: stringAsciiCV('1'), 'chain-id': uintCV(1) })
);
const signatureResponse: ResponseSign = {
  returnCode: LedgerError.NoErrors,
  errorMessage: 'No errors',
  postSignHash: Buffer.alloc(32),
  signatureCompact: Buffer.alloc(64),
  signatureVRS: Buffer.alloc(65),
  signatureDER: Buffer.alloc(70),
};

function createApp() {
  const app: StacksApp = Object.create(StacksApp.prototype);
  app.sign = vi.fn().mockResolvedValue(signatureResponse);
  app.sign_msg = vi.fn().mockResolvedValue(signatureResponse);
  app.sign_structured_msg = vi.fn().mockResolvedValue(signatureResponse);
  return app;
}

async function createContractCall(
  functionArgs: ClarityValue[] = transferArguments,
  functionName = 'transfer'
) {
  return makeUnsignedContractCall({
    contractAddress: address,
    contractName: 'token',
    functionName,
    functionArgs,
    publicKey,
    postConditionMode: PostConditionMode.Deny,
    fee: 100,
    nonce: 0,
  });
}

describe(signLedgerStacksTransaction.name, () => {
  test('signs a Deny STX transfer without changing the transaction', async () => {
    const app = createApp();
    const transaction = await makeUnsignedSTXTokenTransfer({
      recipient: address,
      amount: 1,
      publicKey,
      fee: 100,
      nonce: 0,
    });
    const payload = Buffer.from(transaction.serialize(), 'hex');

    expect(transaction.postConditionMode).toBe(PostConditionMode.Deny);
    expect(await signLedgerStacksTransaction(app)(payload, derivationPath)).toBe(signatureResponse);
    expect(app.sign).toHaveBeenCalledOnce();
    expect(app.sign).toHaveBeenCalledWith(derivationPath, payload);
  });

  test.each([PostConditionMode.Allow, PostConditionMode.Originator])(
    'rejects post-condition mode %i without changing it or contacting Ledger',
    async mode => {
      const app = createApp();
      const transaction = await createContractCall();
      transaction.postConditionMode = mode;
      const payload = Buffer.from(transaction.serialize(), 'hex');

      expect(await signLedgerStacksTransaction(app)(payload, derivationPath)).toEqual({
        error: 'Ledger transactions require Deny post-condition mode.',
      });
      expect(transaction.postConditionMode).toBe(mode);
      expect(app.sign).not.toHaveBeenCalled();
    }
  );

  test.each([noneCV(), someCV(bufferCV(Buffer.alloc(34)))])(
    'signs an exact four-argument SIP-10 transfer with memo %j',
    async memo => {
      const app = createApp();
      const transaction = await createContractCall([...transferArguments.slice(0, 3), memo]);
      const payload = Buffer.from(transaction.serialize(), 'hex');

      expect(await signLedgerStacksTransaction(app)(payload, derivationPath)).toBe(
        signatureResponse
      );
      expect(app.sign).toHaveBeenCalledOnce();
      expect(app.sign).toHaveBeenCalledWith(derivationPath, payload);
    }
  );

  test('accepts contract principals in SIP-10 transfers', async () => {
    const app = createApp();
    const transaction = await createContractCall([
      uintCV(1),
      contractPrincipalCV(address, 'sender'),
      contractPrincipalCV(address, 'recipient'),
      noneCV(),
    ]);

    expect(
      await signLedgerStacksTransaction(app)(
        Buffer.from(transaction.serialize(), 'hex'),
        derivationPath
      )
    ).toBe(signatureResponse);
  });

  test.each(['approve', 'Transfer', 'transfer-extra'])(
    'blocks the function %s before Ledger',
    async functionName => {
      const app = createApp();
      const transaction = await createContractCall(transferArguments, functionName);

      expect(
        await signLedgerStacksTransaction(app)(
          Buffer.from(transaction.serialize(), 'hex'),
          derivationPath
        )
      ).toEqual({ error: expect.stringContaining('only SIP-10 transfers') });
      expect(app.sign).not.toHaveBeenCalled();
    }
  );

  test.each([
    transferArguments.slice(0, 3),
    [...transferArguments, uintCV(2)],
    [intCV(1), ...transferArguments.slice(1)],
    [uintCV(1), uintCV(2), standardPrincipalCV(address), noneCV()],
    [uintCV(1), standardPrincipalCV(address), uintCV(2), noneCV()],
    [...transferArguments.slice(0, 3), bufferCV(Buffer.alloc(1))],
    [...transferArguments.slice(0, 3), someCV(uintCV(1))],
    [...transferArguments.slice(0, 3), someCV(bufferCV(Buffer.alloc(35)))],
  ])('rejects a transfer with invalid arguments (case %#)', async (...functionArgs) => {
    const app = createApp();
    const transaction = await createContractCall(functionArgs);

    expect(
      await signLedgerStacksTransaction(app)(
        Buffer.from(transaction.serialize(), 'hex'),
        derivationPath
      )
    ).toEqual({ error: expect.stringContaining('only SIP-10 transfers') });
    expect(app.sign).not.toHaveBeenCalled();
  });

  test.each([253, 254, 256])('blocks %i contract arguments before Ledger', async count => {
    const app = createApp();
    const transaction = await createContractCall(Array.from({ length: count }, () => uintCV(1)));

    expect(
      await signLedgerStacksTransaction(app)(
        Buffer.from(transaction.serialize(), 'hex'),
        derivationPath
      )
    ).toEqual({ error: 'Ledger contract calls must have fewer than 253 arguments.' });
    expect(app.sign).not.toHaveBeenCalled();
  });

  test('still applies the transfer restriction below the argument-count limit', async () => {
    const app = createApp();
    const transaction = await createContractCall(Array.from({ length: 252 }, () => uintCV(1)));

    expect(
      await signLedgerStacksTransaction(app)(
        Buffer.from(transaction.serialize(), 'hex'),
        derivationPath
      )
    ).toEqual({ error: expect.stringContaining('only SIP-10 transfers') });
    expect(app.sign).not.toHaveBeenCalled();
  });

  test('rejects malformed transactions', async () => {
    const app = createApp();

    expect(
      await signLedgerStacksTransaction(app)(Buffer.from('malformed'), derivationPath)
    ).toEqual({ error: expect.stringContaining('encoding') });
    expect(app.sign).not.toHaveBeenCalled();
  });

  test('rejects trailing bytes outside the parsed transaction', async () => {
    const app = createApp();
    const transaction = await createContractCall();
    const payload = Buffer.concat([Buffer.from(transaction.serialize(), 'hex'), Buffer.from([0])]);

    expect(await signLedgerStacksTransaction(app)(payload, derivationPath)).toEqual({
      error: expect.stringContaining('encoding'),
    });
    expect(app.sign).not.toHaveBeenCalled();
  });
});

describe(signLedgerStacksUtf8Message.name, () => {
  test.each(['a'.repeat(270), 'é'.repeat(135), '🙂'.repeat(67) + 'ab'])(
    'signs a 270-byte message using its UTF-8 byte length',
    async payload => {
      const app = createApp();

      expect(Buffer.byteLength(payload, 'utf8')).toBe(270);
      expect(await signLedgerStacksUtf8Message(app)(payload, derivationPath)).toBe(
        signatureResponse
      );
      expect(app.sign).toHaveBeenCalledOnce();
      expect(app.sign).toHaveBeenCalledWith(
        derivationPath,
        Buffer.concat([
          Buffer.from('\x17Stacks Signed Message:\n'),
          Buffer.from([0xfd, 0x0e, 0x01]),
          Buffer.from(payload, 'utf8'),
        ])
      );
      expect(app.sign_msg).not.toHaveBeenCalled();
    }
  );

  test.each(['a'.repeat(271), 'é'.repeat(136), '🙂'.repeat(68)])(
    'rejects messages exceeding 270 UTF-8 bytes',
    async payload => {
      const app = createApp();

      expect(await signLedgerStacksUtf8Message(app)(payload, derivationPath)).toEqual({
        error: 'Ledger messages must be 270 bytes or fewer.',
      });
      expect(app.sign).not.toHaveBeenCalled();
      expect(app.sign_msg).not.toHaveBeenCalled();
    }
  );

  test.each(
    Array.from({ length: 32 }, (_, code) => code).concat(
      Array.from({ length: 33 }, (_, code) => code + 0x7f)
    )
  )('rejects control character %i anywhere in a message', async code => {
    const app = createApp();

    expect(
      await signLedgerStacksUtf8Message(app)(
        `Visible${String.fromCharCode(code)}hidden`,
        derivationPath
      )
    ).toEqual({ error: expect.stringContaining('control characters') });
    expect(app.sign).not.toHaveBeenCalled();
    expect(app.sign_msg).not.toHaveBeenCalled();
  });
});

describe(signLedgerStacksStructuredMessage.name, () => {
  test('signs exactly 65,535 combined encoded bytes unchanged', async () => {
    const app = createApp();
    const payload = serializeCV(bufferCV(Buffer.alloc(65_535 - domain.length / 2 - 5)));

    expect((domain.length + payload.length) / 2).toBe(65_535);
    expect(await signLedgerStacksStructuredMessage(app)(domain, payload, derivationPath)).toBe(
      signatureResponse
    );
    expect(app.sign_structured_msg).toHaveBeenCalledOnce();
    expect(app.sign_structured_msg).toHaveBeenCalledWith(derivationPath, domain, payload);
  });

  test.each([65_536, 70_000])('rejects %i combined encoded bytes', async size => {
    const app = createApp();
    const payload = serializeCV(bufferCV(Buffer.alloc(size - domain.length / 2 - 5)));

    expect(await signLedgerStacksStructuredMessage(app)(domain, payload, derivationPath)).toEqual({
      error: expect.stringContaining('65,535 encoded bytes'),
    });
    expect(app.sign_structured_msg).not.toHaveBeenCalled();
  });

  test('includes the domain when enforcing the encoded byte limit', async () => {
    const app = createApp();
    const oversizedDomain = serializeCV(
      tupleCV({
        name: stringAsciiCV('a'.repeat(65_535)),
        version: stringAsciiCV('1'),
        'chain-id': uintCV(1),
      })
    );

    expect(
      await signLedgerStacksStructuredMessage(app)(
        oversizedDomain,
        serializeCV(uintCV(1)),
        derivationPath
      )
    ).toEqual({ error: expect.stringContaining('65,535 encoded bytes') });
    expect(app.sign_structured_msg).not.toHaveBeenCalled();
  });

  test.each(['0', 'zz', '00zz', ''])(
    'rejects malformed hex %j in either encoded component',
    async invalidHex => {
      const app = createApp();
      const sign = signLedgerStacksStructuredMessage(app);

      expect(await sign(domain, invalidHex, derivationPath)).toEqual({
        error: expect.stringContaining('encoding'),
      });
      expect(await sign(invalidHex, serializeCV(uintCV(1)), derivationPath)).toEqual({
        error: expect.stringContaining('encoding'),
      });
      expect(app.sign_structured_msg).not.toHaveBeenCalled();
    }
  );
});
