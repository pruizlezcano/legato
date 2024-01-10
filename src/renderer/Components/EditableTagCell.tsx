import { useState } from 'react';
import '@yaireo/tagify/dist/tagify.css'; // Tagify CSS
import TagInput from './TagInput';

function EditableTagCell({
  value: initialValue,
  row: { index },
  column: { id },
  table,
  ...props
}: {
  value: string[];
  row: { index: number };
  column: { id: string };
  table: any;
  type?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState<string[]>(initialValue);

  const onChange = (tags: string[]) => {
    setValue(tags);
    table.options.meta?.updateData(index, id, tags);
  };

  return (
    <TagInput
      value={typeof value === 'string' ? [value] : value}
      onChange={onChange}
      {...props}
    />
  );
}

export default EditableTagCell;
