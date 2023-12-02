/* eslint-disable react/no-unstable-nested-components */
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpRightFromSquare,
  faSortUp,
  faSortDown,
  faCircleInfo,
  faSort,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';
import { ReactComponent as AbletonLogo } from '../../../assets/ableton-icon.svg';
import DebounceInput from './DebounceInput';
import EditableCell from './EditableCell';
import Pagination from './Pagination';
import { Project } from '../../db/entity/Project';
import ProjectView from '../Views/ProjectView';
import {
  handleOpenInAbleton,
  handleOpenInFinder,
  handleProjectUpdate,
} from '../hooks/handlers';

// eslint-disable-next-line react/function-component-definition
const Table = ({ content }: { content: Project[] }) => {
  const [data, setData] = useState([]);
  const [showProject, setshowProject] = useState(false);
  const [project, setProject] = useState({} as Project);

  useEffect(() => {
    if (content) {
      setData(content);
    }
  }, [content]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (props) => (
        <EditableCell
          {...props}
          className="text-slate-950 dark:text-white dark:bg-dark"
        />
      ),
    }),
    columnHelper.accessor('bpm', {
      header: 'BPM',
      cell: (props) => (
        <EditableCell {...props} type="number" className="dark:bg-dark" />
      ),
      enableGlobalFilter: false,
      size: 30,
    }),
    columnHelper.accessor('genre', {
      header: 'Genre',
      cell: (props) => <EditableCell {...props} className="dark:bg-dark" />,
      enableSorting: false,
    }),
    columnHelper.accessor('modifiedAt', {
      header: 'Modified',
      cell: ({ row }) => <p>{row.original.modifiedAt.toLocaleDateString()}</p>,
      size: 50,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Added',
      cell: ({ row }) => <p>{row.original.createdAt.toLocaleDateString()}</p>,
      size: 50,
    }),
    columnHelper.accessor('path', {
      header: 'Path',
      cell: ({ row }) => <p>{row.original.path}</p>,
    }),
    columnHelper.accessor('open', {
      header: '',
      cell: ({ row }) => (
        <div className="flex flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              setProject(row.original);
              setshowProject(true);
            }}
            data-tooltip-id="project-info"
          >
            <FontAwesomeIcon icon={faCircleInfo} size="1x" />
          </button>
          <Tooltip
            id="project-info"
            content="Project details"
            place="bottom"
            noArrow
          />
          <button
            type="button"
            onClick={() => handleOpenInFinder(row.original.id)}
            data-tooltip-id="open-project-folder"
          >
            <FontAwesomeIcon icon={faUpRightFromSquare} size="1x" />
          </button>
          <Tooltip
            id="open-project-folder"
            content="Open folder"
            place="bottom"
            noArrow
          />
          <button
            onClick={() => handleOpenInAbleton(row.original.id)}
            data-tooltip-id="ableton-logo"
          >
            <AbletonLogo className="w-7 fill-slate-700 dark:fill-text-dark" />
          </button>
          <Tooltip
            id="ableton-logo"
            content="Open in Ableton"
            place="bottom"
            disableStyleInjection
            noArrow
          />
        </div>
      ),
      enableGlobalFilter: false,
      size: 40,
    }),
  ];

  const useSkipper = () => {
    const shouldSkipRef = useRef(true);
    const shouldSkip = shouldSkipRef.current;

    const skip = useCallback(() => {
      shouldSkipRef.current = false;
    }, []);

    useEffect(() => {
      shouldSkipRef.current = true;
    });

    return [shouldSkip, skip] as const;
  };

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
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
    // debugTable: true,
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
        className="flex-grow m-2 bg-inherit text-gray-700 focus:outline-0 dark:text-text-dark"
      />
      <table className="w-full table-auto md:table-fixed">
        <thead className="bg-gray-100 dark:bg-dark-900 h-12 border border-gray-200 dark:border-black border-x-0 border-b-1">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left text-base font-normal text-slate-700 dark:text-text-dark first-of-type:pl-14 last-of-type:pr-12"
                  style={{ width: header.column.columnDef.size }}
                >
                  {header.isPlaceholder ? null : (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : ''
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: (
                          <FontAwesomeIcon icon={faSortUp} className="ml-2" />
                        ),
                        desc: (
                          <FontAwesomeIcon icon={faSortDown} className="ml-2" />
                        ),
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
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
              className="h-12 border border-slate-200 dark:border-dark-800 border-x-0 border-y-1"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="text-left text-base font-normal text-slate-700 dark:text-text-dark first-of-type:pl-14"
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
      {showProject ? (
        <ProjectView project={project} onClose={() => setshowProject(false)} />
      ) : null}
    </>
  );
};
export default Table;
