const express = require('express');
require('dotenv').config();

const schoolRoutes = require('./routes/schools');

const app = express();
app.use(express.json());

app.get('/env-check', (req, res) => {
  res.json({
    dbHost: !!process.env.DB_HOST,
    dbUser: !!process.env.DB_USER,
    dbPass: !!process.env.DB_PASS,
    dbName: !!process.env.DB_NAME,
    dbPort: !!process.env.DB_PORT
  });
});

// Mount routes
app.use('/api', schoolRoutes);

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
