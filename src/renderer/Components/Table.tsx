import { Project } from '@prisma/client';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { useCallback, useRef, useState, useEffect } from 'react';
import abletonIcon from '../../../assets/ableton-icon.svg';
import Tooltip from './Tooltip';
import DebounceInput from './DebounceInput';
import EditableCell from './EditableCell';

// eslint-disable-next-line react/function-component-definition
const Table = ({ content }: { content: Project[] }) => {
  const [data, setData] = useState<Project[]>([]);

  useEffect(() => {
    if (content) {
      setData(content);
    }
  }, [content]);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleOpenInAbleton = (projectId: number) =>
    window.electron.ipcRenderer.sendMessage('open-project', projectId);

  const handleOpenInFinder = (projectId: number) =>
    window.electron.ipcRenderer.sendMessage('open-project-folder', projectId);

  const handleProjectUpdate = (project: Project) => {
    window.electron.ipcRenderer.sendMessage('update-project', project);
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: EditableCell,
    }),
    columnHelper.accessor('file', {
      header: 'File',
      cell: ({ row }) => (
        <Tooltip message={row.original.path}>
          <p
            className="cursor-pointer"
            onClick={() => handleOpenInFinder(row.original.id)}
          >
            {row.original.file}
          </p>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('bpm', {
      header: 'BPM',
      cell: (props) => <EditableCell {...props} type="number" />,
    }),
    columnHelper.accessor('open', {
      header: 'Open',
      cell: ({ row }) => (
        <Tooltip message={'Open in Ableton'}>
          <img
            src={abletonIcon}
            alt="Open ina Ableton"
            onClick={() => handleOpenInAbleton(row.original.id)}
            className="cursor-pointer"
            width={52}
          />
        </Tooltip>
      ),
    }),
  ];

  const useSkipper = () => {
    const shouldSkipRef = useRef(true);
    const shouldSkip = shouldSkipRef.current;

    // Wrap a function with this to skip a pagination reset temporarily
    const skip = useCallback(() => {
      shouldSkipRef.current = false;
    }, []);

    useEffect(() => {
      shouldSkipRef.current = true;
    });

    return [shouldSkip, skip] as const;
  };

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const table = useReactTable({
    columns,
    data,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex,
    meta: {
      updateData: (rowIndex: number, columnId: any, value: any) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              const updatedRow = {
                ...old[rowIndex]!,
                [columnId]: value,
              };
              handleProjectUpdate(updatedRow);
              return updatedRow;
            }
            return row;
          }),
        );
      },
    },
    debugTable: true,
  });

  return (
    <>
      <DebounceInput
        value={globalFilter}
        onChange={(value: any) =>
          table.getColumn('title')!.setFilterValue(value)
        }
        placeholder="Search..."
      />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          type="button"
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          type="button"
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          type="button"
          className="border rounded p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="border p-1 rounded w-16"
            min={1}
            max={table.getPageCount()}
          />
          <strong>of {table.getPageCount()}</strong>
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            if (e.target.value === 'All') {
              table.setPageSize(data.length);
              return;
            }
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 25, 50, 100, 'All'].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
export default Table;
