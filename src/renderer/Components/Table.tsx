import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';
import abletonIcon from '../../../assets/ableton-icon.svg';
import Tooltip from './Tooltip';
import DebounceInput from './DebounceInput';

const Table = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const handleOpenInAbleton = (projectId: number) =>
    window.electron.ipcRenderer.sendMessage('open-project', projectId);

  const handleOpenInFinder = (projectId: number) =>
    window.electron.ipcRenderer.sendMessage('open-project-folder', projectId);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('title', { header: 'Title' }),
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
    columnHelper.accessor('bpm', { header: 'BPM' }),
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
    debugTable: true,
  });

  return (
    <>
      <DebounceInput
        value={globalFilter}
        onChange={(value) => table.getColumn('title').setFilterValue(value)}
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
          className="border rounded p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
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
