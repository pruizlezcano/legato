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
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  StarIcon,
  StarOffIcon,
  EllipsisVerticalIcon,
  RocketIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  FolderIcon,
  PlayIcon,
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  saveProject,
  selectProjects,
  selectProjectById,
} from '@/store/Slices/projectsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SelectItem } from '@/components/ui/select';
import { useGlobalAudioPlayer } from 'react-use-audio-player';
import {
  selectAppState,
  setNowPlaying,
  setShowAudioPlayer,
} from '@/store/Slices/appStateSlice';
import {
  selectSettings,
  updateSettings,
  Settings,
} from '@/store/Slices/settingsSlice';
import { capitalize } from '@/utils';
import EditableCell from './EditableCell';
import { Project } from '../../db/entity';
import ProjectView from '../views/ProjectView';
import { handleOpenInAbleton, handleOpenInFinder } from '../hooks/handlers';
import EditableTagCell from './EditableTagCell';
import { DataTableColumnHeader } from './datatable/data-table-column-header';
import { DataTablePagination } from './datatable/data-table-pagination';
import EditableSelectCell from './EditableSelectCell';
import { DataTableViewOptions } from './datatable/data-table-column-toggle';
import { Progress, progressColors } from '../../types/Progress';
import TableSkeleton from './TableSkeleton';

declare module '@tanstack/table-core' {
  interface FilterFns {
    textFilter: FilterFn<unknown>;
    numberFilter: FilterFn<unknown>;
    arrayFilter: FilterFn<unknown>;
    booleanFilter: FilterFn<unknown>;
    notNullFilter: FilterFn<unknown>;
  }
}

// eslint-disable-next-line react/function-component-definition
const ProjectsTable = () => {
  const dispatch = useDispatch();
  const data: Project[] = useSelector(selectProjects);
  const [showProject, setshowProject] = useState(false);
  const appState = useSelector(selectAppState);
  const settings = useSelector(selectSettings) as Settings;

  const [filterQuery, setFilterQuery] = useState(appState.filter);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isTableLoading, setIsTableLoading] = useState(true);

  const { load } = useGlobalAudioPlayer();

  const columnHelper = createColumnHelper();

  const handleFavorite = (project: Project) => {
    dispatch(saveProject({ ...project, favorite: !project.favorite }));
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
      size: 180,
      filterFn: 'textFilter',
      id: 'title',
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
      size: 10,
      filterFn: 'numberFilter',
      id: 'bpm',
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
      size: 105,
      filterFn: 'textFilter',
      id: 'scale',
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
      size: 110,
      enableGlobalFilter: false,
      filterFn: 'textFilter',
      id: 'genre',
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
      id: 'tags',
      enableSorting: true,
      size: 250,
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
            {Object.values(Progress).map((status: Progress) => {
              return (
                <SelectItem key={status} value={status}>
                  <span className={`flex flex-row ${progressColors[status]}`}>
                    {capitalize(status.replace('-', ' '))}
                  </span>
                </SelectItem>
              );
            })}
          </EditableSelectCell>
        );
      },
      enableSorting: true,
      enableGlobalFilter: false,
      size: 50,
      filterFn: 'textFilter',
      id: 'progress',
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
      size: 0,
      id: 'modified',
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
      id: 'path',
    }) as ColumnDef<Project>,
    columnHelper.accessor('daw', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DAW" />
      ),
      cell: ({ row }) => {
        const project = row.original as Project;
        return <p>{project.daw}</p>;
      },
      enableGlobalFilter: false,
      filterFn: 'textFilter',
      id: 'daw',
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
                    <StarIcon className="h-5 w-5" />
                  ) : (
                    <StarOffIcon className="h-5 w-5" />
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
      filterFn: 'booleanFilter',
      size: 0,
      id: 'favorite',
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
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeOffIcon className="h-5 w-5" />
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
      filterFn: 'booleanFilter',
      size: 0,
      id: 'hidden',
    }) as ColumnDef<Project>,
    columnHelper.accessor('audioFile', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Audio" />
      ),
      cell: ({ row }) => {
        const project = row.original as Project;
        return (
          <button
            type="button"
            onClick={() => {
              load(`local://${project.audioFile!}`, { autoplay: true });
              dispatch(setShowAudioPlayer(true));
            }}
            disabled={!project.audioFile}
          >
            <PlayIcon
              className={`h-5 w-5 ${
                !project.audioFile && 'text-muted-foreground/70'
              }`}
            />
          </button>
        );
      },
      id: 'audio',
      enableGlobalFilter: false,
      filterFn: 'notNullFilter',
      size: 0,
    }) as ColumnDef<Project>,
    columnHelper.accessor('controls', {
      header: ({ table }) => <DataTableViewOptions table={table} />,
      cell: ({ row }) => {
        const project = row.original as Project;
        return (
          <div className="flex justify-end mr-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVerticalIcon className="text-muted-foreground h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(selectProjectById(project.id));
                    setshowProject(true);
                  }}
                >
                  <InfoIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  Project details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    handleOpenInFinder(project.id);
                  }}
                >
                  <FolderIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  Open in Finder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleOpenInAbleton(project.id);
                  }}
                >
                  <RocketIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  <p>Open in Ableton</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    load(`local://${project.audioFile!}`, { autoplay: true });
                    dispatch(setShowAudioPlayer(true));
                    dispatch(setNowPlaying(project.title));
                  }}
                  disabled={!project.audioFile}
                >
                  <PlayIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  <p>Play audio</p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleFavorite(project);
                  }}
                >
                  {project.favorite ? (
                    <StarIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  ) : (
                    <StarOffIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  )}
                  <p>{project.favorite ? 'Remove favorite' : 'Add favorite'}</p>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleHide(project);
                  }}
                >
                  {project.hidden ? (
                    <EyeIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  ) : (
                    <EyeOffIcon className="text-muted-foreground/70 mr-2 h-4 w-4" />
                  )}
                  <p>{project.hidden ? 'Unhide' : 'Hide'}</p>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableGlobalFilter: false,
      size: 0,
      enableHiding: false,
      enableColumnFilter: false,
      id: 'controls',
    }) as ColumnDef<Project>,
  ];

  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    dispatch(
      updateSettings({
        sorting: sorting[0],
      }),
    );
  }, [sorting, dispatch]);

  const table = useReactTable({
    columns,
    data,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: (state) => {
      setGlobalFilter(state);
      table.resetPageIndex();
    },
    onSortingChange: (state) => {
      setSorting(state);
      table.resetPageIndex();
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
    meta: {
      updateData: (rowIndex: number, columnId: any, value: any) => {
        const column = table.getColumn(columnId);
        // @ts-ignore
        const accessorKey = column?.columnDef.accessorKey;
        dispatch(saveProject({ ...data[rowIndex]!, [accessorKey]: value }));
      },
    },
    filterFns: {
      textFilter: (row, columnId, filterValue: string[]) => {
        const value: string = row.getValue(columnId);
        if (value === undefined || value === null) return false;
        return filterValue.some((filter) =>
          value.toLowerCase().includes(filter.toLowerCase()),
        );
      },
      numberFilter: (row, columnId, filterValue: string[]) => {
        const value: number = row.getValue(columnId);
        if (value === undefined) return false;
        for (const filter of filterValue) {
          if (/\d+-\d+/.test(filter)) {
            // Number interval: number:120-150
            const [min, max] = filter.split('-');
            if (value >= Number(min) && value <= Number(max)) {
              return true;
            }
          }
          if (/>\d+/.test(filter)) {
            // Greater than: number:>120
            const threshold = Number(filter.slice(1)); // Remove '>'
            if (value > threshold) {
              return true;
            }
          }
          if (/<\d+/.test(filter)) {
            // Less than: number:<120
            const threshold = Number(filter.slice(1)); // Remove '<'
            if (value < threshold) {
              return true;
            }
          }
          // Exact number: number:123
          if (value === Number(filter)) {
            return true;
          }
        }
        return false;
      },
      arrayFilter: (row, columnId, filterValue: string[]) => {
        const value: string[] = row.getValue(columnId);
        if (value === undefined) return false;
        const arrayValues = value.map((tag) => tag.toLowerCase()).join(' ');
        return filterValue.some((filter) =>
          arrayValues.includes(filter.toLowerCase()),
        );
      },
      booleanFilter: (row, columnId, filterValue: string[]) => {
        const value: boolean = row.getValue(columnId);
        if (value === undefined) return false;
        return value === (filterValue[0] === 'true');
      },
      notNullFilter: (row, columnId, filterValue: string[]) => {
        const value = row.getValue(columnId);
        if (filterValue[0] === 'true')
          return value !== undefined && value !== null;
        return value === undefined || value === null;
      },
    },
    // debugTable: true,
  });

  // Initial table state
  useEffect(() => {
    table.setPageSize(settings.pageSize);
    setSorting([settings.sorting]);
    const columnsIds = columns.map((column) => column.id);
    for (const id of columnsIds) {
      const column = table.getColumn(id!);
      // eslint-disable-next-line no-continue
      if (!column) continue;
      if (settings.displayedColumns.includes(id!)) {
        column.toggleVisibility(true);
      } else {
        column.toggleVisibility(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = useCallback(
    (query: string) => {
      if (query === filterQuery) return;

      setFilterQuery(query);
      // Parse the general search term
      const regex = /(\w+):(\w+|"[^"]*")/g;
      const generalSearch = query.replace(regex, '').trim();

      // Parse additional filters
      let match;
      const filters: { [key: string]: string[] } = {};

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
        if (!filters[field]) filters[field] = [];
        filters[field] = [
          ...filters[field],
          value.replace(/^"|"$/g, '').trim(),
        ];
        const column = table.getColumn(field);
        if (column) column.setFilterValue(filters[field]);
      }

      table.setGlobalFilter(generalSearch);
    },
    [filterQuery, table],
  );

  useEffect(() => {
    setFilter(appState.filter);
    setIsTableLoading(false);
  }, [setFilter, appState.filter]);

  return isTableLoading ? (
    <TableSkeleton />
  ) : (
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
        <DataTablePagination table={table} />
      </div>
      {showProject && (
        <ProjectView onClose={() => setshowProject(false)} open={showProject} />
      )}
    </>
  );
};
export default ProjectsTable;
