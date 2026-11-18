import { useFormContext, useFormState, useWatch } from 'react-hook-form';

export function useIsFieldDirty(name: string) {
  const { formState } = useFormContext();
  const value: unknown = useWatch({ name });
  const initialValue: unknown = formState.defaultValues?.[name];
  return value !== initialValue;
}

export function useFieldError(name: string) {
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  return getFieldState(name, formState).error?.message;
}

export function useShowFieldError(name: string) {
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name });
  const { error, isTouched } = getFieldState(name, formState);
  const isDirty = useIsFieldDirty(name);
  const isFieldInFocus = document.activeElement?.getAttribute('name') === name;

  return !!(
    (formState.submitCount > 0 && error) ||
    (!isFieldInFocus && isTouched && isDirty && error)
  );
}
