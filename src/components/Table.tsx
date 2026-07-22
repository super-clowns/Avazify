import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (
    row: T,
    index: number,
  ) => ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (
    row: T,
    index: number,
  ) => string;
  emptyMessage?: string;
  caption?: string;
}

// Generic responsive table.
export default function Table<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage =
    'داده‌ای برای نمایش وجود ندارد.',
  caption,
}: TableProps<T>) {
  return (
    <div className="ui-table-wrapper">
      <table className="ui-table">
        {caption ? (
          <caption>{caption}</caption>
        ) : null}

        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  width: column.width,
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="ui-table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={getRowKey(
                  row,
                  rowIndex,
                )}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render(
                      row,
                      rowIndex,
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}