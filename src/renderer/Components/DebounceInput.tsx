/* eslint-disable react/require-default-props */
import { useState, useEffect, SetStateAction } from 'react';

function DebounceInput({
  value: initialValue,
  onChange,
  type = 'text',
  className = '',
  placeholder = '',
  debounce = 500,
}: {
  value: any;
  onChange: (arg: string) => void;
  type?: string;
  className?: string;
  placeholder?: string;
  debounce?: number;
}) {
  const [inputValue, setInputValue] = useState(initialValue);

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleInputChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(inputValue);
    }, debounce);
    return () => clearTimeout(timeoutId);
  }, [inputValue, debounce, onChange]);

  return (
    <input
      type={type}
      className={className}
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
    />
  );
}

export default DebounceInput;
