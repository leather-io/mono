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
  const { submitCount } = formState;
  const { error, isTouched } = getFieldState(name, formState);
  const errorMessage = error?.message;
  const isDirty = useIsFieldDirty(name);
  const isFieldInFocus = document.activeElement?.getAttribute('name') === name;

  return !!(
    (submitCount > 0 && errorMessage) ||
    (!isFieldInFocus && isTouched && isDirty && errorMessage)
  );
}
