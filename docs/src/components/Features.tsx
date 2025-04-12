import { type ReactNode } from 'react';

export function Features({ children }: { children: ReactNode }) {
  return (
    <section className="pt-8 px-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </section>
  );
}

interface FeatureProps {
  children: ReactNode;
  icon: string;
  title: string;
}

export function Feature({ children, icon, title }: FeatureProps) {
  return (
    <div className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-left text-lg text-gray-600 dark:text-gray-300">
        {children}
      </p>
    </div>
  );
}
