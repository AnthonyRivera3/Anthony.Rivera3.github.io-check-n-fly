// server.js
require('dotenv').config({ path: './API.env' });  // Load API.env file
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Use the port from .env or default to 3000

// Middleware setup
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve frontend files

// Connect to SQLite3 database (file-based)
const db = new sqlite3.Database('./flightsDB.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to SQLite3:', err.message);
  } else {
    console.log('Connected to SQLite3 database.');
  }
});

// Create the flight_offers table if it doesn't exist
db.run(
  `CREATE TABLE IF NOT EXISTS flight_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT,
    destination TEXT,
    departure_date TEXT,
    adults INTEGER,
    children INTEGER,
    price REAL
  )`,
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Table 'flight_offers' is ready.");
    }
  }
);

// Route to add a new flight offer
app.post('/add-flight', (req, res) => {
  const { origin, destination, departure_date, adults, children, price } = req.body;

  const query = `
    INSERT INTO flight_offers (origin, destination, departure_date, adults, children, price)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [origin, destination, departure_date, adults, children, price], function (err) {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).send('Error adding flight data');
    }
    res.send('Flight data added successfully!');
  });
});

// Route to search for flights
app.post('/search-flights', (req, res) => {
  const { origin, destination, departure_date } = req.body;

  const query = `
    SELECT * FROM flight_offers
    WHERE origin = ? AND destination = ? AND departure_date = ?
  `;

  db.all(query, [origin, destination, departure_date], (err, rows) => {
    if (err) {
      console.error('Error querying flights:', err.message);
      return res.status(500).send('Error querying flights');
    }
    res.json(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
