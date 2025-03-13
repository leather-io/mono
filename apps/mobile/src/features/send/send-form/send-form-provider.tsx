import { useState } from 'react';

import { HasChildren } from '@leather.io/ui/native';

import { SendFormBaseContext, sendFormContext as SendFormContext } from './send-form-context';

interface SendFormProviderProps<T> extends HasChildren {
  initialData: T;
}
export function SendFormProvider<T extends SendFormBaseContext<T>>({
  children,
  initialData,
}: SendFormProviderProps<T>) {
  const [formData, setFormData] = useState<T>(initialData);

  function onSetFormData(key: keyof T, value: T[keyof T]) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  return (
    <SendFormContext.Provider
      value={{
        formData,
        onSetFormData,
      }}
    >
      {children}
    </SendFormContext.Provider>
  );
}
