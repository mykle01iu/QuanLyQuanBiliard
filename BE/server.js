const http = require('http');
const app = require('./app');
const { connectDB, sequelize } = require('./config/database');
const initSocket = require('./socket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  
  // Sync database models (Be careful in production, usually we use migrations)
  // { alter: true } will update schema without deleting data
  await sequelize.sync({ alter: true }).then(() => {
     console.log('Database synced');
  }).catch((err) => {
     console.error('Failed to sync database: ' + err.message);
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
