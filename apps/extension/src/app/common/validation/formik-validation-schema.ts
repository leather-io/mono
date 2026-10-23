import { getIn } from 'formik';
import type { z } from 'zod';

type FormSchema = z.ZodObject<Readonly<Record<string, z.ZodType>>, z.core.$ZodObjectConfig>;

type FormSchemaSource = FormSchema | ((values: unknown) => FormSchema);

interface FieldValidationError {
  path: string;
  message: string;
}

export interface FormikValidationSchema {
  validate(values: unknown): Promise<void>;
  validateAt(path: string, values: unknown): Promise<void>;
}

class FormValidationError extends Error {
  override name = 'ValidationError';
  readonly inner: FieldValidationError[];

  constructor(first: FieldValidationError, rest: FieldValidationError[]) {
    super(first.message);
    this.inner = [first, ...rest];
  }
}

function formatIssuePath(path: PropertyKey[]) {
  return path.reduce<string>((formatted, segment) => {
    if (typeof segment === 'number') return `${formatted}[${segment}]`;
    const key = String(segment);
    if (key.includes('.')) return `${formatted}["${key}"]`;
    return formatted ? `${formatted}.${key}` : key;
  }, '');
}

function toFieldError(issue: z.core.$ZodIssue, parentPath: string[] = []): FieldValidationError {
  return { path: formatIssuePath([...parentPath, ...issue.path]), message: issue.message };
}

function resolveSchema(source: FormSchemaSource, values: unknown) {
  return typeof source === 'function' ? source(values) : source;
}

export function createFormikValidationSchema(source: FormSchemaSource): FormikValidationSchema {
  return {
    async validate(values) {
      const result = await resolveSchema(source, values).safeParseAsync(values);
      if (result.success) return;
      const [first, ...rest] = result.error.issues.map(issue => toFieldError(issue));
      throw new FormValidationError(first, rest);
    },
    async validateAt(path, values) {
      const { shape } = resolveSchema(source, values);
      if (!(path in shape)) throw new Error(`The schema does not contain the path: ${path}`);
      const fieldValue: unknown = getIn(values, path);
      const result = await shape[path].safeParseAsync(fieldValue);
      if (result.success) return;
      const [first] = result.error.issues;
      throw new FormValidationError(toFieldError(first, [path]), []);
    },
  };
}
