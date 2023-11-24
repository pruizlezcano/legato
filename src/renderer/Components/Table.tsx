/* eslint-disable react/no-unstable-nested-components */
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as AbletonLogo } from '../../../assets/ableton-icon.svg';
import Tooltip from './Tooltip';
import DebounceInput from './DebounceInput';
import EditableCell from './EditableCell';
import Pagination from './Pagination';

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
      cell: (props) => <EditableCell {...props} className="text-slate-950" />,
    }),
    columnHelper.accessor('bpm', {
      header: 'BPM',
      cell: (props) => <EditableCell {...props} type="number" />,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('genre', {
      header: 'Genre',
      cell: (props) => <EditableCell {...props} />,
    }),
    columnHelper.accessor('modifiedAt', {
      header: 'Modified',
      cell: ({ row }) => (
        <Tooltip message={row.original.modifiedAt.toString()}>
          <p>{row.original.modifiedAt.toLocaleDateString()}</p>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Added',
      cell: ({ row }) => (
        <Tooltip message={row.original.createdAt.toString()}>
          <p>{row.original.createdAt.toLocaleDateString()}</p>
        </Tooltip>
      ),
    }),
    columnHelper.accessor('path', {
      header: 'Path',
      cell: ({ row }) => <p>{row.original.path}</p>,
    }),
    columnHelper.accessor('open', {
      header: '',
      cell: ({ row }) => (
        <div className="flex flex-row gap-2">
          <Tooltip message="Open in Ableton">
            <button onClick={() => handleOpenInAbleton(row.original.id)}>
              <AbletonLogo className="fill-slate-700 w-7" />
            </button>
          </Tooltip>
          <Tooltip message="Open in Finder">
            <button
              type="button"
              onClick={() => handleOpenInFinder(row.original.id)}
            >
              <FontAwesomeIcon icon={faUpRightFromSquare} size="1x" />
            </button>
          </Tooltip>
        </div>
      ),
      enableGlobalFilter: false,
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

  // Hide the path column
  const hasToggledVisibility = useRef(false);

  useEffect(() => {
    if (!hasToggledVisibility.current) {
      table.getColumn('path')!.toggleVisibility(false);
      hasToggledVisibility.current = true;
    }
  }, [table]);

  return (
    <>
      <DebounceInput
        value={globalFilter}
        onChange={(value: any) => setGlobalFilter(value)}
        placeholder="Search..."
        className="flex-grow m-2 bg-inherit text-gray-700 focus:outline-0"
      />
      <table className="w-full table-auto md:table-fixed">
        <thead className="bg-gray-100 h-12 border border-gray-200 border-x-0 border-b-1">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left text-base font-normal text-slate-700 first-of-type:pl-14"
                >
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
            <tr
              key={row.id}
              className="h-12 border border-slate-200 border-x-0 border-y-1"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="text-left text-base font-normal text-slate-700 first-of-type:pl-14"
                >
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
      <Pagination table={table} size={data.length} />
    </>
  );
};
export default Table;
