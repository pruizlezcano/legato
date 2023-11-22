import { useEffect, useState, KeyboardEvent } from 'react';

// eslint-disable-next-line react/function-component-definition
const EditableCell = ({
  getValue,
  row: { index },
  column: { id },
  table,
  type = 'text',
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
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

export default EditableCell;
