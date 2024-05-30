import { useField } from 'formik';

export function useIsFieldDirty(name: string) {
  const [field, meta] = useField(name);
  return field.value !== meta.initialValue;
}
