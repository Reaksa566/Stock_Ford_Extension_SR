// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser
app.use(cors());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const accessoryRoutes = require('./routes/accessoryRoutes');
const toolRoutes = require('./routes/toolRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/reports', reportRoutes);

// --------------------------------------------------------------------------------
// PRODUCTION DEPLOYMENT SETUP (For Render)
// --------------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  // Set static folder (after building client)
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'))
  );
}
// --------------------------------------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));