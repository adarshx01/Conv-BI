import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableColumn = ({ column, tableName, data }) => {
  const columnPath = `${tableName}.${column.column_name}`;
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'column',
    item: { 
      columnPath,
      data: data || [],
      dataType: column.data_type,
      columnName: column.column_name
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getColumnPreview = () => {
    if (!data || data.length === 0) return 'No data';
    
    const sampleValue = data[0][column.column_name];
    if (typeof sampleValue === 'string' && sampleValue.startsWith('{')) {
      try {
        const parsed = JSON.parse(sampleValue);
        return `Highest: ${parsed.highest}, Lowest: ${parsed.lowest}, Average: ${parsed.average}`;
      } catch (e) {
        return sampleValue;
      }
    }
    return String(sampleValue);
  };

  return (
    <div
      ref={drag}
      className={`flex flex-col p-2 border rounded cursor-move hover:bg-gray-100 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <span className="text-sm font-medium">{column.column_name}</span>
      <span className="text-xs text-gray-500">({column.data_type})</span>
      <span className="text-xs text-gray-600 mt-1">Preview: {getColumnPreview()}</span>
    </div>
  );
};

export default DraggableColumn;

