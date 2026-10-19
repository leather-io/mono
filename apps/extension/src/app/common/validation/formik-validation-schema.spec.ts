import { validateYupSchema, yupToFormErrors } from 'formik';
import { z } from 'zod';

import { numberField, requiredStringField, stringField } from '@shared/forms/field-schemas';

import { createFormikValidationSchema } from './formik-validation-schema';

async function rejectionOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected promise to reject');
}

const validationErrorSchema = z.object({
  name: z.literal('ValidationError'),
  inner: z.array(z.object({ path: z.string(), message: z.string() })),
});

function parseValidationError(error: unknown) {
  return validationErrorSchema.parse(error);
}

describe(createFormikValidationSchema.name, () => {
  const schema = createFormikValidationSchema(
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
        z.refine<string | undefined>(value => value !== undefined && value.trim() !== '', {
          error: '',
        }),
        z.refine<string | undefined>(value => value === undefined || value.startsWith('bc1'), {
          error: 'Address is not valid',
        }),
        z.refine<string | undefined>(value => Promise.resolve(value !== 'bc1sanctioned'), {
          error: 'Compliance check failed',
        })
      ),
    })
  );

  describe('validate', () => {
    it('resolves when every field is valid', async () => {
      await expect(
        schema.validate({ amount: '1', recipient: 'bc1valid' })
      ).resolves.toBeUndefined();
    });

    it('rejects with an error Formik recognises as a validation error', async () => {
      const error = await rejectionOf(schema.validate({ amount: 'abc', recipient: 'bc1valid' }));
      expect(error).toBeInstanceOf(Error);
      expect(parseValidationError(error).inner).toEqual([
        { path: 'amount', message: 'Amount must be a number' },
      ]);
    });

    it('lists every failing check in declaration order, sync checks before async ones', async () => {
      const error = await rejectionOf(
        schema.validate({ amount: '-1', recipient: 'bc1sanctioned' })
      );
      expect(parseValidationError(error).inner).toEqual([
        { path: 'amount', message: 'Amount must be greater than zero' },
        { path: 'recipient', message: 'Compliance check failed' },
      ]);
    });

    it('keeps running later checks after an earlier check fails', async () => {
      const error = await rejectionOf(schema.validate({ amount: '1', recipient: '   ' }));
      expect(parseValidationError(error).inner).toEqual([
        { path: 'recipient', message: '' },
        { path: 'recipient', message: 'Address is not valid' },
      ]);
    });

    it('stops at the type error so later checks do not see a non-number', async () => {
      const seen: unknown[] = [];
      const spying = createFormikValidationSchema(
        z.object({
          amount: numberField('Amount must be a number').check(
            z.refine<number | undefined>(value => {
              seen.push(value);
              return true;
            })
          ),
        })
      );
      await rejectionOf(spying.validate({ amount: 'abc' }));
      expect(seen).toEqual([]);
    });

    it('maps to Formik errors with the first message per field winning', async () => {
      const error = await rejectionOf(validateYupSchema({ amount: '-1', recipient: '' }, schema));
      expect(yupToFormErrors(parseValidationError(error))).toEqual({
        amount: 'Amount must be greater than zero',
        recipient: '',
      });
    });

    it('formats nested issue paths the way Formik expects', async () => {
      const nested = createFormikValidationSchema(
        z.object({
          recipients: z.array(z.object({ address: z.string().min(1, 'Enter an address') })),
          'with.dot': z.string().min(1, 'Required'),
        })
      );
      const error = await rejectionOf(
        nested.validate({ recipients: [{ address: 'ok' }, { address: '' }], 'with.dot': '' })
      );
      expect(parseValidationError(error).inner).toEqual([
        { path: 'recipients[1].address', message: 'Enter an address' },
        { path: '["with.dot"]', message: 'Required' },
      ]);
    });

    it('builds the schema from the values being validated when given a builder', async () => {
      const builder = createFormikValidationSchema((values: unknown) =>
        z.object({
          amount: numberField('Amount must be a number').check(
            z.refine<number | undefined>(
              value =>
                typeof values === 'object' &&
                values !== null &&
                'max' in values &&
                typeof values.max === 'number' &&
                value !== undefined &&
                value <= values.max,
              { error: 'Too much' }
            )
          ),
          max: numberField('Max must be a number'),
        })
      );
      await expect(builder.validate({ amount: '5', max: 10 })).resolves.toBeUndefined();
      const error = await rejectionOf(builder.validate({ amount: '50', max: 10 }));
      expect(parseValidationError(error).inner).toEqual([{ path: 'amount', message: 'Too much' }]);
    });
  });

  describe('validateAt', () => {
    it('validates only the named field against the raw value', async () => {
      await expect(
        schema.validateAt('amount', { amount: '1', recipient: 'bc1sanctioned' })
      ).resolves.toBeUndefined();
    });

    it('rejects with only the first failing check of that field', async () => {
      const error = await rejectionOf(
        schema.validateAt('recipient', { amount: '1', recipient: '' })
      );
      expect(parseValidationError(error).inner).toEqual([{ path: 'recipient', message: '' }]);
    });

    it('does not run checks of sibling fields', async () => {
      const complianceCalls: unknown[] = [];
      const spying = createFormikValidationSchema(
        z.object({
          nonce: numberField('Nonce must be a positive integer or 0'),
          recipient: stringField().check(
            z.refine<string | undefined>(value => {
              complianceCalls.push(value);
              return Promise.resolve(true);
            })
          ),
        })
      );
      await spying.validateAt('nonce', { nonce: '', recipient: 'bc1valid' }).catch(() => undefined);
      expect(complianceCalls).toEqual([]);
    });

    it('rejects an unknown path', async () => {
      await expect(schema.validateAt('missing', {})).rejects.toThrow(
        'The schema does not contain the path: missing'
      );
    });

    it('reports a required message for an undefined value', async () => {
      const required = createFormikValidationSchema(
        z.object({ password: requiredStringField('Enter your password') })
      );
      const error = await rejectionOf(required.validateAt('password', {}));
      expect(parseValidationError(error).inner).toEqual([
        { path: 'password', message: 'Enter your password' },
      ]);
    });
  });
});
