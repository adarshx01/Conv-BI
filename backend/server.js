require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const DataReducer = require('./DataReducer');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.REACT_APP_USER,
  password: process.env.REACT_APP_PASSWORD,
  host: process.env.REACT_APP_HOST,
};

const pools = {};

app.get('/api/databases', async (req, res) => {
  try {
    const mainPool = new Pool({
      ...dbConfig,
      database: 'postgres',
    });

    const result = await mainPool.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    await mainPool.end();

    res.json(result.rows.map(row => row.datname));
  } catch (err) {
    console.error('Error fetching databases:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tables/:database', async (req, res) => {
  const { database } = req.params;
  try {
    if (!pools[database]) {
      pools[database] = new Pool({
        ...dbConfig,
        database: database,
      });
    }

    const result = await pools[database].query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    res.json(result.rows.map(row => row.table_name));
  } catch (err) {
    console.error(`Error fetching tables for ${database}:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/columns/:database/:table', async (req, res) => {
  const { database, table } = req.params;
  try {
    if (!pools[database]) {
      pools[database] = new Pool({
        ...dbConfig,
        database: database,
      });
    }

    const result = await pools[database].query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = $1 
       ORDER BY ordinal_position`,
      [table]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching columns for ${database}.${table}:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/query', async (req, res) => {
  const { database, mainTable, joinTable, selectedColumns, joinType, joinCondition, dateColumn, startDate, endDate, xAxis, yAxis, dataType } = req.body;
  try {
    if (!pools[database]) {
      pools[database] = new Pool({
        ...dbConfig,
        database: database,
      });
    }

    // Construct column list
    const mainColumns = selectedColumns[mainTable].map(col => `"${mainTable}"."${col}" AS "${col}"`);
    const joinColumns = selectedColumns[joinTable] ? selectedColumns[joinTable].map(col => `"${joinTable}"."${col}" AS "${col}"`) : [];
    const allColumns = [...mainColumns, ...joinColumns];
    
    // Construct the query
    let query = `SELECT ${allColumns.join(', ')} FROM "${mainTable}"`;
    
    if (joinTable && joinType && joinCondition) {
      query += ` ${joinType} "${joinTable}" ON ${joinCondition}`;
    }

    // Add date filtering if applicable
    if (dateColumn && startDate && endDate) {
      const [dateTable, dateCol] = dateColumn.split('.');
      if (dateTable && dateCol) {
        query += ` WHERE "${dateTable}"."${dateCol}" BETWEEN '${startDate}' AND '${endDate}'`;
      } else {
        console.warn('Invalid date column format. Expected "table.column", got:', dateColumn);
      }
    }

    // Add ORDER BY clause for date column if it exists
    // if (dateColumn) {
    //   query += ` ORDER BY "date"`;
    // }

    console.log('Executing query:', query);
    const result = await pools[database].query(query);
    let data = result.rows;

    if (dataType === 'Default') {
      const MAX_DATA_POINTS = 100; // Adjust as needed

      if (data.length > MAX_DATA_POINTS) {
        data = DataReducer.reduceDataset(data, {
          maxDataPoints: MAX_DATA_POINTS,
          preservePeaks: true,
          smoothingMethod: 'slidingWindow',
          smoothingWindow: 5,
          peakPreservationThreshold: 0.1
        });
      }
    } else if (dataType === 'Monthly' || dataType === 'Yearly') {
      // Process data for Monthly or Yearly view
      data = processDataForPeriod(data, dataType, dateColumn);
    }

    res.json(data);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ 
      error: 'Query execution failed',
      details: err.message,
      hint: 'Check if the selected columns and join conditions are valid'
    });
  }
});

function processDataForPeriod(data, period, dateColumn) {
  // Extract the actual column name from dateColumn (remove table prefix if present)
  const dateColumnName = dateColumn.split('.').pop();

  // Group data by period (month or year)
  const groupedData = data.reduce((acc, row) => {
    const date = new Date(row[dateColumnName]);
    const key = period === 'Monthly' 
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      : `${date.getFullYear()}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {});

  // Calculate highest, lowest, and average for each period
  return Object.entries(groupedData).map(([periodKey, periodData]) => {
    const numericColumns = Object.keys(periodData[0]).filter(key => 
      typeof periodData[0][key] === 'number' && key !== dateColumnName
    );
    
    const stats = numericColumns.reduce((acc, column) => {
      const values = periodData.map(row => row[column]).filter(val => !isNaN(val));
      if (values.length > 0) {
        acc[column] = {
          highest: Math.max(...values),
          lowest: Math.min(...values),
          average: values.reduce((sum, val) => sum + val, 0) / values.length
        };
      } else {
        acc[column] = { highest: null, lowest: null, average: null };
      }
      return acc;
    }, {});

    return {
      period: periodKey,
      ...stats
    };
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

