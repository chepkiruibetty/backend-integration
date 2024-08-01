const express = require('express');
const app = express();

app.get('/transactions', (req, res) => {
  res.status(200).json([]);
});

module.exports = app;
