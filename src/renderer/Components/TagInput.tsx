import { useEffect, useState, KeyboardEvent, createRef, useRef } from 'react';
import Tags from '@yaireo/tagify/dist/react.tagify'; // React-wrapper file
import '@yaireo/tagify/dist/tagify.css'; // Tagify CSS

function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (e: any) => void;
}) {
  const valueRef = useRef<string[]>(value);
  const [valueState, setValue] = useState<string[]>(value);
  const settings = {
    templates: {
      tag(tagData, tagify) {
        return `
          <tag title="${tagData.title || tagData.value}"
            contenteditable='false'
            spellcheck='false'
            tabIndex="${this.settings.a11y.focusableTags ? 0 : -1}"
            class="${this.settings.classNames.tag} ${
              tagData.class ? tagData.class : ''
            } bg-gray-200 rounded-lg text-xs dark:text-dark m-0 my-1 mr-1.5"
            ${this.getAttributes(tagData)}
          >
            <x title='' class="${
              this.settings.classNames.tagX
            }" role='button' aria-label='remove tag'></x>
            <div class="bg-gray-200">
                <span class="${this.settings.classNames.tagText} bg-gray-200">${
                  tagData[this.settings.tagTextProp] || tagData.value
                }</span>
            </div>
          </tag>`;
      },
    },
  };

  const handleOnChange = (e: { detail: { value: string } }) => {
    if (!e.detail.value) {
      setValue([]);
      valueRef.current = [];
      onChange(valueRef.current);
      return;
    }
    const tags = JSON.parse(e.detail.value).map(
      (tag: { value: string }) => tag.value,
    );
    setValue(tags);
    valueRef.current = tags;
    onChange(valueRef.current);
  };

  return (
    <Tags
      settings={settings}
      value={valueState}
      onChange={handleOnChange}
      className="bg-inherit border-0 w-full"
    />
  );
}

export default TagInput;
