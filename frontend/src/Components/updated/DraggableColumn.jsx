import React from "react"
import { useDrag } from "react-dnd"

const DraggableColumn = ({ column, dataType, tableName, data }) => {
  const columnPath = `${tableName}.${column}`

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "column",
    item: {
      columnPath,
      data: data || [],
      dataType: dataType,
      columnName: column,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const formatDataType = (type) => {
    const typeMap = {
      "character varying": "varchar",
      "timestamp without time zone": "timestamp",
      "double precision": "double",
    }
    return typeMap[type.toLowerCase()] || type
  }

  const getColumnPreview = () => {
    if (!data || data.length === 0) return "No data"

    const sampleValue = data[0][column]
    if (typeof sampleValue === "string") {
      // Check if it's a date string
      const date = new Date(sampleValue)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString()
      }
    }
    if (typeof sampleValue === "object" && sampleValue !== null) {
      return JSON.stringify(sampleValue).substring(0, 30) + "..."
    }
    return String(sampleValue).substring(0, 30) + (String(sampleValue).length > 30 ? "..." : "")
  }

  return (
    <div
      ref={drag}
      className={`flex flex-col p-2 border rounded cursor-move hover:bg-gray-100 ${
        isDragging ? "opacity-50" : ""
      } overflow-hidden min-h-[80px] max-h-[120px] w-full`}
    >        
    
      <span className="text-sm font-medium truncate flex-grow mr-1">{column}</span>
      <span className="text-xs text-gray-500 whitespace-nowrap">({formatDataType(dataType)})</span>
      <div className="text-xs text-gray-600 mt-auto">
        <span className="font-medium">Preview:</span>
        <p className="truncate">{getColumnPreview()}</p>
      </div>
    </div>
  )
}

export default DraggableColumn

