import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'NO RECORDS FOUND',
}: DataTableProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <div className="nb-loading-box" role="status">
        LOADING RECORDS...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="nb-empty-box">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="nb-table-container">
      <table className="nb-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)}>
              {columns.map((col, colIndex) => {
                const cellContent =
                  typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor] as React.ReactNode);

                return (
                  <td key={colIndex} className={col.className}>
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
