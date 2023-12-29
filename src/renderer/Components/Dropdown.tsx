/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/require-default-props */
import { useState, ReactNode } from 'react';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useOutsideClick from '../hooks/useOutsideClick';

export function DropdownSeparator() {
  return <hr className="mx-2 border-slate-200 dark:border-dark-800" />;
}

export function DropdownOption({
  onClick,
  className = '',
  children,
}: {
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`block text-sm px-4 mx-1 py-2 my-1 w-full rounded-md hover:bg-gray-100 dark:hover:bg-dark-900 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Dropdown({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClick(() => {
    setOpen(false);
  });
  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center gap-x-1.5 rounded-md bg-white dark:bg-dark px-3 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-gray-100 dark:hover:bg-dark-900"
          onClick={() => setOpen(!open)}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>

      {open && (
        <div
          className="fixed z-10 w-fit right-0 mr-4 origin-top-right rounded-md bg-white dark:bg-dark text-gray-700 dark:text-text-dark border border-slate-200 dark:border-dark-800"
          role="none"
          ref={ref}
        >
          {children}
        </div>
      )}
    </div>
  );
}
