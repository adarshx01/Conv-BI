require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT;

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
      database: 'postgres', // Connect to default 'postgres' database to list all databases
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
  const { database, mainTable, joinTable, selectedColumns, joinType, joinCondition, dateColumn, startDate, endDate } = req.body;
  try {
    if (!pools[database]) {
      pools[database] = new Pool({
        ...dbConfig,
        database: database,
      });
    }

    // Construct column list
    const mainColumns = selectedColumns[mainTable].map(col => `"${mainTable}"."${col}"`);
    const joinColumns = selectedColumns[joinTable] ? selectedColumns[joinTable].map(col => `"${joinTable}"."${col}"`) : [];
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

    console.log('Executing query:', query);
    const result = await pools[database].query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ 
      error: 'Query execution failed',
      details: err.message,
      hint: 'Check if the selected columns and join conditions are valid'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

