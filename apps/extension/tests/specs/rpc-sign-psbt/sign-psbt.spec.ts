import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes } from '@noble/hashes/utils';
import { BrowserContext, Page, type Route } from '@playwright/test';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import * as btc from '@scure/btc-signer';
import { bytesToHex } from '@stacks/common';
import { exampleMultisigTransactionId, makeMultisigTransaction } from '@tests/mocks/mock-multisig';
import { makeBitcoinPolicy, policyStateOverrides } from '@tests/mocks/mock-policies';
import {
  TEST_ACCOUNT_SECRET_KEY,
  getConnectedTestAppPermissionsState,
} from '@tests/page-object-models/onboarding.page';

import {
  type BtcSignerNetwork,
  compileWshDescriptor,
  ecdsaPublicKeyToSchnorr,
  getBondVaultKeys,
  instantiateBondDescriptor,
  makeNativeSegwitAccountXpub,
  makeNativeSegwitAddressIndexDerivationPath,
  makeTaprootAddressIndexDerivationPath,
  psbtHexToBase64,
} from '@leather.io/bitcoin';
import { RpcErrorCode, type RpcParams, type signPsbt } from '@leather.io/rpc';

import { test } from '../../fixtures/fixtures';

function createKeychainFromTestMnmeonic() {
  const seed = mnemonicToSeedSync(TEST_ACCOUNT_SECRET_KEY);
  const keychain = HDKey.fromMasterSeed(seed);
  return keychain.derive(
    makeNativeSegwitAddressIndexDerivationPath({
      network: 'testnet',
      accountIndex: 0,
      changeIndex: 0,
      addressIndex: 0,
    })
  );
}

function createTaprootKeychainFromTestMnemonic() {
  const seed = mnemonicToSeedSync(TEST_ACCOUNT_SECRET_KEY);
  const keychain = HDKey.fromMasterSeed(seed);
  return keychain.derive(
    makeTaprootAddressIndexDerivationPath({
      network: 'testnet',
      accountIndex: 0,
      changeIndex: 0,
      addressIndex: 0,
    })
  );
}

function initiatePsbtSigning(page: Page) {
  return async (params: RpcParams<typeof signPsbt> & { broadcast?: boolean }) =>
    page.evaluate(
      params =>
        (window as any).LeatherProvider.request('signPsbt', {
          ...params,
        }).catch((e: unknown) => e),
      { ...params }
    );
}

test.describe('Sign PSBT', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000');
  });

  const addressKeychain = createKeychainFromTestMnmeonic();
  if (!addressKeychain.publicKey) throw new Error('No publicKey');

  const bitcoinTestnet: BtcSignerNetwork = {
    bech32: 'tb',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  };

  function createTestPsbt() {
    const psbt = new btc.Transaction();
    psbt.addInput({
      txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
      index: 1,
      witnessUtxo: {
        amount: 4805n,
        script: btc.p2wpkh(addressKeychain.publicKey!, bitcoinTestnet).script,
      },
    });

    psbt.addInput({
      txid: '2f8d36ef381ae03a7613ff9f91088a2072363a0ef4c83a51c1fed0a3230869fe',
      index: 1,
      witnessUtxo: {
        amount: 15855487n,
        script: btc.p2wpkh(addressKeychain.publicKey!, bitcoinTestnet).script,
      },
    });

    psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);
    return psbt;
  }

  function clickActionButton(context: BrowserContext) {
    return async (buttonToPress: 'Cancel' | 'Confirm') => {
      const popup = await context.waitForEvent('page');
      await popup.waitForTimeout(1000);
      const btn = popup.locator(`text="${buttonToPress}"`);
      await btn.click();
    };
  }

  async function clickErrorCloseWindowButton(context: BrowserContext) {
    const popup = await context.waitForEvent('page');
    await popup.waitForTimeout(1000);
    const errorMsg = popup.locator('text="Failed to sign"');
    const btn = popup.locator('text="Close window"');
    test.expect(errorMsg).toBeTruthy();
    await btn.click();
  }

  async function interceptBroadcastRequest(
    context: BrowserContext,
    callback: (route: Route) => Promise<void>
  ) {
    const popup = await context.waitForEvent('page');
    const requestPromise = popup.waitForRequest('**/api/tx');
    await popup.route('**/api/tx', async route => await callback(route));
    return requestPromise;
  }

  function createExpectedResult(hex: string, txid?: string) {
    return {
      jsonrpc: '2.0',
      result: txid ? { hex, txid } : { hex },
    };
  }

  function createExpectedError(code: number, message: string, data?: unknown) {
    return {
      jsonrpc: '2.0',
      error: data ? { code, message, data } : { code, message },
    };
  }

  // Hard coded result of tx above
  const unsignedPsbtHexWithTwoInputs =
    '70736274ff01007b02000000025f9f604745537f28f9ea6a963c35355dd60696a52d909c528b0212a062dc65290100000000fffffffffe690823a3d0fec1513ac8f40e3a3672208a08919fff13763ae01a38ef368d2f0100000000ffffffff01e803000000000000160014a8113965cee4d5ffa2d9996a204866a58200131d000000000001011fc512000000000000160014a8113965cee4d5ffa2d9996a204866a58200131d0001011f7feff10000000000160014a8113965cee4d5ffa2d9996a204866a58200131d0000';

  test.expect(bytesToHex(createTestPsbt().toPSBT())).toEqual(unsignedPsbtHexWithTwoInputs);

  test('that all inputs are signed even if the number of inputs is greater than vout index', async ({
    page,
    context,
  }) => {
    const psbt = createTestPsbt();
    const reqPromise = interceptBroadcastRequest(context, route =>
      route.fulfill({
        body: 'not-a-real-txid-response',
      })
    );
    const [result] = await Promise.all([
      initiatePsbtSigning(page)({
        network: 'testnet',
        hex: bytesToHex(psbt.toPSBT()),
        broadcast: true,
      }),
      clickActionButton(context)('Confirm'),
    ]);

    await reqPromise;

    delete result.id;

    psbt.sign(addressKeychain.privateKey!);

    test
      .expect(result)
      .toEqual(createExpectedResult(bytesToHex(psbt.toPSBT()), 'not-a-real-txid-response'));
  });

  test('that only requested inputs are signed', async ({ page, context }) => {
    const psbt = createTestPsbt();
    const [result] = await Promise.all([
      initiatePsbtSigning(page)({
        network: 'testnet',
        hex: bytesToHex(psbt.toPSBT()),
        signAtIndex: 0,
        broadcast: false,
      }),
      clickActionButton(context)('Confirm'),
    ]);

    delete result.id;

    psbt.signIdx(addressKeychain.privateKey!, 0);

    test.expect(result).toEqual(createExpectedResult(bytesToHex(psbt.toPSBT())));
  });

  test('that the request can be signed and broadcast', async ({ page, context }) => {
    const psbt = createTestPsbt();
    const requestPromise = interceptBroadcastRequest(context, route =>
      route.fulfill({
        body: 'not-a-real-txid-response',
      })
    );

    const [result] = await Promise.all([
      initiatePsbtSigning(page)({
        network: 'testnet',
        hex: bytesToHex(psbt.toPSBT()),
        broadcast: true,
      }),
      clickActionButton(context)('Confirm'),
    ]);

    await requestPromise;

    delete result.id;

    psbt.signIdx(addressKeychain.privateKey!, 0);

    test
      .expect(result)
      .toEqual(
        createExpectedResult(
          '70736274ff01007b02000000025f9f604745537f28f9ea6a963c35355dd60696a52d909c528b0212a062dc65290100000000fffffffffe690823a3d0fec1513ac8f40e3a3672208a08919fff13763ae01a38ef368d2f0100000000ffffffff01e803000000000000160014a8113965cee4d5ffa2d9996a204866a58200131d000000000001011fc512000000000000160014a8113965cee4d5ffa2d9996a204866a58200131d220203fe21e3444109e30ff7d19da0f530c344cad2e35fbee89afb2413858e4a9d7aa5483045022100d3019073de66ea52a3c93edc9a1b8bb1c9f64902ade9983c588abb45ee5db04d02201011e4b245b115c6f5a80c3ae540f4a9e8c0fa52ca0a459d461917907385cfa7010001011f7feff10000000000160014a8113965cee4d5ffa2d9996a204866a58200131d220203fe21e3444109e30ff7d19da0f530c344cad2e35fbee89afb2413858e4a9d7aa54730440220092a70ffba140cf72576969b22e7da9b510ece28365f558724aab1b80daf952c0220524f8dff67bc5661f5c95043e02ffd926bc9ee53042195fcbd7cd6aad37848dc010000',
          'not-a-real-txid-response'
        )
      );

    psbt.sign(addressKeychain.privateKey!);

    test
      .expect(result)
      .toEqual(createExpectedResult(bytesToHex(psbt.toPSBT()), 'not-a-real-txid-response'));

    const request = await requestPromise;
    const requestBody = request.postDataBuffer();
    test.expect(requestBody).toBeDefined();
  });

  test('that the request to sign can be canceled', async ({ page, context }) => {
    const psbt = createTestPsbt();
    const [result] = await Promise.all([
      initiatePsbtSigning(page)({
        network: 'testnet',
        hex: bytesToHex(psbt.toPSBT()),
        broadcast: false,
      }),
      clickActionButton(context)('Cancel'),
    ]);

    delete result.id;

    test.expect(result).toEqual(createExpectedError(4001, 'User rejected signing PSBT request'));
  });

  test('that a failed request occurs if an invalid index is provided', async ({
    page,
    context,
  }) => {
    const psbt = createTestPsbt();

    const [result] = await Promise.all([
      initiatePsbtSigning(page)({
        network: 'testnet',
        hex: bytesToHex(psbt.toPSBT()),
        signAtIndex: 4,
        broadcast: false,
      }),
      clickActionButton(context)('Confirm'),
      clickErrorCloseWindowButton(context),
    ]);

    delete result.id;

    test.expect(result).toEqual(createExpectedError(4001, 'User rejected signing PSBT request'));
  });

  test('that failed broadcasts return an error to the app', async ({ page, context }) => {
    const psbt = createTestPsbt();
    const requestPromise = interceptBroadcastRequest(context, route =>
      route.fulfill({ status: 500 })
    );

    const [result] = await Promise.all([
      initiatePsbtSigning(page)({
        network: 'testnet',
        hex: bytesToHex(psbt.toPSBT()),
        broadcast: true,
      }),
      clickActionButton(context)('Confirm'),
    ]);

    await requestPromise;

    delete result.id;

    psbt.sign(addressKeychain.privateKey!);

    test.expect(result).toEqual(
      createExpectedError(4002, 'Failed to broadcast transaction', {
        hex: bytesToHex(psbt.toPSBT()),
      })
    );
  });

  test.describe('Taproot inputs', () => {
    const taprootKeychain = createTaprootKeychainFromTestMnemonic();
    if (!taprootKeychain.publicKey) throw new Error('No taproot publicKey');

    const schnorrPubKey = ecdsaPublicKeyToSchnorr(taprootKeychain.publicKey);
    const taprootPayment = btc.p2tr(schnorrPubKey, undefined, bitcoinTestnet);

    function createTaprootTestPsbt() {
      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '3f6c95b9895cd22943c8f8bcac899c10997b99651f0a7d9bd8c0c6f3536cbbc7',
        index: 2,
        witnessUtxo: {
          amount: 5000n,
          script: taprootPayment.script,
        },
        tapInternalKey: taprootPayment.tapInternalKey,
      });

      psbt.addInput({
        txid: 'b7a3e8d14f2c6a0953e1d4b8c7f5a2e9d6b3c0f1a4e7d2c5b8f1a4d7c0e3f6a9',
        index: 3,
        witnessUtxo: {
          amount: 10000n,
          script: taprootPayment.script,
        },
        tapInternalKey: taprootPayment.tapInternalKey,
      });

      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);
      return psbt;
    }

    function createTaprootTestPsbtWithoutTapInternalKey() {
      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '3f6c95b9895cd22943c8f8bcac899c10997b99651f0a7d9bd8c0c6f3536cbbc7',
        index: 2,
        witnessUtxo: {
          amount: 5000n,
          script: taprootPayment.script,
        },
      });

      psbt.addInput({
        txid: 'b7a3e8d14f2c6a0953e1d4b8c7f5a2e9d6b3c0f1a4e7d2c5b8f1a4d7c0e3f6a9',
        index: 3,
        witnessUtxo: {
          amount: 10000n,
          script: taprootPayment.script,
        },
      });

      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);
      return psbt;
    }

    test('that all taproot inputs are signed and broadcast', async ({ page, context }) => {
      const psbt = createTaprootTestPsbt();
      const reqPromise = interceptBroadcastRequest(context, route =>
        route.fulfill({
          body: 'not-a-real-txid-response',
        })
      );
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          broadcast: true,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      await reqPromise;

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();
      test.expect(result.result.txid).toEqual('not-a-real-txid-response');

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      test.expect(signedTx.getInput(0).tapKeySig).toBeDefined();
      test.expect(signedTx.getInput(1).tapKeySig).toBeDefined();
    });

    test('that only requested taproot input is signed', async ({ page, context }) => {
      const psbt = createTaprootTestPsbt();
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          signAtIndex: 0,
          broadcast: false,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      test.expect(signedTx.getInput(0).tapKeySig).toBeDefined();
      test.expect(signedTx.getInput(1).tapKeySig).toBeUndefined();
    });

    test('that taproot PSBT without tapInternalKey signs successfully via auto-injection', async ({
      page,
      context,
    }) => {
      const psbt = createTaprootTestPsbtWithoutTapInternalKey();
      const reqPromise = interceptBroadcastRequest(context, route =>
        route.fulfill({
          body: 'not-a-real-txid-response',
        })
      );
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          broadcast: true,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      await reqPromise;

      delete result.id;

      test.expect(result.result).toBeDefined();
      test.expect(result.result.hex).toBeTruthy();
      test.expect(result.result.txid).toEqual('not-a-real-txid-response');
    });

    test('that taproot signing request can be canceled', async ({ page, context }) => {
      const psbt = createTaprootTestPsbt();
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          broadcast: false,
        }),
        clickActionButton(context)('Cancel'),
      ]);

      delete result.id;

      test.expect(result).toEqual(createExpectedError(4001, 'User rejected signing PSBT request'));
    });
  });

  test.describe('Mixed inputs (p2wpkh + p2tr)', () => {
    const taprootKeychain = createTaprootKeychainFromTestMnemonic();
    if (!taprootKeychain.publicKey) throw new Error('No taproot publicKey');

    const schnorrPubKey = ecdsaPublicKeyToSchnorr(taprootKeychain.publicKey);
    const taprootPayment = btc.p2tr(schnorrPubKey, undefined, bitcoinTestnet);

    function createMixedTestPsbt() {
      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
        index: 1,
        witnessUtxo: {
          amount: 4805n,
          script: btc.p2wpkh(addressKeychain.publicKey!, bitcoinTestnet).script,
        },
      });

      psbt.addInput({
        txid: '3f6c95b9895cd22943c8f8bcac899c10997b99651f0a7d9bd8c0c6f3536cbbc7',
        index: 2,
        witnessUtxo: {
          amount: 10000n,
          script: taprootPayment.script,
        },
        tapInternalKey: taprootPayment.tapInternalKey,
      });

      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);
      return psbt;
    }

    test('that all mixed inputs are signed and broadcast', async ({ page, context }) => {
      const psbt = createMixedTestPsbt();
      const reqPromise = interceptBroadcastRequest(context, route =>
        route.fulfill({
          body: 'not-a-real-txid-response',
        })
      );
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          broadcast: true,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      await reqPromise;

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();
      test.expect(result.result.txid).toEqual('not-a-real-txid-response');

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      test.expect(signedTx.getInput(0).partialSig).toBeDefined();
      test.expect(signedTx.getInput(1).tapKeySig).toBeDefined();
    });

    test('that only taproot input is signed in mixed PSBT', async ({ page, context }) => {
      const psbt = createMixedTestPsbt();
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          signAtIndex: 1,
          broadcast: false,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      test.expect(signedTx.getInput(0).partialSig).toBeUndefined();
      test.expect(signedTx.getInput(1).tapKeySig).toBeDefined();
    });
  });

  test.describe('Witness script (p2wsh) inputs', () => {
    test('that a p2wsh input forging the p2wpkh scriptCode is not signed', async ({
      page,
      context,
    }) => {
      const witnessScript = btc.p2pkh(addressKeychain.publicKey!).script;
      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
        index: 0,
        witnessUtxo: {
          amount: 20000n,
          script: btc.OutScript.encode({ type: 'wsh', hash: sha256(witnessScript) }),
        },
        witnessScript,
      });
      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);

      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          broadcast: false,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      test.expect(signedTx.getInput(0).partialSig).toBeUndefined();
    });
  });

  test.describe('Descriptor (wsh miniscript) inputs', () => {
    const seed = mnemonicToSeedSync(TEST_ACCOUNT_SECRET_KEY);
    const nativeSegwitAccountXpub =
      HDKey.fromMasterSeed(seed).derive("m/84'/1'/0'").publicExtendedKey;
    const otherAccountXpub = HDKey.fromMasterSeed(new Uint8Array(32).fill(2)).derive(
      "m/84'/1'/0'"
    ).publicExtendedKey;
    const digest = '00'.repeat(32);

    // pk(A) is the current account's key (which must always sign), combined with
    // a timelock-or-(hashlock + pk(B)) branch — mirrors the user's example policy.
    const descriptor = `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${digest}),pk(${otherAccountXpub}/0/*))),pk(${nativeSegwitAccountXpub}/0/*)))`;
    const { scriptPubKey } = compileWshDescriptor(descriptor);

    function createDescriptorTestPsbt() {
      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
        index: 0,
        witnessUtxo: { amount: 20000n, script: scriptPubKey },
      });
      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);
      return psbt;
    }

    test('that the descriptor input is signed with the account key', async ({ page, context }) => {
      const psbt = createDescriptorTestPsbt();
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          descriptor,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      const partialSig = signedTx.getInput(0).partialSig;
      test.expect(partialSig).toBeDefined();
      test.expect(bytesToHex(partialSig![0][0])).toEqual(bytesToHex(addressKeychain.publicKey!));
    });

    test('that a raw-pubkey (0/0) descriptor input is signed with the account key', async ({
      page,
      context,
    }) => {
      const rawPubkeyDescriptor = `wsh(and_v(v:after(5),pk(${bytesToHex(addressKeychain.publicKey!)})))`;
      const { scriptPubKey: rawScriptPubKey } = compileWshDescriptor(rawPubkeyDescriptor);

      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
        index: 0,
        witnessUtxo: { amount: 20000n, script: rawScriptPubKey },
      });
      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);

      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          descriptor: rawPubkeyDescriptor,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      delete result.id;

      test.expect(result.result).toBeDefined();
      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      const partialSig = signedTx.getInput(0).partialSig;
      test.expect(partialSig).toBeDefined();
      test.expect(bytesToHex(partialSig![0][0])).toEqual(bytesToHex(addressKeychain.publicKey!));
    });

    test('that a fixed non-zero index descriptor input is signed at that index', async ({
      page,
      context,
    }) => {
      const vaultDescriptor = `wsh(sortedmulti(2,${otherAccountXpub}/0/7,${nativeSegwitAccountXpub}/0/7))`;
      const { scriptPubKey: vaultScriptPubKey } = compileWshDescriptor(vaultDescriptor);
      const vaultAddressKey = HDKey.fromMasterSeed(seed)
        .derive("m/84'/1'/0'")
        .deriveChild(0)
        .deriveChild(7);

      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
        index: 0,
        witnessUtxo: { amount: 20000n, script: vaultScriptPubKey },
      });
      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);

      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          descriptor: vaultDescriptor,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      delete result.id;

      test.expect(result.result).toBeDefined();
      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      const partialSig = signedTx.getInput(0).partialSig;
      test.expect(partialSig).toBeDefined();
      test.expect(bytesToHex(partialSig![0][0])).toEqual(bytesToHex(vaultAddressKey.publicKey!));
    });

    const singleKeyDescriptor = `wsh(pk(${nativeSegwitAccountXpub}/0/*))`;
    const { scriptPubKey: singleKeyScriptPubKey } = compileWshDescriptor(singleKeyDescriptor);

    function createSingleKeyDescriptorPsbt() {
      const psbt = new btc.Transaction();
      psbt.addInput({
        txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
        index: 0,
        witnessUtxo: { amount: 20000n, script: singleKeyScriptPubKey },
      });
      psbt.addOutputAddress('tb1q4qgnjewwun2llgken94zqjrx5kpqqycaz5522d', 1000n, bitcoinTestnet);
      return psbt;
    }

    test('that a fully satisfiable descriptor psbt is finalized and broadcast', async ({
      page,
      context,
    }) => {
      const psbt = createSingleKeyDescriptorPsbt();
      const requestPromise = interceptBroadcastRequest(context, route =>
        route.fulfill({ body: 'not-a-real-txid-response' })
      );

      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          descriptor: singleKeyDescriptor,
          broadcast: true,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      const request = await requestPromise;

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();
      test.expect(result.result.txid).toEqual('not-a-real-txid-response');

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      const partialSig = signedTx.getInput(0).partialSig;
      test.expect(partialSig).toBeDefined();
      test.expect(bytesToHex(partialSig![0][0])).toEqual(bytesToHex(addressKeychain.publicKey!));

      const broadcastBody = request.postDataBuffer();
      test.expect(broadcastBody).toBeDefined();
      const broadcastTx = btc.Transaction.fromRaw(hexToBytes(broadcastBody!.toString()), {
        allowUnknownInputs: true,
      });
      test.expect(broadcastTx.getInput(0).finalScriptWitness?.length).toBeGreaterThan(0);
    });

    test('that an unsatisfiable descriptor psbt is returned partially signed without broadcasting', async ({
      page,
      context,
    }) => {
      const psbt = createDescriptorTestPsbt();
      let broadcastAttempted = false;
      const interceptPromise = (async () => {
        const popup = await context.waitForEvent('page');
        await popup.route('**/api/tx', route => {
          broadcastAttempted = true;
          return route.fulfill({ body: 'not-a-real-txid-response' });
        });
      })();

      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          descriptor,
          broadcast: true,
        }),
        interceptPromise,
        clickActionButton(context)('Confirm'),
      ]);

      delete result.id;

      test.expect(result.jsonrpc).toEqual('2.0');
      test.expect(result.result).toBeDefined();
      test.expect(result.result.txid).toBeUndefined();
      test.expect(broadcastAttempted).toBe(false);

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.result.hex));
      const partialSig = signedTx.getInput(0).partialSig;
      test.expect(partialSig).toBeDefined();
      test.expect(bytesToHex(partialSig![0][0])).toEqual(bytesToHex(addressKeychain.publicKey!));
    });

    test('that a failed descriptor broadcast returns the signed psbt in the error', async ({
      page,
      context,
    }) => {
      const psbt = createSingleKeyDescriptorPsbt();
      const requestPromise = interceptBroadcastRequest(context, route =>
        route.fulfill({ status: 500 })
      );

      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          descriptor: singleKeyDescriptor,
          broadcast: true,
        }),
        clickActionButton(context)('Confirm'),
      ]);

      await requestPromise;

      delete result.id;

      test.expect(result.error).toBeDefined();
      test.expect(result.error.code).toEqual(4002);
      test.expect(result.error.message).toEqual('Failed to broadcast transaction');

      const signedTx = btc.Transaction.fromPSBT(hexToBytes(result.error.data.hex));
      const partialSig = signedTx.getInput(0).partialSig;
      test.expect(partialSig).toBeDefined();
      test.expect(bytesToHex(partialSig![0][0])).toEqual(bytesToHex(addressKeychain.publicKey!));
    });

    test('that a descriptor without the current account is rejected', async ({ page, context }) => {
      const anotherForeignXpub = HDKey.fromMasterSeed(new Uint8Array(32).fill(3)).derive(
        "m/84'/1'/0'"
      ).publicExtendedKey;
      const foreignDescriptor = `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${digest}),pk(${otherAccountXpub}/0/*))),pk(${anotherForeignXpub}/0/*)))`;
      const psbt = createDescriptorTestPsbt();
      const [result] = await Promise.all([
        initiatePsbtSigning(page)({
          network: 'testnet',
          hex: bytesToHex(psbt.toPSBT()),
          descriptor: foreignDescriptor,
        }),
        clickActionButton(context)('Confirm'),
        clickErrorCloseWindowButton(context),
      ]);

      delete result.id;

      test
        .expect(result)
        .toEqual(createExpectedError(RpcErrorCode.INVALID_REQUEST, 'Error signing transaction'));
    });

    test('that a non-wsh descriptor is rejected with invalid params', async ({ page }) => {
      const psbt = createDescriptorTestPsbt();
      const result = await initiatePsbtSigning(page)({
        network: 'testnet',
        hex: bytesToHex(psbt.toPSBT()),
        descriptor: `wpkh(${nativeSegwitAccountXpub}/0/*)`,
      });

      delete result.id;

      test
        .expect(result)
        .toEqual(
          createExpectedError(RpcErrorCode.INVALID_PARAMS, 'Only wsh() descriptors are supported')
        );
    });
  });
});

test.describe('Sign PSBT: bond proposal', () => {
  const bitcoinPolicy = makeBitcoinPolicy();
  const bondParams = {
    unlockHeight: 1000,
    hash: bytesToHex(sha256(new Uint8Array([1, 2, 3]))),
    counterpartyKey: `${makeNativeSegwitAccountXpub(9)}/0/0`,
  };
  const bondDescriptor = instantiateBondDescriptor({
    ...bondParams,
    ...getBondVaultKeys(bitcoinPolicy.descriptor),
  });
  const { scriptPubKey: bondScriptPubKey, witnessScript: bondWitnessScript } =
    compileWshDescriptor(bondDescriptor);

  function createBondPsbtHex() {
    const psbt = new btc.Transaction({ lockTime: bondParams.unlockHeight });
    psbt.addInput({
      txid: '2965dc62a012028b529c902da59606d65d35353c966aeaf9287f534547609f5f',
      index: 0,
      witnessUtxo: { amount: 50_000n, script: bondScriptPubKey },
      witnessScript: bondWitnessScript,
      sequence: 0xfffffffd,
    });
    psbt.addOutputAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 45_000n);
    return bytesToHex(psbt.toPSBT());
  }

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, {
      ...policyStateOverrides({ policies: [bitcoinPolicy] }),
      ...getConnectedTestAppPermissionsState({ policyId: bitcoinPolicy.id }),
    });
    await page.goto('localhost:3000');
  });

  test('that a bond spend from a policy bound connection uploads a proposal for the matched policy', async ({
    page,
    context,
  }) => {
    const psbtHex = createBondPsbtHex();

    let proposeBody: Record<string, unknown> | undefined;
    await context.route('**/v1/multisig-ext/propose', route => {
      proposeBody = route.request().postDataJSON();
      return route.fulfill({ json: makeMultisigTransaction() });
    });

    const [result] = await Promise.all([
      initiatePsbtSigning(page)({
        network: 'mainnet',
        hex: psbtHex,
        descriptor: bondDescriptor,
      }),
      (async () => {
        const popup = await context.waitForEvent('page');
        await popup.waitForTimeout(1000);
        await popup.locator('text="Propose transaction"').click({ timeout: 20_000 });
      })(),
    ]);

    delete result.id;

    test.expect(result.jsonrpc).toEqual('2.0');
    test.expect(result.result).toEqual({
      hex: psbtHex,
      proposalId: exampleMultisigTransactionId,
      status: 'proposed',
    });

    test.expect(proposeBody).toMatchObject({
      multisigAddress: bitcoinPolicy.address,
      rawPayload: psbtHexToBase64(psbtHex),
    });
    test.expect(typeof proposeBody?.proposalSignature).toEqual('string');
    test.expect(proposeBody?.proposalSignature).not.toHaveLength(0);
    test.expect(typeof proposeBody?.proposalTimestamp).toEqual('number');
  });

  test('that a request with a non-bond descriptor is rejected', async ({ page }) => {
    const result = await initiatePsbtSigning(page)({
      network: 'mainnet',
      hex: createBondPsbtHex(),
      descriptor: bitcoinPolicy.descriptor,
    });

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: RpcErrorCode.INVALID_PARAMS,
        message: 'Descriptor is not a supported bond template',
      },
    });
  });
});
