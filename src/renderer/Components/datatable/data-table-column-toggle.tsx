import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Table } from '@tanstack/react-table';

import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/Components/ui/dropdown-menu';

import { useDispatch, useSelector } from 'react-redux';
import {
  updateSettings,
  selectSettings,
  Settings,
} from '@/store/Slices/settingsSlice';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

// eslint-disable-next-line import/prefer-default-export
export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings) as Settings;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 flex bg-inherit"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4 lg:mr-3" />
          <span className="hidden lg:flex">View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => {
                  column.toggleVisibility(!!value);
                  let displayedColumns = [...settings.displayedColumns];

                  if (value) {
                    displayedColumns.push(column.id);
                  } else {
                    displayedColumns = displayedColumns.filter(
                      (col) => col !== column.id,
                    );
                  }
                  dispatch(
                    updateSettings({
                      displayedColumns,
                    }),
                  );
                }}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
