import { useEffect, useState } from 'react';
import '@yaireo/tagify/dist/tagify.css'; // Tagify CSS
import TagInput from './TagInput';
// import TagInput from './TagInput';

// eslint-disable-next-line react/function-component-definition
const EditableTagCell = ({
  getValue,
  row: { index },
  column: { id },
  table,
}: {
  getValue: () => string[];
  row: { index: number };
  column: { id: string };
  table: any;
}) => {
  const initialValue = getValue();
  const [value, setValue] = useState<string[]>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onChange = (tags: string[]) => {
    setValue(tags);
    table.options.meta?.updateData(index, id, tags);
  };

  return <TagInput value={value} onChange={onChange} />;
};

export default EditableTagCell;
