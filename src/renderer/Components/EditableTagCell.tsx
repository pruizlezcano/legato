import { useEffect, useState, KeyboardEvent, createRef, useRef } from 'react';
import Tags from '@yaireo/tagify/dist/react.tagify'; // React-wrapper file
import '@yaireo/tagify/dist/tagify.css'; // Tagify CSS
import TagInput from './TagInput';
// import TagInput from './TagInput';

// eslint-disable-next-line react/function-component-definition
const EditableTagCell = ({
  getValue,
  row: { index },
  column: { id },
  table,
  ...props
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
