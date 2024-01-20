import { useState, ReactNode } from 'react';
import { Select, SelectContent, SelectTrigger, SelectValue } from './ui/select';

function EditableCell({
  value: initialValue,
  row: { index },
  column: { id },
  table,
  children,
  className = '',
  placeholder = '',
}: {
  value: string;
  row: { index: number };
  column: { id: string };
  table: any;
  children: ReactNode;
  className?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const onChange = (newValue: string) => {
    setValue(newValue);
    table.options.meta?.updateData(index, id, newValue);
  };

  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export default EditableCell;
