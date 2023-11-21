import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import abletonIcon from '../../../assets/ableton-icon.svg';
import Tooltip from './Tooltip';

const Table = ({ data }) => {
  const handleOpenInAbleton = (projectId) =>
    window.electron.ipcRenderer.sendMessage('open-project', projectId);

  const handleOpenInFinder = (projectId) =>
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
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
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
  );
};
export default Table;
