import { z } from 'zod';

import { numberField, requiredStringField, stringField } from '@shared/forms/field-schemas';

import { createFormResolver } from './form-resolver';

const resolverOptions = { fields: {}, shouldUseNativeValidation: false };

function resolve(resolver: ReturnType<typeof createFormResolver>, values: Record<string, unknown>) {
  return resolver(values, undefined, resolverOptions);
}

describe(createFormResolver.name, () => {
  const resolver = createFormResolver(
    z.object({
      amount: numberField('Amount must be a number').check(
        z.refine<number | undefined>(value => value === undefined || value > 0, {
          error: 'Amount must be greater than zero',
        }),
        z.refine<number | undefined>(value => value === undefined || value <= 10, {
          error: 'Insufficient funds',
        })
      ),
      recipient: stringField().check(
        z.refine<string | undefined>(value => value === undefined || value.startsWith('bc1'), {
          error: 'Address is not valid',
        }),
        z.refine<string | undefined>(value => Promise.resolve(value !== 'bc1sanctioned'), {
          error: 'Compliance check failed',
        })
      ),
    })
  );

  it('returns the raw values and no errors when every field is valid', async () => {
    const values = { amount: '1', recipient: 'bc1valid' };
    await expect(resolve(resolver, values)).resolves.toEqual({ values, errors: {} });
  });

  it('treats empty strings as missing values', async () => {
    const values = { amount: '', recipient: '' };
    await expect(resolve(resolver, values)).resolves.toEqual({ values, errors: {} });
  });

  it('reports the first error per field only', async () => {
    const result = await resolve(resolver, { amount: '-1', recipient: 'bc1sanctioned' });
    expect(result.values).toEqual({});
    expect(result.errors).toMatchObject({
      amount: { message: 'Amount must be greater than zero' },
      recipient: { message: 'Compliance check failed' },
    });
  });

  it('reports type errors before refinements', async () => {
    const result = await resolve(resolver, { amount: 'abc', recipient: 'bc1valid' });
    expect(result.errors).toMatchObject({ amount: { message: 'Amount must be a number' } });
    expect(result.errors).not.toHaveProperty('recipient');
  });

  it('uses the required message for empty required fields', async () => {
    const requiredResolver = createFormResolver(
      z.object({ password: requiredStringField('Enter your password') })
    );
    const result = await resolve(requiredResolver, { password: '' });
    expect(result.errors).toMatchObject({ password: { message: 'Enter your password' } });
  });

  it('nests errors for dotted paths', async () => {
    const nestedResolver = createFormResolver(
      z.object({ backups: z.object({ abcd: z.literal(true, { error: 'Confirm backup' }) }) })
    );
    const result = await resolve(nestedResolver, { backups: { abcd: false } });
    expect(result.errors).toMatchObject({ backups: { abcd: { message: 'Confirm backup' } } });
  });

  it('builds the schema from the current values when given a builder', async () => {
    const builderResolver = createFormResolver<{ amount: string; fee: string }>(values =>
      z.object({
        amount: numberField('Amount must be a number').check(
          z.refine<number | undefined>(
            value => value === undefined || value <= Number(values.fee),
            {
              error: 'Amount exceeds fee',
            }
          )
        ),
        fee: stringField(),
      })
    );
    const invalid = await builderResolver({ amount: '5', fee: '1' }, undefined, resolverOptions);
    expect(invalid.errors).toMatchObject({ amount: { message: 'Amount exceeds fee' } });
    const valid = await builderResolver({ amount: '5', fee: '10' }, undefined, resolverOptions);
    expect(valid.errors).toEqual({});
  });
});
