import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ChevronDown, Plus, Minus, Divide, Hash, ArrowDown, ArrowUp, BarChart2, Percent, SortAsc, SortDesc, X } from 'lucide-react';

const ChartDropZone = ({ onDataSelect, chartType, axisInfo }) => {
  const [xAxis, setXAxis] = useState([]);
  const [yAxis, setYAxis] = useState([]);
  const [droppedData, setDroppedData] = useState(null);
  const [showAggregationModal, setShowAggregationModal] = useState(false);
  const [aggregationColumns, setAggregationColumns] = useState([]);
  const [aggregationType, setAggregationType] = useState('');
  const [countByColumn, setCountByColumn] = useState('');
  const [selectedAxis, setSelectedAxis] = useState('y'); // Added selectedAxis state
  //const [percentageBase, setPercentageBase] = useState(''); //Removed
  const [orderBy, setOrderBy] = useState({ column: '', direction: 'asc' });
  const [groupByColumns, setGroupByColumns] = useState([]); // Added groupByColumns state

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
      xAxis: xAxis.map(x => ({ path: x.path, aggregationFunction: x.aggregationFunction, groupBy: x.groupBy })),
      yAxis: yAxis.map(y => ({ path: y.path, aggregationFunction: y.aggregationFunction, groupBy: y.groupBy })),
      orderBy,
      groupByColumns // Added groupByColumns to the object
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
    //setPercentageBase(''); //Removed
    setOrderBy({ column: '', direction: 'asc' });
    setGroupByColumns([]); // Clear groupByColumns on modal close
  };

  const addColumnToAggregation = (column) => {
    if (aggregationColumns.length < 2) {
      setAggregationColumns([...aggregationColumns, column]);
    }
  };

  const removeColumnFromAggregation = (column) => {
    setAggregationColumns(aggregationColumns.filter(c => c !== column));
  };

  const handleGroupByColumnChange = (column) => { // Added handleGroupByColumnChange function
    if (groupByColumns.includes(column)) {
      setGroupByColumns(groupByColumns.filter(c => c !== column));
    } else {
      setGroupByColumns([...groupByColumns, column]);
    }
  };

  const applyAggregation = () => {
    if (aggregationColumns.length > 0 && aggregationType) {
      let newColumn;
      if (aggregationType === 'COUNT_BY') {
        newColumn = {
          path: `COUNT_BY(${aggregationColumns[0].path}, ${countByColumn})`,
          aggregationFunction: 'COUNT_BY'
        };
      } else if (aggregationType === 'PERCENTAGE') {
        newColumn = {
          path: `PERCENTAGE(${aggregationColumns[0].path}, ${aggregationColumns[1].path})`,
          aggregationFunction: 'PERCENTAGE'
        };
      } else if (['ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'].includes(aggregationType) && aggregationColumns.length === 2) {
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
      
      if (groupByColumns.length > 0) {
        newColumn.groupBy = groupByColumns.map(col => col.path).join(',');
      }
      
      if (selectedAxis === 'y') { // Use selectedAxis state
        setYAxis([...yAxis, newColumn]);
      } else {
        setXAxis([...xAxis, newColumn]);
      }
      closeAggregationModal();
    }
  };

  const handleOrderByChange = (column) => {
    if (orderBy.column === column) {
      setOrderBy({ column, direction: orderBy.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setOrderBy({ column, direction: 'asc' });
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-white min-w-[24rem] rounded-lg pt-16">
      <div
        ref={dropX}
        className={`p-4 border-2 border-dashed rounded-lg min-h-[9rem] ${
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
                <X size={12} />
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
        className={`p-4 border-2 border-dashed rounded-lg min-h-[9rem] ${
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
                <X size={12} />
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
      <div className='flex gap-4 mx-auto'>
        <button 
          onClick={openAggregationModal}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
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
      </div>

      {showAggregationModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex  items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full ">
            {/* <h3 className="text-lg font-semibold mb-4">Create Aggregation</h3> */}
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
                  onClick={() => setAggregationType('MULTIPLY')}
                  className={`p-2 rounded ${aggregationType === 'MULTIPLY' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  ×
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
                <button
                  onClick={() => setAggregationType('PERCENTAGE')}
                  className={`p-2 rounded ${aggregationType === 'PERCENTAGE' ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}
                >
                  <Percent size={20} />
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
            {/*Removed Percentage Base selection*/}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Select Axis:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAxis('x')}
                  className={`px-2 py-1 rounded ${
                    selectedAxis === 'x' ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  X Axis
                </button>
                <button
                  onClick={() => setSelectedAxis('y')}
                  className={`px-2 py-1 rounded ${
                    selectedAxis === 'y' ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Y Axis
                </button>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Group By:</p>
              <div className="flex flex-wrap gap-2">
                {[...xAxis, ...yAxis].map((col) => (
                  <button
                    key={col.path}
                    onClick={() => handleGroupByColumnChange(col)} // Added handleGroupByColumnChange
                    className={`px-2 py-1 rounded ${
                      groupByColumns.includes(col) ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {col.path.split('.')[1]}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Order By:</p>
              <div className="flex flex-wrap gap-2">
                {[...xAxis, ...yAxis].map((col) => (
                  <button
                    key={col.path}
                    onClick={() => handleOrderByChange(col.path)}
                    className={`px-2 py-1 rounded flex items-center gap-1 ${
                      orderBy.column === col.path ? 'bg-indigo-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {col.path.split('.')[1]}
                    {orderBy.column === col.path && (
                      orderBy.direction === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeAggregationModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={applyAggregation}
                disabled={aggregationColumns.length === 0 || !aggregationType || (aggregationType === 'COUNT_BY' && !countByColumn) || (aggregationType === 'PERCENTAGE' && aggregationColumns.length !== 2)}
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

