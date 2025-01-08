require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { neon } = require('@neondatabase/serverless');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

const sql = neon(process.env.DATABASE_URL);

async function initDatabase() {
  let retries = 5;
  while (retries) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('Database initialized successfully');
      return;
    } catch (err) {
      console.error('Error initializing database:', err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      await new Promise(res => setTimeout(res, 5000)); //  5 sec -delay retrying
    }
  }
  throw new Error('Failed to initialize database after multiple attempts');
}


app.post('/api/reports', async (req, res) => {
  const { name, data } = req.body;
  try {
    const result = await sql`
      INSERT INTO reports (name, data)
      VALUES (${name}, ${JSON.stringify(data)})
      RETURNING id
    `;
    res.json({ id: result[0].id, message: 'Report saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});


app.get('/api/reports', async (req, res) => {
  try {
    const result = await sql`SELECT id, name FROM reports`;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});


app.get('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql`
      SELECT * FROM reports WHERE id = ${id}
    `;
    if (result.length > 0) {
      const report = result[0];
      res.json({
        id: report.id,
        name: report.name,
        data: report.data,
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