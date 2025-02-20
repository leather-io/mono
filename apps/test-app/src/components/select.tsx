'use client';

interface SelectProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
  value: string;
}

export function Select({
  value,
  options,
  placeholder = 'Select an option',
  onChange,
}: SelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        className="w-full appearance-none bg-white border border-gray-300 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        onChange={e => onChange && onChange(e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        ▼
      </div>
    </div>
  );
}
