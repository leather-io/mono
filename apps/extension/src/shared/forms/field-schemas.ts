import { z } from 'zod';

type FieldInput = string | number | undefined;

interface RequiredNumberFieldOptions {
  requiredError: string;
  typeError: string;
}

export function parseNumberString(value: string) {
  const digits = value.replace(/\s/g, '');
  if (digits === '') return Number.NaN;
  return Number(digits);
}

function parseNumberInput(value: FieldInput) {
  return typeof value === 'string' ? parseNumberString(value) : value;
}

function parseStringInput(value: FieldInput) {
  return typeof value === 'number' ? String(value) : value;
}

function isNumberValue(value: unknown) {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function numberField(typeError: string) {
  return z.preprocess(
    parseNumberInput,
    z.custom<number>(isNumberValue, { error: typeError }).optional()
  );
}

export function requiredNumberField({ requiredError, typeError }: RequiredNumberFieldOptions) {
  return z.preprocess(
    parseNumberInput,
    z.custom<number>(isNumberValue, {
      error: issue => (issue.input === undefined ? requiredError : typeError),
    })
  );
}

export function stringField() {
  return z.preprocess(parseStringInput, z.string().optional());
}

export function requiredStringField(requiredError: string) {
  return z.preprocess(parseStringInput, z.string({ error: requiredError }).min(1, requiredError));
}
