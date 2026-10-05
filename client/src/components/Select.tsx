import React from 'react';

export interface SelectProps<T> {
  id?: string;
  label?: string;
  options: T[];
  value: string;
  onChange: (value: string) => void;
  getOptionValue: (item: T) => string;
  getOptionLabel: (item: T) => string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function Select<T>({
  id,
  label,
  options,
  value,
  onChange,
  getOptionValue,
  getOptionLabel,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  error,
}: SelectProps<T>): React.ReactElement {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: 'var(--color-palette-3)' }}>*</span>}
        </label>
      )}
      <select
        id={id}
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((item) => {
          const val = getOptionValue(item);
          const lbl = getOptionLabel(item);
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-palette-1)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
