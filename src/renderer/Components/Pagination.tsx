import { Table } from '@tanstack/react-table';
import { useState } from 'react';
import usePagination from '../hooks/usePagination';

function Pagination({ table, size }: { table: Table<unknown>; size: number }) {
  const [currentPage, setCurrentPage] = useState(
    table.getState().pagination.pageIndex + 1,
  );

  const paginationRange = usePagination({
    currentPage,
    totalCount: table.getPageCount(),
    siblingCount: 2,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    table.nextPage();
    setCurrentPage(currentPage + 1);
  };

  const onPrev = () => {
    table.previousPage();
    setCurrentPage(currentPage - 1);
  };

  const onPageChange = (page: number) => {
    table.setPageIndex(page - 1);
    setCurrentPage(page);
  };

  return (
    <div className="flex justify-center gap-2 w-fit ml-auto mr-auto rounded text-sm bg-gray-100 dark:bg-dark-900 mt-5 mb-8">
      <span className="flex pl-5 py-2">
        <button
          type="button"
          key="prev"
          className="uppercase px-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700"
          onClick={onPrev}
          disabled={!table.getCanPreviousPage()}
        >
          Prev
        </button>
        <span className="flex items-center gap-1">
          {paginationRange.map((pageNumber, i) => {
            if (pageNumber === -1) {
              return <span key={Number(i)}>&#8230;</span>;
            }
            return (
              <button
                type="button"
                key={Number(i)}
                className={`px-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 ${
                  pageNumber === currentPage
                    ? 'bg-gray-300 dark:bg-dark-600'
                    : ''
                }`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
        </span>
        <button
          type="button"
          key="next"
          className="uppercase px-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700"
          onClick={onNext}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </span>
      <select
        className="p-1 rounded bg-inherit uppercase text-xs hover:bg-gray-200 dark:hover:bg-dark-700 focus:outline-none"
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          if (e.target.value === 'All') {
            table.setPageSize(size);
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
  );
}

export default Pagination;
