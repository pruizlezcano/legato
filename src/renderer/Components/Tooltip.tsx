import { ReactNode } from 'react';

export default function Tooltip({
  children,
  message,
}: {
  children: ReactNode;
  message: string;
}) {
  return (
    <div className="group relative flex">
      {children}
      <span className="absolute top-10 scale-0 transition-all rounded bg-gray-800 bg-opacity-100 p-2 text-xs text-white group-hover:scale-100">
        {message}
      </span>
    </div>
  );
}
