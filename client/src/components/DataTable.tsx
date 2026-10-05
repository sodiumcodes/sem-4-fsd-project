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
  emptyMessage = 'No data available',
}: DataTableProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-palette-2)' }}>
        <p style={{ fontWeight: 600 }}>Loading records...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          backgroundColor: '#ffffff',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-palette-2)',
        }}
      >
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: '#ffffff',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.925rem',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-palette-2)',
              color: '#ffffff',
            }}
          >
            {columns.map((col, index) => (
              <th
                key={index}
                style={{
                  padding: '0.85rem 1rem',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                }}
                className={col.className}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={keyExtractor(item)}
              style={{
                borderTop: '1px solid var(--color-border)',
                backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9fbf9',
              }}
            >
              {columns.map((col, colIndex) => {
                const cellContent =
                  typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor] as React.ReactNode);

                return (
                  <td
                    key={colIndex}
                    style={{
                      padding: '0.85rem 1rem',
                      color: 'var(--color-palette-1)',
                    }}
                    className={col.className}
                  >
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
