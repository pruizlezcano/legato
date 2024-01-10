import * as React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { CommandDialog, CommandInput } from '@/Components/ui/command';
import { isMacOs } from '@/utils';
import { Button } from '../ui/button';

// eslint-disable-next-line import/prefer-default-export
export function DataTableFilterCommand({
  value,
  onEnter,
}: {
  value: string;
  onEnter: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState(value);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((old) => !old);
      }
      if (e.key === 'Enter') {
        setOpen(false);
        onEnter(search);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [search, onEnter]);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-10 md:w-60 justify-start px-3 py-2"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="h-4 w-4 md:mr-2" aria-hidden="true" />
        <span className="hidden md:inline-flex text-muted-foreground">
          {value || 'Search projects...'}
        </span>
        <span className="sr-only">Search projects</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 hidden md:flex">
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
          value={search}
          onValueChange={setSearch}
        />
      </CommandDialog>
    </>
  );
}
