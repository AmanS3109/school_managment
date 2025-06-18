const express = require('express');
require('dotenv').config();

const schoolRoutes = require('./routes/schools');

const app = express();
app.use(express.json());

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
