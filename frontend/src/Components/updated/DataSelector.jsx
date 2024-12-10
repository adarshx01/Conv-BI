import React, { useState, useEffect } from 'react';
import axios from 'axios';

const joinTypes = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'];

function DataSelector({ onDataSelect }) {
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
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState([]);

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

    if (!xAxis || yAxis.length === 0) {
      setError('Please select both X-axis and Y-axis columns');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/query', {
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
      });

      console.log('Query response:', response.data); // Log the response data

      if (response.data && response.data.length > 0) {
        onDataSelect(response.data, { xAxis, yAxis });
      } else {
        setError('No data returned from query. Please check your selection and try again.');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch data');
      console.error('Error details:', error.response?.data?.details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-selector p-4 bg-background border rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Database selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Database:</label>
          <select
            value={selectedDatabase}
            onChange={(e) => {
              setSelectedDatabase(e.target.value);
              setSelectedTable('');
              setJoinTable('');
              setJoinType('');
              setJoinCondition('');
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Database</option>
            {databases.map(db => (
              <option key={db} value={db}>{db}</option>
            ))}
          </select>
        </div>

        {/* Table selection */}
        {selectedDatabase && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Main Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setJoinTable('');
                setJoinType('');
                setJoinCondition('');
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Table</option>
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>
        )}

        {/* Column selection */}
        {selectedTable && columns[selectedTable] && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Columns for {selectedTable}:</label>
            <div className="space-y-1">
              {columns[selectedTable].map(column => (
                <label key={column.column_name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedColumns[selectedTable]?.includes(column.column_name) || false}
                    onChange={() => handleColumnSelect(selectedTable, column.column_name)}
                    className="rounded"
                  />
                  <span>{column.column_name} ({column.data_type})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Date range selection */}
        {dateColumn && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Date Range:</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border rounded"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border rounded"
              />
            </div>
          </div>
        )}

        {/* Join type selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Join Type:</label>
          <select
            value={joinType}
            onChange={(e) => setJoinType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">No Join</option>
            {joinTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Join table and condition */}
        {joinType && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Join Table:</label>
              <select
                value={joinTable}
                onChange={(e) => setJoinTable(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Table</option>
                {tables.filter(t => t !== selectedTable).map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            {joinTable && columns[joinTable] && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Select Columns for {joinTable}:</label>
                <div className="space-y-1">
                  {columns[joinTable].map(column => (
                    <label key={column.column_name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedColumns[joinTable]?.includes(column.column_name) || false}
                        onChange={() => handleColumnSelect(joinTable, column.column_name)}
                        className="rounded"
                      />
                      <span>{column.column_name} ({column.data_type})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium">Join Condition:</label>
              <div className="flex space-x-2">
                <select
                  value={joinCondition.split(' = ')[0] || ''}
                  onChange={(e) => setJoinCondition(`${e.target.value} = ${joinCondition.split(' = ')[1] || ''}`)}
                  className="w-1/2 p-2 border rounded"
                >
                  <option value="">Select Column from {selectedTable}</option>
                  {columns[selectedTable]?.map(column => (
                    <option key={column.column_name} value={`"${selectedTable}"."${column.column_name}"`}>
                      {column.column_name}
                    </option>
                  ))}
                </select>
                <select
                  value={joinCondition.split(' = ')[1] || ''}
                  onChange={(e) => setJoinCondition(`${joinCondition.split(' = ')[0] || ''} = ${e.target.value}`)}
                  className="w-1/2 p-2 border rounded"
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
          </>
        )}

        {/* X-axis selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select X-axis column:</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select X-axis</option>
            {Object.entries(selectedColumns).flatMap(([table, cols]) =>
              cols.map(col => (
                <option key={`${table}.${col}`} value={`${table}.${col}`}>
                  {`${table}.${col}`}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Y-axis selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Y-axis columns:</label>
          <div className="space-y-1">
            {Object.entries(selectedColumns).flatMap(([table, cols]) =>
              cols.map(col => (
                <label key={`${table}.${col}`} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={yAxis.includes(`${table}.${col}`)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setYAxis([...yAxis, `${table}.${col}`]);
                      } else {
                        setYAxis(yAxis.filter(item => item !== `${table}.${col}`));
                      }
                    }}
                    className="rounded"
                  />
                  <span>{`${table}.${col}`}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </form>
    </div>
  );
}

export default DataSelector;

