import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { BarChart, LineChart, PieChart, AreaChart, Layers, BarChartHorizontal, PieChartIcon, Donut, TrendingUp, Image, Type, Square, Circle, Triangle, Smile, Table, Star, Share, ShareIcon, Save, Upload } from 'lucide-react';
import PageManager from './PageManager';
import axios from 'axios';
import DraggableColumn from './DraggableColumn';

const DraggableElement = ({ type, icon: Icon, label, onAdd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="element-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onAdd({ type })}
    >
      <Icon size={24} />
      <span>{label || type}</span>
    </div>
  );
};

const elementCategories = {
  basic: [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
  ],
  charts: [
    { type: 'bar', icon: BarChart, label: 'Bar Chart' },
    { type: 'stackedBar', icon: Layers, label: 'Stacked Bar' },
    { type: 'stripedBar', icon: BarChartHorizontal, label: 'Striped Bar' },
    { type: 'line', icon: LineChart, label: 'Line Chart' },
    { type: 'lineWithValues', icon: TrendingUp, label: 'Line + Value' },
    { type: 'area', icon: AreaChart, label: 'Area Chart' },
    { type: 'pie', icon: PieChart, label: 'Pie Chart' },
    { type: 'halfPie', icon: PieChartIcon, label: 'Half Pie' },
    { type: 'hollowPie', icon: Donut, label: 'Hollow Pie' },
    { type: 'barLine', icon: BarChart, label: 'Bar + Line' },
  ],
  data: [
    { 
      type: 'table', 
      icon: Table, 
      label: 'Import Data',
    }
  ],
};

const joinTypes = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'];

function Sidebar({ onElementAdd, pages, currentPageId, onPageAdd, onPageChange, onPageRemove, onCanvasResize, onExport, onSave, onLoad }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('charts');
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [joinTable, setJoinTable] = useState('');
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({});
  const [joinType, setJoinType] = useState('');
  const [joinCondition, setJoinCondition] = useState('');
  const [tableData, setTableData] = useState(null);
  const [dateColumn, setDateColumn] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dataType, setDataType] = useState('Default');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchDatabases();
  }, []);
  
  useEffect(() => {
    if (selectedDatabase) {
      fetchTables(selectedDatabase);
    }
  }, [selectedDatabase]);
  
  useEffect(() => {
    if (selectedDatabase && selectedTable) {
      fetchColumns(selectedDatabase, selectedTable);
    }
  }, [selectedDatabase, selectedTable]);

  useEffect(() => {
    if (selectedDatabase && joinTable) {
      fetchColumns(selectedDatabase, joinTable);
    }
  }, [selectedDatabase, joinTable]);

  useEffect(() => {
    const allColumns = Object.entries(columns).flatMap(([table, cols]) =>
      cols.map(col => ({ ...col, table_name: table }))
    );
    const dateCol = allColumns.find(col =>
      col.column_name.toLowerCase() === 'date' ||
      col.data_type.toLowerCase().includes('date')
    );
    if (dateCol) {
      setDateColumn(`${dateCol.table_name}.${dateCol.column_name}`);
    } else {
      setDateColumn('');
    }
  }, [columns]);
  
  const filteredElements = elementCategories[activeCategory].filter(element =>
    element.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchDatabases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/databases');
      setDatabases(response.data);
    } catch (error) {
      console.error('Error fetching databases:', error);
    }
  };

  const fetchTables = async (database) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tables/${database}`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };
  
  const fetchColumns = async (database, table) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/columns/${database}/${table}`);
      setColumns(prev => ({ ...prev, [table]: response.data }));
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };
  
  const fetchTableData = async () => {
    try {
      const selectedColumns = Object.entries(columns).reduce((acc, [table, cols]) => {
        acc[table] = cols.map(col => col.column_name);
        return acc;
      }, {});

      const requestData = {
        database: selectedDatabase,
        mainTable: selectedTable,
        joinTable,
        selectedColumns,
        joinType,
        joinCondition,
        dateColumn,
        startDate,
        endDate,
        dataType
      };

      const response = await axios.post('http://localhost:5000/api/query', requestData);  
      if (response.data && Array.isArray(response.data)) {
        const processedData = processData(response.data);
        setTableData(processedData);
        console.log('Table data fetched:', processedData);
        // onElementAdd({ type: 'table', data: processedData });
      } else {
        console.error('Invalid data format received:', response.data);
        setTableData([]);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      setTableData([]);
    }
  };

  const processData = (data) => {
    if (dataType === 'Monthly' || dataType === 'Yearly') {
      return data.map(item => {
        const processedItem = { ...item };
        for (const key in processedItem) {
          if (key !== 'period' && typeof processedItem[key] === 'object') {
            processedItem[key] = JSON.stringify(processedItem[key]);
          }
        }
        return processedItem;
      });
    }
    return data;
  };


  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Select Database and Table</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Database:</label>
              <select
                value={selectedDatabase}
                onChange={(e) => {
                  setSelectedDatabase(e.target.value);
                  setSelectedTable('');
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select Database</option>
                {databases.map(db => (
                  <option key={db} value={db}>{db}</option>
                ))}
              </select>
            </div>
            {selectedDatabase && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Main Table:</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Table</option>
                  {tables.map(table => (
                    <option key={table} value={table}>{table}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              disabled={!selectedDatabase || !selectedTable}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 2: Join Operation and Date Range</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Join Type:</label>
              <select
                value={joinType}
                onChange={(e) => setJoinType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">No Join</option>
                {joinTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {joinType && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Join Table:</label>
                  <select
                    value={joinTable}
                    onChange={(e) => setJoinTable(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select Table</option>
                    {tables.filter(t => t !== selectedTable).map(table => (
                      <option key={table} value={table}>{table}</option>
                    ))}
                  </select>
                </div>
                {joinTable && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Join Condition:</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <select
                        value={joinCondition.split(' = ')[0] || ''}
                        onChange={(e) => setJoinCondition(`${e.target.value} = ${joinCondition.split(' = ')[1] || ''}`)}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                      >
                        <option value="">Select Column from {selectedTable}</option>
                        {columns[selectedTable]?.map(column => (
                          <option key={column.column_name} value={`"${selectedTable}"."${column.column_name}"`}>
                            {column.column_name}
                          </option>
                        ))}
                      </select>
                      <span className="inline-flex items-center px-3 rounded-none border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        =
                      </span>
                      <select
                        value={joinCondition.split(' = ')[1] || ''}
                        onChange={(e) => setJoinCondition(`${joinCondition.split(' = ')[0] || ''} = ${e.target.value}`)}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                      >
                        <option value="">Select Column from {joinTable}</option>
                        {columns[joinTable]?.map(column => (
                          <option key={column.column_name} value={`"${joinTable}"."${column.column_name}"`}>
                            {column.column_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Data Type:</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="Default">Default</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            {dateColumn && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Date Range:</label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
            <button
              onClick={fetchTableData}
              disabled={joinType && (!joinTable || !joinCondition)}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Fetch Data
            </button>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Previous
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!tableData}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 3: Draggable Columns</h2>
            {tableData && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Draggable Columns</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(columns).flatMap(([table, cols]) =>
                    cols.map(column => (
                      <DraggableColumn
                        key={`${table}.${column.column_name}`}
                        column={column}
                        tableName={table}
                        data={tableData}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Previous
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sidebar">
      <div className='my-3 mx-auto flex flex-row'>
        <button 
          onClick={onSave} 
          className='flex items-center border-2 rounded-3xl px-3 mx-1 h-10 space-x-2 hover:bg-green-300 focus:bg-violet-400'>
          <Save className='w-5 h-5' /> 
          <span>Save Report</span>
        </button>

        <button 
          onClick={onLoad} 
          className='flex items-center border-2 rounded-3xl px-3 mx-1 h-10 space-x-2 hover:bg-green-300 focus:bg-violet-400'>
          <Upload className='w-5 h-5' /> 
          <span>Load Report</span>
        </button>

        <button 
          onClick={onExport} 
          className='flex items-center border-2 rounded-3xl px-3 mx-1 h-10 space-x-2 hover:bg-green-300 focus:bg-violet-400'>
          <ShareIcon className='w-5 h-5' /> 
          <span>Export</span>
        </button>
      </div>
      <div className="data-selector p-4">
        <h3 className="text-lg font-semibold mb-4">Data Source</h3>
        {renderStep()}
      </div>
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search elements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="sidebar-categories mx-auto ">
        {Object.keys(elementCategories).map(category => (
          <button
            key={category}
            className={`category-button ${activeCategory === category ? 'active bg-orange-200' : 'bg-violet-400'} px-2 rounded-3xl   border-2 mx-0.5`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      <div className="element-list ">
        {filteredElements.map((element) => (
          <DraggableElement
            key={element.type}
            {...element}
            onAdd={onElementAdd}
          />
        ))}
      </div>
      <div className='p-2 border-2 mx-4  rounded-xl mt-24'>
        <p className='font-semibold text-[1rem] text-center'>Page Settings</p>
        <hr className='mb-4'></hr>
        <PageManager
          pages={pages}
          currentPageId={currentPageId}
          onPageAdd={onPageAdd}
          onPageChange={onPageChange}
          onPageRemove={onPageRemove}
          onCanvasResize={onCanvasResize}
        />
      </div>
    </div>
  );
}

export default Sidebar;

