/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/jsx-props-no-spreading */
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
  ColumnDef,
} from '@tanstack/react-table';
import { useCallback, useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpRightFromSquare,
  faSortUp,
  faSortDown,
  faCircleInfo,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
import DebounceInput from './DebounceInput';
import EditableCell from './EditableCell';
import Pagination from './Pagination';
import { Project } from '../../db/entity';
import ProjectView from '../Views/ProjectView';
import {
  handleList,
  handleOpenInAbleton,
  handleOpenInFinder,
  handleProjectUpdate,
} from '../hooks/handlers';
import EditableTagCell from './EditableTagCell';
import { Dropdown, DropdownOption, DropdownSeparator } from './Dropdown';

// eslint-disable-next-line react/function-component-definition
const Table = ({ content }: { content: Project[] }) => {
  const [data, setData] = useState<Project[]>([]);
  const [showProject, setshowProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState({} as Project);

  useEffect(() => {
    if (content) {
      setData(content);
    }
  }, [content]);

  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper();
  const columns: ColumnDef<unknown, any>[] = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (props) => (
        <EditableCell
          {...props}
          className="text-slate-950 dark:text-white dark:bg-dark"
        />
      ),
    }) as ColumnDef<unknown, any>,
    columnHelper.accessor('bpm', {
      header: 'BPM',
      cell: (props) => (
        <EditableCell {...props} type="number" className="dark:bg-dark" />
      ),
      enableGlobalFilter: false,
      size: 30,
    }) as ColumnDef<unknown, any>,
    columnHelper.accessor('genre', {
      header: 'Genre',
      cell: (props) => (
        <EditableCell
          {...props}
          className="dark:bg-dark"
          placeholder="Enter a genre..."
        />
      ),
      enableSorting: false,
      size: 100,
    }) as ColumnDef<unknown, any>,
    columnHelper.accessor('tagNames', {
      header: 'Tags',
      cell: ({ row, column, table }) => {
        const project = row.original as Project;
        return (
          <EditableTagCell
            getValue={() => project.tagNames ?? []}
            row={{ index: row.index }}
            column={{ id: column.id }}
            table={table}
          />
        );
      },
      enableSorting: true,
      size: 100,
    }) as ColumnDef<unknown, any>,
    columnHelper.accessor('modifiedAt', {
      header: 'Modified',
      cell: ({ row }) => {
        const project = row.original as Project;
        return <p>{project.modifiedAt.toLocaleDateString()}</p>;
      },
      size: 50,
    }) as ColumnDef<unknown, any>,
    columnHelper.accessor('createdAt', {
      header: 'Added',
      cell: ({ row }) => {
        const project = row.original as Project;
        return <p>{project.createdAt.toLocaleDateString()}</p>;
      },
      size: 50,
    }) as ColumnDef<unknown, any>,
    columnHelper.accessor('path', {
      header: 'Path',
      cell: ({ row }) => {
        const project = row.original as Project;
        return <p>{project.path}</p>;
      },
    }) as ColumnDef<unknown, any>,
    columnHelper.accessor('open', {
      header: '',
      cell: ({ row }) => {
        const project = row.original as Project;
        return (
          <Dropdown>
            <DropdownOption
              onClick={() => {
                setSelectedProject(project);
                setshowProject(true);
              }}
              className="flex flex-row items-center gap-x-2"
            >
              <FontAwesomeIcon icon={faCircleInfo} size="1x" />
              Project details
            </DropdownOption>
            <DropdownSeparator />
            <DropdownOption
              onClick={() => {
                handleOpenInFinder(project.id);
              }}
              className="flex flex-row items-center gap-x-2"
            >
              <FontAwesomeIcon icon={faUpRightFromSquare} size="1x" />
              Open in Finder
            </DropdownOption>
            <DropdownOption
              onClick={() => {
                handleOpenInAbleton(project.id);
              }}
              className="flex flex-row items-center gap-x-2"
            >
              <FontAwesomeIcon icon={faRocket} size="1x" />
              Open in Ableton
            </DropdownOption>
            <DropdownSeparator />
          </Dropdown>
        );
      },
      enableGlobalFilter: false,
      size: 0,
    }) as ColumnDef<unknown, any>,
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
        <ProjectView
          project={selectedProject}
          onClose={() => {
            setshowProject(false);
            handleList();
          }}
        />
      ) : null}
    </>
  );
};
export default Table;
