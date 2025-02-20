'use client';

import { InputHTMLAttributes } from 'react';

export function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <label>{label}</label>
      <input
        className="text-neutral-900 bg-neutral-200 p-2 rounded-md w-[450px] text-center"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
