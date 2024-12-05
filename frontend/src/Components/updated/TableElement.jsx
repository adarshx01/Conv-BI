import React from 'react';


interface tableElementProps {
  data: any[];
}

export function TableElement({ data }: tableElementProps) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  return (
    <div className="w-full h-full overflow-auto bg-white p-4 rounded-lg">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="font-semibold">
                {column.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </th>
            ))}
          </tr>
        </thead>
        <thead>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </thead>
      </table>
    </div>
  );
}

