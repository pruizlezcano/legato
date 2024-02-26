import { useState } from 'react';
import DebounceInput from './DebounceInput';

function EditableCell({
  value: initialValue,
  row: { index },
  column: { id },
  table,
  type = 'text',
  placeholder = '',
}: {
  value: string | number;
  row: { index: number };
  column: { id: string };
  table: any;
  type?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const onBlur = (actualValue: string) => {
    table.options.meta?.updateData(index, id, actualValue);
  };

  return (
    <DebounceInput
      type={type}
      value={value || ''}
      onChange={(newValue) => {
        setValue(newValue);
      }}
      onBlur={(actualValue) => onBlur(actualValue!)}
      placeholder={placeholder}
      className="border-0 shadow-none"
    />
  );
}

export default EditableCell;
