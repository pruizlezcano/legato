/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/require-default-props */
import {
  useState,
  ReactNode,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
} from 'react';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useOutsideClick from '../hooks/useOutsideClick';

type DropdownOptionProps = {
  onClick: () => void;
  className?: string;
  children: ReactNode;
};

export function DropdownSeparator() {
  return <hr className="mx-2 border-slate-200 dark:border-dark-800" />;
}

export function DropdownOption({
  onClick,
  className = '',
  children,
}: DropdownOptionProps) {
  return (
    <button
      type="button"
      className={`block text-sm px-4 mx-1 py-2 my-1 w-40 rounded-md hover:bg-gray-100 dark:hover:bg-dark-900 ${className}`}
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

  const childrenWithProps = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === DropdownOption) {
      const typedChild = child as ReactElement<DropdownOptionProps>;
      return cloneElement(typedChild, {
        onClick: () => {
          if (typedChild.props.onClick) {
            typedChild.props.onClick();
          }
          setOpen(false);
        },
      });
    }
    return child;
  });

  return (
    <div className="relative flex justify-end mr-12">
      <div>
        <button
          type="button"
          className="rounded-md bg-white dark:bg-dark px-3 py-2 text-sm text-gray-700 dark:text-text-dark hover:bg-gray-100 dark:hover:bg-dark-900"
          onClick={() => setOpen(!open)}
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>

      {open && (
        <div
          className="absolute z-10 mt-9 rounded-md bg-white dark:bg-dark text-gray-700 dark:text-text-dark border border-slate-200 dark:border-dark-800"
          role="none"
          ref={ref}
        >
          {childrenWithProps}
        </div>
      )}
    </div>
  );
}
