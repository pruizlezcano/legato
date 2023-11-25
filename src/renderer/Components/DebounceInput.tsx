import { useState, useEffect } from 'react';

const DebounceInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(initialValue);

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
      className={props.className}
      {...props}
      value={inputValue}
      onChange={handleInputChange}
    />
  );
};

export default DebounceInput;
