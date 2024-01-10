import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// eslint-disable-next-line import/prefer-default-export
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMacOs() {
  if (typeof window === 'undefined') return false;

  return window.navigator.userAgent.includes('Mac');
}
