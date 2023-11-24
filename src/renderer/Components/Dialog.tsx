import { ReactNode } from 'react';

// eslint-disable-next-line react/function-component-definition
const Dialog = ({ children }: { children: ReactNode }) => {
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none bg-black bg-opacity-30 focus:outline-none">
      <div className="relative w-auto mx-auto max-w-3xl bg-white rounded-2xl">
        {children}
      </div>
    </div>
  );
};

export default Dialog;
