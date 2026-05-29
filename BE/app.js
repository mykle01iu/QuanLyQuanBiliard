const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
  res.send('Billiards API is running...');
});

// Import Routes
const routes = require('./routes');

// Mount Routes
app.use('/api', routes);

module.exports = app;
