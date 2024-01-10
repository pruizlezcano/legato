/* eslint-disable react/require-default-props */
import { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { Input } from '@/Components/ui/input';

function DebounceInput({
  value: initialValue,
  onChange,
  type = 'text',
  className = '',
  placeholder = '',
  debounce = 500,
  onBlur,
  id = '',
}: {
  value: any;
  onChange: (arg: string) => void;
  onBlur?: () => void;
  type?: string;
  className?: string;
  placeholder?: string;
  debounce?: number;
  id?: string;
}) {
  const [inputValue, setInputValue] = useState(initialValue || '');
  const timeoutId = useRef<any>();

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setInputValue((e.target as HTMLInputElement).value);
      onChange((e.target as HTMLInputElement).value);
      (e.target as HTMLInputElement).blur();
      if (timeoutId.current) clearTimeout(timeoutId.current);
    }
  };

  useEffect(() => {
    timeoutId.current = setTimeout(() => {
      onChange(inputValue);
    }, debounce);
    return () => clearTimeout(timeoutId.current);
  }, [inputValue, debounce, onChange]);

  return (
    <Input
      type={type}
      className={className}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      id={id}
      onKeyDown={handleKeyDown}
    />
  );
}

export default DebounceInput;
