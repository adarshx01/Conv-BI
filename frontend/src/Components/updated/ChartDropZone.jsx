import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ChevronDown, Plus, Minus, Divide, Hash, ArrowDown, ArrowUp, BarChart2 } from 'lucide-react';

const ChartDropZone = ({ onDataSelect, chartType, axisInfo }) => {
  const [xAxis, setXAxis] = useState([]);
  const [yAxis, setYAxis] = useState([]);
  const [droppedData, setDroppedData] = useState(null);
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const [aggregationColumns, setAggregationColumns] = useState([]);
  const [aggregationType, setAggregationType] = useState('');
  const [countByColumn, setCountByColumn] = useState('');

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
      if (!newXAxis.some(x => x.path === item.columnPath)) {
        newXAxis.push({
          path: item.columnPath,
          aggregationFunction: item.aggregationFunction
        });
        setXAxis(newXAxis);
        setDroppedData(item.data);
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
      if (!newYAxis.some(y => y.path === item.columnPath)) {
        newYAxis.push({
          path: item.columnPath,
          aggregationFunction: item.aggregationFunction
        });
        setYAxis(newYAxis);
        setDroppedData(item.data);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [xAxis, yAxis]);

  const removeAxis = (axis, value) => {
    if (axis === 'x') {
      const newXAxis = xAxis.filter(x => x.path !== value);
      setXAxis(newXAxis);
    } else {
      const newYAxis = yAxis.filter(y => y.path !== value);
      setYAxis(newYAxis);
    }
  };

  useEffect(() => {
    setXAxis([]);
    setYAxis([]);
    setDroppedData(null);
  }, [chartType]);

  const handleDisplayGraph = () => {
    if (!droppedData) return;
    if (isPieChart && (!xAxis.length || !yAxis.length)) return;
    if (!isPieChart && (!xAxis.length || !yAxis.length)) return;

    onDataSelect(droppedData, { 
      xAxis: xAxis.map(x => ({ path: x.path, aggregationFunction: x.aggregationFunction })),
      yAxis: yAxis.map(y => ({ path: y.path, aggregationFunction: y.aggregationFunction }))
    });
  };

  const openAggregationModal = () => {
    setShowAggregationModal(true);
  };

  const closeAggregationModal = () => {
    setShowAggregationModal(false);
    setAggregationColumns([]);
    setAggregationType('');
    setCountByColumn('');
  };

  const addColumnToAggregation = (column) => {
    if (aggregationColumns.length < 2) {
      setAggregationColumns([...aggregationColumns, column]);
    }
  };

  const removeColumnFromAggregation = (column) => {
    setAggregationColumns(aggregationColumns.filter(c => c !== column));
  };

  const applyAggregation = () => {
    if (aggregationColumns.length > 0 && aggregationType) {
      let newColumn;
      if (aggregationType === 'COUNT_BY') {
        newColumn = {
          path: `COUNT_BY(${aggregationColumns[0].path}, ${countByColumn})`,
          aggregationFunction: 'COUNT_BY'
        };
      } else if (['ADD', 'SUBTRACT', 'DIVIDE'].includes(aggregationType) && aggregationColumns.length === 2) {
        newColumn = {
          path: `${aggregationType}(${aggregationColumns[0].path}, ${aggregationColumns[1].path})`,
          aggregationFunction: aggregationType
        };
      } else {
        newColumn = {
          path: `${aggregationType}(${aggregationColumns[0].path})`,
          aggregationFunction: aggregationType
        };
      }
      setYAxis([...yAxis, newColumn]);
      closeAggregationModal();
    }
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
            <div key={col.path} className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded">
              <span className="text-sm">
                {col.aggregationFunction ? `${col.aggregationFunction}(${col.path.split('.')[1]})` : col.path.split('.')[1]}
              </span>
              <button
                onClick={() => removeAxis('x', col.path)}
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
            <div key={col.path} className="flex items-center gap-1 bg-indigo-100 px-2 py-1 rounded">
              <span className="text-sm">
                {col.aggregationFunction ? `${col.aggregationFunction}(${col.path.split('.')[1]})` : col.path.split('.')[1]}
              </span>
              <button
                onClick={() => removeAxis('y', col.path)}
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
        onClick={openAggregationModal}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Add Aggregation
      </button>

      <button 
        onClick={handleDisplayGraph}
        disabled={!droppedData || (xAxis.length === 0 || yAxis.length === 0)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Display Graph
      </button>

      {showAggregationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Create Aggregation</h3>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Select Columns (max 2):</p>
              <div className="flex flex-wrap gap-2">
                {[...xAxis, ...yAxis].map((col) => (
                  <button
                    key={col.path}
                    onClick={() => aggregationColumns.includes(col) ? removeColumnFromAggregation(col) : addColumnToAggregation(col)}
                    className={`px-2 py-1 rounded ${
                      aggregationColumns.includes(col) ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {col.path.split('.')[1]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Select Aggregation Type:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAggregationType('ADD')}
                  className={`p-2 rounded ${aggregationType === 'ADD' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => setAggregationType('SUBTRACT')}
                  className={`p-2 rounded ${aggregationType === 'SUBTRACT' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <Minus size={20} />
                </button>
                <button
                  onClick={() => setAggregationType('DIVIDE')}
                  className={`p-2 rounded ${aggregationType === 'DIVIDE' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <Divide size={20} />
                </button>
                <button
                  onClick={() => setAggregationType('COUNT')}
                  className={`p-2 rounded ${aggregationType === 'COUNT' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <Hash size={20} />
                </button>
                <button
                  onClick={() => setAggregationType('MIN')}
                  className={`p-2 rounded ${aggregationType === 'MIN' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <ArrowDown size={20} />
                </button>
                <button
                  onClick={() => setAggregationType('MAX')}
                  className={`p-2 rounded ${aggregationType === 'MAX' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <ArrowUp size={20} />
                </button>
                <button
                  onClick={() => setAggregationType('AVG')}
                  className={`p-2 rounded ${aggregationType === 'AVG' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <BarChart2 size={20} />
                </button>
                <button
                  onClick={() => setAggregationType('COUNT_BY')}
                  className={`p-2 rounded ${aggregationType === 'COUNT_BY' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  Count By
                </button>
              </div>
            </div>
            {aggregationType === 'COUNT_BY' && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Select Count By Column:</p>
                <select
                  value={countByColumn}
                  onChange={(e) => setCountByColumn(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a column</option>
                  {[...xAxis, ...yAxis].map((col) => (
                    <option key={col.path} value={col.path}>
                      {col.path.split('.')[1]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={closeAggregationModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={applyAggregation}
                disabled={aggregationColumns.length === 0 || !aggregationType || (aggregationType === 'COUNT_BY' && !countByColumn)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartDropZone;
