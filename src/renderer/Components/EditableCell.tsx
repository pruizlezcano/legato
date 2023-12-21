/* eslint-disable react/require-default-props */
import { useEffect, useState, KeyboardEvent } from 'react';

// eslint-disable-next-line react/function-component-definition
const EditableCell = ({
  getValue,
  row: { index },
  column: { id },
  table,
  type = 'text',
  className = '',
  placeholder = '',
}: {
  getValue: () => string;
  row: { index: number };
  column: { id: string };
  table: any;
  type?: string;
  className?: string;
  placeholder?: string;
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const onBlur = () => {
    table.options.meta?.updateData(index, id, value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      className={`w-full focus:outline-0 ${className}`}
      placeholder={placeholder}
    />
  );
};

export default EditableCell;
