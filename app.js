const express = require('express');
const app = express();
const likeRoutes = require('./routes/likeRoutes');

// Add routes
app.use('/api/likes', likeRoutes);

// ... existing code ...

module.exports = app; 