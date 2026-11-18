import type { FieldError, FieldValues, Resolver } from 'react-hook-form';

import { toNestErrors } from '@hookform/resolvers';
import { isPlainObject, mapValues } from 'remeda';
import type { z } from 'zod';

type FormSchema = z.ZodObject<Readonly<Record<string, z.ZodType>>, z.core.$ZodObjectConfig>;

type FormSchemaSource<TValues extends FieldValues> = FormSchema | ((values: TValues) => FormSchema);

function prepareValueForValidation(value: unknown): unknown {
  if (value === '') return undefined;
  if (Array.isArray(value)) return value.map(prepareValueForValidation);
  if (isPlainObject(value)) return prepareValuesForValidation(value);
  return value;
}

function prepareValuesForValidation(values: Record<string, unknown>) {
  return mapValues(values, prepareValueForValidation);
}

function formatIssuePath(path: PropertyKey[]) {
  return path.map(segment => String(segment)).join('.');
}

function toFieldErrors(issues: z.core.$ZodIssue[]) {
  const errors: Record<string, FieldError> = {};
  issues.forEach(issue => {
    const path = formatIssuePath(issue.path);
    if (path in errors) return;
    errors[path] = { type: issue.code, message: issue.message };
  });
  return errors;
}

function resolveSchema<TValues extends FieldValues>(
  source: FormSchemaSource<TValues>,
  values: TValues
) {
  return typeof source === 'function' ? source(values) : source;
}

export function createFormResolver<TValues extends FieldValues>(
  source: FormSchemaSource<TValues>
): Resolver<TValues> {
  return async (values, _context, options) => {
    const result = await resolveSchema(source, values).safeParseAsync(
      prepareValuesForValidation(values)
    );
    if (result.success) return { values, errors: {} };
    return { values: {}, errors: toNestErrors(toFieldErrors(result.error.issues), options) };
  };
}
