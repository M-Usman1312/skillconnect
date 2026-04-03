const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL database!');
});

// ── ROUTE 1: Get all services ──
app.get('/api/services', (req, res) => {
  const sql = 'SELECT * FROM services ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ── ROUTE 2: Post a new service ──
app.post('/api/services', (req, res) => {
  const { title, provider, category, location, description, contact, price } = req.body;

  if (!title || !provider || !category || !location || !description || !contact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO services (title, provider, category, location, description, contact, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [title, provider, category, location, description, contact, price || 'Negotiable'];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Service posted!', id: result.insertId });
  });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});