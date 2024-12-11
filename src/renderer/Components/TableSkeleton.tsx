/* eslint-disable react/no-unstable-nested-components */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Skeleton } from '@/Components/ui/skeleton';

function SkeletonCell({ width }: { width: string }) {
  return (
    <div className="h-9 py-2">
      <Skeleton className={`h-5 w-[${width}px]`} />
    </div>
  );
}

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between px-2 mx-6 mt-1">
      <div className="flex-1 text-sm text-muted-foreground">
        <Skeleton className="h-5 w-[190px]" />
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <Skeleton className="h-5 w-[500px]" />
      </div>
    </div>
  );
}

export default function TableSkeleton() {
  const columnHelper = createColumnHelper<{}>();

  const data = Array(10).fill({});
  const columns = [
    columnHelper.display({
      id: '1',
      header: () => <Skeleton className="h-5 w-[90px]" />,
      cell: () => <SkeletonCell width="200" />,
    }),
    columnHelper.display({
      id: '2',
      header: () => <Skeleton className="h-5 w-[90px]" />,
      cell: () => <SkeletonCell width="120" />,
    }),
    columnHelper.display({
      id: '3',
      header: () => <Skeleton className="h-5 w-[90px]" />,
      cell: () => <SkeletonCell width="150" />,
    }),
    columnHelper.display({
      id: '4',
      header: () => <Skeleton className="h-5 w-[60px]" />,
      cell: () => <SkeletonCell width="100" />,
    }),
    columnHelper.display({
      id: '5',
      header: () => <Skeleton className="h-5 w-[70px]" />,
      cell: () => <SkeletonCell width="100" />,
    }),
    columnHelper.display({
      id: '6',
      header: () => <Skeleton className="h-5 w-[90px]" />,
      cell: () => <SkeletonCell width="100" />,
    }),
  ];
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    // Need to provide filterFns to avoid error
    filterFns: {
      textFilter: () => true,
      numberFilter: () => true,
      arrayFilter: () => true,
      booleanFilter: () => true,
      notNullFilter: () => true,
    },
  });
  return (
    <>
      <div className="mx-6 my-2 w-full rounded-md border">
        <Table>
          <TableHeader className="bg-muted/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-foo">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-20 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="relative mb-3 w-full">
        <PaginationSkeleton />
      </div>
    </>
  );
}
