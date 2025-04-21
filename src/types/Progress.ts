export enum Progress {
  TO_DO = 'to-do',
  IN_PROGRESS = 'in-progress',
  RECORDING = 'recording',
  MIXING = 'mixing',
  MASTERING = 'mastering',
  NEEDS_REVISION = 'needs-revision',
  FINAL_TOUCHES = 'final-touches',
  FINISHED = 'finished',
  ON_HOLD = 'on-hold',
  ABANDONED = 'abandoned',
}

export const progressColors: Record<Progress, string> = {
  [Progress.TO_DO]: 'text-gray-600 dark:text-gray-300',
  [Progress.IN_PROGRESS]: 'text-blue-600 dark:text-blue-400',
  [Progress.RECORDING]: 'text-blue-700 dark:text-blue-500',
  [Progress.MIXING]: 'text-orange-500 dark:text-orange-300',
  [Progress.MASTERING]: 'text-orange-600 dark:text-orange-400',
  [Progress.NEEDS_REVISION]: 'text-orange-700 dark:text-orange-500',
  [Progress.FINAL_TOUCHES]: 'text-orange-800 dark:text-orange-600',
  [Progress.FINISHED]: 'text-green-600 dark:text-green-500',
  [Progress.ON_HOLD]: 'text-gray-500 dark:text-gray-400',
  [Progress.ABANDONED]: 'text-red-600 dark:text-red-500',
};
