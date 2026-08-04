import { createByosmContractFormSchema, parseByosmContractInput } from './byosm-contract-schema';

const mainnetContractId = 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.custom-signer-manager';
const testnetContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.custom-signer-manager';

describe(parseByosmContractInput.name, () => {
  test('accepts a valid contract principal for the network', () => {
    expect(parseByosmContractInput(mainnetContractId, 'mainnet')).toEqual({
      ok: true,
      contractId: mainnetContractId,
    });
    expect(parseByosmContractInput(testnetContractId, 'devnet')).toEqual({
      ok: true,
      contractId: testnetContractId,
    });
  });

  test('trims surrounding whitespace', () => {
    expect(parseByosmContractInput(`  ${mainnetContractId}  `, 'mainnet')).toEqual({
      ok: true,
      contractId: mainnetContractId,
    });
  });

  test('reports missing input', () => {
    expect(parseByosmContractInput(null, 'mainnet')).toEqual({ ok: false, reason: 'missing' });
    expect(parseByosmContractInput('   ', 'mainnet')).toEqual({ ok: false, reason: 'missing' });
  });

  test('reports malformed principals', () => {
    expect(parseByosmContractInput('not-a-contract', 'mainnet')).toEqual({
      ok: false,
      reason: 'invalid-format',
    });
    expect(parseByosmContractInput('SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP', 'mainnet')).toEqual(
      { ok: false, reason: 'invalid-format' }
    );
    expect(parseByosmContractInput(`${mainnetContractId}.extra`, 'mainnet')).toEqual({
      ok: false,
      reason: 'invalid-format',
    });
  });

  test('reports an address from another network', () => {
    expect(parseByosmContractInput(testnetContractId, 'mainnet')).toEqual({
      ok: false,
      reason: 'wrong-network',
    });
    expect(parseByosmContractInput(mainnetContractId, 'devnet')).toEqual({
      ok: false,
      reason: 'wrong-network',
    });
  });
});

describe(createByosmContractFormSchema.name, () => {
  const schema = createByosmContractFormSchema('mainnet');

  test('parses a valid contract principal', () => {
    expect(schema.parse({ contract: ` ${mainnetContractId} ` })).toEqual({
      contract: mainnetContractId,
    });
  });

  test('rejects a malformed principal with the format message', () => {
    const result = schema.safeParse({ contract: 'nope' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/address\.contract-name/);
    }
  });

  test('rejects a wrong-network principal with the network message', () => {
    const result = schema.safeParse({ contract: testnetContractId });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/different network/);
    }
  });
});
