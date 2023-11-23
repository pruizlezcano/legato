import { ReactNode } from 'react';

// eslint-disable-next-line react/function-component-definition
const Dialog = ({ children }: { children: ReactNode }) => {
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
      <div className="relative w-auto my-6 mx-auto max-w-3xl">{children}</div>
    </div>
  );
};

export default Dialog;
