import { useState, useEffect } from 'react';

function DebounceInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string;
  onChange: (arg: string) => void;
  debounce: number | undefined;
}) {
  const [inputValue, setInputValue] = useState(initialValue);

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(inputValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [inputValue, 500]);

  return (
    <input
      type="text"
      {...props}
      className={props.className}
      value={inputValue}
      onChange={handleInputChange}
    />
  );
}

export default DebounceInput;
