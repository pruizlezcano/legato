import { ReactNode } from 'react';
import useOutsideClick from '../hooks/useOutsideClick';

// eslint-disable-next-line react/function-component-definition
const Dialog = ({
  onClose = () => {},
  children,
}: {
  onClose: Function;
  children: ReactNode;
}) => {
  const ref = useOutsideClick(() => {
    onClose();
  });
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none bg-black bg-opacity-30 focus:outline-none">
      <div
        ref={ref}
        className="relative mx-auto bg-white dark:bg-dark border border-slate-200 dark:border-dark-800 rounded-xl"
      >
        {children}
      </div>
    </div>
  );
};

export default Dialog;
