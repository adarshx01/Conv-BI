  import React, { useState, useEffect, useRef } from 'react';
  import axios from 'axios';

  const joinTypes = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'];

  function DataSelector({ onDataSelect }) {
    const [step, setStep] = useState(1);
    const [databases, setDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [joinTable, setJoinTable] = useState('');
    const [columns, setColumns] = useState({});
    const [selectedColumns, setSelectedColumns] = useState({});
    const [joinType, setJoinType] = useState('');
    const [joinCondition, setJoinCondition] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateColumn, setDateColumn] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [xAxis, setXAxis] = useState([]);
    const [yAxis, setYAxis] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);

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
        setSelectedColumns(prev => ({ ...prev, [selectedTable]: [] }));
      }
    }, [selectedDatabase, selectedTable]);

    useEffect(() => {
      if (selectedDatabase && joinTable) {
        fetchColumns(selectedDatabase, joinTable);
        setSelectedColumns(prev => ({ ...prev, [joinTable]: [] }));
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

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(null);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const fetchDatabases = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/databases');
        setDatabases(response.data);
      } catch (error) {
        setError('Failed to fetch databases');
        console.error('Error fetching databases:', error);
      }
    };

    const fetchTables = async (database) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tables/${database}`);
        setTables(response.data);
      } catch (error) {
        setError(`Failed to fetch tables for ${database}`);
        console.error(`Error fetching tables for ${database}:`, error);
      }
    };

    const fetchColumns = async (database, table) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/columns/${database}/${table}`);
        setColumns(prev => ({ ...prev, [table]: response.data }));
      } catch (error) {
        setError(`Failed to fetch columns for ${database}.${table}`);
        console.error(`Error fetching columns for ${database}.${table}:`, error);
      }
    };

    const handleColumnSelect = (table, columnName) => {
      setSelectedColumns(prev => ({
        ...prev,
        [table]: prev[table].includes(columnName)
          ? prev[table].filter(col => col !== columnName)
          : [...prev[table], columnName]
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      if (!selectedDatabase || !selectedTable || !selectedColumns[selectedTable]?.length) {
        setError('Please select a database, table, and at least one column from the main table');
        setLoading(false);
        return;
      }

      if (xAxis.length === 0 || yAxis.length === 0) {
        setError('Please select both X-axis and Y-axis columns');
        setLoading(false);
        return;
      }

      try {
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
          xAxis, 
          yAxis
        };

        console.log('Sending request with data:', requestData);

        const response = await axios.post('http://localhost:5000/api/query', requestData);

        console.log('Query response:', response.data);

        if (response.data && response.data.length > 0) {
          onDataSelect(response.data, { xAxis, yAxis });
        } else {
          setError('No data returned from query. Please check your selection and try again.');
        }
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          setError(`Failed to fetch data: ${error.response.data.error || error.response.statusText}`);
        } else if (error.request) {
          console.error('Error request:', error.request);
          setError('Failed to fetch data: No response received from server');
        } else {
          console.error('Error message:', error.message);
          setError(`Failed to fetch data: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
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
              <h2 className="text-xl font-semibold">Step 2: Join Operation</h2>
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
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={joinType && (!joinTable || !joinCondition)}
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
              <h2 className="text-xl font-semibold">Step 3: Select Columns and Axes</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Columns:</label>
                <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  {Object.entries(columns).map(([table, tableColumns]) => (
                    <div key={table} className="p-2">
                      <h3 className="font-medium">{table}</h3>
                      {tableColumns.map(column => (
                        <label key={column.column_name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedColumns[table]?.includes(column.column_name) || false}
                            onChange={() => handleColumnSelect(table, column.column_name)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{column.column_name} ({column.data_type})</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select X-axis column(s):</label>
                <div className="mt-1 relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(dropdownOpen === 'x' ? null : 'x')}
                    className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <span className="block truncate">
                      {xAxis.length > 0 ? `${xAxis.length} column(s) selected` : 'Select X-axis'}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  {dropdownOpen === 'x' && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {Object.entries(selectedColumns).flatMap(([table, cols]) =>
                        cols.map(col => (
                          <div
                            key={`${table}.${col}`}
                            className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={xAxis.includes(`${table}.${col}`)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setXAxis([...xAxis, `${table}.${col}`]);
                                  } else {
                                    setXAxis(xAxis.filter(item => item !== `${table}.${col}`));
                                  }
                                }}
                                disabled={yAxis.includes(`${table}.${col}`)}
                              />
                              <span className="ml-3 block truncate">{`${table}.${col}`}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Y-axis column(s):</label>
                <div className="mt-1 relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(dropdownOpen === 'y' ? null : 'y')}
                    className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <span className="block truncate">
                      {yAxis.length > 0 ? `${yAxis.length} column(s) selected` : 'Select Y-axis'}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                  {dropdownOpen === 'y' && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {Object.entries(selectedColumns).flatMap(([table, cols]) =>
                        cols.map(col => (
                          <div
                            key={`${table}.${col}`}
                            className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={yAxis.includes(`${table}.${col}`)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setYAxis([...yAxis, `${table}.${col}`]);
                                  } else {
                                    setYAxis(yAxis.filter(item => item !== `${table}.${col}`));
                                  }
                                }}
                                disabled={xAxis.includes(`${table}.${col}`)}
                              />
                              <span className="ml-3 block truncate">{`${table}.${col}`}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
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
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Previous
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || xAxis.length === 0 || yAxis.length === 0}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Fetch Data'}
                </button>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
          </div>
          {renderStep()}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  export default DataSelector;

