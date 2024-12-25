import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';

const ChartDropZone = ({ onDataSelect, chartType, axisInfo }) => {
  const [xAxis, setXAxis] = useState([]);
  const [yAxis, setYAxis] = useState([]);
  const [droppedData, setDroppedData] = useState(null);

  
  useEffect(() => {
    if (axisInfo) {
      setXAxis(axisInfo.xAxis || []);
      setYAxis(axisInfo.yAxis || []);
    }
  }, [axisInfo]);

  const isPieChart = ['pie', 'halfPie', 'hollowPie'].includes(chartType);

  const [{ isOverX }, dropX] = useDrop(() => ({
    accept: 'column',
    drop: (item) => {
      const newXAxis = [...xAxis];
      if (!newXAxis.includes(item.columnPath)) {
        newXAxis.push(item.columnPath);
        setXAxis(newXAxis);
        setDroppedData(item.data);
        console.log('data of x',item.data);
        console.log('x-column path',item.columnPath);
        console.log('x-data',newXAxis);
        // Don't trigger onDataSelect here - wait for Display Graph button
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [xAxis, yAxis]);

  const [{ isOverY }, dropY] = useDrop(() => ({
    accept: 'column',
    drop: (item) => {
      const newYAxis = [...yAxis];
      if (!newYAxis.includes(item.columnPath)) {
        newYAxis.push(item.columnPath);
        setYAxis(newYAxis);
        setDroppedData(item.data);
        console.log('Item-y data',item.data);
        console.log('y-columns',item.columnPath);
        console.log(newYAxis);
        // Don't trigger onDataSelect here - wait for Display Graph button
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [xAxis, yAxis]);

  const removeAxis = (axis, value) => {
    if (axis === 'x') {
      const newXAxis = xAxis.filter(x => x !== value);
      setXAxis(newXAxis);
    } else {
      const newYAxis = yAxis.filter(y => y !== value);
      setYAxis(newYAxis);
    }
  };

  // Clear state when chartType changes
  useEffect(() => {
    setXAxis([]);
    setYAxis([]);
    setDroppedData(null);
  }, [chartType]);

  const handleDisplayGraph = () => {
    // Basic validation to ensure we have data and at least one axis
    if (!droppedData) return;

    // For pie charts, require both axes
    if (isPieChart && (!xAxis.length || !yAxis.length)) return;

    // For other charts, require at least one column in each axis
    if (!isPieChart && (!xAxis.length || !yAxis.length)) return;

    // If we have valid data and axes, trigger the callback
    onDataSelect(droppedData, { xAxis, yAxis });
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 rounded-lg">
      <div
        ref={dropX}
        className={`p-4 border-2 border-dashed rounded-lg min-h-[100px] ${
          isOverX ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
      >
        <p className="text-sm font-medium text-gray-700 mb-2">
          {isPieChart ? 'A Axis' : 'X Axis'}
        </p>
        <div className="flex flex-wrap gap-2">
          {xAxis.map((col) => (
            <div key={col} className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded">
              <span className="text-sm">{col.split('.')[1]}</span>
              <button
                onClick={() => removeAxis('x', col)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
          {xAxis.length === 0 && (
            <p className="text-sm text-gray-500">
              Drop columns here for {isPieChart ? 'A' : 'X'} axis
            </p>
          )}
        </div>
      </div>

      <div
        ref={dropY}
        className={`p-4 border-2 border-dashed rounded-lg min-h-[100px] ${
          isOverY ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
      >
        <p className="text-sm font-medium text-gray-700 mb-2">
          {isPieChart ? 'B Axis' : 'Y Axis'}
        </p>
        <div className="flex flex-wrap gap-2">
          {yAxis.map((col) => (
            <div key={col} className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded">
              <span className="text-sm">{col.split('.')[1]}</span>
              <button
                onClick={() => removeAxis('y', col)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          ))}
          {yAxis.length === 0 && (
            <p className="text-sm text-gray-500">
              Drop columns here for {isPieChart ? 'B' : 'Y'} axis
            </p>
          )}
        </div>
      </div>

      <button 
        onClick={handleDisplayGraph}
        disabled={!droppedData || (xAxis.length === 0 || yAxis.length === 0)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Display Graph
      </button>
    </div>
  );
};

export default ChartDropZone;