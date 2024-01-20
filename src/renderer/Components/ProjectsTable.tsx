/* eslint-disable no-restricted-syntax */
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
  FilterFn,
} from '@tanstack/react-table';
import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  EllipsisHorizontalIcon,
  RocketLaunchIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  saveProject,
  selectProjects,
  selectProjectById,
} from '@/store/Slices/projectsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SelectItem } from '@/Components/ui/select';
import EditableCell from './EditableCell';
import { Project } from '../../db/entity';
import ProjectView from '../Views/ProjectView';
import { handleOpenInAbleton, handleOpenInFinder } from '../hooks/handlers';
import EditableTagCell from './EditableTagCell';
import { DataTableColumnHeader } from './datatable/data-table-column-header';
import { DataTablePagination } from './datatable/data-table-pagination';
import EditableSelectCell from './EditableSelectCell';

declare module '@tanstack/table-core' {
  interface FilterFns {
    numberFilter: FilterFn<unknown>;
    arrayFilter: FilterFn<unknown>;
    booleanFn: FilterFn<unknown>;
  }
}

// eslint-disable-next-line react/function-component-definition
const ProjectsTable = ({ filter }: { filter: string }) => {
  const dispatch = useDispatch();
  const data: Project[] = useSelector(selectProjects);
  const [showProject, setshowProject] = useState(false);

  const [filterQuery, setFilterQuery] = useState(filter);
  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper();

  const handleFavorite = (project: Project) => {
    dispatch(saveProject({ ...project, hidden: !project.favorite }));
  };

  const handleHide = (project: Project) => {
    dispatch(saveProject({ ...project, hidden: !project.hidden }));
  };

  const columns: ColumnDef<Project>[] = [
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row, column, table }) => {
        const project = row.original as Project;
        return (
          <EditableCell
            value={project.title}
            row={{ index: row.index }}
            column={{ id: column.id }}
            table={table}
          />
        );
      },
      size: 3000,
    }) as ColumnDef<Project>,
    columnHelper.accessor('bpm', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="BPM" />
      ),
      cell: ({ row, column, table }) => {
        const project = row.original as Project;
        return (
          <EditableCell
            value={project.bpm}
            row={{ index: row.index }}
            column={{ id: column.id }}
            table={table}
            type="number"
            placeholder="Add BPM"
          />
        );
      },
      enableGlobalFilter: false,
      size: 30,
      filterFn: 'numberFilter',
    }) as ColumnDef<Project>,
    columnHelper.accessor('scale', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Scale" />
      ),
      cell: ({ row, column, table }) => {
        const project = row.original as Project;
        return (
          <EditableCell
            value={project.scale ?? ''}
            row={{ index: row.index }}
            column={{ id: column.id }}
            table={table}
            placeholder="Add Scale"
          />
        );
      },
      enableGlobalFilter: false,
      size: 2000,
    }) as ColumnDef<Project>,
    columnHelper.accessor('genre', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Genre" />
      ),
      cell: ({ row, column, table }) => {
        const project = row.original as Project;
        return (
          <EditableCell
            value={project.genre ?? ''}
            row={{ index: row.index }}
            column={{ id: column.id }}
            table={table}
            placeholder="Add Genre"
          />
        );
      },
      size: 4700,
      enableGlobalFilter: false,
    }) as ColumnDef<Project>,
    columnHelper.accessor('tagNames', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row, column, table }) => {
        const project = row.original as Project;
        return (
          <EditableTagCell
            value={project.tagNames ?? []}
            row={{ index: row.index }}
            column={{ id: column.id }}
            table={table}
          />
        );
      },
      enableSorting: true,
      size: 10000,
      enableGlobalFilter: false,
      filterFn: 'arrayFilter',
    }) as ColumnDef<Project>,
    columnHelper.accessor('progress', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progress" />
      ),
      cell: ({ row, column, table }) => {
        const project = row.original as Project;
        return (
          <EditableSelectCell
            value={project.progress}
            row={{ index: row.index }}
            column={{ id: column.id }}
            table={table}
            className="w-32"
          >
            <SelectItem value="todo">
              <span className="flex flex-row">
                <ArrowRightCircleIcon className="h-4 w-4 mr-1 mt-0.5" />
                To Do
              </span>
            </SelectItem>
            <SelectItem value="inProgress">
              <span className="flex flex-row">
                <ClockIcon className="h-4 w-4 mr-1 mt-0.5" />
                In Progress
              </span>
            </SelectItem>
            <SelectItem value="Finished">
              <span className="flex flex-row">
                <CheckCircleIcon className="h-4 w-4 mr-1 mt-0.5" />
                Finished
              </span>
            </SelectItem>
          </EditableSelectCell>
        );
      },
      enableSorting: true,
      enableGlobalFilter: false,
    }) as ColumnDef<Project>,
    columnHelper.accessor('modifiedAt', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Modified" />
      ),
      cell: ({ row }) => {
        const project = row.original as Project;
        return (
          <p className="ml-3">{project.modifiedAt.toLocaleDateString()}</p>
        );
      },
      size: 50,
      enableGlobalFilter: false,
    }) as ColumnDef<Project>,
    columnHelper.accessor('path', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Path" />
      ),
      cell: ({ row }) => {
        const project = row.original as Project;
        return <p>{project.path}</p>;
      },
      enableGlobalFilter: false,
    }) as ColumnDef<Project>,
    columnHelper.accessor('favorite', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Favorite" />
      ),
      cell: ({ row }) => {
        const project = row.original as Project;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => handleFavorite(project)}>
                  {project.favorite ? (
                    <StarSolidIcon className="w-5 h-5" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {project.favorite
                    ? 'Remove from favorites'
                    : 'Add to favorites'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      enableGlobalFilter: false,
      filterFn: 'booleanFn',
      size: 0,
    }) as ColumnDef<Project>,
    columnHelper.accessor('hidden', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hidden" />
      ),
      cell: ({ row }) => {
        const project = row.original as Project;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => handleHide(project)}>
                  {project.hidden ? (
                    <EyeIcon className="w-5 h-5" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{project.hidden ? 'Unhide' : 'Hide'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      enableGlobalFilter: false,
      filterFn: 'booleanFn',
      size: 0,
    }) as ColumnDef<Project>,
    columnHelper.accessor('controls', {
      header: '',
      cell: ({ row }) => {
        const project = row.original as Project;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisHorizontalIcon className="h-6 w-6 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  dispatch(selectProjectById(project.id));
                  setshowProject(true);
                }}
              >
                <>
                  <InformationCircleIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                  Project details
                </>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  handleOpenInFinder(project.id);
                }}
              >
                <FolderIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                Open in Finder
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleOpenInAbleton(project.id);
                }}
              >
                <RocketLaunchIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                <p>Open in Ableton</p>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  handleFavorite(project);
                }}
              >
                {project.favorite ? (
                  <StarSolidIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                ) : (
                  <StarIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                )}
                <p>{project.favorite ? 'Remove favorite' : 'Add favorite'}</p>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  handleHide(project);
                }}
              >
                {project.hidden ? (
                  <EyeIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                ) : (
                  <EyeSlashIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                )}
                <p>{project.hidden ? 'Unhide' : 'Hide'}</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableGlobalFilter: false,
      size: 0,
      enableHiding: false,
    }) as ColumnDef<Project>,
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
        dispatch(saveProject({ ...data[rowIndex]!, [columnId]: value }));
      },
    },
    filterFns: {
      numberFilter: (row, columnId, filterValue) => {
        const value: number = row.getValue(columnId);
        if (value === undefined) return true;
        if (/\d+-\d+/.test(filterValue)) {
          // Number interval: number:120-150
          const [min, max] = filterValue.split('-');
          return value >= Number(min) && value <= Number(max);
        }
        if (/>\d+/.test(filterValue)) {
          // Greater than: number:>120
          const threshold = Number(filterValue.slice(1)); // Remove '>'
          return value > threshold;
        }
        if (/<\d+/.test(filterValue)) {
          // Less than: number:<120
          const threshold = Number(filterValue.slice(1)); // Remove '<'
          return value < threshold;
        }
        // Exact number: number:123
        return value === Number(filterValue);
      },
      arrayFilter: (row, columnId, filterValue) => {
        const value: string[] = row.getValue(columnId);
        if (value === undefined) return true;
        const tags = value.map((tag) => tag.toLowerCase()).join(' ');
        return tags.includes(filterValue.toLowerCase());
      },
      booleanFn: (row, columnId, filterValue) => {
        const value: boolean = row.getValue(columnId);
        if (value === undefined) return true;
        return value === (filterValue === 'true');
      },
    },
    // debugTable: true,
  });

  // Initial table state
  const hasToggledVisibility = useRef(false);
  useEffect(() => {
    if (!hasToggledVisibility.current) {
      table.getColumn('path')!.toggleVisibility(false);
      table.getColumn('favorite')!.toggleVisibility(false);
      table.getColumn('hidden')!.toggleVisibility(false);
      table.getColumn('hidden')!.setFilterValue('false');
    }
  }, [table]);

  const setFilter = (query: string) => {
    if (query === filterQuery) return;

    setFilterQuery(query);
    // Parse the general search term
    const generalSearch = query.replace(/(\w+):([^" ]+|"[^"]*")/g, '').trim();

    // Parse additional filters
    const regex = /(\w+):([^" ]+|"[^"]*")/g;
    let match;
    const filters: { [key: string]: string } = {};

    // Reset all filters
    for (const column of table.getAllColumns()) {
      column.setFilterValue('');
    }
    table.getColumn('hidden')!.setFilterValue('false');

    // Set new filters
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(query)) !== null) {
      // eslint-disable-next-line prefer-const
      let [, field, value] = match;
      if (field === 'tags') field = 'tagNames';
      filters[field] = value;
      const column = table.getColumn(field);
      if (column) column.setFilterValue(filters[field]);
    }

    table.setGlobalFilter(generalSearch);
  };

  useEffect(() => {
    setFilter(filter);
  });

  return (
    <>
      <div className="rounded-md border w-full mx-6 my-2">
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
      <div className="relative w-full mb-3">
        {/* <Pagination table={table} size={data.length} /> */}
        <DataTablePagination table={table} />
      </div>
      {showProject && (
        <ProjectView onClose={() => setshowProject(false)} open={showProject} />
      )}
    </>
  );
};
export default ProjectsTable;
