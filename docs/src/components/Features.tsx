import { type ReactNode } from 'react';

export function Features({ children }: { children: ReactNode }) {
  return (
    <section className="text-center">
      <h2 className="text-4xl">Everything You Need</h2>
      <p className="text-xl">
        Legato simplifies your Ableton projects management
      </p>
      <div className="">{children}</div>
    </section>
  );
}

export function Feature({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6 text-green-600 dark:text-green-400 mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 12.75 6 6 9-13.5"
        />
      </svg>
      <p>{children}</p>
    </div>
  );
}
