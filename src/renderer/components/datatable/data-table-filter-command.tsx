import { CommandDialog, CommandInput } from '@/components/ui/command';
import { selectAppState, setFilter } from '@/store/Slices/appStateSlice';
import { isMacOs } from '@/utils';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';

// eslint-disable-next-line import/prefer-default-export
export function DataTableFilterCommand() {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();
  const appState = useSelector(selectAppState);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((old) => !old);
      }
      if (e.key === 'Enter') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-10 justify-start px-3 py-2 md:w-60"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="h-4 w-4 md:mr-2" aria-hidden="true" />
        <span className="text-muted-foreground hidden md:inline-flex">
          {appState.filter || 'Search projects...'}
        </span>
        <span className="sr-only">Search projects</span>
        <kbd className="bg-muted pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium opacity-100 md:flex">
          <abbr
            title={isMacOs() ? 'Command' : 'Control'}
            className="no-underline"
          >
            {isMacOs() ? '⌘' : 'Ctrl'}
          </abbr>
          K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search projects..."
          value={appState.filter}
          onValueChange={(value) => dispatch(setFilter(value))}
        />
      </CommandDialog>
    </>
  );
}
