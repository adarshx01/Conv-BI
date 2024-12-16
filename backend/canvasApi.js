const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:niG2AQkbMKh4@ep-crimson-fog-a5p5bw0i.us-east-2.aws.neon.tech/neondb?sslmode=require',
  connectionTimeoutMillis: 5000, // 5 seconds timeout
  retryDelay: 1000, // 1 second delay between retries
});

async function initDatabase() {
  let retries = 5;
  while (retries) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('Database initialized successfully');
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      await new Promise(res => setTimeout(res, 5000)); // Wait for 5 seconds before retrying
    }
  }
  throw new Error('Failed to initialize database after multiple attempts');
}

// API to save a report
app.post('/api/reports', async (req, res) => {
  const { name, data } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reports (name, data) VALUES ($1, $2) RETURNING id',
      [name, JSON.stringify(data)]
    );
    res.json({ id: result.rows[0].id, message: 'Report saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// API to get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM reports');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// API to get a specific report
app.get('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const report = result.rows[0];
      res.json({
        id: report.id,
        name: report.name,
        data: report.data, // This should already be a JSON object
        created_at: report.created_at
      });
    } else {
      res.status(404).json({ error: 'Report not found' });
    }
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

